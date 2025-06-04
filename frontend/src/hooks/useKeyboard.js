import { useEffect, useCallback, useRef } from "react";

/**
 * Hook para gerenciar atalhos de teclado
 * @param {Object} shortcuts - Objeto com atalhos e suas funções
 * @param {Array} deps - Dependências do useEffect
 * @param {Object} options - Opções do hook
 * @returns {Object} - Funções para controlar os atalhos
 */
export const useKeyboard = (shortcuts = {}, deps = [], options = {}) => {
	const {
		preventDefault = true,
		stopPropagation = true,
		enableOnInputs = false,
		target = document,
	} = options;

	const shortcutsRef = useRef(shortcuts);

	// Atualizar ref quando shortcuts mudar
	useEffect(() => {
		shortcutsRef.current = shortcuts;
	}, [shortcuts]);

	// Função para verificar se o elemento é um input
	const isInputElement = useCallback((element) => {
		const tagName = element.tagName.toLowerCase();
		const inputTypes = ["input", "textarea", "select"];
		const isContentEditable = element.contentEditable === "true";

		return inputTypes.includes(tagName) || isContentEditable;
	}, []);

	// Função para normalizar as teclas
	const normalizeKey = useCallback((key) => {
		const keyMap = {
			" ": "space",
			ArrowUp: "up",
			ArrowDown: "down",
			ArrowLeft: "left",
			ArrowRight: "right",
			Delete: "del",
		};

		return keyMap[key] || key.toLowerCase();
	}, []);

	// Função para criar a string do atalho
	const createShortcutString = useCallback(
		(event) => {
			const parts = [];

			if (event.ctrlKey || event.metaKey) parts.push("ctrl");
			if (event.altKey) parts.push("alt");
			if (event.shiftKey) parts.push("shift");

			const key = normalizeKey(event.key);
			parts.push(key);

			return parts.join("+");
		},
		[normalizeKey]
	);

	// Handler principal do teclado
	const handleKeyDown = useCallback(
		(event) => {
			// Verificar se deve ignorar inputs
			if (!enableOnInputs && isInputElement(event.target)) {
				return;
			}

			const shortcutString = createShortcutString(event);
			const handler = shortcutsRef.current[shortcutString];

			if (handler && typeof handler === "function") {
				if (preventDefault) {
					event.preventDefault();
				}

				if (stopPropagation) {
					event.stopPropagation();
				}

				handler(event);
			}
		},
		[
			enableOnInputs,
			isInputElement,
			createShortcutString,
			preventDefault,
			stopPropagation,
		]
	);

	// Configurar event listeners
	useEffect(() => {
		const targetElement =
			target === document ? document : target.current || target;

		if (targetElement && targetElement.addEventListener) {
			targetElement.addEventListener("keydown", handleKeyDown);

			return () => {
				targetElement.removeEventListener("keydown", handleKeyDown);
			};
		}
	}, [handleKeyDown, target, ...deps]);

	// Função para adicionar atalho dinamicamente
	const addShortcut = useCallback((shortcut, handler) => {
		shortcutsRef.current = {
			...shortcutsRef.current,
			[shortcut]: handler,
		};
	}, []);

	// Função para remover atalho
	const removeShortcut = useCallback((shortcut) => {
		const newShortcuts = { ...shortcutsRef.current };
		delete newShortcuts[shortcut];
		shortcutsRef.current = newShortcuts;
	}, []);

	// Função para limpar todos os atalhos
	const clearShortcuts = useCallback(() => {
		shortcutsRef.current = {};
	}, []);

	return {
		addShortcut,
		removeShortcut,
		clearShortcuts,
		shortcuts: shortcutsRef.current,
	};
};

/**
 * Hook para atalhos de sequência (como vim)
 * @param {Object} sequences - Sequências de teclas
 * @param {Object} options - Opções do hook
 */
export const useKeySequence = (sequences = {}, options = {}) => {
	const { timeout = 1000 } = options;
	const sequenceRef = useRef("");
	const timeoutRef = useRef(null);

	const resetSequence = useCallback(() => {
		sequenceRef.current = "";
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	const handleKeyDown = useCallback(
		(event) => {
			const key = event.key.toLowerCase();
			sequenceRef.current += key;

			// Verificar se alguma sequência corresponde
			const matchedSequence = Object.keys(sequences).find((seq) =>
				seq.startsWith(sequenceRef.current)
			);

			if (!matchedSequence) {
				resetSequence();
				return;
			}

			// Se é uma correspondência exata, executar
			if (sequences[sequenceRef.current]) {
				sequences[sequenceRef.current](event);
				resetSequence();
				return;
			}

			// Configurar timeout para reset
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(resetSequence, timeout);
		},
		[sequences, timeout, resetSequence]
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [handleKeyDown]);

	return {
		resetSequence,
		currentSequence: sequenceRef.current,
	};
};

/**
 * Hook para detectar combinações específicas
 * @param {string} combination - Combinação de teclas (ex: 'ctrl+shift+s')
 * @param {Function} callback - Função a ser executada
 * @param {Object} options - Opções do hook
 */
export const useKeyCombination = (combination, callback, options = {}) => {
	const shortcuts = { [combination]: callback };
	return useKeyboard(shortcuts, [callback], options);
};

/**
 * Hook para navegação por teclas direcionais
 * @param {Object} handlers - Handlers para cada direção
 * @param {Object} options - Opções do hook
 */
export const useArrowNavigation = (handlers = {}, options = {}) => {
	const {
		up = () => {},
		down = () => {},
		left = () => {},
		right = () => {},
		enter = () => {},
		escape = () => {},
	} = handlers;

	const shortcuts = {
		up: up,
		arrowup: up,
		down: down,
		arrowdown: down,
		left: left,
		arrowleft: left,
		right: right,
		arrowright: right,
		enter: enter,
		escape: escape,
	};

	return useKeyboard(
		shortcuts,
		[up, down, left, right, enter, escape],
		options
	);
};

// Exemplo de uso:
/*
const MyComponent = () => {
  // Uso básico
  useKeyboard({
    'ctrl+s': (e) => console.log('Salvando...'),
    'ctrl+z': (e) => console.log('Desfazendo...'),
    'escape': (e) => console.log('Fechando modal...'),
    'ctrl+shift+d': (e) => console.log('Debug mode'),
  });

  // Navegação por setas
  useArrowNavigation({
    up: () => console.log('Para cima'),
    down: () => console.log('Para baixo'),
    left: () => console.log('Esquerda'),
    right: () => console.log('Direita'),
    enter: () => console.log('Selecionado'),
    escape: () => console.log('Cancelado')
  });

  // Sequências como vim
  useKeySequence({
    'gg': () => console.log('Ir para o topo'),
    'dd': () => console.log('Deletar linha'),
    'yy': () => console.log('Copiar linha')
  });

  // Combinação específica
  useKeyCombination('ctrl+k', () => {
    console.log('Comando rápido');
  }, { 
    enableOnInputs: true 
  });

  return <div>Pressione Ctrl+S para salvar</div>;
};

// Hook com controle dinâmico
const DynamicShortcuts = () => {
  const { addShortcut, removeShortcut, clearShortcuts } = useKeyboard({
    'ctrl+1': () => console.log('Atalho 1')
  });

  useEffect(() => {
    // Adicionar atalho dinamicamente
    addShortcut('ctrl+2', () => console.log('Atalho 2'));
    
    return () => {
      // Limpar ao desmontar
      clearShortcuts();
    };
  }, [addShortcut, clearShortcuts]);

  return <div>Atalhos dinâmicos</div>;
};
*/
