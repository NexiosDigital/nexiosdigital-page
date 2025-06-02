import React, { useState, useEffect } from "react";

const UsersManagement = () => {
	const [users, setUsers] = useState([]);
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all");

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			await Promise.all([loadUsers(), loadClients()]);
		} catch (error) {
			console.error("Erro ao carregar dados:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadUsers = async () => {
		await new Promise((resolve) => setTimeout(resolve, 800));

		setUsers([
			{
				id: "1",
				name: "João Silva",
				email: "joao@techcorp.com",
				client_id: "1",
				client_name: "TechCorp Solutions",
				role: "manager",
				is_active: true,
				last_login: "2024-01-20T10:30:00Z",
				created_at: "2024-01-01T00:00:00Z",
			},
			{
				id: "2",
				name: "Maria Santos",
				email: "maria@innovate.com",
				client_id: "2",
				client_name: "Innovate Inc",
				role: "user",
				is_active: true,
				last_login: "2024-01-19T15:45:00Z",
				created_at: "2024-01-05T00:00:00Z",
			},
			{
				id: "3",
				name: "Carlos Ferreira",
				email: "carlos@global.com",
				client_id: "3",
				client_name: "Global Systems",
				role: "admin",
				is_active: false,
				last_login: "2024-01-15T09:20:00Z",
				created_at: "2024-01-10T00:00:00Z",
			},
		]);
	};

	const loadClients = async () => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		setClients([
			{ id: "1", name: "TechCorp Solutions" },
			{ id: "2", name: "Innovate Inc" },
			{ id: "3", name: "Global Systems" },
		]);
	};

	const toggleUserStatus = async (userId) => {
		try {
			const user = users.find((u) => u.id === userId);
			if (
				!window.confirm(
					`Tem certeza que deseja ${
						user.is_active ? "desativar" : "ativar"
					} este usuário?`
				)
			) {
				return;
			}

			await new Promise((resolve) => setTimeout(resolve, 500));

			setUsers(
				users.map((u) =>
					u.id === userId ? { ...u, is_active: !u.is_active } : u
				)
			);

			alert(
				`Usuário ${user.is_active ? "desativado" : "ativado"} com sucesso!`
			);
		} catch (error) {
			console.error("Erro ao alterar status do usuário:", error);
			alert("Erro ao alterar status do usuário");
		}
	};

	const getRoleBadge = (role) => {
		const badges = {
			admin: { label: "Admin", class: "admin" },
			manager: { label: "Gerente", class: "manager" },
			user: { label: "Usuário", class: "user" },
			viewer: { label: "Visualizador", class: "viewer" },
		};
		return badges[role] || { label: role, class: "default" };
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString("pt-BR");
	};

	const filteredUsers = users.filter((user) => {
		if (filter === "all") return true;
		if (filter === "active") return user.is_active;
		if (filter === "inactive") return !user.is_active;
		return user.role === filter;
	});

	if (loading) {
		return (
			<div className="users-management">
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<p>Carregando usuários...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="users-management">
			{/* Header */}
			<div className="page-header">
				<div className="header-content">
					<h1>Gerenciamento de Usuários</h1>
					<p>Gerencie todos os usuários da plataforma</p>
				</div>
			</div>

			{/* Filtros */}
			<div className="filters-section">
				<div className="filter-tabs">
					<button
						className={`filter-tab ${filter === "all" ? "active" : ""}`}
						onClick={() => setFilter("all")}
					>
						Todos ({users.length})
					</button>
					<button
						className={`filter-tab ${filter === "active" ? "active" : ""}`}
						onClick={() => setFilter("active")}
					>
						Ativos ({users.filter((u) => u.is_active).length})
					</button>
					<button
						className={`filter-tab ${filter === "inactive" ? "active" : ""}`}
						onClick={() => setFilter("inactive")}
					>
						Inativos ({users.filter((u) => !u.is_active).length})
					</button>
					<button
						className={`filter-tab ${filter === "admin" ? "active" : ""}`}
						onClick={() => setFilter("admin")}
					>
						Admins ({users.filter((u) => u.role === "admin").length})
					</button>
				</div>
			</div>

			{/* Tabela de Usuários */}
			<div className="users-table-container">
				<table className="admin-table">
					<thead>
						<tr>
							<th>Usuário</th>
							<th>Cliente</th>
							<th>Função</th>
							<th>Status</th>
							<th>Último Login</th>
							<th>Criado</th>
							<th>Ações</th>
						</tr>
					</thead>
					<tbody>
						{filteredUsers.map((user) => {
							const roleBadge = getRoleBadge(user.role);
							return (
								<tr key={user.id}>
									<td>
										<div className="user-info">
											<div className="user-avatar">
												<i className="fas fa-user"></i>
											</div>
											<div className="user-details">
												<div className="user-name">{user.name}</div>
												<div className="user-email">{user.email}</div>
											</div>
										</div>
									</td>
									<td>{user.client_name}</td>
									<td>
										<span className={`role-badge ${roleBadge.class}`}>
											{roleBadge.label}
										</span>
									</td>
									<td>
										<span
											className={`status-badge ${
												user.is_active ? "active" : "inactive"
											}`}
										>
											{user.is_active ? "Ativo" : "Inativo"}
										</span>
									</td>
									<td>{formatDate(user.last_login)}</td>
									<td>{formatDate(user.created_at)}</td>
									<td>
										<div className="action-buttons">
											<button
												className="btn btn-secondary btn-xs"
												title="Ver detalhes"
											>
												<i className="fas fa-eye"></i>
											</button>
											<button
												className={`btn btn-xs ${
													user.is_active ? "btn-warning" : "btn-success"
												}`}
												onClick={() => toggleUserStatus(user.id)}
												title={
													user.is_active
														? "Desativar usuário"
														: "Ativar usuário"
												}
											>
												<i
													className={`fas fa-${
														user.is_active ? "pause" : "play"
													}`}
												></i>
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{filteredUsers.length === 0 && (
				<div className="empty-state">
					<div className="empty-icon">
						<i className="fas fa-users"></i>
					</div>
					<h3>Nenhum usuário encontrado</h3>
					<p>Não há usuários que correspondam aos filtros selecionados.</p>
				</div>
			)}
		</div>
	);
};

// MUDANÇA: Usar export default
export default UsersManagement;
