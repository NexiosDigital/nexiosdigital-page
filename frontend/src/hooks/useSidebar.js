import { useState, useEffect, useCallback } from "react";

/**
 * Hook customizado para gerenciar o estado da sidebar
 * Lida com responsividade, persistência e estados de abertura/colapso
 */
export const useSidebar = (storageKey = "sidebar_collapsed") => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Detectar se é mobile
	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 1024;
			setIsMobile(mobile);

			// Se mudou de mobile para desktop, resetar estados
			if (!mobile && sidebarOpen) {
				setSidebarOpen(false);
			}
		};

		checkMobile();
		const debouncedResize = debounce(checkMobile, 150);
		window.addEventListener("resize", debouncedResize);

		return () => window.removeEventListener("resize", debouncedResize);
	}, [sidebarOpen]);

	// Carregar preferência do localStorage
	useEffect(() => {
		const savedCollapse = localStorage.getItem(storageKey);
		if (savedCollapse === "true" && !isMobile) {
			setSidebarCollapsed(true);
		}
	}, [isMobile, storageKey]);

	// Função para alternar sidebar colapsada (apenas desktop)
	const toggleSidebarCollapse = useCallback(() => {
		if (isMobile) return;

		const newCollapsed = !sidebarCollapsed;
		setSidebarCollapsed(newCollapsed);
		localStorage.setItem(storageKey, newCollapsed.toString());
	}, [sidebarCollapsed, isMobile, storageKey]);

	// Função para alternar sidebar mobile
	const toggleSidebarMobile = useCallback(() => {
		if (!isMobile) return;
		setSidebarOpen(!sidebarOpen);
	}, [sidebarOpen, isMobile]);

	// Fechar sidebar mobile
	const closeSidebarMobile = useCallback(() => {
		if (isMobile) {
			setSidebarOpen(false);
		}
	}, [isMobile]);

	// Classes CSS para a sidebar
	const getSidebarClasses = useCallback(
		(baseClass = "sidebar") => {
			return [
				baseClass,
				sidebarCollapsed && !isMobile ? "collapsed" : "",
				isMobile && sidebarOpen ? "open" : "",
				isMobile && !sidebarOpen ? "mobile-hidden" : "",
			]
				.filter(Boolean)
				.join(" ");
		},
		[sidebarCollapsed, isMobile, sidebarOpen]
	);

	return {
		sidebarOpen,
		sidebarCollapsed,
		isMobile,
		toggleSidebarCollapse,
		toggleSidebarMobile,
		closeSidebarMobile,
		getSidebarClasses,
		setSidebarOpen,
		setSidebarCollapsed,
	};
};

// Utility function para debounce
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

// frontend/src/hooks/useActiveRoute.js
import { useLocation } from "react-router-dom";
import { useCallback, useMemo } from "react";

/**
 * Hook para gerenciar rotas ativas e navegação
 */
export const useActiveRoute = (menuItems = []) => {
	const location = useLocation();

	// Verificar se um path está ativo
	const isActivePath = useCallback(
		(path, exact = false) => {
			if (exact) {
				return location.pathname === path;
			}
			return location.pathname.startsWith(path);
		},
		[location.pathname]
	);

	// Obter item de menu atual
	const currentMenuItem = useMemo(() => {
		return menuItems.find((item) => isActivePath(item.path, item.exact));
	}, [menuItems, isActivePath]);

	// Obter título da página atual
	const getCurrentPageTitle = useCallback(() => {
		return currentMenuItem?.label || "Dashboard";
	}, [currentMenuItem]);

	// Obter breadcrumbs
	const getBreadcrumbs = useCallback(() => {
		const pathSegments = location.pathname.split("/").filter(Boolean);
		return pathSegments.map((segment, index) => {
			const path = "/" + pathSegments.slice(0, index + 1).join("/");
			const menuItem = menuItems.find((item) => item.path === path);
			return {
				path,
				label:
					menuItem?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
				isLast: index === pathSegments.length - 1,
			};
		});
	}, [location.pathname, menuItems]);

	return {
		isActivePath,
		currentMenuItem,
		getCurrentPageTitle,
		getBreadcrumbs,
		currentPath: location.pathname,
	};
};
