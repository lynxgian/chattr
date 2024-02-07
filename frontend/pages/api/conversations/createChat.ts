import { prisma } from "@/lib/service";
import AWS from "aws-sdk";
import { IncomingForm } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const form = new IncomingForm({});
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return console.log("Uh oh spagettios");
    }

    if (fields.attachment?.join("") === "null") {
      return await prisma.chats.create({
        data: {
          text: fields.message.join(""),
          conversationId: fields.conversationId.join(""),
          timestamp: fields.timestamp.join(""),
          authorId: fields.userId.join(""),
        },
      });
    }

    const image = files.attachment;
    const s3 = new AWS.S3({
      accessKeyId: process.env.spacesAccessKey,
      secretAccessKey: process.env.spacesSecret,
      region: "NYC3",
      endpoint: new AWS.Endpoint("nyc3.digitaloceanspaces.com"),
      signatureVersion: "v4",
    });
    s3.upload({
      Bucket: "chattr",
      Body: fs.createReadStream(image?.map((x) => x.filepath).toString()),
      ACL: "public-read",
      ContentType: image?.map((x) => x.mimetype).toString(),
      ContentDisposition: "inline",
      Key: `${req.cookies.accessCode}/${image?.map((x) => x.originalFilename)}`,
    }).send();

    await prisma.chats.create({
      data: {
        text: fields.message.join(""),
        conversationId: fields.conversationId.join(""),
        timestamp: fields.timestamp.join(""),
        authorId: fields.userId.join(""),
        attachment: {
          create: {
            url: `https://images.chattrbox.app/${
              req.cookies.accessCode
            }/${image?.map((x) => x.originalFilename).toString()}`,
            type: image?.map(x => x.mimetype).toString(),
            size: parseInt(image?.map(x => x.size).toString()),
            name: image?.map(x => x.originalFilename).toString()
          }
        }
      },
    });
  });

  return res.send("ok");
}
