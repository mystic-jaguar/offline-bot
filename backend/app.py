# Main Flask Application

from flask import Flask, request, jsonify
from functools import wraps
import jwt
from flask_cors import CORS
import json
import os
from datetime import datetime
from config import Config
from knowledge_manager_simple import KnowledgeBaseManager
from llm_integration import TinyLLaMAIntegration

# Initialize Flask app
app = Flask(__name__)
CORS(app)
config = Config()
config.init_app(app)

# Initialize components
knowledge_manager = KnowledgeBaseManager()
llm_integration = TinyLLaMAIntegration()

# Conversation history storage
conversation_history = {}
disabled_categories = set()
# New structured category settings: {category: {enabled: bool, message: str}}
category_settings = {}

# Category to department mapping for analytics
CATEGORY_TO_DEPT = {
    'fixed_qa': 'General',
    'benefits': 'HR',
    'code_of_conduct': 'HR',
    'leave_policy': 'HR',
    'hr_contacts': 'HR',
    'company_overview': 'General',
    'company_timings': 'HR',
    'it_support': 'IT',
    'it_tools': 'IT',
    'department_info': 'General',
    'departments': 'General',
    'company_policies': 'HR',
    'onboarding_training': 'HR'
}

# Simple in-memory admin user store (replace with DB in production)
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

def generate_token(username: str):
    payload = {
        'username': username,
        'role': 'admin'
    }
    return jwt.encode(payload, config.SECRET_KEY, algorithm='HS256')

def verify_token(token: str):
    try:
        data = jwt.decode(token, config.SECRET_KEY, algorithms=['HS256'])
        return data if data.get('role') == 'admin' else None
    except Exception:
        return None

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else None
        data = verify_token(token) if token else None
        if not data:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'knowledge_base_categories': knowledge_manager.get_all_categories(),
        'ollama_status': llm_integration.test_connection()
    })

# ---------------------- Admin Auth ----------------------

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json(silent=True) or {}
    username = data.get('username', '')
    password = data.get('password', '')
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        token = generate_token(username)
        return jsonify({'token': token})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/admin/logout', methods=['POST'])
@admin_required
def admin_logout():
    # For JWTs there is no server-side session to destroy; client drops token
    return jsonify({'success': True})

@app.route('/api/knowledge-base', methods=['GET'])
def get_knowledge_base():
    """Get all questions from knowledge base files"""
    try:
        knowledge_base_path = os.path.join(os.path.dirname(__file__), 'knowledge_base')
        questions_data = []
        
        # Map file names to departments
        department_mapping = {
            'fixed_qa.json': 'General',
            'benefits.json': 'HR',
            'code_of_conduct.json': 'HR',
            'leave_policy.json': 'HR',
            'hr_contacts.json': 'HR',
            'company_overview.json': 'General',
            'company_timings.json': 'HR',
            'it_support.json': 'IT',
            'it_tools.json': 'IT',
            'department_info.json': 'General',
            'departments.json': 'General',
            'company_policies.json': 'HR',
            'onboarding_training.json': 'HR'
        }
        
        # Read all JSON files in knowledge_base folder
        for filename in os.listdir(knowledge_base_path):
            if filename.endswith('.json'):
                file_path = os.path.join(knowledge_base_path, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                    department = department_mapping.get(filename, 'General')
                    
                    # Process each question in the file
                    for i, item in enumerate(data):
                        if isinstance(item, dict) and 'question' in item:
                            questions_data.append({
                                'id': f"{filename}_{i}",
                                'question': item['question'],
                                'answer': item.get('answer', ''),
                                'department': department,
                                'category': filename.replace('.json', '').replace('_', ' ').title(),
                                'timestamp': datetime.now().isoformat(),
                                'source_file': filename
                            })
                except Exception as e:
                    print(f"Error reading {filename}: {e}")
                    continue
        
        return jsonify({
            'success': True,
            'questions': questions_data,
            'total_count': len(questions_data)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        session_id = data.get('session_id', 'default')
        
        if not question:
            return jsonify({
                'error': 'No question provided'
            }), 400
        
        # Initialize session history if needed
        if session_id not in conversation_history:
            conversation_history[session_id] = []
        
        # Add question to history
        conversation_history[session_id].append({
            'type': 'user',
            'message': question,
            'timestamp': datetime.now().isoformat()
        })
        
        # Get context and answer
        context, match_type, matched_category = knowledge_manager.get_context_for_question(question)

        # Enforce disabled categories via settings
        settings = category_settings.get(matched_category)
        if settings and settings.get('enabled') is False:
            match_type = 'disabled_category'
            context = ''
        
        if match_type == "exact_match":
            # Use exact answer
            answer = context
            confidence = "high"
        elif match_type == "similarity_search":
            # Generate response using LLM with context
            answer = llm_integration.generate_response(question, context)
            if not answer:
                answer = "Sorry, I'm having trouble reaching the knowledge model right now. Please try again later or contact HR."
            confidence = "medium"
        elif match_type == 'disabled_category':
            # Use custom message if provided
            custom_message = (category_settings.get(matched_category) or {}).get('message')
            answer = custom_message or "This topic is temporarily disabled by the administrator. Please contact HR."
            confidence = "low"
        else:
            # No match found
            answer = "Sorry, I don't have this information. Please contact HR."
            confidence = "low"
        
        # Add response to history
        conversation_history[session_id].append({
            'type': 'assistant',
            'message': answer,
            'confidence': confidence,
            'match_type': match_type,
            'category': matched_category,
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'answer': answer,
            'confidence': confidence,
            'match_type': match_type,
            'category': matched_category,
            'session_id': session_id,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/history/<session_id>', methods=['GET'])
def get_history(session_id):
    """Get conversation history for a session"""
    if session_id in conversation_history:
        return jsonify({
            'session_id': session_id,
            'history': conversation_history[session_id]
        })
    else:
        return jsonify({
            'session_id': session_id,
            'history': []
        })

# ---------------------- Admin Endpoints ----------------------

@app.route('/api/admin/analytics', methods=['GET'])
@admin_required
def admin_analytics():
    total_questions = 0
    category_counts = {}
    department_counts = {}
    for history in conversation_history.values():
        for item in history:
            if item.get('type') == 'assistant':
                total_questions += 1
                cat = item.get('category') or 'general'
                category_counts[cat] = category_counts.get(cat, 0) + 1
                dept = CATEGORY_TO_DEPT.get(cat, 'General')
                department_counts[dept] = department_counts.get(dept, 0) + 1
    most_popular = None
    if category_counts:
        most_popular = max(category_counts.items(), key=lambda x: x[1])[0]
    return jsonify({
        'total_sessions': len(conversation_history),
        'total_questions': total_questions,
        'category_counts': category_counts,
        'department_counts': department_counts,
        'most_popular_category': most_popular
    })

@app.route('/api/admin/chats', methods=['GET'])
@admin_required
def admin_chats():
    return jsonify(conversation_history)

@app.route('/api/admin/chats/reset', methods=['POST'])
@admin_required
def admin_chats_reset():
    conversation_history.clear()
    return jsonify({'success': True})

@app.route('/api/admin/chats/<session_id>', methods=['DELETE'])
@admin_required
def admin_chat_delete(session_id):
    conversation_history.pop(session_id, None)
    return jsonify({'success': True})

@app.route('/api/admin/policies', methods=['GET', 'PUT'])
@admin_required
def admin_policies():
    file_path = os.path.join(os.path.dirname(__file__), 'knowledge_base', 'company_policies.json')
    if request.method == 'GET':
        with open(file_path, 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    data = request.get_json(silent=True) or []
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return jsonify({'success': True})

@app.route('/api/admin/company', methods=['GET', 'PUT'])
@admin_required
def admin_company():
    # Aggregate relevant files
    base_dir = os.path.join(os.path.dirname(__file__), 'knowledge_base')
    files = ['company_overview.json', 'company_timings.json', 'departments.json', 'hr_contacts.json']
    if request.method == 'GET':
        out = {}
        for fn in files:
            fp = os.path.join(base_dir, fn)
            if os.path.exists(fp):
                with open(fp, 'r', encoding='utf-8') as f:
                    out[fn] = json.load(f)
        return jsonify(out)
    # PUT expects map of filename -> content
    data = request.get_json(silent=True) or {}
    for fn, content in data.items():
        fp = os.path.join(base_dir, fn)
        with open(fp, 'w', encoding='utf-8') as f:
            json.dump(content, f, ensure_ascii=False, indent=2)
    return jsonify({'success': True})

@app.route('/api/admin/kb/categories', methods=['GET', 'POST'])
@admin_required
def admin_kb_categories():
    if request.method == 'GET':
        return jsonify({'categories': knowledge_manager.get_all_categories()})
    # POST expects {category, items}
    data = request.get_json(silent=True) or {}
    category = data.get('category')
    items = data.get('items', [])
    if not category:
        return jsonify({'error': 'category required'}), 400
    kb_dir = os.path.join(os.path.dirname(__file__), 'knowledge_base')
    fp = os.path.join(kb_dir, f"{category}.json")
    with open(fp, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    knowledge_manager.load_knowledge_base()
    return jsonify({'success': True})

@app.route('/api/admin/kb/items', methods=['POST'])
@admin_required
def admin_kb_add_item():
    data = request.get_json(silent=True) or {}
    category = data.get('category')
    item = data.get('item')
    if not category or not item:
        return jsonify({'error': 'category and item required'}), 400
    kb_dir = os.path.join(os.path.dirname(__file__), 'knowledge_base')
    fp = os.path.join(kb_dir, f"{category}.json")
    items = []
    if os.path.exists(fp):
        with open(fp, 'r', encoding='utf-8') as f:
            items = json.load(f)
    items.append(item)
    with open(fp, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    knowledge_manager.load_knowledge_base()
    return jsonify({'success': True})

@app.route('/api/admin/kb/category/<category>', methods=['GET', 'PUT'])
@admin_required
def admin_kb_category_items(category):
    kb_dir = os.path.join(os.path.dirname(__file__), 'knowledge_base')
    fp = os.path.join(kb_dir, f"{category}.json")
    if request.method == 'GET':
        if not os.path.exists(fp):
            return jsonify([])
        with open(fp, 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    # PUT replaces full list
    items = request.get_json(silent=True) or []
    with open(fp, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    knowledge_manager.load_knowledge_base()
    return jsonify({'success': True})

@app.route('/api/admin/kb/category/<category>/<int:index>', methods=['DELETE'])
@admin_required
def admin_kb_delete_item(category, index):
    kb_dir = os.path.join(os.path.dirname(__file__), 'knowledge_base')
    fp = os.path.join(kb_dir, f"{category}.json")
    if not os.path.exists(fp):
        return jsonify({'error': 'category not found'}), 404
    with open(fp, 'r', encoding='utf-8') as f:
        items = json.load(f)
    if index < 0 or index >= len(items):
        return jsonify({'error': 'index out of range'}), 400
    items.pop(index)
    with open(fp, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    knowledge_manager.load_knowledge_base()
    return jsonify({'success': True})

@app.route('/api/admin/kb/categories/disabled', methods=['GET', 'PUT'])
@admin_required
def admin_disabled_categories():
    global disabled_categories
    if request.method == 'GET':
        return jsonify({'disabled': list(disabled_categories)})
    data = request.get_json(silent=True) or {}
    categories = data.get('disabled', [])
    disabled_categories = set(categories)
    return jsonify({'success': True, 'disabled': list(disabled_categories)})

@app.route('/api/admin/kb/categories/settings', methods=['GET', 'PUT'])
@admin_required
def admin_category_settings():
    global category_settings
    if request.method == 'GET':
        # Return combined view. If not present, assume enabled True and empty message
        result = {}
        for cat in knowledge_manager.get_all_categories():
            cs = category_settings.get(cat, { 'enabled': True, 'message': '' })
            result[cat] = { 'enabled': bool(cs.get('enabled', True)), 'message': cs.get('message', '') }
        return jsonify(result)
    data = request.get_json(silent=True) or {}
    # Expect { category: {enabled: bool, message: str}, ... }
    new_settings = {}
    for cat, cs in data.items():
        new_settings[cat] = {
            'enabled': bool((cs or {}).get('enabled', True)),
            'message': (cs or {}).get('message', '')
        }
    category_settings = new_settings
    # Keep legacy disabled_categories in sync
    global disabled_categories
    disabled_categories = { cat for cat, cs in category_settings.items() if cs.get('enabled') is False }
    return jsonify({'success': True})

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all available knowledge base categories"""
    return jsonify({
        'categories': knowledge_manager.get_all_categories()
    })

@app.route('/api/category/<category_name>', methods=['GET'])
def get_category_info(category_name):
    """Get information about a specific category"""
    info = knowledge_manager.get_category_info(category_name)
    if info:
        return jsonify(info)
    else:
        return jsonify({
            'error': 'Category not found'
        }), 404

@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    """Get suggested questions for new employees"""
    suggestions = [
        "What is the leave policy?",
        "How do I contact HR?",
        "What are the company benefits?",
        "What time does work start?",
        "Who should I contact for IT issues?",
        "What is the dress code?",
        "How do I request time off?",
        "What is the probation period?",
        "How do I access company systems?",
        "What are the company values?"
    ]
    
    return jsonify({
        'suggestions': suggestions
    })

@app.route('/api/test', methods=['POST'])
def test_llm():
    """Test LLM integration"""
    data = request.get_json()
    test_question = data.get('question', 'Hello, are you working?')
    
    response = llm_integration.generate_response(test_question)
    
    return jsonify({
        'question': test_question,
        'response': response,
        'ollama_status': llm_integration.test_connection()
    })

if __name__ == '__main__':
    print("Starting Company Induction Chatbot Backend...")
    print(f"Knowledge Base Categories: {knowledge_manager.get_all_categories()}")
    print(f"Ollama Status: {llm_integration.test_connection()}")
    print("Server starting on http://localhost:5000")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=config.DEBUG
    )
