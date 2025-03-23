from openai import OpenAI
from typing import List, Dict, Any, Optional
import os
import logging

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        org_id = os.getenv("OPENAI_ORG_ID", None)
        
        if not api_key:
            logger.warning("OpenAI API key not configured")
        
        self.client = OpenAI(api_key=api_key, organization=org_id) if api_key else None
        
        # Sistema de contexto padrão para o assistente
        self.default_system_context = """
        Você é o assistente virtual da Nexios Digital, uma empresa de soluções de inteligência artificial.
        Forneça informações sobre nossos serviços:
        1. Agentes de IA para atendimento ao cliente
        2. Automação de vendas e processos
        3. Consultoria em implementação de IA
        4. Automação com ClickUp
        
        Seja profissional, amigável e conciso nas suas respostas. Se você não souber a resposta para alguma 
        pergunta específica, ofereça para encaminhar a consulta para um especialista humano.
        """
    
    def get_completion(self, 
                      messages: List[Dict[str, str]], 
                      model: str = "gpt-3.5-turbo",
                      temperature: float = 0.7,
                      max_tokens: int = 800,
                      custom_system_message: Optional[str] = None) -> str:
        """
        Obtém uma resposta do modelo OpenAI com base em uma lista de mensagens.
        """
        if not self.client:
            return "O sistema de IA não está configurado. Por favor, contate o administrador."
        
        try:
            # Adicionar mensagem de sistema para contexto
            system_message = custom_system_message or self.default_system_context
            
            # Garantir que a mensagem do sistema esteja no início
            if messages and messages[0].get("role") != "system":
                messages = [{"role": "system", "content": system_message}] + messages
            
            logger.info(f"Sending {len(messages)} messages to OpenAI")
            
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            ai_response = response.choices[0].message.content
            logger.info(f"Response received: {ai_response[:50]}...")
            
            return ai_response
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return f"Desculpe, houve um erro ao processar sua mensagem. Detalhes: {str(e)}"