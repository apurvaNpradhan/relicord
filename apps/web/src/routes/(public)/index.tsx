import { createFileRoute, Link } from "@tanstack/react-router";
import { UserAuthButton } from "@/features/auth/components/user-auth-button";

export const Route = createFileRoute("/(public)/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 text-center sm:py-32 lg:px-8">
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div
					className="absolute top-[calc(50%-13rem)] left-[calc(50%-7rem)] h-[31.125rem] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 blur-3xl sm:top-[calc(50%-30rem)] sm:left-[calc(50%-30rem)] sm:h-[42.375rem] sm:w-[72.1875rem]"
					style={{
						clipPath:
							"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
					}}
				/>
			</div>

			<div className="mx-auto max-w-2xl">
				<h1 className="font-black text-6xl text-foreground tracking-tighter sm:text-8xl">
					Relicord
				</h1>
				<UserAuthButton />
			</div>
		</div>
	);
}
