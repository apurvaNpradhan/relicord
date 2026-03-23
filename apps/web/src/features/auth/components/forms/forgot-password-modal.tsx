import { zodResolver } from "@hookform/resolvers/zod";
import { env } from "@relicord/env/web";
import { Button } from "@relicord/ui/components/button";
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@relicord/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@relicord/ui/components/field";
import { Input } from "@relicord/ui/components/input";
import { Loader2Icon, MailIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { useModal } from "@/stores/modal-store";

const formSchema = z.object({
	email: z.email("Invalid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export function ForgotPasswordModal() {
	const { close } = useModal();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: FormValues) {
		setIsLoading(true);
		try {
			const { error } = await authClient.requestPasswordReset({
				email: values.email,
				redirectTo: `${env.VITE_BASE_URL}/reset-password`,
			});

			if (error) {
				throw error;
			}

			toast.success("Password reset email sent. Please check your inbox.");
			close();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to send reset email";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<DialogHeader>
				<div className="flex items-center gap-2">
					<div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
						<MailIcon size={24} />
					</div>
					<div className="grid gap-1">
						<DialogTitle>Forgot Password</DialogTitle>
						<DialogDescription>
							Enter your email to reset your password.
						</DialogDescription>
					</div>
				</div>
			</DialogHeader>

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<Field>
					<FieldLabel htmlFor="email">Email Address</FieldLabel>
					<Controller
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<>
								<Input
									{...field}
									id="email"
									type="email"
									placeholder="m@example.com"
									disabled={isLoading}
								/>
								{fieldState.error && <FieldError errors={[fieldState.error]} />}
							</>
						)}
					/>
				</Field>

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
								<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
								Sending...
							</>
						) : (
							"Send Reset Link"
						)}
					</Button>
				</DialogFooter>
			</form>
		</div>
	);
}
