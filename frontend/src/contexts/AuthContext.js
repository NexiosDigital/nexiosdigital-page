// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

// Cria o contexto de autenticação
const AuthContext = createContext(null);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth deve ser usado dentro de um AuthProvider");
	}
	return context;
};

// Provedor de autenticação para envolver a aplicação
export const AuthProvider = ({ children, authService }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Verificar autenticação ao carregar
	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Tenta recuperar a sessão e usuário atual
				const session = await authService.getSession();
				if (session) {
					const currentUser = await authService.getCurrentUser();
					setUser(currentUser);
				}
			} catch (err) {
				console.error("Erro ao verificar autenticação:", err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, [authService]);

	// Função para fazer login
	const login = async (email, password) => {
		try {
			setLoading(true);
			const { user } = await authService.login(email, password);
			setUser(user);
			return user;
		} catch (err) {
			setError(err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Função para fazer logout
	const logout = async () => {
		try {
			setLoading(true);
			await authService.logout();
			setUser(null);
		} catch (err) {
			setError(err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Função para registrar um novo usuário
	const register = async (email, password, userData) => {
		try {
			setLoading(true);
			const result = await authService.registerUser(email, password, userData);
			return result;
		} catch (err) {
			setError(err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Função para atualizar o perfil do usuário
	const updateProfile = async (userData) => {
		try {
			setLoading(true);
			const updatedProfile = await authService.updateUserProfile(userData);

			// Atualiza o usuário local com os novos dados
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

	// Função para verificar permissões
	const hasPermission = async (permission) => {
		return await authService.hasPermission(permission);
	};

	// Função para solicitar redefinição de senha
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

	// Função para confirmar redefinição de senha
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

	// Valor do contexto
	const value = {
		user,
		loading,
		error,
		login,
		logout,
		register,
		updateProfile,
		hasPermission,
		resetPassword,
		confirmPasswordReset,
		setUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
