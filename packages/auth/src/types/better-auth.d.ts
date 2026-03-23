import "better-auth";

declare module "better-auth" {
	interface User {
		onboardingCompleted?: Date | null;
	}
	interface Session {
		user: User;
	}
}
