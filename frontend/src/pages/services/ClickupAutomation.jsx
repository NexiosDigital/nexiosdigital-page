import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/ServicePage.css";

const ClickupAutomation = () => {
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
						Automação de Processos Internos{" "}
						<span className="text-gradient">com ClickUp</span>
					</h1>
					<p className="service-subtitle animate-on-scroll">
						Potencialize sua produtividade com automação inteligente integrada
						ao ClickUp, a plataforma all-in-one para gestão de trabalho
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
							<h2>A Revolução da Automação com ClickUp</h2>
							<p>
								A Nexios Digital especializa-se na implementação de soluções de
								automação que transformam seus processos internos utilizando as
								poderosas funcionalidades do ClickUp. Combinamos nossa expertise
								em automação com o potencial do ClickUp para criar fluxos de
								trabalho inteligentes que eliminam tarefas manuais, reduzem
								erros e aumentam significativamente a produtividade da sua
								equipe.
							</p>
							<p>
								Nossa abordagem começa com uma análise profunda dos processos
								existentes na sua organização. Identificamos gargalos,
								redundâncias e áreas de ineficiência. Em seguida, projetamos
								soluções personalizadas que aproveitam os recursos nativos de
								automação do ClickUp, complementados por nossas integrações
								avançadas com IA e outras ferramentas.
							</p>
						</div>
						<div className="service-content-icon animate-on-scroll">
							<div className="service-icon">
								<i className="fas fa-tasks"></i>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Recursos */}
			<section className="section service-features">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						Recursos e Soluções
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Maximize o potencial do ClickUp com nossas soluções de automação
						personalizadas
					</p>

					<div className="features-grid">
						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-project-diagram"></i>
							</div>
							<h3>Fluxos de Trabalho Automatizados</h3>
							<p>
								Criamos fluxos de trabalho personalizados no ClickUp que
								automatizam completamente seus processos, desde a criação de
								tarefas até notificações, atribuições e prazos, eliminando a
								necessidade de intervenção manual.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-hands-helping"></i>
							</div>
							<h3>Onboarding e Processos de RH</h3>
							<p>
								Automatizamos processos de RH dentro do ClickUp, incluindo
								onboarding de novos funcionários, avaliações de desempenho e
								solicitações de férias, com acompanhamento automático e
								notificações programadas.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-check-double"></i>
							</div>
							<h3>Aprovações e Revisões</h3>
							<p>
								Implementamos sistemas de aprovação no ClickUp que automatizam
								solicitações, notificações e acompanhamento, garantindo que nada
								passe despercebido e reduzindo significativamente o tempo de
								espera.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-file-alt"></i>
							</div>
							<h3>Gestão de Documentos</h3>
							<p>
								Integramos o ClickUp com sistemas de gerenciamento de documentos
								para automatizar o controle de versões, aprovações,
								armazenamento e recuperação de informações, eliminando erros e
								perda de dados.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-comments"></i>
							</div>
							<h3>Comunicação Automatizada</h3>
							<p>
								Criamos sistemas que automatizam atualizações de status,
								notificações e relatórios através do ClickUp, mantendo todos
								informados sem a necessidade de comunicação manual constante.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-chart-line"></i>
							</div>
							<h3>Dashboards e Relatórios</h3>
							<p>
								Configuramos dashboards automatizados no ClickUp que fornecem
								visualização em tempo real do progresso, gargalos e
								métricas-chave, com geração e distribuição automatizada de
								relatórios periódicos.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Benefícios */}
			<section className="section service-benefits bg-gradient">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						Por Que Escolher ClickUp + Nexios Digital?
					</h2>
					<p className="section-subtitle animate-on-scroll">
						A combinação perfeita para revolucionar seus processos internos
					</p>

					<div className="features-grid">
						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-rocket"></i>
							</div>
							<h3>Implementação Especializada</h3>
							<p>
								Nossa equipe possui expertise tanto em automação quanto na
								plataforma ClickUp, garantindo uma implementação otimizada que
								aproveita ao máximo todos os recursos disponíveis.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-plug"></i>
							</div>
							<h3>Integrações Avançadas</h3>
							<p>
								Vamos além das integrações nativas do ClickUp, desenvolvendo
								conexões personalizadas com seus sistemas existentes e
								incorporando soluções de IA para automação inteligente.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-users-cog"></i>
							</div>
							<h3>Soluções Personalizadas</h3>
							<p>
								Criamos automações totalmente adaptadas às necessidades
								específicas do seu negócio, respeitando seus processos atuais
								enquanto os otimizamos para máxima eficiência.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-graduation-cap"></i>
							</div>
							<h3>Treinamento Completo</h3>
							<p>
								Oferecemos capacitação abrangente para sua equipe, garantindo
								que todos possam aproveitar ao máximo as soluções de automação
								implementadas no ClickUp.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Como Funciona */}
			<section className="section how-it-works-section">
				<div className="container">
					<h2 className="section-title animate-on-scroll">Nossa Metodologia</h2>
					<p className="section-subtitle animate-on-scroll">
						Um processo estruturado para implementar automação com ClickUp
					</p>

					<div className="steps-container">
						<div className="step animate-on-scroll">
							<div className="step-number">01</div>
							<div className="step-content">
								<h3>Análise de Processos</h3>
								<p>
									Realizamos um diagnóstico completo dos seus processos atuais,
									identificando áreas de ineficiência e oportunidades de
									automação com o ClickUp.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">02</div>
							<div className="step-content">
								<h3>Design de Solução</h3>
								<p>
									Desenvolvemos uma estratégia personalizada de automação que
									define como o ClickUp será configurado e integrado aos seus
									sistemas existentes.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">03</div>
							<div className="step-content">
								<h3>Configuração e Integração</h3>
								<p>
									Configuramos o ClickUp e implementamos as automações,
									integrando com outros sistemas e ferramentas conforme
									necessário.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">04</div>
							<div className="step-content">
								<h3>Testes e Ajustes</h3>
								<p>
									Realizamos testes rigorosos de todas as automações e fluxos de
									trabalho, refinando e ajustando para garantir funcionamento
									perfeito.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">05</div>
							<div className="step-content">
								<h3>Treinamento e Lançamento</h3>
								<p>
									Treinamos sua equipe para utilizar eficientemente o sistema
									automatizado e oferecemos suporte durante a transição para os
									novos processos.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">06</div>
							<div className="step-content">
								<h3>Suporte Contínuo</h3>
								<p>
									Fornecemos suporte ongoing, monitorando o desempenho das
									automações e implementando melhorias contínuas conforme seu
									negócio evolui.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Casos de Uso */}
			<section className="section service-use-cases">
				<div className="container">
					<h2 className="section-title animate-on-scroll">Casos de Uso</h2>
					<p className="section-subtitle animate-on-scroll">
						Áreas específicas onde nossa automação com ClickUp pode transformar
						sua empresa
					</p>

					<div className="features-grid">
						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-briefcase"></i>
							</div>
							<h3>Gestão de Projetos</h3>
							<p>
								Automação de atribuição de tarefas, notificações, atualizações
								de status, prazos e dependências, permitindo que gerentes de
								projeto foquem em estratégia em vez de administração.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-users"></i>
							</div>
							<h3>Processos de RH</h3>
							<p>
								Fluxos de trabalho automatizados para recrutamento, onboarding,
								avaliações de desempenho, solicitações de férias e outros
								processos de RH, mantendo todos os dados centralizados.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-code-branch"></i>
							</div>
							<h3>Desenvolvimento de Software</h3>
							<p>
								Automação de fluxos de trabalho de desenvolvimento, incluindo
								acompanhamento de bugs, revisões de código, testes e
								implantações, com integração a ferramentas de desenvolvimento.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-chart-pie"></i>
							</div>
							<h3>Marketing e Vendas</h3>
							<p>
								Criação e acompanhamento automatizado de campanhas de marketing,
								gerenciamento de leads, pipelines de vendas e acompanhamento de
								desempenho com métricas em tempo real.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-dollar-sign"></i>
							</div>
							<h3>Finanças e Operações</h3>
							<p>
								Automação de aprovações de despesas, orçamentos, rastreamento de
								custos de projetos e geração de relatórios financeiros,
								garantindo conformidade e visibilidade.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-headset"></i>
							</div>
							<h3>Atendimento ao Cliente</h3>
							<p>
								Automação do ciclo de vida de tickets de suporte, escalonamento
								de problemas, acompanhamento de SLAs e coleta de feedback,
								melhorando a satisfação do cliente.
							</p>
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
						Benefícios mensuráveis da automação de processos com ClickUp
					</p>

					<div className="stats-grid">
						<div className="stat-card animate-on-scroll">
							<div className="stat-value">40%</div>
							<div className="stat-label">
								Aumento na eficiência operacional
							</div>
							<p className="stat-description">
								Automatização de tarefas repetitivas e redução do esforço manual
								libera sua equipe para focar em trabalhos que agregam maior
								valor.
							</p>
						</div>

						<div className="stat-card animate-on-scroll">
							<div className="stat-value">60%</div>
							<div className="stat-label">Redução em erros processuais</div>
							<p className="stat-description">
								Automação elimina erros humanos em tarefas repetitivas,
								aumentando a precisão e confiabilidade dos seus processos
								internos.
							</p>
						</div>

						<div className="stat-card animate-on-scroll">
							<div className="stat-value">50%</div>
							<div className="stat-label">Redução no tempo de onboarding</div>
							<p className="stat-description">
								Novos colaboradores se adaptam mais rapidamente com processos
								automatizados que fornecem orientações claras e reduzem a curva
								de aprendizado.
							</p>
						</div>

						<div className="stat-card animate-on-scroll">
							<div className="stat-value">35%</div>
							<div className="stat-label">Melhoria na colaboração</div>
							<p className="stat-description">
								Processos transparentes e comunicação automatizada aumentam a
								colaboração entre equipes e departamentos.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="section service-cta">
				<div className="container">
					<div className="cta-content animate-on-scroll">
						<h2>Transforme seus processos com ClickUp e Nexios Digital</h2>
						<p>
							Solicite uma avaliação gratuita e descubra como podemos
							automatizar seus processos internos com a plataforma ClickUp,
							aumentando sua eficiência e reduzindo custos.
						</p>
						<div className="cta-buttons">
							<a href="#contact" className="btn btn-primary">
								<i className="fas fa-paper-plane"></i> Solicitar Avaliação
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

export default ClickupAutomation;
