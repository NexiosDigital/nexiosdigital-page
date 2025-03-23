import axios from "axios";

// URL base para API
const API_URL = process.env.REACT_APP_API_URL || "";

// Configuração padrão para axios
const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Serviço de chat
const chatService = {
	/**
	 * Envia uma mensagem para o assistente de IA
	 * @param {string} message - Mensagem do usuário
	 * @param {Array} conversationHistory - Histórico da conversa
	 * @returns {Promise} - Resposta da API
	 */
	sendMessage: async (message, conversationHistory = []) => {
		try {
			const response = await apiClient.post("/api/chat", {
				message,
				conversation_history: conversationHistory,
			});

			return response.data;
		} catch (error) {
			console.error("Erro ao enviar mensagem:", error);
			throw error;
		}
	},

	/**
	 * Envia uma mensagem usando o endpoint avançado
	 * @param {string} message - Mensagem do usuário
	 * @param {string} conversationId - ID da conversa (opcional)
	 * @param {Array} conversationHistory - Histórico da conversa
	 * @param {string} context - Contexto adicional (opcional)
	 * @returns {Promise} - Resposta da API
	 */
	sendAdvancedMessage: async (
		message,
		conversationId = null,
		conversationHistory = [],
		context = null
	) => {
		try {
			const response = await apiClient.post("/api/advanced-chat", {
				message,
				conversation_id: conversationId,
				conversation_history: conversationHistory,
				context,
			});

			return response.data;
		} catch (error) {
			console.error("Erro ao enviar mensagem avançada:", error);
			throw error;
		}
	},

	/**
	 * Envia uma mensagem usando o endpoint N8N
	 * @param {string} message - Mensagem do usuário
	 * @param {Array} conversationHistory - Histórico da conversa
	 * @returns {Promise} - Resposta da API
	 */
	sendN8nMessage: async (message, conversationHistory = []) => {
		try {
			const response = await apiClient.post("/api/chat-n8n", {
				message,
				conversation_history: conversationHistory,
			});

			return response.data;
		} catch (error) {
			console.error("Erro ao enviar mensagem para N8N:", error);
			throw error;
		}
	},

	/**
	 * Recupera uma conversa completa pelo ID
	 * @param {string} conversationId - ID da conversa
	 * @returns {Promise} - Resposta da API
	 */
	getConversation: async (conversationId) => {
		try {
			const response = await apiClient.get(
				`/api/conversations/${conversationId}`
			);
			return response.data;
		} catch (error) {
			console.error("Erro ao recuperar conversa:", error);
			throw error;
		}
	},

	/**
	 * Verifica o status da API
	 * @returns {Promise} - Resposta da API
	 */
	checkStatus: async () => {
		try {
			const response = await apiClient.get("/api/status");
			return response.data;
		} catch (error) {
			console.error("Erro ao verificar status:", error);
			throw error;
		}
	},
};

export default chatService;
