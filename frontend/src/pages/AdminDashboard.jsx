// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import AuthService from "../services/AuthService";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState("overview");
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState({
		pendingApprovals: [],
		invites: [],
		clients: [],
		stats: {},
	});

	// Estados para modais
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [newInvite, setNewInvite] = useState({
		email: "",
		clientName: "",
		expiresInHours: 168, // 7 dias
	});

	// Carregar dados iniciais
	useEffect(() => {
		loadData();
	}, [activeTab]);

	const loadData = async () => {
		setLoading(true);
		try {
			const [pendingApprovals, invites, clients] = await Promise.all([
				AuthService.getPendingApprovals(),
				AuthService.getInvites(),
				AuthService.getAllClients(),
			]);

			setData({
				pendingApprovals,
				invites,
				clients,
				stats: {
					totalClients: clients.length,
					activeClients: clients.filter((c) => c.active).length,
					pendingApprovals: pendingApprovals.length,
					totalInvites: invites.length,
				},
			});
		} catch (error) {
			console.error("Erro ao carregar dados:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateInvite = async (e) => {
		e.preventDefault();
		try {
			const result = await AuthService.createInvite(
				newInvite.email,
				newInvite.clientName,
				newInvite.expiresInHours
			);

			// Copiar link do convite para clipboard
			const inviteUrl = `${window.location.origin}/register?token=${result.token}`;
			await navigator.clipboard.writeText(inviteUrl);

			alert(
				`Convite criado! Link copiado para área de transferência:\n${inviteUrl}`
			);

			setShowInviteModal(false);
			setNewInvite({ email: "", clientName: "", expiresInHours: 168 });
			loadData();
		} catch (error) {
			alert("Erro ao criar convite: " + error.message);
		}
	};

	const handleApproveClient = async (clientId) => {
		if (
			window.confirm(
				"Aprovar este cliente? Isso ativará a conta e permitirá o acesso."
			)
		) {
			try {
				await AuthService.approveClient(clientId);
				alert("Cliente aprovado com sucesso!");
				loadData();
			} catch (error) {
				alert("Erro ao aprovar cliente: " + error.message);
			}
		}
	};

	const handleRejectClient = async (clientId) => {
		const reason = window.prompt("Motivo da rejeição (opcional):");
		if (reason !== null) {
			// null = cancelou
			try {
				await AuthService.rejectClient(clientId, reason);
				alert("Cliente rejeitado e dados removidos.");
				loadData();
			} catch (error) {
				alert("Erro ao rejeitar cliente: " + error.message);
			}
		}
	};

	if (user?.userType !== "system_admin") {
		return (
			<div className="admin-dashboard">
				<div className="access-denied">
					<h1>Acesso Negado</h1>
					<p>Você não tem permissão para acessar esta área.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="admin-dashboard">
			<div className="admin-header">
				<h1>Painel Administrativo</h1>
				<div className="admin-user-info">
					<span>Olá, {user.profile.name}</span>
					<span className="user-role">{user.profile.role}</span>
				</div>
			</div>

			{/* Estatísticas */}
			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-icon">
						<i className="fas fa-building"></i>
					</div>
					<div className="stat-content">
						<h3>{data.stats.totalClients}</h3>
						<p>Total de Clientes</p>
					</div>
				</div>
				<div className="stat-card">
					<div className="stat-icon active">
						<i className="fas fa-check-circle"></i>
					</div>
					<div className="stat-content">
						<h3>{data.stats.activeClients}</h3>
						<p>Clientes Ativos</p>
					</div>
				</div>
				<div className="stat-card">
					<div className="stat-icon pending">
						<i className="fas fa-clock"></i>
					</div>
					<div className="stat-content">
						<h3>{data.stats.pendingApprovals}</h3>
						<p>Aprovações Pendentes</p>
					</div>
				</div>
				<div className="stat-card">
					<div className="stat-icon">
						<i className="fas fa-envelope"></i>
					</div>
					<div className="stat-content">
						<h3>{data.stats.totalInvites}</h3>
						<p>Convites Enviados</p>
					</div>
				</div>
			</div>

			{/* Navegação por abas */}
			<div className="admin-tabs">
				<button
					className={`tab ${activeTab === "overview" ? "active" : ""}`}
					onClick={() => setActiveTab("overview")}
				>
					<i className="fas fa-tachometer-alt"></i>
					Visão Geral
				</button>
				<button
					className={`tab ${activeTab === "approvals" ? "active" : ""}`}
					onClick={() => setActiveTab("approvals")}
				>
					<i className="fas fa-user-check"></i>
					Aprovações
					{data.stats.pendingApprovals > 0 && (
						<span className="tab-badge">{data.stats.pendingApprovals}</span>
					)}
				</button>
				<button
					className={`tab ${activeTab === "invites" ? "active" : ""}`}
					onClick={() => setActiveTab("invites")}
				>
					<i className="fas fa-envelope-open"></i>
					Convites
				</button>
				<button
					className={`tab ${activeTab === "clients" ? "active" : ""}`}
					onClick={() => setActiveTab("clients")}
				>
					<i className="fas fa-users"></i>
					Clientes
				</button>
			</div>

			{/* Conteúdo das abas */}
			<div className="admin-content">
				{loading && <div className="loading">Carregando...</div>}

				{/* Aba Visão Geral */}
				{activeTab === "overview" && (
					<div className="tab-content">
						<div className="overview-grid">
							<div className="overview-card">
								<h3>Ações Rápidas</h3>
								<div className="quick-actions">
									<button
										className="btn btn-primary"
										onClick={() => setShowInviteModal(true)}
									>
										<i className="fas fa-plus"></i>
										Criar Convite
									</button>
									<button className="btn btn-secondary" onClick={loadData}>
										<i className="fas fa-sync"></i>
										Atualizar Dados
									</button>
								</div>
							</div>

							<div className="overview-card">
								<h3>Aprovações Recentes</h3>
								<div className="recent-approvals">
									{data.pendingApprovals.slice(0, 3).map((approval) => (
										<div key={approval.id} className="approval-item">
											<div className="approval-info">
												<strong>{approval.name}</strong>
												<span>{approval.email}</span>
											</div>
											<span className="approval-type">{approval.type}</span>
										</div>
									))}
									{data.pendingApprovals.length === 0 && (
										<p className="no-data">Nenhuma aprovação pendente</p>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Aba Aprovações */}
				{activeTab === "approvals" && (
					<div className="tab-content">
						<div className="content-header">
							<h2>Aprovações Pendentes</h2>
							<p>Clientes e usuários aguardando aprovação para acesso</p>
						</div>

						{data.pendingApprovals.length === 0 ? (
							<div className="no-data-message">
								<i className="fas fa-check-circle"></i>
								<h3>Todas as aprovações em dia!</h3>
								<p>Não há clientes ou usuários aguardando aprovação.</p>
							</div>
						) : (
							<div className="approvals-list">
								{data.pendingApprovals.map((item) => (
									<div
										key={`${item.type}-${item.id}`}
										className="approval-card"
									>
										<div className="approval-header">
											<div className="approval-title">
												<h4>{item.name}</h4>
												<span className={`approval-type ${item.type}`}>
													{item.type === "client" ? "Cliente" : "Usuário"}
												</span>
											</div>
											<div className="approval-date">
												{new Date(item.created_at).toLocaleDateString("pt-BR")}
											</div>
										</div>

										<div className="approval-details">
											<div className="detail-item">
												<span className="detail-label">Email:</span>
												<span className="detail-value">{item.email}</span>
											</div>
											{item.user_name && (
												<div className="detail-item">
													<span className="detail-label">Usuário:</span>
													<span className="detail-value">{item.user_name}</span>
												</div>
											)}
										</div>

										<div className="approval-actions">
											<button
												className="btn btn-success"
												onClick={() => handleApproveClient(item.id)}
											>
												<i className="fas fa-check"></i>
												Aprovar
											</button>
											<button
												className="btn btn-danger"
												onClick={() => handleRejectClient(item.id)}
											>
												<i className="fas fa-times"></i>
												Rejeitar
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Aba Convites */}
				{activeTab === "invites" && (
					<div className="tab-content">
						<div className="content-header">
							<h2>Gerenciar Convites</h2>
							<button
								className="btn btn-primary"
								onClick={() => setShowInviteModal(true)}
							>
								<i className="fas fa-plus"></i>
								Novo Convite
							</button>
						</div>

						<div className="invites-list">
							{data.invites.map((invite) => (
								<div key={invite.id} className="invite-card">
									<div className="invite-info">
										<h4>{invite.client_name}</h4>
										<p>{invite.email}</p>
										<div className="invite-meta">
											<span>
												Criado em:{" "}
												{new Date(invite.created_at).toLocaleDateString(
													"pt-BR"
												)}
											</span>
											<span>
												Expira em:{" "}
												{new Date(invite.expires_at).toLocaleDateString(
													"pt-BR"
												)}
											</span>
										</div>
									</div>
									<div className="invite-status">
										{invite.used_at ? (
											<span className="status used">Usado</span>
										) : new Date(invite.expires_at) < new Date() ? (
											<span className="status expired">Expirado</span>
										) : (
											<span className="status active">Ativo</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Aba Clientes */}
				{activeTab === "clients" && (
					<div className="tab-content">
						<div className="content-header">
							<h2>Todos os Clientes</h2>
						</div>

						<div className="clients-grid">
							{data.clients.map((client) => (
								<div key={client.id} className="client-card">
									<div className="client-header">
										<h4>{client.name}</h4>
										<span
											className={`client-status ${
												client.active ? "active" : "inactive"
											}`}
										>
											{client.active ? "Ativo" : "Inativo"}
										</span>
									</div>
									<div className="client-details">
										<p>
											<strong>Email:</strong> {client.email}
										</p>
										<p>
											<strong>Plano:</strong> {client.plan}
										</p>
										<p>
											<strong>Criado em:</strong>{" "}
											{new Date(client.created_at).toLocaleDateString("pt-BR")}
										</p>
										{client.approved_at && (
											<p>
												<strong>Aprovado em:</strong>{" "}
												{new Date(client.approved_at).toLocaleDateString(
													"pt-BR"
												)}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Modal para criar convite */}
			{showInviteModal && (
				<div
					className="modal-overlay"
					onClick={() => setShowInviteModal(false)}
				>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>Criar Novo Convite</h3>
							<button
								className="modal-close"
								onClick={() => setShowInviteModal(false)}
							>
								<i className="fas fa-times"></i>
							</button>
						</div>

						<form onSubmit={handleCreateInvite}>
							<div className="form-group">
								<label>Email do Cliente *</label>
								<input
									type="email"
									value={newInvite.email}
									onChange={(e) =>
										setNewInvite({ ...newInvite, email: e.target.value })
									}
									placeholder="cliente@empresa.com"
									required
								/>
							</div>

							<div className="form-group">
								<label>Nome da Empresa *</label>
								<input
									type="text"
									value={newInvite.clientName}
									onChange={(e) =>
										setNewInvite({ ...newInvite, clientName: e.target.value })
									}
									placeholder="Nome da empresa"
									required
								/>
							</div>

							<div className="form-group">
								<label>Validade (em horas)</label>
								<select
									value={newInvite.expiresInHours}
									onChange={(e) =>
										setNewInvite({
											...newInvite,
											expiresInHours: parseInt(e.target.value),
										})
									}
								>
									<option value={24}>24 horas</option>
									<option value={72}>3 dias</option>
									<option value={168}>7 dias (padrão)</option>
									<option value={336}>14 dias</option>
									<option value={720}>30 dias</option>
								</select>
							</div>

							<div className="modal-actions">
								<button
									type="button"
									className="btn btn-secondary"
									onClick={() => setShowInviteModal(false)}
								>
									Cancelar
								</button>
								<button type="submit" className="btn btn-primary">
									<i className="fas fa-envelope"></i>
									Criar Convite
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;
