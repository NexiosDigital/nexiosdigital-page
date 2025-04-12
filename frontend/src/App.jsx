import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Componentes
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import AIChat from "./pages/AIChat";
import NotFound from "./pages/NotFound";
import CustomCursor from "./components/CustomCursor"; // Importando o novo componente

// Páginas de Serviço (importadas do arquivo de índice)
import {
	AICustomerService,
	SalesAutomation,
	ProcessAutomation,
	ClickupAutomation,
} from "./pages/services";

function App() {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simular tempo de carregamento
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1000);

		// Adicionar classe ao body para esconder o cursor padrão
		const isMobile =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent
			);

		if (!isMobile) {
			document.body.classList.add("custom-cursor-active");
		}

		return () => {
			clearTimeout(timer);
			document.body.classList.remove("custom-cursor-active");
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
		<Router>
			<div className="app dark">
				<CustomCursor /> {/* Adicionando o cursor personalizado */}
				<Navbar />
				<main className="main-content">
					<Routes>
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

						<Route path="*" element={<NotFound />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</Router>
	);
}

export default App;
