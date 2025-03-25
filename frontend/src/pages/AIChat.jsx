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
        const clientId = getClientId();
        const config = getEnvConfig();
        let wsConnection = null;
        let reconnectTimeout = null;
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 5;
        
        const connectWebSocket = () => {
            // Limpar qualquer timeout pendente
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            
            // Determine o protocolo correto (wss para https, ws para http)
            const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            
            // Trate a conversão da URL corretamente
            let wsUrl = config.apiUrl.replace(/^https?:\/\//, "");
            
            // Se estamos em desenvolvimento, ajustar a porta 3000 para 8000
            if (wsUrl.includes(":3000")) {
                wsUrl = wsUrl.replace(":3000", ":8000");
            }
            
            // Construa o endpoint WebSocket
            const wsEndpoint = `${wsProtocol}//${wsUrl}/ws/${clientId}`;
            
            console.log("Tentando conectar ao WebSocket:", wsEndpoint);
            setConnectionStatus("connecting");
            
            // Fechar conexão anterior se existir
            if (wsConnection) {
                wsConnection.close();
            }
            
            // Criar nova conexão
            wsConnection = new WebSocket(wsEndpoint);
            
            wsConnection.onopen = () => {
                console.log("WebSocket conectado com sucesso!");
                setConnectionStatus("connected");
                setSocket(wsConnection);
                reconnectAttempts = 0; // Reset counter on successful connection
            };
            
            wsConnection.onmessage = (event) => {
                console.log("Mensagem WebSocket recebida:", event.data);
                try {
                    const data = JSON.parse(event.data);
                    
                    // Ignore ping messages
                    if (data.type === "ping") return;
                    
                    console.log("Dados WebSocket parseados:", data);
                    
                    // Verificar se é uma resposta de assistente
                    if (data.type === "assistant_response") {
                        console.log("Recebida resposta do assistente:", data);
                        // Se tiver conversation_id, verificar se corresponde à conversa atual
                        if (data.conversation_id && data.conversation_id === conversationId) {
                            console.log("Adicionando mensagem à conversa atual");
                            const assistantMessage = {
                                role: "assistant",
                                content: data.content,
                            };
                            setMessages((prev) => [...prev, assistantMessage]);
                            setIsTyping(false);
                        }
                        // Se não tiver conversation_id ou se for uma transmissão geral
                        else if (!data.conversation_id || data.type === "broadcast_message") {
                            console.log("Mensagem de broadcast recebida");
                            // Verificar se é uma resposta para a última mensagem enviada
                            if (data.original_message === lastSentMessage) {
                                console.log("Corresponde à última mensagem enviada");
                                const assistantMessage = {
                                    role: "assistant",
                                    content: data.content,
                                };
                                setMessages((prev) => [...prev, assistantMessage]);
                                setIsTyping(false);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Erro ao processar mensagem WebSocket:", error);
                }
            };
            
            wsConnection.onclose = (event) => {
                console.log("WebSocket desconectado:", event);
                setConnectionStatus("disconnected");
                setSocket(null);
                
                // Tentar reconectar com delay exponencial, até máximo de tentativas
                if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // max 30 seconds
                    console.log(`Tentando reconectar em ${delay/1000} segundos...`);
                    reconnectAttempts++;
                    reconnectTimeout = setTimeout(connectWebSocket, delay);
                } else {
                    console.log("Número máximo de tentativas de reconexão atingido");
                }
            };
            
            wsConnection.onerror = (error) => {
                console.error("Erro no WebSocket:", error);
                setConnectionStatus("error");
            };
        };
        
        // Iniciar conexão
        connectWebSocket();
        
        // Função de ping para manter conexão ativa
        const pingInterval = setInterval(() => {
            if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
                console.log("Enviando ping para manter conexão WebSocket");
                wsConnection.send(JSON.stringify({ type: "ping" }));
            }
        }, 30000); // ping a cada 30 segundos
        
        // Limpar conexão quando o componente desmontar
        return () => {
            clearInterval(pingInterval);
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            if (wsConnection) {
                console.log("Fechando conexão WebSocket");
                wsConnection.close();
            }
        };
    }, [conversationId, lastSentMessage]);

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
			console.log("Resposta completa do sendMessage:", response);

			// Se WebSocket não estiver conectado, mostrar a resposta direta
			if (connectionStatus !== "connected") {
				console.log("WebSocket não conectado - usando resposta direta");
				const assistantMessage = {
					role: "assistant",
					content: response.response,
				};
				setMessages((prev) => [...prev, assistantMessage]);
				setIsTyping(false);
			} else {
				console.log("Aguardando resposta via WebSocket...");
				// Manter isTyping = true até que a resposta via WebSocket chegue

				// Adicione um timeout de segurança para garantir que a UI não fique presa
				// esperando resposta do WebSocket que não chegue
				setTimeout(() => {
					if (isTyping) {
						console.log("Timeout do WebSocket - usando resposta direta");
						const assistantMessage = {
							role: "assistant",
							content: response.response,
						};
						setMessages((prev) => [...prev, assistantMessage]);
						setIsTyping(false);
					}
				}, 10000); // 10 segundos de timeout
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
								<i className="fas fa-circle"></i> Desconectado
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
