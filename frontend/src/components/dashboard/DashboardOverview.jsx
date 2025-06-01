import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const DashboardOverview = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState({
		totalAutomations: 0,
		activeAutomations: 0,
		executionsToday: 0,
		timeSaved: 0,
	});
	const [recentActivity, setRecentActivity] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		try {
			setLoading(true);

			// Simular carregamento de dados (substituir por chamadas reais à API)
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Dados simulados
			setStats({
				totalAutomations: 12,
				activeAutomations: 8,
				executionsToday: 45,
				timeSaved: 120, // em minutos
			});

			setRecentActivity([
				{
					id: 1,
					type: "automation",
					title: "Processamento de Documentos executado",
					time: "5 min atrás",
					status: "success",
					icon: "fas fa-robot",
				},
				{
					id: 2,
					type: "automation",
					title: "Automação de Email Marketing iniciada",
					time: "15 min atrás",
					status: "running",
					icon: "fas fa-envelope",
				},
				{
					id: 3,
					type: "user",
					title: "Novo usuário adicionado à equipe",
					time: "1 hora atrás",
					status: "info",
					icon: "fas fa-user-plus",
				},
				{
					id: 4,
					type: "automation",
					title: "Sync de Dados concluído",
					time: "2 horas atrás",
					status: "success",
					icon: "fas fa-sync",
				},
			]);
		} catch (error) {
			console.error("Erro ao carregar dados do dashboard:", error);
		} finally {
			setLoading(false);
		}
	};

	const formatTime = (minutes) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m`;
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "success":
				return "var(--success)";
			case "running":
				return "var(--warning)";
			case "error":
				return "var(--error)";
			default:
				return "var(--accent)";
		}
	};

	if (loading) {
		return (
			<div className="dashboard-overview">
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<p>Carregando dados...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="dashboard-overview">
			{/* Header de Boas-vindas */}
			<div className="welcome-section">
				<h1>Bem-vindo, {user?.profile?.name}!</h1>
				<p>Aqui está um resumo das suas automações e atividades recentes.</p>
			</div>

			{/* Cards de Estatísticas */}
			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-icon">
						<i className="fas fa-robot"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.totalAutomations}</div>
						<div className="stat-label">Total de Automações</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon active">
						<i className="fas fa-play-circle"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.activeAutomations}</div>
						<div className="stat-label">Automações Ativas</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon executions">
						<i className="fas fa-bolt"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.executionsToday}</div>
						<div className="stat-label">Execuções Hoje</div>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon time">
						<i className="fas fa-clock"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{formatTime(stats.timeSaved)}</div>
						<div className="stat-label">Tempo Economizado</div>
					</div>
				</div>
			</div>

			{/* Seção de Conteúdo Principal */}
			<div className="main-content-grid">
				{/* Atividades Recentes */}
				<div className="dashboard-card">
					<div className="card-header">
						<h3 className="card-title">
							<i className="fas fa-history"></i>
							Atividade Recente
						</h3>
						<button className="btn btn-secondary btn-sm">Ver Todas</button>
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
										{activity.status === "running" && (
											<i className="fas fa-spinner fa-spin"></i>
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

				{/* Automações em Destaque */}
				<div className="dashboard-card">
					<div className="card-header">
						<h3 className="card-title">
							<i className="fas fa-star"></i>
							Automações em Destaque
						</h3>
						<button className="btn btn-secondary btn-sm">Gerenciar</button>
					</div>
					<div className="card-content">
						<div className="featured-automations">
							<div className="automation-item">
								<div className="automation-info">
									<div className="automation-name">
										Processamento de Documentos
									</div>
									<div className="automation-desc">
										Automatiza análise de PDFs
									</div>
								</div>
								<div className="automation-stats">
									<span className="execution-count">25 execuções</span>
									<span className="success-rate">98% sucesso</span>
								</div>
							</div>

							<div className="automation-item">
								<div className="automation-info">
									<div className="automation-name">Email Marketing</div>
									<div className="automation-desc">
										Envio automático de campanhas
									</div>
								</div>
								<div className="automation-stats">
									<span className="execution-count">12 execuções</span>
									<span className="success-rate">100% sucesso</span>
								</div>
							</div>

							<div className="automation-item">
								<div className="automation-info">
									<div className="automation-name">Sync de Dados</div>
									<div className="automation-desc">Sincronização com CRM</div>
								</div>
								<div className="automation-stats">
									<span className="execution-count">8 execuções</span>
									<span className="success-rate">95% sucesso</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Ações Rápidas */}
			<div className="quick-actions">
				<h3>Ações Rápidas</h3>
				<div className="actions-grid">
					<button className="action-card">
						<i className="fas fa-plus"></i>
						<span>Nova Automação</span>
					</button>
					<button className="action-card">
						<i className="fas fa-chart-bar"></i>
						<span>Ver Relatórios</span>
					</button>
					<button className="action-card">
						<i className="fas fa-headset"></i>
						<span>Suporte</span>
					</button>
					<button className="action-card">
						<i className="fas fa-cog"></i>
						<span>Configurações</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default DashboardOverview;
