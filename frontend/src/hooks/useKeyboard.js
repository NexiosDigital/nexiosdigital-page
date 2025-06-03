import { useEffect } from "react";

/**
 * Hook para atalhos de teclado
 */
export const useKeyboard = (keyMap, deps = []) => {
	useEffect(() => {
		const handleKeyDown = (event) => {
			// Ignorar se estiver em um input/textarea
			if (
				event.target.tagName === "INPUT" ||
				event.target.tagName === "TEXTAREA"
			) {
				return;
			}

			const key = event.key.toLowerCase();
			const isCtrl = event.ctrlKey || event.metaKey;
			const isShift = event.shiftKey;
			const isAlt = event.altKey;

			// Criar uma string da combinação de teclas
			let combination = "";
			if (isCtrl) combination += "ctrl+";
			if (isShift) combination += "shift+";
			if (isAlt) combination += "alt+";
			combination += key;

			// Executar callback se existir
			if (keyMap[combination]) {
				event.preventDefault();
				keyMap[combination](event);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, deps);
};

// Exemplo de uso dos atalhos:
/*
useKeyboard({
  'ctrl+b': () => toggleSidebarCollapse(),
  'escape': () => closeSidebarMobile(),
  'ctrl+shift+d': () => console.log('Debug mode'),
  '/': () => searchRef.current?.focus()
});
*/
