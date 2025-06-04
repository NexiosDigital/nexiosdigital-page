import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useMediaQuery } from "./useMediaQuery";

/**
 * Hook otimizado para gerenciar a sidebar com tooltips e animações
 * @param {string} storageKey - Chave para persistir no localStorage
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Objeto com estados e funções da sidebar
 */
export const useOptimizedSidebar = (
	storageKey = "sidebar_collapsed",
	options = {}
) => {
	const {
		defaultCollapsed = false,
		breakpoint = 1024,
		enableTooltips = true,
		animationDuration = 400,
		tooltipDelay = 500,
	} = options;

	// Estados da sidebar
	const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
		storageKey,
		defaultCollapsed
	);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [tooltipVisible, setTooltipVisible] = useState(null);
	const [isAnimating, setIsAnimating] = useState(false);

	// Detectar se é mobile
	const isMobile = useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
	const isDesktop = useMediaQuery(`(min-width: ${breakpoint}px)`);

	// Ref para timeout de tooltip
	const tooltipTimeoutRef = useMemo(() => ({ current: null }), []);

	// Toggle sidebar colapsada (apenas desktop)
	const toggleSidebarCollapse = useCallback(() => {
		if (!isMobile && !isAnimating) {
			setIsAnimating(true);
			setSidebarCollapsed((prev) => !prev);

			// Reset animating state after transition
			setTimeout(() => {
				setIsAnimating(false);
			}, animationDuration);
		}
	}, [isMobile, isAnimating, setSidebarCollapsed, animationDuration]);

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

	// Gerenciar tooltips otimizados
	const showTooltip = useCallback(
		(id) => {
			if (!enableTooltips || !sidebarCollapsed || isMobile) return;

			if (tooltipTimeoutRef.current) {
				clearTimeout(tooltipTimeoutRef.current);
			}

			tooltipTimeoutRef.current = setTimeout(() => {
				setTooltipVisible(id);
			}, tooltipDelay);
		},
		[enableTooltips, sidebarCollapsed, isMobile, tooltipDelay]
	);

	const hideTooltip = useCallback(() => {
		if (tooltipTimeoutRef.current) {
			clearTimeout(tooltipTimeoutRef.current);
		}
		setTooltipVisible(null);
	}, []);

	// Função para obter classes CSS da sidebar
	const getSidebarClasses = useCallback(
		(baseClass = "sidebar") => {
			const classes = [baseClass];

			if (isAnimating) {
				classes.push("animating");
			}

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
				} else {
					classes.push("expanded");
				}
			}

			return classes.filter(Boolean).join(" ");
		},
		[isMobile, sidebarOpen, sidebarCollapsed, isAnimating]
	);

	// Função para obter atributos de tooltip otimizados
	const getTooltipProps = useCallback(
		(id, label) => {
			if (!enableTooltips || !sidebarCollapsed || isMobile) {
				return {};
			}

			return {
				"data-tooltip": label,
				"data-tooltip-id": id,
				onMouseEnter: () => showTooltip(id),
				onMouseLeave: hideTooltip,
				onFocus: () => showTooltip(id),
				onBlur: hideTooltip,
			};
		},
		[enableTooltips, sidebarCollapsed, isMobile, showTooltip, hideTooltip]
	);

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

	// Função para obter largura da sidebar
	const getSidebarWidth = useCallback(() => {
		if (isMobile) {
			return sidebarOpen ? 280 : 0;
		}
		return sidebarCollapsed ? 80 : 280;
	}, [isMobile, sidebarOpen, sidebarCollapsed]);

	// Função para obter margin-left do conteúdo principal
	const getMainMarginLeft = useCallback(() => {
		if (isMobile) {
			return 0;
		}
		return sidebarCollapsed ? 80 : 280;
	}, [isMobile, sidebarCollapsed]);

	// Reset sidebar mobile quando mudar para desktop
	useEffect(() => {
		if (isDesktop) {
			setSidebarOpen(false);
			hideTooltip();
		}
	}, [isDesktop, hideTooltip]);

	// Gerenciar scroll do body quando sidebar mobile está aberta
	useEffect(() => {
		if (typeof document !== "undefined") {
			if (isMobile && sidebarOpen) {
				document.body.style.overflow = "hidden";
			} else {
				document.body.style.overflow = "auto";
			}

			// Cleanup
			return () => {
				document.body.style.overflow = "auto";
			};
		}
	}, [isMobile, sidebarOpen]);

	// Cleanup tooltips ao desmontar
	useEffect(() => {
		return () => {
			if (tooltipTimeoutRef.current) {
				clearTimeout(tooltipTimeoutRef.current);
			}
		};
	}, []);

	// Atalhos de teclado otimizados
	useEffect(() => {
		const handleKeyDown = (event) => {
			// Ignorar se estiver em um input/textarea
			if (
				event.target.tagName === "INPUT" ||
				event.target.tagName === "TEXTAREA" ||
				event.target.contentEditable === "true"
			) {
				return;
			}

			// Ctrl/Cmd + B para colapsar sidebar (apenas desktop)
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
				event.preventDefault();
				if (!isMobile) {
					toggleSidebarCollapse();
				}
			}

			// ESC para fechar sidebar mobile
			if (event.key === "Escape" && isMobile && sidebarOpen) {
				event.preventDefault();
				closeSidebarMobile();
			}

			// ESC para esconder tooltip
			if (event.key === "Escape" && tooltipVisible) {
				hideTooltip();
			}
		};

		if (typeof document !== "undefined") {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	}, [
		isMobile,
		sidebarOpen,
		tooltipVisible,
		toggleSidebarCollapse,
		closeSidebarMobile,
		hideTooltip,
	]);

	// Função para renderizar link com tooltip otimizado
	const renderNavLink = useCallback(
		(item, LinkComponent = "a") => {
			const isActive = item.isActive || false;
			const linkClass = `nav-link ${isActive ? "active" : ""}`;
			const tooltipProps = getTooltipProps(item.id || item.path, item.label);

			const linkProps = {
				className: linkClass,
				...tooltipProps,
				...(item.external ? {} : { to: item.path }),
				...(item.external ? { href: item.path } : {}),
				"aria-label": item.label,
			};

			return (
				<LinkComponent key={item.path} {...linkProps}>
					<i className={item.icon} aria-hidden="true"></i>
					<span>{item.label}</span>
				</LinkComponent>
			);
		},
		[getTooltipProps]
	);

	// Performance metrics
	const getPerformanceInfo = useCallback(() => {
		return {
			isAnimating,
			renderOptimized: sidebarCollapsed && !isMobile,
			tooltipsEnabled: enableTooltips && sidebarCollapsed && !isMobile,
			currentWidth: getSidebarWidth(),
			mainMargin: getMainMarginLeft(),
		};
	}, [
		isAnimating,
		sidebarCollapsed,
		isMobile,
		enableTooltips,
		getSidebarWidth,
		getMainMarginLeft,
	]);

	return {
		// Estados principais
		sidebarCollapsed,
		sidebarOpen,
		isMobile,
		isDesktop,
		isAnimating,
		tooltipVisible,

		// Ações principais
		toggleSidebarCollapse,
		toggleSidebarMobile,
		closeSidebarMobile,
		openSidebarMobile,
		setSidebarCollapsed,
		setSidebarOpen,

		// Tooltips
		showTooltip,
		hideTooltip,
		getTooltipProps,

		// Helpers otimizados
		getSidebarClasses,
		isSidebarVisible,
		isSidebarExpanded,
		getSidebarWidth,
		getMainMarginLeft,
		renderNavLink,

		// Performance
		getPerformanceInfo,

		// Configurações
		config: {
			breakpoint,
			enableTooltips,
			animationDuration,
			tooltipDelay,
		},
	};
};

/**
 * Hook simplificado para sidebar básica
 * @param {string} storageKey - Chave para localStorage
 * @param {boolean} defaultCollapsed - Estado inicial colapsado
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Estados e funções básicas
 */
export const useSidebar = (
	storageKey = "sidebar_collapsed",
	defaultCollapsed = false,
	options = {}
) => {
	const [collapsed, setCollapsed] = useLocalStorage(
		storageKey,
		defaultCollapsed
	);
	const [isOpen, setIsOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const isMobile = useMediaQuery("(max-width: 1023px)");

	const { animationDuration = 400 } = options;

	const toggle = useCallback(() => {
		if (!isMobile && !isAnimating) {
			setIsAnimating(true);
			setCollapsed((prev) => !prev);

			setTimeout(() => {
				setIsAnimating(false);
			}, animationDuration);
		}
	}, [isMobile, isAnimating, setCollapsed, animationDuration]);

	const toggleMobile = useCallback(() => {
		if (isMobile) {
			setIsOpen((prev) => !prev);
		}
	}, [isMobile]);

	const closeMobile = useCallback(() => {
		if (isMobile) {
			setIsOpen(false);
		}
	}, [isMobile]);

	const collapse = useCallback(() => {
		if (!collapsed && !isAnimating && !isMobile) {
			setIsAnimating(true);
			setCollapsed(true);

			setTimeout(() => {
				setIsAnimating(false);
			}, animationDuration);
		}
	}, [collapsed, isAnimating, isMobile, setCollapsed, animationDuration]);

	const expand = useCallback(() => {
		if (collapsed && !isAnimating && !isMobile) {
			setIsAnimating(true);
			setCollapsed(false);

			setTimeout(() => {
				setIsAnimating(false);
			}, animationDuration);
		}
	}, [collapsed, isAnimating, isMobile, setCollapsed, animationDuration]);

	// Auto-close mobile sidebar on desktop
	useEffect(() => {
		if (!isMobile && isOpen) {
			setIsOpen(false);
		}
	}, [isMobile, isOpen]);

	// Manage body scroll
	useEffect(() => {
		if (typeof document !== "undefined") {
			if (isMobile && isOpen) {
				document.body.style.overflow = "hidden";
			} else {
				document.body.style.overflow = "auto";
			}

			return () => {
				document.body.style.overflow = "auto";
			};
		}
	}, [isMobile, isOpen]);

	const getClasses = useCallback(
		(baseClass = "sidebar") => {
			const classes = [baseClass];

			if (isMobile) {
				classes.push("mobile");
				if (isOpen) classes.push("open");
			} else {
				classes.push("desktop");
				if (collapsed) classes.push("collapsed");
			}

			if (isAnimating) classes.push("animating");

			return classes.join(" ");
		},
		[isMobile, isOpen, collapsed, isAnimating]
	);

	return {
		// Estados
		collapsed,
		isOpen,
		isMobile,
		isAnimating,

		// Ações
		toggle,
		toggleMobile,
		closeMobile,
		collapse,
		expand,
		setCollapsed,
		setIsOpen,

		// Helpers
		getClasses,
		isExpanded: isMobile ? isOpen : !collapsed,
		width: isMobile ? (isOpen ? 280 : 0) : collapsed ? 80 : 280,
	};
};

/**
 * Hook simplificado para sidebar básica otimizada
 * @param {boolean} defaultCollapsed - Estado inicial colapsado
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Estados e funções básicas
 */
export const useSimpleSidebar = (defaultCollapsed = false, options = {}) => {
	const [collapsed, setCollapsed] = useState(defaultCollapsed);
	const [isAnimating, setIsAnimating] = useState(false);
	const isMobile = useMediaQuery("(max-width: 768px)");

	const { animationDuration = 400 } = options;

	const toggle = useCallback(() => {
		if (!isAnimating) {
			setIsAnimating(true);
			setCollapsed((prev) => !prev);

			setTimeout(() => {
				setIsAnimating(false);
			}, animationDuration);
		}
	}, [isAnimating, animationDuration]);

	const collapse = useCallback(() => {
		if (!collapsed && !isAnimating) {
			setIsAnimating(true);
			setCollapsed(true);

			setTimeout(() => {
				setIsAnimating(false);
			}, animationDuration);
		}
	}, [collapsed, isAnimating, animationDuration]);

	const expand = useCallback(() => {
		if (collapsed && !isAnimating) {
			setIsAnimating(true);
			setCollapsed(false);

			setTimeout(() => {
				setIsAnimating(false);
			}, animationDuration);
		}
	}, [collapsed, isAnimating, animationDuration]);

	return {
		collapsed,
		isMobile,
		isAnimating,
		toggle,
		collapse,
		expand,
		setCollapsed,
	};
};

export default useOptimizedSidebar;
