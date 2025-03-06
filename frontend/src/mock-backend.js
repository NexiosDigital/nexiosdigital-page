// Arquivo: frontend/src/mock-backend.js
// Um backend mock simples para testes durante o desenvolvimento

// Banco de dados simulado
const mockDatabase = {
	users: [],
};

// Funções de API simuladas
const mockAPI = {
	// Função de registro
	async register(userData) {
		console.log("Mock API: Registrando usuário", userData);

		// Verificar se o email já existe
		const userExists = mockDatabase.users.some(
			(user) => user.email === userData.email
		);
		if (userExists) {
			return {
				error: true,
				status: 400,
				message: "Email já registrado",
			};
		}

		// Criar novo usuário
		const newUser = {
			id: Date.now().toString(),
			...userData,
			created_at: new Date().toISOString(),
			password: "***hashed***", // Simulação de hash
		};

		// Adicionar ao banco de dados simulado
		mockDatabase.users.push(newUser);
		console.log("Mock API: Usuário registrado com sucesso", newUser.id);
		console.log("Mock API: Total de usuários:", mockDatabase.users.length);

		return {
			error: false,
			status: 201,
			data: {
				message: "Usuário registrado com sucesso",
				userId: newUser.id,
			},
		};
	},

	// Função de login
	async login(credentials) {
		console.log("Mock API: Tentativa de login", credentials.email);

		// Encontrar usuário
		const user = mockDatabase.users.find(
			(user) => user.email === credentials.email
		);

		// Verificar se o usuário existe
		if (!user) {
			return {
				error: true,
				status: 401,
				message: "Email ou senha incorretos",
			};
		}

		// Em um backend real, verificaríamos a senha com bcrypt ou similar
		// Aqui apenas simulamos autenticação bem-sucedida

		// Criar token simulado
		const token = `mock-jwt-token-${Date.now()}`;

		// Dados do usuário (excluindo senha)
		const { password, ...userData } = user;

		return {
			error: false,
			status: 200,
			data: {
				user: userData,
				token,
			},
		};
	},

	// Verificar token
	async verifyToken(token) {
		// Simulamos validação de token
		if (token && token.startsWith("mock-jwt-token-")) {
			return {
				error: false,
				status: 200,
				data: {
					valid: true,
				},
			};
		}

		return {
			error: true,
			status: 401,
			message: "Token inválido",
		};
	},
};

export default mockAPI;
