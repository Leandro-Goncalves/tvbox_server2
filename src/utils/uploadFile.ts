import AWS from "aws-sdk";
import { prisma } from "..";
import { createReadStream } from "fs";

const s3 = new AWS.S3();

const client = new AWS.S3({
  region: process.env.S3_REGION ?? "",
  endpoint: process.env.S3_URL ?? "",
  credentials: {
    accessKeyId: process.env.S3_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET ?? "",
  },
});

export const uploadFile = async (file: Express.Multer.File, name: string) => {
  console.log("Uploading file to S3", file, name);
  const Key =
    Math.random().toString(36) + "-" + file.originalname.replace(/\s/g, "");

  console.log(file);

  const uploadParams = {
    Bucket: process.env.S3_BUCKET ?? "",
    Key: Key,
    Body: file,
    ContentType: file.mimetype,
  };
  const uploadBucket = s3.putObject(uploadParams);

  const saveDb = prisma.apps.create({
    data: {
      name,
      url: `${process.env.S3_URL}/${process.env.S3_BUCKET}/${Key}`,
    },
  });

  const [_, fileDb] = await Promise.all([uploadBucket, saveDb]);
  return fileDb;
};
