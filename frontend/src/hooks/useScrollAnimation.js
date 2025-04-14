import { useEffect } from "react";

export function useScrollAnimation(threshold = 0.1) {
	useEffect(() => {
		const animatedElements = document.querySelectorAll(".animate-on-scroll");

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("animate");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold }
		);

		animatedElements.forEach((el) => observer.observe(el));

		return () => {
			animatedElements.forEach((el) => observer.unobserve(el));
		};
	}, [threshold]);
}
