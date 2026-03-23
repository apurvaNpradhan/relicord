import { db } from "@relicord/db";
import * as schema from "@relicord/db/schema/auth";
import ChangeEmail from "@relicord/email/changeEmail";
import DeleteAccountEmail from "@relicord/email/deleteAccount";
import ResetPassword from "@relicord/email/resetPassword";
import VerifyEmail from "@relicord/email/verifyEmail";
import { env } from "@relicord/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, organization } from "better-auth/plugins";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		sendResetPassword: async (data) => {
			const { user, url } = data;
			await resend.emails.send({
				from: `${env.RESEND_EMAIL_SENDER_NAME} <${env.RESEND_EMAIL_SENDER_ADDRESS}>`,
				to: user.email,
				subject: "Reset your password",
				react: ResetPassword({
					username: user.name,
					resetUrl: url,
					userEmail: user.email,
				}),
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			await resend.emails.send({
				from: `${env.RESEND_EMAIL_SENDER_NAME} <${env.RESEND_EMAIL_SENDER_ADDRESS}>`,
				to: user.email,
				subject: "Verify your email",
				react: VerifyEmail({ username: user.name, verifyUrl: url }),
			});
		},
	},
	user: {
		additionalFields: {
			onboardingCompleted: {
				type: "date",
				required: false,
				defaultValue: null,
				input: true,
			},
		},
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url }) => {
				await resend.emails.send({
					from: `${env.RESEND_EMAIL_SENDER_NAME} <${env.RESEND_EMAIL_SENDER_ADDRESS}>`,
					to: user.email,
					subject: "Delete your account",
					react: DeleteAccountEmail({ username: user.name, deleteUrl: url }),
				});
			},
		},
		changeEmail: {
			enabled: true,
			updateEmailWithoutVerification: false,
			async sendChangeEmailConfirmation({ user, newEmail, url }) {
				await resend.emails.send({
					from: `${env.RESEND_EMAIL_SENDER_NAME} <${env.RESEND_EMAIL_SENDER_ADDRESS}>`,
					to: user.email,
					subject: "Approve email change",
					react: ChangeEmail({
						username: user.name,
						newEmail,
						changeEmailUrl: url,
					}),
				});
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	socialProviders: {
		google: {
			prompt: "select_account consent",
			accessType: "offline",
			clientId: env.GOOGLE_CLIENT_ID,
			scope: ["email", "profile"],
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
	},
	plugins: [
		organization(),
		customSession(async ({ user, session }) => {
			return {
				user: {
					...user,
					onboardingCompleted: (user as any).onboardingCompleted,
				},
				session: {
					...session,
				},
			};
		}),
	],
});
