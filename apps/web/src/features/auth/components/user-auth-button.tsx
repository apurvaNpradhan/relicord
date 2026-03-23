import { Button } from "@relicord/ui/components/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, LogIn } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export function UserAuthButton() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<Button variant="outline" disabled>
				<span className="animate-pulse">Loading...</span>
			</Button>
		);
	}

	if (!session?.user) {
		return (
			<Button variant="outline">
				<Link to="/sign-in" className="flex items-center gap-2">
					Sign In
					<LogIn className="size-4" />
				</Link>
			</Button>
		);
	}

	const onboardingCompleted = session.user.onboardingCompleted;

	const href = onboardingCompleted ? "/home" : "/onboarding";
	const label = onboardingCompleted ? "Go to App" : "Complete Setup";

	return (
		<Button>
			<Link to={href} className="flex items-center gap-2">
				{label}
				<ArrowRight className="size-4" />
			</Link>
		</Button>
	);
}
