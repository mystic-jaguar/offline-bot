# Simplified Knowledge Base Manager (without sentence-transformers)

import json
import os
from typing import Dict, List, Tuple, Optional
from difflib import SequenceMatcher
import re
from config import Config

class KnowledgeBaseManager:
    def __init__(self):
        self.config = Config()
        self.knowledge_base = {}
        self.fixed_qa = {}
        self.load_knowledge_base()
        self.load_fixed_qa()
    
    def load_knowledge_base(self):
        """Load all knowledge base files"""
        kb_path = self.config.KNOWLEDGE_BASE_PATH
        
        for filename in os.listdir(kb_path):
            if filename.endswith('.json'):
                filepath = os.path.join(kb_path, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    category = filename.replace('.json', '')
                    self.knowledge_base[category] = data
                    print(f"Loaded knowledge base: {category}")
    
    def load_fixed_qa(self):
        """Load fixed Q&A pairs for common questions"""
        fixed_qa_file = os.path.join(self.config.KNOWLEDGE_BASE_PATH, 'fixed_qa.json')
        
        if os.path.exists(fixed_qa_file):
            with open(fixed_qa_file, 'r', encoding='utf-8') as f:
                self.fixed_qa = json.load(f)
                print(f"Loaded {len(self.fixed_qa)} fixed Q&A pairs")
        else:
            print("No fixed Q&A file found")
    
    def normalize_text(self, text: str) -> str:
        """Simple text normalization"""
        return re.sub(r'[^a-zA-Z0-9\s]', '', text.lower()).strip()
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        return SequenceMatcher(None, text1, text2).ratio()
    
    def find_exact_match(self, question: str) -> Optional[str]:
        """Find exact match in fixed Q&A"""
        question_lower = self.normalize_text(question)
        
        for qa_pair in self.fixed_qa:
            if self.normalize_text(qa_pair['question']) == question_lower:
                return qa_pair['answer']
        
        return None
    
    def find_similar_content(self, question: str, top_k: int = 3) -> List[Dict]:
        """Find similar content using simple text matching"""
        question_normalized = self.normalize_text(question)
        question_words = question_normalized.split()
        
        results = []
        
        # Search through all knowledge base content
        for category, data in self.knowledge_base.items():
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict):
                        question_text = self.normalize_text(item.get('question', ''))
                        answer_text = self.normalize_text(item.get('answer', ''))
                        
                        # Calculate similarity
                        similarity = self.calculate_similarity(question_normalized, question_text)
                        
                        # Also check for keyword matches
                        keyword_matches = sum(1 for word in question_words if word in question_text or word in answer_text)
                        keyword_score = keyword_matches / len(question_words) if question_words else 0
                        
                        # Combined score
                        combined_score = (similarity + keyword_score) / 2
                        
                        if combined_score >= self.config.SIMILARITY_THRESHOLD:
                            results.append({
                                'similarity': combined_score,
                                'category': category,
                                'question': item.get('question', ''),
                                'answer': item.get('answer', ''),
                                'context': f"{item.get('question', '')} {item.get('answer', '')}"
                            })
        
        # Sort by similarity and return top results
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def get_context_for_question(self, question: str) -> Tuple[str, str, str]:
        """Get context and answer for a question"""
        # First try exact match
        exact_answer = self.find_exact_match(question)
        if exact_answer:
            return exact_answer, "exact_match", "general"
        
        # Then try similarity search
        similar_items = self.find_similar_content(question)
        if similar_items:
            # Combine top results as context
            context_parts = []
            for item in similar_items[:2]:  # Use top 2 results
                context_parts.append(f"Q: {item['question']}\nA: {item['answer']}")
            
            context = "\n\n".join(context_parts)
            return context, "similarity_search", similar_items[0]['category']
        
        return "", "no_match", "general"
    
    def get_all_categories(self) -> List[str]:
        """Get all available knowledge base categories"""
        return list(self.knowledge_base.keys())
    
    def get_category_info(self, category: str) -> Dict:
        """Get information about a specific category"""
        if category in self.knowledge_base:
            return {
                'category': category,
                'count': len(self.knowledge_base[category]),
                'items': self.knowledge_base[category]
            }
        return {}
