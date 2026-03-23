import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@relicord/ui/components/avatar";
import { Button } from "@relicord/ui/components/button";
import { Input } from "@relicord/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@relicord/ui/components/item";
import { Separator } from "@relicord/ui/components/separator";
import {
	Status,
	StatusIndicator,
	StatusLabel,
	statusVariants,
} from "@relicord/ui/components/status";
import { cn } from "@relicord/ui/lib/utils";
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	Camera,
	ChevronRight,
	Copy,
	Loader2,
	Monitor,
	Smartphone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import { authClient, sessionQueryOptions } from "@/lib/auth-client";
import { getImageUrl } from "@/lib/get-r2-image-url";
import { useModal } from "@/stores/modal-store";
import { trpc } from "@/utils/trpc";

function getBrowserInformation(userAgent: string) {
	const parser = new UAParser(userAgent);
	const result = parser.getResult();

	if (!result.browser.name && !result.os.name) {
		return "Unknown Device";
	}

	if (!result.browser.name) return result.os.name || "Unknown OS";
	if (!result.os.name) return result.browser.name || "Unknown Browser";

	return `${result.browser.name} on ${result.os.name}`;
}

function getDeviceIcon(userAgent: string) {
	const parser = new UAParser(userAgent);
	const result = parser.getResult();
	const isMobile =
		result.device.type === "mobile" ||
		result.os.name?.toLowerCase().includes("android") ||
		result.os.name?.toLowerCase().includes("ios");

	if (isMobile) {
		return (
			<Smartphone className="size-8 rounded-md bg-accent p-1 text-primary/60" />
		);
	}

	return (
		<Monitor className="size-8 rounded-md bg-accent p-1 text-primary/60" />
	);
}

function SessionManagement() {
	const queryClient = useQueryClient();
	const { data: session } = useSuspenseQuery(sessionQueryOptions);

	const { data: sessions, isLoading } = useQuery({
		queryKey: ["auth-sessions"],
		queryFn: async () => {
			const { data, error } = await authClient.listSessions();
			if (error) throw error;
			return data;
		},
	});

	const revokeMutation = useMutation({
		mutationFn: async (token: string) => {
			const { error } = await authClient.revokeSession({
				token,
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Session revoked");
			queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to revoke session",
			);
		},
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-12">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const currentSessionToken = session?.session?.token;
	const currentSession = sessions?.find((s) => s.token === currentSessionToken);
	const otherSessions =
		sessions?.filter((s) => s.token !== currentSessionToken) || [];
	const sortedSessions = currentSession
		? [currentSession, ...otherSessions]
		: otherSessions;

	return (
		<ItemGroup>
			{sortedSessions.map((s) => {
				const isCurrent = s.token === currentSessionToken;
				const info = getBrowserInformation(s.userAgent || "");

				return (
					<Item className="group rounded-md" variant={"muted"} key={s.id}>
						<ItemMedia>
							<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
								{getDeviceIcon(s.userAgent || "")}
							</div>
						</ItemMedia>
						<ItemContent className="gap-1">
							<ItemTitle className="flex items-center gap-2 font-medium text-foreground text-sm">
								{info}
							</ItemTitle>
							<div className="mt-2 flex items-center gap-2 text-xs">
								{isCurrent && (
									<Status variant="success">
										<StatusIndicator />
										<StatusLabel>Active Now</StatusLabel>
									</Status>
								)}
								<span className="text-muted-foreground">
									Last active {new Date(s.updatedAt).toLocaleString()}
								</span>
							</div>
						</ItemContent>
						<ItemActions>
							{!isCurrent && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => revokeMutation.mutate(s.token)}
									disabled={revokeMutation.isPending}
								>
									Log out
								</Button>
							)}
						</ItemActions>
					</Item>
				);
			})}
		</ItemGroup>
	);
}

export function AccountSettingsPage() {
	const {
		data: session,
		isPending: isSessionPending,
		refetch,
	} = useSuspenseQuery(sessionQueryOptions);
	const user = session?.user;
	const { open } = useModal();

	const [name, setName] = useState(user?.name || "");
	const [isUpdatingName, setIsUpdatingName] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

	const handleUpdateName = async () => {
		if (!name || name === user?.name) return;
		setIsUpdatingName(true);
		try {
			await authClient.updateUser({
				name: name,
			});
			toast.success("Name updated successfully");
			refetch();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update name";
			toast.error(message);
		} finally {
			setIsUpdatingName(false);
		}
	};
	async function handleCopyUserId() {
		await navigator.clipboard.writeText(user?.id || "");
		toast.success("User ID copied to clipboard");
	}

	const uploadAvatarMutation = useMutation(
		trpc.upload.uploadAndOptimizeAvatar.mutationOptions(),
	);
	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploadingAvatar(true);
		try {
			// Convert to base64 for the TRPC call
			const base64 = await new Promise<string>((resolve) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.readAsDataURL(file);
			});

			const { key } = await uploadAvatarMutation.mutateAsync({
				base64,
				filename: file.name,
			});

			await authClient.updateUser({
				image: key,
			});
			toast.success("Avatar updated successfully");
			refetch();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to update avatar";
			toast.error(message);
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	if (isSessionPending) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="animate-spin" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-10">
			<ItemGroup className="gap-0 rounded-md">
				<Item variant={"muted"}>
					<ItemContent>
						<ItemTitle className="text-base text-foreground/80">
							Profile picture
						</ItemTitle>
					</ItemContent>
					<ItemActions>
						<div className="group relative cursor-pointer">
							<Avatar className="h-10 w-10">
								<AvatarImage src={getImageUrl(user?.image || "") || ""} />
								<AvatarFallback className="text-lg">
									{user?.name?.charAt(0) || "U"}
								</AvatarFallback>
							</Avatar>
							<label
								htmlFor="avatar-upload"
								className={cn(
									"absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-background-foreground/40 opacity-0 transition-opacity group-hover:opacity-100",
									isUploadingAvatar && "cursor-not-allowed opacity-100",
								)}
							>
								{isUploadingAvatar ? (
									<Loader2 className="h-6 w-6 animate-spin text-accent" />
								) : (
									<Camera className="h-6 w-6 text-accent" />
								)}
							</label>
							<Input
								id="avatar-upload"
								type="file"
								className="hidden"
								accept="image/*"
								onChange={handleAvatarChange}
								disabled={isUploadingAvatar}
							/>
						</div>
					</ItemActions>
				</Item>

				<Separator />

				<Item variant={"muted"}>
					<ItemContent>
						<ItemTitle className="text-base text-foreground/80">
							Full name
						</ItemTitle>
					</ItemContent>
					<ItemActions className="gap-2">
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							onBlur={handleUpdateName}
							placeholder="Your name"
							className="max-w-[200px] bg-background"
						/>
						{isUpdatingName && <Loader2 className="h-4 w-4 animate-spin" />}
					</ItemActions>
				</Item>
			</ItemGroup>

			<div className="flex flex-col gap-4">
				<h2 className="font-semibold text-lg">Account security</h2>
				<Separator />
				<ItemGroup className="gap-0 rounded-md">
					<Item variant={"muted"}>
						<ItemContent className="gap-1">
							<ItemTitle className="text-base text-foreground/80">
								Email
							</ItemTitle>
							<ItemDescription className="text-muted-foreground">
								{user?.email}
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Button
								variant="outline"
								size="sm"
								className="bg-background"
								onClick={() =>
									open({
										type: "UPDATE_EMAIL",
									})
								}
							>
								Change email
							</Button>
						</ItemActions>
					</Item>
					<Separator />
					<Item variant={"muted"}>
						<ItemContent className="gap-1">
							<ItemTitle className="text-base text-foreground/80">
								Password
							</ItemTitle>
							<ItemDescription className="text-muted-foreground">
								Change your password to login to your account.
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Button
								variant="outline"
								size="sm"
								className="bg-background"
								onClick={() =>
									open({
										type: "UPDATE_PASSWORD",
									})
								}
							>
								Change password
							</Button>
						</ItemActions>
					</Item>
				</ItemGroup>
			</div>

			<div className="flex flex-col gap-4">
				<ItemGroup className="rounded-md">
					<Item
						variant="muted"
						className="cursor-pointer transition-colors hover:bg-muted/80"
						onClick={() =>
							open({
								type: "DELETE_ACCOUNT",
							})
						}
					>
						<ItemContent className="gap-1">
							<ItemTitle className="font-medium text-destructive">
								Delete my account
							</ItemTitle>
							<ItemDescription>
								Permanently delete the account and remove access from all
								workspaces.
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<ChevronRight className="text-muted-foreground" />
						</ItemActions>
					</Item>
				</ItemGroup>
			</div>

			<div className="flex flex-col gap-4">
				<h2 className="font-semibold text-lg">Sessions</h2>
				<SessionManagement />
			</div>
			<div className="flex flex-col gap-4">
				<h2 className="font-semibold text-lg">User ID</h2>
				<div className="flex flex-row items-center justify-between">
					<Item variant={"muted"}>
						<ItemContent>
							<ItemTitle>user ID</ItemTitle>
						</ItemContent>
						<ItemActions>
							{user?.id}
							<Button
								variant={"ghost"}
								size={"icon-sm"}
								title="Copy user ID"
								onClick={handleCopyUserId}
							>
								<Copy />
							</Button>
						</ItemActions>
					</Item>
				</div>
			</div>
		</div>
	);
}
