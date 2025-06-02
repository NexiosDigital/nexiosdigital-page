import React, { useState } from "react";

const SystemSettings = () => {
	const [settings, setSettings] = useState({
		siteName: "Nexios Digital",
		adminEmail: "admin@nexiosdigital.com",
		allowRegistration: false,
		inviteExpireDays: 7,
		maxUsersPerClient: 50,
		enableEmailNotifications: true,
		maintenanceMode: false,
	});
	const [saving, setSaving] = useState(false);

	const handleSettingChange = (key, value) => {
		setSettings({
			...settings,
			[key]: value,
		});
	};

	const handleSaveSettings = async () => {
		try {
			setSaving(true);
			await new Promise((resolve) => setTimeout(resolve, 1000));
			alert("Configurações salvas com sucesso!");
		} catch (error) {
			console.error("Erro ao salvar configurações:", error);
			alert("Erro ao salvar configurações");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="system-settings">
			<div className="page-header">
				<h1>Configurações do Sistema</h1>
				<p>Gerencie as configurações globais da plataforma</p>
			</div>

			<div className="settings-sections">
				{/* Configurações Gerais */}
				<div className="admin-card">
					<div className="card-header">
						<h3>Configurações Gerais</h3>
					</div>
					<div className="settings-grid">
						<div className="setting-item">
							<label className="setting-label">Nome do Site</label>
							<input
								type="text"
								className="form-input"
								value={settings.siteName}
								onChange={(e) =>
									handleSettingChange("siteName", e.target.value)
								}
							/>
						</div>

						<div className="setting-item">
							<label className="setting-label">Email do Administrador</label>
							<input
								type="email"
								className="form-input"
								value={settings.adminEmail}
								onChange={(e) =>
									handleSettingChange("adminEmail", e.target.value)
								}
							/>
						</div>
					</div>
				</div>

				{/* Configurações de Usuários */}
				<div className="admin-card">
					<div className="card-header">
						<h3>Configurações de Usuários</h3>
					</div>
					<div className="settings-grid">
						<div className="setting-item">
							<label className="setting-label">
								Dias para Expirar Convites
							</label>
							<input
								type="number"
								className="form-input"
								value={settings.inviteExpireDays}
								onChange={(e) =>
									handleSettingChange(
										"inviteExpireDays",
										parseInt(e.target.value)
									)
								}
								min="1"
								max="30"
							/>
						</div>

						<div className="setting-item">
							<label className="setting-label">
								Máximo de Usuários por Cliente
							</label>
							<input
								type="number"
								className="form-input"
								value={settings.maxUsersPerClient}
								onChange={(e) =>
									handleSettingChange(
										"maxUsersPerClient",
										parseInt(e.target.value)
									)
								}
								min="1"
							/>
						</div>
					</div>
				</div>

				{/* Configurações Avançadas */}
				<div className="admin-card">
					<div className="card-header">
						<h3>Configurações Avançadas</h3>
					</div>
					<div className="settings-toggles">
						<div className="setting-toggle">
							<div className="toggle-info">
								<span className="toggle-label">Permitir Registro Público</span>
								<span className="toggle-description">
									Permite que usuários se registrem sem convite
								</span>
							</div>
							<label className="toggle-switch">
								<input
									type="checkbox"
									checked={settings.allowRegistration}
									onChange={(e) =>
										handleSettingChange("allowRegistration", e.target.checked)
									}
								/>
								<span className="toggle-slider"></span>
							</label>
						</div>

						<div className="setting-toggle">
							<div className="toggle-info">
								<span className="toggle-label">Notificações por Email</span>
								<span className="toggle-description">
									Enviar notificações automáticas por email
								</span>
							</div>
							<label className="toggle-switch">
								<input
									type="checkbox"
									checked={settings.enableEmailNotifications}
									onChange={(e) =>
										handleSettingChange(
											"enableEmailNotifications",
											e.target.checked
										)
									}
								/>
								<span className="toggle-slider"></span>
							</label>
						</div>

						<div className="setting-toggle">
							<div className="toggle-info">
								<span className="toggle-label">Modo de Manutenção</span>
								<span className="toggle-description">
									Ativar modo de manutenção para todos os usuários
								</span>
							</div>
							<label className="toggle-switch">
								<input
									type="checkbox"
									checked={settings.maintenanceMode}
									onChange={(e) =>
										handleSettingChange("maintenanceMode", e.target.checked)
									}
								/>
								<span className="toggle-slider"></span>
							</label>
						</div>
					</div>
				</div>

				{/* Ações */}
				<div className="settings-actions">
					<button
						className="btn btn-primary"
						onClick={handleSaveSettings}
						disabled={saving}
					>
						{saving ? (
							<>
								<i className="fas fa-spinner fa-spin"></i>
								Salvando...
							</>
						) : (
							<>
								<i className="fas fa-save"></i>
								Salvar Configurações
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default SystemSettings;
