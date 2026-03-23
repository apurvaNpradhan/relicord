import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/lib/auth-client";

export const Route = createFileRoute("/(sign)")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const session =
			await context.queryClient.ensureQueryData(sessionQueryOptions);
		if (session?.session) {
			redirect({
				to: "/home",
				throw: true,
			});
		}
		return { session };
	},
});

function RouteComponent() {
	return <Outlet />;
}
