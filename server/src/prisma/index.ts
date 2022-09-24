import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

prisma
    .$connect()
    .then(() => console.log('Connected to DB'))
    .catch((err) => console.error(err));