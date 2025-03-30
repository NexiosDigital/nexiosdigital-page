import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
	const location = useLocation();

	// Função para alternar o estado do menu mobile
	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
		// Bloquear/desbloquear scroll do body quando o menu está aberto/fechado
		document.body.style.overflow = !menuOpen ? "hidden" : "auto";
	};

	// Fechar o menu quando um link é clicado
	const closeMenu = () => {
		setMenuOpen(false);
		document.body.style.overflow = "auto";
	};

	// Detectar scroll para adicionar efeitos na navbar
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 20) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Fechar o menu quando a tela for redimensionada para desktop
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 768) {
				setMenuOpen(false);
				document.body.style.overflow = "auto";
			}
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
			document.body.style.overflow = "auto";
		};
	}, []);

	// Lidar com o hover/click no dropdown de serviços
	const toggleServicesDropdown = () => {
		setServicesDropdownOpen(!servicesDropdownOpen);
	};

	// Verificar se um link está ativo
	const isActive = (path) => {
		if (path === "/") {
			return location.pathname === path;
		}
		return location.pathname.startsWith(path);
	};

	// Verificar se algum serviço está ativo
	const isServicesActive = () => {
		return location.pathname.includes("/services/");
	};

	return (
		<>
			<nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
				<div className="container navbar-container">
					{/* Logo com efeito de hover melhorado */}
					<Link to="/" className="logo" onClick={closeMenu}>
						<span className="logo-text">Nexios Digital</span>
					</Link>

					{/* Navegação desktop centralizada */}
					<div className="navbar-center">
						<div className="navbar-links desktop-links">
							<Link
								to="/"
								className={isActive("/") ? "active" : ""}
								onClick={closeMenu}
							>
								Home
								{isActive("/") && <span className="nav-indicator"></span>}
							</Link>

							<Link
								to="/about"
								className={isActive("/about") ? "active" : ""}
								onClick={closeMenu}
							>
								Sobre Nós
								{isActive("/about") && <span className="nav-indicator"></span>}
							</Link>

							{/* Dropdown de serviços com indicador de ativo */}
							<div className="dropdown-container">
								<button
									className={`dropdown-trigger ${
										isServicesActive() ? "active" : ""
									}`}
									onMouseEnter={() => setServicesDropdownOpen(true)}
									onMouseLeave={() => setServicesDropdownOpen(false)}
									onClick={toggleServicesDropdown}
								>
									Serviços
									<i
										className={`fas fa-chevron-${
											servicesDropdownOpen ? "up" : "down"
										}`}
									></i>
									{isServicesActive() && (
										<span className="nav-indicator"></span>
									)}
								</button>
								<div
									className={`dropdown-menu ${
										servicesDropdownOpen ? "open" : ""
									}`}
									onMouseEnter={() => setServicesDropdownOpen(true)}
									onMouseLeave={() => setServicesDropdownOpen(false)}
								>
									<Link
										to="/services/ai-customer-service"
										className={
											isActive("/services/ai-customer-service") ? "active" : ""
										}
										onClick={closeMenu}
									>
										Agentes de IA para Atendimento
									</Link>
									<Link
										to="/services/sales-automation"
										className={
											isActive("/services/sales-automation") ? "active" : ""
										}
										onClick={closeMenu}
									>
										Automação de Vendas
									</Link>
									<Link
										to="/services/process-automation"
										className={
											isActive("/services/process-automation") ? "active" : ""
										}
										onClick={closeMenu}
									>
										Automação de Processos
									</Link>
									<Link
										to="/services/clickup-automation"
										className={
											isActive("/services/clickup-automation") ? "active" : ""
										}
										onClick={closeMenu}
									>
										Automação com ClickUp
									</Link>
								</div>
							</div>

							<Link
								to="/ai-chat"
								className={isActive("/ai-chat") ? "active" : ""}
								onClick={closeMenu}
							>
								Assistente IA
								{isActive("/ai-chat") && (
									<span className="nav-indicator"></span>
								)}
							</Link>
						</div>
					</div>

					{/* Botão de contato (visível apenas em desktop) */}
					<div className="contact-button">
						<a href="#contact" className="btn btn-primary">
							<i className="fas fa-envelope"></i> Contato
							<span className="btn-glow"></span>
						</a>
					</div>

					{/* Botão de menu - posicionado absolutamente no canto direito */}
					<button
						className={`menu-toggle ${menuOpen ? "active" : ""}`}
						onClick={toggleMenu}
						aria-label="Menu principal"
						aria-expanded={menuOpen}
					>
						<span></span>
						<span></span>
						<span></span>
					</button>
				</div>
			</nav>

			{/* Menu mobile fullscreen com blur e animações melhoradas */}
			<div className={`fullscreen-menu ${menuOpen ? "active" : ""}`}>
				<div className="menu-backdrop"></div>
				<div className="menu-content">
					{/* Botão X para fechar menu posicionado no canto direito */}
					<button
						className="menu-close-btn"
						onClick={toggleMenu}
						aria-label="Fechar menu"
					>
						<span></span>
						<span></span>
					</button>

					<div className="mobile-links">
						<Link
							to="/"
							className={isActive("/") ? "active" : ""}
							onClick={closeMenu}
						>
							Home
							{isActive("/") && <span className="mobile-nav-indicator"></span>}
						</Link>
						<Link
							to="/about"
							className={isActive("/about") ? "active" : ""}
							onClick={closeMenu}
						>
							Sobre Nós
							{isActive("/about") && (
								<span className="mobile-nav-indicator"></span>
							)}
						</Link>

						{/* Serviços no menu mobile com indicador de ativo */}
						<div className="mobile-dropdown">
							<button
								className={`mobile-dropdown-trigger ${
									isServicesActive() ? "active" : ""
								}`}
								onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
							>
								Serviços{" "}
								<i
									className={`fas fa-chevron-${
										servicesDropdownOpen ? "up" : "down"
									}`}
								></i>
								{isServicesActive() && (
									<span className="mobile-nav-indicator"></span>
								)}
							</button>
							<div
								className={`mobile-dropdown-content ${
									servicesDropdownOpen ? "open" : ""
								}`}
							>
								<Link
									to="/services/ai-customer-service"
									className={
										isActive("/services/ai-customer-service") ? "active" : ""
									}
									onClick={closeMenu}
								>
									Agentes de IA para Atendimento
								</Link>
								<Link
									to="/services/sales-automation"
									className={
										isActive("/services/sales-automation") ? "active" : ""
									}
									onClick={closeMenu}
								>
									Automação de Vendas
								</Link>
								<Link
									to="/services/process-automation"
									className={
										isActive("/services/process-automation") ? "active" : ""
									}
									onClick={closeMenu}
								>
									Automação de Processos
								</Link>
								<Link
									to="/services/clickup-automation"
									className={
										isActive("/services/clickup-automation") ? "active" : ""
									}
									onClick={closeMenu}
								>
									Automação com ClickUp
								</Link>
							</div>
						</div>

						<Link
							to="/ai-chat"
							className={isActive("/ai-chat") ? "active" : ""}
							onClick={closeMenu}
						>
							Assistente IA
							{isActive("/ai-chat") && (
								<span className="mobile-nav-indicator"></span>
							)}
						</Link>
					</div>
					<div className="mobile-actions">
						<a
							href="#contact"
							className="btn btn-primary btn-lg"
							onClick={closeMenu}
						>
							<i className="fas fa-envelope"></i> Contato
							<span className="btn-glow"></span>
						</a>
					</div>
				</div>
			</div>
		</>
	);
};

export default Navbar;
