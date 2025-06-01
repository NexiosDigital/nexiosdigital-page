import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const Settings = () => {
	const { user, updateProfile } = useAuth();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: user?.profile?.name || "",
		email: user?.email || "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			await updateProfile({
				name: formData.name,
				email: formData.email,
			});
			alert("Perfil atualizado com sucesso!");
		} catch (error) {
			alert("Erro ao atualizar perfil: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdatePassword = async (e) => {
		e.preventDefault();
		if (formData.newPassword !== formData.confirmPassword) {
			alert("As senhas não coincidem");
			return;
		}
		try {
			setLoading(true);
			await updateProfile({ password: formData.newPassword });
			setFormData({
				...formData,
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			alert("Senha atualizada com sucesso!");
		} catch (error) {
			alert("Erro ao atualizar senha: " + error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="settings-page">
			<div className="page-header">
				<h1>Configurações</h1>
				<p>Gerencie suas informações pessoais e preferências</p>
			</div>

			<div className="settings-content">
				{/* Informações do Perfil */}
				<div className="dashboard-card">
					<div className="card-header">
						<h3>Informações do Perfil</h3>
					</div>
					<form onSubmit={handleUpdateProfile} className="settings-form">
						<div className="form-group">
							<label className="form-label">Nome</label>
							<input
								type="text"
								name="name"
								className="form-input"
								value={formData.name}
								onChange={handleChange}
								disabled={loading}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Email</label>
							<input
								type="email"
								name="email"
								className="form-input"
								value={formData.email}
								onChange={handleChange}
								disabled={loading}
							/>
						</div>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={loading}
						>
							{loading ? "Salvando..." : "Salvar Alterações"}
						</button>
					</form>
				</div>

				{/* Alterar Senha */}
				<div className="dashboard-card">
					<div className="card-header">
						<h3>Alterar Senha</h3>
					</div>
					<form onSubmit={handleUpdatePassword} className="settings-form">
						<div className="form-group">
							<label className="form-label">Senha Atual</label>
							<input
								type="password"
								name="currentPassword"
								className="form-input"
								value={formData.currentPassword}
								onChange={handleChange}
								disabled={loading}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Nova Senha</label>
							<input
								type="password"
								name="newPassword"
								className="form-input"
								value={formData.newPassword}
								onChange={handleChange}
								disabled={loading}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Confirmar Nova Senha</label>
							<input
								type="password"
								name="confirmPassword"
								className="form-input"
								value={formData.confirmPassword}
								onChange={handleChange}
								disabled={loading}
							/>
						</div>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={loading}
						>
							{loading ? "Alterando..." : "Alterar Senha"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};
