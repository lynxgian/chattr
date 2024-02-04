import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import AWS from 'aws-sdk'
export const prisma = new PrismaClient().$extends(withAccelerate())





 