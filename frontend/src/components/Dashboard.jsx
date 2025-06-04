import React, { useState, useCallback, useMemo } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Componentes do Dashboard
import DashboardOverview from "./dashboard/DashboardOverview";
import AutomationsList from "./dashboard/AutomationsList";
import Reports from "./dashboard/Reports";
import Settings from "./dashboard/Settings";
import Support from "./dashboard/Support";

// Hook otimizado para sidebar
import { useOptimizedSidebar } from "../hooks/useSidebar";

// Estilos
import "../styles/Dashboard.css";

const Dashboard = () => {
	const { user, logout } = useAuth();
	const location = useLocation();

	// Estados para controle da sidebar - HOOK OTIMIZADO
	const {
		sidebarOpen,
		sidebarCollapsed,
		isMobile,
		toggleSidebarCollapse,
		toggleSidebarMobile,
		closeSidebarMobile,
		getSidebarClasses,
		getTooltipProps,
	} = useOptimizedSidebar("dashboard_sidebar_collapsed");

	const [isLoading, setIsLoading] = useState(false);

	// Menu items baseado no papel do usuário - memoizado para performance
	const menuItems = useMemo(() => {
		const baseItems = [
			{
				path: "/dashboard",
				icon: "fas fa-chart-line",
				label: "Visão Geral",
				exact: true,
			},
			{
				path: "/dashboard/automations",
				icon: "fas fa-robot",
				label: "Automações",
			},
			{
				path: "/dashboard/reports",
				icon: "fas fa-chart-bar",
				label: "Relatórios",
			},
			{
				path: "/dashboard/support",
				icon: "fas fa-headset",
				label: "Suporte",
			},
			{
				path: "/dashboard/settings",
				icon: "fas fa-cog",
				label: "Configurações",
			},
		];

		// Adicionar itens específicos para administradores
		if (user?.profile?.role === "admin") {
			baseItems.splice(-1, 0, {
				path: "/admin",
				icon: "fas fa-users-cog",
				label: "Painel Admin",
				external: true,
			});
		}

		return baseItems;
	}, [user?.profile?.role]);

	// Função para verificar se um path está ativo
	const isActivePath = useCallback(
		(path, exact = false) => {
			if (exact) {
				return location.pathname === path;
			}
			return location.pathname.startsWith(path);
		},
		[location.pathname]
	);

	// Obter título da página atual
	const getCurrentPageTitle = useCallback(() => {
		const currentItem = menuItems.find((item) =>
			item.exact
				? location.pathname === item.path
				: location.pathname.startsWith(item.path)
		);
		return currentItem?.label || "Dashboard";
	}, [menuItems, location.pathname]);

	// Função de logout otimizada - MANTIDA
	const handleLogout = useCallback(async () => {
		if (isLoading) return;

		try {
			setIsLoading(true);
			await logout();
			// Redirecionamento será tratado pelo AuthContext
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
			// Você pode adicionar uma notificação de erro aqui
		} finally {
			setIsLoading(false);
		}
	}, [logout, isLoading]);

	// Renderizar link de navegação - ATUALIZADO com tooltips
	const renderNavLink = useCallback(
		(item) => {
			const isActive = isActivePath(item.path, item.exact);
			const linkClass = `nav-link ${isActive ? "active" : ""}`;
			const tooltip = sidebarCollapsed && !isMobile ? item.label : "";

			if (item.external) {
				return (
					<a
						key={item.path}
						href={item.path}
						className={linkClass}
						title={tooltip}
						aria-label={item.label}
						{...getTooltipProps(item.path, item.label)}
					>
						<i className={item.icon} aria-hidden="true"></i>
						<span>{item.label}</span>
					</a>
				);
			}

			return (
				<Link
					key={item.path}
					to={item.path}
					className={linkClass}
					title={tooltip}
					aria-label={item.label}
					{...getTooltipProps(item.path, item.label)}
				>
					<i className={item.icon} aria-hidden="true"></i>
					<span>{item.label}</span>
				</Link>
			);
		},
		[isActivePath, sidebarCollapsed, isMobile, getTooltipProps]
	);

	return (
		<div className="dashboard-layout">
			{/* Sidebar - ATUALIZADA com hook otimizado */}
			<aside className={getSidebarClasses("dashboard-sidebar")}>
				<div className="sidebar-header">
					<div className="logo">
						<h2>Nexios Digital</h2>
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
					aria-label="Menu principal"
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
						<div className="user-avatar" aria-hidden="true">
							<i className="fas fa-user"></i>
						</div>
						<div className="user-details">
							<span
								className="user-name"
								title={user?.profile?.name}
								aria-label={`Usuário: ${user?.profile?.name}`}
							>
								{user?.profile?.name}
							</span>
							<span className="user-role">{user?.profile?.role}</span>
						</div>
					</div>

					<button
						className="logout-btn"
						onClick={handleLogout}
						disabled={isLoading}
						title="Fazer logout"
						type="button"
						aria-label="Fazer logout"
						{...getTooltipProps("logout", "Sair")}
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

			{/* Main Content */}
			<main className="dashboard-main">
				{/* Header */}
				<header className="dashboard-header">
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
						<div className="header-info">
							<span
								className="client-name"
								title={user?.client?.name}
								aria-label={`Cliente: ${user?.client?.name}`}
							>
								{user?.client?.name || "Nexios Digital"}
							</span>
							<span
								className="plan-badge"
								title={`Plano ${user?.client?.plan || "admin"}`}
								aria-label={`Plano: ${user?.client?.plan || "admin"}`}
							>
								{user?.client?.plan || "admin"}
							</span>
						</div>

						<div className="user-menu">
							<button
								className="user-menu-btn"
								title="Menu do usuário"
								type="button"
								aria-label="Abrir menu do usuário"
							>
								<i className="fas fa-user-circle" aria-hidden="true"></i>
							</button>
						</div>
					</div>
				</header>

				{/* Content Area */}
				<div className="dashboard-content" role="main">
					<Routes>
						<Route index element={<DashboardOverview />} />
						<Route path="automations" element={<AutomationsList />} />
						<Route path="reports" element={<Reports />} />
						<Route path="settings" element={<Settings />} />
						<Route path="support" element={<Support />} />
						<Route path="*" element={<Navigate to="/dashboard" replace />} />
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

export default Dashboard;
