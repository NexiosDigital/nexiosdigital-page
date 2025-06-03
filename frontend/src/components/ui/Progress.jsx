import React from "react";

const Progress = ({
	value,
	max = 100,
	label,
	color = "primary",
	size = "md",
	showPercentage = true,
	className = "",
}) => {
	const percentage = Math.round((value / max) * 100);

	const colors = {
		primary: "bg-accent",
		success: "bg-success",
		warning: "bg-warning",
		danger: "bg-error",
	};

	const sizes = {
		sm: "h-2",
		md: "h-3",
		lg: "h-4",
	};

	return (
		<div className={`progress-container ${className}`}>
			{(label || showPercentage) && (
				<div className="progress-header flex justify-between items-center mb-2">
					{label && (
						<span className="progress-label text-sm text-text-secondary">
							{label}
						</span>
					)}
					{showPercentage && (
						<span className="progress-percentage text-sm font-medium">
							{percentage}%
						</span>
					)}
				</div>
			)}

			<div
				className={`progress-bar bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}
			>
				<div
					className={`progress-fill transition-all duration-500 ease-out rounded-full ${colors[color]} ${sizes[size]}`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
};

export default Progress;
