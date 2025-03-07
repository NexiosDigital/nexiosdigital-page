import React from "react";
import "../styles/About.css";

const About = () => {
	return (
		<div className="about-page">
			<section className="about-hero">
				<div className="container">
					<h1>
						Conheça a <span className="text-gradient">Nexios Digital</span>
					</h1>
					<p className="about-subtitle">
						Transformando Negócios através da Automação Inteligente
					</p>
				</div>
			</section>

			<section className="section about-intro">
				<div className="container">
					<div className="about-content">
						<div className="about-text">
							<h2>Nossa Missão</h2>
							<p>
								A Nexios Digital é uma empresa líder em soluções de automação e
								inteligência artificial, dedicada a revolucionar a forma como as
								empresas operam no mundo digital. Nossa missão é capacitar
								organizações de todos os tamanhos a otimizar seus processos,
								aumentar a eficiência e melhorar significativamente a
								experiência do cliente através de tecnologias de ponta.
							</p>
							<p>
								Combinamos tecnologia avançada com profundo conhecimento de
								negócios para criar soluções personalizadas que transformam
								operações complexas em processos eficientes e automatizados,
								permitindo que nossos clientes se concentrem no que realmente
								importa: inovação e crescimento.
							</p>
						</div>
						<div className="about-image">
							<div className="image-placeholder">
								<i className="fas fa-building"></i>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="section about-values bg-gradient">
				<div className="container">
					<h2 className="section-title light">Nossos Valores</h2>
					<div className="values-grid">
						<div className="value-card">
							<div className="value-icon">
								<i className="fas fa-lightbulb"></i>
							</div>
							<h3>Inovação</h3>
							<p>
								Buscamos constantemente novas tecnologias e abordagens para
								oferecer soluções de ponta aos nossos clientes.
							</p>
						</div>
						<div className="value-card">
							<div className="value-icon">
								<i className="fas fa-users"></i>
							</div>
							<h3>Colaboração</h3>
							<p>
								Trabalhamos em parceria com nossos clientes para entender suas
								necessidades e desenvolver soluções personalizadas.
							</p>
						</div>
						<div className="value-card">
							<div className="value-icon">
								<i className="fas fa-chart-line"></i>
							</div>
							<h3>Excelência</h3>
							<p>
								Comprometemo-nos com os mais altos padrões de qualidade em tudo
								o que fazemos.
							</p>
						</div>
						<div className="value-card">
							<div className="value-icon">
								<i className="fas fa-shield-alt"></i>
							</div>
							<h3>Confiança</h3>
							<p>
								Construímos relacionamentos duradouros baseados em integridade,
								transparência e resultados comprovados.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="section about-impact">
				<div className="container">
					<h2 className="section-title">Nosso Impacto</h2>
					<div className="impact-stats">
						<div className="stat-item">
							<div className="stat-number">40%</div>
							<div className="stat-label">
								Aumento médio na eficiência operacional
							</div>
						</div>
						<div className="stat-item">
							<div className="stat-number">70%</div>
							<div className="stat-label">
								Redução no tempo de resposta ao cliente
							</div>
						</div>
						<div className="stat-item">
							<div className="stat-number">300%</div>
							<div className="stat-label">
								Aumento na taxa de conversão de leads
							</div>
						</div>
						<div className="stat-item">
							<div className="stat-number">60%</div>
							<div className="stat-label">Redução em erros processuais</div>
						</div>
					</div>
				</div>
			</section>

			<section className="section about-expertise">
				<div className="container">
					<h2 className="section-title">Nossa Expertise</h2>
					<div className="expertise-grid">
						<div className="expertise-item">
							<div className="expertise-icon">
								<i className="fas fa-robot"></i>
							</div>
							<h3>Inteligência Artificial</h3>
							<p>
								Desenvolvemos soluções de IA personalizadas que automatizam
								tarefas, analisam dados e tomam decisões inteligentes.
							</p>
						</div>
						<div className="expertise-item">
							<div className="expertise-icon">
								<i className="fas fa-cogs"></i>
							</div>
							<h3>Automação de Processos</h3>
							<p>
								Transformamos fluxos de trabalho complexos e demorados em
								processos eficientes e automatizados.
							</p>
						</div>
						<div className="expertise-item">
							<div className="expertise-icon">
								<i className="fas fa-comments"></i>
							</div>
							<h3>Atendimento Inteligente</h3>
							<p>
								Criamos assistentes virtuais e sistemas de atendimento ao
								cliente impulsionados por IA.
							</p>
						</div>
						<div className="expertise-item">
							<div className="expertise-icon">
								<i className="fas fa-chart-pie"></i>
							</div>
							<h3>Analytics Avançado</h3>
							<p>
								Transformamos dados em insights acionáveis para impulsionar a
								tomada de decisões estratégicas.
							</p>
						</div>
						<div className="expertise-item">
							<div className="expertise-icon">
								<i className="fas fa-sitemap"></i>
							</div>
							<h3>Integração de Sistemas</h3>
							<p>
								Unificamos e otimizamos o ecossistema tecnológico das empresas
								para maior eficiência.
							</p>
						</div>
						<div className="expertise-item">
							<div className="expertise-icon">
								<i className="fas fa-bullseye"></i>
							</div>
							<h3>Marketing Automatizado</h3>
							<p>
								Criamos campanhas personalizadas e altamente eficazes baseadas
								em IA e machine learning.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="section about-cta">
				<div className="container">
					<div className="cta-content">
						<h2>Pronto para transformar seu negócio?</h2>
						<p>
							Converse com nossa equipe e descubra como nossas soluções de
							automação e IA podem impulsionar sua empresa para o próximo nível.
						</p>
						<a href="#contact" className="btn btn-primary">
							<i className="fas fa-paper-plane"></i> Entre em Contato
						</a>
					</div>
				</div>
			</section>
		</div>
	);
};

export default About;
