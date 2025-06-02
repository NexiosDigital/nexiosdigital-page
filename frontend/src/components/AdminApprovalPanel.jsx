import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AdminApprovalPanel = () => {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [processing, setProcessing] = useState(null);

	// Carregar solicitações pendentes
	const loadRequests = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("access_requests")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) throw error;
			setRequests(data || []);
		} catch (error) {
			console.error("Erro ao carregar solicitações:", error);
			alert("Erro ao carregar solicitações: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	// Aprovar solicitação
	const approveRequest = async (request) => {
		if (
			!window.confirm(`Aprovar acesso para ${request.name} (${request.email})?`)
		) {
			return;
		}

		try {
			setProcessing(request.id);

			// 1. Criar cliente na tabela clients
			const { data: newClient, error: clientError } = await supabase
				.from("clients")
				.insert([
					{
						name: request.company,
						plan: "basic",
						active: true,
						max_users: 10,
						max_automations: 15,
						created_at: new Date().toISOString(),
					},
				])
				.select()
				.single();

			if (clientError) throw clientError;

			// 2. Criar convite para o usuário
			const inviteToken = crypto.randomUUID();
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

			const { error: inviteError } = await supabase.from("invites").insert([
				{
					email: request.email,
					client_id: newClient.id,
					role: "admin", // Primeiro usuário será admin da empresa
					invited_name: request.name,
					token: inviteToken,
					expires_at: expiresAt.toISOString(),
					status: "pending",
					created_at: new Date().toISOString(),
				},
			]);

			if (inviteError) throw inviteError;

			// 3. Atualizar status da solicitação
			const { error: updateError } = await supabase
				.from("access_requests")
				.update({
					status: "approved",
					updated_at: new Date().toISOString(),
				})
				.eq("id", request.id);

			if (updateError) throw updateError;

			// 4. Gerar link de convite
			const inviteLink = `${window.location.origin}/invite/${inviteToken}`;

			// 5. Mostrar o link para enviar por email
			const message = `
✅ SOLICITAÇÃO APROVADA!

Cliente: ${request.company}
Usuário: ${request.name}
Email: ${request.email}

🔗 LINK DE CONVITE (envie por email):
${inviteLink}

⏰ Válido por 7 dias
      `;

			alert(message);

			// Copiar link para clipboard
			try {
				await navigator.clipboard.writeText(inviteLink);
				alert("Link copiado para área de transferência!");
			} catch (e) {
				console.log("Não foi possível copiar automaticamente");
			}

			// Recarregar lista
			loadRequests();
		} catch (error) {
			console.error("Erro ao aprovar:", error);
			alert("Erro ao aprovar solicitação: " + error.message);
		} finally {
			setProcessing(null);
		}
	};

	// Rejeitar solicitação
	const rejectRequest = async (request) => {
		const reason = window.prompt("Motivo da rejeição (opcional):");
		if (reason === null) return; // Cancelou

		try {
			setProcessing(request.id);

			const { error } = await supabase
				.from("access_requests")
				.update({
					status: "rejected",
					message: reason
						? `${request.message}\n\nMotivo da rejeição: ${reason}`
						: request.message,
					updated_at: new Date().toISOString(),
				})
				.eq("id", request.id);

			if (error) throw error;

			alert(`Solicitação de ${request.name} foi rejeitada.`);
			loadRequests();
		} catch (error) {
			console.error("Erro ao rejeitar:", error);
			alert("Erro ao rejeitar solicitação: " + error.message);
		} finally {
			setProcessing(null);
		}
	};

	// Carregar ao montar o componente
	useEffect(() => {
		loadRequests();
	}, []);

	const getStatusColor = (status) => {
		switch (status) {
			case "pending":
				return "#fbbf24";
			case "approved":
				return "#10b981";
			case "rejected":
				return "#ef4444";
			default:
				return "#6b7280";
		}
	};

	const getStatusLabel = (status) => {
		switch (status) {
			case "pending":
				return "Pendente";
			case "approved":
				return "Aprovado";
			case "rejected":
				return "Rejeitado";
			default:
				return status;
		}
	};

	if (loading) {
		return (
			<div style={{ padding: "20px", textAlign: "center" }}>
				<h2>⏳ Carregando solicitações...</h2>
			</div>
		);
	}

	return (
		<div
			style={{
				padding: "20px",
				maxWidth: "1200px",
				margin: "0 auto",
				fontFamily: "Arial, sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "30px",
					borderBottom: "2px solid #e5e7eb",
					paddingBottom: "20px",
				}}
			>
				<h1 style={{ margin: 0, color: "#1f2937" }}>
					🏢 Solicitações de Acesso
				</h1>
				<button
					onClick={loadRequests}
					style={{
						background: "#3b82f6",
						color: "white",
						border: "none",
						padding: "10px 20px",
						borderRadius: "6px",
						cursor: "pointer",
					}}
				>
					🔄 Atualizar
				</button>
			</div>

			{requests.length === 0 ? (
				<div
					style={{
						textAlign: "center",
						padding: "60px",
						backgroundColor: "#f9fafb",
						borderRadius: "8px",
					}}
				>
					<h3>📭 Nenhuma solicitação encontrada</h3>
					<p>Não há solicitações de acesso no momento.</p>
				</div>
			) : (
				<div style={{ display: "grid", gap: "20px" }}>
					{requests.map((request) => (
						<div
							key={request.id}
							style={{
								border: "1px solid #e5e7eb",
								borderRadius: "8px",
								padding: "20px",
								backgroundColor: "white",
								boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
								}}
							>
								<div style={{ flex: 1 }}>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "15px",
											marginBottom: "15px",
										}}
									>
										<h3 style={{ margin: 0, color: "#1f2937" }}>
											{request.name}
										</h3>
										<span
											style={{
												background: getStatusColor(request.status),
												color: "white",
												padding: "4px 12px",
												borderRadius: "12px",
												fontSize: "12px",
												fontWeight: "bold",
											}}
										>
											{getStatusLabel(request.status)}
										</span>
									</div>

									<div
										style={{
											display: "grid",
											gridTemplateColumns:
												"repeat(auto-fit, minmax(250px, 1fr))",
											gap: "15px",
										}}
									>
										<div>
											<strong>📧 Email:</strong>
											<br />
											<span style={{ color: "#3b82f6" }}>{request.email}</span>
										</div>
										<div>
											<strong>🏢 Empresa:</strong>
											<br />
											{request.company}
										</div>
										{request.phone && (
											<div>
												<strong>📱 Telefone:</strong>
												<br />
												{request.phone}
											</div>
										)}
										<div>
											<strong>📅 Data:</strong>
											<br />
											{new Date(request.created_at).toLocaleString("pt-BR")}
										</div>
									</div>

									{request.message && (
										<div style={{ marginTop: "15px" }}>
											<strong>💬 Mensagem:</strong>
											<br />
											<div
												style={{
													backgroundColor: "#f3f4f6",
													padding: "10px",
													borderRadius: "4px",
													marginTop: "5px",
													fontStyle: "italic",
												}}
											>
												{request.message}
											</div>
										</div>
									)}
								</div>

								{request.status === "pending" && (
									<div
										style={{ display: "flex", gap: "10px", marginLeft: "20px" }}
									>
										<button
											onClick={() => approveRequest(request)}
											disabled={processing === request.id}
											style={{
												background: "#10b981",
												color: "white",
												border: "none",
												padding: "10px 20px",
												borderRadius: "6px",
												cursor:
													processing === request.id ? "not-allowed" : "pointer",
												opacity: processing === request.id ? 0.6 : 1,
											}}
										>
											{processing === request.id ? "⏳" : "✅"} Aprovar
										</button>
										<button
											onClick={() => rejectRequest(request)}
											disabled={processing === request.id}
											style={{
												background: "#ef4444",
												color: "white",
												border: "none",
												padding: "10px 20px",
												borderRadius: "6px",
												cursor:
													processing === request.id ? "not-allowed" : "pointer",
												opacity: processing === request.id ? 0.6 : 1,
											}}
										>
											❌ Rejeitar
										</button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			<div
				style={{
					marginTop: "40px",
					padding: "20px",
					backgroundColor: "#f0f9ff",
					borderRadius: "8px",
					border: "1px solid #bae6fd",
				}}
			>
				<h4 style={{ margin: "0 0 10px 0", color: "#0369a1" }}>
					💡 Como funciona a aprovação:
				</h4>
				<ol style={{ margin: 0, paddingLeft: "20px", color: "#0c4a6e" }}>
					<li>
						Clique em "Aprovar" para criar automaticamente o cliente e gerar um
						convite
					</li>
					<li>
						Um link de convite será gerado e copiado para sua área de
						transferência
					</li>
					<li>Envie este link por email para o solicitante</li>
					<li>O link é válido por 7 dias</li>
					<li>
						O primeiro usuário da empresa será automaticamente o administrador
					</li>
				</ol>
			</div>
		</div>
	);
};

export default AdminApprovalPanel;
