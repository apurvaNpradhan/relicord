import type { AppRouter } from "@relicord/api/routers/index";
import { env } from "@relicord/env/web";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import {
	createTRPCClient,
	httpBatchLink,
	httpLink,
	splitLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: query.invalidate,
				},
			});
		},
	}),
});

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		splitLink({
			condition: (op) => op.path.startsWith("upload"),
			true: httpLink({
				url: `${env.VITE_SERVER_URL}/trpc`,
				fetch(url, options) {
					return fetch(url, {
						...options,
						credentials: "include",
					});
				},
			}),
			false: httpBatchLink({
				url: `${env.VITE_SERVER_URL}/trpc`,
				fetch(url, options) {
					return fetch(url, {
						...options,
						credentials: "include",
					});
				},
			}),
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
