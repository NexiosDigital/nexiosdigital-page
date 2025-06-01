import React, { useState, useEffect } from "react";

const AdminOverview = () => {
	const [stats, setStats] = useState({
		totalClients: 0,
		totalUsers: 0,
		activeAutomations: 0,
		pendingInvites: 0,
		totalExecutions: 0,
		systemUptime: "99.9%",
	});
	const [recentActivity, setRecentActivity] = useState([]);
	const [systemHealth, setSystemHealth] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadAdminData();
	}, []);

	const loadAdminData = async () => {
		try {
			setLoading(true);

			// Simular carregamento de dados
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Dados simulados
			setStats({
				totalClients: 15,
				totalUsers: 47,
				activeAutomations: 89,
				pendingInvites: 3,
				totalExecutions: 2450,
				systemUptime: "99.9%",
			});

			setRecentActivity([
				{
					id: 1,
					type: "user",
					title: "Novo usuário registrado: João Silva",
					time: "5 min atrás",
					status: "success",
					icon: "fas fa-user-plus",
				},
				{
					id: 2,
					type: "client",
					title: "Cliente TechCorp ativado",
					time: "15 min atrás",
					status: "success",
					icon: "fas fa-building",
				},
				{
					id: 3,
					type: "invite",
					title: "Convite enviado para maria@example.com",
					time: "30 min atrás",
					status: "info",
					icon: "fas fa-envelope-open",
				},
				{
					id: 4,
					type: "automation",
					title: "Automação crítica falhou em ClienteX",
					time: "1 hora atrás",
					status: "error",
					icon: "fas fa-exclamation-triangle",
				},
			]);

			setSystemHealth([
				{
					service: "API Principal",
					status: "healthy",
					uptime: "99.9%",
					lastCheck: "2 min atrás",
				},
				{
					service: "Banco de Dados",
					status: "healthy",
					uptime: "100%",
					lastCheck: "1 min atrás",
				},
				{
					service: "Processamento N8N",
					status: "healthy",
					uptime: "98.7%",
					lastCheck: "30 seg atrás",
				},
				{
					service: "Email Service",
					status: "warning",
					uptime: "95.2%",
					lastCheck: "5 min atrás",
				},
			]);
		} catch (error) {
			console.error("Erro ao carregar dados do admin:", error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "success":
			case "healthy":
				return "var(--success)";
			case "warning":
				return "var(--warning)";
			case "error":
			case "critical":
				return "var(--error)";
			default:
				return "var(--accent)";
		}
	};

	const getHealthIcon = (status) => {
		switch (status) {
			case "healthy":
				return "fas fa-check-circle";
			case "warning":
				return "fas fa-exclamation-triangle";
			case "critical":
				return "fas fa-times-circle";
			default:
				return "fas fa-question-circle";
		}
	};

	if (loading) {
		return (
			<div className="admin-overview">
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<p>Carregando dados do sistema...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="admin-overview">
			{/* Header */}
			<div className="admin-header-section">
				<h1>Painel Administrativo</h1>
				<p>Monitor geral do sistema e estatísticas da plataforma</p>
			</div>

			{/* Estatísticas Principais */}
			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-icon clients">
						<i className="fas fa-building"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.totalClients}</div>
						<div className="stat-label">Clientes Ativos</div>
					</div>
					<div className="stat-trend positive">
						<i className="fas fa-arrow-up"></i> +12%
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon users">
						<i className="fas fa-users"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.totalUsers}</div>
						<div className="stat-label">Usuários Totais</div>
					</div>
					<div className="stat-trend positive">
						<i className="fas fa-arrow-up"></i> +8%
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon automations">
						<i className="fas fa-robot"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.activeAutomations}</div>
						<div className="stat-label">Automações Ativas</div>
					</div>
					<div className="stat-trend positive">
						<i className="fas fa-arrow-up"></i> +15%
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon invites">
						<i className="fas fa-envelope-open"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.pendingInvites}</div>
						<div className="stat-label">Convites Pendentes</div>
					</div>
					<div className="stat-trend neutral">
						<i className="fas fa-minus"></i> 0%
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon executions">
						<i className="fas fa-bolt"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">
							{stats.totalExecutions.toLocaleString()}
						</div>
						<div className="stat-label">Execuções Totais</div>
					</div>
					<div className="stat-trend positive">
						<i className="fas fa-arrow-up"></i> +25%
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon uptime">
						<i className="fas fa-server"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.systemUptime}</div>
						<div className="stat-label">Uptime do Sistema</div>
					</div>
					<div className="stat-trend positive">
						<i className="fas fa-check"></i> Excelente
					</div>
				</div>
			</div>

			{/* Conteúdo Principal */}
			<div className="admin-main-content">
				{/* Saúde do Sistema */}
				<div className="admin-card">
					<div className="card-header">
						<h3 className="card-title">
							<i className="fas fa-heartbeat"></i>
							Saúde do Sistema
						</h3>
						<button className="btn btn-secondary btn-sm">
							<i className="fas fa-sync"></i>
							Atualizar
						</button>
					</div>
					<div className="card-content">
						<div className="system-health-list">
							{systemHealth.map((service, index) => (
								<div key={index} className="health-item">
									<div className="health-status">
										<i
											className={getHealthIcon(service.status)}
											style={{ color: getStatusColor(service.status) }}
										></i>
									</div>
									<div className="health-info">
										<div className="service-name">{service.service}</div>
										<div className="service-details">
											Uptime: {service.uptime} • Última verificação:{" "}
											{service.lastCheck}
										</div>
									</div>
									<div className={`health-badge ${service.status}`}>
										{service.status === "healthy"
											? "Saudável"
											: service.status === "warning"
											? "Atenção"
											: "Crítico"}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Atividade Recente */}
				<div className="admin-card">
					<div className="card-header">
						<h3 className="card-title">
							<i className="fas fa-history"></i>
							Atividade Recente
						</h3>
						<button className="btn btn-secondary btn-sm">
							Ver Logs Completos
						</button>
					</div>
					<div className="card-content">
						<div className="activity-list">
							{recentActivity.map((activity) => (
								<div key={activity.id} className="activity-item">
									<div
										className="activity-icon"
										style={{ backgroundColor: getStatusColor(activity.status) }}
									>
										<i className={activity.icon}></i>
									</div>
									<div className="activity-content">
										<div className="activity-title">{activity.title}</div>
										<div className="activity-time">{activity.time}</div>
									</div>
									<div className={`activity-status ${activity.status}`}>
										{activity.status === "success" && (
											<i className="fas fa-check-circle"></i>
										)}
										{activity.status === "error" && (
											<i className="fas fa-exclamation-circle"></i>
										)}
										{activity.status === "info" && (
											<i className="fas fa-info-circle"></i>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Ações Rápidas de Admin */}
			<div className="admin-quick-actions">
				<h3>Ações Administrativas</h3>
				<div className="actions-grid">
					<button className="action-card">
						<i className="fas fa-user-plus"></i>
						<span>Criar Usuário</span>
					</button>
					<button className="action-card">
						<i className="fas fa-building"></i>
						<span>Novo Cliente</span>
					</button>
					<button className="action-card">
						<i className="fas fa-envelope"></i>
						<span>Enviar Convite</span>
					</button>
					<button className="action-card">
						<i className="fas fa-chart-bar"></i>
						<span>Relatórios</span>
					</button>
					<button className="action-card">
						<i className="fas fa-cogs"></i>
						<span>Configurações</span>
					</button>
					<button className="action-card">
						<i className="fas fa-download"></i>
						<span>Backup</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default AdminOverview;
