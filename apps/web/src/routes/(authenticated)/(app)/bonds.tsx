import { Button } from "@relicord/ui/components/button";
import { SidebarTrigger } from "@relicord/ui/components/sidebar";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { TeleportHeader } from "@/components/layout/header-context";

export const Route = createFileRoute("/(authenticated)/(app)/bonds")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<TeleportHeader>
				<Header />
			</TeleportHeader>
			<div className="mx-auto flex max-w-5xl flex-col gap-2">
				<h1 className="font-bold text-3xl">My Bonds</h1>
				<p className="text-muted-foreground">The people who matter most.</p>
			</div>
		</>
	);
}

function Header() {
	return (
		<div className="flex w-full items-center justify-between p-1">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<span className="font-semibold text-sm">Bonds</span>
			</div>
			<Button variant={"outline"}>
				<PlusIcon />
				New Bond
			</Button>
		</div>
	);
}
