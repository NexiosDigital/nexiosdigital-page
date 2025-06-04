import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Componentes do Dashboard
import DashboardOverview from "./dashboard/DashboardOverview";
import AutomationsList from "./dashboard/AutomationsList";
import Reports from "./dashboard/Reports";
import Settings from "./dashboard/Settings";
import Support from "./dashboard/Support";

// Hooks customizados
import { useSidebar } from "../hooks/useSidebar";
import { useActiveRoute } from "../hooks/useActiveRoute";
import { useKeyboard } from "../hooks/useKeyboard";
import { useMediaQuery } from "../hooks/useMediaQuery";

// Estilos
import "../styles/Dashboard.css";

const Dashboard = () => {
	const { user, logout } = useAuth();
	const location = useLocation();

	// Hook customizado para sidebar com todas as funcionalidades
	const {
		sidebarOpen,
		sidebarCollapsed,
		isMobile,
		toggleSidebarCollapse,
		toggleSidebarMobile,
		closeSidebarMobile,
		getSidebarClasses,
	} = useSidebar("dashboard_sidebar_collapsed");

	// Estados de carregamento e controle
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

	// Hook para rotas ativas
	const { isActivePath, getCurrentPageTitle } = useActiveRoute(menuItems);

	// Breakpoints para responsividade
	const { isMobile: isMobileBreakpoint } = useMediaQuery("(max-width: 1023px)");

	// Fechar sidebar mobile ao mudar de rota
	useEffect(() => {
		if (isMobile) {
			closeSidebarMobile();
		}
	}, [location.pathname, isMobile, closeSidebarMobile]);

	// Atalhos de teclado otimizados
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
			// Redirecionamento será tratado pelo AuthContext
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
			// Aqui você pode adicionar uma notificação de erro
		} finally {
			setIsLoading(false);
		}
	}, [logout, isLoading]);

	// Classes CSS dinâmicas para a sidebar - otimizado
	const sidebarClasses = useMemo(() => {
		return getSidebarClasses("dashboard-sidebar");
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

	// Prevenir scroll quando sidebar mobile está aberta
	useEffect(() => {
		if (isMobile && sidebarOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}

		return () => {
			document.body.style.overflow = "auto";
		};
	}, [isMobile, sidebarOpen]);

	return (
		<div className="dashboard-layout">
			{/* Sidebar */}
			<aside className={sidebarClasses}>
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
