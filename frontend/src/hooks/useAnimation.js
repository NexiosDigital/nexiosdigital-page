import { useEffect, useRef } from "react";

/**
 * Hook para animações de entrada (fade in, slide in, etc.)
 */
export const useAnimation = (type = "fadeIn", delay = 0, threshold = 0.1) => {
	const ref = useRef(null);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		// Aplicar estilo inicial
		element.style.opacity = "0";
		element.style.transform = getInitialTransform(type);
		element.style.transition = `all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)`;
		element.style.transitionDelay = `${delay}ms`;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setTimeout(() => {
						element.style.opacity = "1";
						element.style.transform = "none";
					}, delay);
					observer.unobserve(element);
				}
			},
			{ threshold }
		);

		observer.observe(element);

		return () => observer.unobserve(element);
	}, [type, delay, threshold]);

	return ref;
};

const getInitialTransform = (type) => {
	switch (type) {
		case "fadeInUp":
			return "translateY(30px)";
		case "fadeInDown":
			return "translateY(-30px)";
		case "fadeInLeft":
			return "translateX(-30px)";
		case "fadeInRight":
			return "translateX(30px)";
		case "scaleIn":
			return "scale(0.8)";
		default:
			return "translateY(20px)";
	}
};

// Exemplo de uso:
/*
const MyComponent = () => {
  const animRef = useAnimation('fadeInUp', 200);
  
  return (
    <div ref={animRef} className="my-component">
      Content that will animate in
    </div>
  );
};
*/
