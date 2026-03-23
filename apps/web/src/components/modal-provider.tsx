import * as React from "react";
import { ForgotPasswordModal } from "@/features/auth/components/forms/forgot-password-modal";
import { ChangeEmailModal } from "@/features/settings/components/change-email-modal";
import { DeleteAccountModal } from "@/features/settings/components/delete-account-modal";
import { UpdatePasswordModal } from "@/features/settings/components/update-password-modal";
import { type ModalType, useModal } from "@/stores/modal-store";
import Modal from "./modal";

export function ModalProvider() {
	const modal = useModal();

	const ModalRegistry: Record<ModalType, React.ComponentType<any>> = {
		FORGOT_PASSWORD: ForgotPasswordModal,
		UPDATE_PASSWORD: UpdatePasswordModal,
		DELETE_ACCOUNT: DeleteAccountModal,
		UPDATE_EMAIL: ChangeEmailModal,
	};

	if (modal.stack.length === 0) return null;

	return (
		<>
			{modal.stack.map((instance) => {
				const Component = ModalRegistry[instance.type];

				if (!Component) {
					console.warn(`No component found for modal type: ${instance.type}`);
					return null;
				}

				return (
					<Modal
						key={instance.id}
						modalSize={instance.modalSize}
						closeOnClickOutside={instance.closeOnClickOutside}
						isDirty={instance.isDirty}
						contentClassName={instance.contentClassName}
					>
						<React.Suspense
							fallback={
								<div className="p-10 text-center text-muted-foreground">
									Loading...
								</div>
							}
						>
							<Component {...(instance.data || {})} />
						</React.Suspense>
					</Modal>
				);
			})}
		</>
	);
}
