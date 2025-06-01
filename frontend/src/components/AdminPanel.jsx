import React, { useState } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Componentes do Admin Panel
import AdminOverview from "./admin/AdminOverview";
import ClientsManagement from "./admin/ClientsManagement";
import UsersManagement from "./admin/UsersManagement";
import InvitesManagement from "./admin/InvitesManagement";
import SystemSettings from "./admin/SystemSettings";
import SystemLogs from "./admin/SystemLogs";
import "../styles/AdminPanel.css";

const AdminPanel = () => {
	const { user, logout } = useAuth();
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const menuItems = [
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
	];

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
		<div className="admin-layout">
			{/* Sidebar */}
			<aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
				<div className="sidebar-header">
					<div className="logo">
						<h2>Admin Panel</h2>
						<span className="subtitle">Nexios Digital</span>
					</div>
					<button
						className="sidebar-toggle"
						onClick={() => setSidebarOpen(!sidebarOpen)}
					>
						<i className="fas fa-bars"></i>
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
						<div className="user-avatar admin">
							<i className="fas fa-user-shield"></i>
						</div>
						<div className="user-details">
							<span className="user-name">{user?.profile?.name}</span>
							<span className="user-role">Administrador</span>
						</div>
					</div>
					<button className="logout-btn" onClick={handleLogout}>
						<i className="fas fa-sign-out-alt"></i>
						<span>Sair</span>
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className="admin-main">
				{/* Header */}
				<header className="admin-header">
					<div className="header-left">
						<button
							className="mobile-menu-toggle"
							onClick={() => setSidebarOpen(!sidebarOpen)}
						>
							<i className="fas fa-bars"></i>
						</button>
						<h1 className="page-title">
							{menuItems.find((item) => isActivePath(item.path, item.exact))
								?.label || "Admin Panel"}
						</h1>
					</div>
					<div className="header-right">
						<div className="admin-badge">
							<i className="fas fa-shield-alt"></i>
							<span>Admin</span>
						</div>
					</div>
				</header>

				{/* Content Area */}
				<div className="admin-content">
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
			{sidebarOpen && (
				<div
					className="sidebar-overlay"
					onClick={() => setSidebarOpen(false)}
				></div>
			)}
		</div>
	);
};

export default AdminPanel;
