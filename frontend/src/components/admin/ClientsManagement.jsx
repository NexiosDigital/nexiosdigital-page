import React, { useState, useEffect } from "react";

const ClientsManagement = () => {
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [creating, setCreating] = useState(false);
	const [filter, setFilter] = useState("all");
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

	const filteredClients = clients.filter((client) => {
		if (filter === "all") return true;
		if (filter === "active") return client.active;
		if (filter === "inactive") return !client.active;
		return client.plan === filter;
	});

	const stats = {
		total: clients.length,
		active: clients.filter((c) => c.active).length,
		inactive: clients.filter((c) => !c.active).length,
		totalUsers: clients.reduce((sum, c) => sum + c.current_users, 0),
		totalAutomations: clients.reduce(
			(sum, c) => sum + c.current_automations,
			0
		),
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
			{/* Header Section */}
			<div className="admin-header-section">
				<h1>Gerenciamento de Clientes</h1>
				<p>Gerencie todos os clientes da plataforma</p>
			</div>

			{/* Estatísticas */}
			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-icon clients">
						<i className="fas fa-building"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.total}</div>
						<div className="stat-label">Total de Clientes</div>
					</div>
					<div className="stat-trend positive">
						<i className="fas fa-arrow-up"></i> +12%
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon active">
						<i className="fas fa-check-circle"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.active}</div>
						<div className="stat-label">Clientes Ativos</div>
					</div>
					<div className="stat-trend positive">
						<i className="fas fa-arrow-up"></i> +8%
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
						<i className="fas fa-arrow-up"></i> +15%
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon automations">
						<i className="fas fa-robot"></i>
					</div>
					<div className="stat-content">
						<div className="stat-number">{stats.totalAutomations}</div>
						<div className="stat-label">Automações Ativas</div>
					</div>
					<div className="stat-trend positive">
						<i className="fas fa-arrow-up"></i> +20%
					</div>
				</div>
			</div>

			{/* Controles e Filtros */}
			<div className="admin-card">
				<div className="card-header">
					<div className="header-left">
						<h3 className="card-title">
							<i className="fas fa-filter"></i>
							Filtros e Ações
						</h3>
					</div>
					<div className="header-right">
						<button
							className="btn btn-primary"
							onClick={() => setShowCreateModal(true)}
						>
							<i className="fas fa-plus"></i>
							Novo Cliente
						</button>
					</div>
				</div>
				<div className="card-content">
					<div className="filters-section">
						<div className="filter-tabs">
							<button
								className={`filter-tab ${filter === "all" ? "active" : ""}`}
								onClick={() => setFilter("all")}
							>
								Todos ({clients.length})
							</button>
							<button
								className={`filter-tab ${filter === "active" ? "active" : ""}`}
								onClick={() => setFilter("active")}
							>
								Ativos ({stats.active})
							</button>
							<button
								className={`filter-tab ${
									filter === "inactive" ? "active" : ""
								}`}
								onClick={() => setFilter("inactive")}
							>
								Inativos ({stats.inactive})
							</button>
							<button
								className={`filter-tab ${filter === "basic" ? "active" : ""}`}
								onClick={() => setFilter("basic")}
							>
								Básico ({clients.filter((c) => c.plan === "basic").length})
							</button>
							<button
								className={`filter-tab ${
									filter === "standard" ? "active" : ""
								}`}
								onClick={() => setFilter("standard")}
							>
								Padrão ({clients.filter((c) => c.plan === "standard").length})
							</button>
							<button
								className={`filter-tab ${filter === "premium" ? "active" : ""}`}
								onClick={() => setFilter("premium")}
							>
								Premium ({clients.filter((c) => c.plan === "premium").length})
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Grid de Clientes */}
			<div className="admin-card">
				<div className="card-header">
					<h3 className="card-title">
						<i className="fas fa-list"></i>
						Lista de Clientes
					</h3>
					<span className="card-subtitle">
						{filteredClients.length} cliente(s) encontrado(s)
					</span>
				</div>
				<div className="card-content">
					{filteredClients.length === 0 ? (
						<div className="empty-state">
							<div className="empty-icon">
								<i className="fas fa-building"></i>
							</div>
							<h3>Nenhum cliente encontrado</h3>
							<p>
								{filter === "all"
									? "Não há clientes cadastrados ainda."
									: `Não há clientes com o filtro "${filter}" aplicado.`}
							</p>
							<button
								className="btn btn-primary"
								onClick={() => setShowCreateModal(true)}
							>
								<i className="fas fa-plus"></i>
								Criar Primeiro Cliente
							</button>
						</div>
					) : (
						<div className="clients-grid">
							{filteredClients.map((client) => {
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
												<h4 className="client-name">{client.name}</h4>
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
													<span className="usage-label">Usuários</span>
													<span className="usage-value">
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
												<div className="usage-percent">{userPercent}%</div>
											</div>

											<div className="usage-item">
												<div className="usage-header">
													<span className="usage-label">Automações</span>
													<span className="usage-value">
														{client.current_automations}/
														{client.max_automations}
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
												<div className="usage-percent">
													{automationPercent}%
												</div>
											</div>
										</div>

										<div className="client-meta">
											<div className="meta-item">
												<i className="fas fa-calendar"></i>
												<span>
													Criado em{" "}
													{new Date(client.created_at).toLocaleDateString(
														"pt-BR"
													)}
												</span>
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
													className={`fas fa-${
														client.active ? "pause" : "play"
													}`}
												></i>
												{client.active ? "Desativar" : "Ativar"}
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
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

export default ClientsManagement;
