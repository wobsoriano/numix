import PrismaClientPkg from '@prisma/client'

const PrismaClient = PrismaClientPkg.PrismaClient

const prisma = new PrismaClient()

export {
  prisma,
}
