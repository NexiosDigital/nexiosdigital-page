import React, { useState, useCallback, useMemo } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Componentes do Admin Panel
import AdminOverview from "./admin/AdminOverview";
import ClientsManagement from "./admin/ClientsManagement";
import UsersManagement from "./admin/UsersManagement";
import InvitesManagement from "./admin/InvitesManagement";
import SystemSettings from "./admin/SystemSettings";
import SystemLogs from "./admin/SystemLogs";

// Hooks customizados
import { useSidebar } from "../hooks/useSidebar";
//import { useActiveRoute } from "../hooks/useActiveRoute";
import { useKeyboard } from "../hooks/useKeyboard";

// Estilos - Reutilizando estilos do Dashboard conforme sugerido
import "../styles/Dashboard.css";
import "../styles/AdminPanel.css";

const AdminPanel = () => {
	const { user, logout } = useAuth();
	const location = useLocation();

	// Hook customizado para sidebar com funcionalidades otimizadas
	const {
		sidebarOpen,
		sidebarCollapsed,
		isMobile,
		toggleSidebarCollapse,
		toggleSidebarMobile,
		closeSidebarMobile,
		getSidebarClasses,
	} = useSidebar("admin_sidebar_collapsed");

	// Estado de carregamento
	const [isLoading, setIsLoading] = useState(false);

	// Menu items do admin - memoizado para performance
	const menuItems = useMemo(
		() => [
			{
				path: "/admin",
				icon: "fas fa-tachometer-alt",
				label: "Visão Geral",
				exact: true,
			},
			{
				path: "/admin/clients",
				icon: "fas fa-building",
				label: "Clientes",
			},
			{
				path: "/admin/users",
				icon: "fas fa-users",
				label: "Usuários",
			},
			{
				path: "/admin/invites",
				icon: "fas fa-envelope-open",
				label: "Convites",
			},
			{
				path: "/admin/settings",
				icon: "fas fa-cogs",
				label: "Configurações",
			},
			{
				path: "/admin/logs",
				icon: "fas fa-list-alt",
				label: "Logs do Sistema",
			},
			{
				path: "/dashboard",
				icon: "fas fa-arrow-left",
				label: "Voltar ao Dashboard",
				external: true,
			},
		],
		[]
	);

	// Hook para rotas ativas
	const { isActivePath, getCurrentPageTitle } = useActiveRoute(menuItems);

	// Atalhos de teclado
	useKeyboard(
		{
			"ctrl+b": toggleSidebarCollapse,
			escape: closeSidebarMobile,
		},
		[toggleSidebarCollapse, closeSidebarMobile]
	);

	// Função de logout otimizada com useCallback
	const handleLogout = useCallback(async () => {
		if (isLoading) return;

		try {
			setIsLoading(true);
			await logout();
			window.location.href = "/";
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
		} finally {
			setIsLoading(false);
		}
	}, [logout, isLoading]);

	// Classes CSS dinâmicas - Reutilizando classes do Dashboard
	const sidebarClasses = useMemo(() => {
		return getSidebarClasses("admin-sidebar dashboard-sidebar");
	}, [getSidebarClasses]);

	// Renderizar link de navegação - memoizado para performance
	const renderNavLink = useCallback(
		(item) => {
			const isActive = isActivePath(item.path, item.exact);
			const linkClass = `nav-link ${isActive ? "active" : ""}`;
			const tooltip = sidebarCollapsed && !isMobile ? item.label : "";

			if (item.external) {
				return (
					<a
						href={item.path}
						className={linkClass}
						title={tooltip}
						aria-label={item.label}
					>
						<i className={item.icon} aria-hidden="true"></i>
						<span>{item.label}</span>
					</a>
				);
			}

			return (
				<Link
					to={item.path}
					className={linkClass}
					title={tooltip}
					aria-label={item.label}
				>
					<i className={item.icon} aria-hidden="true"></i>
					<span>{item.label}</span>
				</Link>
			);
		},
		[isActivePath, sidebarCollapsed, isMobile]
	);

	return (
		<div className="dashboard-layout admin-layout">
			{/* Sidebar - Reutilizando estrutura do Dashboard */}
			<aside className={sidebarClasses}>
				<div className="sidebar-header">
					<div className="logo">
						<h2>Admin Panel</h2>
						<span className="subtitle">Nexios Digital</span>
					</div>

					{/* Botão de toggle apenas no desktop */}
					{!isMobile && (
						<button
							className="sidebar-toggle"
							onClick={toggleSidebarCollapse}
							title={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
							type="button"
							aria-label={
								sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"
							}
						>
							<i
								className={`fas fa-chevron-${
									sidebarCollapsed ? "right" : "left"
								}`}
								aria-hidden="true"
							></i>
						</button>
					)}
				</div>

				<nav
					className="sidebar-nav"
					role="navigation"
					aria-label="Menu administrativo"
				>
					<ul className="nav-list">
						{menuItems.map((item) => (
							<li key={item.path} className="nav-item">
								{renderNavLink(item)}
							</li>
						))}
					</ul>
				</nav>

				<div className="sidebar-footer">
					<div className="user-info">
						<div className="user-avatar admin" aria-hidden="true">
							<i className="fas fa-user-shield"></i>
						</div>
						<div className="user-details">
							<span
								className="user-name"
								title={user?.profile?.name}
								aria-label={`Administrador: ${user?.profile?.name}`}
							>
								{user?.profile?.name}
							</span>
							<span className="user-role">Administrador</span>
						</div>
					</div>

					<button
						className="logout-btn"
						onClick={handleLogout}
						disabled={isLoading}
						title="Fazer logout"
						type="button"
						aria-label="Fazer logout"
					>
						<i
							className={`fas fa-${
								isLoading ? "spinner fa-spin" : "sign-out-alt"
							}`}
							aria-hidden="true"
						></i>
						<span>{isLoading ? "Saindo..." : "Sair"}</span>
					</button>
				</div>
			</aside>

			{/* Main Content - Reutilizando estrutura do Dashboard */}
			<main className="admin-main dashboard-main">
				{/* Header */}
				<header className="admin-header dashboard-header">
					<div className="header-left">
						{/* Botão de menu mobile */}
						{isMobile && (
							<button
								className="mobile-menu-toggle"
								onClick={toggleSidebarMobile}
								title="Abrir menu"
								type="button"
								aria-label="Abrir menu de navegação"
								aria-expanded={sidebarOpen}
							>
								<i className="fas fa-bars" aria-hidden="true"></i>
							</button>
						)}

						<h1 className="page-title">{getCurrentPageTitle()}</h1>
					</div>

					<div className="header-right">
						<div className="admin-badge">
							<i className="fas fa-shield-alt" aria-hidden="true"></i>
							<span>Admin</span>
						</div>
					</div>
				</header>

				{/* Content Area */}
				<div className="admin-content dashboard-content" role="main">
					<Routes>
						<Route index element={<AdminOverview />} />
						<Route path="clients" element={<ClientsManagement />} />
						<Route path="users" element={<UsersManagement />} />
						<Route path="invites" element={<InvitesManagement />} />
						<Route path="settings" element={<SystemSettings />} />
						<Route path="logs" element={<SystemLogs />} />
						<Route path="*" element={<Navigate to="/admin" replace />} />
					</Routes>
				</div>
			</main>

			{/* Overlay for mobile */}
			{isMobile && (
				<div
					className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
					onClick={closeSidebarMobile}
					aria-hidden="true"
				></div>
			)}
		</div>
	);
};

export default AdminPanel;
