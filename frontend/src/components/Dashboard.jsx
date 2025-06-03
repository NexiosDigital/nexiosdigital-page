import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Componentes do Dashboard
import DashboardOverview from "./dashboard/DashboardOverview";
import AutomationsList from "./dashboard/AutomationsList";
import Reports from "./dashboard/Reports";
import Settings from "./dashboard/Settings";
import Support from "./dashboard/Support";
import "../styles/Dashboard.css";

const Dashboard = () => {
	const { user, logout } = useAuth();
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	// Menu items baseado no papel do usuário
	const getMenuItems = () => {
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
	};

	const menuItems = getMenuItems();

	// Função para alternar sidebar colapsada
	const toggleSidebarCollapse = () => {
		setSidebarCollapsed(!sidebarCollapsed);
		// Salvar preferência no localStorage
		localStorage.setItem("dashboard_sidebar_collapsed", !sidebarCollapsed);
	};

	// Função para alternar sidebar mobile
	const toggleSidebarMobile = () => {
		setSidebarOpen(!sidebarOpen);
	};

	// Carregar preferência de sidebar do localStorage
	useEffect(() => {
		const savedCollapse = localStorage.getItem("dashboard_sidebar_collapsed");
		if (savedCollapse === "true") {
			setSidebarCollapsed(true);
		}
	}, []);

	// Fechar sidebar mobile ao mudar de rota
	useEffect(() => {
		setSidebarOpen(false);
	}, [location.pathname]);

	// Fechar sidebar mobile ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				sidebarOpen &&
				!event.target.closest(".dashboard-sidebar") &&
				!event.target.closest(".mobile-menu-toggle")
			) {
				setSidebarOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [sidebarOpen]);

	const handleLogout = async () => {
		try {
			await logout();
			window.location.href = "/";
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
		}
	};

	const isActivePath = (path, exact = false) => {
		if (exact) {
			return location.pathname === path;
		}
		return location.pathname.startsWith(path);
	};

	return (
		<div className="dashboard-layout">
			{/* Sidebar */}
			<aside
				className={`dashboard-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
					sidebarOpen ? "open" : ""
				}`}
			>
				<div className="sidebar-header">
					<div className="logo">
						<h2>Nexios Digital</h2>
					</div>
					<button
						className="sidebar-toggle"
						onClick={toggleSidebarCollapse}
						title={sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
					>
						<i
							className={`fas fa-${
								sidebarCollapsed ? "chevron-right" : "chevron-left"
							}`}
						></i>
					</button>
				</div>

				<nav className="sidebar-nav">
					<ul className="nav-list">
						{menuItems.map((item) => (
							<li key={item.path} className="nav-item">
								{item.external ? (
									<a
										href={item.path}
										className={`nav-link ${
											isActivePath(item.path, item.exact) ? "active" : ""
										}`}
										title={item.label}
									>
										<i className={item.icon}></i>
										<span>{item.label}</span>
									</a>
								) : (
									<Link
										to={item.path}
										className={`nav-link ${
											isActivePath(item.path, item.exact) ? "active" : ""
										}`}
										title={item.label}
									>
										<i className={item.icon}></i>
										<span>{item.label}</span>
									</Link>
								)}
							</li>
						))}
					</ul>
				</nav>

				<div className="sidebar-footer">
					<div className="user-info">
						<div className="user-avatar">
							<i className="fas fa-user"></i>
						</div>
						<div className="user-details">
							<span className="user-name" title={user?.profile?.name}>
								{user?.profile?.name}
							</span>
							<span className="user-role">{user?.profile?.role}</span>
						</div>
					</div>
					<button
						className="logout-btn"
						onClick={handleLogout}
						title="Fazer logout"
					>
						<i className="fas fa-sign-out-alt"></i>
						<span>Sair</span>
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className="dashboard-main">
				{/* Header */}
				<header className="dashboard-header">
					<div className="header-left">
						<button
							className="mobile-menu-toggle"
							onClick={toggleSidebarMobile}
							title="Menu"
						>
							<i className="fas fa-bars"></i>
						</button>
						<h1 className="page-title">
							{menuItems.find((item) => isActivePath(item.path, item.exact))
								?.label || "Dashboard"}
						</h1>
					</div>
					<div className="header-right">
						<div className="header-info">
							<span className="client-name" title={user?.client?.name}>
								{user?.client?.name || "Nexios Digital"}
							</span>
							<span
								className="plan-badge"
								title={`Plano ${user?.client?.plan || "admin"}`}
							>
								{user?.client?.plan || "admin"}
							</span>
						</div>
						<div className="user-menu">
							<button className="user-menu-btn" title="Menu do usuário">
								<i className="fas fa-user-circle"></i>
							</button>
						</div>
					</div>
				</header>

				{/* Content Area */}
				<div className="dashboard-content">
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
			{sidebarOpen && (
				<div
					className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
					onClick={() => setSidebarOpen(false)}
				></div>
			)}
		</div>
	);
};

export default Dashboard;
