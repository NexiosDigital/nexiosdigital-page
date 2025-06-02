import React, { useState, useEffect } from "react";

const SystemLogs = () => {
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all");

	useEffect(() => {
		loadLogs();
	}, []);

	const loadLogs = async () => {
		try {
			setLoading(true);
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Dados simulados de logs
			setLogs([
				{
					id: 1,
					type: "auth",
					level: "info",
					message: "Usuário joao@techcorp.com fez login",
					timestamp: "2024-01-20T10:30:00Z",
					user_id: "user123",
					ip_address: "192.168.1.100",
				},
				{
					id: 2,
					type: "admin",
					level: "info",
					message: "Novo cliente 'TechCorp' criado",
					timestamp: "2024-01-20T10:25:00Z",
					user_id: "admin1",
					ip_address: "192.168.1.50",
				},
				{
					id: 3,
					type: "error",
					level: "error",
					message: "Falha na conexão com banco de dados",
					timestamp: "2024-01-20T10:20:00Z",
					user_id: null,
					ip_address: "server",
				},
				{
					id: 4,
					type: "security",
					level: "warning",
					message: "Tentativa de login falhada para admin@test.com",
					timestamp: "2024-01-20T10:15:00Z",
					user_id: null,
					ip_address: "192.168.1.200",
				},
			]);
		} catch (error) {
			console.error("Erro ao carregar logs:", error);
		} finally {
			setLoading(false);
		}
	};

	const getLevelColor = (level) => {
		switch (level) {
			case "error":
				return "var(--error)";
			case "warning":
				return "var(--warning)";
			case "info":
				return "var(--success)";
			default:
				return "var(--text-secondary)";
		}
	};

	const getLevelIcon = (level) => {
		switch (level) {
			case "error":
				return "fas fa-exclamation-circle";
			case "warning":
				return "fas fa-exclamation-triangle";
			case "info":
				return "fas fa-info-circle";
			default:
				return "fas fa-circle";
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString("pt-BR");
	};

	const filteredLogs = logs.filter((log) => {
		if (filter === "all") return true;
		return log.level === filter || log.type === filter;
	});

	if (loading) {
		return (
			<div className="system-logs">
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<p>Carregando logs...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="system-logs">
			<div className="page-header">
				<div className="header-content">
					<h1>Logs do Sistema</h1>
					<p>Monitore atividades e eventos do sistema</p>
				</div>
				<div className="header-actions">
					<button className="btn btn-secondary">
						<i className="fas fa-download"></i>
						Exportar
					</button>
				</div>
			</div>

			{/* Filtros */}
			<div className="filters-section">
				<div className="filter-tabs">
					<button
						className={`filter-tab ${filter === "all" ? "active" : ""}`}
						onClick={() => setFilter("all")}
					>
						Todos ({logs.length})
					</button>
					<button
						className={`filter-tab ${filter === "error" ? "active" : ""}`}
						onClick={() => setFilter("error")}
					>
						Erros ({logs.filter((l) => l.level === "error").length})
					</button>
					<button
						className={`filter-tab ${filter === "warning" ? "active" : ""}`}
						onClick={() => setFilter("warning")}
					>
						Avisos ({logs.filter((l) => l.level === "warning").length})
					</button>
					<button
						className={`filter-tab ${filter === "auth" ? "active" : ""}`}
						onClick={() => setFilter("auth")}
					>
						Autenticação ({logs.filter((l) => l.type === "auth").length})
					</button>
				</div>
			</div>

			{/* Lista de Logs */}
			<div className="logs-container">
				{filteredLogs.map((log) => (
					<div key={log.id} className="log-item">
						<div className="log-indicator">
							<i
								className={getLevelIcon(log.level)}
								style={{ color: getLevelColor(log.level) }}
							></i>
						</div>
						<div className="log-content">
							<div className="log-message">{log.message}</div>
							<div className="log-meta">
								<span className="log-timestamp">
									{formatDate(log.timestamp)}
								</span>
								{log.user_id && (
									<span className="log-user">Usuário: {log.user_id}</span>
								)}
								<span className="log-ip">IP: {log.ip_address}</span>
								<span className={`log-type ${log.type}`}>{log.type}</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{filteredLogs.length === 0 && (
				<div className="empty-state">
					<div className="empty-icon">
						<i className="fas fa-list-alt"></i>
					</div>
					<h3>Nenhum log encontrado</h3>
					<p>Não há logs que correspondam aos filtros selecionados.</p>
				</div>
			)}
		</div>
	);
};

export default SystemLogs;
