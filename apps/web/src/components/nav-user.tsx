"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@relicord/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@relicord/ui/components/dropdown-menu";
import { SidebarMenuButton } from "@relicord/ui/components/sidebar";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "better-auth";
import { LogOut, Settings } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getImageUrl } from "@/lib/get-r2-image-url";
import { queryClient } from "@/utils/trpc";
export function NavUser({ user }: { user: User }) {
	const navigate = useNavigate();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<SidebarMenuButton
						size="lg"
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar className="h-8 w-8 rounded-full border">
							<AvatarImage
								src={getImageUrl(user.image ?? "")}
								alt={user.name}
							/>
							<AvatarFallback className="rounded-full">
								{user.name
									.split(" ")
									.map((name) => name.charAt(0))
									.join("")}
							</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">{user.name}</span>
						</div>
					</SidebarMenuButton>
				}
			/>
			<DropdownMenuContent className="w-56 rounded-lg" align="end">
				<DropdownMenuItem className="gap-2 p-2 font-medium">
					<div>
						<Avatar className="h-6 w-6 rounded-sm">
							<AvatarImage
								src={getImageUrl(user.image ?? "")}
								alt={user.name}
							/>
							<AvatarFallback className="rounded-sm text-[10px]">
								{user.name
									.split(" ")
									.map((name) => name.charAt(0))
									.join("")}
							</AvatarFallback>
						</Avatar>
					</div>
					<div className="flex flex-col gap-0.5">
						<span className="line-clamp-1 font-semibold text-sm">
							{user.name}
						</span>
						<span className="line-clamp-1 text-muted-foreground text-xs">
							{user.email}
						</span>
					</div>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						onClick={() => navigate({ to: "/settings/account/profile" })}
					>
						<Settings className="size-4 text-muted-foreground" />
						Settings
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
					onClick={() => {
						authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									navigate({
										to: "/",
									});
									queryClient.clear();
								},
							},
						});
					}}
				>
					<LogOut className="size-4" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
