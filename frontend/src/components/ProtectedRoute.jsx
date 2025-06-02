import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredPermission = null }) => {
	const { user, loading, hasPermission } = useAuth();
	const [permissionChecked, setPermissionChecked] = useState(false);
	const [hasRequiredPermission, setHasRequiredPermission] = useState(true);

	useEffect(() => {
		const checkPermission = async () => {
			console.log("🔐 ProtectedRoute - Verificando permissões...");
			console.log("👤 Usuário:", user?.email);
			console.log("🎯 Permissão necessária:", requiredPermission);

			// Se não precisar verificar permissão específica
			if (!requiredPermission) {
				console.log("✅ Nenhuma permissão específica necessária");
				setPermissionChecked(true);
				setHasRequiredPermission(true);
				return;
			}

			// Se não há usuário, não tem permissão
			if (!user) {
				console.log("❌ Usuário não autenticado");
				setPermissionChecked(true);
				setHasRequiredPermission(false);
				return;
			}

			try {
				// ✅ CORREÇÃO: Verificar se hasPermission é uma função
				if (typeof hasPermission !== "function") {
					console.error(
						"❌ hasPermission não é uma função:",
						typeof hasPermission
					);

					// Fallback: verificar role diretamente
					const userRole = user.profile?.role;
					const isAdmin = userRole === "admin";
					console.log(`⚠️ Fallback - Role: ${userRole}, É admin?`, isAdmin);

					setHasRequiredPermission(isAdmin);
					setPermissionChecked(true);
					return;
				}

				const result = await hasPermission(requiredPermission);
				console.log(`✅ Resultado da verificação de permissão:`, result);
				setHasRequiredPermission(result);
			} catch (error) {
				console.error("❌ Erro ao verificar permissão:", error);

				// Fallback em caso de erro
				const userRole = user.profile?.role;
				const isAdmin = userRole === "admin";
				console.log(
					`⚠️ Erro - Fallback para role: ${userRole}, É admin?`,
					isAdmin
				);
				setHasRequiredPermission(isAdmin);
			} finally {
				setPermissionChecked(true);
			}
		};

		if (user && !permissionChecked) {
			checkPermission();
		} else if (!user) {
			setPermissionChecked(true);
			setHasRequiredPermission(false);
		}
	}, [user, requiredPermission, hasPermission, permissionChecked]);

	// Se estiver carregando, exibe loading
	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-900">
				<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	// Se não estiver autenticado, redireciona para login
	if (!user) {
		console.log("🔄 Redirecionando para login...");
		window.location.href = "/login";
		return null;
	}

	// Se precisar verificar permissão específica
	if (requiredPermission && !permissionChecked) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-900">
				<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	// Se não tiver a permissão necessária
	if (requiredPermission && !hasRequiredPermission) {
		return (
			<div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
				<h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
				<p className="mb-6">Você não tem permissão para acessar esta página.</p>
				<p className="mb-6">Permissão necessária: {requiredPermission}</p>
				<p className="mb-6">Sua role: {user.profile?.role}</p>
				<button
					onClick={() => (window.location.href = "/dashboard")}
					className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
				>
					Voltar para o Dashboard
				</button>
			</div>
		);
	}

	// Se tudo estiver ok, renderiza o conteúdo protegido
	console.log("✅ Acesso autorizado, renderizando conteúdo protegido");
	return children;
};

export default ProtectedRoute;
