import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

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
