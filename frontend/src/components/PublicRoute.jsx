import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const PublicRoute = ({ children }) => {
	const { user, loading } = useAuth();

	useEffect(() => {
		console.log("🔍 PublicRoute - Verificando usuário:", {
			user: !!user,
			loading,
			userEmail: user?.email,
			userRole: user?.profile?.role,
		});

		// ⚠️ CORREÇÃO: Só redirecionar se realmente estiver autenticado E não estiver carregando
		if (user && !loading) {
			console.log("🔄 Usuário autenticado, redirecionando...");

			// Verificar papel do usuário para decidir o redirecionamento
			if (user.profile && user.profile.role === "admin") {
				console.log("👑 Admin detectado, redirecionando para /admin");
				window.location.href = "/admin";
			} else {
				console.log("👤 Usuário regular, redirecionando para /dashboard");
				window.location.href = "/dashboard";
			}
		}
	}, [user, loading]);

	// ⚠️ CORREÇÃO: Mostrar loading enquanto carrega
	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-900">
				<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	// ⚠️ CORREÇÃO: Só renderizar se NÃO estiver autenticado
	if (!user) {
		console.log("✅ Usuário não autenticado, renderizando rota pública");
		return children;
	}

	// ⚠️ CORREÇÃO: Se chegou aqui e tem usuário, não renderizar nada (será redirecionado)
	console.log("⏳ Usuário autenticado, aguardando redirecionamento...");
	return null;
};

export default PublicRoute;
