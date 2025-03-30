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
		<div className="contact-form-wrapper">
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
				<div className="form-field">
					<label htmlFor="name" className="form-label">
						Nome *
					</label>
					<input
						type="text"
						id="name"
						{...register("name")}
						className={`form-input ${
							errors.name
								? "input-error"
								: touchedFields.name
								? "input-valid"
								: ""
						}`}
						placeholder="Seu nome completo"
						disabled={isSubmitting}
					/>
					{errors.name && (
						<p className="error-message">{errors.name.message}</p>
					)}
				</div>

				<div className="form-field">
					<label htmlFor="email" className="form-label">
						Email *
					</label>
					<input
						type="email"
						id="email"
						{...register("email")}
						className={`form-input ${
							errors.email
								? "input-error"
								: touchedFields.email
								? "input-valid"
								: ""
						}`}
						placeholder="seu.email@exemplo.com"
						disabled={isSubmitting}
					/>
					{errors.email && (
						<p className="error-message">{errors.email.message}</p>
					)}
				</div>

				<div className="form-field">
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

				<div className="form-field">
					<label htmlFor="phone" className="form-label">
						Telefone
					</label>
					<input
						type="tel"
						id="phone"
						{...register("phone")}
						className={`form-input ${
							errors.phone
								? "input-error"
								: touchedFields.phone
								? "input-valid"
								: ""
						}`}
						placeholder="(22) 98765-4321"
						disabled={isSubmitting}
					/>
					{errors.phone && (
						<p className="error-message">{errors.phone.message}</p>
					)}
				</div>

				<div className="form-field">
					<label htmlFor="message" className="form-label">
						Mensagem *
					</label>
					<textarea
						id="message"
						{...register("message")}
						className={`form-input form-textarea ${
							errors.message
								? "input-error"
								: touchedFields.message
								? "input-valid"
								: ""
						}`}
						rows="4"
						placeholder="Como podemos ajudar?"
						disabled={isSubmitting}
					></textarea>
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
					className="btn-send"
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
