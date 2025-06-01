import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

// Inicialização do cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Serviço de autenticação para gerenciar usuários com Supabase
 */
export class AuthService {
	/**
	 * Faz login de um usuário
	 * @param {string} email Email do usuário
	 * @param {string} password Senha do usuário
	 * @returns {Promise<Object>} Dados do usuário e token de sessão
	 */
	async login(email, password) {
		try {
			// 1. Login na autenticação do Supabase
			const { data: authData, error: authError } =
				await supabase.auth.signInWithPassword({
					email,
					password,
				});

			if (authError) throw authError;

			if (authData.user) {
				// 2. Recuperar dados do perfil
				const { data: profileData, error: profileError } = await supabase
					.from("user_profiles")
					.select("*")
					.eq("user_id", authData.user.id)
					.single();

				if (profileError) {
					console.error("Erro ao recuperar perfil:", profileError);
					throw profileError;
				}

				// 3. Verificar se o usuário está ativo
				if (!profileData.is_active) {
					throw new Error(
						"Usuário inativo. Entre em contato com o administrador."
					);
				}

				// 4. Atualizar último login
				await supabase
					.from("user_profiles")
					.update({ last_login: new Date().toISOString() })
					.eq("user_id", authData.user.id);

				// 5. Recuperar dados do cliente
				const { data: clientData, error: clientError } = await supabase
					.from("clients")
					.select("*")
					.eq("id", profileData.client_id)
					.single();

				if (clientError) {
					console.error("Erro ao recuperar dados do cliente:", clientError);
					throw clientError;
				}

				// 6. Verificar se o cliente está ativo
				if (!clientData.active) {
					throw new Error(
						"Conta de cliente inativa. Entre em contato com o suporte."
					);
				}

				// Combinar dados para retorno
				return {
					session: authData.session,
					user: {
						...authData.user,
						profile: profileData,
						client: clientData,
					},
				};
			}
		} catch (error) {
			console.error("Erro no login:", error);
			throw error;
		}
	}

	/**
	 * Faz logout do usuário atual
	 * @returns {Promise<void>}
	 */
	async logout() {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	}

	/**
	 * Recupera o usuário atual
	 * @returns {Promise<Object|null>} Dados do usuário ou null se não estiver autenticado
	 */
	async getCurrentUser() {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error) throw error;

			if (user) {
				// Recuperar dados completos do perfil
				const { data: profileData, error: profileError } = await supabase
					.from("user_profiles")
					.select("*")
					.eq("user_id", user.id)
					.single();

				if (profileError) throw profileError;

				// Recuperar dados do cliente
				const { data: clientData, error: clientError } = await supabase
					.from("clients")
					.select("*")
					.eq("id", profileData.client_id)
					.single();

				if (clientError) throw clientError;

				return {
					...user,
					profile: profileData,
					client: clientData,
				};
			}

			return null;
		} catch (error) {
			console.error("Erro ao recuperar usuário atual:", error);
			return null;
		}
	}

	/**
	 * Recupera a sessão atual
	 * @returns {Promise<Object|null>} Dados da sessão ou null
	 */
	async getSession() {
		const {
			data: { session },
			error,
		} = await supabase.auth.getSession();
		if (error) {
			console.error("Erro ao recuperar sessão:", error);
			return null;
		}
		return session;
	}

	/**
	 * Solicita acesso à plataforma (para novos clientes)
	 * @param {Object} requestData Dados da solicitação
	 * @returns {Promise<void>}
	 */
	async requestAccess(requestData) {
		try {
			const { error } = await supabase.from("access_requests").insert([
				{
					name: requestData.name,
					email: requestData.email,
					company: requestData.company,
					phone: requestData.phone,
					message: requestData.message,
					status: "pending",
					created_at: new Date().toISOString(),
				},
			]);

			if (error) throw error;
		} catch (error) {
			console.error("Erro ao solicitar acesso:", error);
			throw error;
		}
	}

	/**
	 * Verifica um token de convite
	 * @param {string} token Token do convite
	 * @returns {Promise<Object>} Dados do convite
	 */
	async verifyInviteToken(token) {
		try {
			const { data, error } = await supabase
				.from("invites")
				.select("*, clients(name)")
				.eq("token", token)
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Erro ao verificar token de convite:", error);
			throw error;
		}
	}

	/**
	 * Registra um usuário usando um convite
	 * @param {string} token Token do convite
	 * @param {Object} userData Dados do usuário
	 * @returns {Promise<Object>} Resultado do registro
	 */
	async registerWithInvite(token, userData) {
		try {
			// 1. Verificar o convite
			const invite = await this.verifyInviteToken(token);

			if (!invite || invite.status !== "pending") {
				throw new Error("Convite inválido ou já utilizado");
			}

			if (new Date(invite.expires_at) < new Date()) {
				throw new Error("Convite expirado");
			}

			// 2. Criar usuário na autenticação do Supabase
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email: invite.email,
				password: userData.password,
			});

			if (authError) throw authError;

			if (authData.user) {
				// 3. Criar perfil do usuário
				const { error: profileError } = await supabase
					.from("user_profiles")
					.insert([
						{
							user_id: authData.user.id,
							name: userData.name,
							client_id: invite.client_id,
							role: invite.role || "user",
							is_active: true,
							preferences: {},
						},
					]);

				if (profileError) {
					console.error("Erro ao criar perfil:", profileError);
					// Se falhar ao criar perfil, tentar excluir o usuário
					await supabase.auth.admin.deleteUser(authData.user.id);
					throw profileError;
				}

				// 4. Marcar convite como usado
				await supabase
					.from("invites")
					.update({
						status: "accepted",
						used_at: new Date().toISOString(),
					})
					.eq("token", token);

				return {
					user: authData.user,
					profile: {
						name: userData.name,
						client_id: invite.client_id,
						role: invite.role || "user",
					},
				};
			}
		} catch (error) {
			console.error("Erro ao registrar com convite:", error);
			throw error;
		}
	}

	/**
	 * Atualiza dados do usuário
	 * @param {Object} userData Dados a serem atualizados
	 * @returns {Promise<Object>} Dados atualizados
	 */
	async updateUserProfile(userData) {
		try {
			const user = await this.getCurrentUser();
			if (!user) throw new Error("Usuário não autenticado");

			// Atualizar perfil no Supabase
			const { data, error } = await supabase
				.from("user_profiles")
				.update({
					name: userData.name || user.profile.name,
					preferences: userData.preferences || user.profile.preferences,
					updated_at: new Date().toISOString(),
				})
				.eq("user_id", user.id)
				.select()
				.single();

			if (error) throw error;

			// Se estiver atualizando o email
			if (userData.email && userData.email !== user.email) {
				const { error: emailError } = await supabase.auth.updateUser({
					email: userData.email,
				});

				if (emailError) throw emailError;
			}

			// Se estiver atualizando a senha
			if (userData.password) {
				const { error: passwordError } = await supabase.auth.updateUser({
					password: userData.password,
				});

				if (passwordError) throw passwordError;
			}

			return data;
		} catch (error) {
			console.error("Erro ao atualizar perfil:", error);
			throw error;
		}
	}

	/**
	 * Envia email para recuperação de senha
	 * @param {string} email Email do usuário
	 * @returns {Promise<void>}
	 */
	async resetPassword(email) {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (error) throw error;
		} catch (error) {
			console.error("Erro ao solicitar recuperação de senha:", error);
			throw error;
		}
	}

	/**
	 * Valida token de reset de senha
	 * @param {string} accessToken Token de acesso
	 * @returns {Promise<void>}
	 */
	async validateResetToken(accessToken) {
		try {
			const { error } = await supabase.auth.setSession({
				access_token: accessToken,
				refresh_token: "", // Não necessário para validação
			});

			if (error) throw error;
		} catch (error) {
			console.error("Erro ao validar token de reset:", error);
			throw error;
		}
	}

	/**
	 * Configura nova senha após recuperação
	 * @param {string} newPassword Nova senha
	 * @returns {Promise<void>}
	 */
	async confirmPasswordReset(newPassword) {
		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) throw error;
		} catch (error) {
			console.error("Erro ao definir nova senha:", error);
			throw error;
		}
	}

	/**
	 * Verifica se o usuário tem determinada permissão
	 * @param {string} permission Permissão a ser verificada
	 * @returns {Promise<boolean>} Tem permissão ou não
	 */
	async hasPermission(permission) {
		try {
			const user = await this.getCurrentUser();
			if (!user) return false;

			// Definir permissões por role
			const rolePermissions = {
				admin: [
					"admin_access",
					"view_dashboard",
					"manage_automations",
					"manage_users",
					"manage_clients",
					"manage_invites",
					"view_reports",
					"manage_settings",
					"view_logs",
					"api_access",
				],
				manager: [
					"view_dashboard",
					"manage_automations",
					"view_reports",
					"view_users",
				],
				user: ["view_dashboard", "view_automations", "limited_reports"],
				viewer: ["view_dashboard", "limited_reports"],
			};

			const userRole = user.profile.role;

			// Se o papel do usuário não existir nas definições
			if (!rolePermissions[userRole]) return false;

			// Verificar se a permissão está na lista para o papel do usuário
			return rolePermissions[userRole].includes(permission);
		} catch (error) {
			console.error("Erro ao verificar permissão:", error);
			return false;
		}
	}

	/**
	 * Métodos administrativos (apenas para administradores)
	 */

	/**
	 * Cria um convite para um novo usuário
	 * @param {Object} inviteData Dados do convite
	 * @returns {Promise<Object>} Convite criado
	 */
	async createInvite(inviteData) {
		try {
			const user = await this.getCurrentUser();
			if (!user || user.profile.role !== "admin") {
				throw new Error("Acesso negado");
			}

			// Gerar token único
			const token = crypto.randomUUID();
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

			const { data, error } = await supabase
				.from("invites")
				.insert([
					{
						email: inviteData.email,
						client_id: inviteData.client_id,
						role: inviteData.role || "user",
						invited_name: inviteData.name,
						invited_by: user.id,
						token: token,
						expires_at: expiresAt.toISOString(),
						status: "pending",
					},
				])
				.select()
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Erro ao criar convite:", error);
			throw error;
		}
	}

	/**
	 * Lista todos os convites
	 * @returns {Promise<Array>} Lista de convites
	 */
	async getInvites() {
		try {
			const user = await this.getCurrentUser();
			if (!user || user.profile.role !== "admin") {
				throw new Error("Acesso negado");
			}

			const { data, error } = await supabase
				.from("invites")
				.select(
					"*, clients(name), invited_by_user:user_profiles!invited_by(name)"
				)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Erro ao listar convites:", error);
			throw error;
		}
	}

	/**
	 * Cancela um convite
	 * @param {string} inviteId ID do convite
	 * @returns {Promise<void>}
	 */
	async cancelInvite(inviteId) {
		try {
			const user = await this.getCurrentUser();
			if (!user || user.profile.role !== "admin") {
				throw new Error("Acesso negado");
			}

			const { error } = await supabase
				.from("invites")
				.update({ status: "cancelled" })
				.eq("id", inviteId);

			if (error) throw error;
		} catch (error) {
			console.error("Erro ao cancelar convite:", error);
			throw error;
		}
	}

	/**
	 * Lista todos os clientes
	 * @returns {Promise<Array>} Lista de clientes
	 */
	async getClients() {
		try {
			const user = await this.getCurrentUser();
			if (!user || user.profile.role !== "admin") {
				throw new Error("Acesso negado");
			}

			const { data, error } = await supabase
				.from("clients")
				.select("*")
				.order("name");

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Erro ao listar clientes:", error);
			throw error;
		}
	}

	/**
	 * Cria um novo cliente
	 * @param {Object} clientData Dados do cliente
	 * @returns {Promise<Object>} Cliente criado
	 */
	async createClient(clientData) {
		try {
			const user = await this.getCurrentUser();
			if (!user || user.profile.role !== "admin") {
				throw new Error("Acesso negado");
			}

			const { data, error } = await supabase
				.from("clients")
				.insert([clientData])
				.select()
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Erro ao criar cliente:", error);
			throw error;
		}
	}

	/**
	 * Lista todas as solicitações de acesso
	 * @returns {Promise<Array>} Lista de solicitações
	 */
	async getAccessRequests() {
		try {
			const user = await this.getCurrentUser();
			if (!user || user.profile.role !== "admin") {
				throw new Error("Acesso negado");
			}

			const { data, error } = await supabase
				.from("access_requests")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Erro ao listar solicitações de acesso:", error);
			throw error;
		}
	}
}

// Exportar uma instância para uso mais fácil
export default new AuthService();
