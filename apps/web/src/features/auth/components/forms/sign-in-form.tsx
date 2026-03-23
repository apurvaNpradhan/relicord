import { zodResolver } from "@hookform/resolvers/zod";
import { env } from "@relicord/env/web";
import { Button } from "@relicord/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@relicord/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@relicord/ui/components/field";
import { GitHubIcon, GoogleIcon } from "@relicord/ui/components/icons";
import { Input } from "@relicord/ui/components/input";
import { cn } from "@relicord/ui/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";
import { useModal } from "@/stores/modal-store";
import { queryClient } from "@/utils/trpc";

const signInSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const navigate = useNavigate();
	const { open } = useModal();
	const form = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const handleSocialSignIn = async (provider: "google" | "github") => {
		await authClient.signIn.social({
			provider,
			callbackURL: `${env.VITE_BASE_URL}/home`,
			newUserCallbackURL: `${env.VITE_BASE_URL}/onboarding/setup-profile`,
		});
	};

	const onSubmit = async (data: SignInValues) => {
		setIsSubmitting(true);

		toast.promise(
			(async () => {
				const { data: resData, error } = await authClient.signIn.email({
					email: data.email,
					password: data.password,
				});

				if (error) {
					setIsSubmitting(false);
					throw error;
				}

				await queryClient.refetchQueries(sessionQueryOptions);
				navigate({ to: "/onboarding" });
				return resData;
			})(),
			{
				loading: "Signing in...",
				success: "Sign in successful",
				error: (error) => error.message || "Failed to sign in",
			},
		);
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>
						Login with your Github or Google account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FieldGroup>
							<Field className="grid grid-cols-2 gap-4">
								<Button
									disabled={isSubmitting}
									variant="outline"
									type="button"
									onClick={() => handleSocialSignIn("github")}
									className="relative w-full"
								>
									<GitHubIcon className="mr-2 h-4 w-4" />
									Github
								</Button>
								<Button
									disabled={isSubmitting}
									variant="outline"
									type="button"
									onClick={() => handleSocialSignIn("google")}
									className="relative w-full"
								>
									<GoogleIcon className="mr-2 h-4 w-4" />
									Google
								</Button>
							</Field>
							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
								Or continue with
							</FieldSeparator>
							<Field>
								<FieldLabel htmlFor="email" className="relative">
									Email
								</FieldLabel>
								<Controller
									control={form.control}
									name="email"
									render={({ field, fieldState }) => (
										<>
											<Input
												{...field}
												id="email"
												type="email"
												disabled={isSubmitting}
												placeholder="m@example.com"
											/>
											{fieldState.error && (
												<FieldError errors={[fieldState.error]} />
											)}
										</>
									)}
								/>
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<button
										type="button"
										onClick={() => open({ type: "FORGOT_PASSWORD" })}
										className="ml-auto text-sm underline-offset-4 hover:underline"
									>
										Forgot your password?
									</button>
								</div>
								<Controller
									control={form.control}
									name="password"
									render={({ field, fieldState }) => (
										<>
											<div className="relative">
												<Input
													{...field}
													id="password"
													type={showPassword ? "text" : "password"}
													disabled={isSubmitting}
													autoComplete="current-password"
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
												>
													{showPassword ? (
														<EyeOffIcon size={18} />
													) : (
														<EyeIcon size={18} />
													)}
												</button>
											</div>
											{fieldState.error && (
												<FieldError errors={[fieldState.error]} />
											)}
										</>
									)}
								/>
							</Field>
							<Field>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting && (
										<Loader2Icon className="size-4 animate-spin" />
									)}
									{isSubmitting ? "Signing in..." : "Sign in"}{" "}
								</Button>
								<FieldDescription className="text-center">
									Don&apos;t have an account?{" "}
									<Link to="/sign-up" className="text-primary hover:underline">
										Sign up
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
