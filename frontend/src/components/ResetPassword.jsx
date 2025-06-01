import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/Auth.css";

const ResetPassword = ({ authService }) => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const [validating, setValidating] = useState(true);

	useEffect(() => {
		// Verificar se há tokens válidos na URL
		const accessToken = searchParams.get("access_token");
		const refreshToken = searchParams.get("refresh_token");

		if (!accessToken) {
			setError("Link de redefinição inválido ou expirado");
			setValidating(false);
			return;
		}

		// Validar o token com o Supabase
		const validateToken = async () => {
			try {
				await authService.validateResetToken(accessToken);
				setValidating(false);
			} catch (err) {
				setError("Link de redefinição inválido ou expirado");
				setValidating(false);
			}
		};

		validateToken();
	}, [searchParams, authService]);

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
			// Validações
			if (!formData.password) {
				throw new Error("Nova senha é obrigatória");
			}

			if (formData.password.length < 8) {
				throw new Error("A senha deve ter pelo menos 8 caracteres");
			}

			if (formData.password !== formData.confirmPassword) {
				throw new Error("As senhas não coincidem");
			}

			// Redefinir a senha
			await authService.confirmPasswordReset(formData.password);
			setSuccess(true);
		} catch (err) {
			console.error("Erro ao redefinir senha:", err);
			setError(err.message || "Erro ao redefinir senha");
		} finally {
			setLoading(false);
		}
	};

	if (validating) {
		return (
			<div className="auth-page">
				<div className="container">
					<div className="auth-container">
						<div className="loading-container">
							<div className="loading-spinner"></div>
							<p>Validando link de redefinição...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error && !formData.password) {
		return (
			<div className="auth-page">
				<div className="container">
					<div className="auth-container">
						<div className="error-container">
							<div className="error-icon">
								<i className="fas fa-exclamation-triangle"></i>
							</div>
							<h2>Link Inválido</h2>
							<p>{error}</p>
							<div className="error-actions">
								<button
									onClick={() => navigate("/forgot-password")}
									className="btn btn-primary"
								>
									Solicitar Novo Link
								</button>
								<button
									onClick={() => navigate("/login")}
									className="btn btn-secondary"
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

	if (success) {
		return (
			<div className="auth-page">
				<div className="container">
					<div className="auth-container">
						<div className="success-container">
							<div className="success-icon">
								<i className="fas fa-check-circle"></i>
							</div>
							<h2>Senha Redefinida!</h2>
							<p>
								Sua senha foi redefinida com sucesso. Agora você pode fazer
								login com sua nova senha.
							</p>
							<div className="success-actions">
								<button
									onClick={() => navigate("/login")}
									className="btn btn-primary"
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
						<div className="reset-header">
							<div className="reset-icon">
								<i className="fas fa-lock"></i>
							</div>
							<h1>Redefinir Senha</h1>
							<p>Digite sua nova senha abaixo.</p>
						</div>

						{error && <div className="auth-error">{error}</div>}

						<form className="auth-form" onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="password" className="form-label">
									Nova Senha
								</label>
								<input
									type="password"
									id="password"
									name="password"
									className="form-input"
									value={formData.password}
									onChange={handleChange}
									required
									minLength="8"
									disabled={loading}
									placeholder="Mínimo 8 caracteres"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="confirmPassword" className="form-label">
									Confirmar Nova Senha
								</label>
								<input
									type="password"
									id="confirmPassword"
									name="confirmPassword"
									className="form-input"
									value={formData.confirmPassword}
									onChange={handleChange}
									required
									disabled={loading}
									placeholder="Digite a senha novamente"
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
											Redefinindo...
										</>
									) : (
										<>
											<i className="fas fa-key"></i>
											Redefinir Senha
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
							<h2>Nova Senha</h2>
							<p>
								Escolha uma senha forte e segura. Recomendamos pelo menos 8
								caracteres com uma combinação de letras, números e símbolos.
							</p>
							<div className="password-tips">
								<div className="password-tip">
									<i className="fas fa-check"></i>
									<span>Pelo menos 8 caracteres</span>
								</div>
								<div className="password-tip">
									<i className="fas fa-check"></i>
									<span>Combinação de letras e números</span>
								</div>
								<div className="password-tip">
									<i className="fas fa-check"></i>
									<span>Evite informações pessoais</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResetPassword;
