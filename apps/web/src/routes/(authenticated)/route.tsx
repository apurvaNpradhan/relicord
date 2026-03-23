import { SidebarProvider } from "@relicord/ui/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/lib/auth-client";

export const Route = createFileRoute("/(authenticated)")({
	component: RouteComponent,
	beforeLoad: async ({ context, location }) => {
		const session =
			await context.queryClient.ensureQueryData(sessionQueryOptions);
		if (!session?.session) {
			throw redirect({
				to: "/sign-in",
			});
		}

		const user = session.user;
		const isOnboardingPath = location.pathname.startsWith("/onboarding");

		if (!user.onboardingCompleted && !isOnboardingPath) {
			throw redirect({
				to: "/onboarding",
			});
		}

		if (user.onboardingCompleted && isOnboardingPath) {
			throw redirect({
				to: "/home",
			});
		}

		return {
			session,
		};
	},
});

function RouteComponent() {
	return (
		<>
			<SidebarProvider className="min-h-svh">
				<Outlet />
			</SidebarProvider>
		</>
	);
}
