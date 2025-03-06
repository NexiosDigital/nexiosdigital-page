from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import OpenAI

# Configuração da aplicação
app = FastAPI(title="Nexios Digital API")

# Configuração do CORS - aceita requisições de qualquer origem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Obter chave API do ambiente
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID", None)

# Modelos para o chat
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str

# Rota de chat simples
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint simples de chat que usa a API OpenAI diretamente.
    """
    print(f"Recebendo mensagem: {request.message}")
    
    if not OPENAI_API_KEY:
        print("Erro: Chave API não configurada")
        return {"response": "O sistema de IA não está configurado. Por favor, contate o administrador."}
    
    try:
        # Criar cliente OpenAI
        if OPENAI_ORG_ID:
            client = OpenAI(api_key=OPENAI_API_KEY, organization=OPENAI_ORG_ID)
        else:
            client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Preparar mensagens para a API
        messages = []
        
        # Adicionar mensagem de sistema (contexto para a IA)
        messages.append({
            "role": "system", 
            "content": """
            Você é o assistente virtual da Nexios Digital, uma empresa de soluções de inteligência artificial.
            Forneça informações sobre nossos serviços:
            1. Agentes de IA para atendimento ao cliente
            2. Automação de vendas e processos
            3. Consultoria em implementação de IA
            
            Seja profissional, amigável e conciso nas suas respostas.
            """
        })
        
        # Adicionar histórico de conversa (se existir)
        for message in request.conversation_history:
            messages.append({
                "role": message.role,
                "content": message.content
            })
        
        # Adicionar a mensagem atual do usuário
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        print(f"Enviando {len(messages)} mensagens para OpenAI")
        
        # Fazer a chamada para a API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Modelo mais econômico e rápido
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        
        # Extrair resposta
        ai_response = response.choices[0].message.content
        print(f"Resposta recebida: {ai_response[:50]}...")
        
        return {"response": ai_response}
    
    except Exception as e:
        print(f"Erro ao processar mensagem: {str(e)}")
        return {"response": f"Desculpe, houve um erro ao processar sua mensagem. Detalhes: {str(e)}"}

# Rota para verificar status da API
@app.get("/api/status")
async def get_status():
    """
    Verifica e retorna o status do servidor e da conexão com a API OpenAI.
    """
    status_info = {
        "server": "online",
        "openai_api_key_configured": bool(OPENAI_API_KEY)
    }
    
    # Testar conexão com a API OpenAI se a chave estiver configurada
    if OPENAI_API_KEY:
        try:
            if OPENAI_ORG_ID:
                client = OpenAI(api_key=OPENAI_API_KEY, organization=OPENAI_ORG_ID)
            else:
                client = OpenAI(api_key=OPENAI_API_KEY)
                
            models = client.models.list()
            status_info["openai_connection"] = "successful"
            status_info["available_models"] = [model.id for model in models.data[:3]]
        except Exception as e:
            status_info["openai_connection"] = "failed"
            status_info["error"] = str(e)
    
    return status_info

# Rota simples para verificar se o servidor está online
@app.get("/")
async def root():
    return {"message": "Nexios Digital API está online"}

# Iniciar o servidor
if __name__ == "__main__":
    import uvicorn
    print("Iniciando servidor Nexios Digital...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)