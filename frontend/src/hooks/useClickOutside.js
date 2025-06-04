import { useRef, useEffect } from "react";

/**
 * Hook para detectar cliques fora de um elemento
 * @param {Function} callback - Função a ser executada quando clicar fora
 * @param {boolean} enabled - Se o hook está habilitado (padrão: true)
 * @returns {Object} - Ref para ser anexada ao elemento
 */
export const useClickOutside = (callback, enabled = true) => {
	const ref = useRef(null);

	useEffect(() => {
		if (!enabled) return;

		const handleClickOutside = (event) => {
			// Se o ref existe e o clique foi fora do elemento
			if (ref.current && !ref.current.contains(event.target)) {
				callback(event);
			}
		};

		// Adicionar event listeners
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);

		// Cleanup
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [callback, enabled]);

	return ref;
};

/**
 * Hook para detectar cliques fora de múltiplos elementos
 * @param {Function} callback - Função a ser executada quando clicar fora
 * @param {Array} refs - Array de refs para verificar
 * @param {boolean} enabled - Se o hook está habilitado
 */
export const useMultipleClickOutside = (callback, refs, enabled = true) => {
	useEffect(() => {
		if (!enabled) return;

		const handleClickOutside = (event) => {
			// Verificar se o clique foi fora de todos os elementos
			const isClickOutside = refs.every(
				(ref) => ref.current && !ref.current.contains(event.target)
			);

			if (isClickOutside) {
				callback(event);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [callback, refs, enabled]);
};

/**
 * Hook para detectar cliques fora com escape key
 * @param {Function} callback - Função a ser executada
 * @param {boolean} enabled - Se o hook está habilitado
 * @param {boolean} enableEscape - Se deve detectar a tecla Escape
 * @returns {Object} - Ref para ser anexada ao elemento
 */
export const useClickOutsideWithEscape = (
	callback,
	enabled = true,
	enableEscape = true
) => {
	const ref = useRef(null);

	useEffect(() => {
		if (!enabled) return;

		const handleClickOutside = (event) => {
			if (ref.current && !ref.current.contains(event.target)) {
				callback(event);
			}
		};

		const handleEscape = (event) => {
			if (enableEscape && event.key === "Escape") {
				callback(event);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);

		if (enableEscape) {
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
			if (enableEscape) {
				document.removeEventListener("keydown", handleEscape);
			}
		};
	}, [callback, enabled, enableEscape]);

	return ref;
};

// Exemplo de uso:
/*
// Uso básico
const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => setIsOpen(false));
  
  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>
        Toggle Menu
      </button>
      {isOpen && (
        <div className="menu">
          Menu content
        </div>
      )}
    </div>
  );
};

// Uso com escape
const ModalComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutsideWithEscape(() => setIsOpen(false), isOpen, true);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      {isOpen && (
        <div className="modal-overlay">
          <div ref={ref} className="modal">
            Modal content
          </div>
        </div>
      )}
    </>
  );
};

// Uso com múltiplos elementos
const ComplexComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  useMultipleClickOutside(
    () => setIsOpen(false),
    [menuRef, buttonRef],
    isOpen
  );
  
  return (
    <>
      <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
        Toggle Menu
      </button>
      {isOpen && (
        <div ref={menuRef} className="menu">
          Menu content
        </div>
      )}
    </>
  );
};
*/
