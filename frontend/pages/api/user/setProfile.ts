import { prisma } from "@/lib/service";
import { NextApiRequest, NextApiResponse } from "next";
import AWS from 'aws-sdk'
import fs from 'fs'
import { IncomingForm } from 'formidable';

export const config = {
    api: {
      bodyParser: false,
    },
  };
  

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let url
    const form = new IncomingForm()
    form.parse(req, async(err, fields, files) => {
        const image = files.image;
        const s3 = new AWS.S3({
            accessKeyId: process.env.spacesAccessKey,
            secretAccessKey: process.env.spacesSecret,
            region: 'NYC3',
            endpoint: new AWS.Endpoint('nyc3.digitaloceanspaces.com'),
            signatureVersion: 'v4',
          }) 
        s3.upload({
            Bucket: 'chattr',
            Body: fs.createReadStream(image.map(x => x.filepath).toString()),
            ACL: 'public-read',
            ContentType: image.map(x => x.mimetype).toString(),
            ContentDisposition: 'inline',
            Key: `${req.cookies.accessCode}/${image.map(x => x.originalFilename)}`,
            CacheControl: 'max-age=31536000'
        }).send()
        url = `https://images.chattrbox.app/${req.cookies.accessCode}/${image.map(x => x.originalFilename).toString()}`
        await prisma.user.update({
            where: {
                id: req.cookies.accessCode
            },
            data: {
                image: url
            }
        })
    })
    
    res.send({
        url: url
    })
}
