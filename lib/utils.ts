import ImageKit from 'imagekit';
import config from '../config';

export const textFieldValidator = (_: unknown, value: string) => {
  if (value && value.length < 3) {
    return Promise.reject(
      new Error("Must be atleast 3 chars")
    )
  }
  return Promise.resolve();
}

export const imagekit = new ImageKit({
  publicKey: config.imageKitPublicKey?.toString()!,
  privateKey: config.imageKitPrivateKey?.toString()!,
  urlEndpoint: config.imageKitCloudUrl!,
})

export function trimText(text: string, limit: number): string {
  const words = text.split(" ");
  const trimmed = words.slice(0, limit).join(" ");
  return trimmed + (words.length > limit ? "..." : "");
}

export function formattedDate(dateInput: string) {
  return new Date(dateInput).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });
}

export function formattedUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}