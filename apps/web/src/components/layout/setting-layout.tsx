import {
	SidebarProvider,
	SidebarTrigger,
} from "@relicord/ui/components/sidebar";
import { useIsMobile } from "@relicord/ui/hooks/use-mobile";
import { cn } from "@relicord/ui/lib/utils";
import React from "react";
import { SettingSidebar } from "@/features/settings/components/sidebar/setting-sidebar";
import { HeaderOutlet } from "./header-context";

interface MainLayoutProps {
	children: React.ReactNode;
	header?: React.ReactNode;
	headersNumber?: 1 | 2;
}

const isEmptyHeader = (header: React.ReactNode | undefined): boolean => {
	if (!header) return true;

	if (React.isValidElement(header) && header.type === React.Fragment) {
		const props = header.props as { children?: React.ReactNode };

		if (!props.children) return true;

		if (Array.isArray(props.children) && props.children.length === 0) {
			return true;
		}
	}

	return false;
};

export default function SettingLayout({
	children,
	header,
	headersNumber = 2,
}: MainLayoutProps) {
	const height = {
		1: "h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]",
		2: "h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)]",
	};
	const isMobile = useIsMobile();

	const effectiveHeader = header || <HeaderOutlet />;

	return (
		<SidebarProvider>
			<div className="flex h-full w-full flex-col items-center justify-start overflow-hidden">
				{isMobile && <SidebarTrigger />}
				{effectiveHeader}
				<div
					className={cn(
						"flex w-full overflow-auto",
						isEmptyHeader(effectiveHeader)
							? "h-full"
							: height[headersNumber as keyof typeof height],
					)}
				>
					<SettingSidebar />
					<div className="flex-1 overflow-y-auto">{children}</div>
				</div>
			</div>
		</SidebarProvider>
	);
}
