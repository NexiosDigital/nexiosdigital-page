import React from "react";

const StatCard = ({
	icon,
	value,
	label,
	trend,
	trendValue,
	color = "default",
	className = "",
}) => {
	const colorClasses = {
		default: "stat-icon",
		primary: "stat-icon-primary",
		success: "stat-icon-success",
		warning: "stat-icon-warning",
		danger: "stat-icon-danger",
	};

	const trendColors = {
		positive: "text-success",
		negative: "text-error",
		neutral: "text-text-secondary",
	};

	return (
		<div className={`stat-card ${className}`}>
			<div className="stat-card-inner">
				<div className={`stat-icon ${colorClasses[color]}`}>
					<i className={icon}></i>
				</div>

				<div className="stat-content">
					<div className="stat-number">{value}</div>
					<div className="stat-label">{label}</div>

					{trend && (
						<div className={`stat-trend ${trend}`}>
							<i
								className={`fas fa-arrow-${
									trend === "positive"
										? "up"
										: trend === "negative"
										? "down"
										: "right"
								}`}
							></i>
							<span>{trendValue}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default StatCard;
