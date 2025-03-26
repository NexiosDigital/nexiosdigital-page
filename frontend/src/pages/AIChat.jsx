import React, { useState, useEffect, useRef, useCallback } from "react";
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
	const [clientId, setClientId] = useState(
		() => localStorage.getItem("nexios_client_id") || `client-${Date.now()}`
	);
	const [lastMessageTime, setLastMessageTime] = useState(
		new Date().toISOString()
	);
	const [connectionStatus, setConnectionStatus] = useState("offline");
	const [apiError, setApiError] = useState(null);
	const [socket, setSocket] = useState(null);
	const [reconnectAttempts, setReconnectAttempts] = useState(0);
	const maxReconnectAttempts = 5;
	const reconnectInterval = 3000;

	// Referências
	const messagesEndRef = useRef(null);
	const chatMessagesRef = useRef(null);
	const chatInputRef = useRef(null);
	const socketRef = useRef(null);
	const wsTimeoutRef = useRef(null);
	const pollingIntervalRef = useRef(null);

	// URL base da API
	const API_URL = process.env.REACT_APP_API_URL || "https://nexiosdigital.com";

	// Salvar clientId em localStorage para persistência
	useEffect(() => {
		localStorage.setItem("nexios_client_id", clientId);
	}, [clientId]);

	// Efeito para ajustar o scroll quando as mensagens mudam
	useEffect(() => {
		if (chatMessagesRef.current) {
			chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
		}
	}, [messages]);

	// Associar o clientId ao conversationId
	const associateClientToConversation = useCallback(
		async (cid, convId) => {
			if (!cid || !convId) return;

			console.log(`Associando cliente ${cid} à conversa ${convId}`);

			try {
				// Método 1: Enviar via WebSocket (se conectado)
				if (
					socketRef.current &&
					socketRef.current.readyState === WebSocket.OPEN
				) {
					socketRef.current.send(
						JSON.stringify({
							conversation_id: convId,
						})
					);
					console.log("Associação enviada via WebSocket");
				}

				// Método 2: Enviar via HTTP (mais confiável)
				const response = await axios.post(`${API_URL}/api/associate-client`, {
					client_id: cid,
					conversation_id: convId,
				});

				console.log("Associação via HTTP:", response.data);

				if (response.data.success) {
					console.log("Cliente associado à conversa com sucesso via HTTP");
				}
			} catch (error) {
				console.error("Erro ao associar cliente à conversa:", error);
			}
		},
		[API_URL]
	);

	// Verificar por novas mensagens via polling (backup para WebSocket)
	const fetchNewMessages = useCallback(async () => {
		if (!conversationId) return;

		try {
			const response = await axios.get(
				`${API_URL}/api/messages/${conversationId}?since=${encodeURIComponent(
					lastMessageTime
				)}`,
				{
					headers: { "Content-Type": "application/json" },
				}
			);

			const newMessages = response.data.messages || [];

			if (newMessages.length > 0) {
				console.log(
					`Recebidas ${newMessages.length} novas mensagens via HTTP polling`
				);

				// Adicionar apenas mensagens não duplicadas
				const messageIds = messages.map((m) => `${m.role}-${m.content}`);

				newMessages.forEach((msg) => {
					const msgId = `${msg.role}-${msg.content}`;
					if (!messageIds.includes(msgId)) {
						setMessages((prev) => [
							...prev,
							{
								role: msg.role,
								content: msg.content,
							},
						]);
					}
				});

				// Atualizar timestamp da última mensagem
				if (newMessages.length > 0) {
					const latestTimestamp = newMessages
						.map((m) => m.timestamp)
						.sort()
						.pop();
					setLastMessageTime(latestTimestamp);
				}

				setIsTyping(false);
			}
		} catch (error) {
			console.error("Erro ao buscar novas mensagens:", error);
		}
	}, [API_URL, conversationId, lastMessageTime, messages]);

	// Iniciar polling para mensagens (como fallback)
	useEffect(() => {
		if (conversationId) {
			// Limpar intervalo anterior se existir
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
			}

			// Definir novo intervalo de polling
			pollingIntervalRef.current = setInterval(fetchNewMessages, 5000);
		}

		return () => {
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
			}
		};
	}, [conversationId, fetchNewMessages]);

	// Configuração do WebSocket com reconexão melhorada
	const setupWebSocket = useCallback(() => {
		// Limpar qualquer timeout pendente
		if (wsTimeoutRef.current) {
			clearTimeout(wsTimeoutRef.current);
			wsTimeoutRef.current = null;
		}

		// Se já tiver excedido tentativas máximas, parar e usar apenas polling
		if (reconnectAttempts >= maxReconnectAttempts) {
			console.warn(
				`Excedeu ${maxReconnectAttempts} tentativas de reconexão WebSocket. Usando apenas HTTP polling.`
			);
			setConnectionStatus("offline");
			return;
		}

		// Converter a URL HTTP para WebSocket (ws:// ou wss://)
		const wsProtocol = API_URL.startsWith("https") ? "wss" : "ws";
		const wsBaseUrl = API_URL.replace(/^https?:\/\//, `${wsProtocol}://`);
		const wsUrl = `${wsBaseUrl}/ws/${clientId}`;

		console.log(
			`Tentativa ${
				reconnectAttempts + 1
			}/${maxReconnectAttempts} de conexão WebSocket:`,
			wsUrl
		);
		setConnectionStatus("connecting");

		// Criar nova conexão WebSocket
		const newSocket = new WebSocket(wsUrl);
		socketRef.current = newSocket;

		newSocket.onopen = () => {
			console.log("WebSocket conectado com sucesso!");
			setConnectionStatus("connected");
			setReconnectAttempts(0); // Resetar contador de tentativas ao conectar com sucesso

			// Se temos um ID de conversa, associar a este cliente
			if (conversationId) {
				associateClientToConversation(clientId, conversationId);
			}
		};

		newSocket.onmessage = (event) => {
			console.log("Mensagem recebida via WebSocket:", event.data);
			try {
				const data = JSON.parse(event.data);

				if (data.type === "message") {
					// Nova mensagem recebida do assistente via callback
					console.log(
						"Mensagem do assistente recebida via WebSocket:",
						data.content
					);

					const assistantMessage = {
						role: data.role || "assistant",
						content: data.content,
					};

					// Adicionar apenas se não for duplicada
					const messageExists = messages.some(
						(msg) =>
							msg.role === assistantMessage.role &&
							msg.content === assistantMessage.content
					);

					if (!messageExists) {
						setMessages((prev) => [...prev, assistantMessage]);
					}

					setIsTyping(false);

					// Atualizar timestamp da última mensagem
					if (data.timestamp) {
						setLastMessageTime(data.timestamp);
					}
				} else if (data.type === "connection_status") {
					console.log("Status da conexão WebSocket:", data.status);
					setConnectionStatus(
						data.status === "connected" ? "connected" : "offline"
					);
				} else if (data.type === "association_success") {
					console.log("Associação bem-sucedida:", data.message);
				}
			} catch (error) {
				console.error("Erro ao processar mensagem WebSocket:", error);
			}
		};

		newSocket.onclose = (event) => {
			console.log("WebSocket desconectado:", event.code, event.reason);
			setConnectionStatus((prev) => (prev === "error" ? "error" : "offline"));
			socketRef.current = null;

			// Tentar reconectar após um intervalo se não foi fechado intencionalmente
			if (event.code !== 1000) {
				setReconnectAttempts((prev) => prev + 1);
				console.log(
					`Tentando reconectar em ${
						reconnectInterval / 1000
					} segundos... (Tentativa ${reconnectAttempts + 1})`
				);

				wsTimeoutRef.current = setTimeout(() => {
					setupWebSocket();
				}, reconnectInterval);
			}
		};

		newSocket.onerror = (error) => {
			console.error("Erro no WebSocket:", error);
			setConnectionStatus("error");
		};

		setSocket(newSocket);
	}, [
		API_URL,
		clientId,
		conversationId,
		reconnectAttempts,
		associateClientToConversation,
		messages,
	]);

	// Verificar status da API e configurar WebSocket ao carregar
	useEffect(() => {
		const checkApiStatus = async () => {
			try {
				console.log("Verificando status da API...");
				const response = await axios.get(`${API_URL}/api/status`, {
					headers: {
						"Content-Type": "application/json",
					},
				});

				console.log("Resposta da verificação de status:", response.data);

				if (response.status === 200) {
					setApiError(null);

					// Iniciar WebSocket após confirmar que API está online
					setupWebSocket();
				}
			} catch (error) {
				console.error("Erro ao verificar status da API:", error);
				setConnectionStatus("error");
				setApiError(
					"Não foi possível conectar ao servidor da IA. Tente novamente mais tarde."
				);
			}
		};

		checkApiStatus();

		// Cleanup ao desmontar componente
		return () => {
			if (
				socketRef.current &&
				socketRef.current.readyState === WebSocket.OPEN
			) {
				socketRef.current.close(1000, "Componente desmontado");
			}

			if (wsTimeoutRef.current) {
				clearTimeout(wsTimeoutRef.current);
			}

			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
			}
		};
	}, [API_URL, setupWebSocket]);

	// Efeito para associar cliente à conversa quando o ID de conversa muda
	useEffect(() => {
		if (conversationId && clientId) {
			associateClientToConversation(clientId, conversationId);
		}
	}, [conversationId, clientId, associateClientToConversation]);

	// Enviar mensagem com tratamento de segurança aprimorado
	const sendMessage = async (messageText, msgConversationHistory) => {
		try {
			console.log(`Enviando mensagem para o backend...`);

			// Usar o endpoint chat-n8n que utiliza o webhook do N8N
			const apiUrl = `${API_URL}/api/chat-n8n`;

			console.log(`Enviando para API endpoint: ${apiUrl}`);

			const response = await axios.post(
				apiUrl,
				{
					message: messageText,
					conversation_history: msgConversationHistory.map((msg) => ({
						role: msg.role,
						content: msg.content,
					})),
					conversation_id: conversationId,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					withCredentials: false,
				}
			);

			console.log("Resposta do servidor:", response);

			if (response.data && (response.data.response || response.data.text)) {
				return {
					response: response.data.response || response.data.text,
					conversation_id: response.data.conversation_id || conversationId,
				};
			} else if (response.data && response.data.message) {
				// Caso o servidor retorne apenas a confirmação de início do workflow
				return {
					response: "Processando sua mensagem...",
					conversation_id: response.data.conversation_id || conversationId,
				};
			} else {
				console.warn("Formato de resposta inesperado:", response.data);
				return {
					response:
						"Desculpe, recebi uma resposta em formato inesperado do servidor.",
					conversation_id: conversationId,
				};
			}
		} catch (error) {
			console.error(`Erro ao enviar mensagem:`, error);
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

			// Salvar o ID da conversa se fornecido
			if (
				response.conversation_id &&
				response.conversation_id !== conversationId
			) {
				setConversationId(response.conversation_id);

				// Importante: associar o clientId ao novo conversationId
				associateClientToConversation(clientId, response.conversation_id);
			}

			// Se recebemos uma resposta direta (não assíncrona), mostramos
			// Caso contrário, a resposta real virá pelo WebSocket ou polling
			if (
				response.response &&
				response.response !== "Processando sua mensagem..."
			) {
				const assistantMessage = {
					role: "assistant",
					content: response.response,
				};
				setMessages((prev) => [...prev, assistantMessage]);
				setIsTyping(false);
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

	// Forçar reconexão do WebSocket
	const handleReconnect = () => {
		if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
			socketRef.current.close();
		}
		setReconnectAttempts(0);
		setupWebSocket();
	};

	return (
		<div className="ai-chat-page">
			<div className="container">
				<div className="chat-header">
					<h1>Assistente Nexios Digital</h1>
					<p>
						Interaja com nossa IA e descubra como podemos ajudar a transformar
						seu negócio.
					</p>

					{/* Indicador de status com botão de reconexão */}
					<div className="connection-status-container">
						<div className={`websocket-status ${connectionStatus}`}>
							<i className="fas fa-circle"></i>
							{connectionStatus === "connected"
								? "Conectado"
								: connectionStatus === "connecting"
								? "Conectando..."
								: connectionStatus === "error"
								? "Erro de Conexão"
								: "Modo Offline"}
						</div>

						{connectionStatus !== "connected" && (
							<button
								className="reconnect-button"
								onClick={handleReconnect}
								title="Tentar reconectar"
							>
								<i className="fas fa-sync-alt"></i>
							</button>
						)}

						{conversationId && (
							<div className="conversation-id-display">
								ID: {conversationId.substring(0, 8)}...
							</div>
						)}
					</div>
				</div>

				{apiError && (
					<div className="api-error-message">
						<i className="fas fa-exclamation-triangle"></i>
						<p>{apiError}</p>
					</div>
				)}

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
							disabled={isTyping || connectionStatus === "error"}
						/>
						<button
							className="chat-send-btn"
							onClick={handleSendMessage}
							disabled={
								isTyping || input.trim() === "" || connectionStatus === "error"
							}
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
