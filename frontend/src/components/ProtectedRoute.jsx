import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

// Componente para rotas protegidas
const ProtectedRoute = ({ children, requiredPermission = null }) => {
	const { user, loading, hasPermission } = useAuth();
	const [permissionChecked, setPermissionChecked] = useState(false);
	const [hasRequiredPermission, setHasRequiredPermission] = useState(true);

	useEffect(() => {
		// Se não precisar verificar permissão específica
		if (!requiredPermission) {
			setPermissionChecked(true);
			return;
		}

		// Verificar permissão específica quando necessário
		const checkPermission = async () => {
			const result = await hasPermission(requiredPermission);
			setHasRequiredPermission(result);
			setPermissionChecked(true);
		};

		if (user && !permissionChecked) {
			checkPermission();
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
		// Redirecionar para login
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
	return children;
};

export default ProtectedRoute;
