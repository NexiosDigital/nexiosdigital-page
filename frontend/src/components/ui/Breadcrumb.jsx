import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items, className = "" }) => {
	return (
		<nav
			className={`breadcrumb flex items-center space-x-2 text-sm ${className}`}
		>
			{items.map((item, index) => (
				<React.Fragment key={item.path || index}>
					{index > 0 && (
						<i className="fas fa-chevron-right text-text-secondary text-xs"></i>
					)}

					{item.isLast ? (
						<span className="breadcrumb-current text-text-secondary">
							{item.label}
						</span>
					) : (
						<Link
							to={item.path}
							className="breadcrumb-link text-accent hover:text-accent-light transition-colors"
						>
							{item.label}
						</Link>
					)}
				</React.Fragment>
			))}
		</nav>
	);
};

export default Breadcrumb;
