import ImageKit from 'imagekit';

export const textFieldValidator = (_: unknown, value: string) => {
  if (value && value.length < 3) {
    return Promise.reject(
      new Error("Must be atleast 3 chars")
    )
  }
  return Promise.resolve();
}

export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IK_PUBLIC_KEY || '',
  privateKey: process.env.NEXT_PUBLIC_IK_PRIVATE_KEY || '',
  urlEndpoint: "https://ik.imagekit.io/nextloop/",
})

