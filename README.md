# ThinkNest Solutions - Employee Induction Chatbot

A modern, responsive chatbot application designed for employee induction and onboarding at ThinkNest Solutions. Built with React.js frontend and Flask backend, featuring a ChatGPT-like interface with comprehensive knowledge base management.

## 🚀 Features

- **Modern UI**: ChatGPT-inspired interface with smooth animations and responsive design
- **Dark/Light Mode**: Toggle between themes with persistent settings
- **Voice Input**: Web Speech API integration for hands-free interaction
- **Knowledge Base**: Comprehensive company information organized by departments
- **Settings Management**: User preferences and data management
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Real-time Chat**: Instant responses with loading indicators

## 📁 Project Structure

```
induction-chatbot/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ChatInterface.js
│   │   │   ├── ChatInput.js
│   │   │   ├── ChatMessage.js
│   │   │   ├── ChatHistoryPanel.js
│   │   │   ├── SettingsModal.js
│   │   │   └── ThemeToggle.js
│   │   ├── contexts/        # React Context providers
│   │   │   ├── ChatContext.js
│   │   │   ├── ThemeContext.js
│   │   │   └── AnalyticsContext.js
│   │   ├── services/        # API services
│   │   │   └── apiService.js
│   │   ├── App.js           # Main application component
│   │   ├── index.js         # Application entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # Tailwind CSS configuration
├── backend/                 # Flask backend application
│   ├── knowledge_base/      # Company knowledge base (JSON files)
│   │   ├── fixed_qa.json
│   │   ├── benefits.json
│   │   ├── company_policies.json
│   │   ├── onboarding_training.json
│   │   └── ... (other department files)
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration settings
│   ├── knowledge_manager_simple.py  # Knowledge base manager
│   ├── llm_integration.py  # LLM integration
│   └── requirements.txt    # Python dependencies
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **npm** (comes with Node.js)

### Step 1: Clone/Download Project
```bash
# If using Git
git clone <repository-url>
cd induction-chatbot

# Or simply copy the project folder to your machine
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 3: Install Backend Dependencies
```bash
cd ../backend
pip install -r requirements.txt
```

## 🚀 Running the Application

### Terminal 1: Start Backend Server
```bash
cd backend
python app.py
```
Backend will run on: `http://localhost:5000`

### Terminal 2: Start Frontend Server
```bash
cd frontend
npm start
```
Frontend will run on: `http://localhost:3000`

### Access the Application
Open your browser and navigate to: `http://localhost:3000`

## 📚 Knowledge Base

The application includes comprehensive company information organized by departments:

- **HR Department**: Benefits, leave policies, code of conduct, onboarding
- **IT Department**: Support, tools, technical assistance
- **General**: Company overview, policies, department information

All knowledge base files are stored in `backend/knowledge_base/` as JSON files.

## 🎨 Customization

### Company Branding
To customize for your company:
1. Update company name in all files (search for "ThinkNest Solutions")
2. Modify colors in `frontend/tailwind.config.js`
3. Update knowledge base files in `backend/knowledge_base/`

### Adding New Knowledge
1. Create new JSON files in `backend/knowledge_base/`
2. Add department mapping in `backend/app.py`
3. Follow the existing JSON structure with `question` and `answer` fields

## 🔧 Configuration

### Backend Configuration
- Edit `backend/config.py` for server settings
- Modify `backend/app.py` for API endpoints
- Update `backend/requirements.txt` for dependencies

### Frontend Configuration
- Edit `frontend/src/config.js` for API endpoints
- Modify `frontend/tailwind.config.js` for styling
- Update `frontend/package.json` for dependencies

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full sidebar and expanded layout
- **Tablet**: Collapsible sidebar with touch-friendly interface
- **Mobile**: Compact layout with mobile-optimized navigation

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📦 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your web server
```

### Backend Deployment
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🔍 API Endpoints

- `GET /api/health` - Health check
- `GET /api/knowledge-base` - Get all knowledge base questions
- `POST /api/chat` - Send chat message and get response

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Frontend: Use different port
   npm start -- --port 3001
   
   # Backend: Change port in app.py
   ```

2. **Python Path Issues**
   ```bash
   # Windows
   python -m pip install -r requirements.txt
   
   # Mac/Linux
   python3 -m pip install -r requirements.txt
   ```

3. **Node.js Version Issues**
   ```bash
   # Check version
   node --version
   
   # Update if needed from https://nodejs.org/
   ```

## 📄 License

This project is proprietary software for ThinkNest Solutions.

## 👥 Support

For technical support or questions about the application, contact the development team.

---

**ThinkNest Solutions Employee Induction Assistant**  
*Streamlining employee onboarding with intelligent conversation*# Induction-Chatbot
