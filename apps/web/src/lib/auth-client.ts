import type { auth } from "@relicord/auth";
import { env } from "@relicord/env/web";
import { queryOptions } from "@tanstack/react-query";
import {
	customSessionClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: env.VITE_SERVER_URL,
	plugins: [
		customSessionClient<typeof auth>(),
		inferAdditionalFields<typeof auth>(),
	],
});

export const sessionQueryOptions = queryOptions({
	queryKey: ["session"],
	queryFn: async () => {
		const { data } = await authClient.getSession();
		return data;
	},
	staleTime: 0,
});
