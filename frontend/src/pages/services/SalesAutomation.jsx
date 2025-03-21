import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/ServicePage.css";

const SalesAutomation = () => {
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
						Automação do{" "}
						<span className="text-gradient">Processo de Vendas</span>
					</h1>
					<p className="service-subtitle animate-on-scroll">
						Potencialize cada etapa do funil de vendas com IA avançada, análise
						preditiva e automação inteligente
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
							<h2>
								Redefina seu processo de vendas com inteligência artificial
							</h2>
							<p>
								A Nexios Digital está redefinindo o processo de vendas com
								soluções de automação inteligente que potencializam cada etapa
								do funil, desde a prospecção até o pós-venda. Nossa abordagem
								integra IA avançada, análise preditiva e automação de processos
								para criar um ecossistema de vendas eficiente e orientado por
								dados.
							</p>
							<p>
								Transformamos equipes de vendas convencionais em forças
								altamente produtivas e orientadas por dados, capacitando seus
								vendedores com insights acionáveis, eliminando tarefas
								repetitivas e otimizando cada interação com o cliente para
								maximizar as chances de fechamento.
							</p>
						</div>
						<div className="service-content-icon animate-on-scroll">
							<div className="service-icon">
								<i className="fas fa-chart-line"></i>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Recursos */}
			<section className="section service-features">
				<div className="container">
					<h2 className="section-title animate-on-scroll">Componentes-Chave</h2>
					<p className="section-subtitle animate-on-scroll">
						Conheça as poderosas ferramentas que compõem nossa solução de
						automação de vendas
					</p>

					<div className="features-grid">
						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-database"></i>
							</div>
							<h3>CRM Inteligente</h3>
							<p>
								Desenvolvemos um CRM alimentado por IA que não apenas rastreia
								interações, mas prevê o próximo melhor passo para cada
								oportunidade, com integração automática de dados de múltiplas
								fontes, oferecendo uma visão 360° de cada cliente potencial.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-chart-pie"></i>
							</div>
							<h3>Previsão de Vendas Baseada em IA</h3>
							<p>
								Algoritmos avançados analisam padrões históricos e tendências de
								mercado para fornecer previsões de vendas precisas, com
								dashboards em tempo real que oferecem insights acionáveis para
								ajustar estratégias rapidamente.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-tasks"></i>
							</div>
							<h3>Automação de Tarefas</h3>
							<p>
								Automatizamos tarefas repetitivas como agendamento de reuniões,
								follow-ups e geração de propostas, permitindo que os vendedores
								foquem em atividades de alto valor, com sistemas de notificação
								que alertam sobre oportunidades críticas.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-user-tie"></i>
							</div>
							<h3>Assistente Virtual de Vendas</h3>
							<p>
								Implementamos assistentes virtuais que auxiliam os vendedores
								com informações relevantes em tempo real durante interações com
								clientes, oferecendo sugestões de próximos passos e argumentos
								de venda personalizados.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-users-cog"></i>
							</div>
							<h3>Personalização em Escala</h3>
							<p>
								Utilizamos IA para criar experiências de venda altamente
								personalizadas para cada prospect, desde e-mails até
								apresentações de produtos, com conteúdo dinâmico que se adapta
								automaticamente às preferências do cliente.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-sitemap"></i>
							</div>
							<h3>Análise Avançada de Pipeline</h3>
							<p>
								Ferramentas de análise preditiva que identificam gargalos no
								pipeline e sugerem ações corretivas, com scoring de
								oportunidades em tempo real para priorização eficiente de leads
								que têm maior probabilidade de conversão.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Como Funciona */}
			<section className="section how-it-works-section">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						Processo de Implementação
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Como transformamos sua equipe de vendas em uma máquina de resultados
					</p>

					<div className="steps-container">
						<div className="step animate-on-scroll">
							<div className="step-number">01</div>
							<div className="step-content">
								<h3>Auditoria e Diagnóstico</h3>
								<p>
									Analisamos seu processo atual de vendas, identificando
									gargalos, ineficiências e oportunidades de otimização em cada
									etapa do funil.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">02</div>
							<div className="step-content">
								<h3>Estratégia Personalizada</h3>
								<p>
									Desenvolvemos uma estratégia customizada de automação de
									vendas, alinhada com seus objetivos de negócio e adequada à
									maturidade de sua equipe.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">03</div>
							<div className="step-content">
								<h3>Configuração e Implementação</h3>
								<p>
									Configuramos e implementamos as ferramentas de automação,
									integrando-as com seus sistemas existentes e treinando sua
									equipe para maximizar seu uso.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">04</div>
							<div className="step-content">
								<h3>Monitoramento e Otimização</h3>
								<p>
									Acompanhamos continuamente os resultados, refinando algoritmos
									e processos para melhorar constantemente a eficácia e a
									eficiência do sistema.
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
						Resultados Transformadores
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Resultados reais que nossos clientes estão alcançando com nossa
						solução
					</p>

					<div className="stats-grid">
						<div className="stat-card animate-on-scroll">
							<div className="stat-value">35%</div>
							<div className="stat-label">Aumento na taxa de fechamento</div>
							<p className="stat-description">
								As equipes de vendas conseguem converter mais leads em clientes
								graças aos insights precisos e à abordagem personalizada para
								cada oportunidade.
							</p>
						</div>

						<div className="stat-card animate-on-scroll">
							<div className="stat-value">50%</div>
							<div className="stat-label">
								Redução no tempo do ciclo de vendas
							</div>
							<p className="stat-description">
								Processos mais eficientes e decisões mais rápidas reduzem
								significativamente o tempo entre o primeiro contato e o
								fechamento do negócio.
							</p>
						</div>

						<div className="stat-card animate-on-scroll">
							<div className="stat-value">25%</div>
							<div className="stat-label">
								Aumento no valor médio dos negócios
							</div>
							<p className="stat-description">
								Identificação de oportunidades de upsell e cross-sell baseadas
								no perfil e comportamento do cliente aumentam o ticket médio das
								vendas.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Integração */}
			<section className="section service-integrations">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						Integrações Perfeitas
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Nossa solução se integra aos principais sistemas e ferramentas que
						você já utiliza
					</p>

					<div className="integrations-grid">
						<div className="integration-item animate-on-scroll">
							<div className="integration-icon">
								<i className="fas fa-envelope"></i>
							</div>
							<div className="integration-name">Outlook/Gmail</div>
						</div>
						<div className="integration-item animate-on-scroll">
							<div className="integration-icon">
								<i className="fab fa-salesforce"></i>
							</div>
							<div className="integration-name">Salesforce</div>
						</div>
						<div className="integration-item animate-on-scroll">
							<div className="integration-icon">
								<i className="fab fa-hubspot"></i>
							</div>
							<div className="integration-name">HubSpot</div>
						</div>
						<div className="integration-item animate-on-scroll">
							<div className="integration-icon">
								<i className="fas fa-file-contract"></i>
							</div>
							<div className="integration-name">DocuSign</div>
						</div>
						<div className="integration-item animate-on-scroll">
							<div className="integration-icon">
								<i className="fab fa-slack"></i>
							</div>
							<div className="integration-name">Slack</div>
						</div>
						<div className="integration-item animate-on-scroll">
							<div className="integration-icon">
								<i className="fab fa-microsoft"></i>
							</div>
							<div className="integration-name">Microsoft Teams</div>
						</div>
						<div className="integration-item animate-on-scroll">
							<div className="integration-icon">
								<i className="fas fa-calendar-alt"></i>
							</div>
							<div className="integration-name">Google Calendar</div>
						</div>
						<div className="integration-item animate-on-scroll">
							<div className="integration-icon">
								<i className="fas fa-video"></i>
							</div>
							<div className="integration-name">Zoom</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="section service-cta">
				<div className="container">
					<div className="cta-content animate-on-scroll">
						<h2>Pronto para vender mais e melhor?</h2>
						<p>
							Solicite uma demonstração gratuita e descubra como nossa solução
							de automação de vendas pode transformar sua equipe e impulsionar
							seus resultados.
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

export default SalesAutomation;
