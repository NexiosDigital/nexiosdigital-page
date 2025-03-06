import axios from "axios";
import mockAPI from "./mock-backend";

// Configuração para ambiente de desenvolvimento
const USE_MOCK_API = true; // Mudar para false quando o backend real estiver funcionando

// Wrapper para chamadas de API que usa mock ou backend real
const api = {
	// Método para registro
	async register(userData) {
		console.log("Tentando registrar usuário:", userData);

		if (USE_MOCK_API) {
			console.log("Usando mock API para registro");
			const result = await mockAPI.register(userData);

			if (result.error) {
				// Simular erro do axios para manter a interface consistente
				const error = new Error(result.message);
				error.response = {
					status: result.status,
					data: { detail: result.message },
				};
				throw error;
			}

			// Simular resposta do axios
			return {
				status: result.status,
				data: result.data,
			};
		} else {
			// Tentar usar o backend real
			try {
				console.log("Tentando usar backend real...");
				const response = await axios.post(
					"http://localhost:8000/api/auth/register",
					userData,
					{
						headers: { "Content-Type": "application/json" },
					}
				);
				return response;
			} catch (error) {
				console.error("Erro na chamada para o backend real:", error);
				throw error;
			}
		}
	},

	// Método para login
	async login(credentials) {
		console.log("Tentando login:", credentials.email);

		if (USE_MOCK_API) {
			console.log("Usando mock API para login");
			const result = await mockAPI.login(credentials);

			if (result.error) {
				const error = new Error(result.message);
				error.response = {
					status: result.status,
					data: { detail: result.message },
				};
				throw error;
			}

			return {
				status: result.status,
				data: result.data,
			};
		} else {
			try {
				const response = await axios.post(
					"http://localhost:8000/api/auth/login",
					credentials,
					{
						headers: { "Content-Type": "application/json" },
					}
				);
				return response;
			} catch (error) {
				console.error("Erro na chamada para o backend real:", error);
				throw error;
			}
		}
	},

	// Método para verificar token
	async verifyToken(token) {
		if (USE_MOCK_API) {
			const result = await mockAPI.verifyToken(token);

			if (result.error) {
				const error = new Error(result.message);
				error.response = {
					status: result.status,
					data: { detail: result.message },
				};
				throw error;
			}

			return {
				status: result.status,
				data: result.data,
			};
		} else {
			try {
				const response = await axios.get(
					"http://localhost:8000/api/auth/verify",
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);
				return response;
			} catch (error) {
				console.error("Erro na verificação de token:", error);
				throw error;
			}
		}
	},
};

export default api;
