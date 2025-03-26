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
	const [connectionStatus, setConnectionStatus] = useState("offline");
	const [apiError, setApiError] = useState(null);
	const [socket, setSocket] = useState(null);
	const [pollingActive, setPollingActive] = useState(false);
	const [clientId, setClientId] = useState(() => {
		const savedId = localStorage.getItem("nexios_client_id");
		return savedId || `client-${Date.now()}`;
	});

	// Referências
	const messagesEndRef = useRef(null);
	const chatMessagesRef = useRef(null);
	const chatInputRef = useRef(null);
	const socketRef = useRef(null);
	const pollingIntervalRef = useRef(null);

	// URL base da API
	const API_URL = process.env.REACT_APP_API_URL || "https://nexiosdigital.com";

	// Salvar clientId no localStorage
	useEffect(() => {
		localStorage.setItem("nexios_client_id", clientId);
	}, [clientId]);

	// Efeito para ajustar o scroll quando as mensagens mudam
	useEffect(() => {
		if (chatMessagesRef.current) {
			chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
		}
	}, [messages]);

	// Função para verificar novas mensagens
	const checkNewMessages = useCallback(async () => {
		if (!conversationId) return;

		try {
			console.log(
				`Verificando novas mensagens para conversa ${conversationId}...`
			);
			const response = await axios.get(
				`${API_URL}/api/messages/${conversationId}`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const serverMessages = response.data.messages || [];

			// Filtrar apenas mensagens do assistente
			const assistantMessages = serverMessages.filter(
				(msg) => msg.role === "assistant"
			);

			if (assistantMessages.length > 0) {
				console.log(
					`Encontradas ${assistantMessages.length} mensagens do assistente`
				);

				// Pegar a mensagem mais recente
				const latestMessage = assistantMessages[assistantMessages.length - 1];

				// Verificar se essa mensagem já está na UI
				const messageExists = messages.some(
					(msg) =>
						msg.role === "assistant" && msg.content === latestMessage.content
				);

				if (!messageExists) {
					console.log("Nova mensagem encontrada:", latestMessage.content);

					// Substituir mensagem temporária ou adicionar nova
					setMessages((prev) => {
						// Verificar se há uma mensagem temporária para substituir
						const hasTempMessage = prev.some((msg) => msg.isTemporary);

						if (hasTempMessage) {
							// Substituir a mensagem temporária
							return prev.map((msg) =>
								msg.isTemporary
									? { role: "assistant", content: latestMessage.content }
									: msg
							);
						} else {
							// Adicionar nova mensagem
							return [
								...prev,
								{ role: "assistant", content: latestMessage.content },
							];
						}
					});

					setIsTyping(false);
					return true; // Mensagem encontrada - pode parar polling
				}
			}

			return false; // Continuar polling - nenhuma nova mensagem
		} catch (error) {
			console.error("Erro ao verificar novas mensagens:", error);
			return false;
		}
	}, [API_URL, conversationId, messages]);

	// Função para iniciar polling específico após enviar mensagem
	const startMessagePolling = useCallback(() => {
		// Limpar polling anterior se existir
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
		}

		console.log("Iniciando polling para verificar respostas...");
		setPollingActive(true);

		let attempts = 0;
		const maxAttempts = 12; // 1 minuto (12 * 5 segundos)

		pollingIntervalRef.current = setInterval(async () => {
			attempts++;

			const foundMessage = await checkNewMessages();

			if (foundMessage || attempts >= maxAttempts) {
				// Parar polling quando encontrar uma mensagem ou atingir limite
				if (attempts >= maxAttempts && !foundMessage) {
					console.log("Tempo de polling esgotado sem resposta");

					// Remover mensagem temporária e mostrar erro
					setMessages((prev) => {
						const filtered = prev.filter((msg) => !msg.isTemporary);
						return [
							...filtered,
							{
								role: "assistant",
								content:
									"Não foi possível obter uma resposta no tempo esperado. Por favor, tente novamente mais tarde.",
							},
						];
					});
					setIsTyping(false);
				}

				clearInterval(pollingIntervalRef.current);
				pollingIntervalRef.current = null;
				setPollingActive(false);
			}
		}, 5000); // Verificar a cada 5 segundos
	}, [checkNewMessages]);

	// Configuração do WebSocket
	useEffect(() => {
		// Estabelecer conexão WebSocket quando tivermos um ID de conversa
		const setupWebSocket = () => {
			// Converter a URL HTTP para WebSocket (ws:// ou wss://)
			const wsProtocol = API_URL.startsWith("https") ? "wss" : "ws";
			const wsBaseUrl = API_URL.replace(/^https?:\/\//, `${wsProtocol}://`);
			const wsUrl = `${wsBaseUrl}/ws/${clientId}`;

			console.log("Conectando ao WebSocket:", wsUrl);

			// Criar nova conexão WebSocket
			const newSocket = new WebSocket(wsUrl);
			socketRef.current = newSocket;

			newSocket.onopen = () => {
				console.log("WebSocket conectado!");
				setConnectionStatus("connected");

				// Se tivermos um ID de conversa, enviar para associação
				if (conversationId) {
					newSocket.send(JSON.stringify({ conversation_id: conversationId }));
					console.log(
						`ID de conversa ${conversationId} enviado para associação`
					);
				}
			};

			newSocket.onmessage = (event) => {
				console.log("Mensagem recebida via WebSocket:", event.data);
				try {
					const data = JSON.parse(event.data);

					if (data.type === "message") {
						// Nova mensagem recebida do assistente via WebSocket
						console.log("Mensagem do assistente via WebSocket:", data.content);

						// Verificar se já temos essa mensagem
						const messageExists = messages.some(
							(msg) => msg.role === "assistant" && msg.content === data.content
						);

						if (!messageExists) {
							// Substituir mensagem temporária ou adicionar nova
							setMessages((prev) => {
								// Verificar se há uma mensagem temporária para substituir
								const hasTempMessage = prev.some((msg) => msg.isTemporary);

								if (hasTempMessage) {
									// Substituir a mensagem temporária
									return prev.map((msg) =>
										msg.isTemporary
											? { role: "assistant", content: data.content }
											: msg
									);
								} else {
									// Adicionar nova mensagem
									return [
										...prev,
										{ role: "assistant", content: data.content },
									];
								}
							});
						}

						setIsTyping(false);
					} else if (data.type === "connection_status") {
						console.log("Status da conexão WebSocket:", data.status);
					} else if (data.type === "association_success") {
						console.log("Associação de ID bem-sucedida:", data.message);
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
		};

		setupWebSocket();

		// Função de limpeza para fechar o socket quando o componente for desmontado
		return () => {
			if (
				socketRef.current &&
				socketRef.current.readyState === WebSocket.OPEN
			) {
				socketRef.current.close(1000, "Componente desmontado");
			}

			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
			}
		};
	}, [API_URL, clientId, conversationId, messages]);

	// Efeito para associar ID de conversa quando ele mudar
	useEffect(() => {
		// Se tivermos um ID de conversa e o WebSocket estiver aberto, enviar associação
		if (
			conversationId &&
			socketRef.current &&
			socketRef.current.readyState === WebSocket.OPEN
		) {
			socketRef.current.send(
				JSON.stringify({ conversation_id: conversationId })
			);
			console.log(
				`ID de conversa ${conversationId} enviado para associação (atualização)`
			);
		}
	}, [conversationId]);

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

	// Enviar mensagem com tratamento de segurança aprimorado
	const sendMessage = async (messageText, msgConversationHistory) => {
		try {
			console.log(`Enviando mensagem para o backend...`);

			// IMPORTANTE: Usando SEMPRE o endpoint chat-n8n que utiliza o webhook do N8N
			const apiUrl = `${API_URL}/api/chat-n8n`;

			console.log(`Enviando para API endpoint: ${apiUrl}`);

			// Criar cliente axios com configurações específicas para esta chamada
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

			return response.data;
		} catch (error) {
			console.error(`Erro ao enviar mensagem:`, error);
			throw error;
		}
	};

	// Manipulador para envio de mensagens - MODIFICADO PARA HANDLING ASSÍNCRONO
	const handleSendMessage = async () => {
		if (input.trim() === "" || isTyping) return;

		const userMessage = {
			role: "user",
			content: input,
		};

		// Armazenar a mensagem que está sendo enviada
		const currentInput = input;

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

			// Enviar a mensagem para o backend
			const response = await sendMessage(currentInput, conversationHistory);
			console.log("Resposta recebida:", response);

			// Salvar o ID da conversa se fornecido
			if (response.conversation_id) {
				setConversationId(response.conversation_id);

				// Enviar ID de conversa para o WebSocket se conectado
				if (
					socketRef.current &&
					socketRef.current.readyState === WebSocket.OPEN
				) {
					socketRef.current.send(
						JSON.stringify({
							conversation_id: response.conversation_id,
						})
					);
				}
			}

			// Verifica se a resposta indica processamento assíncrono
			if (response.status === "processing") {
				console.log("Mensagem em processamento. Iniciando polling...");

				// Mostrar mensagem temporária de "processando"
				setMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content: response.response || "Processando sua mensagem...",
						isTemporary: true,
					},
				]);

				// Iniciar processo de polling para verificar quando a resposta estiver pronta
				startMessagePolling();
			} else {
				// Se não for processamento assíncrono, mostrar resposta direta
				setMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content: response.response,
					},
				]);
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

	// Forçar verificação de mensagens pendentes
	const handleCheckMessages = () => {
		if (conversationId) {
			checkNewMessages();
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

					{/* Área de status */}
					<div className="status-container">
						<div className={`websocket-status ${connectionStatus}`}>
							<i className="fas fa-circle"></i>
							{connectionStatus === "connected"
								? "Conectado"
								: connectionStatus === "error"
								? "Erro de Conexão"
								: "Modo Offline"}
						</div>

						{pollingActive && (
							<div className="polling-indicator">
								<i className="fas fa-sync fa-spin"></i> Aguardando resposta...
							</div>
						)}

						{conversationId && (
							<div className="conversation-info">
								ID: {conversationId.substring(0, 8)}...
								<button
									className="refresh-button"
									onClick={handleCheckMessages}
									title="Verificar mensagens pendentes"
								>
									<i className="fas fa-sync-alt"></i>
								</button>
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
							<div
								key={index}
								className={`message message-${message.role} ${
									message.isTemporary ? "temporary" : ""
								}`}
							>
								{message.content}
								{message.isTemporary && (
									<div className="message-loader">
										<span></span>
										<span></span>
										<span></span>
									</div>
								)}
							</div>
						))}

						{isTyping && !messages.some((m) => m.isTemporary) && (
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
