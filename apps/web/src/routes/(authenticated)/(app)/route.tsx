import { createFileRoute, Outlet } from "@tanstack/react-router";
import MainLayout from "@/components/layout/main-layout";

export const Route = createFileRoute("/(authenticated)/(app)")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<MainLayout>
			<Outlet />
		</MainLayout>
	);
}
