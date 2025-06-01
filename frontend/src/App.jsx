import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Componentes existentes
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import AIChat from "./pages/AIChat";
import NotFound from "./pages/NotFound";

// Páginas de Serviço
import {
	AICustomerService,
	SalesAutomation,
	ProcessAutomation,
	ClickupAutomation,
} from "./pages/services";

// Sistema de Autenticação e Dashboard
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import InviteRegister from "./components/InviteRegister";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { AuthProvider } from "./contexts/AuthContext";
import * as AuthServiceModule from "./services/AuthService";

// Instanciar o serviço de autenticação
const authService = new AuthServiceModule.AuthService();

function App() {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simular tempo de carregamento
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1000);

		return () => {
			clearTimeout(timer);
		};
	}, []);

	if (loading) {
		return (
			<div className="loading-screen">
				<div className="loading-spinner"></div>
			</div>
		);
	}

	return (
		<AuthProvider authService={authService}>
			<Router>
				<div className="app dark">
					{/* Renderizar Navbar condicionalmente */}
					<Routes>
						<Route path="/login" element={null} />
						<Route path="/register" element={null} />
						<Route path="/invite/*" element={null} />
						<Route path="/forgot-password" element={null} />
						<Route path="/reset-password" element={null} />
						<Route path="/dashboard/*" element={null} />
						<Route path="/admin/*" element={null} />
						<Route path="*" element={<Navbar />} />
					</Routes>

					<main className="main-content">
						<Routes>
							{/* Rotas públicas */}
							<Route path="/" element={<Home />} />
							<Route path="/about" element={<About />} />
							<Route path="/ai-chat" element={<AIChat />} />

							{/* Rotas de Serviços */}
							<Route
								path="/services/ai-customer-service"
								element={<AICustomerService />}
							/>
							<Route
								path="/services/sales-automation"
								element={<SalesAutomation />}
							/>
							<Route
								path="/services/process-automation"
								element={<ProcessAutomation />}
							/>
							<Route
								path="/services/clickup-automation"
								element={<ClickupAutomation />}
							/>

							{/* Rotas de Autenticação */}
							<Route
								path="/login"
								element={
									<PublicRoute>
										<Login authService={authService} />
									</PublicRoute>
								}
							/>
							<Route
								path="/register"
								element={
									<PublicRoute>
										<Register authService={authService} />
									</PublicRoute>
								}
							/>
							<Route
								path="/invite/:token"
								element={
									<PublicRoute>
										<InviteRegister authService={authService} />
									</PublicRoute>
								}
							/>
							<Route
								path="/forgot-password"
								element={
									<PublicRoute>
										<ForgotPassword authService={authService} />
									</PublicRoute>
								}
							/>
							<Route
								path="/reset-password"
								element={
									<PublicRoute>
										<ResetPassword authService={authService} />
									</PublicRoute>
								}
							/>

							{/* Rotas Protegidas - Dashboard do Cliente */}
							<Route
								path="/dashboard/*"
								element={
									<ProtectedRoute>
										<Dashboard />
									</ProtectedRoute>
								}
							/>

							{/* Rotas Protegidas - Painel Administrativo */}
							<Route
								path="/admin/*"
								element={
									<ProtectedRoute requiredPermission="admin_access">
										<AdminPanel />
									</ProtectedRoute>
								}
							/>

							{/* Rota 404 */}
							<Route path="*" element={<NotFound />} />
						</Routes>
					</main>

					{/* Renderizar Footer condicionalmente */}
					<Routes>
						<Route path="/login" element={null} />
						<Route path="/register" element={null} />
						<Route path="/invite/*" element={null} />
						<Route path="/forgot-password" element={null} />
						<Route path="/reset-password" element={null} />
						<Route path="/dashboard/*" element={null} />
						<Route path="/admin/*" element={null} />
						<Route path="*" element={<Footer />} />
					</Routes>
				</div>
			</Router>
		</AuthProvider>
	);
}

export default App;
