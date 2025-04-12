import React, { useEffect } from "react";
import "../styles/CustomCursor.css";

const CustomCursor = () => {
	useEffect(() => {
		// Verificar se é dispositivo móvel
		const isMobile =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
				navigator.userAgent
			);

		// Só aplicar o cursor personalizado em dispositivos não móveis
		if (!isMobile) {
			document.body.classList.add("custom-cursor-active");

			const handleMouseMove = (e) => {
				const cursor = document.querySelector(".custom-cursor");
				if (cursor) {
					cursor.style.left = `${e.clientX}px`;
					cursor.style.top = `${e.clientY}px`;
				}
			};

			window.addEventListener("mousemove", handleMouseMove);

			return () => {
				window.removeEventListener("mousemove", handleMouseMove);
				document.body.classList.remove("custom-cursor-active");
			};
		}
	}, []);

	return <div className="custom-cursor"></div>;
};

export default CustomCursor;
