# Backend Configuration

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # TinyLLaMA Configuration
    OLLAMA_HOST = os.environ.get('OLLAMA_HOST', 'http://localhost:11434')
    MODEL_NAME = os.environ.get('MODEL_NAME', 'tinyllama')
    
    # Knowledge Base Configuration
    KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), 'knowledge_base')
    CACHE_PATH = os.path.join(os.path.dirname(__file__), 'cache')
    
    # Embedding Configuration
    EMBEDDING_MODEL = 'all-MiniLM-L6-v2'
    SIMILARITY_THRESHOLD = 0.7
    MAX_CONTEXT_LENGTH = 1000
    
    # Response Configuration
    MAX_RESPONSE_LENGTH = 500
    CACHE_TTL = 3600  # 1 hour in seconds
    
    @staticmethod
    def init_app(app):
        # Create necessary directories
        os.makedirs(Config.KNOWLEDGE_BASE_PATH, exist_ok=True)
        os.makedirs(Config.CACHE_PATH, exist_ok=True)
