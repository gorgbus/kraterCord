import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { Storage } from "@google-cloud/storage";
import { config } from "dotenv";
import { nanoid } from 'nanoid';
config();

const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT,
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY
    }
})

const bucket = storage.bucket(process.env.GCS_BUCKET!);

export const createGuildController = async (req: Request, res: Response) => {
    const { id: userId } = req.user as { id: string };
    const file = req.file;
    const name = req.body.serverName;

    return res.status(500);

    if (!name) return res.status(500);

    try {
        if (file) {
            const newFileName = `${Date.now()}-${req.file?.originalname}`;
            const blob = bucket.file(newFileName);
            const blobStream = blob.createWriteStream()

            blobStream.on("error", err => {
                console.error(err);

                res.status(500).send({ msg: 'Failed to upload icon' });
            });

            blobStream.on("finish", async () => {
                const url = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`;

                const guild = await prisma.guild.create({
                    data: {
                        avatar: url,
                        name,
                        users: { connect: { id: userId } },
                        owner: { connect: { id: userId } },
                        members: {
                            create: {
                                user: { connect: { id: userId } }
                            }
                        },
                        channels: {
                            create: [
                                {
                                    name: 'obecné',
                                    type: 'TEXT',
                                },
                                {
                                    name: 'hlasový kanál',
                                    type: 'VOICE'
                                }
                            ]
                        }
                    },
                    include: {
                        channels: true
                    }
                });

                const updatedGuild = await prisma.guild.update({
                    where: {
                        id: guild.id
                    },
                    data: {
                        redirectChannel: { connect: { id: guild.channels[0].id } }
                    }
                });

                if (!guild || !updatedGuild) return res.status(500).send({ msg: 'Guild not found' });

                res.status(200).send({ guild });
            })

            blobStream.end(req.file?.buffer);

            return;
        }

        const guild = await prisma.guild.create({
            data: {
                avatar: 'none',
                name,
                users: { connect: { id: userId } },
                owner: { connect: { id: userId } },
                members: {
                    create: {
                        user: { connect: { id: userId } }
                    }
                },
                channels: {
                    create: [
                        {
                            name: 'obecné',
                            type: 'TEXT',
                        },
                        {
                            name: 'hlasový kanál',
                            type: 'VOICE'
                        }
                    ]
                }
            },
            include: {
                channels: true
            }
        });

        const updatedGuild = await prisma.guild.update({
            where: {
                id: guild.id
            },
            data: {
                redirectChannel: { connect: { id: guild.channels[0].id } }
            }
        });

        if (!guild || !updatedGuild) return res.status(500).send({ msg: 'Guild not found' });

        return res.status(200).send({ guild: updatedGuild });
    } catch (err) {
        console.error(err);

        return res.status(500);
    }
}

export const joinGuildController = async (req: Request, res: Response) => {
    const { id: userId } = req.user as { id: string };
    const { id } = req.params;

    if (!id || !userId) return res.status(500);

    try {
        const invite = await prisma.invite.findUnique({
            where: {
                code: id
            }
        });

        if (!invite) return res.status(500).send({ msg: 'Invite not found' });

        const guild = await prisma.guild.findUnique({
            where: {
                id: invite.guildId
            }
        });

        if (!guild) return res.status(500).send({ msg: 'Guild not found' });

        const updatedGuild = await prisma.guild.update({
            where: {
                id: guild.id
            },
            data: {
                users: { connect: { id: userId } }
            }
        });

        const member = await prisma.member.create({
            data: {
                guild: { connect: { id: invite.guildId } },
                user: { connect: { id: userId } }
            }
        });

        if (!member) return res.status(500).send({ msg: 'Member not found' });

        return res.status(200).send({ guild: updatedGuild });
    } catch (err) {
        console.error(err);

        return res.status(500);
    }
}

export const getGuildMembersController = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) return res.status(500);

    try {
        const members = await prisma.member.findMany({
            where: {
                guildId: id
            },
            include: {
                user: true
            }
        });

        if (!members) return res.status(500).send({ msg: 'Members not found' });

        return res.status(200).send({ members });
    } catch (err) {
        console.error(err);

        return res.status(500);
    }
}

export const getGuildInviteCOntroller = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) return res.status(500);

    try {
        const invite = await prisma.invite.findFirst({
            where: {
                guildId: id
            }
        });

        if (invite) return res.status(200).send({ invite: invite.code });

        const newInvite = await prisma.invite.create({
            data: {
                code: nanoid(6),
                guild: { connect: { id } },
                valid: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
            }
        });

        if (!newInvite) return res.status(500).send({ msg: 'Invite not found' });

        return res.status(200).send({ invite: newInvite.code });
    } catch (err) {
        console.error(err);

        return res.status(500);
    }
}