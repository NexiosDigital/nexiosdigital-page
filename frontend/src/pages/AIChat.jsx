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
	const [status, setStatus] = useState("idle"); // idle, sending, error

	// Referências
	const messagesEndRef = useRef(null);
	const chatMessagesRef = useRef(null);
	const chatInputRef = useRef(null);

	// URL base da API
	const API_URL = process.env.REACT_APP_API_URL || "https://nexiosdigital.com";

	// Efeito para ajustar o scroll quando as mensagens mudam
	useEffect(() => {
		if (chatMessagesRef.current) {
			chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
		}
	}, [messages]);

	// Verificar status da API ao carregar
	useEffect(() => {
		const checkApiStatus = async () => {
			try {
				console.log("Verificando status da API...");
				await axios.get(`${API_URL}/api/status`);
				console.log("API online");
				setStatus("idle");
			} catch (error) {
				console.error("Erro ao verificar status da API:", error);
				setStatus("error");
			}
		};

		checkApiStatus();
	}, [API_URL]);

	// Enviar mensagem - Versão simplificada
	const sendMessage = async (messageText) => {
		// Indicar que está aguardando resposta
		setIsTyping(true);
		setStatus("sending");

		try {
			console.log(`Enviando mensagem para ${API_URL}/api/chat-n8n`);

			// Enviar a mensagem e aguardar resposta completa
			const response = await axios.post(
				`${API_URL}/api/chat-n8n`,
				{
					message: messageText,
					conversation_history: messages.map((msg) => ({
						role: msg.role,
						content: msg.content,
					})),
					conversation_id: conversationId,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 35000, // 35 segundos (mais que o timeout do servidor)
				}
			);

			console.log("Resposta recebida:", response.data);

			// Salvar ID da conversa
			if (response.data.conversation_id) {
				setConversationId(response.data.conversation_id);
			}

			// Adicionar resposta do assistente
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: response.data.response,
				},
			]);

			setStatus("idle");
			setIsTyping(false);
		} catch (error) {
			console.error("Erro ao enviar mensagem:", error);

			// Adicionar mensagem de erro
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content:
						"Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.",
				},
			]);

			setStatus("error");
			setIsTyping(false);
		}
	};

	// Manipulador para envio de mensagens
	const handleSendMessage = async () => {
		if (input.trim() === "" || isTyping) return;

		const userMessage = {
			role: "user",
			content: input,
		};

		// Adicionar mensagem do usuário à UI
		setMessages((prev) => [...prev, userMessage]);
		const currentInput = input;
		setInput("");

		// Foco no input
		chatInputRef.current?.focus();

		// Enviar mensagem para o backend
		await sendMessage(currentInput);
	};

	// Manipulador para tecla Enter
	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
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

					{/* Status da conversa */}
					<div className="chat-status">
						{status === "sending" && (
							<div className="chat-status-indicator">
								<i className="fas fa-sync fa-spin"></i> Processando sua
								solicitação...
							</div>
						)}
						{status === "error" && (
							<div className="chat-status-error">
								<i className="fas fa-exclamation-triangle"></i> Erro de conexão
							</div>
						)}
						{conversationId && (
							<div className="chat-conversation-id">
								ID: {conversationId.substring(0, 8)}...
							</div>
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
							disabled={isTyping || status === "error"}
						/>
						<button
							className="chat-send-btn"
							onClick={handleSendMessage}
							disabled={isTyping || input.trim() === "" || status === "error"}
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
