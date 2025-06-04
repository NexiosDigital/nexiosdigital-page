import { useLocation } from "react-router-dom";
import { useMemo } from "react";

/**
 * Hook para gerenciar rotas ativas e navegação
 * @param {Array} menuItems - Array de itens do menu com path, label, etc.
 * @returns {Object} - Funções para verificar rotas ativas e obter títulos
 */
export const useActiveRoute = (menuItems = []) => {
	const location = useLocation();

	// Função para verificar se um path está ativo
	const isActivePath = useMemo(() => {
		return (path, exact = false) => {
			if (!path) return false;

			if (exact) {
				return location.pathname === path;
			}

			// Para rotas não exatas, verifica se o pathname começa com o path
			return location.pathname.startsWith(path);
		};
	}, [location.pathname]);

	// Obter o item do menu ativo atual
	const getCurrentMenuItem = useMemo(() => {
		return menuItems.find((item) => {
			if (item.exact) {
				return location.pathname === item.path;
			}
			return location.pathname.startsWith(item.path);
		});
	}, [menuItems, location.pathname]);

	// Obter o título da página atual
	const getCurrentPageTitle = useMemo(() => {
		return () => {
			const currentItem = getCurrentMenuItem;
			if (currentItem) {
				return currentItem.label;
			}

			// Fallback baseado no pathname
			const pathSegments = location.pathname.split("/").filter(Boolean);
			if (pathSegments.length === 0) return "Home";

			// Capitalizar e formatar o último segmento
			const lastSegment = pathSegments[pathSegments.length - 1];
			return lastSegment
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		};
	}, [getCurrentMenuItem, location.pathname]);

	// Obter breadcrumbs da rota atual
	const getBreadcrumbs = useMemo(() => {
		return () => {
			const pathSegments = location.pathname.split("/").filter(Boolean);
			const breadcrumbs = [];

			let currentPath = "";

			pathSegments.forEach((segment) => {
				currentPath += `/${segment}`;

				// Procurar item do menu correspondente
				const menuItem = menuItems.find((item) => item.path === currentPath);

				if (menuItem) {
					breadcrumbs.push({
						path: currentPath,
						label: menuItem.label,
						icon: menuItem.icon,
					});
				} else {
					// Fallback para segmentos sem item de menu
					breadcrumbs.push({
						path: currentPath,
						label: segment
							.split("-")
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(" "),
					});
				}
			});

			return breadcrumbs;
		};
	}, [location.pathname, menuItems]);

	// Obter rota anterior
	const getPreviousRoute = useMemo(() => {
		return () => {
			const currentIndex = menuItems.findIndex((item) =>
				item.exact
					? location.pathname === item.path
					: location.pathname.startsWith(item.path)
			);

			if (currentIndex > 0) {
				return menuItems[currentIndex - 1];
			}

			return null;
		};
	}, [menuItems, location.pathname]);

	// Obter próxima rota
	const getNextRoute = useMemo(() => {
		return () => {
			const currentIndex = menuItems.findIndex((item) =>
				item.exact
					? location.pathname === item.path
					: location.pathname.startsWith(item.path)
			);

			if (currentIndex >= 0 && currentIndex < menuItems.length - 1) {
				return menuItems[currentIndex + 1];
			}

			return null;
		};
	}, [menuItems, location.pathname]);

	// Verificar se é a primeira rota
	const isFirstRoute = useMemo(() => {
		const currentIndex = menuItems.findIndex((item) =>
			item.exact
				? location.pathname === item.path
				: location.pathname.startsWith(item.path)
		);
		return currentIndex === 0;
	}, [menuItems, location.pathname]);

	// Verificar se é a última rota
	const isLastRoute = useMemo(() => {
		const currentIndex = menuItems.findIndex((item) =>
			item.exact
				? location.pathname === item.path
				: location.pathname.startsWith(item.path)
		);
		return currentIndex === menuItems.length - 1;
	}, [menuItems, location.pathname]);

	// Obter nível de profundidade da rota
	const getRouteDepth = useMemo(() => {
		return location.pathname.split("/").filter(Boolean).length;
	}, [location.pathname]);

	// Verificar se é uma sub-rota
	const isSubRoute = useMemo(() => {
		return getRouteDepth > 1;
	}, [getRouteDepth]);

	return {
		// Estados
		currentPath: location.pathname,
		currentMenuItem: getCurrentMenuItem,
		routeDepth: getRouteDepth,
		isSubRoute,
		isFirstRoute,
		isLastRoute,

		// Funções principais
		isActivePath,
		getCurrentPageTitle,

		// Funções avançadas
		getBreadcrumbs,
		getPreviousRoute,
		getNextRoute,

		// Dados da localização
		location,
	};
};

/**
 * Hook simplificado para verificação de rota ativa
 * @param {string} path - Caminho para verificar
 * @param {boolean} exact - Se deve ser uma correspondência exata
 * @returns {boolean} - Se a rota está ativa
 */
export const useIsActiveRoute = (path, exact = false) => {
	const location = useLocation();

	return useMemo(() => {
		if (!path) return false;

		if (exact) {
			return location.pathname === path;
		}

		return location.pathname.startsWith(path);
	}, [location.pathname, path, exact]);
};

/**
 * Hook para obter informações da rota atual
 * @returns {Object} - Informações da rota atual
 */
export const useCurrentRoute = () => {
	const location = useLocation();

	return useMemo(() => {
		const pathSegments = location.pathname.split("/").filter(Boolean);

		return {
			pathname: location.pathname,
			segments: pathSegments,
			lastSegment: pathSegments[pathSegments.length - 1] || "",
			depth: pathSegments.length,
			isRoot: pathSegments.length === 0,
			search: location.search,
			hash: location.hash,
			state: location.state,
		};
	}, [location]);
};

// Exemplo de uso:
/*
const MyComponent = () => {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', exact: true },
    { path: '/dashboard/users', label: 'Usuários' },
    { path: '/dashboard/settings', label: 'Configurações' }
  ];

  const {
    isActivePath,
    getCurrentPageTitle,
    getBreadcrumbs,
    currentMenuItem,
    isSubRoute
  } = useActiveRoute(menuItems);

  // Verificar se uma rota específica está ativa
  const isDashboardActive = isActivePath('/dashboard', true);
  const isUsersActive = isActivePath('/dashboard/users');

  // Obter título da página atual
  const pageTitle = getCurrentPageTitle();

  // Obter breadcrumbs
  const breadcrumbs = getBreadcrumbs();

  return (
    <div>
      <h1>{pageTitle}</h1>
      
      <nav>
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.path}>
            {index > 0 && ' / '}
            {crumb.label}
          </span>
        ))}
      </nav>
      
      <ul>
        {menuItems.map(item => (
          <li key={item.path}>
            <a 
              href={item.path}
              className={isActivePath(item.path, item.exact) ? 'active' : ''}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Uso simplificado
const SimpleComponent = () => {
  const isActive = useIsActiveRoute('/dashboard/users');
  const route = useCurrentRoute();
  
  return (
    <div>
      <p>Rota ativa: {isActive ? 'Sim' : 'Não'}</p>
      <p>Caminho atual: {route.pathname}</p>
      <p>Profundidade: {route.depth}</p>
    </div>
  );
};
*/
