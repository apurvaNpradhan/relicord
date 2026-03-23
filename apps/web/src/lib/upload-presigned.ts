import { trpcClient } from "@/utils/trpc";

export async function uploadImagePresigned(file: File) {
	const { presignedUrl, publicUrl, key } =
		await trpcClient.upload.getPresignedUrl.mutate({
			filename: file.name,
			contentType: file.type,
			fileType: "image",
		});

	const uploadResponse = await fetch(presignedUrl, {
		method: "PUT",
		body: file,
		headers: {
			"Content-Type": file.type,
		},
	});

	if (!uploadResponse.ok) {
		throw new Error("Upload failed");
	}

	return {
		key,
		publicUrl,
	};
}

export async function uploadVideoPresigned(file: File) {
	const { presignedUrl, key, publicUrl } =
		await trpcClient.upload.getPresignedUrl.mutate({
			filename: file.name,
			contentType: file.type,
			fileType: "video",
		});

	const uploadResponse = await fetch(presignedUrl, {
		method: "PUT",
		body: file,
		headers: {
			"Content-Type": file.type,
		},
	});

	if (!uploadResponse.ok) {
		throw new Error("Upload failed");
	}

	return { key, publicUrl };
}
