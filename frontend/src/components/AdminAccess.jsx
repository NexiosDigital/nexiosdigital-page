import React, { useState } from "react";
import AdminApprovalPanel from "./AdminApprovalPanel";

const AdminAccess = () => {
	const [authenticated, setAuthenticated] = useState(false);
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// Senha simples para acesso rápido (em produção, usar autenticação real)
	const ADMIN_PASSWORD = "nexios2024";

	const handleLogin = (e) => {
		e.preventDefault();

		if (password === ADMIN_PASSWORD) {
			setAuthenticated(true);
			setError("");
		} else {
			setError("Senha incorreta");
		}
	};

	if (authenticated) {
		return <AdminApprovalPanel />;
	}

	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				fontFamily: "Arial, sans-serif",
			}}
		>
			<div
				style={{
					background: "white",
					padding: "40px",
					borderRadius: "12px",
					boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
					width: "100%",
					maxWidth: "400px",
				}}
			>
				<div style={{ textAlign: "center", marginBottom: "30px" }}>
					<h1 style={{ margin: "0 0 10px 0", color: "#1f2937" }}>
						🔐 Acesso Admin
					</h1>
					<p style={{ margin: 0, color: "#6b7280" }}>
						Digite a senha para acessar o painel de aprovação
					</p>
				</div>

				<form onSubmit={handleLogin}>
					<div style={{ marginBottom: "20px" }}>
						<label
							style={{
								display: "block",
								marginBottom: "8px",
								fontWeight: "bold",
								color: "#374151",
							}}
						>
							Senha de Administrador:
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Digite a senha..."
							style={{
								width: "100%",
								padding: "12px",
								border: "2px solid #e5e7eb",
								borderRadius: "6px",
								fontSize: "16px",
								outline: "none",
								transition: "border-color 0.3s",
								boxSizing: "border-box",
							}}
							onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
							onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
						/>
					</div>

					{error && (
						<div
							style={{
								background: "#fee2e2",
								border: "1px solid #fecaca",
								color: "#dc2626",
								padding: "10px",
								borderRadius: "6px",
								marginBottom: "20px",
								textAlign: "center",
							}}
						>
							❌ {error}
						</div>
					)}

					<button
						type="submit"
						style={{
							width: "100%",
							background: "#3b82f6",
							color: "white",
							border: "none",
							padding: "12px",
							borderRadius: "6px",
							fontSize: "16px",
							fontWeight: "bold",
							cursor: "pointer",
							transition: "background-color 0.3s",
						}}
						onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
						onMouseLeave={(e) => (e.target.style.background = "#3b82f6")}
					>
						🚀 Acessar Painel
					</button>
				</form>

				<div
					style={{
						marginTop: "30px",
						padding: "15px",
						background: "#f3f4f6",
						borderRadius: "6px",
						fontSize: "14px",
						color: "#6b7280",
					}}
				>
					<strong>💡 Dica:</strong> Para desenvolvimento, a senha padrão é:{" "}
					<code>nexios2024</code>
				</div>
			</div>
		</div>
	);
};

export default AdminAccess;
