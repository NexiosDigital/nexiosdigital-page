// src/components/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			// Validações básicas
			if (!email.trim()) {
				throw new Error("Email é obrigatório");
			}

			if (!password) {
				throw new Error("Senha é obrigatória");
			}

			// Chama a função login do contexto de autenticação
			await login(email, password);

			// Redireciona para o dashboard após login bem-sucedido
			window.location.href = "/dashboard";
		} catch (error) {
			console.error("Erro no login:", error);
			setError(error.message || "Falha no login. Verifique suas credenciais.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-lg">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-extrabold text-white">
						Dashboard de Cliente
					</h2>
					<p className="mt-2 text-sm text-gray-400">
						Entre em sua conta para acessar o painel
					</p>
				</div>

				{error && (
					<div className="bg-red-900/50 text-red-200 p-4 rounded-md flex items-center gap-3">
						<span>⚠️</span>
						<span>{error}</span>
					</div>
				)}

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md -space-y-px">
						<div className="mb-4">
							<label htmlFor="email" className="sr-only">
								Email
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<span className="text-gray-500">📧</span>
								</div>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									className="bg-gray-700 appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
									placeholder="Email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
						</div>

						<div>
							<label htmlFor="password" className="sr-only">
								Senha
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<span className="text-gray-500">🔒</span>
								</div>
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
									className="bg-gray-700 appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-600 placeholder-gray-500 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
									placeholder="Senha"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox"
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
							/>
							<label
								htmlFor="remember-me"
								className="ml-2 block text-sm text-gray-400"
							>
								Lembrar-me
							</label>
						</div>

						<div className="text-sm">
							<button
								type="button"
								onClick={() => (window.location.href = "/forgot-password")}
								className="text-blue-400 hover:text-blue-300"
							>
								Esqueceu sua senha?
							</button>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
								loading ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
							} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
						>
							{loading ? (
								<span className="flex items-center">
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Entrando...
								</span>
							) : (
								"Entrar"
							)}
						</button>
					</div>
				</form>

				<div className="mt-4 text-center">
					<p className="text-sm text-gray-400">
						Não tem uma conta?{" "}
						<button
							onClick={() => (window.location.href = "/contact")}
							className="text-blue-400 hover:text-blue-300"
						>
							Entre em contato conosco
						</button>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
