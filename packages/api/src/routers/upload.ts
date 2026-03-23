import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "..";
import { createAvatar } from "../lib/image-processor";
import { R2_BUCKET_NAME, r2Client } from "../lib/r2-client";
import { generateUniqueFilename, getPublicUrl } from "../lib/upload-utils";

export const uploadRouter = router({
	getPresignedUrl: publicProcedure
		.input(
			z.object({
				filename: z.string(),
				contentType: z.string(),
				fileType: z.enum(["image", "video"]),
			}),
		)
		.mutation(async ({ input }) => {
			const folder = input.fileType === "image" ? "images" : "videos";
			const filename = generateUniqueFilename(input.filename);
			const key = `${folder}/${filename}`;

			const command = new PutObjectCommand({
				Bucket: R2_BUCKET_NAME,
				Key: key,
				ContentType: input.contentType,
			});

			const presignedUrl = await getSignedUrl(r2Client, command, {
				expiresIn: 3600,
				unhoistableHeaders: new Set(["x-amz-checksum-mode"]),
			});

			const publicUrl = getPublicUrl(key);

			return {
				presignedUrl,
				publicUrl,
				key,
				filename,
			};
		}),

	confirmUpload: publicProcedure
		.input(
			z.object({
				key: z.string(),
				url: z.string(),
				filename: z.string(),
				size: z.number(),
				mimetype: z.string(),
			}),
		)
		.mutation(async () => {
			return { success: true };
		}),

	uploadAndOptimizeAvatar: protectedProcedure
		.input(
			z.object({
				base64: z.string(),
				filename: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
				const buffer = Buffer.from(base64Data, "base64");

				const { buffer: optimizedBuffer, format } = await createAvatar(buffer);

				const uniqueFilename = generateUniqueFilename(input.filename);
				const webpFilename = `${path.parse(uniqueFilename).name}.${format}`;
				const key = `avatars/${webpFilename}`;

				await r2Client.send(
					new PutObjectCommand({
						Bucket: R2_BUCKET_NAME,
						Key: key,
						Body: optimizedBuffer,
						ContentType: `image/${format}`,
						CacheControl: "public, max-age=31536000, immutable",
					}),
				);

				return {
					key,
					publicUrl: getPublicUrl(key),
				};
			} catch (error) {
				console.error("Avatar optimization failed:", error);
				throw new Error("Failed to process and upload avatar");
			}
		}),
});
