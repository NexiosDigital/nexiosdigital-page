import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
	GoogleReCaptchaProvider,
	useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { sendContactEmail } from "../services/emailService";
import "../styles/ContactForm.css";

// Schema de validação
const schema = yup
	.object({
		name: yup
			.string()
			.required("Nome é obrigatório")
			.min(3, "Nome deve ter pelo menos 3 caracteres"),
		email: yup.string().email("Email inválido").required("Email é obrigatório"),
		company: yup.string(),
		phone: yup
			.string()
			.matches(
				/^(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})$/,
				"Formato de telefone inválido. Ex: (22) 98765-4321"
			),
		message: yup
			.string()
			.required("Mensagem é obrigatória")
			.min(10, "Mensagem muito curta"),
		honeypot: yup
			.string()
			.test("is-empty", "Não deve ser preenchido", (value) => !value),
	})
	.required();

const ContactFormWithRecaptcha = () => {
	const { executeRecaptcha } = useGoogleReCaptcha();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formStatus, setFormStatus] = useState({
		message: "",
		type: "", // "success" ou "error"
	});

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid, isDirty, touchedFields },
	} = useForm({
		resolver: yupResolver(schema),
		mode: "onChange", // Validação em tempo real enquanto digita
	});

	const onSubmit = async (data) => {
		try {
			setIsSubmitting(true);
			setFormStatus({ message: "", type: "" });

			// Verificar se o honeypot foi preenchido
			if (data.honeypot) {
				throw new Error("Submissão identificada como potencial spam");
			}

			// Executar reCAPTCHA
			const recaptchaToken = await executeRecaptcha("contact_form");

			// Remover campo honeypot antes de enviar
			const { honeypot, ...contactData } = data;

			// Adicionar timestamp e token reCAPTCHA
			const formData = {
				...contactData,
				timestamp: new Date().toISOString(),
				recaptchaToken,
			};

			// Enviar o email
			const result = await sendContactEmail(formData);

			// Limpar formulário após envio bem-sucedido
			reset();

			// Mostrar mensagem de sucesso
			setFormStatus({
				message:
					"Mensagem enviada com sucesso! Entraremos em contato em breve.",
				type: "success",
			});
		} catch (error) {
			console.error("Erro ao enviar mensagem:", error);
			setFormStatus({
				message:
					"Houve um erro ao enviar sua mensagem. Por favor, tente novamente.",
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="contact-form-container">
			<div className="form-header">
				<h3>Envie-nos uma mensagem</h3>
				<p>
					Preencha o formulário abaixo e entraremos em contato o mais breve
					possível.
				</p>
			</div>

			{formStatus.message && (
				<div className={`form-message ${formStatus.type}`}>
					{formStatus.type === "success" ? (
						<i className="fas fa-check-circle"></i>
					) : (
						<i className="fas fa-exclamation-circle"></i>
					)}
					<p>{formStatus.message}</p>
				</div>
			)}

			<form className="contact-form" onSubmit={handleSubmit(onSubmit)}>
				<div
					className={`form-group ${
						errors.name ? "error" : touchedFields.name ? "valid" : ""
					}`}
				>
					<label htmlFor="name" className="form-label">
						Nome *
					</label>
					<div className="input-wrapper">
						<input
							type="text"
							id="name"
							{...register("name")}
							className="form-input"
							placeholder="Seu nome completo"
							disabled={isSubmitting}
						/>
						{touchedFields.name && !errors.name && (
							<i className="fas fa-check input-icon valid"></i>
						)}
						{errors.name && (
							<i className="fas fa-exclamation-circle input-icon error"></i>
						)}
					</div>
					{errors.name && (
						<p className="error-message">{errors.name.message}</p>
					)}
				</div>

				<div
					className={`form-group ${
						errors.email ? "error" : touchedFields.email ? "valid" : ""
					}`}
				>
					<label htmlFor="email" className="form-label">
						Email *
					</label>
					<div className="input-wrapper">
						<input
							type="email"
							id="email"
							{...register("email")}
							className="form-input"
							placeholder="seu.email@exemplo.com"
							disabled={isSubmitting}
						/>
						{touchedFields.email && !errors.email && (
							<i className="fas fa-check input-icon valid"></i>
						)}
						{errors.email && (
							<i className="fas fa-exclamation-circle input-icon error"></i>
						)}
					</div>
					{errors.email && (
						<p className="error-message">{errors.email.message}</p>
					)}
				</div>

				<div className="form-row">
					<div
						className={`form-group ${
							errors.company ? "error" : touchedFields.company ? "valid" : ""
						}`}
					>
						<label htmlFor="company" className="form-label">
							Empresa
						</label>
						<input
							type="text"
							id="company"
							{...register("company")}
							className="form-input"
							placeholder="Nome da sua empresa"
							disabled={isSubmitting}
						/>
					</div>

					<div
						className={`form-group ${
							errors.phone ? "error" : touchedFields.phone ? "valid" : ""
						}`}
					>
						<label htmlFor="phone" className="form-label">
							Telefone
						</label>
						<div className="input-wrapper">
							<input
								type="tel"
								id="phone"
								{...register("phone")}
								className="form-input"
								placeholder="(22) 98765-4321"
								disabled={isSubmitting}
							/>
							{touchedFields.phone && !errors.phone && (
								<i className="fas fa-check input-icon valid"></i>
							)}
							{errors.phone && (
								<i className="fas fa-exclamation-circle input-icon error"></i>
							)}
						</div>
						{errors.phone && (
							<p className="error-message">{errors.phone.message}</p>
						)}
					</div>
				</div>

				<div
					className={`form-group ${
						errors.message ? "error" : touchedFields.message ? "valid" : ""
					}`}
				>
					<label htmlFor="message" className="form-label">
						Mensagem *
					</label>
					<div className="textarea-wrapper">
						<textarea
							id="message"
							{...register("message")}
							className="form-input"
							rows="5"
							placeholder="Como podemos ajudar?"
							disabled={isSubmitting}
						></textarea>
						{touchedFields.message && !errors.message && (
							<i className="fas fa-check input-icon valid textarea-icon"></i>
						)}
						{errors.message && (
							<i className="fas fa-exclamation-circle input-icon error textarea-icon"></i>
						)}
					</div>
					{errors.message && (
						<p className="error-message">{errors.message.message}</p>
					)}
				</div>

				{/* Campo honeypot (invisível para usuários reais) */}
				<div className="form-honeypot">
					<input
						type="text"
						id="honeypot"
						{...register("honeypot")}
						tabIndex="-1"
						autoComplete="off"
					/>
				</div>

				<button
					type="submit"
					className="btn btn-primary full-width"
					disabled={isSubmitting || (!isDirty && !isValid)}
				>
					{isSubmitting ? (
						<>
							<i className="fas fa-spinner fa-spin"></i> Enviando...
						</>
					) : (
						<>
							<i className="fas fa-paper-plane"></i> Enviar Mensagem
						</>
					)}
				</button>
			</form>
		</div>
	);
};

// Componente wrapper com o Provider do reCAPTCHA
const ContactForm = () => {
	return (
		<GoogleReCaptchaProvider
			reCaptchaKey="6LenD-0qAAAAAI7dpXDSbes2kWW5MXepNvu7-NfE" // Você precisará substituir por seu site key
			scriptProps={{
				async: true,
				defer: true,
				appendTo: "head",
			}}
		>
			<ContactFormWithRecaptcha />
		</GoogleReCaptchaProvider>
	);
};

export default ContactForm;
