import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import ContactSection from "../components/ContactSection";
import "../styles/Home.css";

const Home = () => {
	const [scrollPosition, setScrollPosition] = useState(0);
	const [visibleCards, setVisibleCards] = useState([]);
	const [activeStep, setActiveStep] = useState(null);
	const [isWorkflowInView, setIsWorkflowInView] = useState(false);

	const servicesRef = useRef(null);

	// Efeito para detectar scroll e animar elementos quando entram na viewport
	useEffect(() => {
		const handleScroll = () => {
			setScrollPosition(window.scrollY);
		};

		window.addEventListener("scroll", handleScroll);

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

		// Detectar cards de serviço e seção de workflow quando entram na viewport
		const serviceObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setVisibleCards((prevVisibleCards) => {
							if (!prevVisibleCards.includes(entry.target.id)) {
								return [...prevVisibleCards, entry.target.id];
							}
							return prevVisibleCards;
						});
					}
				});
			},
			{ threshold: 0.2 }
		);

		const workflowObserver = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setIsWorkflowInView(true);
				}
			},
			{ threshold: 0.3 }
		);

		const cards = document.querySelectorAll(".service-card");
		cards.forEach((card) => serviceObserver.observe(card));

		const workflowSection = document.querySelector(".workflow-section");
		if (workflowSection) {
			workflowObserver.observe(workflowSection);
		}

		return () => {
			animatedElements.forEach((el) => observer.unobserve(el));
			cards.forEach((card) => serviceObserver.unobserve(card));
			window.removeEventListener("scroll", handleScroll);
			if (workflowSection) {
				workflowObserver.unobserve(workflowSection);
			}
		};
	}, []);

	// Função para calcular o estilo parallax baseado no scroll
	const calculateParallaxStyle = (factor) => {
		return {
			transform: `translateY(${scrollPosition * factor}px)`,
			transition: "transform 0.1s ease-out",
		};
	};

	// Alterna a etapa ativa do workflow
	const handleStepHover = (stepId) => {
		setActiveStep(stepId);
	};

	// Reseta a etapa ativa ao sair da área
	const handleStepLeave = () => {
		setActiveStep(null);
	};

	// Dados dos serviços
	const services = [
		{
			id: "ai-customer-service",
			icon: "fa-robot",
			title: "Agentes de IA para Atendimento",
			description:
				"Automatize o atendimento ao cliente com agentes de IA que respondem perguntas frequentes, resolvem problemas comuns e escalonam para humanos quando necessário.",
			url: "/services/ai-customer-service",
		},
		{
			id: "sales-automation",
			icon: "fa-chart-line",
			title: "Automação de Vendas",
			description:
				"Aumente a eficiência da sua equipe de vendas com ferramentas de IA que qualificam leads, personalizam comunicações e preveem o comportamento do cliente.",
			url: "/services/sales-automation",
		},
		{
			id: "process-automation",
			icon: "fa-cogs",
			title: "Automação de Processos",
			description:
				"Elimine tarefas repetitivas e reduza erros humanos com sistemas inteligentes que automatizam fluxos de trabalho em toda a organização.",
			url: "/services/process-automation",
		},
		{
			id: "clickup-automation",
			icon: "fa-tasks",
			title: "Automação com ClickUp",
			description:
				"Potencialize seu ClickUp com automações personalizadas que integram IA para otimizar seus fluxos de trabalho, aumentar a produtividade e reduzir erros.",
			url: "/services/clickup-automation",
		},
	];

	// Dados das etapas de trabalho
	const workflowSteps = [
		{
			id: "step-1",
			number: "01",
			title: "Análise de Necessidades",
			description:
				"Estudamos profundamente seus processos de negócio para identificar oportunidades de automação e melhoria com IA.",
		},
		{
			id: "step-2",
			number: "02",
			title: "Estratégia Personalizada",
			description:
				"Desenvolvemos um plano detalhado com as soluções de IA mais adequadas para seu negócio e objetivos específicos.",
		},
		{
			id: "step-3",
			number: "03",
			title: "Implementação Avançada",
			description:
				"Nossa equipe de especialistas implementa as soluções com foco em integração perfeita com seus sistemas existentes.",
		},
		{
			id: "step-4",
			number: "04",
			title: "Monitoramento e Otimização",
			description:
				"Acompanhamos o desempenho das soluções e fazemos ajustes contínuos para maximizar resultados a longo prazo.",
		},
	];

	return (
		<div className="home-page">
			{/* Hero Section Modernizada */}
			<section className="modern-hero">
				{/* Elementos de background com efeito parallax */}
				<div className="hero-bg-elements">
					<div
						className="hero-particle hero-particle-1"
						style={calculateParallaxStyle(-0.05)}
					></div>
					<div
						className="hero-particle hero-particle-2"
						style={calculateParallaxStyle(-0.03)}
					></div>
					<div
						className="hero-particle hero-particle-3"
						style={calculateParallaxStyle(-0.07)}
					></div>
					<div
						className="hero-particle hero-particle-4"
						style={calculateParallaxStyle(-0.02)}
					></div>
					<div className="hero-grid"></div>
					<div
						className="hero-gradient-circle"
						style={calculateParallaxStyle(-0.01)}
					></div>
				</div>

				<div className="container">
					<div className="hero-content">
						<div className="hero-text">
							<h1 className="hero-title animate-on-scroll">
								Transformando Negócios com{" "}
								<span className="text-gradient">Inteligência Artificial</span>
							</h1>
							<p className="hero-description animate-on-scroll">
								A Nexios Digital desenvolve soluções de IA inovadoras que
								automatizam processos, melhoram a experiência do cliente e
								impulsionam o crescimento dos negócios.
							</p>
							<div className="hero-buttons animate-on-scroll">
								<Link to="/about" className="btn btn-primary">
									<span className="btn-content">
										<i className="fas fa-rocket"></i>
										<span>Conheça Nossa Empresa</span>
									</span>
									<span className="btn-glow"></span>
								</Link>
								<Link to="/ai-chat" className="btn btn-secondary">
									<span className="btn-content">
										<i className="fas fa-robot"></i>
										<span>Experimente Nossa IA</span>
									</span>
								</Link>
							</div>
						</div>

						<div className="hero-visual animate-on-scroll">
							<div className="chat-interface">
								<div className="chat-header">
									<div className="chat-title">
										<i className="fas fa-robot"></i>
										<span>Assistente Nexios AI</span>
									</div>
									<div className="chat-status">
										<span className="status-dot"></span>
										<span>Online</span>
									</div>
								</div>
								<div className="chat-messages">
									<div className="message message-ai">
										<div className="message-content">
											Olá! Como posso ajudar a transformar seu negócio hoje?
										</div>
									</div>
									<div className="message message-user">
										<div className="message-content">
											Preciso aumentar a eficiência do atendimento ao cliente.
										</div>
									</div>
									<div className="message message-ai">
										<div className="message-content">
											Perfeito! Nossos agentes de IA podem reduzir o tempo de
											resposta em até 70% e automatizar até 80% das perguntas
											frequentes.
										</div>
									</div>
									<div className="message message-ai typing">
										<div className="typing-indicator">
											<span></span>
											<span></span>
											<span></span>
										</div>
									</div>
								</div>
								<div className="chat-input">
									<input
										type="text"
										placeholder="Digite sua mensagem..."
										disabled
									/>
									<button className="send-button">
										<i className="fas fa-paper-plane"></i>
									</button>
								</div>
							</div>
							<div className="hero-visual-decoration"></div>
						</div>
					</div>

					<div className="hero-stats animate-on-scroll">
						<div className="stat-item">
							<div className="stat-value">
								98<span className="percent">%</span>
							</div>
							<div className="stat-label">Satisfação de clientes</div>
						</div>
						<div className="stat-item">
							<div className="stat-value">
								65<span className="percent">%</span>
							</div>
							<div className="stat-label">Redução de custos</div>
						</div>
						<div className="stat-item">
							<div className="stat-value">
								4.5<span className="multiply">×</span>
							</div>
							<div className="stat-label">Aumento de eficiência</div>
						</div>
					</div>

					<div className="hero-scroll-indicator">
						<span>Role para explorar</span>
						<i className="fas fa-chevron-down"></i>
					</div>
				</div>
			</section>

			{/* Serviços Section - Modernizada */}
			{/* Serviços Section - Versão modernizada com ícones elevados */}
			<section className="modern-services-section">
				<div className="container">
					<div className="section-header">
						<h2 className="section-title">Nossos Serviços</h2>
						<div className="title-underline"></div>
						<p className="section-subtitle">
							Combinamos tecnologia de ponta com expertise em negócios para
							criar soluções que transformam empresas.
						</p>
					</div>

					<div className="services-grid">
						{/* Card 1 - Agentes de IA */}
						<div className="service-card">
							<div className="service-icon-wrapper">
								<div className="service-icon">
									<i className="fas fa-robot"></i>
								</div>
							</div>
							<div className="service-content">
								<h3 className="service-title">
									Agentes de IA para Atendimento
								</h3>
								<p className="service-description">
									Automatize o atendimento ao cliente com agentes de IA que
									respondem perguntas frequentes, resolvem problemas comuns e
									escalonam para humanos quando necessário.
								</p>
								<div className="service-link-wrapper">
									<Link
										to="/services/ai-customer-service"
										className="service-link"
									>
										Saiba mais <i className="fas fa-arrow-right"></i>
									</Link>
								</div>
							</div>
						</div>

						{/* Card 2 - Automação de Vendas */}
						<div className="service-card">
							<div className="service-icon-wrapper">
								<div className="service-icon">
									<i className="fas fa-chart-line"></i>
								</div>
							</div>
							<div className="service-content">
								<h3 className="service-title">Automação de Vendas</h3>
								<p className="service-description">
									Aumente a eficiência da sua equipe de vendas com ferramentas
									de IA que qualificam leads, personalizam comunicações e
									preveem o comportamento do cliente.
								</p>
								<div className="service-link-wrapper">
									<Link
										to="/services/sales-automation"
										className="service-link"
									>
										Saiba mais <i className="fas fa-arrow-right"></i>
									</Link>
								</div>
							</div>
						</div>

						{/* Card 3 - Automação de Processos */}
						<div className="service-card">
							<div className="service-icon-wrapper">
								<div className="service-icon">
									<i className="fas fa-cogs"></i>
								</div>
							</div>
							<div className="service-content">
								<h3 className="service-title">Automação de Processos</h3>
								<p className="service-description">
									Elimine tarefas repetitivas e reduza erros humanos com
									sistemas inteligentes que automatizam fluxos de trabalho em
									toda a organização.
								</p>
								<div className="service-link-wrapper">
									<Link
										to="/services/process-automation"
										className="service-link"
									>
										Saiba mais <i className="fas fa-arrow-right"></i>
									</Link>
								</div>
							</div>
						</div>

						{/* Card 4 - Automação com ClickUp */}
						<div className="service-card">
							<div className="service-icon-wrapper">
								<div className="service-icon">
									<i className="fas fa-tasks"></i>
								</div>
							</div>
							<div className="service-content">
								<h3 className="service-title">
									Automação de Processos Internos (com ClickUp)
								</h3>
								<p className="service-description">
									Potencialize seu ClickUp com automações personalizadas que
									integram IA para otimizar seus fluxos de trabalho, aumentar a
									produtividade e reduzir erros.
								</p>
								<div className="service-link-wrapper">
									<Link
										to="/services/clickup-automation"
										className="service-link"
									>
										Saiba mais <i className="fas fa-arrow-right"></i>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Como Funciona Section - Modernizada */}
			<section className="workflow-section">
				<div className="workflow-bg">
					<div className="workflow-bg-grid"></div>
					<div className="workflow-bg-gradient"></div>
				</div>

				<div className="container">
					<div className="workflow-header">
						<h2 className="workflow-title">Como Trabalhamos</h2>
						<div className="title-separator"></div>
						<p className="workflow-subtitle">
							Nossa abordagem metódica garante resultados excepcionais para cada
							cliente
						</p>
					</div>

					<div
						className={`workflow-timeline ${isWorkflowInView ? "animate" : ""}`}
					>
						<div className="timeline-line">
							<div
								className="timeline-progress"
								style={{
									height: activeStep
										? `calc(100% * ${
												parseInt(activeStep.split("-")[1]) /
												workflowSteps.length
										  })`
										: "0%",
								}}
							></div>
						</div>

						<div className="workflow-steps">
							{workflowSteps.map((step, index) => (
								<div
									key={step.id}
									id={step.id}
									className={`workflow-step ${
										activeStep === step.id ? "active" : ""
									} ${isWorkflowInView ? "visible" : ""}`}
									style={{ animationDelay: `${0.2 + index * 0.2}s` }}
									onMouseEnter={() => handleStepHover(step.id)}
									onMouseLeave={handleStepLeave}
								>
									<div className="step-connector"></div>
									<div className="step-number">
										<span>{step.number}</span>
										<div className="number-glow"></div>
									</div>
									<div className="step-content">
										<h3 className="step-title">{step.title}</h3>
										<p className="step-description">{step.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className={`workflow-cta ${isWorkflowInView ? "visible" : ""}`}>
						<Link to="/about" className="workflow-button">
							<span>Conheça Nossa Metodologia</span>
							<i className="fas fa-arrow-right"></i>
						</Link>
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
							<a href="https://wa.me/5522974033384" className="btn btn-primary">
								<i className="fas fa-rocket"></i> Começar Agora
							</a>
							<a href="#contact" className="btn btn-secondary">
								<i className="fas fa-phone-alt"></i> Fale Conosco
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* Seção de Contato - SUBSTITUÍDA PELO NOVO COMPONENTE */}
			<ContactSection />
		</div>
	);
};

export default Home;
