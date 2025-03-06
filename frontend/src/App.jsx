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

function App() {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simular tempo de carregamento
		const timer = setTimeout(() => {
			setLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
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
				<Navbar />
				<main className="main-content">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/about" element={<About />} />
						<Route path="/ai-chat" element={<AIChat />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</Router>
	);
}

export default App;
