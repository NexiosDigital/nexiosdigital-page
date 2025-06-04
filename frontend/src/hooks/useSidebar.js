import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useMediaQuery } from "./useMediaQuery";

/**
 * Hook customizado para gerenciar a sidebar
 * @param {string} storageKey - Chave para persistir no localStorage
 * @returns {Object} - Objeto com estados e funções da sidebar
 */
export const useSidebar = (storageKey = "sidebar_collapsed") => {
	// Estados da sidebar
	const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
		storageKey,
		false
	);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Detectar se é mobile
	const isMobile = useMediaQuery("(max-width: 1023px)");

	// Toggle sidebar colapsada (apenas desktop)
	const toggleSidebarCollapse = useCallback(() => {
		if (!isMobile) {
			setSidebarCollapsed((prev) => !prev);
		}
	}, [isMobile, setSidebarCollapsed]);

	// Toggle sidebar mobile (overlay)
	const toggleSidebarMobile = useCallback(() => {
		if (isMobile) {
			setSidebarOpen((prev) => !prev);
		}
	}, [isMobile]);

	// Fechar sidebar mobile
	const closeSidebarMobile = useCallback(() => {
		if (isMobile) {
			setSidebarOpen(false);
		}
	}, [isMobile]);

	// Abrir sidebar mobile
	const openSidebarMobile = useCallback(() => {
		if (isMobile) {
			setSidebarOpen(true);
		}
	}, [isMobile]);

	// Função para obter classes CSS da sidebar
	const getSidebarClasses = useCallback(
		(baseClass = "sidebar") => {
			const classes = [baseClass];

			if (isMobile) {
				classes.push("mobile");
				if (sidebarOpen) {
					classes.push("open");
				} else {
					classes.push("mobile-hidden");
				}
			} else {
				classes.push("desktop");
				if (sidebarCollapsed) {
					classes.push("collapsed");
				}
			}

			return classes.filter(Boolean).join(" ");
		},
		[isMobile, sidebarOpen, sidebarCollapsed]
	);

	// Reset sidebar mobile quando mudar para desktop
	useEffect(() => {
		if (!isMobile) {
			setSidebarOpen(false);
		}
	}, [isMobile]);

	// Função para verificar se sidebar está visível
	const isSidebarVisible = useCallback(() => {
		if (isMobile) {
			return sidebarOpen;
		}
		return true; // Sempre visível no desktop
	}, [isMobile, sidebarOpen]);

	// Função para verificar se sidebar está expandida
	const isSidebarExpanded = useCallback(() => {
		if (isMobile) {
			return sidebarOpen;
		}
		return !sidebarCollapsed;
	}, [isMobile, sidebarOpen, sidebarCollapsed]);

	return {
		// Estados
		sidebarCollapsed,
		sidebarOpen,
		isMobile,

		// Ações
		toggleSidebarCollapse,
		toggleSidebarMobile,
		closeSidebarMobile,
		openSidebarMobile,
		setSidebarCollapsed,
		setSidebarOpen,

		// Helpers
		getSidebarClasses,
		isSidebarVisible,
		isSidebarExpanded,
	};
};

/**
 * Hook simplificado para sidebar básica
 * @param {boolean} defaultCollapsed - Estado inicial colapsado
 * @returns {Object} - Estados e funções básicas
 */
export const useSimpleSidebar = (defaultCollapsed = false) => {
	const [collapsed, setCollapsed] = useState(defaultCollapsed);
	const isMobile = useMediaQuery("(max-width: 768px)");

	const toggle = useCallback(() => {
		setCollapsed((prev) => !prev);
	}, []);

	const collapse = useCallback(() => {
		setCollapsed(true);
	}, []);

	const expand = useCallback(() => {
		setCollapsed(false);
	}, []);

	return {
		collapsed,
		isMobile,
		toggle,
		collapse,
		expand,
		setCollapsed,
	};
};

// Exemplo de uso:
/*
const MyComponent = () => {
  const {
    sidebarCollapsed,
    sidebarOpen,
    isMobile,
    toggleSidebarCollapse,
    toggleSidebarMobile,
    closeSidebarMobile,
    getSidebarClasses
  } = useSidebar('my_sidebar_key');

  return (
    <div className="layout">
      <aside className={getSidebarClasses('my-sidebar')}>
        <button onClick={toggleSidebarCollapse}>
          {sidebarCollapsed ? 'Expand' : 'Collapse'}
        </button>
        {isMobile && (
          <button onClick={toggleSidebarMobile}>
            Toggle Mobile
          </button>
        )}
      </aside>
      
      {isMobile && sidebarOpen && (
        <div 
          className="overlay" 
          onClick={closeSidebarMobile}
        />
      )}
    </div>
  );
};
*/
