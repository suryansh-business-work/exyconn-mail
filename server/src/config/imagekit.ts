import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: "public_kgj5PULxw6pfjeO2IGwEVundBIQ=",
  privateKey: "private_n4IdSlg7DbXXn88rRAVqZhCgGVw=",
  urlEndpoint: "https://ik.imagekit.io/esdata1",
});

export const uploadImage = async (
  file: Buffer,
  fileName: string,
  folder: string = "exyconn-mail",
): Promise<{ url: string; fileId: string }> => {
  const response = await imagekit.upload({
    file: file.toString("base64"),
    fileName,
    folder,
  });
  return { url: response.url, fileId: response.fileId };
};

export const deleteImage = async (fileId: string): Promise<void> => {
  await imagekit.deleteFile(fileId);
};
