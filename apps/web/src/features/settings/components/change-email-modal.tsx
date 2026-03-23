import { zodResolver } from "@hookform/resolvers/zod";
import { env } from "@relicord/env/web";
import { Button } from "@relicord/ui/components/button";
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@relicord/ui/components/dialog";
import { Input } from "@relicord/ui/components/input";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";
import { useModal } from "@/stores/modal-store";

const emailSchema = z.object({
	newEmail: z.string().email("Invalid email address"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function ChangeEmailModal() {
	const { close } = useModal();
	const [isLoading, setIsLoading] = useState(false);
	const { data: session } = useSuspenseQuery(sessionQueryOptions);
	const currentEmail = session?.user?.email || "";

	const form = useForm<EmailFormValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			newEmail: "",
		},
	});

	async function onSubmit(values: EmailFormValues) {
		if (values.newEmail === currentEmail) {
			form.setError("newEmail", {
				message: "New email must be different from current email",
			});
			return;
		}

		setIsLoading(true);
		try {
			const { error } = await authClient.changeEmail({
				newEmail: values.newEmail,
				callbackURL: `${env.VITE_BASE_URL}/home`,
			});

			if (error) {
				throw error;
			}

			toast.success(
				"Verification links sent to both your old and new email addresses.",
			);
			close();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to change email";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<DialogHeader>
				<div className="flex items-center gap-2">
					<Mail size={24} className="text-primary" />
					<DialogTitle>Change Email Address</DialogTitle>
				</div>
				<DialogDescription>
					Enter your new email address below. You'll need to verify the change
					from both your current email and your new email.
				</DialogDescription>
			</DialogHeader>

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="currentEmailDisplay"
						className="font-medium text-foreground/80 text-sm"
					>
						Current Email
					</label>
					<Input
						id="currentEmailDisplay"
						value={currentEmail}
						readOnly
						className="bg-muted opacity-70"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="newEmail"
						className="font-medium text-foreground/80 text-sm"
					>
						New Email Address
					</label>
					<Input
						id="newEmail"
						type="email"
						placeholder="new.email@example.com"
						{...form.register("newEmail")}
						className={
							form.formState.errors.newEmail
								? "border-destructive focus-visible:ring-destructive/20"
								: ""
						}
					/>
					{form.formState.errors.newEmail && (
						<p className="text-destructive text-xs">
							{form.formState.errors.newEmail.message}
						</p>
					)}
				</div>

				<DialogFooter className="mt-2">
					<Button
						type="button"
						variant="ghost"
						onClick={close}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							"Request Email Change"
						)}
					</Button>
				</DialogFooter>
			</form>
		</div>
	);
}
