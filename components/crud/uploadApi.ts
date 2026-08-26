import config from "@/config";

export async function deleteFiles(files: string[]) {
  const response = await fetch(`${config.apiBaseUrl}/api/upload`, {
    method: "DELETE",
    body: JSON.stringify(files),
    headers: { "Content-Type": "application/json" },
  });
  return await response.json();
}

export async function getTransformedUrl(url: string) {
  const response = await fetch(`${config.apiBaseUrl}/api/upload?url=${encodeURIComponent(url)}`);
  const result = await response.json();
  if (!result.success) throw new Error(result.message || result.msgText || "Failed to transform image URL.");
  return result.data.url as string;
}