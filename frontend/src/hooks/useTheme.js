import { useLocalStorage } from "./useLocalStorage";
import { useMediaQuery } from "./useMediaQuery";
import { useEffect, useCallback } from "react";

/**
 * Hook para gerenciamento de tema
 * @param {string} defaultTheme - Tema padrão ('light', 'dark', 'auto')
 * @returns {Object} - Objeto com tema atual e funções
 */
export const useTheme = (defaultTheme = "auto") => {
	// Detectar preferência do sistema
	const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

	// Persistir tema escolhido pelo usuário
	const [userTheme, setUserTheme] = useLocalStorage("user-theme", defaultTheme);

	// Calcular tema efetivo
	const getEffectiveTheme = useCallback(() => {
		if (userTheme === "auto") {
			return prefersDark ? "dark" : "light";
		}
		return userTheme;
	}, [userTheme, prefersDark]);

	const effectiveTheme = getEffectiveTheme();

	// Aplicar tema ao documento
	useEffect(() => {
		if (typeof document !== "undefined") {
			const root = document.documentElement;
			const body = document.body;

			// Remover classes de tema existentes
			root.classList.remove("theme-light", "theme-dark");
			body.classList.remove("light-theme", "dark-theme");

			// Adicionar nova classe de tema
			root.classList.add(`theme-${effectiveTheme}`);
			body.classList.add(`${effectiveTheme}-theme`);

			// Definir atributo data-theme
			root.setAttribute("data-theme", effectiveTheme);

			// Definir variável CSS customizada
			root.style.setProperty("--current-theme", effectiveTheme);
		}
	}, [effectiveTheme]);

	// Função para alternar entre light e dark
	const toggleTheme = useCallback(() => {
		if (userTheme === "auto") {
			setUserTheme("light");
		} else if (userTheme === "light") {
			setUserTheme("dark");
		} else {
			setUserTheme("light");
		}
	}, [userTheme, setUserTheme]);

	// Função para definir tema específico
	const setTheme = useCallback(
		(theme) => {
			if (["light", "dark", "auto"].includes(theme)) {
				setUserTheme(theme);
			}
		},
		[setUserTheme]
	);

	// Função para resetar para auto
	const resetTheme = useCallback(() => {
		setUserTheme("auto");
	}, [setUserTheme]);

	// Verificar se é tema escuro
	const isDark = effectiveTheme === "dark";
	const isLight = effectiveTheme === "light";
	const isAuto = userTheme === "auto";

	return {
		// Estados
		theme: effectiveTheme,
		userTheme,
		isDark,
		isLight,
		isAuto,
		systemPrefersDark: prefersDark,

		// Ações
		setTheme,
		toggleTheme,
		resetTheme,
	};
};

/**
 * Hook para temas customizados
 * @param {Object} themes - Objeto com definições de temas
 * @param {string} defaultTheme - Tema padrão
 * @returns {Object} - Tema atual e funções
 */
export const useCustomTheme = (themes, defaultTheme) => {
	const [currentTheme, setCurrentTheme] = useLocalStorage(
		"custom-theme",
		defaultTheme
	);

	// Verificar se o tema atual existe
	const theme = themes[currentTheme] || themes[defaultTheme] || {};

	// Aplicar variáveis CSS do tema
	useEffect(() => {
		if (typeof document !== "undefined" && theme) {
			const root = document.documentElement;

			Object.entries(theme).forEach(([property, value]) => {
				root.style.setProperty(`--${property}`, value);
			});

			root.setAttribute("data-custom-theme", currentTheme);
		}
	}, [theme, currentTheme]);

	const switchTheme = useCallback(
		(themeName) => {
			if (themes[themeName]) {
				setCurrentTheme(themeName);
			}
		},
		[themes, setCurrentTheme]
	);

	return {
		currentTheme,
		theme,
		availableThemes: Object.keys(themes),
		switchTheme,
		setTheme: setCurrentTheme,
	};
};

/**
 * Hook para tema com classes CSS
 * @param {Object} themeClasses - Mapeamento de temas para classes CSS
 * @param {string} defaultTheme - Tema padrão
 * @returns {Object} - Tema atual e funções
 */
export const useThemeClasses = (themeClasses, defaultTheme = "light") => {
	const [theme, setTheme] = useLocalStorage("theme-classes", defaultTheme);

	// Aplicar classes CSS
	useEffect(() => {
		if (typeof document !== "undefined") {
			const body = document.body;

			// Remover todas as classes de tema
			Object.values(themeClasses).forEach((className) => {
				body.classList.remove(className);
			});

			// Adicionar classe do tema atual
			if (themeClasses[theme]) {
				body.classList.add(themeClasses[theme]);
			}
		}
	}, [theme, themeClasses]);

	const switchTheme = useCallback(
		(newTheme) => {
			if (themeClasses[newTheme]) {
				setTheme(newTheme);
			}
		},
		[themeClasses, setTheme]
	);

	return {
		theme,
		themeClass: themeClasses[theme],
		availableThemes: Object.keys(themeClasses),
		switchTheme,
		setTheme,
	};
};

// Exemplo de uso:
/*
const App = () => {
  // Uso básico
  const { 
    theme, 
    isDark, 
    isLight, 
    isAuto, 
    toggleTheme, 
    setTheme 
  } = useTheme('auto');

  // Temas customizados
  const customThemes = {
    blue: {
      'primary-color': '#007bff',
      'secondary-color': '#6c757d',
      'background-color': '#ffffff'
    },
    red: {
      'primary-color': '#dc3545',
      'secondary-color': '#6c757d',
      'background-color': '#ffffff'
    }
  };

  const {
    currentTheme,
    availableThemes,
    switchTheme
  } = useCustomTheme(customThemes, 'blue');

  // Temas com classes CSS
  const themeClasses = {
    light: 'theme-light',
    dark: 'theme-dark',
    high_contrast: 'theme-high-contrast'
  };

  const {
    theme: classTheme,
    themeClass,
    switchTheme: switchClassTheme
  } = useThemeClasses(themeClasses, 'light');

  return (
    <div className={`app ${themeClass}`}>
      <header>
        <h1>Minha Aplicação</h1>
        
        <div className="theme-controls">
          <button onClick={toggleTheme}>
            {isDark ? '☀️' : '🌙'} {theme}
          </button>
          
          <button onClick={() => setTheme('light')}>Light</button>
          <button onClick={() => setTheme('dark')}>Dark</button>
          <button onClick={() => setTheme('auto')}>Auto</button>
        </div>

        <div className="custom-theme-controls">
          {availableThemes.map(themeName => (
            <button
              key={themeName}
              onClick={() => switchTheme(themeName)}
              className={currentTheme === themeName ? 'active' : ''}
            >
              {themeName}
            </button>
          ))}
        </div>
      </header>

      <main>
        <p>Tema atual: {theme}</p>
        <p>É automático: {isAuto ? 'Sim' : 'Não'}</p>
        <p>Tema customizado: {currentTheme}</p>
      </main>
    </div>
  );
};

// CSS que funciona com o hook
const themeCss = `
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #ffffff;
  --text-color: #333333;
}

[data-theme="dark"] {
  --primary-color: #0d6efd;
  --secondary-color: #6c757d;
  --background-color: #1a1a1a;
  --text-color: #ffffff;
}

[data-theme="light"] {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #ffffff;
  --text-color: #333333;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.theme-light {
  background: white;
  color: black;
}

.theme-dark {
  background: #1a1a1a;
  color: white;
}

.theme-high-contrast {
  background: black;
  color: yellow;
}
`;
*/
