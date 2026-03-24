import { SidebarTrigger } from "@relicord/ui/components/sidebar";
import { createFileRoute } from "@tanstack/react-router";
import { TeleportHeader } from "@/components/layout/header-context";

export const Route = createFileRoute("/(authenticated)/(app)/home")({
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	return (
		<>
			<TeleportHeader>
				<Header />
			</TeleportHeader>
			<h1>Home</h1>
		</>
	);
}

function Header() {
	return (
		<div className="flex w-full items-center gap-2">
			<SidebarTrigger />
			<span className="font-semibold text-sm">Home</span>
		</div>
	);
}
