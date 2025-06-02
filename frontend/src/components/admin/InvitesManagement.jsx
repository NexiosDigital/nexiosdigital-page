import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const InvitesManagement = () => {
	const { user } = useAuth();
	const [invites, setInvites] = useState([]);
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [creating, setCreating] = useState(false);
	const [newInvite, setNewInvite] = useState({
		email: "",
		name: "",
		client_id: "",
		role: "user",
	});

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			await Promise.all([loadInvites(), loadClients()]);
		} catch (error) {
			console.error("Erro ao carregar dados:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadInvites = async () => {
		// Simular carregamento de convites
		await new Promise((resolve) => setTimeout(resolve, 500));

		setInvites([
			{
				id: 1,
				email: "joao@techcorp.com",
				invited_name: "João Silva",
				client_id: "1",
				client_name: "TechCorp",
				role: "user",
				status: "pending",
				invited_by: user?.id,
				invited_by_name: "Admin",
				created_at: "2024-01-20T10:30:00Z",
				expires_at: "2024-01-27T10:30:00Z",
			},
			{
				id: 2,
				email: "maria@innovate.com",
				invited_name: "Maria Santos",
				client_id: "2",
				client_name: "Innovate Solutions",
				role: "manager",
				status: "accepted",
				invited_by: user?.id,
				invited_by_name: "Admin",
				created_at: "2024-01-18T14:15:00Z",
				expires_at: "2024-01-25T14:15:00Z",
				used_at: "2024-01-18T16:30:00Z",
			},
			{
				id: 3,
				email: "carlos@startup.com",
				invited_name: "Carlos Ferreira",
				client_id: "3",
				client_name: "Startup Inc",
				role: "user",
				status: "expired",
				invited_by: user?.id,
				invited_by_name: "Admin",
				created_at: "2024-01-10T09:00:00Z",
				expires_at: "2024-01-17T09:00:00Z",
			},
		]);
	};

	const loadClients = async () => {
		// Simular carregamento de clientes
		await new Promise((resolve) => setTimeout(resolve, 300));

		setClients([
			{ id: "1", name: "TechCorp", active: true },
			{ id: "2", name: "Innovate Solutions", active: true },
			{ id: "3", name: "Startup Inc", active: true },
			{ id: "4", name: "Global Systems", active: true },
		]);
	};

	const handleCreateInvite = async (e) => {
		e.preventDefault();

		if (!newInvite.email || !newInvite.client_id) {
			alert("Por favor, preencha todos os campos obrigatórios");
			return;
		}

		try {
			setCreating(true);

			// Simular criação de convite
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Adicionar novo convite à lista
			const invite = {
				id: Date.now(),
				...newInvite,
				client_name: clients.find((c) => c.id === newInvite.client_id)?.name,
				status: "pending",
				invited_by: user?.id,
				invited_by_name: user?.profile?.name,
				created_at: new Date().toISOString(),
				expires_at: new Date(
					Date.now() + 7 * 24 * 60 * 60 * 1000
				).toISOString(), // 7 dias
			};

			setInvites([invite, ...invites]);
			setShowCreateModal(false);
			setNewInvite({ email: "", name: "", client_id: "", role: "user" });

			alert("Convite criado e enviado com sucesso!");
		} catch (error) {
			console.error("Erro ao criar convite:", error);
			alert("Erro ao criar convite");
		} finally {
			setCreating(false);
		}
	};

	const handleCancelInvite = async (inviteId) => {
		// ✅ CORREÇÃO: Usar window.confirm ao invés de confirm
		if (!window.confirm("Tem certeza que deseja cancelar este convite?")) {
			return;
		}

		try {
			// Simular cancelamento
			await new Promise((resolve) => setTimeout(resolve, 500));

			setInvites(
				invites.map((invite) =>
					invite.id === inviteId ? { ...invite, status: "cancelled" } : invite
				)
			);

			alert("Convite cancelado com sucesso!");
		} catch (error) {
			console.error("Erro ao cancelar convite:", error);
			alert("Erro ao cancelar convite");
		}
	};

	const handleResendInvite = async (inviteId) => {
		try {
			// Simular reenvio
			await new Promise((resolve) => setTimeout(resolve, 500));

			setInvites(
				invites.map((invite) =>
					invite.id === inviteId
						? {
								...invite,
								created_at: new Date().toISOString(),
								expires_at: new Date(
									Date.now() + 7 * 24 * 60 * 60 * 1000
								).toISOString(),
						  }
						: invite
				)
			);

			alert("Convite reenviado com sucesso!");
		} catch (error) {
			console.error("Erro ao reenviar convite:", error);
			alert("Erro ao reenviar convite");
		}
	};

	const getStatusBadge = (status) => {
		const badges = {
			pending: { label: "Pendente", class: "pending" },
			accepted: { label: "Aceito", class: "accepted" },
			expired: { label: "Expirado", class: "expired" },
			cancelled: { label: "Cancelado", class: "cancelled" },
		};
		return badges[status] || { label: status, class: "default" };
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString("pt-BR");
	};

	const isExpired = (expiresAt) => {
		return new Date(expiresAt) < new Date();
	};

	if (loading) {
		return (
			<div className="invites-management">
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<p>Carregando convites...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="invites-management">
			{/* Header */}
			<div className="page-header">
				<div className="header-content">
					<h1>Gerenciamento de Convites</h1>
					<p>Gerencie convites para novos usuários da plataforma</p>
				</div>
				<div className="header-actions">
					<button
						className="btn btn-primary"
						onClick={() => setShowCreateModal(true)}
					>
						<i className="fas fa-plus"></i>
						Novo Convite
					</button>
				</div>
			</div>

			{/* Estatísticas */}
			<div className="stats-row">
				<div className="stat-item">
					<span className="stat-label">Total de Convites</span>
					<span className="stat-value">{invites.length}</span>
				</div>
				<div className="stat-item">
					<span className="stat-label">Pendentes</span>
					<span className="stat-value">
						{invites.filter((i) => i.status === "pending").length}
					</span>
				</div>
				<div className="stat-item">
					<span className="stat-label">Aceitos</span>
					<span className="stat-value">
						{invites.filter((i) => i.status === "accepted").length}
					</span>
				</div>
				<div className="stat-item">
					<span className="stat-label">Expirados</span>
					<span className="stat-value">
						{invites.filter((i) => i.status === "expired").length}
					</span>
				</div>
			</div>

			{/* Tabela de Convites */}
			<div className="invites-table-container">
				<table className="admin-table">
					<thead>
						<tr>
							<th>Usuário</th>
							<th>Cliente</th>
							<th>Função</th>
							<th>Status</th>
							<th>Criado</th>
							<th>Expira</th>
							<th>Ações</th>
						</tr>
					</thead>
					<tbody>
						{invites.map((invite) => {
							const badge = getStatusBadge(invite.status);
							return (
								<tr key={invite.id}>
									<td>
										<div className="user-info">
											<div className="user-details">
												<div className="user-name">
													{invite.invited_name || "—"}
												</div>
												<div className="user-email">{invite.email}</div>
											</div>
										</div>
									</td>
									<td>{invite.client_name}</td>
									<td>
										<span className="role-badge">{invite.role}</span>
									</td>
									<td>
										<span className={`status-badge ${badge.class}`}>
											{badge.label}
										</span>
									</td>
									<td>{formatDate(invite.created_at)}</td>
									<td>
										<span
											className={
												isExpired(invite.expires_at) ? "text-error" : ""
											}
										>
											{formatDate(invite.expires_at)}
										</span>
									</td>
									<td>
										<div className="action-buttons">
											{invite.status === "pending" && (
												<>
													<button
														className="btn btn-secondary btn-xs"
														onClick={() => handleResendInvite(invite.id)}
														title="Reenviar convite"
													>
														<i className="fas fa-redo"></i>
													</button>
													<button
														className="btn btn-danger btn-xs"
														onClick={() => handleCancelInvite(invite.id)}
														title="Cancelar convite"
													>
														<i className="fas fa-times"></i>
													</button>
												</>
											)}
											{invite.status === "expired" && (
												<button
													className="btn btn-secondary btn-xs"
													onClick={() => handleResendInvite(invite.id)}
													title="Reenviar convite"
												>
													<i className="fas fa-redo"></i>
												</button>
											)}
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Modal de Criação */}
			{showCreateModal && (
				<div
					className="modal-overlay"
					onClick={() => setShowCreateModal(false)}
				>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>Criar Novo Convite</h3>
							<button
								className="modal-close"
								onClick={() => setShowCreateModal(false)}
							>
								<i className="fas fa-times"></i>
							</button>
						</div>

						<form onSubmit={handleCreateInvite} className="modal-form">
							<div className="form-group">
								<label className="form-label">Email *</label>
								<input
									type="email"
									className="form-input"
									value={newInvite.email}
									onChange={(e) =>
										setNewInvite({ ...newInvite, email: e.target.value })
									}
									required
									disabled={creating}
									placeholder="usuario@exemplo.com"
								/>
							</div>

							<div className="form-group">
								<label className="form-label">Nome</label>
								<input
									type="text"
									className="form-input"
									value={newInvite.name}
									onChange={(e) =>
										setNewInvite({ ...newInvite, name: e.target.value })
									}
									disabled={creating}
									placeholder="Nome completo (opcional)"
								/>
							</div>

							<div className="form-group">
								<label className="form-label">Cliente *</label>
								<select
									className="form-select"
									value={newInvite.client_id}
									onChange={(e) =>
										setNewInvite({ ...newInvite, client_id: e.target.value })
									}
									required
									disabled={creating}
								>
									<option value="">Selecione um cliente</option>
									{clients
										.filter((c) => c.active)
										.map((client) => (
											<option key={client.id} value={client.id}>
												{client.name}
											</option>
										))}
								</select>
							</div>

							<div className="form-group">
								<label className="form-label">Função</label>
								<select
									className="form-select"
									value={newInvite.role}
									onChange={(e) =>
										setNewInvite({ ...newInvite, role: e.target.value })
									}
									disabled={creating}
								>
									<option value="user">Usuário</option>
									<option value="manager">Gerente</option>
									<option value="admin">Administrador</option>
								</select>
							</div>

							<div className="modal-actions">
								<button
									type="button"
									className="btn btn-secondary"
									onClick={() => setShowCreateModal(false)}
									disabled={creating}
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="btn btn-primary"
									disabled={creating}
								>
									{creating ? (
										<>
											<i className="fas fa-spinner fa-spin"></i>
											Criando...
										</>
									) : (
										<>
											<i className="fas fa-envelope"></i>
											Criar e Enviar
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default InvitesManagement;
