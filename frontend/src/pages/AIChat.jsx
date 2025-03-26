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
	const [connectionStatus, setConnectionStatus] = useState("offline");
	const [apiError, setApiError] = useState(null);
	const [socket, setSocket] = useState(null);

	// Referências
	const messagesEndRef = useRef(null);
	const chatMessagesRef = useRef(null);
	const chatInputRef = useRef(null);

	// URL base da API com HTTPS
	const API_URL = process.env.REACT_APP_API_URL || "https://nexiosdigital.com";

	// Efeito para ajustar o scroll quando as mensagens mudam
	useEffect(() => {
		if (chatMessagesRef.current) {
			chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
		}
	}, [messages]);

	// Função para verificar o status da API ao carregar o componente
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
					setConnectionStatus("connected");
					setApiError(null);
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
	}, [API_URL]);

	// Configuração do WebSocket
	useEffect(() => {
		// Estabelecer conexão WebSocket quando tivermos um ID de conversa
		const setupWebSocket = () => {
			// Converter a URL HTTP para WebSocket (ws:// ou wss://)
			const wsProtocol = API_URL.startsWith("https") ? "wss" : "ws";
			const wsBaseUrl = API_URL.replace(/^https?:\/\//, `${wsProtocol}://`);
			const wsUrl = `${wsBaseUrl}/ws/${conversationId || "new-user"}`;

			console.log("Conectando ao WebSocket:", wsUrl);

			// Criar nova conexão WebSocket
			const newSocket = new WebSocket(wsUrl);

			newSocket.onopen = () => {
				console.log("WebSocket conectado!");
				setConnectionStatus("connected");
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
							role: "assistant",
							content: data.content,
						};

						setMessages((prev) => [...prev, assistantMessage]);
						setIsTyping(false);
					} else if (data.type === "connection_status") {
						console.log("Status da conexão WebSocket:", data.status);
					} else if (data.type === "echo") {
						console.log("Eco recebido:", data.original);
					}
				} catch (error) {
					console.error("Erro ao processar mensagem WebSocket:", error);
				}
			};

			newSocket.onclose = (event) => {
				console.log("WebSocket desconectado:", event.code, event.reason);
				setConnectionStatus((prev) => (prev === "error" ? "error" : "offline"));

				// Tentar reconectar após alguns segundos se não foi fechado intencionalmente
				if (event.code !== 1000) {
					console.log("Tentando reconectar em 5 segundos...");
					setTimeout(setupWebSocket, 5000);
				}
			};

			newSocket.onerror = (error) => {
				console.error("Erro no WebSocket:", error);
				setConnectionStatus("error");
			};

			// Guardar referência ao socket
			setSocket(newSocket);

			// Função de limpeza para fechar o socket quando o componente for desmontado
			return () => {
				console.log("Fechando WebSocket na limpeza...");
				if (newSocket.readyState === WebSocket.OPEN) {
					newSocket.close(1000, "Componente desmontado");
				}
			};
		};

		// Iniciar WebSocket se tivermos um ID de conversa ou se forçarmos com "new-user"
		if (conversationId || !socket) {
			// Limpar socket anterior se existir
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.close(1000, "Reconectando com novo ID");
			}

			const cleanup = setupWebSocket();
			return cleanup;
		}
	}, [conversationId, API_URL, socket]);

	// Enviar mensagem com tratamento de segurança aprimorado
	const sendMessage = async (messageText, msgConversationHistory) => {
		try {
			console.log(`Enviando mensagem para o backend...`);

			// IMPORTANTE: Usando SEMPRE o endpoint chat-n8n que utiliza o webhook do N8N
			const apiUrl = `${API_URL}/api/chat-n8n`;

			console.log(`Enviando para API endpoint: ${apiUrl}`);

			// Criar cliente axios com configurações específicas para esta chamada
			// Removido o cabeçalho X-Requested-With que estava causando o erro CORS
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
					// Não enviar cookies com a solicitação para reduzir riscos
					withCredentials: false,
				}
			);

			// Log da resposta para depuração
			console.log("Resposta do servidor:", response);

			// Garantir que estamos processando a resposta corretamente
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

			// Salvar o ID da conversa se fornecido - é importante fazer isso antes de adicionar
			// a mensagem do assistente para garantir que o WebSocket seja configurado corretamente
			if (response.conversation_id) {
				setConversationId(response.conversation_id);
			}

			// Se recebemos uma resposta direta (não assíncrona), mostramos
			// Caso contrário, a resposta real virá pelo WebSocket
			if (response.response !== "Processando sua mensagem...") {
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
					{/* Indicador de status */}
					<div className={`websocket-status ${connectionStatus}`}>
						<>
							<i className="fas fa-circle"></i>
							{connectionStatus === "connected"
								? "Conectado"
								: connectionStatus === "error"
								? "Erro de Conexão"
								: "Modo Offline"}
						</>
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
