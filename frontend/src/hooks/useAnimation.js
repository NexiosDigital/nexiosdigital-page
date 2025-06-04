import { useRef, useEffect, useState, useCallback } from "react";
import { useMediaQuery } from "./useMediaQuery";

/**
 * Hook para animações CSS
 * @param {string} animationName - Nome da animação CSS
 * @param {number} duration - Duração em milissegundos
 * @param {Object} options - Opções da animação
 * @returns {Object} - Ref e controles da animação
 */
export const useAnimation = (animationName, duration = 300, options = {}) => {
	const {
		delay = 0,
		iterationCount = 1,
		direction = "normal",
		fillMode = "both",
		timingFunction = "ease",
		playOnMount = false,
	} = options;

	const ref = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [hasFinished, setHasFinished] = useState(false);

	// Respeitar preferência de motion reduzido
	const prefersReducedMotion = useMediaQuery(
		"(prefers-reduced-motion: reduce)"
	);

	// Função para reproduzir animação
	const play = useCallback(() => {
		if (ref.current && !prefersReducedMotion) {
			setIsPlaying(true);
			setHasFinished(false);

			const element = ref.current;
			element.style.animation = `${animationName} ${duration}ms ${timingFunction} ${delay}ms ${iterationCount} ${direction} ${fillMode}`;
		}
	}, [
		animationName,
		duration,
		timingFunction,
		delay,
		iterationCount,
		direction,
		fillMode,
		prefersReducedMotion,
	]);

	// Função para pausar animação
	const pause = useCallback(() => {
		if (ref.current) {
			ref.current.style.animationPlayState = "paused";
		}
	}, []);

	// Função para resumir animação
	const resume = useCallback(() => {
		if (ref.current) {
			ref.current.style.animationPlayState = "running";
		}
	}, []);

	// Função para parar animação
	const stop = useCallback(() => {
		if (ref.current) {
			setIsPlaying(false);
			ref.current.style.animation = "none";
		}
	}, []);

	// Função para resetar animação
	const reset = useCallback(() => {
		if (ref.current) {
			setIsPlaying(false);
			setHasFinished(false);
			ref.current.style.animation = "none";
			// Force reflow
			ref.current.offsetHeight;
		}
	}, []);

	// Event listeners para animação
	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const handleAnimationStart = () => {
			setIsPlaying(true);
			setHasFinished(false);
		};

		const handleAnimationEnd = () => {
			setIsPlaying(false);
			setHasFinished(true);
		};

		element.addEventListener("animationstart", handleAnimationStart);
		element.addEventListener("animationend", handleAnimationEnd);

		return () => {
			element.removeEventListener("animationstart", handleAnimationStart);
			element.removeEventListener("animationend", handleAnimationEnd);
		};
	}, []);

	// Reproduzir automaticamente se configurado
	useEffect(() => {
		if (playOnMount) {
			play();
		}
	}, [playOnMount, play]);

	return {
		ref,
		isPlaying,
		hasFinished,
		play,
		pause,
		resume,
		stop,
		reset,
	};
};

/**
 * Hook para animação de entrada/saída
 * @param {boolean} isVisible - Se o elemento deve estar visível
 * @param {Object} animations - Configurações de animação
 * @returns {Object} - Ref e estado da animação
 */
export const useToggleAnimation = (isVisible, animations = {}) => {
	const {
		enter = "fadeIn",
		exit = "fadeOut",
		duration = 300,
		enterDuration = duration,
		exitDuration = duration,
	} = animations;

	const ref = useRef(null);
	const [shouldRender, setShouldRender] = useState(isVisible);
	const [isAnimating, setIsAnimating] = useState(false);

	const prefersReducedMotion = useMediaQuery(
		"(prefers-reduced-motion: reduce)"
	);

	useEffect(() => {
		if (isVisible) {
			setShouldRender(true);

			if (ref.current && !prefersReducedMotion) {
				setIsAnimating(true);
				ref.current.style.animation = `${enter} ${enterDuration}ms ease forwards`;

				const timer = setTimeout(() => {
					setIsAnimating(false);
				}, enterDuration);

				return () => clearTimeout(timer);
			}
		} else {
			if (ref.current && !prefersReducedMotion) {
				setIsAnimating(true);
				ref.current.style.animation = `${exit} ${exitDuration}ms ease forwards`;

				const timer = setTimeout(() => {
					setShouldRender(false);
					setIsAnimating(false);
				}, exitDuration);

				return () => clearTimeout(timer);
			} else {
				setShouldRender(false);
			}
		}
	}, [
		isVisible,
		enter,
		exit,
		enterDuration,
		exitDuration,
		prefersReducedMotion,
	]);

	return {
		ref,
		shouldRender,
		isAnimating,
		isVisible: shouldRender && isVisible,
	};
};

/**
 * Hook para animação baseada em scroll
 * @param {Object} options - Opções da animação
 * @returns {Object} - Ref e estado da animação
 */
export const useScrollAnimation = (options = {}) => {
	const {
		threshold = 0.1,
		animationName = "fadeInUp",
		duration = 600,
		delay = 0,
		once = true,
	} = options;

	const ref = useRef(null);
	const [isVisible, setIsVisible] = useState(false);
	const [hasAnimated, setHasAnimated] = useState(false);

	const prefersReducedMotion = useMediaQuery(
		"(prefers-reduced-motion: reduce)"
	);

	useEffect(() => {
		const element = ref.current;
		if (!element || prefersReducedMotion) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);

					if (!hasAnimated) {
						element.style.animation = `${animationName} ${duration}ms ease ${delay}ms forwards`;
						setHasAnimated(true);

						if (once) {
							observer.unobserve(element);
						}
					}
				} else if (!once) {
					setIsVisible(false);
					setHasAnimated(false);
				}
			},
			{ threshold }
		);

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, [
		animationName,
		duration,
		delay,
		threshold,
		once,
		hasAnimated,
		prefersReducedMotion,
	]);

	return {
		ref,
		isVisible,
		hasAnimated,
	};
};

/**
 * Hook para animação de lista staggered
 * @param {number} itemCount - Número de itens
 * @param {Object} options - Opções da animação
 * @returns {Object} - Funções e estado
 */
export const useStaggeredAnimation = (itemCount, options = {}) => {
	const {
		animationName = "fadeInUp",
		duration = 400,
		staggerDelay = 100,
		startDelay = 0,
	} = options;

	const [animatedItems, setAnimatedItems] = useState(new Set());
	const prefersReducedMotion = useMediaQuery(
		"(prefers-reduced-motion: reduce)"
	);

	const animate = useCallback(() => {
		if (prefersReducedMotion) return;

		for (let i = 0; i < itemCount; i++) {
			setTimeout(() => {
				setAnimatedItems((prev) => new Set([...prev, i]));
			}, startDelay + i * staggerDelay);
		}
	}, [itemCount, startDelay, staggerDelay, prefersReducedMotion]);

	const reset = useCallback(() => {
		setAnimatedItems(new Set());
	}, []);

	const getItemStyle = useCallback(
		(index) => {
			if (prefersReducedMotion) return {};

			return animatedItems.has(index)
				? {
						animation: `${animationName} ${duration}ms ease forwards`,
				  }
				: {
						opacity: 0,
						transform: "translateY(20px)",
				  };
		},
		[animatedItems, animationName, duration, prefersReducedMotion]
	);

	const getItemRef = useCallback(
		(index) => {
			return (element) => {
				if (element && animatedItems.has(index)) {
					element.style.animation = `${animationName} ${duration}ms ease forwards`;
				}
			};
		},
		[animatedItems, animationName, duration]
	);

	return {
		animate,
		reset,
		getItemStyle,
		getItemRef,
		animatedItems: Array.from(animatedItems),
		isComplete: animatedItems.size === itemCount,
	};
};

/**
 * Hook para animação de contador
 * @param {number} end - Valor final
 * @param {Object} options - Opções da animação
 * @returns {Object} - Valor atual e controles
 */
export const useCounterAnimation = (end, options = {}) => {
	const {
		start = 0,
		duration = 1000,
		easing = "easeOutQuart",
		formatter = (value) => Math.floor(value),
	} = options;

	const [count, setCount] = useState(start);
	const [isAnimating, setIsAnimating] = useState(false);
	const frameRef = useRef();
	const startTimeRef = useRef();

	const easingFunctions = {
		linear: (t) => t,
		easeInQuad: (t) => t * t,
		easeOutQuad: (t) => t * (2 - t),
		easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
		easeOutQuart: (t) => 1 - --t * t * t * t,
	};

	const animate = useCallback(() => {
		setIsAnimating(true);
		startTimeRef.current = Date.now();

		const step = () => {
			const elapsed = Date.now() - startTimeRef.current;
			const progress = Math.min(elapsed / duration, 1);

			const easedProgress = easingFunctions[easing]
				? easingFunctions[easing](progress)
				: progress;

			const currentValue = start + (end - start) * easedProgress;
			setCount(currentValue);

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(step);
			} else {
				setIsAnimating(false);
				setCount(end);
			}
		};

		frameRef.current = requestAnimationFrame(step);
	}, [start, end, duration, easing]);

	const reset = useCallback(() => {
		if (frameRef.current) {
			cancelAnimationFrame(frameRef.current);
		}
		setCount(start);
		setIsAnimating(false);
	}, [start]);

	useEffect(() => {
		return () => {
			if (frameRef.current) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, []);

	return {
		count: formatter(count),
		rawCount: count,
		isAnimating,
		animate,
		reset,
	};
};

// Exemplo de uso:
/*
const AnimatedComponent = () => {
  // Animação básica
  const { ref: fadeRef, play: playFade } = useAnimation('fadeIn', 500);

  // Animação de toggle
  const [showModal, setShowModal] = useState(false);
  const { ref: modalRef, shouldRender } = useToggleAnimation(showModal, {
    enter: 'slideInDown',
    exit: 'slideOutUp',
    duration: 300
  });

  // Animação por scroll
  const { ref: scrollRef } = useScrollAnimation({
    animationName: 'fadeInUp',
    threshold: 0.2,
    once: true
  });

  // Animação staggered
  const items = Array.from({ length: 5 }, (_, i) => `Item ${i + 1}`);
  const { animate: animateList, getItemStyle } = useStaggeredAnimation(items.length, {
    staggerDelay: 150
  });

  // Contador animado
  const { count, animate: animateCounter } = useCounterAnimation(1000, {
    duration: 2000,
    formatter: (value) => value.toLocaleString()
  });

  return (
    <div>
      <div ref={fadeRef}>
        <button onClick={playFade}>Animar Fade</button>
      </div>

      <button onClick={() => setShowModal(!showModal)}>
        Toggle Modal
      </button>

      {shouldRender && (
        <div ref={modalRef} className="modal">
          Modal Content
        </div>
      )}

      <div ref={scrollRef} className="scroll-element">
        Elemento que anima no scroll
      </div>

      <div className="list">
        <button onClick={animateList}>Animar Lista</button>
        {items.map((item, index) => (
          <div key={index} style={getItemStyle(index)}>
            {item}
          </div>
        ))}
      </div>

      <div>
        <button onClick={animateCounter}>Contar até 1000</button>
        <h2>{count}</h2>
      </div>
    </div>
  );
};

// CSS necessário para as animações
const animationCss = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideOutUp {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;
*/
