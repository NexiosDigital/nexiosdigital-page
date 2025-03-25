import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/AIChat.css";

const AIChat = () => {
	// Estados
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content:
				"Olá! Sou o assistente virtual da Nexios Digital. Como posso ajudar você hoje?",
		},
	]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [conversationId, setConversationId] = useState(null);
	const [lastSentMessage, setLastSentMessage] = useState("");
	const [socket, setSocket] = useState(null);
	const [connectionStatus, setConnectionStatus] = useState("disconnected");

	// Referências
	const messagesEndRef = useRef(null);
	const chatMessagesRef = useRef(null);
	const chatInputRef = useRef(null);

	// Obter configurações do ambiente
	const getEnvConfig = () => {
		return {
			apiUrl: process.env.REACT_APP_API_URL || window.location.origin,
			n8nWebhookUrl: process.env.REACT_APP_N8N_WEBHOOK_URL || null
		};
	};

	// Geração de ID de cliente para WebSocket
	const getClientId = () => {
		let clientId = localStorage.getItem("nexios_client_id");
		if (!clientId) {
			clientId = `client_${Math.random().toString(36).substring(2, 15)}`;
			localStorage.setItem("nexios_client_id", clientId);
		}
		return clientId;
	};

	// Conectar ao WebSocket quando o componente montar
    useEffect(() => {
        // Para testes iniciais, vamos desativar a funcionalidade WebSocket
        // e usar apenas a resposta direta da API
        setConnectionStatus("disconnected");
        
        // Função para teste de conexão WebSocket
        const testWebSocket = () => {
            const clientId = getClientId();
            const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const wsEndpoint = `${wsProtocol}//${window.location.host}/ws/${clientId}`;
            
            console.log("Testando conexão WebSocket:", wsEndpoint);
            
            try {
                const testWs = new WebSocket(wsEndpoint);
                
                testWs.onopen = () => {
                    console.log("Teste de WebSocket - Conexão estabelecida!");
                    testWs.close();
                };
                
                testWs.onerror = (error) => {
                    console.error("Teste de WebSocket - Erro na conexão:", error);
                };
                
                setTimeout(() => {
                    if (testWs.readyState !== WebSocket.OPEN) {
                        console.log("Teste de WebSocket - Timeout ao conectar");
                        testWs.close();
                    }
                }, 5000);
            } catch (error) {
                console.error("Erro ao criar objeto WebSocket:", error);
            }
        };
        
        // Execute o teste uma vez
        testWebSocket();
        
        return () => {
            // Cleanup
        };
    }, []);

	// Efeito para ajustar o scroll quando as mensagens mudam
	useEffect(() => {
		// Em vez de rolar para a parte inferior, mantenha a posição de scroll
		// mas garanta que a última mensagem esteja visível
		if (chatMessagesRef.current) {
			chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
		}
	}, [messages]);

	// Enviar mensagem para o backend
	const sendMessage = async (messageText, msgConversationHistory) => {
		const config = getEnvConfig();
		const backendUrl = config.apiUrl.replace(":3000", ":8000");
		// Endpoint para chat com N8N
		const endpoint = "/api/chat-n8n";

		console.log(`Enviando mensagem para ${backendUrl}${endpoint}:`, {
			message: messageText,
			conversation_history: msgConversationHistory,
			conversation_id: conversationId,
		});

		try {
			const response = await axios.post(`${backendUrl}${endpoint}`, {
				message: messageText,
				conversation_history: msgConversationHistory,
				conversation_id: conversationId,
			});

			console.log("Resposta recebida:", response.data);

			// Se houver um ID de conversa na resposta, armazene-o
			if (response.data.conversation_id) {
				setConversationId(response.data.conversation_id);
			}

			return response.data;
		} catch (error) {
			console.error(`Erro ao enviar mensagem para ${endpoint}:`, error);
			throw error;
		}
	};

	// Manipulador para envio de mensagens
	const handleSendMessage = async () => {
        if (input.trim() === "" || isTyping) return;

        const userMessage = {
            role: "user",
            content: input,
        };

        // Armazenar a mensagem que está sendo enviada
        setLastSentMessage(input);

        // Atualizar UI com a mensagem do usuário
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
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

            // Enviar a mensagem para o backend
            const response = await sendMessage(currentInput, conversationHistory);
            console.log("Resposta recebida:", response);

            // Usar sempre a resposta direta da API até resolvermos os problemas de WebSocket
            const assistantMessage = {
                role: "assistant",
                content: response.response,
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsTyping(false);
            
            // Salvar o ID da conversa se fornecido
            if (response.conversation_id) {
                setConversationId(response.conversation_id);
            }
        } catch (error) {
            console.error("Erro ao processar mensagem:", error);

            // Mostrar mensagem de erro
            const errorMessage = {
                role: "assistant",
                content:
                    "Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente mais tarde ou entre em contato com nosso suporte.",
            };

            setMessages((prev) => [...prev, errorMessage]);
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

	// Renderização do chat
	return (
		<div className="ai-chat-page">
			<div className="container">
				<div className="chat-header">
					<h1>Assistente Nexios Digital</h1>
					<p>
						Interaja com nossa IA e descubra como podemos ajudar a transformar
						seu negócio.
					</p>
					{/* Indicador de status do WebSocket */}
					<div className={`websocket-status ${connectionStatus}`}>
						{connectionStatus === "connected" ? (
							<>
								<i className="fas fa-check-circle"></i> Conectado
							</>
						) : connectionStatus === "error" ? (
							<>
								<i className="fas fa-exclamation-circle"></i> Erro de conexão
							</>
						) : connectionStatus === "connecting" ? (
							<>
								<i className="fas fa-sync fa-spin"></i> Conectando...
							</>
						) : (
							<>
								<i className="fas fa-circle"></i> Modo Offline
							</>
						)}
					</div>
				</div>

				<div className="chat-container">
					<div className="chat-messages" ref={chatMessagesRef}>
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

						<div ref={messagesEndRef}></div>
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
						<a
							href="https://wa.me/5522974033384"
							className="btn btn-primary"
							target="_blank"
							rel="noopener noreferrer"
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
