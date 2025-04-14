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
	 * Registra um novo usuário
	 * @param {string} email Email do usuário
	 * @param {string} password Senha do usuário
	 * @param {Object} userData Dados adicionais do usuário
	 * @returns {Promise<Object>} Resultado do registro
	 */
	async registerUser(email, password, userData = {}) {
		try {
			// 1. Criar usuário na autenticação do Supabase
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email,
				password,
			});

			if (authError) throw authError;

			if (authData.user) {
				// 2. Adicionar dados extras na tabela de perfis
				const { error: profileError } = await supabase
					.from("user_profiles")
					.insert([
						{
							user_id: authData.user.id,
							name: userData.name || "",
							client_id: userData.client_id,
							role: userData.role || "user",
							is_active: true,
							preferences: userData.preferences || {},
						},
					]);

				if (profileError) {
					console.error("Erro ao criar perfil:", profileError);
					// Se falhar ao criar perfil, tentar excluir o usuário para manter consistência
					await supabase.auth.admin.deleteUser(authData.user.id);
					throw profileError;
				}

				return {
					user: authData.user,
					profile: {
						name: userData.name,
						client_id: userData.client_id,
						role: userData.role || "user",
					},
				};
			}
		} catch (error) {
			console.error("Erro ao registrar usuário:", error);
			throw error;
		}
	}

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
					"view_dashboard",
					"manage_automations",
					"manage_users",
					"view_reports",
					"manage_settings",
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
}

// Exportar uma instância para uso mais fácil
export default new AuthService();
