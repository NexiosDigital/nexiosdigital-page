import emailjs from "emailjs-com";

// Configurações do EmailJS
const EMAILJS_SERVICE_ID = "service_5v2ae1p"; // Substitua pelo seu Service ID
const EMAILJS_TEMPLATE_ID = "template_x4pki8w"; // Substitua pelo seu Template ID
const EMAILJS_USER_ID = "tqP0kArVrpkX5ox-n"; // Substitua pelo seu User ID

/**
 * Envia email com os dados do formulário de contato
 * @param {Object} formData - Dados do formulário de contato
 * @returns {Promise} Promessa resolvida quando o email for enviado
 */
export const sendContactEmail = async (formData) => {
	try {
		// Preparar os dados para o template
		const templateParams = {
			from_name: formData.name,
			from_email: formData.email,
			from_phone: formData.phone || "Não informado",
			from_company: formData.company || "Não informado",
			message: formData.message,
			timestamp: new Date().toLocaleString("pt-BR", {
				timeZone: "America/Sao_Paulo",
			}),
			user_ip: await getUserIP(),
		};

		// Verificar se tem token de reCAPTCHA
		if (formData.recaptchaToken) {
			// Em uma implementação real, você validaria o token no backend
			console.log("reCAPTCHA token:", formData.recaptchaToken);
		}

		// Enviar o email usando EmailJS
		const response = await emailjs.send(
			EMAILJS_SERVICE_ID,
			EMAILJS_TEMPLATE_ID,
			templateParams,
			EMAILJS_USER_ID
		);

		console.log("Email enviado com sucesso:", response);
		return response;
	} catch (error) {
		console.error("Erro ao enviar o email:", error);
		throw error;
	}
};

/**
 * Obtém o endereço IP do usuário para fins de rastreamento
 * @returns {Promise<string>} Endereço IP do usuário
 */
const getUserIP = async () => {
	try {
		const response = await fetch("https://api.ipify.org?format=json");
		const data = await response.json();
		return data.ip;
	} catch (error) {
		console.error("Erro ao obter IP do usuário:", error);
		return "Não disponível";
	}
};

/**
 * Função opcional para armazenar contatos em banco de dados (Firebase)
 * Descomente e implemente esta função se desejar armazenar contatos
 */
/*
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const storeContactInDatabase = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, "contacts"), {
      ...formData,
      createdAt: new Date()
    });
    console.log("Contato armazenado com ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao armazenar contato:", error);
    throw error;
  }
};
*/
