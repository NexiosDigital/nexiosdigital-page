import React from "react";

const EmptyState = ({ icon, title, description, action, className = "" }) => {
	return (
		<div className={`empty-state text-center py-12 ${className}`}>
			{icon && (
				<div className="empty-icon mb-4">
					<i className={`${icon} text-6xl text-text-secondary opacity-50`}></i>
				</div>
			)}

			{title && (
				<h3 className="empty-title text-xl font-semibold text-primary mb-2">
					{title}
				</h3>
			)}

			{description && (
				<p className="empty-description text-text-secondary mb-6 max-w-md mx-auto">
					{description}
				</p>
			)}

			{action && <div className="empty-action">{action}</div>}
		</div>
	);
};

export default EmptyState;
