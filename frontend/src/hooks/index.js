// Exportações dos hooks customizados
export { useSidebar, useSimpleSidebar } from "./useSidebar";
export {
	useActiveRoute,
	useIsActiveRoute,
	useCurrentRoute,
} from "./useActiveRoute";
export {
	useKeyboard,
	useKeySequence,
	useKeyCombination,
	useArrowNavigation,
} from "./useKeyboard";
export {
	useMediaQuery,
	useMultipleMediaQueries,
	useBreakpoints,
	useOrientation,
	useDeviceDetection,
	useViewport,
	useBreakpointChange,
} from "./useMediaQuery";
export {
	useLocalStorage,
	useMultipleLocalStorage,
	useLocalStorageWithExpiry,
	useSecureLocalStorage,
} from "./useLocalStorage";
export {
	useClickOutside,
	useMultipleClickOutside,
	useClickOutsideWithEscape,
} from "./useClickOutside";

// Hooks adicionais que podem ser úteis
export { useTheme } from "./useTheme";
export { useAnimation } from "./useAnimation";

// Re-exportações úteis do React
export {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
	useContext,
	useReducer,
} from "react";
