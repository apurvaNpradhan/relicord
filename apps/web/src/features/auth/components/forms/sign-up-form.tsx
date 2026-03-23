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
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";

const signUpSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<SignUpValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	const handleSocialSignIn = async (provider: "google" | "github") => {
		await authClient.signIn.social({
			provider,
			callbackURL: `${env.VITE_BASE_URL}/home`,
			newUserCallbackURL: `${env.VITE_BASE_URL}/onboarding/setup-profile`,
		});
	};

	const onSubmit = async (data: SignUpValues) => {
		setIsSubmitting(true);

		toast.promise(
			(async () => {
				const { data: resData, error } = await authClient.signUp.email({
					email: data.email,
					password: data.password,
					name: data.name,
				});

				if (error) {
					setIsSubmitting(false);
					throw error;
				}

				useOnboardingStore.getState().reset();
				await queryClient.refetchQueries(sessionQueryOptions);
				navigate({ to: "/onboarding" });
				return resData;
			})(),
			{
				loading: "Creating account...",
				success: "Account created successfully",
				error: (error) => error.message || "Failed to create account",
			},
		);
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Create an account</CardTitle>
					<CardDescription>
						Enter your details below to create your account
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
								<FieldLabel htmlFor="name">Full Name</FieldLabel>
								<Controller
									control={form.control}
									name="name"
									render={({ field, fieldState }) => (
										<>
											<Input
												{...field}
												id="name"
												placeholder="John Doe"
												disabled={isSubmitting}
											/>
											{fieldState.error && (
												<FieldError errors={[fieldState.error]} />
											)}
										</>
									)}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Controller
									control={form.control}
									name="email"
									render={({ field, fieldState }) => (
										<>
											<Input
												{...field}
												id="email"
												type="email"
												placeholder="m@example.com"
												disabled={isSubmitting}
											/>
											{fieldState.error && (
												<FieldError errors={[fieldState.error]} />
											)}
										</>
									)}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="password">Password</FieldLabel>
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
													autoComplete="new-password"
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
									{isSubmitting ? "Creating account..." : "Create account"}
								</Button>
								<FieldDescription className="text-center">
									Already have an account?{" "}
									<Link to="/sign-in" className="text-primary hover:underline">
										Sign in
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
