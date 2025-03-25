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

	// Referências
	const messagesEndRef = useRef(null);
	const chatMessagesRef = useRef(null);
	const chatInputRef = useRef(null);

	// Efeito para ajustar o scroll quando as mensagens mudam
	useEffect(() => {
		if (chatMessagesRef.current) {
			chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
		}
	}, [messages]);

	// Enviar mensagem para o backend
	const sendMessage = async (messageText, msgConversationHistory) => {
		try {
			console.log(`Enviando mensagem para o backend...`);
			
			// Configurar a API para chamadas diretas ao webhook do N8N
			// Pode ser uma solução temporária até que o roteamento de API seja corrigido
			let useDirectN8N = false;
			
			if (useDirectN8N) {
				// OPÇÃO 1: Chamar o webhook do N8N diretamente (não recomendado para produção - apenas debug)
				const n8nWebhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL || "https://webhook.nexiosdigital.com/webhook/nexios-chat-processor";
				
				console.log(`Enviando diretamente para o webhook N8N: ${n8nWebhookUrl}`);
				
				const response = await axios.post(n8nWebhookUrl, {
					message: messageText,
					conversation_history: msgConversationHistory,
					conversation_id: conversationId,
					timestamp: new Date().toISOString()
				});
				
				return {
					response: response.data.text || response.data.response || "Resposta recebida",
					conversation_id: conversationId || "new_session"
				};
			} else {
				// OPÇÃO 2: Chamar o endpoint API no backend (caminho normal)
				const apiUrl = "/api/chat";  // Mudar para um endpoint que comprovadamente funciona
				
				console.log(`Enviando para API endpoint: ${apiUrl}`);
				
				const response = await axios.post(apiUrl, {
					message: messageText,
					conversation_history: msgConversationHistory,
					conversation_id: conversationId
				});
				
				return response.data;
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

			// Usar resposta direta da API
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
					{/* Indicador de status */}
					<div className={`websocket-status ${connectionStatus}`}>
						<>
							<i className="fas fa-circle"></i> Modo Offline
						</>
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
