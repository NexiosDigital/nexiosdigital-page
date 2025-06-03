import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredPermission = null }) => {
	const { user, loading, hasPermission } = useAuth();
	const [permissionChecked, setPermissionChecked] = useState(false);
	const [hasRequiredPermission, setHasRequiredPermission] = useState(true);

	useEffect(() => {
		const checkPermission = () => {
			console.log("🔐 ProtectedRoute - Verificando permissões...");
			console.log("👤 Usuário:", user?.email);
			console.log("🎯 Permissão necessária:", requiredPermission);
			console.log("👑 Role do usuário:", user?.profile?.role);

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

			// ✅ CORREÇÃO PRINCIPAL: Verificação direta sem async
			try {
				console.log("🔧 Verificando permissão com hasPermission...");

				// Verificar se hasPermission é uma função
				if (typeof hasPermission !== "function") {
					console.error(
						"❌ hasPermission não é uma função:",
						typeof hasPermission
					);

					// Fallback melhorado: verificar role e permissão específica
					const userRole = user.profile?.role;
					console.log(`⚠️ Usando fallback - Role: ${userRole}`);

					// Definir permissões de fallback
					const adminPermissions = [
						"admin_access",
						"view_dashboard",
						"manage_automations",
						"manage_users",
						"manage_clients",
						"manage_invites",
						"view_reports",
						"manage_settings",
						"view_logs",
					];

					const hasPermissionFallback =
						userRole === "admin" &&
						adminPermissions.includes(requiredPermission);
					console.log(
						`⚠️ Resultado do fallback para ${requiredPermission}:`,
						hasPermissionFallback
					);

					setHasRequiredPermission(hasPermissionFallback);
					setPermissionChecked(true);
					return;
				}

				// Usar a função hasPermission normalmente
				const result = hasPermission(requiredPermission);
				console.log(
					`✅ Resultado da verificação de permissão ${requiredPermission}:`,
					result
				);
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

				// Para admin_access, verificar se é admin
				if (requiredPermission === "admin_access") {
					setHasRequiredPermission(isAdmin);
				} else {
					setHasRequiredPermission(false);
				}
			} finally {
				setPermissionChecked(true);
			}
		};

		// Só verificar se o usuário foi carregado
		if (!loading && user) {
			checkPermission();
		} else if (!loading && !user) {
			// Usuário não autenticado
			setPermissionChecked(true);
			setHasRequiredPermission(false);
		}
	}, [user, requiredPermission, hasPermission, loading]);

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
			<div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white p-8">
				<div className="text-center max-w-md">
					<div className="mb-6">
						<i className="fas fa-shield-alt text-6xl text-red-500 mb-4"></i>
					</div>
					<h1 className="text-3xl font-bold mb-4 text-red-400">
						Acesso Negado
					</h1>
					<p className="mb-4 text-gray-300">
						Você não tem permissão para acessar esta página.
					</p>

					{/* Informações de Debug */}
					<div className="bg-gray-800 p-4 rounded-lg mb-6 text-left text-sm">
						<p className="mb-2">
							<strong>Permissão necessária:</strong> {requiredPermission}
						</p>
						<p className="mb-2">
							<strong>Sua role:</strong> {user.profile?.role}
						</p>
						<p className="mb-2">
							<strong>Email:</strong> {user.email}
						</p>
						<p className="mb-2">
							<strong>hasPermission disponível:</strong> {typeof hasPermission}
						</p>
					</div>

					<div className="space-y-3">
						<button
							onClick={() => (window.location.href = "/dashboard")}
							className="w-full px-6 py-3 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
						>
							<i className="fas fa-home mr-2"></i>
							Voltar para o Dashboard
						</button>

						<button
							onClick={() => window.location.reload()}
							className="w-full px-6 py-3 bg-gray-600 rounded-md hover:bg-gray-700 transition-colors"
						>
							<i className="fas fa-sync mr-2"></i>
							Recarregar Página
						</button>

						{user.profile?.role === "admin" && (
							<button
								onClick={() => {
									console.log("🔧 Forçando acesso como admin...");
									// Força a permissão para admin
									setHasRequiredPermission(true);
								}}
								className="w-full px-6 py-3 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
							>
								<i className="fas fa-key mr-2"></i>
								Forçar Acesso (Admin)
							</button>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Se tudo estiver ok, renderiza o conteúdo protegido
	console.log("✅ Acesso autorizado, renderizando conteúdo protegido");
	return children;
};

export default ProtectedRoute;
