import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import api from "../utils/api";

const Register = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		company: "",
		jobTitle: "",
	});
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

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

		// Validação de senha
		if (formData.password !== formData.confirmPassword) {
			setError("As senhas não coincidem");
			return;
		}

		setLoading(true);

		try {
			// Preparar dados para envio
			const userData = { ...formData };
			delete userData.confirmPassword;

			// Enviar dados usando a API (real ou mock)
			const response = await api.register(userData);
			console.log("Registro bem-sucedido:", response.data);

			// Redirecionamento após registro bem-sucedido
			navigate("/login", {
				state: {
					message: "Conta criada com sucesso! Faça login para continuar.",
				},
			});
		} catch (err) {
			console.error("Erro ao registrar:", err);

			if (err.response) {
				setError(err.response.data.detail || "Erro ao criar conta");
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
						<h1>Crie sua conta</h1>
						<p>Cadastre-se para acessar nossas soluções de IA</p>

						{error && <div className="auth-error">{error}</div>}

						<form className="auth-form" onSubmit={handleSubmit}>
							<div className="form-group">
								<label htmlFor="name" className="form-label">
									Nome completo
								</label>
								<input
									type="text"
									id="name"
									name="name"
									className="form-input"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</div>

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

							<div className="form-row">
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
										minLength="8"
									/>
								</div>

								<div className="form-group">
									<label htmlFor="confirmPassword" className="form-label">
										Confirme a senha
									</label>
									<input
										type="password"
										id="confirmPassword"
										name="confirmPassword"
										className="form-input"
										value={formData.confirmPassword}
										onChange={handleChange}
										required
									/>
								</div>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label htmlFor="company" className="form-label">
										Empresa
									</label>
									<input
										type="text"
										id="company"
										name="company"
										className="form-input"
										value={formData.company}
										onChange={handleChange}
									/>
								</div>

								<div className="form-group">
									<label htmlFor="jobTitle" className="form-label">
										Cargo
									</label>
									<input
										type="text"
										id="jobTitle"
										name="jobTitle"
										className="form-input"
										value={formData.jobTitle}
										onChange={handleChange}
									/>
								</div>
							</div>

							<div className="form-action">
								<button
									type="submit"
									className="btn btn-primary full-width"
									disabled={loading}
								>
									{loading ? "Criando conta..." : "Criar conta"}
								</button>
							</div>
						</form>

						<div className="auth-links">
							<p>
								Já tem uma conta? <Link to="/login">Faça login</Link>
							</p>
						</div>
					</div>

					<div className="auth-branding">
						<div className="auth-branding-content">
							<h2>Junte-se à revolução da IA</h2>
							<p>
								Crie sua conta agora para explorar como nossas soluções de IA
								podem transformar seu negócio e aumentar sua eficiência.
							</p>
							<div className="auth-benefits">
								<div className="auth-benefit">
									<i className="fas fa-check-circle"></i>
									<div>
										<h4>Acesso exclusivo</h4>
										<p>
											Ferramentas e recursos disponíveis apenas para membros
										</p>
									</div>
								</div>
								<div className="auth-benefit">
									<i className="fas fa-check-circle"></i>
									<div>
										<h4>Demostrações personalizadas</h4>
										<p>Soluções adaptadas às necessidades do seu negócio</p>
									</div>
								</div>
								<div className="auth-benefit">
									<i className="fas fa-check-circle"></i>
									<div>
										<h4>Suporte prioritário</h4>
										<p>Atendimento especializado para suas dúvidas</p>
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
