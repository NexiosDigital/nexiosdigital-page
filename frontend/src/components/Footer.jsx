import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer className="footer">
			<div className="container">
				<div className="footer-content">
					<div className="footer-column">
						<h3>Nexios Digital</h3>
						<p>
							Transformando negócios com soluções de inteligência artificial
							inovadoras.
						</p>
					</div>

					<div className="footer-column">
						<h3>Links Rápidos</h3>
						<ul className="footer-links">
							<li>
								<Link to="/">Home</Link>
							</li>
							<li>
								<Link to="/about">Sobre Nós</Link>
							</li>
							<li>
								<Link to="/ai-chat">Assistente IA</Link>
							</li>
							<li>
								<Link to="/register">Cadastre-se</Link>
							</li>
						</ul>
					</div>

					<div className="footer-column">
						<h3>Serviços</h3>
						<ul className="footer-links">
							<li>
								<Link to="/services/ai-agents">Agentes de IA</Link>
							</li>
							<li>
								<Link to="/services/sales-automation">Automação de Vendas</Link>
							</li>
							<li>
								<Link to="/services/process-automation">
									Automação de Processos
								</Link>
							</li>
							<li>
								<Link to="/services/consulting">Consultoria em IA</Link>
							</li>
						</ul>
					</div>

					<div className="footer-column">
						<h3>Contato</h3>
						<ul className="footer-links">
							<li>
								<a href="mailto:administracao@nexiosdigital.com">
									administracao@nexiosdigital.com
								</a>
							</li>
							<li>
								<a href="tel:+551190000000">+55 22 97403-3384</a>
							</li>
							<li>Campos dos Goytacazes - RJ - Brasil</li>
						</ul>
					</div>
				</div>

				<div className="footer-bottom">
					<p>
						&copy; {new Date().getFullYear()} Nexios Digital. Todos os direitos
						reservados.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
