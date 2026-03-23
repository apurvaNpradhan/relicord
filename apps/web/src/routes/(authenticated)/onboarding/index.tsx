import { createFileRoute, redirect } from "@tanstack/react-router";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";

export const Route = createFileRoute("/(authenticated)/onboarding/")({
	beforeLoad: () => {
		const { profileCompleted } = useOnboardingStore.getState();

		if (profileCompleted) {
			throw redirect({
				to: "/onboarding/complete",
			});
		}

		throw redirect({
			to: "/onboarding/setup-profile",
		});
	},
});
