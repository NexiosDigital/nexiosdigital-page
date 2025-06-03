import React from "react";

const Button = ({
	children,
	variant = "primary",
	size = "md",
	loading = false,
	disabled = false,
	className = "",
	onClick,
	type = "button",
	...props
}) => {
	const variants = {
		primary: "btn btn-primary",
		secondary: "btn btn-secondary",
		danger: "btn btn-danger",
		ghost: "btn btn-ghost",
		admin: "admin-btn",
	};

	const sizes = {
		sm: "btn-sm",
		md: "",
		lg: "btn-lg",
	};

	return (
		<button
			type={type}
			disabled={disabled || loading}
			onClick={onClick}
			className={`
        ${variants[variant]} 
        ${sizes[size]} 
        ${loading ? "loading" : ""} 
        ${className}
      `}
			{...props}
		>
			{loading ? (
				<>
					<i className="fas fa-spinner fa-spin"></i>
					<span>Carregando...</span>
				</>
			) : (
				children
			)}
		</button>
	);
};

export default Button;
