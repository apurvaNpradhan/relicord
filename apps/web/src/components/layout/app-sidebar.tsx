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
import {
	ArrowLeft,
	Contact,
	Home,
	Settings,
	Settings2,
	TagIcon,
} from "lucide-react";
import type React from "react";
import { useRouteActive } from "@/hooks/use-active-route";
import { sessionQueryOptions } from "@/lib/auth-client";
import { getImageUrl } from "@/lib/get-r2-image-url";
import { NavUser } from "../nav-user";
import UserMenu from "../user-menu";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSuspenseQuery(sessionQueryOptions);
	const user = session?.user;
	const isActive = useRouteActive();
	const navigate = useNavigate();
	const navItems = [
		{
			label: "Home",
			icon: Home,
			to: "/home",
			isActive: isActive("/home"),
			onClick: () => navigate({ to: "/home" }),
		},
		{
			label: "Bonds",
			icon: Contact,
			to: "/bonds",
			isActive: isActive("/bonds"),
			onClick: () => navigate({ to: "/bonds" }),
		},
	];
	return (
		<Sidebar {...props} collapsible="icon" variant="inset">
			<SidebarHeader className="p-0">
				{user && <NavUser user={user} />}
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup className="px-0">
					<SidebarGroupContent className="flex flex-col gap-1">
						{navItems.map((item) => (
							<SidebarMenuButton
								title={item.label}
								isActive={item.isActive}
								onClick={item.onClick}
							>
								{item.icon && <item.icon />}
								{item.label}
							</SidebarMenuButton>
						))}
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
