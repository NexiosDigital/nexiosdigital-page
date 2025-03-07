import React, { useState, useEffect, useRef } from "react";
import "../styles/AIChat.css";

const AIChat = () => {
	return (
		<div className="ai-chat-page">
			<div className="container">
				<div className="chat-header">
					<h1>Assistente Nexios Digital</h1>
					<p>
						Interaja com nossa IA e descubra como podemos ajudar a transformar
						seu negócio.
					</p>
				</div>

				<div className="implementation-notice">
					<div className="notice-icon">
						<i className="fas fa-tools"></i>
					</div>
					<div className="notice-content">
						<h2>Em fase final de implementação</h2>
						<p>
							Estamos finalizando a implementação do nosso assistente de IA para
							proporcionar a melhor experiência possível. Em breve você poderá
							interagir diretamente com nossa tecnologia de ponta para obter
							respostas personalizadas e soluções para o seu negócio.
						</p>
						<div className="implementation-progress">
							<div className="progress-bar">
								<div className="progress-fill"></div>
							</div>
							<span className="progress-text">90% concluído</span>
						</div>
					</div>
				</div>

				<div className="coming-soon-features">
					<h3>Recursos que estarão disponíveis em breve:</h3>
					<div className="features-grid">
						<div className="feature-item">
							<div className="feature-icon">
								<i className="fas fa-robot"></i>
							</div>
							<div className="feature-content">
								<h4>Assistente Virtual Inteligente</h4>
								<p>
									Responde a perguntas complexas sobre nossas soluções e como
									elas podem ajudar seu negócio.
								</p>
							</div>
						</div>
						<div className="feature-item">
							<div className="feature-icon">
								<i className="fas fa-cogs"></i>
							</div>
							<div className="feature-content">
								<h4>Diagnóstico de Processos</h4>
								<p>
									Análise preliminar dos processos do seu negócio para
									identificar oportunidades de automação.
								</p>
							</div>
						</div>
						<div className="feature-item">
							<div className="feature-icon">
								<i className="fas fa-chart-line"></i>
							</div>
							<div className="feature-content">
								<h4>Estimativas de ROI</h4>
								<p>
									Cálculos estimados de retorno sobre investimento para
									implementação de nossas soluções.
								</p>
							</div>
						</div>
						<div className="feature-item">
							<div className="feature-icon">
								<i className="fas fa-calendar-alt"></i>
							</div>
							<div className="feature-content">
								<h4>Agendamento Inteligente</h4>
								<p>
									Agendamento automático de demonstrações e consultas com nossos
									especialistas.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="ai-examples">
					<h3>Veja o que nosso assistente poderá fazer por você:</h3>
					<div className="examples-container">
						<div className="example-chat">
							<div className="example-message message-user">
								Como a IA pode melhorar o atendimento ao cliente da minha
								empresa?
							</div>
							<div className="example-message message-ai">
								Nossos agentes de IA podem melhorar seu atendimento ao cliente
								oferecendo suporte 24/7, reduzindo o tempo de resposta em até
								70% e personalizando interações com base no histórico do
								cliente. Além disso, nossos sistemas são capazes de detectar o
								sentimento do cliente e escalonar questões complexas para
								humanos quando necessário, garantindo uma experiência fluida.
							</div>
						</div>
						<div className="example-chat">
							<div className="example-message message-user">
								Quais processos internos podem ser automatizados na minha
								empresa?
							</div>
							<div className="example-message message-ai">
								A Nexios Digital pode automatizar diversos processos internos,
								incluindo: gestão de documentos, fluxos de aprovação, tarefas de
								RH como onboarding e avaliações, geração de relatórios, análise
								de dados e muito mais. Nossos clientes relatam em média 40% de
								aumento na eficiência operacional e redução de 60% nos erros
								processuais após implementação.
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AIChat;
