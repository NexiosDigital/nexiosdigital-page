import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/ServicePage.css";

const ProcessAutomation = () => {
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
						Automação de <span className="text-gradient">Processos</span>
					</h1>
					<p className="service-subtitle animate-on-scroll">
						Elimine tarefas repetitivas e reduza erros humanos com sistemas
						inteligentes que automatizam fluxos de trabalho em toda a
						organização
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
								Transforme fluxos de trabalho complexos em processos eficientes
							</h2>
							<p>
								A Nexios Digital revoluciona a forma como as empresas operam
								internamente através de soluções avançadas de automação de
								processos. Nosso objetivo é transformar fluxos de trabalho
								complexos e demorados em processos eficientes e automatizados,
								permitindo que as empresas se concentrem no que realmente
								importa: inovação e crescimento.
							</p>
							<p>
								Nossa abordagem começa com uma análise profunda dos processos
								existentes na sua organização. Identificamos gargalos,
								redundâncias e áreas de ineficiência. Em seguida, projetamos
								soluções personalizadas que integram tecnologias de ponta, como
								Robotic Process Automation (RPA), Machine Learning e
								Inteligência Artificial.
							</p>
						</div>
						<div className="service-content-icon animate-on-scroll">
							<div className="service-icon">
								<i className="fas fa-cogs"></i>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Recursos */}
			<section className="section service-features">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						Áreas de Aplicação
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Nossas soluções abrangem uma ampla gama de processos internos
					</p>

					<div className="features-grid">
						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-file-alt"></i>
							</div>
							<h3>Gestão de Documentos</h3>
							<p>
								Automatizamos a captura, classificação e roteamento de
								documentos, reduzindo erros e acelerando o processamento. Nossos
								sistemas podem extrair dados de faturas, contratos e
								formulários, eliminando a entrada manual de dados.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-check-double"></i>
							</div>
							<h3>Fluxos de Aprovação</h3>
							<p>
								Implementamos sistemas inteligentes que agilizam processos de
								aprovação, desde despesas até contratos. Automatizamos a
								notificação, o rastreamento e o escalonamento para garantir que
								nada fique pendente.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-users"></i>
							</div>
							<h3>Gestão de Recursos Humanos</h3>
							<p>
								Automatizamos tarefas como onboarding, avaliações de desempenho
								e gerenciamento de folha de pagamento. Nossos sistemas reduzem o
								trabalho manual e aumentam a precisão em processos críticos de
								RH.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-chart-bar"></i>
							</div>
							<h3>Relatórios e Análises</h3>
							<p>
								Criamos dashboards automatizados que fornecem insights em tempo
								real sobre o desempenho da empresa. Eliminamos a necessidade de
								compilação manual de dados e garantimos informações sempre
								atualizadas.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-money-bill-wave"></i>
							</div>
							<h3>Processos Financeiros</h3>
							<p>
								Automatizamos contas a pagar, contas a receber, reconciliação e
								outros processos financeiros. Reduzimos erros, detectamos
								fraudes e aceleramos fechamentos mensais e trimestrais.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-truck"></i>
							</div>
							<h3>Cadeia de Suprimentos</h3>
							<p>
								Otimizamos processos de compras, gerenciamento de estoque e
								logística com automação inteligente. Reduzimos custos e
								melhoramos a eficiência em toda a cadeia de suprimentos.
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
						Uma abordagem estruturada para transformar seus processos
					</p>

					<div className="steps-container">
						<div className="step animate-on-scroll">
							<div className="step-number">01</div>
							<div className="step-content">
								<h3>Avaliação e Descoberta</h3>
								<p>
									Realizamos uma análise completa dos processos existentes,
									documentando fluxos de trabalho, identificando gargalos e
									quantificando o impacto nos negócios e o potencial de
									otimização.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">02</div>
							<div className="step-content">
								<h3>Projeto e Redesenho</h3>
								<p>
									Redesenhamos os processos para eliminar ineficiências e
									simplificar fluxos de trabalho, selecionando as tecnologias de
									automação mais adequadas para cada caso específico.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">03</div>
							<div className="step-content">
								<h3>Desenvolvimento e Implementação</h3>
								<p>
									Desenvolvemos, testamos e implementamos soluções de automação,
									integrando com sistemas existentes e garantindo uma transição
									suave para os novos processos automatizados.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">04</div>
							<div className="step-content">
								<h3>Treinamento e Adoção</h3>
								<p>
									Capacitamos sua equipe para utilizar, manter e otimizar os
									processos automatizados, garantindo adoção completa e
									maximizando o retorno sobre o investimento.
								</p>
							</div>
						</div>

						<div className="step animate-on-scroll">
							<div className="step-number">05</div>
							<div className="step-content">
								<h3>Monitoramento e Melhoria Contínua</h3>
								<p>
									Monitoramos continuamente o desempenho dos processos
									automatizados, coletando métricas e implementando melhorias
									iterativas para otimização constante.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Tecnologias */}
			<section className="section service-technologies bg-gradient">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						Tecnologias Utilizadas
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Combinamos tecnologias de ponta para criar soluções de automação
						poderosas
					</p>

					<div className="features-grid">
						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-robot"></i>
							</div>
							<h3>Robotic Process Automation (RPA)</h3>
							<p>
								Utilizamos robôs de software para automatizar tarefas
								repetitivas e baseadas em regras, interagindo com sistemas
								existentes como um usuário humano faria.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-brain"></i>
							</div>
							<h3>Inteligência Artificial</h3>
							<p>
								Implementamos algoritmos de IA para automatizar processos que
								requerem tomada de decisão e adaptação, trazendo inteligência
								para a automação.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-project-diagram"></i>
							</div>
							<h3>Automation Orchestration</h3>
							<p>
								Coordenamos múltiplos fluxos de automação em processos complexos
								que atravessam departamentos e sistemas, garantindo eficiência
								de ponta a ponta.
							</p>
						</div>

						<div className="feature-card animate-on-scroll">
							<div className="feature-icon">
								<i className="fas fa-cog"></i>
							</div>
							<h3>Process Mining</h3>
							<p>
								Utilizamos tecnologias de mineração de processos para descobrir,
								monitorar e melhorar processos reais através da extração de
								conhecimento dos logs de eventos.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Estatísticas */}
			<section className="section service-stats">
				<div className="container">
					<h2 className="section-title animate-on-scroll">
						O Impacto da Automação
					</h2>
					<p className="section-subtitle animate-on-scroll">
						Resultados comprovados que nossos clientes experimentam
					</p>

					<div className="stats-grid">
						<div className="stat-card animate-on-scroll">
							<div className="stat-value">40%</div>
							<div className="stat-label">
								Aumento na eficiência operacional
							</div>
							<p className="stat-description">
								Processos que antes levavam horas ou dias podem ser concluídos
								em minutos com automação, liberando sua equipe para focar em
								atividades de maior valor.
							</p>
						</div>

						<div className="stat-card animate-on-scroll">
							<div className="stat-value">60%</div>
							<div className="stat-label">Redução nos erros processuais</div>
							<p className="stat-description">
								A automação elimina erros humanos em tarefas repetitivas,
								aumentando a precisão e a qualidade dos resultados em todos os
								processos.
							</p>
						</div>

						<div className="stat-card animate-on-scroll">
							<div className="stat-value">35%</div>
							<div className="stat-label">Redução nos custos operacionais</div>
							<p className="stat-description">
								Menor necessidade de intervenção manual, menos retrabalho e
								maior eficiência resultam em significativa redução de custos.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="section service-cta">
				<div className="container">
					<div className="cta-content animate-on-scroll">
						<h2>Pronto para transformar seus processos?</h2>
						<p>
							Solicite uma avaliação gratuita e descubra como nossa solução de
							automação de processos pode otimizar suas operações e impulsionar
							a produtividade da sua empresa.
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

export default ProcessAutomation;
