import { trpcClient } from "@/utils/trpc";

export async function uploadAndOptimizeAvatar(file: File) {
	const base64 = await fileToBase64(file);

	const result = await trpcClient.upload.uploadAndOptimizeAvatar.mutate({
		base64,
		filename: file.name,
	});

	return result;
}

function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});
}
