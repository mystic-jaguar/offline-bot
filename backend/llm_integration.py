# TinyLLaMA Integration

import requests
import json
import time
from typing import Optional, Dict, Any
from config import Config

class TinyLLaMAIntegration:
    def __init__(self):
        self.config = Config()
        self.base_url = self.config.OLLAMA_HOST
        self.model_name = self.config.MODEL_NAME
        self.session = requests.Session()
    
    def check_ollama_status(self) -> bool:
        """Check if Ollama server is running"""
        try:
            response = self.session.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False
    
    def generate_response(self, question: str, context: str = "") -> Optional[str]:
        """Generate response using TinyLLaMA"""
        if not self.check_ollama_status():
            print("Ollama server is not running")
            return None
        
        # Prepare the prompt
        if context:
            prompt = f"""You are a helpful HR assistant for new employees. Answer the question based on the provided context.

Context:
{context}

Question: {question}

Answer:"""
        else:
            prompt = f"""You are a helpful HR assistant for new employees. Answer this question briefly and professionally.

Question: {question}

Answer:"""
        
        # Prepare the request payload
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "max_tokens": self.config.MAX_RESPONSE_LENGTH
            }
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/generate",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', '').strip()
            else:
                print(f"Error generating response: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return None
    
    def generate_embedding(self, text: str) -> Optional[list]:
        """Generate embedding using TinyLLaMA (if supported)"""
        # Note: TinyLLaMA doesn't have built-in embedding support
        # We'll use sentence-transformers instead
        return None
    
    def test_connection(self) -> Dict[str, Any]:
        """Test the connection and model availability"""
        result = {
            "ollama_running": False,
            "model_available": False,
            "test_response": None
        }
        
        if not self.check_ollama_status():
            return result
        
        result["ollama_running"] = True
        
        # Check if model is available
        try:
            response = self.session.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                model_names = [model.get('name', '') for model in models]
                if self.model_name in model_names:
                    result["model_available"] = True
        except Exception as e:
            print(f"Error checking models: {e}")
        
        # Test response generation
        if result["model_available"]:
            test_response = self.generate_response("Hello, are you working?")
            result["test_response"] = test_response
        
        return result
