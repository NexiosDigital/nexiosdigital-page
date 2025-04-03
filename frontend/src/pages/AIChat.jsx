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
	const lastMessageTimestampRef = useRef(null);
	const pollingAttemptsRef = useRef(0);
	const lastReceivedMessagesRef = useRef([]);
	const reconnectTimeoutRef = useRef(null);
	const socketRetryCountRef = useRef(0);

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

	// Função para verificar novas mensagens - MELHORADA
	const checkNewMessages = useCallback(async () => {
		if (!conversationId) return false;

		try {
			console.log(
				`Verificando novas mensagens para conversa ${conversationId}...`
			);

			// Adicionar um parâmetro de cache-busting para evitar caches
			const cacheBuster = Date.now();

			// Obter TODAS as mensagens recentes
			const response = await axios.get(
				`${API_URL}/api/messages/${conversationId}?cacheBuster=${cacheBuster}`,
				{
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "no-cache, no-store, must-revalidate",
						Pragma: "no-cache",
					},
				}
			);

			// Salvar a resposta completa para comparação
			const currentMessages = response.data.messages || [];
			console.log(`Recebido ${currentMessages.length} mensagens do servidor`);

			// Se não há respostas ainda, continuar polling
			if (currentMessages.length === 0) {
				console.log("Nenhuma mensagem encontrada. Continuando polling...");
				return false;
			}

			// Verificar se há novas mensagens do assistente
			const assistantMessages = currentMessages.filter(
				(msg) => msg.role === "assistant"
			);

			// Se houver mensagens do assistente
			if (assistantMessages.length > 0) {
				// Pegar a mensagem mais recente
				const latestMessage = assistantMessages[assistantMessages.length - 1];

				// Verificar se essa mensagem já está na UI
				const messageExists = messages.some(
					(msg) =>
						msg.role === "assistant" && msg.content === latestMessage.content
				);

				if (!messageExists) {
					console.log("Nova mensagem detectada:", latestMessage.content);

					// Atualizar o timestamp da última mensagem conhecida
					lastMessageTimestampRef.current =
						latestMessage.timestamp || new Date().toISOString();

					// Substituir mensagem temporária ou adicionar nova
					setMessages((prev) => {
						// Verificar se há uma mensagem temporária para substituir
						const hasTempMessage = prev.some((msg) => msg.isTemporary);

						if (hasTempMessage) {
							// Substituir a mensagem temporária
							return prev.map((msg) =>
								msg.isTemporary
									? {
											role: "assistant",
											content: latestMessage.content,
											timestamp: latestMessage.timestamp,
									  }
									: msg
							);
						} else {
							// Adicionar nova mensagem
							return [
								...prev,
								{
									role: "assistant",
									content: latestMessage.content,
									timestamp: latestMessage.timestamp,
								},
							];
						}
					});

					// Atualizar a referência de mensagens conhecidas
					lastReceivedMessagesRef.current = currentMessages;

					setIsTyping(false);
					return true; // Mensagem encontrada - pode parar polling
				}
			}

			// Atualizar a referência de mensagens conhecidas mesmo sem encontrar novidades
			lastReceivedMessagesRef.current = currentMessages;

			return false; // Continuar polling - nenhuma nova mensagem
		} catch (error) {
			console.error("Erro ao verificar novas mensagens:", error);
			return false;
		}
	}, [API_URL, conversationId, messages]);

	// Função para iniciar polling após enviar mensagem - MELHORADA
	const startMessagePolling = useCallback(() => {
		// Limpar polling anterior se existir
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
		}

		console.log("Iniciando polling para verificar respostas...");
		setPollingActive(true);
		pollingAttemptsRef.current = 0;

		const maxAttempts = 60; // 5 minutos (60 * 5 segundos)
		const checkInterval = 5000; // 5 segundos

		// Verificar imediatamente antes de iniciar o intervalo
		checkNewMessages().then((foundMessage) => {
			if (foundMessage) {
				console.log("Mensagem encontrada imediatamente!");
				setPollingActive(false);
				return;
			}

			// Se não encontrou imediatamente, iniciar polling
			pollingIntervalRef.current = setInterval(async () => {
				pollingAttemptsRef.current++;
				console.log(
					`Tentativa de polling ${pollingAttemptsRef.current}/${maxAttempts}`
				);

				const foundMessage = await checkNewMessages();

				if (foundMessage || pollingAttemptsRef.current >= maxAttempts) {
					// Parar polling quando encontrar uma mensagem ou atingir limite
					if (pollingAttemptsRef.current >= maxAttempts && !foundMessage) {
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
			}, checkInterval);
		});
	}, [checkNewMessages]);

	// Iniciar WebSocket e gerenciar reconexão
	const setupWebSocket = useCallback(() => {
		// Limpar timeout de reconexão anterior, se existir
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}

		// Converter a URL HTTP para WebSocket (ws:// ou wss://)
		const wsProtocol = API_URL.startsWith("https") ? "wss" : "ws";
		const wsBaseUrl = API_URL.replace(/^https?:\/\//, `${wsProtocol}://`);

		// Incluir ID da conversa como query param se disponível
		let wsUrl = `${wsBaseUrl}/ws/${clientId}`;
		if (conversationId) {
			wsUrl += `?conversation_id=${conversationId}`;
		}

		console.log(`Conectando ao WebSocket: ${wsUrl}`);
		setConnectionStatus("connecting");

		// Criar nova conexão WebSocket
		const newSocket = new WebSocket(wsUrl);
		socketRef.current = newSocket;

		newSocket.onopen = () => {
			console.log("WebSocket conectado!");
			setConnectionStatus("connected");
			socketRetryCountRef.current = 0; // Resetar contador de tentativas

			// Se tivermos um ID de conversa, enviar para associação
			if (conversationId) {
				try {
					const associationMessage = JSON.stringify({
						conversation_id: conversationId,
						client_id: clientId,
					});
					console.log(`Enviando associação: ${associationMessage}`);
					newSocket.send(associationMessage);
				} catch (err) {
					console.error("Erro ao enviar mensagem de associação:", err);
				}
			}
		};

		newSocket.onmessage = (event) => {
			console.log("Mensagem recebida via WebSocket:", event.data);
			try {
				const data = JSON.parse(event.data);

				if (data.type === "message") {
					// Nova mensagem recebida do assistente via WebSocket
					console.log("Mensagem do assistente via WebSocket:", data.content);

					// Atualizar timestamp da última mensagem
					lastMessageTimestampRef.current =
						data.timestamp || new Date().toISOString();

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
										? {
												role: "assistant",
												content: data.content,
												timestamp: data.timestamp,
										  }
										: msg
								);
							} else {
								// Adicionar nova mensagem
								return [
									...prev,
									{
										role: "assistant",
										content: data.content,
										timestamp: data.timestamp,
									},
								];
							}
						});

						// Desativar polling se estiver ativo
						if (pollingActive && pollingIntervalRef.current) {
							clearInterval(pollingIntervalRef.current);
							pollingIntervalRef.current = null;
							setPollingActive(false);
						}
					}

					setIsTyping(false);
				} else if (data.type === "connection_status") {
					console.log("Status da conexão WebSocket:", data.status);
					setConnectionStatus(data.status);
				} else if (data.type === "association_success") {
					console.log("Associação de ID bem-sucedida:", data.message);
					// Verificar se há um novo ID de conversa no response
					if (data.conversation_id && !conversationId) {
						setConversationId(data.conversation_id);
					}
				} else if (data.type === "message_history") {
					console.log("Recebido histórico de mensagens:", data.messages);

					// Processar apenas se tiver mensagens
					if (data.messages && data.messages.length > 0) {
						// Procurar a última mensagem do assistente
						const assistantMessages = data.messages.filter(
							(msg) => msg.role === "assistant"
						);

						if (assistantMessages.length > 0) {
							const latestAssistantMsg =
								assistantMessages[assistantMessages.length - 1];

							// Verificar se já temos essa mensagem
							const messageExists = messages.some(
								(msg) =>
									msg.role === "assistant" &&
									msg.content === latestAssistantMsg.content
							);

							if (!messageExists) {
								console.log(
									"Nova mensagem do histórico a ser exibida:",
									latestAssistantMsg.content
								);

								// Substituir mensagem temporária ou adicionar nova
								setMessages((prev) => {
									// Verificar se há uma mensagem temporária para substituir
									const hasTempMessage = prev.some((msg) => msg.isTemporary);

									if (hasTempMessage) {
										// Substituir a mensagem temporária
										return prev.map((msg) =>
											msg.isTemporary
												? {
														role: "assistant",
														content: latestAssistantMsg.content,
														timestamp: latestAssistantMsg.timestamp,
												  }
												: msg
										);
									} else {
										// Adicionar nova mensagem
										return [
											...prev,
											{
												role: "assistant",
												content: latestAssistantMsg.content,
												timestamp: latestAssistantMsg.timestamp,
											},
										];
									}
								});

								// Desativar polling se estiver ativo
								if (pollingActive && pollingIntervalRef.current) {
									clearInterval(pollingIntervalRef.current);
									pollingIntervalRef.current = null;
									setPollingActive(false);
								}

								setIsTyping(false);
							}
						}
					}
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
				socketRetryCountRef.current += 1;
				const delay = Math.min(
					30000,
					1000 * Math.pow(2, socketRetryCountRef.current)
				); // Exponential backoff até 30s
				console.log(`Tentando reconectar em ${delay / 1000} segundos...`);

				reconnectTimeoutRef.current = setTimeout(() => {
					console.log("Tentando reconexão WebSocket...");
					setupWebSocket();
				}, delay);
			}
		};

		newSocket.onerror = (error) => {
			console.error("Erro no WebSocket:", error);
			setConnectionStatus("error");
		};

		// Guardar referência ao socket
		setSocket(newSocket);
	}, [API_URL, clientId, conversationId, messages]);

	// Configuração do WebSocket - MELHORADA
	useEffect(() => {
		// Estabelecer conexão WebSocket quando o componente montar
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

			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
		};
	}, [setupWebSocket]);

	// Efeito para associar ID de conversa quando ele mudar
	useEffect(() => {
		// Se tivermos um ID de conversa e o WebSocket estiver aberto, enviar associação
		if (
			conversationId &&
			socketRef.current &&
			socketRef.current.readyState === WebSocket.OPEN
		) {
			try {
				console.log(
					`Enviando associação explícita: conversationId=${conversationId}, clientId=${clientId}`
				);
				const associationMessage = JSON.stringify({
					conversation_id: conversationId,
					client_id: clientId,
				});
				socketRef.current.send(associationMessage);

				// Também fazer uma verificação de mensagens imediata
				setTimeout(() => {
					checkNewMessages();
				}, 500);
			} catch (err) {
				console.error("Erro ao enviar mensagem de associação:", err);
			}
		}
	}, [conversationId, clientId, checkNewMessages]);

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

	// Enviar mensagem para o backend
	const sendMessage = async (messageText, msgConversationHistory) => {
		try {
			console.log(`Enviando mensagem para o backend...`);

			// Usar endpoint chat-n8n que utiliza o webhook do N8N
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
					withCredentials: false,
				}
			);

			console.log("Resposta do servidor:", response.data);
			return response.data;
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
			timestamp: new Date().toISOString(),
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
				timestamp: msg.timestamp || new Date().toISOString(),
			}));

			// Enviar a mensagem para o backend
			const response = await sendMessage(currentInput, conversationHistory);
			console.log("Resposta recebida:", response);

			// Salvar o ID da conversa se fornecido e limpar o histórico de polling
			if (response.conversation_id) {
				// Se for um ID novo, resetar o lastReceivedMessagesRef
				if (conversationId !== response.conversation_id) {
					lastReceivedMessagesRef.current = [];
					lastMessageTimestampRef.current = null;
				}

				setConversationId(response.conversation_id);
			}

			// Verifica se a resposta indica processamento assíncrono
			if (response.status === "processing") {
				console.log("Mensagem em processamento. Iniciando polling...");

				// Mostrar mensagem temporária de "processando"
				setMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content: "",
						isTemporary: true,
						timestamp: new Date().toISOString(),
					},
				]);

				// Resetar o contador de tentativas antes de iniciar o polling
				pollingAttemptsRef.current = 0;

				// Iniciar processo de polling para verificar quando a resposta estiver pronta
				startMessagePolling();

				// Também disparar uma checagem imediata de mensagens
				setTimeout(() => {
					checkNewMessages();
				}, 1000);
			} else {
				// Se não for processamento assíncrono, mostrar resposta direta
				const timestamp = new Date().toISOString();
				lastMessageTimestampRef.current = timestamp;

				setMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content: response.response,
						timestamp: timestamp,
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
				timestamp: new Date().toISOString(),
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

	// Forçar reconexão do WebSocket
	const handleReconnect = () => {
		if (socketRef.current) {
			socketRef.current.close();
		}
		setupWebSocket();
	};

	// Renderização do chat - MELHORIAS APENAS VISUAIS AQUI
	return (
		<div className="ai-chat-page modern-chat-page">
			<div className="container">
				<div className="chat-header modern-header">
					<div className="header-content">
						<h1>
							Assistente <span className="text-gradient">Nexios</span> Digital
						</h1>
						<p>
							Interaja com nossa IA e descubra como podemos ajudar a transformar
							seu negócio.
						</p>
					</div>

					{/* Status indicators */}
					<div className="status-container">
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

						{pollingActive && (
							<div className="polling-indicator">
								<i className="fas fa-sync fa-spin"></i> Aguardando resposta... (
								{pollingAttemptsRef.current})
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

						{connectionStatus !== "connected" && (
							<button
								className="btn btn-secondary btn-sm"
								onClick={handleReconnect}
							>
								<i className="fas fa-plug"></i> Reconectar
							</button>
						)}
					</div>
				</div>

				{apiError && (
					<div className="api-error-message">
						<i className="fas fa-exclamation-triangle"></i>
						<p>{apiError}</p>
					</div>
				)}

				<div className="chat-container modern-chat-container">
					<div className="chat-messages" ref={chatMessagesRef}>
						{messages.map((message, index) => (
							<div
								key={index}
								className={`message message-${message.role} ${
									message.isTemporary ? "temporary" : ""
								}`}
							>
								{message.role === "assistant" && (
									<div className="message-avatar">
										<i className="fas fa-robot"></i>
									</div>
								)}
								<div className="message-bubble">
									<div className="message-content">{message.content}</div>
									{message.isTemporary && (
										<div className="message-loader">
											<span></span>
											<span></span>
											<span></span>
										</div>
									)}
								</div>
								{message.role === "user" && (
									<div className="message-avatar user-avatar">
										<i className="fas fa-user"></i>
									</div>
								)}
							</div>
						))}

						{isTyping && !messages.some((m) => m.isTemporary) && (
							<div className="message message-assistant typing-message">
								<div className="message-avatar">
									<i className="fas fa-robot"></i>
								</div>
								<div className="message-bubble">
									<div className="typing-indicator">
										<span></span>
										<span></span>
										<span></span>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef}></div>
					</div>

					<div className="chat-input-container modern-input">
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
							className={`chat-send-btn ${input.trim() ? "active" : ""}`}
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
							<span className="btn-content">
								<i className="fas fa-paper-plane"></i>
								<span>Falar com um Especialista</span>
							</span>
							<span className="btn-glow"></span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AIChat;
