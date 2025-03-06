import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
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
		<div className="home-page">
			{/* Hero Section */}
			<section className="hero">
				<div className="hero-bg-elements">
					<div className="hero-circle hero-circle-1"></div>
					<div className="hero-circle hero-circle-2"></div>
					<div className="hero-line hero-line-1"></div>
					<div className="hero-line hero-line-2"></div>
				</div>

				<div className="container">
					<h1 className="animate-on-scroll">
						Transformando Negócios
						<br />
						com <span className="text-gradient">Inteligência Artificial</span>
					</h1>
					<p className="animate-on-scroll">
						A Nexios Digital desenvolve soluções de IA inovadoras que
						automatizam processos, melhoram a experiência do cliente e
						impulsionam o crescimento dos negócios.
					</p>
					<div className="hero-buttons animate-on-scroll">
						<Link to="/about" className="btn btn-primary">
							<i className="fas fa-rocket"></i> Conheça Nossa Empresa
						</Link>
						<Link to="/ai-chat" className="btn btn-secondary">
							<i className="fas fa-robot"></i> Experimente Nossa IA
						</Link>
					</div>

					<div className="hero-stats animate-on-scroll">
						<div className="hero-stat">
							<div className="hero-stat-number">
								<span className="counter">98</span>%
							</div>
							<div className="hero-stat-label">
								Satisfação
								<br />
								de clientes
							</div>
						</div>
						<div className="hero-stat">
							<div className="hero-stat-number">
								<span className="counter">65</span>%
							</div>
							<div className="hero-stat-label">
								Redução de
								<br />
								custos
							</div>
						</div>
						<div className="hero-stat">
							<div className="hero-stat-number">
								<span className="counter">4.5</span>×
							</div>
							<div className="hero-stat-label">
								Aumento de
								<br />
								eficiência
							</div>
						</div>
					</div>
				</div>

				<div className="hero-scroll-indicator">
					<span>Role para explorar</span>
					<i className="fas fa-chevron-down"></i>
				</div>
			</section>

			{/* Serviços Section */}
			<section className="section services-section">
				<div class="services-section">
					<div class="container">
						<h2 class="section-title">Nossos Serviços</h2>
						<p class="section-subtitle">
							Combinamos tecnologia de ponta com expertise em negócios para
							criar soluções que transformam empresas.
						</p>

						<div class="services-grid">
							<div class="service-card card">
								<div class="card-icon">
									<i class="fas fa-robot"></i>
								</div>
								<div class="card-content">
									<h3 class="card-title">Agentes de IA para Atendimento</h3>
									<p>
										Automatize o atendimento ao cliente com agentes de IA que
										respondem perguntas frequentes, resolvem problemas comuns e
										escalonam para humanos quando necessário.
									</p>
									<a href="/services/ai-agents" class="card-link">
										Saiba mais <i class="fas fa-arrow-right"></i>
									</a>
								</div>
							</div>

							<div class="service-card card">
								<div class="card-icon">
									<i class="fas fa-chart-line"></i>
								</div>
								<div class="card-content">
									<h3 class="card-title">Automação de Vendas</h3>
									<p>
										Aumente a eficiência da sua equipe de vendas com ferramentas
										de IA que qualificam leads, personalizam comunicações e
										preveem o comportamento do cliente.
									</p>
									<a href="/services/sales-automation" class="card-link">
										Saiba mais <i class="fas fa-arrow-right"></i>
									</a>
								</div>
							</div>

							<div class="service-card card">
								<div class="card-icon">
									<i class="fas fa-cogs"></i>
								</div>
								<div class="card-content">
									<h3 class="card-title">Automação de Processos</h3>
									<p>
										Elimine tarefas repetitivas e reduza erros humanos com
										sistemas inteligentes que automatizam fluxos de trabalho em
										toda a organização.
									</p>
									<a href="/services/process-automation" class="card-link">
										Saiba mais <i class="fas fa-arrow-right"></i>
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Como Funciona Section */}
			<section className="section how-it-works-section">
				<div className="container">
					<h2 className="section-title animate-on-scroll">Como Trabalhamos</h2>
					<p className="section-subtitle animate-on-scroll">
						Nossa abordagem metódica garante resultados excepcionais para cada
						cliente
					</p>

					<div className="steps-container">
						<div className="step animate-on-scroll">
							<div className="step-number">01</div>
							<div className="step-content">
								<h3>Análise de Necessidades</h3>
								<p>
									Estudamos profundamente seus processos de negócio para
									identificar oportunidades de automação e melhoria com IA.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">02</div>
							<div className="step-content">
								<h3>Estratégia Personalizada</h3>
								<p>
									Desenvolvemos um plano detalhado com as soluções de IA mais
									adequadas para seu negócio e objetivos específicos.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">03</div>
							<div className="step-content">
								<h3>Implementação Avançada</h3>
								<p>
									Nossa equipe de especialistas implementa as soluções com foco
									em integração perfeita com seus sistemas existentes.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">04</div>
							<div className="step-content">
								<h3>Monitoramento e Otimização</h3>
								<p>
									Acompanhamos o desempenho das soluções e fazemos ajustes
									contínuos para maximizar resultados a longo prazo.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* IA Preview Section */}
			<section className="section ai-preview-section">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						Experimente Nossa IA
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Interaja com nosso assistente virtual e descubra como a IA pode
						transformar seu negócio
					</p>

					<div className="ai-preview-container">
						<div className="ai-preview-content animate-on-scroll">
							<h3>Interaja com Nossa IA</h3>
							<p>
								Experimente uma versão de demonstração do nosso assistente de IA
								para ver como ele pode ajudar em seus processos de negócios.
								Faça perguntas, solicite informações ou explore como ele pode
								automatizar suas tarefas.
							</p>
							<ul className="ai-capabilities">
								<li>
									<i className="fas fa-check-circle"></i> Atendimento 24/7 sem
									interrupções
								</li>
								<li>
									<i className="fas fa-check-circle"></i> Respostas instantâneas
									e consistentes
								</li>
								<li>
									<i className="fas fa-check-circle"></i> Integração com
									múltiplos canais
								</li>
								<li>
									<i className="fas fa-check-circle"></i> Personalização com
									base em dados
								</li>
							</ul>
							<Link to="/ai-chat" className="btn btn-primary">
								<i className="fas fa-comments"></i> Iniciar Conversa
							</Link>
						</div>

						<div className="ai-preview-demo animate-on-scroll">
							<div className="chat-preview">
								<div className="chat-preview-header">
									<i className="fas fa-robot"></i>
									<h4>Assistente Nexios</h4>
									<div className="chat-preview-status"></div>
								</div>

								<div className="chat-preview-messages">
									<div className="message message-ai">
										Olá! Sou o assistente virtual da Nexios Digital. Como posso
										ajudar você hoje?
									</div>
									<div className="message message-user">
										Como a IA pode melhorar o atendimento ao cliente?
									</div>
									<div className="message message-ai">
										A IA pode melhorar o atendimento ao cliente de várias
										maneiras: atendimento 24/7, respostas instantâneas,
										personalização com base em histórico, redução de tempo de
										espera e escalonamento inteligente para agentes humanos
										quando necessário.
									</div>
									<div className="message message-user">
										Quais são os custos envolvidos na implementação?
									</div>
									<div className="message message-ai typing-indicator">
										<span></span>
										<span></span>
										<span></span>
									</div>
								</div>

								<div className="chat-preview-input">
									<input
										type="text"
										className="chat-input"
										placeholder="Digite sua mensagem..."
										disabled
									/>
									<button className="chat-send-btn">
										<i className="fas fa-paper-plane"></i>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Números Section */}
			<section className="section numbers-section">
				<div className="container">
					<h2 className="section-title animate-on-scroll">Nossos Números</h2>
					<p className="section-subtitle animate-on-scroll">
						Resultados concretos que demonstram a eficácia das nossas soluções
					</p>

					<div className="numbers-grid">
						<div className="number-card animate-on-scroll">
							<div className="number-icon">
								<i className="fas fa-users"></i>
							</div>
							<div className="number-value">
								<span className="counter">200</span>+
							</div>
							<div className="number-label">Clientes Satisfeitos</div>
						</div>

						<div className="number-card animate-on-scroll">
							<div className="number-icon">
								<i className="fas fa-code-branch"></i>
							</div>
							<div className="number-value">
								<span className="counter">350</span>+
							</div>
							<div className="number-label">Projetos Concluídos</div>
						</div>

						<div className="number-card animate-on-scroll">
							<div className="number-icon">
								<i className="fas fa-robot"></i>
							</div>
							<div className="number-value">
								<span className="counter">5</span>M+
							</div>
							<div className="number-label">Interações com IA</div>
						</div>

						<div className="number-card animate-on-scroll">
							<div className="number-icon">
								<i className="fas fa-clock"></i>
							</div>
							<div className="number-value">
								<span className="counter">42</span>K+
							</div>
							<div className="number-label">Horas Economizadas</div>
						</div>
					</div>
				</div>
			</section>

			{/* Depoimentos Section */}
			<section className="section testimonials-section">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						O Que Nossos Clientes Dizem
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Histórias reais de transformação digital com nossas soluções de IA
					</p>

					<div className="testimonials-slider">
						<div className="testimonial-card animate-on-scroll">
							<div className="testimonial-content">
								<p>
									"A implementação dos agentes de IA da Nexios Digital
									transformou nosso atendimento ao cliente. Reduzimos o tempo de
									resposta em 80% e aumentamos a satisfação dos clientes."
								</p>
								<div className="testimonial-author">
									<div className="testimonial-author-info">
										<h4>Maria Silva</h4>
										<p>Diretora de Operações, TechSolve</p>
									</div>
								</div>
							</div>
						</div>

						<div className="testimonial-card animate-on-scroll">
							<div className="testimonial-content">
								<p>
									"A automação de vendas com IA nos permitiu identificar
									oportunidades que antes passavam despercebidas. Nossos
									resultados cresceram mais de 35% em apenas seis meses."
								</p>
								<div className="testimonial-author">
									<div className="testimonial-author-info">
										<h4>João Pereira</h4>
										<p>VP de Vendas, Global Services</p>
									</div>
								</div>
							</div>
						</div>

						<div className="testimonial-card animate-on-scroll">
							<div className="testimonial-content">
								<p>
									"Automatizamos processos internos que antes ocupavam horas dos
									nossos colaboradores. A equipe agora pode se concentrar em
									tarefas estratégicas e criativas."
								</p>
								<div className="testimonial-author">
									<div className="testimonial-author-info">
										<h4>Ana Oliveira</h4>
										<p>CTO, InnovateNow</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="section cta-section">
				<div className="container">
					<div className="cta-content animate-on-scroll">
						<h2>Pronto para transformar seu negócio com IA?</h2>
						<p>
							Entre em contato para uma consultoria gratuita e descubra como
							nossas soluções de IA podem impulsionar sua empresa para o próximo
							nível.
						</p>
						<div className="cta-buttons">
							<Link to="/register" className="btn btn-primary">
								<i className="fas fa-rocket"></i> Começar Agora
							</Link>
							<a href="#contact" className="btn btn-secondary">
								<i className="fas fa-phone-alt"></i> Fale Conosco
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* Clientes Section */}
			<section className="section clients-section">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						Empresas que Confiam em Nós
					</h2>

					<div className="clients-grid animate-on-scroll">
						<div className="client-logo">
							<div className="client-logo-placeholder">TechCorp</div>
						</div>
						<div className="client-logo">
							<div className="client-logo-placeholder">InnovateSoft</div>
						</div>
						<div className="client-logo">
							<div className="client-logo-placeholder">GlobalTech</div>
						</div>
						<div className="client-logo">
							<div className="client-logo-placeholder">FutureSys</div>
						</div>
						<div className="client-logo">
							<div className="client-logo-placeholder">SmartData</div>
						</div>
						<div className="client-logo">
							<div className="client-logo-placeholder">AIVentures</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
