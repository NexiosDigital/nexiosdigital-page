import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/About.css";

const ModernAbout = () => {
	const [scrollPosition, setScrollPosition] = useState(0);
	const [visibleSections, setVisibleSections] = useState([]);

	// References for sections
	const heroRef = useRef(null);
	const missionRef = useRef(null);
	const valuesRef = useRef(null);
	const impactRef = useRef(null);
	const expertiseRef = useRef(null);
	const ctaRef = useRef(null);

	// Handle scroll effects and animations
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

						// Track which section is visible
						const sectionId =
							entry.target.closest("[data-section]")?.dataset.section;
						if (sectionId && !visibleSections.includes(sectionId)) {
							setVisibleSections((prev) => [...prev, sectionId]);
						}

						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.1 }
		);

		animatedElements.forEach((el) => observer.observe(el));

		return () => {
			window.removeEventListener("scroll", handleScroll);
			animatedElements.forEach((el) => observer.unobserve(el));
		};
	}, [visibleSections]);

	// Calculate parallax style for elements
	const calculateParallaxStyle = (factor) => {
		return {
			transform: `translateY(${scrollPosition * factor}px)`,
			transition: "transform 0.1s ease-out",
		};
	};

	return (
		<div className="about-page modern-about-page">
			{/* Hero Section with Parallax */}
			<section
				className="about-hero modern-hero"
				ref={heroRef}
				data-section="hero"
			>
				<div className="hero-bg-elements">
					<div
						className="hero-particle hero-particle-1"
						style={calculateParallaxStyle(-0.05)}
					></div>
					<div
						className="hero-particle hero-particle-2"
						style={calculateParallaxStyle(-0.03)}
					></div>
					<div className="hero-grid"></div>
					<div
						className="hero-gradient-circle"
						style={calculateParallaxStyle(-0.01)}
					></div>
				</div>

				<div className="container">
					<h1 className="animate-on-scroll">
						Conheça a <span className="text-gradient">Nexios Digital</span>
					</h1>
					<p className="about-subtitle animate-on-scroll">
						Transformando Negócios através da Automação Inteligente
					</p>
				</div>
			</section>

			{/* Mission Section */}
			<section
				className="section about-intro"
				ref={missionRef}
				data-section="mission"
			>
				<div className="container">
					<div className="about-content">
						<div className="about-text animate-on-scroll">
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
						<div className="about-image animate-on-scroll">
							<div className="modern-image-container">
								<div className="image-decoration"></div>
								<div className="image-placeholder">
									<i className="fas fa-building"></i>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Values Section */}
			<section
				className="section about-values bg-gradient"
				ref={valuesRef}
				data-section="values"
			>
				<div className="container">
					<h2 className="section-title light animate-on-scroll">
						Nossos Valores
					</h2>
					<div className="values-grid">
						{[
							{
								icon: "fas fa-lightbulb",
								title: "Inovação",
								description:
									"Buscamos constantemente novas tecnologias e abordagens para oferecer soluções de ponta aos nossos clientes.",
							},
							{
								icon: "fas fa-users",
								title: "Colaboração",
								description:
									"Trabalhamos em parceria com nossos clientes para entender suas necessidades e desenvolver soluções personalizadas.",
							},
							{
								icon: "fas fa-chart-line",
								title: "Excelência",
								description:
									"Comprometemo-nos com os mais altos padrões de qualidade em tudo o que fazemos.",
							},
							{
								icon: "fas fa-shield-alt",
								title: "Confiança",
								description:
									"Construímos relacionamentos duradouros baseados em integridade, transparência e resultados comprovados.",
							},
						].map((value, index) => (
							<div
								key={index}
								className={`value-card animate-on-scroll ${
									visibleSections.includes("values") ? "visible" : ""
								}`}
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<div className="card-inner">
									<div className="value-icon">
										<i className={value.icon}></i>
										<div className="icon-glow"></div>
									</div>
									<h3>{value.title}</h3>
									<p>{value.description}</p>
								</div>
								<div className="card-shine"></div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Impact Stats Section */}
			<section
				className="section about-impact"
				ref={impactRef}
				data-section="impact"
			>
				<div className="container">
					<h2 className="section-title animate-on-scroll">Nosso Impacto</h2>

					<div className="impact-stats">
						{[
							{
								value: "40%",
								label: "Aumento médio na eficiência operacional",
							},
							{
								value: "70%",
								label: "Redução no tempo de resposta ao cliente",
							},
							{
								value: "300%",
								label: "Aumento na taxa de conversão de leads",
							},
							{
								value: "60%",
								label: "Redução em erros processuais",
							},
						].map((stat, index) => (
							<div
								key={index}
								className={`stat-item animate-on-scroll ${
									visibleSections.includes("impact") ? "visible" : ""
								}`}
								style={{ animationDelay: `${index * 0.15}s` }}
							>
								<div className="stat-number">{stat.value}</div>
								<div className="stat-label">{stat.label}</div>
								<svg
									className="stat-circle"
									width="160"
									height="160"
									viewBox="0 0 160 160"
								>
									<circle
										cx="80"
										cy="80"
										r="70"
										fill="none"
										stroke="rgba(255, 62, 108, 0.1)"
										strokeWidth="3"
									/>
									<circle
										className="stat-circle-progress"
										cx="80"
										cy="80"
										r="70"
										fill="none"
										stroke="url(#gradient)"
										strokeWidth="3"
										strokeDasharray="440"
										strokeDashoffset={440 - (440 * parseInt(stat.value)) / 100}
										transform="rotate(-90 80 80)"
									/>
									<defs>
										<linearGradient
											id="gradient"
											x1="0%"
											y1="0%"
											x2="100%"
											y2="0%"
										>
											<stop offset="0%" stopColor="var(--accent)" />
											<stop offset="100%" stopColor="var(--accent-light)" />
										</linearGradient>
									</defs>
								</svg>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Expertise Section */}
			<section
				className="section about-expertise"
				ref={expertiseRef}
				data-section="expertise"
			>
				<div className="background-elements">
					<div className="bg-gradient-circle"></div>
					<div className="bg-pattern"></div>
				</div>

				<div className="container">
					<h2 className="section-title animate-on-scroll">Nossa Expertise</h2>

					<div className="expertise-grid">
						{[
							{
								icon: "fas fa-robot",
								title: "Inteligência Artificial",
								description:
									"Desenvolvemos soluções de IA personalizadas que automatizam tarefas, analisam dados e tomam decisões inteligentes.",
							},
							{
								icon: "fas fa-cogs",
								title: "Automação de Processos",
								description:
									"Transformamos fluxos de trabalho complexos e demorados em processos eficientes e automatizados.",
							},
							{
								icon: "fas fa-comments",
								title: "Atendimento Inteligente",
								description:
									"Criamos assistentes virtuais e sistemas de atendimento ao cliente impulsionados por IA.",
							},
							{
								icon: "fas fa-chart-pie",
								title: "Analytics Avançado",
								description:
									"Transformamos dados em insights acionáveis para impulsionar a tomada de decisões estratégicas.",
							},
							{
								icon: "fas fa-sitemap",
								title: "Integração de Sistemas",
								description:
									"Unificamos e otimizamos o ecossistema tecnológico das empresas para maior eficiência.",
							},
							{
								icon: "fas fa-bullseye",
								title: "Marketing Automatizado",
								description:
									"Criamos campanhas personalizadas e altamente eficazes baseadas em IA e machine learning.",
							},
						].map((expertise, index) => (
							<div
								key={index}
								className={`expertise-item animate-on-scroll ${
									visibleSections.includes("expertise") ? "visible" : ""
								}`}
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<div className="expertise-icon">
									<i className={expertise.icon}></i>
									<div className="icon-pulse"></div>
								</div>
								<h3>{expertise.title}</h3>
								<p>{expertise.description}</p>
								<div className="card-shine"></div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="section about-cta" ref={ctaRef} data-section="cta">
				<div className="cta-background">
					<div className="cta-gradient"></div>
					<div className="cta-particles">
						<div className="cta-particle particle-1"></div>
						<div className="cta-particle particle-2"></div>
						<div className="cta-particle particle-3"></div>
					</div>
				</div>

				<div className="container">
					<div className="cta-content animate-on-scroll">
						<h2>Pronto para transformar seu negócio?</h2>
						<p>
							Converse com nossa equipe e descubra como nossas soluções de
							automação e IA podem impulsionar sua empresa para o próximo nível.
						</p>
						<a href="#contact" className="btn btn-primary">
							<span className="btn-content">
								<i className="fas fa-paper-plane"></i>
								<span>Entre em Contato</span>
							</span>
							<span className="btn-glow"></span>
						</a>
					</div>
				</div>
			</section>
		</div>
	);
};

export default ModernAbout;
