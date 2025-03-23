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
	const [useN8n, setUseN8n] = useState(true); // Definido como true por padrão para usar N8N
	const [conversationId, setConversationId] = useState(null);
	const [lastSentMessage, setLastSentMessage] = useState("");
	const [socket, setSocket] = useState(null);
	const [connectionStatus, setConnectionStatus] = useState("disconnected");

	// Referências
	const messagesEndRef = useRef(null);
	const chatInputRef = useRef(null);

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
		const backendUrl = process.env.REACT_APP_API_URL || window.location.origin;
		const wsUrl = backendUrl.replace(/^https?:\/\//, "wss://");
		const wsConnection = new WebSocket(`${wsUrl}/ws/${clientId}`);

		wsConnection.onopen = () => {
			console.log("WebSocket conectado!");
			setConnectionStatus("connected");
			setSocket(wsConnection);
		};

		wsConnection.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log("Mensagem WebSocket recebida:", data);

			// Verificar se é uma resposta de assistente
			if (data.type === "assistant_response") {
				// Se tiver conversation_id, verificar se corresponde à conversa atual
				if (data.conversation_id && data.conversation_id === conversationId) {
					const assistantMessage = {
						role: "assistant",
						content: data.content,
					};
					setMessages((prev) => [...prev, assistantMessage]);
					setIsTyping(false);
				}
				// Se não tiver conversation_id ou se for uma transmissão geral
				else if (!data.conversation_id || data.type === "broadcast_message") {
					// Verificar se é uma resposta para a última mensagem enviada
					if (data.original_message === lastSentMessage) {
						const assistantMessage = {
							role: "assistant",
							content: data.content,
						};
						setMessages((prev) => [...prev, assistantMessage]);
						setIsTyping(false);
					}
				}
			}
		};

		wsConnection.onclose = () => {
			console.log("WebSocket desconectado");
			setConnectionStatus("disconnected");
		};

		wsConnection.onerror = (error) => {
			console.error("Erro no WebSocket:", error);
			setConnectionStatus("error");
		};

		// Limpar conexão quando o componente desmontar
		return () => {
			if (wsConnection) {
				wsConnection.close();
			}
		};
	}, [conversationId]);

	// Efeito para rolar para a última mensagem
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Função para rolar para a última mensagem
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// Enviar mensagem para o backend
	const sendMessage = async (messageText, msgConversationHistory) => {
		const backendUrl =
			process.env.REACT_APP_API_URL ||
			window.location.origin.replace("3000", "8000");
		const endpoint = useN8n ? "/api/chat-n8n" : "/api/chat";

		try {
			const response = await axios.post(`${backendUrl}${endpoint}`, {
				message: messageText,
				conversation_history: msgConversationHistory,
				conversation_id: conversationId,
			});

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

			// Se estamos usando WebSockets, a resposta virá pelo WebSocket
			// Mas se o WebSocket falhar, ainda podemos mostrar a resposta da API REST
			if (connectionStatus !== "connected") {
				console.log("WebSocket não conectado, usando resposta HTTP:", response);
				const assistantMessage = {
					role: "assistant",
					content: response.response,
				};
				setMessages((prev) => [...prev, assistantMessage]);
				setIsTyping(false);
			}
			// Caso contrário, aguardamos a resposta via WebSocket
			// A resposta será processada no evento onmessage do WebSocket
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
						) : (
							<>
								<i className="fas fa-circle"></i> Desconectado
							</>
						)}
					</div>
				</div>

				{/* Seletor de modo de processamento */}
				<div className="chat-mode-selector">
					<div className="mode-toggle">
						<label className="toggle-label">
							<input
								type="checkbox"
								checked={useN8n}
								onChange={() => setUseN8n(!useN8n)}
								className="toggle-input"
							/>
							<span className="toggle-slider"></span>
							<span className="toggle-text">
								{useN8n ? "Usando Fluxo N8N" : "Usando OpenAI Direto"}
							</span>
						</label>
					</div>
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
						nossos serviços.{" "}
						{useN8n
							? "Atualmente usando fluxo N8N personalizado."
							: "Atualmente usando OpenAI diretamente."}{" "}
						Para informações mais detalhadas ou personalizadas, entre em contato
						com nossa equipe.
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
