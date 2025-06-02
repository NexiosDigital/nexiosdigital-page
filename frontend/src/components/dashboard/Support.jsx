import React from "react";

const Support = () => {
	return (
		<div className="support-page">
			<div className="page-header">
				<h1>Suporte</h1>
				<p>Estamos aqui para ajudar você</p>
			</div>

			<div className="support-content">
				<div className="support-options">
					<div className="support-card">
						<div className="support-icon">
							<i className="fas fa-envelope"></i>
						</div>
						<h3>Email</h3>
						<p>Entre em contato conosco por email</p>
						<a
							href="mailto:support@nexiosdigital.com"
							className="btn btn-primary"
						>
							support@nexiosdigital.com
						</a>
					</div>

					<div className="support-card">
						<div className="support-icon">
							<i className="fab fa-whatsapp"></i>
						</div>
						<h3>WhatsApp</h3>
						<p>Fale conosco pelo WhatsApp</p>
						<a
							href="https://wa.me/5522974033384"
							className="btn btn-primary"
							target="_blank"
							rel="noopener noreferrer"
						>
							(22) 97403-3384
						</a>
					</div>

					<div className="support-card">
						<div className="support-icon">
							<i className="fas fa-book"></i>
						</div>
						<h3>Documentação</h3>
						<p>Consulte nossa base de conhecimento</p>
						<button className="btn btn-secondary" disabled>
							Em breve
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Support;
