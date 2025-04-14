// src/components/Dashboard.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
	const { user, logout } = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
			window.location.href = "/login";
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
		}
	};

	return (
		<div className="bg-gray-900 text-white min-h-screen p-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-2xl font-bold">Dashboard do Cliente</h1>
					<button
						onClick={handleLogout}
						className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
					>
						Sair
					</button>
				</div>

				<div className="bg-gray-800 rounded-lg p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">
						Bem-vindo, {user?.profile?.name || "Usuário"}
					</h2>
					<p>Cliente: {user?.client?.name || "Empresa"}</p>
					<p>Nível de acesso: {user?.profile?.role || "usuário"}</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
					<div className="bg-gray-800 rounded-lg p-6">
						<h3 className="text-lg font-medium mb-2">Automações Ativas</h3>
						<p className="text-3xl font-bold text-blue-400">0</p>
					</div>
					<div className="bg-gray-800 rounded-lg p-6">
						<h3 className="text-lg font-medium mb-2">Execuções Hoje</h3>
						<p className="text-3xl font-bold text-green-400">0</p>
					</div>
					<div className="bg-gray-800 rounded-lg p-6">
						<h3 className="text-lg font-medium mb-2">Tempo Economizado</h3>
						<p className="text-3xl font-bold text-purple-400">0h</p>
					</div>
				</div>

				<div className="bg-gray-800 rounded-lg p-6">
					<h3 className="text-lg font-medium mb-4">
						Implementação em Progresso
					</h3>
					<p className="text-gray-400 mb-4">
						O dashboard completo está em desenvolvimento. Em breve você terá
						acesso a:
					</p>
					<ul className="list-disc pl-5 space-y-2 text-gray-400">
						<li>Visualização e gerenciamento de automações</li>
						<li>Estatísticas detalhadas de execução</li>
						<li>Gráficos de desempenho</li>
						<li>Configurações personalizadas</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
