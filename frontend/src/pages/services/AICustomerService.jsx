import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/ServicePage.css";

const AICustomerService = () => {
	// Efeito de animação aos elementos quando a página carrega
	useEffect(() => {
		const animatedElements = document.querySelectorAll(".animate-on-scroll");

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("animate");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.1 }
		);

		animatedElements.forEach((el) => observer.observe(el));

		return () => {
			animatedElements.forEach((el) => observer.unobserve(el));
		};
	}, []);

	return (
		<div className="service-page">
			{/* Hero Section */}
			<section className="service-hero">
				<div className="container">
					<h1 className="animate-on-scroll">
						Atendimento ao Cliente{" "}
						<span className="text-gradient">Inteligente</span>
					</h1>
					<p className="service-subtitle animate-on-scroll">
						Transforme a experiência dos seus clientes com assistentes virtuais
						avançados que entendem e antecipam necessidades
					</p>
					<div className="hero-buttons animate-on-scroll">
						<a href="#contact" className="btn btn-primary">
							<i className="fas fa-paper-plane"></i> Solicitar Demonstração
						</a>
						<Link to="/about" className="btn btn-secondary">
							<i className="fas fa-info-circle"></i> Conhecer a Nexios
						</Link>
					</div>
				</div>
			</section>

			{/* Descrição do Serviço */}
			<section className="section service-description bg-gradient">
				<div className="container">
					<div className="service-content">
						<div className="service-content-text animate-on-scroll">
							<h2>Assistentes virtuais que vão além das respostas básicas</h2>
							<p>
								Na era da experiência do cliente, a Nexios Digital está na
								vanguarda, oferecendo soluções de atendimento impulsionadas por
								Inteligência Artificial que transformam a maneira como as
								empresas se conectam com seus consumidores.
							</p>
							<p>
								Nosso sistema de atendimento ao cliente inteligente é projetado
								para oferecer suporte 24/7, respostas instantâneas e uma
								experiência altamente personalizada. Utilizamos tecnologias
								avançadas de processamento de linguagem natural (NLP) e
								aprendizado de máquina para criar chatbots e assistentes
								virtuais que não apenas respondem a perguntas, mas
								verdadeiramente entendem e antecipam as necessidades dos
								clientes.
							</p>
						</div>
						<div className="service-content-icon animate-on-scroll">
							<div className="service-icon">
								<i className="fas fa-robot"></i>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Recursos */}
			<section className="section service-features">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						Recursos Principais
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Conheça o que torna nossos assistentes virtuais verdadeiramente
						excepcionais
					</p>

					<div className="features-grid">
						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-globe"></i>
							</div>
							<h3>Chatbots Multilíngues</h3>
							<p>
								Nossos assistentes são capazes de se comunicar em diversos
								idiomas, garantindo um atendimento global e eliminando barreiras
								linguísticas para seus clientes internacionais.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-heart"></i>
							</div>
							<h3>Análise de Sentimento</h3>
							<p>
								Detectamos o tom e a emoção do cliente em tempo real, ajustando
								as respostas adequadamente para oferecer uma interação mais
								humana e empática.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-random"></i>
							</div>
							<h3>Integração Omnichannel</h3>
							<p>
								Oferecemos uma experiência consistente em todos os canais de
								atendimento, seja chat, e-mail, redes sociais ou telefone, com
								histórico unificado de conversas.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-tachometer-alt"></i>
							</div>
							<h3>Escalabilidade Automática</h3>
							<p>
								Nosso sistema se adapta automaticamente a picos de demanda,
								garantindo tempos de resposta rápidos mesmo em períodos de alto
								volume de atendimento.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-brain"></i>
							</div>
							<h3>Aprendizado Contínuo</h3>
							<p>
								Nossos sistemas de IA melhoram constantemente com cada
								interação, tornando-se mais eficientes e precisos ao longo do
								tempo através de machine learning.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-user-friends"></i>
							</div>
							<h3>Escalonamento Inteligente</h3>
							<p>
								Transferimos seamlessly conversas complexas para agentes
								humanos, garantindo que questões delicadas sejam tratadas com o
								toque pessoal necessário.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Como Funciona */}
			<section className="section how-it-works-section">
				<div className="container">
					<h2 className="section-title animate-on-scroll">Como Funciona</h2>
					<p className="section-subtitle animate-on-scroll">
						Uma abordagem em etapas para implementar atendimento inteligente na
						sua empresa
					</p>

					<div className="steps-container">
						<div className="step animate-on-scroll">
							<div className="step-number">01</div>
							<div className="step-content">
								<h3>Análise de Atendimento</h3>
								<p>
									Analisamos seu processo atual de atendimento ao cliente,
									identificando gargalos, perguntas frequentes e oportunidades
									de automação para maximizar benefícios.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">02</div>
							<div className="step-content">
								<h3>Customização de Conhecimento</h3>
								<p>
									Desenvolvemos uma base de conhecimento personalizada para seu
									negócio, treinando o sistema com informações específicas sobre
									seus produtos, serviços e políticas.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">03</div>
							<div className="step-content">
								<h3>Implementação e Integração</h3>
								<p>
									Implementamos o assistente virtual em todos os canais
									desejados, integrando-o perfeitamente com seus sistemas
									existentes, como CRM, ERP e bases de conhecimento.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">04</div>
							<div className="step-content">
								<h3>Otimização Contínua</h3>
								<p>
									Monitoramos o desempenho e coletamos feedback para
									aprimoramento constante, ajustando o sistema para melhorar a
									precisão e eficácia das respostas ao longo do tempo.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Estatísticas */}
			<section className="section service-stats bg-gradient">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						Resultados Comprovados
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Benefícios mensuráveis que nossos clientes experimentam com nosso
						atendimento inteligente
					</p>

					<div className="stats-grid">
						<div className="stat-card animate-on-scroll">
							<div className="stat-value">70%</div>
							<div className="stat-label">Redução no tempo de resposta</div>
							<p className="stat-description">
								Respostas instantâneas para perguntas comuns e redução
								significativa no tempo de resolução de problemas mais complexos.
							</p>
						</div>

						<div className="stat-card animate-on-scroll">
							<div className="stat-value">50%</div>
							<div className="stat-label">Aumento na satisfação do cliente</div>
							<p className="stat-description">
								Clientes mais satisfeitos com respostas rápidas, precisas e
								personalizadas que resolvem seus problemas eficientemente.
							</p>
						</div>

						<div className="stat-card animate-on-scroll">
							<div className="stat-value">40%</div>
							<div className="stat-label">
								Economia nos custos de atendimento
							</div>
							<p className="stat-description">
								Redução significativa nos custos operacionais de atendimento ao
								cliente, permitindo que sua equipe se concentre em tarefas de
								maior valor.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="section service-cta">
				<div className="container">
					<div className="cta-content animate-on-scroll">
						<h2>Transforme seu atendimento ao cliente</h2>
						<p>
							Solicite uma demonstração gratuita e descubra como nossos
							assistentes virtuais inteligentes podem revolucionar a experiência
							dos seus clientes e otimizar seus recursos.
						</p>
						<div className="cta-buttons">
							<a href="#contact" className="btn btn-primary">
								<i className="fas fa-paper-plane"></i> Solicitar Demonstração
							</a>
							<a
								href="https://wa.me/5522974033384"
								className="btn btn-secondary"
							>
								<i className="fab fa-whatsapp"></i> Falar com Especialista
							</a>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AICustomerService;
