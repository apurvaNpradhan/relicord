import { Button } from "@relicord/ui/components/button";
import { Card, CardContent } from "@relicord/ui/components/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";

export const Route = createFileRoute("/(authenticated)/onboarding/complete")({
	component: RouteComponent,
});

function RouteComponent() {
	const { queryClient } = Route.useRouteContext();
	const navigate = useNavigate();
	const profileCompleted = useOnboardingStore(
		(state) => state.profileCompleted,
	);
	const name = useOnboardingStore((state) => state.name);
	const slug = useOnboardingStore((state) => state.slug);
	const reset = useOnboardingStore((state) => state.reset);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await authClient.updateUser({
				onboardingCompleted: new Date(),
			});

			await queryClient.invalidateQueries({
				queryKey: sessionQueryOptions.queryKey,
			});

			await queryClient.refetchQueries({
				queryKey: sessionQueryOptions.queryKey,
			});

			toast.success("Onboarding completed successfully");
			reset();
			navigate({ to: "/home", replace: true });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to complete onboarding";
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (!useOnboardingStore.persist.hasHydrated()) return;
		if (!profileCompleted) {
			navigate({ to: "/onboarding/setup-profile", replace: true });
		}
	}, [profileCompleted, name, slug, navigate]);

	return (
		<div className="flex h-dvh w-full items-center justify-center p-4">
			<Card className="w-full max-w-lg border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
				<CardContent className="pt-6">
					<div className="mb-6 text-center">
						<h2 className="font-bold text-2xl">You're all set!</h2>
						<p className="text-muted-foreground">
							Ready to start using Relicord?
						</p>
					</div>
					<form onSubmit={onSubmit} className="flex flex-col gap-4">
						<Button
							type="submit"
							className="h-11 w-full font-semibold"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Completing...
								</>
							) : (
								"Finish onboarding"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
