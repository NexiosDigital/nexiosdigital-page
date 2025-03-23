import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import chatService from "../services/chatService";
import "../styles/AIChat.css";

const AIChat = () => {
  // Estados
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [apiStatus, setApiStatus] = useState({
    checked: false,
    online: false,
    message: "",
  });
  
  // Referências
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  
  // Efeito inicial para verificar status da API e inicializar chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const status = await chatService.checkStatus();
        
        if (status.server === "online" && status.openai_connection === "successful") {
          setApiStatus({
            checked: true,
            online: true,
            message: "API conectada com sucesso",
          });
          
          // Inicializar mensagem de boas-vindas
          setMessages([
            {
              role: "assistant",
              content: "Olá! Sou o assistente virtual da Nexios Digital. Como posso ajudar você hoje?"
            }
          ]);
        } else {
          setApiStatus({
            checked: true,
            online: false,
            message: "API indisponível no momento",
          });
        }
      } catch (error) {
        setApiStatus({
          checked: true,
          online: false,
          message: "Não foi possível conectar à API",
        });
      }
    };

    initializeChat();
  }, []);
  
  // Efeito para rolar para a última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Função para rolar para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Manipulador para envio de mensagens
  const handleSendMessage = async () => {
    if (input.trim() === "" || isTyping) return;
    
    const userMessage = {
      role: "user",
      content: input,
    };
    
    // Atualizar UI com a mensagem do usuário
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Foco no input
    chatInputRef.current?.focus();
    
    try {
      // Preparar o histórico de conversas
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Enviar mensagem para API avançada se tiver ID da conversa
      let response;
      if (conversationId) {
        response = await chatService.sendAdvancedMessage(
          input,
          conversationId,
          conversationHistory
        );
        
        // Atualizar ID da conversa se fornecido na resposta
        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }
      } else {
        // Usar API simples para primeira interação
        response = await chatService.sendMessage(input, conversationHistory);
      }
      
      // Adicionar resposta ao chat
      const assistantMessage = {
        role: "assistant",
        content: response.response,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      
      // Mostrar mensagem de erro
      const errorMessage = {
        role: "assistant",
        content:
          "Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente.",
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Manipulador para tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Renderização condicional com base no status da API
  if (!apiStatus.checked) {
    return (
      <div className="ai-chat-page">
        <div className="container">
          <div className="chat-header">
            <h1>Assistente Nexios Digital</h1>
            <p>Verificando conexão com o sistema...</p>
          </div>
          <div className="chat-loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!apiStatus.online) {
    return (
      <div className="ai-chat-page">
        <div className="container">
          <div className="chat-header">
            <h1>Assistente Nexios Digital</h1>
            <p>
              Interaja com nossa IA e descubra como podemos ajudar a transformar
              seu negócio.
            </p>
          </div>

          <div className="implementation-notice">
            <div className="notice-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="notice-content">
              <h2>Sistema temporariamente indisponível</h2>
              <p>
                Nosso assistente de IA está passando por manutenção no momento.
                Por favor, tente novamente mais tarde ou entre em contato conosco
                diretamente pelo WhatsApp para obter assistência imediata.
              </p>
              <div className="notice-actions">
                
                  href="https://wa.me/5522974033384"
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-whatsapp"></i> Contato via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Renderização do chat quando a API está online
  return (
    <div className="ai-chat-page">
      <div className="container">
        <div className="chat-header">
          <h1>Assistente Nexios Digital</h1>
          <p>
            Interaja com nossa IA e descubra como podemos ajudar a transformar
            seu negócio.
          </p>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message message-${message.role}`}>
                {message.content}
              </div>
            ))}
            
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <textarea
              ref={chatInputRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              disabled={isTyping}
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={isTyping || input.trim() === ""}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>

        <div className="chat-footer">
          <p>
            Este assistente virtual utiliza IA para fornecer informações sobre
            nossos serviços. Para informações mais detalhadas ou personalizadas,
            entre em contato com nossa equipe.
          </p>
          <div className="chat-actions">
            <Link to="/" className="btn btn-secondary">
              <i className="fas fa-home"></i> Voltar para Home
            </Link>
            
              href="#contact"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <i className="fas fa-paper-plane"></i> Falar com um Especialista
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;