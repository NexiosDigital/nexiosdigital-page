import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Auth.css";
import api from "../utils/api";

const Login = ({ onLogin }) => {
	const location = useLocation();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState(null);
	const [successMessage, setSuccessMessage] = useState(null);
	const [loading, setLoading] = useState(false);

	// Verificar se há mensagem de sucesso (redirecionamento após registro)
	useEffect(() => {
		if (location.state && location.state.message) {
			setSuccessMessage(location.state.message);
		}
	}, [location]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const response = await api.login(formData);
			const data = response.data;

			// Autenticação bem-sucedida
			onLogin(data.user, data.token);
		} catch (err) {
			console.error("Erro ao fazer login:", err);

			if (err.response) {
				setError(err.response.data.detail || "Email ou senha incorretos");
			} else {
				setError("Erro ao processar seu pedido. Tente novamente.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="container">
				<div className="auth-container">
					<div className="auth-content">
						<h1>Bem-vindo de volta</h1>
						<p>Entre na sua conta para acessar todos os recursos</p>

						{successMessage && (
							<div className="auth-success">{successMessage}</div>
						)}

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
								/>
							</div>

							<div className="form-action">
								<button
									type="submit"
									className="btn btn-primary full-width"
									disabled={loading}
								>
									{loading ? "Entrando..." : "Entrar"}
								</button>
							</div>
						</form>

						<div className="auth-links">
							<p>
								Não tem uma conta? <Link to="/register">Cadastre-se</Link>
							</p>
							<p>
								<Link to="/forgot-password">Esqueceu a senha?</Link>
							</p>
						</div>
					</div>

					<div className="auth-branding">
						<div className="auth-branding-content">
							<h2>Transforme seu negócio com IA</h2>
							<p>
								Entre para ter acesso completo às nossas ferramentas e serviços
								de inteligência artificial para automação de processos e
								atendimento.
							</p>
							<div className="auth-features">
								<div className="auth-feature">
									<i className="fas fa-robot"></i>
									<span>Assistentes de IA personalizados</span>
								</div>
								<div className="auth-feature">
									<i className="fas fa-chart-line"></i>
									<span>Análises detalhadas</span>
								</div>
								<div className="auth-feature">
									<i className="fas fa-lock"></i>
									<span>Segurança de dados</span>
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
