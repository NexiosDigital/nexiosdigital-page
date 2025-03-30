import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

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

	// Detectar scroll para adicionar sombra na navbar
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

	return (
		<>
			<nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
				<div className="container navbar-container">
					{/* Logo */}
					<Link to="/" className="logo" onClick={closeMenu}>
						<span className="logo-text">Nexios Digital</span>
					</Link>

					{/* Navegação desktop centralizada */}
					<div className="navbar-center">
						<div className="navbar-links desktop-links">
							<Link to="/">Home</Link>
							<Link to="/about">Sobre Nós</Link>

							{/* Dropdown de serviços */}
							<div className="dropdown-container">
								<button
									className="dropdown-trigger"
									onMouseEnter={() => setServicesDropdownOpen(true)}
									onMouseLeave={() => setServicesDropdownOpen(false)}
									onClick={toggleServicesDropdown}
								>
									Serviços <i className="fas fa-chevron-down"></i>
								</button>
								<div
									className={`dropdown-menu ${
										servicesDropdownOpen ? "open" : ""
									}`}
									onMouseEnter={() => setServicesDropdownOpen(true)}
									onMouseLeave={() => setServicesDropdownOpen(false)}
								>
									<Link to="/services/ai-customer-service" onClick={closeMenu}>
										Agentes de IA para Atendimento
									</Link>
									<Link to="/services/sales-automation" onClick={closeMenu}>
										Automação de Vendas
									</Link>
									<Link to="/services/process-automation" onClick={closeMenu}>
										Automação de Processos
									</Link>
									<Link to="/services/clickup-automation" onClick={closeMenu}>
										Automação com ClickUp
									</Link>
								</div>
							</div>

							<Link to="/ai-chat">Assistente IA</Link>
						</div>
					</div>

					{/* Botão de contato (visível apenas em desktop) */}
					<div className="contact-button">
						<a href="#contact" className="btn btn-primary">
							<i className="fas fa-envelope"></i> Contato
						</a>
					</div>

					{/* Botão de menu - posicionado absolutamente no canto direito */}
					<button
						className={`menu-toggle ${menuOpen ? "active" : ""}`}
						onClick={toggleMenu}
						aria-label="Menu principal"
					>
						<span></span>
						<span></span>
						<span></span>
					</button>
				</div>
			</nav>

			{/* Menu mobile fullscreen com blur */}
			<div className={`fullscreen-menu ${menuOpen ? "active" : ""}`}>
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
						<Link to="/" onClick={closeMenu}>
							Home
						</Link>
						<Link to="/about" onClick={closeMenu}>
							Sobre Nós
						</Link>

						{/* Serviços no menu mobile */}
						<div className="mobile-dropdown">
							<button
								className="mobile-dropdown-trigger"
								onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
							>
								Serviços{" "}
								<i
									className={`fas fa-chevron-${
										servicesDropdownOpen ? "up" : "down"
									}`}
								></i>
							</button>
							<div
								className={`mobile-dropdown-content ${
									servicesDropdownOpen ? "open" : ""
								}`}
							>
								<Link to="/services/ai-customer-service" onClick={closeMenu}>
									Agentes de IA para Atendimento
								</Link>
								<Link to="/services/sales-automation" onClick={closeMenu}>
									Automação de Vendas
								</Link>
								<Link to="/services/process-automation" onClick={closeMenu}>
									Automação de Processos
								</Link>
								<Link to="/services/clickup-automation" onClick={closeMenu}>
									Automação com ClickUp
								</Link>
							</div>
						</div>

						<Link to="/ai-chat" onClick={closeMenu}>
							Assistente IA
						</Link>
					</div>
					<div className="mobile-actions">
						<a
							href="#contact"
							className="btn btn-primary btn-lg"
							onClick={closeMenu}
						>
							<i className="fas fa-envelope"></i> Contato
						</a>
					</div>
				</div>
			</div>
		</>
	);
};

export default Navbar;
