import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth deve ser usado dentro de um AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children, authService }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				console.log("🔍 Verificando autenticação...");

				if (!authService) {
					console.log("❌ AuthService não disponível");
					setLoading(false);
					return;
				}

				const session = await authService.getSession();
				console.log("📋 Sessão encontrada:", !!session);

				if (session && session.user) {
					console.log("👤 Usuário na sessão:", session.user.email);

					const currentUser = await authService.getCurrentUser();
					console.log("📊 Dados do usuário:", currentUser);

					if (currentUser) {
						setUser(currentUser);
						console.log("✅ Usuário autenticado:", currentUser.email);
					} else {
						console.log("❌ Falha ao obter dados do usuário");
						setUser(null);
					}
				} else {
					console.log("❌ Nenhuma sessão válida encontrada");
					setUser(null);
				}
			} catch (err) {
				console.error("❌ Erro ao verificar autenticação:", err);
				setError(err);
				setUser(null);
			} finally {
				setLoading(false);
				console.log("✅ Verificação de autenticação concluída");
			}
		};

		checkAuth();
	}, [authService]);

	const login = async (email, password) => {
		try {
			setLoading(true);
			setError(null);
			console.log("🔐 Tentando fazer login:", email);

			const result = await authService.login(email, password);
			console.log("✅ Login bem-sucedido:", result.user.email);

			setUser(result.user);
			return result.user;
		} catch (err) {
			console.error("❌ Erro no login:", err);
			setError(err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		try {
			setLoading(true);
			console.log("🚪 Fazendo logout...");

			await authService.logout();
			setUser(null);
			setError(null);

			console.log("✅ Logout concluído");
		} catch (err) {
			console.error("❌ Erro no logout:", err);
			setError(err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const hasPermission = async (permission) => {
		try {
			console.log(
				"🔐 Verificando permissão:",
				permission,
				"para usuário:",
				user?.email
			);

			// Se não há usuário, não tem permissão
			if (!user) {
				console.log("❌ Usuário não autenticado, negando permissão");
				return false;
			}

			// Se não há authService, não pode verificar
			if (!authService || !authService.hasPermission) {
				console.log(
					"⚠️ AuthService.hasPermission não disponível, verificando role diretamente"
				);

				// Fallback: verificar role diretamente
				const userRole = user.profile?.role;
				console.log("👤 Role do usuário:", userRole);

				// Definir permissões básicas por role
				const rolePermissions = {
					admin: [
						"admin_access", // ← ESTA É A PERMISSÃO QUE ESTAVA FALTANDO!
						"view_dashboard",
						"manage_automations",
						"manage_users",
						"manage_clients",
						"manage_invites",
						"view_reports",
						"manage_settings",
						"view_logs",
						"api_access",
						"system_admin", // Permissão extra para admin
						"full_access", // Permissão total
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

				const permissions = rolePermissions[userRole] || [];
				const hasPermission = permissions.includes(permission);

				console.log(
					`✅ Permissão ${permission} para role ${userRole}:`,
					hasPermission
				);
				return hasPermission;
			}

			// Usar o authService se disponível
			const result = await authService.hasPermission(permission);
			console.log(
				`✅ Resultado da verificação de permissão ${permission}:`,
				result
			);
			return result;
		} catch (error) {
			console.error("❌ Erro ao verificar permissão:", error);
			return false;
		}
	};

	const updateProfile = async (userData) => {
		try {
			setLoading(true);
			const updatedProfile = await authService.updateUserProfile(userData);
			setUser((current) => ({
				...current,
				profile: {
					...current.profile,
					...updatedProfile,
				},
			}));
			return updatedProfile;
		} catch (err) {
			setError(err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const resetPassword = async (email) => {
		try {
			setLoading(true);
			await authService.resetPassword(email);
		} catch (err) {
			setError(err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const confirmPasswordReset = async (newPassword) => {
		try {
			setLoading(true);
			await authService.confirmPasswordReset(newPassword);
		} catch (err) {
			setError(err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const value = {
		user,
		loading,
		error,
		login,
		logout,
		updateProfile,
		hasPermission,
		resetPassword,
		confirmPasswordReset,
		setUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContext;
