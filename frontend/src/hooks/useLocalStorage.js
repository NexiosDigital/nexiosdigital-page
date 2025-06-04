import { useState, useEffect, useCallback } from "react";

/**
 * Hook para gerenciar localStorage de forma reativa
 * @param {string} key - Chave do localStorage
 * @param {*} initialValue - Valor inicial
 * @returns {[*, Function]} - [valor, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
	// Função para obter valor do localStorage
	const getStoredValue = useCallback(() => {
		if (typeof window === "undefined") {
			return initialValue;
		}

		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.warn(`Erro ao ler localStorage para chave "${key}":`, error);
			return initialValue;
		}
	}, [key, initialValue]);

	// Estado inicial
	const [storedValue, setStoredValue] = useState(getStoredValue);

	// Função para definir valor
	const setValue = useCallback(
		(value) => {
			try {
				// Permitir que value seja uma função como em useState
				const valueToStore =
					value instanceof Function ? value(storedValue) : value;

				// Salvar no estado
				setStoredValue(valueToStore);

				// Salvar no localStorage
				if (typeof window !== "undefined") {
					window.localStorage.setItem(key, JSON.stringify(valueToStore));

					// Disparar evento customizado para sincronização entre abas
					window.dispatchEvent(
						new CustomEvent("localStorage", {
							detail: { key, value: valueToStore },
						})
					);
				}
			} catch (error) {
				console.warn(
					`Erro ao salvar no localStorage para chave "${key}":`,
					error
				);
			}
		},
		[key, storedValue]
	);

	// Função para remover valor
	const removeValue = useCallback(() => {
		try {
			setStoredValue(initialValue);

			if (typeof window !== "undefined") {
				window.localStorage.removeItem(key);

				// Disparar evento customizado
				window.dispatchEvent(
					new CustomEvent("localStorage", {
						detail: { key, value: undefined },
					})
				);
			}
		} catch (error) {
			console.warn(
				`Erro ao remover do localStorage para chave "${key}":`,
				error
			);
		}
	}, [key, initialValue]);

	// Sincronizar entre abas/janelas
	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleStorageChange = (e) => {
			if (e.key === key) {
				try {
					const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
					setStoredValue(newValue);
				} catch (error) {
					console.warn(
						`Erro ao sincronizar localStorage para chave "${key}":`,
						error
					);
				}
			}
		};

		// Event listener nativo do localStorage
		window.addEventListener("storage", handleStorageChange);

		// Event listener customizado para mudanças na mesma aba
		const handleCustomEvent = (e) => {
			if (e.detail.key === key) {
				setStoredValue(e.detail.value ?? initialValue);
			}
		};

		window.addEventListener("localStorage", handleCustomEvent);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
			window.removeEventListener("localStorage", handleCustomEvent);
		};
	}, [key, initialValue]);

	// Verificar se há mudanças no localStorage ao montar/desmontar
	useEffect(() => {
		const currentValue = getStoredValue();
		if (currentValue !== storedValue) {
			setStoredValue(currentValue);
		}
	}, [getStoredValue, storedValue]);

	return [storedValue, setValue, removeValue];
};

/**
 * Hook para múltiplas chaves do localStorage
 * @param {Object} config - Configuração com chaves e valores iniciais
 * @returns {Object} - Objeto com valores e setters
 */
export const useMultipleLocalStorage = (config) => {
	const [values, setValues] = useState(() => {
		const initialValues = {};

		Object.keys(config).forEach((key) => {
			if (typeof window !== "undefined") {
				try {
					const stored = window.localStorage.getItem(key);
					initialValues[key] = stored ? JSON.parse(stored) : config[key];
				} catch {
					initialValues[key] = config[key];
				}
			} else {
				initialValues[key] = config[key];
			}
		});

		return initialValues;
	});

	const setValue = useCallback(
		(key, value) => {
			try {
				const valueToStore =
					value instanceof Function ? value(values[key]) : value;

				setValues((prev) => ({
					...prev,
					[key]: valueToStore,
				}));

				if (typeof window !== "undefined") {
					window.localStorage.setItem(key, JSON.stringify(valueToStore));
				}
			} catch (error) {
				console.warn(
					`Erro ao salvar múltiplo localStorage para chave "${key}":`,
					error
				);
			}
		},
		[values]
	);

	const removeValue = useCallback(
		(key) => {
			try {
				setValues((prev) => ({
					...prev,
					[key]: config[key],
				}));

				if (typeof window !== "undefined") {
					window.localStorage.removeItem(key);
				}
			} catch (error) {
				console.warn(
					`Erro ao remover múltiplo localStorage para chave "${key}":`,
					error
				);
			}
		},
		[config]
	);

	const setMultipleValues = useCallback((newValues) => {
		try {
			setValues((prev) => {
				const updated = { ...prev, ...newValues };

				if (typeof window !== "undefined") {
					Object.keys(newValues).forEach((key) => {
						window.localStorage.setItem(key, JSON.stringify(updated[key]));
					});
				}

				return updated;
			});
		} catch (error) {
			console.warn("Erro ao salvar múltiplos valores no localStorage:", error);
		}
	}, []);

	return {
		values,
		setValue,
		removeValue,
		setMultipleValues,
	};
};

/**
 * Hook para localStorage com vencimento
 * @param {string} key - Chave do localStorage
 * @param {*} initialValue - Valor inicial
 * @param {number} ttl - Tempo de vida em milissegundos
 * @returns {[*, Function, Function]} - [valor, setValue, isExpired]
 */
export const useLocalStorageWithExpiry = (
	key,
	initialValue,
	ttl = 24 * 60 * 60 * 1000
) => {
	const getStoredValue = useCallback(() => {
		if (typeof window === "undefined") {
			return initialValue;
		}

		try {
			const item = window.localStorage.getItem(key);
			if (!item) return initialValue;

			const { value, timestamp } = JSON.parse(item);
			const now = new Date().getTime();

			if (now - timestamp > ttl) {
				window.localStorage.removeItem(key);
				return initialValue;
			}

			return value;
		} catch (error) {
			console.warn(
				`Erro ao ler localStorage com expiry para chave "${key}":`,
				error
			);
			return initialValue;
		}
	}, [key, initialValue, ttl]);

	const [storedValue, setStoredValue] = useState(getStoredValue);

	const setValue = useCallback(
		(value) => {
			try {
				const valueToStore =
					value instanceof Function ? value(storedValue) : value;
				const timestamp = new Date().getTime();

				setStoredValue(valueToStore);

				if (typeof window !== "undefined") {
					window.localStorage.setItem(
						key,
						JSON.stringify({
							value: valueToStore,
							timestamp,
						})
					);
				}
			} catch (error) {
				console.warn(
					`Erro ao salvar localStorage com expiry para chave "${key}":`,
					error
				);
			}
		},
		[key, storedValue]
	);

	const isExpired = useCallback(() => {
		if (typeof window === "undefined") return false;

		try {
			const item = window.localStorage.getItem(key);
			if (!item) return true;

			const { timestamp } = JSON.parse(item);
			const now = new Date().getTime();

			return now - timestamp > ttl;
		} catch {
			return true;
		}
	}, [key, ttl]);

	return [storedValue, setValue, isExpired];
};

/**
 * Hook para localStorage seguro com validação
 * @param {string} key - Chave do localStorage
 * @param {*} initialValue - Valor inicial
 * @param {Function} validator - Função de validação
 * @returns {[*, Function]} - [valor, setValue]
 */
export const useSecureLocalStorage = (key, initialValue, validator) => {
	const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

	const setSecureValue = useCallback(
		(newValue) => {
			try {
				if (validator && typeof validator === "function") {
					if (validator(newValue)) {
						setValue(newValue);
					} else {
						console.warn(`Valor inválido para chave "${key}":`, newValue);
					}
				} else {
					setValue(newValue);
				}
			} catch (error) {
				console.warn(`Erro na validação para chave "${key}":`, error);
			}
		},
		[setValue, validator, key]
	);

	return [value, setSecureValue, removeValue];
};

// Exemplo de uso:
/*
const MyComponent = () => {
  // Uso básico
  const [name, setName] = useLocalStorage('userName', '');
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [settings, setSettings, removeSettings] = useLocalStorage('settings', {
    notifications: true,
    language: 'pt-BR'
  });

  // Múltiplas chaves
  const {
    values,
    setValue,
    removeValue,
    setMultipleValues
  } = useMultipleLocalStorage({
    sidebar_collapsed: false,
    notifications_enabled: true,
    last_visited_page: '/dashboard'
  });

  // Com expiração (1 hora)
  const [token, setToken, isTokenExpired] = useLocalStorageWithExpiry(
    'authToken',
    null,
    60 * 60 * 1000
  );

  // Com validação
  const [email, setEmail] = useSecureLocalStorage(
    'userEmail',
    '',
    (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
      />
      
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Claro</option>
        <option value="dark">Escuro</option>
      </select>

      <button onClick={() => setSettings({
        ...settings,
        notifications: !settings.notifications
      })}>
        Notificações: {settings.notifications ? 'ON' : 'OFF'}
      </button>

      <button onClick={() => setValue('sidebar_collapsed', !values.sidebar_collapsed)}>
        Sidebar: {values.sidebar_collapsed ? 'Colapsada' : 'Expandida'}
      </button>

      <button onClick={() => setMultipleValues({
        notifications_enabled: false,
        last_visited_page: '/settings'
      })}>
        Atualizar Múltiplos
      </button>

      {isTokenExpired() && (
        <div>Token expirado, faça login novamente</div>
      )}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (com validação)"
      />
    </div>
  );
};

// Hook personalizado usando localStorage
const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'pt-BR',
    notifications: true,
    sidebarCollapsed: false
  });

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences({
      theme: 'light',
      language: 'pt-BR',
      notifications: true,
      sidebarCollapsed: false
    });
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    resetPreferences,
    setPreferences
  };
};
*/
