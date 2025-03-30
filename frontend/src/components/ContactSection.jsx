import React from "react";
import ContactForm from "../components/ContactForm";
import "../styles/ContactSection.css";

const ContactSection = () => {
	return (
		<section id="contact" className="contact-section">
			<div className="container">
				<h2 className="section-title">Entre em Contato</h2>
				<div className="title-underline"></div>

				<p className="section-subtitle">
					Estamos prontos para ajudar a transformar seu negócio com nossas
					soluções de IA
				</p>

				<div className="contact-container">
					<div className="contact-info">
						{/* E-mail Card */}
						<div className="contact-card">
							<div className="contact-card-content">
								<div className="contact-icon-wrapper">
									<div className="contact-icon email-icon">
										<i className="fas fa-envelope"></i>
									</div>
								</div>
								<h3 className="contact-card-title">E-mail</h3>
								<p className="contact-card-text">
									Envie-nos uma mensagem para obter mais informações ou
									solicitar uma demonstração.
								</p>
								<a
									href="mailto:administracao@nexiosdigital.com"
									className="contact-link"
								>
									administracao@nexiosdigital.com
								</a>
							</div>
						</div>

						{/* WhatsApp Card */}
						<div className="contact-card">
							<div className="contact-card-content">
								<div className="contact-icon-wrapper">
									<div className="contact-icon whatsapp-icon">
										<i className="fab fa-whatsapp"></i>
									</div>
								</div>
								<h3 className="contact-card-title">WhatsApp</h3>
								<p className="contact-card-text">
									Entre em contato diretamente com nossa equipe para um
									atendimento mais rápido.
								</p>
								<a
									href="https://wa.me/5522974033384"
									className="contact-link"
									target="_blank"
									rel="noopener noreferrer"
								>
									(22) 97403-3384
								</a>
							</div>
						</div>

						{/* Localização Card */}
						<div className="contact-card">
							<div className="contact-card-content">
								<div className="contact-icon-wrapper">
									<div className="contact-icon location-icon">
										<i className="fas fa-map-marker-alt"></i>
									</div>
								</div>
								<h3 className="contact-card-title">Localização</h3>
								<p className="contact-card-text">Estamos localizados em:</p>
								<div className="contact-address">
									Campos dos Goytacazes
									<br />
									Rio de Janeiro - Brasil
								</div>
							</div>
						</div>
					</div>

					{/* Formulário de contato */}
					<div className="contact-form-wrapper">
						<div className="contact-form-container">
							<h3 className="form-title">Envie-nos uma mensagem</h3>
							<p className="form-subtitle">
								Preencha o formulário abaixo e entraremos em contato o mais
								breve possível.
							</p>
							<ContactForm />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ContactSection;
