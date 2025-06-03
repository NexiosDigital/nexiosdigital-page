import React from "react";

const LoadingSpinner = ({
	size = "md",
	color = "primary",
	text = "Carregando...",
	className = "",
}) => {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-8 h-8",
		lg: "w-12 h-12",
		xl: "w-16 h-16",
	};

	const colorClasses = {
		primary: "border-accent",
		secondary: "border-gray-400",
		white: "border-white",
	};

	return (
		<div className={`loading-container ${className}`}>
			<div
				className={`
          loading-spinner 
          ${sizeClasses[size]} 
          border-2 border-transparent 
          ${colorClasses[color]} 
          border-t-transparent 
          rounded-full 
          animate-spin
        `}
				style={{
					borderTopColor: "var(--accent)",
					borderRightColor: "var(--accent-light)",
					animation: "spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite",
				}}
			/>
			{text && <p className="mt-3 text-text-secondary">{text}</p>}
		</div>
	);
};

export default LoadingSpinner;
