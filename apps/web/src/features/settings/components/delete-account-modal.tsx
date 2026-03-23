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
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";
import { useModal } from "@/stores/modal-store";

export function DeleteAccountModal() {
	const { close } = useModal();
	const [isLoading, setIsLoading] = useState(false);
	const { data: session } = useSuspenseQuery(sessionQueryOptions);
	const userEmail = session?.user?.email || "";

	const deleteSchema = z.object({
		email: z
			.string()
			.email("Invalid email")
			.refine((val) => val === userEmail, {
				message: "Email doesn't match your account email",
			}),
	});

	type DeleteFormValues = z.infer<typeof deleteSchema>;

	const form = useForm<DeleteFormValues>({
		resolver: zodResolver(deleteSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit() {
		setIsLoading(true);
		try {
			const { data, error } = await authClient.deleteUser({
				callbackURL: `${env.VITE_BASE_URL}/goodbye`,
			});

			if (error) {
				throw error;
			}
			if (data.success) {
				toast.success(
					"Account deletion process started. Please check your email to confirm.",
				);
			}

			close();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to delete account";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<DialogHeader>
				<div className="flex items-center gap-2 text-destructive">
					<AlertTriangle size={24} />
					<DialogTitle>Delete Account</DialogTitle>
				</div>
				<DialogDescription>
					This action is permanent and cannot be undone. All your data,
					including projects and workspaces, will be permanently removed.
				</DialogDescription>
			</DialogHeader>

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="deleteConfirmEmail"
						className="font-medium text-foreground/80 text-sm"
					>
						Please type in your email to confirm:{" "}
						<span className="font-semibold text-foreground">{userEmail}</span>
					</label>
					<Input
						id="deleteConfirmEmail"
						placeholder={userEmail}
						{...form.register("email")}
						className={
							form.formState.errors.email
								? "border-destructive focus-visible:ring-destructive/20"
								: ""
						}
					/>
					{form.formState.errors.email && (
						<p className="text-destructive text-xs">
							{form.formState.errors.email.message}
						</p>
					)}
				</div>

				<DialogFooter className="mt-2 flex flex-col gap-2 sm:flex-col">
					<Button
						type="submit"
						variant="destructive"
						className="w-full"
						disabled={isLoading || !form.formState.isValid}
					>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							"Permanently delete account and all data"
						)}
					</Button>
					<Button
						type="button"
						variant="ghost"
						onClick={close}
						disabled={isLoading}
						className="w-full"
					>
						Cancel
					</Button>
				</DialogFooter>
			</form>
		</div>
	);
}
