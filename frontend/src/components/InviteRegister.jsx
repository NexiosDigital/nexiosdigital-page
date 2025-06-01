import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Auth.css";

const InviteRegister = ({ authService }) => {
	const { token } = useParams();
	const navigate = useNavigate();
	const { login } = useAuth();

	const [inviteData, setInviteData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [registering, setRegistering] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
		name: "",
		password: "",
		confirmPassword: "",
	});

	// Verificar o token de convite ao carregar
	useEffect(() => {
		const verifyInvite = async () => {
			try {
				setLoading(true);
				const invite = await authService.verifyInviteToken(token);

				if (!invite || invite.status !== "pending") {
					throw new Error("Convite inválido ou já utilizado");
				}

				// Verificar se não expirou
				if (new Date(invite.expires_at) < new Date()) {
					throw new Error("Convite expirado");
				}

				setInviteData(invite);
				setFormData((prev) => ({
					...prev,
					name: invite.invited_name || "",
				}));
			} catch (err) {
				console.error("Erro ao verificar convite:", err);
				setError(err.message || "Convite inválido");
			} finally {
				setLoading(false);
			}
		};

		if (token) {
			verifyInvite();
		} else {
			setError("Token de convite não fornecido");
			setLoading(false);
		}
	}, [token, authService]);

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

		// Validações
		if (!formData.name.trim()) {
			setError("Nome é obrigatório");
			return;
		}

		if (formData.password.length < 8) {
			setError("A senha deve ter pelo menos 8 caracteres");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError("As senhas não coincidem");
			return;
		}

		try {
			setRegistering(true);

			// Registrar o usuário usando o convite
			const result = await authService.registerWithInvite(token, {
				name: formData.name,
				password: formData.password,
			});

			// Fazer login automaticamente
			const loginResult = await authService.login(
				inviteData.email,
				formData.password
			);

			// Atualizar contexto de auth
			await login(inviteData.email, formData.password);

			// Redirecionar para o dashboard
			navigate("/dashboard");
		} catch (err) {
			console.error("Erro no registro:", err);
			setError(err.message || "Erro ao criar conta");
		} finally {
			setRegistering(false);
		}
	};

	if (loading) {
		return (
			<div className="auth-page">
				<div className="container">
					<div className="auth-container">
						<div className="loading-container">
							<div className="loading-spinner"></div>
							<p>Verificando convite...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error && !inviteData) {
		return (
			<div className="auth-page">
				<div className="container">
					<div className="auth-container">
						<div className="error-container">
							<div className="error-icon">
								<i className="fas fa-exclamation-triangle"></i>
							</div>
							<h2>Convite Inválido</h2>
							<p>{error}</p>
							<button onClick={() => navigate("/")} className="btn btn-primary">
								Voltar ao Início
							</button>
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
						<div className="invite-header">
							<div className="invite-icon">
								<i className="fas fa-envelope-open-text"></i>
							</div>
							<h1>Bem-vindo à Nexios Digital!</h1>
							<p>Complete seu cadastro para acessar nossa plataforma</p>
						</div>

						{inviteData && (
							<div className="invite-info">
								<div className="invite-detail">
									<strong>Email:</strong> {inviteData.email}
								</div>
								<div className="invite-detail">
									<strong>Cliente:</strong> {inviteData.client_name}
								</div>
								<div className="invite-detail">
									<strong>Função:</strong> {inviteData.role}
								</div>
							</div>
						)}

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
									disabled={registering}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="password" className="form-label">
									Senha *
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
									disabled={registering}
									placeholder="Mínimo 8 caracteres"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="confirmPassword" className="form-label">
									Confirmar Senha *
								</label>
								<input
									type="password"
									id="confirmPassword"
									name="confirmPassword"
									className="form-input"
									value={formData.confirmPassword}
									onChange={handleChange}
									required
									disabled={registering}
									placeholder="Digite a senha novamente"
								/>
							</div>

							<div className="form-action">
								<button
									type="submit"
									className="btn btn-primary full-width"
									disabled={registering}
								>
									{registering ? (
										<>
											<i className="fas fa-spinner fa-spin"></i>
											Criando conta...
										</>
									) : (
										<>
											<i className="fas fa-user-plus"></i>
											Criar Conta
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
							<h2>Você foi convidado!</h2>
							<p>
								Sua empresa confiou na Nexios Digital para transformar seus
								processos com inteligência artificial. Complete seu cadastro e
								comece a explorar nossas soluções.
							</p>
							<div className="auth-features">
								<div className="auth-feature">
									<i className="fas fa-robot"></i>
									<span>Automações Inteligentes</span>
								</div>
								<div className="auth-feature">
									<i className="fas fa-chart-line"></i>
									<span>Relatórios Detalhados</span>
								</div>
								<div className="auth-feature">
									<i className="fas fa-headset"></i>
									<span>Suporte Especializado</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InviteRegister;
