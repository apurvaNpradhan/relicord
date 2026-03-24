import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@relicord/ui/components/avatar";
import { Button } from "@relicord/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@relicord/ui/components/card";
import { Input } from "@relicord/ui/components/input";
import { Label } from "@relicord/ui/components/label";
import { cn } from "@relicord/ui/lib/utils";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";
import { getImageUrl } from "@/lib/get-r2-image-url";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute(
	"/(authenticated)/onboarding/setup-profile",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { data: session } = useSuspenseQuery(sessionQueryOptions);
	const user = session?.user;

	const [name, setName] = useState(user?.name || "");
	const [avatarKey] = useState<string | null>(user?.image || null);
	const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		user?.image ? getImageUrl(user.image) : null,
	);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const profileCompleted = useOnboardingStore(
		(state) => state.profileCompleted,
	);

	useEffect(() => {
		if (profileCompleted) {
			navigate({ to: "/onboarding/complete", replace: true });
		}
	}, [profileCompleted, navigate]);

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setPendingAvatar(file);
		setPreviewUrl(URL.createObjectURL(file));
	};

	const { mutateAsync: uploadAndOptimizeAvatar } = useMutation(
		trpc.upload.uploadAndOptimizeAvatar.mutationOptions(),
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Please enter your name");
			return;
		}

		setIsSubmitting(true);
		try {
			let currentAvatarKey = avatarKey;

			if (pendingAvatar) {
				setIsUploadingAvatar(true);

				const base64 = await new Promise<string>((resolve) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.readAsDataURL(pendingAvatar);
				});

				const result = await uploadAndOptimizeAvatar({
					base64,
					filename: pendingAvatar.name,
				});

				currentAvatarKey = result.key;
				setIsUploadingAvatar(false);
			}

			await authClient.updateUser({
				name: name.trim(),
				image: currentAvatarKey ?? undefined,
			});

			useOnboardingStore.setState({ profileCompleted: true });
			navigate({ to: "/onboarding/complete", replace: true });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update profile";
			toast.error(message);
		} finally {
			setIsSubmitting(false);
			setIsUploadingAvatar(false);
		}
	};

	return (
		<div className="flex h-dvh w-full items-center justify-center p-4">
			<Card className="w-full max-w-lg border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
				<CardHeader className="text-center">
					<CardTitle className="font-bold text-2xl tracking-tight">
						Complete your profile
					</CardTitle>
					<CardDescription>
						Set up your name and avatar to get started.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-8">
						<div className="flex flex-col items-center justify-center gap-4">
							<div className="group relative">
								<Avatar className="h-24 w-24 ring-2 ring-muted ring-offset-2 ring-offset-background">
									<AvatarImage src={previewUrl || ""} />
									<AvatarFallback>
										{name?.charAt(0) || user?.email?.charAt(0) || "U"}
									</AvatarFallback>
								</Avatar>
								<label
									htmlFor="avatar-upload"
									className={cn(
										"absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-all group-hover:opacity-100",
										isUploadingAvatar && "opacity-100",
									)}
								>
									{isUploadingAvatar ? (
										<Loader2 className="h-6 w-6 animate-spin text-white" />
									) : (
										<Camera className="h-6 w-6 text-white" />
									)}
								</label>
								<input
									id="avatar-upload"
									type="file"
									className="hidden"
									accept="image/*"
									onChange={handleAvatarChange}
									disabled={isUploadingAvatar || isSubmitting}
								/>
							</div>
							<p className="font-medium text-muted-foreground text-sm">
								Change profile picture
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								placeholder="What should we call you?"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								disabled={isSubmitting}
								className="h-11"
							/>
						</div>

						<Button
							type="submit"
							className="h-11 w-full font-semibold text-base"
							disabled={isSubmitting || isUploadingAvatar}
						>
							{isSubmitting || isUploadingAvatar ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{isUploadingAvatar ? "Uploading..." : "Saving..."}
								</>
							) : (
								"Continue"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
