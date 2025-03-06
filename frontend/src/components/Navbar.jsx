import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-white.svg"; // Certifique-se de que o caminho está correto

const Navbar = () => {
	return (
		<nav className="navbar">
			<div className="container navbar-container">
				<Link to="/" className="logo">
					<span className="logo-text">Nexios Digital</span>
				</Link>

				<div className="navbar-links">
					<Link to="/">Home</Link>
					<Link to="/about">Sobre Nós</Link>
					<Link to="/ai-chat">Assistente IA</Link>
				</div>

				<div className="user-actions">
					<a href="#contact" className="btn btn-primary">
						<i className="fas fa-envelope"></i> Contato
					</a>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
