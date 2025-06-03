import { useState, useEffect } from "react";

/**
 * Hook para detectar media queries
 */
export const useMediaQuery = (query) => {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);

		// Set initial value
		setMatches(media.matches);

		// Listen for changes
		const listener = (event) => setMatches(event.matches);

		// Modern browsers
		if (media.addEventListener) {
			media.addEventListener("change", listener);
			return () => media.removeEventListener("change", listener);
		} else {
			// Legacy browsers
			media.addListener(listener);
			return () => media.removeListener(listener);
		}
	}, [query]);

	return matches;
};

// Breakpoints úteis
export const useBreakpoints = () => {
	const isMobile = useMediaQuery("(max-width: 767px)");
	const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isLarge = useMediaQuery("(min-width: 1440px)");

	return {
		isMobile,
		isTablet,
		isDesktop,
		isLarge,
		// Convenções úteis
		isTouch: isMobile || isTablet,
		showMobileMenu: !isDesktop,
	};
};
