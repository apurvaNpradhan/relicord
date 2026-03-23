import { createFileRoute } from "@tanstack/react-router";

import Header from "@/components/header";

export const Route = createFileRoute("/(authenticated)/(app)/home")({
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	return (
		<div className="flex w-full flex-col gap-10">
			<Header />
			<div className="mx-auto flex w-full max-w-6xl flex-col">
				<div className="px-4">
					<h1 className="font-bold text-3xl">
						Welcome back, {session.user.name}
					</h1>
				</div>
			</div>
		</div>
	);
}
