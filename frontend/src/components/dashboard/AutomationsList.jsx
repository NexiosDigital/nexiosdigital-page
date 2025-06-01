import React, { useState, useEffect } from "react";

const AutomationsList = () => {
	const [automations, setAutomations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all");

	useEffect(() => {
		loadAutomations();
	}, []);

	const loadAutomations = async () => {
		try {
			setLoading(true);

			// Simular carregamento de dados
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Dados simulados
			setAutomations([
				{
					id: 1,
					name: "Processamento de Documentos",
					description: "Automatiza a análise e processamento de documentos PDF",
					status: "active",
					type: "document_processing",
					lastExecution: "2024-01-20T10:30:00Z",
					executionCount: 125,
					successRate: 98.4,
					createdAt: "2024-01-01T00:00:00Z",
				},
				{
					id: 2,
					name: "Email Marketing Automation",
					description:
						"Envio automático de campanhas de email baseado em triggers",
					status: "active",
					type: "email_automation",
					lastExecution: "2024-01-20T09:15:00Z",
					executionCount: 89,
					successRate: 100,
					createdAt: "2024-01-05T00:00:00Z",
				},
				{
					id: 3,
					name: "Sync CRM",
					description: "Sincronização de dados entre sistemas CRM",
					status: "inactive",
					type: "data_sync",
					lastExecution: "2024-01-19T16:45:00Z",
					executionCount: 45,
					successRate: 95.6,
					createdAt: "2024-01-10T00:00:00Z",
				},
				{
					id: 4,
					name: "Lead Generation",
					description: "Captura e qualificação automática de leads",
					status: "active",
					type: "lead_generation",
					lastExecution: "2024-01-20T11:00:00Z",
					executionCount: 67,
					successRate: 92.5,
					createdAt: "2024-01-15T00:00:00Z",
				},
			]);
		} catch (error) {
			console.error("Erro ao carregar automações:", error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "var(--success)";
			case "inactive":
				return "var(--warning)";
			case "error":
				return "var(--error)";
			default:
				return "var(--text-secondary)";
		}
	};

	const getTypeIcon = (type) => {
		switch (type) {
			case "document_processing":
				return "fas fa-file-alt";
			case "email_automation":
				return "fas fa-envelope";
			case "data_sync":
				return "fas fa-sync";
			case "lead_generation":
				return "fas fa-user-plus";
			default:
				return "fas fa-robot";
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString("pt-BR");
	};

	const filteredAutomations = automations.filter((automation) => {
		if (filter === "all") return true;
		return automation.status === filter;
	});

	if (loading) {
		return (
			<div className="automations-list">
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<p>Carregando automações...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="automations-list">
			{/* Header */}
			<div className="page-header">
				<div className="header-content">
					<h1>Minhas Automações</h1>
					<p>Gerencie e monitore suas automações ativas</p>
				</div>
				<div className="header-actions">
					<button className="btn btn-primary">
						<i className="fas fa-plus"></i>
						Nova Automação
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
						Todas ({automations.length})
					</button>
					<button
						className={`filter-tab ${filter === "active" ? "active" : ""}`}
						onClick={() => setFilter("active")}
					>
						Ativas ({automations.filter((a) => a.status === "active").length})
					</button>
					<button
						className={`filter-tab ${filter === "inactive" ? "active" : ""}`}
						onClick={() => setFilter("inactive")}
					>
						Inativas (
						{automations.filter((a) => a.status === "inactive").length})
					</button>
				</div>
			</div>

			{/* Lista de Automações */}
			<div className="automations-grid">
				{filteredAutomations.map((automation) => (
					<div key={automation.id} className="automation-card">
						<div className="card-header">
							<div className="automation-icon">
								<i className={getTypeIcon(automation.type)}></i>
							</div>
							<div className="automation-info">
								<h3 className="automation-name">{automation.name}</h3>
								<p className="automation-description">
									{automation.description}
								</p>
							</div>
							<div className="automation-status">
								<span
									className={`status-badge ${automation.status}`}
									style={{
										backgroundColor: `${getStatusColor(automation.status)}20`,
										color: getStatusColor(automation.status),
									}}
								>
									{automation.status === "active" ? "Ativa" : "Inativa"}
								</span>
							</div>
						</div>

						<div className="card-stats">
							<div className="stat-item">
								<span className="stat-label">Execuções</span>
								<span className="stat-value">{automation.executionCount}</span>
							</div>
							<div className="stat-item">
								<span className="stat-label">Taxa de Sucesso</span>
								<span className="stat-value">{automation.successRate}%</span>
							</div>
							<div className="stat-item">
								<span className="stat-label">Última Execução</span>
								<span className="stat-value">
									{formatDate(automation.lastExecution)}
								</span>
							</div>
						</div>

						<div className="card-actions">
							<button className="btn btn-secondary btn-sm">
								<i className="fas fa-eye"></i>
								Ver Detalhes
							</button>
							<button className="btn btn-secondary btn-sm">
								<i className="fas fa-play"></i>
								Executar
							</button>
							<button className="btn btn-secondary btn-sm">
								<i className="fas fa-cog"></i>
								Configurar
							</button>
						</div>
					</div>
				))}
			</div>

			{filteredAutomations.length === 0 && (
				<div className="empty-state">
					<div className="empty-icon">
						<i className="fas fa-robot"></i>
					</div>
					<h3>Nenhuma automação encontrada</h3>
					<p>
						{filter === "all"
							? "Você ainda não tem automações criadas."
							: `Não há automações com status "${filter}".`}
					</p>
					<button className="btn btn-primary">
						<i className="fas fa-plus"></i>
						Criar Primeira Automação
					</button>
				</div>
			)}
		</div>
	);
};

export default AutomationsList;
