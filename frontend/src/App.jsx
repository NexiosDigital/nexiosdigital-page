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
// Remova a importação do CustomCursor se não existir
// import CustomCursor from "./components/CustomCursor";

// Páginas de Serviço (importadas do arquivo de índice)
import {
	AICustomerService,
	SalesAutomation,
	ProcessAutomation,
	ClickupAutomation,
} from "./pages/services";

// Novos componentes para o Dashboard de Clientes
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
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

		// Comentado por enquanto - ative após criar o CustomCursor
		// Adicionar classe ao body para esconder o cursor padrão
		// const isMobile =
		//   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		//     navigator.userAgent
		//   );
		//
		// if (!isMobile) {
		//   document.body.classList.add("custom-cursor-active");
		// }

		return () => {
			clearTimeout(timer);
			// document.body.classList.remove("custom-cursor-active");
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
					{/* Comente o CustomCursor até que você o implemente */}
					{/* <CustomCursor /> */}

					{/* Renderizar Navbar condicionalmente */}
					<Routes>
						<Route path="/login" element={null} />
						<Route path="/dashboard/*" element={null} />
						<Route path="*" element={<Navbar />} />
					</Routes>

					<main className="main-content">
						<Routes>
							{/* Rotas públicas existentes */}
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

							{/* Novas rotas para o Dashboard de Clientes */}
							<Route
								path="/login"
								element={<Login authService={authService} />}
							/>
							<Route
								path="/dashboard/*"
								element={
									<ProtectedRoute>
										<Dashboard />
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
						<Route path="/dashboard/*" element={null} />
						<Route path="*" element={<Footer />} />
					</Routes>
				</div>
			</Router>
		</AuthProvider>
	);
}

export default App;
