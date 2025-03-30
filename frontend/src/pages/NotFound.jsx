import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/NotFound.css";

const NotFound = () => {
	// Efeito para animação de elementos quando o componente monta
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

	// Efeito para o cursor seguir o mouse
	useEffect(() => {
		const handleMouseMove = (e) => {
			const cursor = document.querySelector(".error-cursor");
			if (cursor) {
				cursor.style.left = `${e.clientX}px`;
				cursor.style.top = `${e.clientY}px`;
			}

			// Efeito parallax para os asteriscos
			const asterisks = document.querySelectorAll(".asterisk");
			asterisks.forEach((asterisk, index) => {
				const speed = 0.03 + index * 0.01;
				const x = (window.innerWidth / 2 - e.clientX) * speed;
				const y = (window.innerHeight / 2 - e.clientY) * speed;
				asterisk.style.transform = `translate(${x}px, ${y}px)`;
			});
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	return (
		<div className="not-found-page">
			{/* Elementos de background */}
			<div className="error-bg-elements">
				<div className="error-grid"></div>
				<div className="error-gradient-circle"></div>
				<div className="asterisk asterisk-1">*</div>
				<div className="asterisk asterisk-2">*</div>
				<div className="asterisk asterisk-3">*</div>
				<div className="asterisk asterisk-4">404</div>
				<div className="asterisk asterisk-5">*</div>
			</div>

			{/* Cursor personalizado */}
			<div className="error-cursor"></div>

			<div className="container">
				<div className="error-content">
					<div className="error-code animate-on-scroll">404</div>
					<h1 className="error-title animate-on-scroll">
						Página Não Encontrada
					</h1>
					<p className="error-message animate-on-scroll">
						Parece que você se aventurou em um território inexplorado. A página
						que você está procurando não existe ou foi movida.
					</p>
					<div className="error-actions animate-on-scroll">
						<Link to="/" className="btn btn-primary">
							<span className="btn-content">
								<i className="fas fa-home"></i>
								<span>Voltar para Home</span>
							</span>
							<span className="btn-glow"></span>
						</Link>
						<a href="#contact" className="btn btn-secondary">
							<i className="fas fa-envelope"></i> Fale Conosco
						</a>
					</div>
				</div>

				{/* Ilustração interativa */}
				<div className="error-illustration animate-on-scroll">
					<div className="error-robot">
						<div className="robot-head">
							<div className="robot-eyes">
								<div className="robot-eye"></div>
								<div className="robot-eye"></div>
							</div>
							<div className="robot-antenna"></div>
						</div>
						<div className="robot-body">
							<div className="robot-panel">
								<div className="robot-light"></div>
								<div className="robot-button"></div>
								<div className="robot-button"></div>
							</div>
						</div>
						<div className="robot-message">Oops! Erro detectado</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
