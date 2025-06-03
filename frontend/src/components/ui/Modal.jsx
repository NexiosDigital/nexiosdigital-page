import React, { useEffect } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";

const Modal = ({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
	className = "",
}) => {
	const modalRef = useClickOutside(onClose, isOpen);

	const sizes = {
		sm: "max-w-md",
		md: "max-w-lg",
		lg: "max-w-2xl",
		xl: "max-w-4xl",
		full: "max-w-full",
	};

	// Fechar com ESC
	useEffect(() => {
		const handleEsc = (e) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEsc);
		return () => document.removeEventListener("keydown", handleEsc);
	}, [isOpen, onClose]);

	// Prevenir scroll do body quando modal está aberto
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}

		return () => {
			document.body.style.overflow = "auto";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center">
			<div className="modal-backdrop absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />

			<div
				ref={modalRef}
				className={`
          modal-content relative bg-card-bg rounded-xl shadow-xl 
          ${sizes[size]} 
          mx-4 max-h-[90vh] overflow-auto
          ${className}
        `}
			>
				{title && (
					<div className="modal-header flex items-center justify-between p-6 border-b border-gray-200">
						<h3 className="modal-title text-lg font-semibold text-primary">
							{title}
						</h3>
						<button
							onClick={onClose}
							className="modal-close text-text-secondary hover:text-primary transition-colors"
						>
							<i className="fas fa-times"></i>
						</button>
					</div>
				)}

				<div className="modal-body p-6">{children}</div>
			</div>
		</div>
	);
};

export default Modal;
