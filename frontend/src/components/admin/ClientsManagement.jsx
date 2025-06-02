import React, { useState, useEffect } from "react";

const ClientsManagement = () => {
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [creating, setCreating] = useState(false);
	const [newClient, setNewClient] = useState({
		name: "",
		plan: "basic",
		max_users: 10,
		max_automations: 15,
	});

	useEffect(() => {
		loadClients();
	}, []);

	const loadClients = async () => {
		try {
			setLoading(true);
			// Simular carregamento de clientes
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setClients([
				{
					id: "1",
					name: "TechCorp Solutions",
					plan: "standard",
					active: true,
					max_users: 15,
					max_automations: 25,
					current_users: 8,
					current_automations: 12,
					created_at: "2024-01-01T00:00:00Z",
				},
				{
					id: "2",
					name: "Innovate Inc",
					plan: "basic",
					active: true,
					max_users: 10,
					max_automations: 15,
					current_users: 5,
					current_automations: 7,
					created_at: "2024-01-05T00:00:00Z",
				},
				{
					id: "3",
					name: "Global Systems",
					plan: "premium",
					active: true,
					max_users: 50,
					max_automations: 100,
					current_users: 23,
					current_automations: 45,
					created_at: "2024-01-10T00:00:00Z",
				},
			]);
		} catch (error) {
			console.error("Erro ao carregar clientes:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateClient = async (e) => {
		e.preventDefault();
		try {
			setCreating(true);

			// Simular criação
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const client = {
				id: Date.now().toString(),
				...newClient,
				active: true,
				current_users: 0,
				current_automations: 0,
				created_at: new Date().toISOString(),
			};

			setClients([client, ...clients]);
			setShowCreateModal(false);
			setNewClient({
				name: "",
				plan: "basic",
				max_users: 10,
				max_automations: 15,
			});

			alert("Cliente criado com sucesso!");
		} catch (error) {
			console.error("Erro ao criar cliente:", error);
			alert("Erro ao criar cliente");
		} finally {
			setCreating(false);
		}
	};

	const toggleClientStatus = async (clientId) => {
		try {
			const client = clients.find((c) => c.id === clientId);
			if (
				!window.confirm(
					`Tem certeza que deseja ${
						client.active ? "desativar" : "ativar"
					} este cliente?`
				)
			) {
				return;
			}

			await new Promise((resolve) => setTimeout(resolve, 500));

			setClients(
				clients.map((c) =>
					c.id === clientId ? { ...c, active: !c.active } : c
				)
			);

			alert(`Cliente ${client.active ? "desativado" : "ativado"} com sucesso!`);
		} catch (error) {
			console.error("Erro ao alterar status do cliente:", error);
			alert("Erro ao alterar status do cliente");
		}
	};

	const getPlanBadge = (plan) => {
		const badges = {
			free: { label: "Gratuito", class: "free" },
			basic: { label: "Básico", class: "basic" },
			standard: { label: "Padrão", class: "standard" },
			premium: { label: "Premium", class: "premium" },
		};
		return badges[plan] || { label: plan, class: "default" };
	};

	const getUsagePercent = (current, max) => {
		return Math.round((current / max) * 100);
	};

	const getUsageColor = (percent) => {
		if (percent >= 90) return "var(--error)";
		if (percent >= 70) return "var(--warning)";
		return "var(--success)";
	};

	if (loading) {
		return (
			<div className="clients-management">
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<p>Carregando clientes...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="clients-management">
			{/* Header */}
			<div className="page-header">
				<div className="header-content">
					<h1>Gerenciamento de Clientes</h1>
					<p>Gerencie todos os clientes da plataforma</p>
				</div>
				<div className="header-actions">
					<button
						className="btn btn-primary"
						onClick={() => setShowCreateModal(true)}
					>
						<i className="fas fa-plus"></i>
						Novo Cliente
					</button>
				</div>
			</div>

			{/* Estatísticas */}
			<div className="stats-row">
				<div className="stat-item">
					<span className="stat-label">Total de Clientes</span>
					<span className="stat-value">{clients.length}</span>
				</div>
				<div className="stat-item">
					<span className="stat-label">Ativos</span>
					<span className="stat-value">
						{clients.filter((c) => c.active).length}
					</span>
				</div>
				<div className="stat-item">
					<span className="stat-label">Total de Usuários</span>
					<span className="stat-value">
						{clients.reduce((sum, c) => sum + c.current_users, 0)}
					</span>
				</div>
			</div>

			{/* Grid de Clientes */}
			<div className="clients-grid">
				{clients.map((client) => {
					const planBadge = getPlanBadge(client.plan);
					const userPercent = getUsagePercent(
						client.current_users,
						client.max_users
					);
					const automationPercent = getUsagePercent(
						client.current_automations,
						client.max_automations
					);

					return (
						<div key={client.id} className="client-card">
							<div className="client-header">
								<div className="client-info">
									<h3 className="client-name">{client.name}</h3>
									<span className={`plan-badge ${planBadge.class}`}>
										{planBadge.label}
									</span>
								</div>
								<div className="client-status">
									<span
										className={`status-indicator ${
											client.active ? "active" : "inactive"
										}`}
									>
										{client.active ? "Ativo" : "Inativo"}
									</span>
								</div>
							</div>

							<div className="client-usage">
								<div className="usage-item">
									<div className="usage-header">
										<span>Usuários</span>
										<span>
											{client.current_users}/{client.max_users}
										</span>
									</div>
									<div className="usage-bar">
										<div
											className="usage-fill"
											style={{
												width: `${userPercent}%`,
												backgroundColor: getUsageColor(userPercent),
											}}
										></div>
									</div>
								</div>

								<div className="usage-item">
									<div className="usage-header">
										<span>Automações</span>
										<span>
											{client.current_automations}/{client.max_automations}
										</span>
									</div>
									<div className="usage-bar">
										<div
											className="usage-fill"
											style={{
												width: `${automationPercent}%`,
												backgroundColor: getUsageColor(automationPercent),
											}}
										></div>
									</div>
								</div>
							</div>

							<div className="client-actions">
								<button className="btn btn-secondary btn-sm">
									<i className="fas fa-eye"></i>
									Ver Detalhes
								</button>
								<button
									className={`btn btn-sm ${
										client.active ? "btn-warning" : "btn-success"
									}`}
									onClick={() => toggleClientStatus(client.id)}
								>
									<i
										className={`fas fa-${client.active ? "pause" : "play"}`}
									></i>
									{client.active ? "Desativar" : "Ativar"}
								</button>
							</div>
						</div>
					);
				})}
			</div>

			{/* Modal de Criação */}
			{showCreateModal && (
				<div
					className="modal-overlay"
					onClick={() => setShowCreateModal(false)}
				>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>Criar Novo Cliente</h3>
							<button
								className="modal-close"
								onClick={() => setShowCreateModal(false)}
							>
								<i className="fas fa-times"></i>
							</button>
						</div>

						<form onSubmit={handleCreateClient} className="modal-form">
							<div className="form-group">
								<label className="form-label">Nome do Cliente *</label>
								<input
									type="text"
									className="form-input"
									value={newClient.name}
									onChange={(e) =>
										setNewClient({ ...newClient, name: e.target.value })
									}
									required
									disabled={creating}
									placeholder="Nome da empresa"
								/>
							</div>

							<div className="form-group">
								<label className="form-label">Plano</label>
								<select
									className="form-select"
									value={newClient.plan}
									onChange={(e) =>
										setNewClient({ ...newClient, plan: e.target.value })
									}
									disabled={creating}
								>
									<option value="basic">Básico</option>
									<option value="standard">Padrão</option>
									<option value="premium">Premium</option>
								</select>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label className="form-label">Máx. Usuários</label>
									<input
										type="number"
										className="form-input"
										value={newClient.max_users}
										onChange={(e) =>
											setNewClient({
												...newClient,
												max_users: parseInt(e.target.value),
											})
										}
										min="1"
										disabled={creating}
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Máx. Automações</label>
									<input
										type="number"
										className="form-input"
										value={newClient.max_automations}
										onChange={(e) =>
											setNewClient({
												...newClient,
												max_automations: parseInt(e.target.value),
											})
										}
										min="1"
										disabled={creating}
									/>
								</div>
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
											<i className="fas fa-building"></i>
											Criar Cliente
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

// MUDANÇA PRINCIPAL: Usar export default ao invés de export nomeado
export default ClientsManagement;
