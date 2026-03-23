import { Button } from "@relicord/ui/components/button";
import { Link } from "@tanstack/react-router";
import { Home, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ModeToggle } from "./mode-toggle";
import { NavUser } from "./nav-user";

export default function Header() {
	const { data: session } = authClient.useSession();
	const links = [
		{ to: "/home", label: "Home", icon: <Home className="size-4" /> },
		{ to: "/contacts", label: "Contacts", icon: <User className="size-4" /> },
	] as const;

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="flex h-14 items-center justify-between px-4">
				<nav className="flex items-center gap-6">
					<Link
						to="/"
						className="flex items-center gap-2 font-bold text-xl tracking-tight"
					>
						<span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground shadow-sm">
							R
						</span>
						Relicord
					</Link>
					<div className="flex items-center gap-4">
						{links.map(({ to, label, icon }) => (
							<Link
								key={to}
								to={to}
								className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-primary [&.active]:text-foreground"
							>
								{label}
							</Link>
						))}
					</div>
				</nav>
				<div className="flex items-center gap-3">
					{session?.user ? (
						<NavUser user={session.user} />
					) : (
						<Link to="/login">
							<Button variant="ghost" size="sm">
								Sign In
							</Button>
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
