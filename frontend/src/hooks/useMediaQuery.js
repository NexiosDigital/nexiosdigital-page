import { useState, useEffect } from "react";

/**
 * Hook para detectar media queries
 * @param {string} query - Media query CSS
 * @returns {boolean} - Se a media query corresponde
 */
export const useMediaQuery = (query) => {
	// Verificar se window está disponível (SSR)
	const [matches, setMatches] = useState(() => {
		if (typeof window !== "undefined") {
			return window.matchMedia(query).matches;
		}
		return false;
	});

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia(query);

		// Handler para mudanças
		const handleChange = (event) => {
			setMatches(event.matches);
		};

		// Definir estado inicial
		setMatches(mediaQuery.matches);

		// Adicionar listener
		mediaQuery.addEventListener("change", handleChange);

		// Cleanup
		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, [query]);

	return matches;
};

/**
 * Hook para múltiplas media queries
 * @param {Object} queries - Objeto com queries nomeadas
 * @returns {Object} - Objeto com resultados das queries
 */
export const useMultipleMediaQueries = (queries) => {
	const [matches, setMatches] = useState(() => {
		if (typeof window === "undefined") {
			return Object.keys(queries).reduce((acc, key) => {
				acc[key] = false;
				return acc;
			}, {});
		}

		return Object.keys(queries).reduce((acc, key) => {
			acc[key] = window.matchMedia(queries[key]).matches;
			return acc;
		}, {});
	});

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQueries = {};
		const handlers = {};

		// Criar media queries e handlers
		Object.keys(queries).forEach((key) => {
			mediaQueries[key] = window.matchMedia(queries[key]);

			handlers[key] = (event) => {
				setMatches((prev) => ({
					...prev,
					[key]: event.matches,
				}));
			};

			// Definir estado inicial
			setMatches((prev) => ({
				...prev,
				[key]: mediaQueries[key].matches,
			}));

			// Adicionar listener
			mediaQueries[key].addEventListener("change", handlers[key]);
		});

		// Cleanup
		return () => {
			Object.keys(queries).forEach((key) => {
				if (mediaQueries[key]) {
					mediaQueries[key].removeEventListener("change", handlers[key]);
				}
			});
		};
	}, [queries]);

	return matches;
};

/**
 * Hook para breakpoints comuns
 * @returns {Object} - Objeto com breakpoints padrão
 */
export const useBreakpoints = () => {
	const breakpoints = {
		xs: "(max-width: 575px)",
		sm: "(min-width: 576px) and (max-width: 767px)",
		md: "(min-width: 768px) and (max-width: 991px)",
		lg: "(min-width: 992px) and (max-width: 1199px)",
		xl: "(min-width: 1200px)",
		mobile: "(max-width: 767px)",
		tablet: "(min-width: 768px) and (max-width: 1023px)",
		desktop: "(min-width: 1024px)",
		isMobile: "(max-width: 1023px)",
		isDesktop: "(min-width: 1024px)",
	};

	return useMultipleMediaQueries(breakpoints);
};

/**
 * Hook para orientação da tela
 * @returns {Object} - Informações sobre orientação
 */
export const useOrientation = () => {
	const isPortrait = useMediaQuery("(orientation: portrait)");
	const isLandscape = useMediaQuery("(orientation: landscape)");

	return {
		isPortrait,
		isLandscape,
		orientation: isPortrait ? "portrait" : "landscape",
	};
};

/**
 * Hook para detectar dispositivos específicos
 * @returns {Object} - Informações sobre o dispositivo
 */
export const useDeviceDetection = () => {
	const isMobile = useMediaQuery("(max-width: 767px)");
	const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isRetina = useMediaQuery(
		"(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)"
	);
	const isTouch = useMediaQuery("(hover: none) and (pointer: coarse)");
	const canHover = useMediaQuery("(hover: hover)");
	const prefersReducedMotion = useMediaQuery(
		"(prefers-reduced-motion: reduce)"
	);
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

	return {
		isMobile,
		isTablet,
		isDesktop,
		isRetina,
		isTouch,
		canHover,
		prefersReducedMotion,
		prefersDarkMode,
		deviceType: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
	};
};

/**
 * Hook para dimensões da viewport
 * @returns {Object} - Largura e altura da viewport
 */
export const useViewport = () => {
	const [viewport, setViewport] = useState(() => {
		if (typeof window !== "undefined") {
			return {
				width: window.innerWidth,
				height: window.innerHeight,
			};
		}
		return { width: 0, height: 0 };
	});

	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleResize = () => {
			setViewport({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", handleResize);

		// Definir valores iniciais
		handleResize();

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return viewport;
};

/**
 * Hook para detectar mudanças de breakpoint
 * @param {string} breakpoint - Breakpoint para monitorar
 * @param {Function} callback - Função chamada na mudança
 */
export const useBreakpointChange = (breakpoint, callback) => {
	const matches = useMediaQuery(breakpoint);

	useEffect(() => {
		if (callback && typeof callback === "function") {
			callback(matches);
		}
	}, [matches, callback]);

	return matches;
};

// Exemplo de uso:
/*
const MyComponent = () => {
  // Uso básico
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isLarge = useMediaQuery('(min-width: 1200px)');

  // Múltiplas queries
  const { mobile, tablet, desktop } = useMultipleMediaQueries({
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)'
  });

  // Breakpoints padrão
  const { isMobile: isMobileBreakpoint, isDesktop } = useBreakpoints();

  // Orientação
  const { isPortrait, isLandscape, orientation } = useOrientation();

  // Detecção de dispositivo
  const {
    deviceType,
    isTouch,
    canHover,
    prefersReducedMotion,
    prefersDarkMode
  } = useDeviceDetection();

  // Viewport
  const { width, height } = useViewport();

  // Monitorar mudanças
  useBreakpointChange('(max-width: 768px)', (matches) => {
    console.log('Mobile breakpoint changed:', matches);
  });

  return (
    <div>
      <p>É mobile: {isMobile ? 'Sim' : 'Não'}</p>
      <p>Dispositivo: {deviceType}</p>
      <p>Orientação: {orientation}</p>
      <p>Viewport: {width}x{height}</p>
      <p>Tema preferido: {prefersDarkMode ? 'Escuro' : 'Claro'}</p>
      
      {isMobile && <div>Layout mobile</div>}
      {tablet && <div>Layout tablet</div>}
      {desktop && <div>Layout desktop</div>}
    </div>
  );
};

// Componente responsivo avançado
const ResponsiveComponent = () => {
  const breakpoints = useBreakpoints();
  const device = useDeviceDetection();
  
  const getLayoutClass = () => {
    if (breakpoints.xs) return 'layout-xs';
    if (breakpoints.sm) return 'layout-sm';
    if (breakpoints.md) return 'layout-md';
    if (breakpoints.lg) return 'layout-lg';
    if (breakpoints.xl) return 'layout-xl';
    return 'layout-default';
  };

  return (
    <div className={`responsive-component ${getLayoutClass()}`}>
      <h1>Layout Responsivo</h1>
      
      {device.isMobile && <MobileMenu />}
      {device.isDesktop && <DesktopMenu />}
      
      {device.isTouch ? (
        <TouchInterface />
      ) : (
        <MouseInterface />
      )}
    </div>
  );
};
*/
