import React from "react";

const Badge = ({
	children,
	variant = "default",
	size = "md",
	className = "",
}) => {
	const variants = {
		default: "bg-gray-100 text-gray-800",
		primary: "bg-accent bg-opacity-20 text-accent",
		success: "bg-success bg-opacity-20 text-success",
		warning: "bg-warning bg-opacity-20 text-warning",
		danger: "bg-error bg-opacity-20 text-error",
		active: "status-badge active",
		inactive: "status-badge inactive",
		pending: "status-badge pending",
	};

	const sizes = {
		sm: "px-2 py-1 text-xs",
		md: "px-3 py-1 text-sm",
		lg: "px-4 py-2 text-base",
	};

	return (
		<span
			className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
		>
			{children}
		</span>
	);
};

export default Badge;
