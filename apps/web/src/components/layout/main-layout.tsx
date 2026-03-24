import { SidebarInset, SidebarProvider } from "@relicord/ui/components/sidebar";
import { cn } from "@relicord/ui/lib/utils";
import React from "react";
import { AppSidebar } from "./app-sidebar";
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

export default function MainLayout({
	children,
	header,
	headersNumber = 2,
}: MainLayoutProps) {
	const height = {
		1: "h-[calc(100svh-40px)] lg:h-[calc(100svh-56px)]",
		2: "h-[calc(100svh-80px)] lg:h-[calc(100svh-96px)]",
	};

	const effectiveHeader = header || <HeaderOutlet />;

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="h-dvh w-full lg:p-3">
				<div>
					{effectiveHeader}
					<div
						className={cn(
							"w-full overflow-auto p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
							isEmptyHeader(effectiveHeader)
								? "h-full"
								: height[headersNumber as keyof typeof height],
						)}
					>
						{children}
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
