import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
	const [scrollPosition, setScrollPosition] = useState(0);
	const [isVisible, setIsVisible] = useState(false);

	// Detectar scroll para efeitos parallax
	useEffect(() => {
		const handleScroll = () => {
			setScrollPosition(window.scrollY);
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Detectar quando o footer entra na viewport
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setIsVisible(true);
					}
				});
			},
			{ threshold: 0.1 }
		);

		const footerElement = document.querySelector(".footer");
		if (footerElement) {
			observer.observe(footerElement);
		}

		return () => {
			if (footerElement) {
				observer.unobserve(footerElement);
			}
		};
	}, []);

	// Método para calcular o efeito parallax
	const calculateParallaxStyle = (factor) => {
		return {
			transform: `translateY(${scrollPosition * factor}px)`,
			transition: "transform 0.1s ease-out",
		};
	};

	// Ano atual para o copyright
	const currentYear = new Date().getFullYear();

	// Array de links rápidos
	const quickLinks = [
		{ text: "Home", path: "/" },
		{ text: "Sobre Nós", path: "/about" },
		{ text: "Assistente IA", path: "/ai-chat" },
		{ text: "Contato", path: "#contact" },
	];

	// Array de serviços
	const serviceLinks = [
		{
			text: "Agentes de IA para Atendimento",
			path: "/services/ai-customer-service",
		},
		{ text: "Automação de Vendas", path: "/services/sales-automation" },
		{ text: "Automação de Processos", path: "/services/process-automation" },
		{ text: "Automação com ClickUp", path: "/services/clickup-automation" },
	];

	// Array de redes sociais
	const socialLinks = [
		{ icon: "fab fa-instagram", url: "https://instagram.com/nexiosdigital" },
		{ icon: "fab fa-x", url: "https://x.com/" },
	];

	return (
		<footer className="footer">
			{/* Elementos de background */}
			<div className="footer-bg-elements">
				<div
					className="footer-particle particle-1"
					style={calculateParallaxStyle(-0.03)}
				></div>
				<div
					className="footer-particle particle-2"
					style={calculateParallaxStyle(-0.05)}
				></div>
				<div className="footer-grid"></div>
				<div className="footer-wave-top">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
						<path
							fill="rgba(15, 15, 19, 0.6)"
							fillOpacity="1"
							d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,101.3C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
						></path>
					</svg>
				</div>
			</div>

			<div className="container">
				<div className={`footer-content ${isVisible ? "visible" : ""}`}>
					<div className="footer-column brand-column">
						<h2 className="footer-logo">Nexios Digital</h2>
						<p className="footer-tagline">
							Transformando negócios com soluções de inteligência artificial
							inovadoras.
						</p>
						<div className="footer-social">
							{socialLinks.map((social, index) => (
								<a
									key={index}
									href={social.url}
									className="social-icon"
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Visite nossa página no ${social.icon.replace(
										"fab fa-",
										""
									)}`}
								>
									<i className={social.icon}></i>
									<span className="icon-hover-effect"></span>
								</a>
							))}
						</div>
					</div>

					<div className="footer-column links-column">
						<h3>Links Rápidos</h3>
						<ul className="footer-links">
							{quickLinks.map((link, index) => (
								<li key={index} style={{ animationDelay: `${index * 0.1}s` }}>
									{link.path.startsWith("#") ? (
										<a href={link.path}>
											<i className="fas fa-chevron-right"></i> {link.text}
										</a>
									) : (
										<Link to={link.path}>
											<i className="fas fa-chevron-right"></i> {link.text}
										</Link>
									)}
								</li>
							))}
						</ul>
					</div>

					<div className="footer-column links-column">
						<h3>Serviços</h3>
						<ul className="footer-links">
							{serviceLinks.map((link, index) => (
								<li key={index} style={{ animationDelay: `${index * 0.1}s` }}>
									<Link to={link.path}>
										<i className="fas fa-chevron-right"></i> {link.text}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div className="footer-column contact-column">
						<h3>Contato</h3>
						<ul className="footer-contact-info">
							<li>
								<i className="fas fa-envelope"></i>
								<a href="mailto:administracao@nexiosdigital.com">
									administracao@nexiosdigital.com
								</a>
							</li>
							<li>
								<i className="fas fa-phone-alt"></i>
								<a href="tel:+5522974033384">+55 22 97403-3384</a>
							</li>
							<li>
								<i className="fas fa-map-marker-alt"></i>
								<span>Campos dos Goytacazes - RJ - Brasil</span>
							</li>
						</ul>

						<div className="newsletter-form">
							<p>Assine nossa newsletter</p>
							<div className="form-group">
								<input
									type="email"
									placeholder="Seu email"
									className="newsletter-input"
								/>
								<button className="newsletter-btn">
									<i className="fas fa-paper-plane"></i>
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="footer-bottom">
					<div className="copyright">
						<p>
							&copy; {currentYear} Nexios Digital. Todos os direitos reservados.
						</p>
					</div>
					<div className="footer-terms">
						<a href="#">Termos de Uso</a>
						<span className="divider">|</span>
						<a href="#">Política de Privacidade</a>
					</div>
					<div
						className="back-to-top"
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
					>
						<i className="fas fa-chevron-up"></i>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
