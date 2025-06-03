import React from "react";

const Card = ({
	children,
	title,
	subtitle,
	headerAction,
	className = "",
	padding = "normal",
	hoverable = false,
}) => {
	const paddingClasses = {
		none: "",
		sm: "p-4",
		normal: "p-6",
		lg: "p-8",
	};

	return (
		<div
			className={`
        dashboard-card 
        ${paddingClasses[padding]} 
        ${hoverable ? "hoverable" : ""} 
        ${className}
      `}
		>
			{(title || subtitle || headerAction) && (
				<div className="card-header">
					<div>
						{title && <h3 className="card-title">{title}</h3>}
						{subtitle && (
							<p className="card-subtitle text-text-secondary mt-1">
								{subtitle}
							</p>
						)}
					</div>
					{headerAction && (
						<div className="card-header-action">{headerAction}</div>
					)}
				</div>
			)}

			<div className="card-content">{children}</div>
		</div>
	);
};

export default Card;
