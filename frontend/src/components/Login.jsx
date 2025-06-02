import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Auth.css";

const Login = ({ authService }) => {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			// Validações básicas
			if (!formData.email.trim()) {
				throw new Error("Email é obrigatório");
			}

			if (!formData.password) {
				throw new Error("Senha é obrigatória");
			}

			// Chama a função login do contexto de autenticação
			await login(formData.email, formData.password);

			// Redireciona para o dashboard após login bem-sucedido
			// O redirecionamento será feito automaticamente pelo AuthContext
			// mas vamos adicionar como fallback
			setTimeout(() => {
				navigate("/dashboard");
			}, 100);
		} catch (error) {
			console.error("Erro no login:", error);
			setError(error.message || "Falha no login. Verifique suas credenciais.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="container">
				<div className="auth-container">
					<div className="auth-content">
						<div className="login-header">
							<h1>Bem-vindo de volta</h1>
							<p>Entre na sua conta para acessar o painel de controle</p>
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
									value={formData.email}
									onChange={handleChange}
									required
									disabled={loading}
									placeholder="seu.email@exemplo.com"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="password" className="form-label">
									Senha
								</label>
								<input
									type="password"
									id="password"
									name="password"
									className="form-input"
									value={formData.password}
									onChange={handleChange}
									required
									disabled={loading}
									placeholder="Sua senha"
								/>
							</div>

							<div className="form-options">
								<div className="remember-me">
									<input
										type="checkbox"
										id="rememberMe"
										name="rememberMe"
										checked={formData.rememberMe}
										onChange={handleChange}
										disabled={loading}
									/>
									<label htmlFor="rememberMe">Lembrar-me</label>
								</div>
								<button
									type="button"
									onClick={() => navigate("/forgot-password")}
									className="link-button"
									disabled={loading}
								>
									Esqueceu a senha?
								</button>
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
											Entrando...
										</>
									) : (
										<>
											<i className="fas fa-sign-in-alt"></i>
											Entrar
										</>
									)}
								</button>
							</div>
						</form>

						<div className="auth-footer">
							<p>
								Não tem uma conta?{" "}
								<button
									type="button"
									onClick={() => navigate("/register")}
									className="link-button"
								>
									Solicitar acesso
								</button>
							</p>
						</div>
					</div>

					<div className="auth-branding">
						<div className="auth-branding-content">
							<h2>Dashboard de Cliente</h2>
							<p>
								Acesse seu painel personalizado com todas as ferramentas e
								automações da Nexios Digital. Gerencie suas soluções de IA e
								monitore o desempenho dos seus processos automatizados.
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
								<div className="auth-feature">
									<i className="fas fa-shield-check"></i>
									<span>Segurança Garantida</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
