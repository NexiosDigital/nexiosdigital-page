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
	const [lastSaved, setLastSaved] = useState(new Date());

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
			setLastSaved(new Date());
			alert("Configurações salvas com sucesso!");
		} catch (error) {
			console.error("Erro ao salvar configurações:", error);
			alert("Erro ao salvar configurações");
		} finally {
			setSaving(false);
		}
	};

	const handleResetSettings = () => {
		if (
			window.confirm(
				"Tem certeza que deseja restaurar as configurações padrão?"
			)
		) {
			setSettings({
				siteName: "Nexios Digital",
				adminEmail: "admin@nexiosdigital.com",
				allowRegistration: false,
				inviteExpireDays: 7,
				maxUsersPerClient: 50,
				enableEmailNotifications: true,
				maintenanceMode: false,
			});
		}
	};

	const getSystemStatus = () => {
		if (settings.maintenanceMode)
			return { label: "Manutenção", class: "warning" };
		return { label: "Operacional", class: "success" };
	};

	const systemStatus = getSystemStatus();

	return (
		<div className="system-settings">
			{/* Header Section */}
			<div className="admin-header-section">
				<h1>Configurações do Sistema</h1>
				<p>Gerencie as configurações globais da plataforma</p>
			</div>

			{/* Status Cards */}
			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-icon system">
						<i className="fas fa-server"></i>
					</div>
					<div className="stat-content">
						<div className="stat-label">Status do Sistema</div>
						<div className={`stat-value ${systemStatus.class}`}>
							{systemStatus.label}
						</div>
					</div>
					<div className="stat-indicator">
						<i className={`fas fa-circle ${systemStatus.class}`}></i>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon users">
						<i className="fas fa-users-cog"></i>
					</div>
					<div className="stat-content">
						<div className="stat-label">Máx. Usuários/Cliente</div>
						<div className="stat-value">{settings.maxUsersPerClient}</div>
					</div>
					<div className="stat-trend neutral">
						<i className="fas fa-cog"></i>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon timer">
						<i className="fas fa-clock"></i>
					</div>
					<div className="stat-content">
						<div className="stat-label">Convites Expiram</div>
						<div className="stat-value">{settings.inviteExpireDays} dias</div>
					</div>
					<div className="stat-trend neutral">
						<i className="fas fa-calendar"></i>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon save">
						<i className="fas fa-save"></i>
					</div>
					<div className="stat-content">
						<div className="stat-label">Última Modificação</div>
						<div className="stat-value">
							{lastSaved.toLocaleDateString("pt-BR")}
						</div>
					</div>
					<div className="stat-trend neutral">
						<i className="fas fa-history"></i>
					</div>
				</div>
			</div>

			{/* Configurações Gerais */}
			<div className="admin-card">
				<div className="card-header">
					<h3 className="card-title">
						<i className="fas fa-cogs"></i>
						Configurações Gerais
					</h3>
					<div className="card-subtitle">
						Configurações básicas da plataforma
					</div>
				</div>
				<div className="card-content">
					<div className="settings-grid">
						<div className="setting-item">
							<label className="setting-label">
								<i className="fas fa-tag"></i>
								Nome do Site
							</label>
							<input
								type="text"
								className="form-input"
								value={settings.siteName}
								onChange={(e) =>
									handleSettingChange("siteName", e.target.value)
								}
								placeholder="Nome da aplicação"
							/>
							<div className="setting-description">
								Nome exibido no cabeçalho e emails da plataforma
							</div>
						</div>

						<div className="setting-item">
							<label className="setting-label">
								<i className="fas fa-envelope"></i>
								Email do Administrador
							</label>
							<input
								type="email"
								className="form-input"
								value={settings.adminEmail}
								onChange={(e) =>
									handleSettingChange("adminEmail", e.target.value)
								}
								placeholder="admin@exemplo.com"
							/>
							<div className="setting-description">
								Email principal para notificações administrativas
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Configurações de Usuários */}
			<div className="admin-card">
				<div className="card-header">
					<h3 className="card-title">
						<i className="fas fa-users"></i>
						Configurações de Usuários
					</h3>
					<div className="card-subtitle">
						Controle de acesso e limites de usuários
					</div>
				</div>
				<div className="card-content">
					<div className="settings-grid">
						<div className="setting-item">
							<label className="setting-label">
								<i className="fas fa-calendar-times"></i>
								Dias para Expirar Convites
							</label>
							<div className="input-with-unit">
								<input
									type="number"
									className="form-input"
									value={settings.inviteExpireDays}
									onChange={(e) =>
										handleSettingChange(
											"inviteExpireDays",
											parseInt(e.target.value) || 1
										)
									}
									min="1"
									max="30"
								/>
								<span className="input-unit">dias</span>
							</div>
							<div className="setting-description">
								Tempo limite para aceitar convites de registro
							</div>
						</div>

						<div className="setting-item">
							<label className="setting-label">
								<i className="fas fa-users-cog"></i>
								Máximo de Usuários por Cliente
							</label>
							<div className="input-with-unit">
								<input
									type="number"
									className="form-input"
									value={settings.maxUsersPerClient}
									onChange={(e) =>
										handleSettingChange(
											"maxUsersPerClient",
											parseInt(e.target.value) || 1
										)
									}
									min="1"
								/>
								<span className="input-unit">usuários</span>
							</div>
							<div className="setting-description">
								Limite padrão de usuários por cliente
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Configurações Avançadas */}
			<div className="admin-card">
				<div className="card-header">
					<h3 className="card-title">
						<i className="fas fa-sliders-h"></i>
						Configurações Avançadas
					</h3>
					<div className="card-subtitle">
						Funcionalidades avançadas do sistema
					</div>
				</div>
				<div className="card-content">
					<div className="settings-toggles">
						<div className="setting-toggle">
							<div className="toggle-info">
								<div className="toggle-header">
									<i className="fas fa-user-plus"></i>
									<span className="toggle-label">
										Permitir Registro Público
									</span>
									<span
										className={`toggle-status ${
											settings.allowRegistration ? "enabled" : "disabled"
										}`}
									>
										{settings.allowRegistration ? "Habilitado" : "Desabilitado"}
									</span>
								</div>
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
								<div className="toggle-header">
									<i className="fas fa-bell"></i>
									<span className="toggle-label">Notificações por Email</span>
									<span
										className={`toggle-status ${
											settings.enableEmailNotifications ? "enabled" : "disabled"
										}`}
									>
										{settings.enableEmailNotifications
											? "Habilitado"
											: "Desabilitado"}
									</span>
								</div>
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

						<div className="setting-toggle danger">
							<div className="toggle-info">
								<div className="toggle-header">
									<i className="fas fa-tools"></i>
									<span className="toggle-label">Modo de Manutenção</span>
									<span
										className={`toggle-status ${
											settings.maintenanceMode ? "warning" : "success"
										}`}
									>
										{settings.maintenanceMode ? "Ativo" : "Inativo"}
									</span>
								</div>
								<span className="toggle-description">
									Ativar modo de manutenção para todos os usuários
								</span>
							</div>
							<label className="toggle-switch danger">
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
			</div>

			{/* Ações */}
			<div className="admin-card">
				<div className="card-header">
					<h3 className="card-title">
						<i className="fas fa-wrench"></i>
						Ações do Sistema
					</h3>
					<div className="card-subtitle">
						Salvar configurações e ações administrativas
					</div>
				</div>
				<div className="card-content">
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

						<button
							className="btn btn-secondary"
							onClick={handleResetSettings}
							disabled={saving}
						>
							<i className="fas fa-undo"></i>
							Restaurar Padrões
						</button>

						<button
							className="btn btn-warning"
							onClick={() => window.location.reload()}
							disabled={saving}
						>
							<i className="fas fa-sync"></i>
							Recarregar Sistema
						</button>
					</div>

					{lastSaved && (
						<div className="save-info">
							<i className="fas fa-info-circle"></i>
							<span>
								Última modificação: {lastSaved.toLocaleString("pt-BR")}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Info Card */}
			<div className="admin-card info">
				<div className="card-header">
					<h3 className="card-title">
						<i className="fas fa-info-circle"></i>
						Informações Importantes
					</h3>
				</div>
				<div className="card-content">
					<div className="info-list">
						<div className="info-item">
							<i className="fas fa-exclamation-triangle"></i>
							<div>
								<strong>Modo de Manutenção:</strong> Quando ativado, impede o
								acesso de todos os usuários exceto administradores.
							</div>
						</div>
						<div className="info-item">
							<i className="fas fa-envelope"></i>
							<div>
								<strong>Email Admin:</strong> Usado para receber notificações
								críticas e comunicações do sistema.
							</div>
						</div>
						<div className="info-item">
							<i className="fas fa-users"></i>
							<div>
								<strong>Limites de Usuários:</strong> Podem ser ajustados
								individualmente para cada cliente na página de gerenciamento.
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SystemSettings;
