import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@relicord/ui/components/avatar";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@relicord/ui/components/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Settings, Settings2, TagIcon } from "lucide-react";
import type React from "react";
import { useRouteActive } from "@/hooks/use-active-route";
import { sessionQueryOptions } from "@/lib/auth-client";
import { getImageUrl } from "@/lib/get-r2-image-url";

export function SettingSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSuspenseQuery(sessionQueryOptions);
	const user = session?.user;
	const isActive = useRouteActive();
	const navigate = useNavigate();

	const onBack = () => {
		navigate({ to: "/home" });
	};

	return (
		<Sidebar {...props} collapsible="icon" variant="inset">
			<SidebarHeader>
				<SidebarMenuButton
					onClick={() => {
						onBack();
					}}
				>
					<ArrowLeft />
					<span>Back to app</span>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="font-medium text-muted-foreground/80">
						Account
					</SidebarGroupLabel>
					<SidebarGroupContent className="flex flex-col gap-1">
						<SidebarMenu className="flex flex-col gap-1">
							<SidebarMenuItem>
								<SidebarMenuButton
									isActive={isActive("/settings/account/profile")}
									onClick={() =>
										navigate({
											to: "/settings/account/profile",
										})
									}
								>
									<Avatar className="h-6 w-6 rounded-full border">
										<AvatarImage
											src={getImageUrl(user?.image ?? "")}
											alt={user?.name || ""}
										/>
										<AvatarFallback className="rounded-full text-[10px]">
											{user?.name
												?.split(" ")
												.map((name) => name.charAt(0))
												.join("")}
										</AvatarFallback>
									</Avatar>
									<span className="font-medium">{user?.name}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									isActive={isActive("/settings/account/preferences")}
									onClick={() =>
										navigate({
											to: "/settings/account/preferences",
										})
									}
								>
									<Settings />
									Preferences
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
