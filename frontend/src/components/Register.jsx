import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const Register = ({ authService }) => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		company: "",
		phone: "",
		message: "",
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			// Validações básicas
			if (
				!formData.name.trim() ||
				!formData.email.trim() ||
				!formData.company.trim()
			) {
				throw new Error("Por favor, preencha todos os campos obrigatórios");
			}

			// Enviar solicitação de registro
			await authService.requestAccess({
				name: formData.name,
				email: formData.email,
				company: formData.company,
				phone: formData.phone,
				message: formData.message,
			});

			setSuccess(true);
		} catch (err) {
			console.error("Erro ao solicitar acesso:", err);
			setError(err.message || "Erro ao enviar solicitação");
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="auth-page">
				<div className="container">
					<div className="auth-container">
						<div className="success-container">
							<div className="success-icon">
								<i className="fas fa-check-circle"></i>
							</div>
							<h2>Solicitação Enviada!</h2>
							<p>
								Sua solicitação de acesso foi enviada com sucesso. Nossa equipe
								analisará suas informações e entrará em contato em breve.
							</p>
							<div className="success-actions">
								<button
									onClick={() => navigate("/")}
									className="btn btn-primary"
								>
									Voltar ao Início
								</button>
								<button
									onClick={() => navigate("/login")}
									className="btn btn-secondary"
								>
									Fazer Login
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="auth-page">
			<div className="container">
				<div className="auth-container">
					<div className="auth-content">
						<div className="register-header">
							<h1>Solicitar Acesso</h1>
							<p>
								O acesso à plataforma Nexios Digital é restrito a clientes
								convidados. Preencha o formulário para solicitar acesso.
							</p>
						</div>

						{error && <div className="auth-error">{error}</div>}

						<form className="auth-form" onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="name" className="form-label">
									Nome Completo *
								</label>
								<input
									type="text"
									id="name"
									name="name"
									className="form-input"
									value={formData.name}
									onChange={handleChange}
									required
									disabled={loading}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="email" className="form-label">
									Email Corporativo *
								</label>
								<input
									type="email"
									id="email"
									name="email"
									className="form-input"
									value={formData.email}
									onChange={handleChange}
									required
									disabled={loading}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="company" className="form-label">
									Empresa *
								</label>
								<input
									type="text"
									id="company"
									name="company"
									className="form-input"
									value={formData.company}
									onChange={handleChange}
									required
									disabled={loading}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="phone" className="form-label">
									Telefone
								</label>
								<input
									type="tel"
									id="phone"
									name="phone"
									className="form-input"
									value={formData.phone}
									onChange={handleChange}
									disabled={loading}
									placeholder="(11) 99999-9999"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="message" className="form-label">
									Mensagem
								</label>
								<textarea
									id="message"
									name="message"
									className="form-input"
									rows="4"
									value={formData.message}
									onChange={handleChange}
									disabled={loading}
									placeholder="Conte-nos um pouco sobre sua empresa e como podemos ajudar..."
								></textarea>
							</div>

							<div className="form-action">
								<button
									type="submit"
									className="btn btn-primary full-width"
									disabled={loading}
								>
									{loading ? (
										<>
											<i className="fas fa-spinner fa-spin"></i>
											Enviando...
										</>
									) : (
										<>
											<i className="fas fa-paper-plane"></i>
											Solicitar Acesso
										</>
									)}
								</button>
							</div>
						</form>

						<div className="auth-footer">
							<p>
								Já tem uma conta?{" "}
								<button
									type="button"
									onClick={() => navigate("/login")}
									className="link-button"
								>
									Fazer login
								</button>
							</p>
						</div>
					</div>

					<div className="auth-branding">
						<div className="auth-branding-content">
							<h2>Acesso Exclusivo</h2>
							<p>
								Nossa plataforma é destinada especificamente aos nossos clientes
								e parceiros. Após análise, você receberá um convite por email
								caso aprovado.
							</p>
							<div className="auth-benefits">
								<div className="auth-benefit">
									<i className="fas fa-shield-check"></i>
									<div>
										<h4>Segurança Garantida</h4>
										<p>Ambiente protegido com acesso controlado</p>
									</div>
								</div>
								<div className="auth-benefit">
									<i className="fas fa-headset"></i>
									<div>
										<h4>Suporte Dedicado</h4>
										<p>Atendimento especializado para nossos clientes</p>
									</div>
								</div>
								<div className="auth-benefit">
									<i className="fas fa-rocket"></i>
									<div>
										<h4>Soluções Personalizadas</h4>
										<p>Automações adaptadas ao seu negócio</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;
