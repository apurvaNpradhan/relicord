import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/goodbye")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(public)/goodbye"!</div>;
}
