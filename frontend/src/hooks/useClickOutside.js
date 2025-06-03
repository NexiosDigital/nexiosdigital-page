import { useState, useEffect, useCallback } from "react";

/**
 * Hook para gerenciar localStorage de forma reativa
 */
export const useLocalStorage = (key, initialValue) => {
	// Obter valor do localStorage ou usar valor inicial
	const [storedValue, setStoredValue] = useState(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.warn(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	// Função para atualizar o valor
	const setValue = useCallback(
		(value) => {
			try {
				// Permitir que value seja uma função como useState
				const valueToStore =
					value instanceof Function ? value(storedValue) : value;
				setStoredValue(valueToStore);
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
			} catch (error) {
				console.warn(`Error setting localStorage key "${key}":`, error);
			}
		},
		[key, storedValue]
	);

	// Remover item do localStorage
	const removeValue = useCallback(() => {
		try {
			window.localStorage.removeItem(key);
			setStoredValue(initialValue);
		} catch (error) {
			console.warn(`Error removing localStorage key "${key}":`, error);
		}
	}, [key, initialValue]);

	// Escutar mudanças no localStorage de outras abas
	useEffect(() => {
		const handleStorageChange = (e) => {
			if (e.key === key && e.newValue !== null) {
				try {
					setStoredValue(JSON.parse(e.newValue));
				} catch (error) {
					console.warn(`Error parsing localStorage key "${key}":`, error);
				}
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [key]);

	return [storedValue, setValue, removeValue];
};
