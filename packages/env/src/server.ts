import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		RESEND_API_KEY: z.string().min(1),
		RESEND_EMAIL_SENDER_NAME: z.string().min(1),
		RESEND_EMAIL_SENDER_ADDRESS: z.string().min(1),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),

		GITHUB_CLIENT_ID: z.string().min(1),
		GITHUB_CLIENT_SECRET: z.string().min(1),

		R2_ACCOUNT_ID: z.string().min(1),
		R2_ACCESS_KEY_ID: z.string().min(1),
		R2_SECRET_ACCESS_KEY: z.string().min(1),
		R2_BUCKET_NAME: z.string().min(1),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
