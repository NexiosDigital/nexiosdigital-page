import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const ForgotPassword = ({ authService }) => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			if (!email.trim()) {
				throw new Error("Email é obrigatório");
			}

			await authService.resetPassword(email);
			setSuccess(true);
		} catch (err) {
			console.error("Erro ao solicitar reset de senha:", err);
			setError(err.message || "Erro ao enviar email de recuperação");
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
								<i className="fas fa-envelope-check"></i>
							</div>
							<h2>Email Enviado!</h2>
							<p>
								Se o email <strong>{email}</strong> estiver cadastrado em nosso
								sistema, você receberá instruções para redefinir sua senha.
							</p>
							<div className="success-actions">
								<button
									onClick={() => navigate("/login")}
									className="btn btn-primary"
								>
									Voltar ao Login
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
						<div className="forgot-header">
							<div className="forgot-icon">
								<i className="fas fa-key"></i>
							</div>
							<h1>Esqueceu sua senha?</h1>
							<p>
								Digite seu email abaixo e enviaremos instruções para redefinir
								sua senha.
							</p>
						</div>

						{error && <div className="auth-error">{error}</div>}

						<form className="auth-form" onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="email" className="form-label">
									Email
								</label>
								<input
									type="email"
									id="email"
									name="email"
									className="form-input"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={loading}
									placeholder="seu.email@exemplo.com"
								/>
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
											Enviar Instruções
										</>
									)}
								</button>
							</div>
						</form>

						<div className="auth-footer">
							<p>
								Lembrou da senha?{" "}
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
							<h2>Recuperação Segura</h2>
							<p>
								Utilizamos um processo seguro para garantir que apenas você
								possa redefinir sua senha. Verifique seu email após o envio.
							</p>
							<div className="auth-features">
								<div className="auth-feature">
									<i className="fas fa-shield-alt"></i>
									<span>Processo Seguro</span>
								</div>
								<div className="auth-feature">
									<i className="fas fa-clock"></i>
									<span>Link Temporário</span>
								</div>
								<div className="auth-feature">
									<i className="fas fa-envelope"></i>
									<span>Email Verificado</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
