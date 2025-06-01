import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Componente para rotas públicas (login, registro, etc.)
 * Redireciona usuários já autenticados para o dashboard
 */
const PublicRoute = ({ children }) => {
	const { user, loading } = useAuth();

	useEffect(() => {
		// Se o usuário já estiver autenticado, redireciona para o dashboard
		if (user && !loading) {
			// Verifica se é admin para redirecionar para painel correto
			if (user.profile && user.profile.role === "admin") {
				window.location.href = "/admin";
			} else {
				window.location.href = "/dashboard";
			}
		}
	}, [user, loading]);

	// Se estiver carregando, exibe loading
	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-900">
				<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	// Se não estiver autenticado, renderiza o conteúdo da rota pública
	if (!user) {
		return children;
	}

	// Se estiver autenticado, não renderiza nada (será redirecionado)
	return null;
};

export default PublicRoute;
