import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

export async function POST(event) {
    const playerId = event.locals.user.playerId;
    const projectKey = event.locals.user.projectKey;

    if (!projectKey || !playerId) {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Project key or player id not provided",
                },
            })
        );
    }

    const project = await prisma.project.findUnique({
        where: { projectKey },
    });

    if (!project) {
        return new Response(
            JSON.stringify({
                statusCode: 404,
                error: {
                    message: "Project not found",
                },
            }),
            { status: 404 }
        );
    }

    const player = await prisma.player.findUnique({
        where: {
            playerId,
            projectId: project.id,
        },
    });

    if (!player) {
        return new Response(
            JSON.stringify({
                statusCode: 404,
                error: {
                    message: "Player not found",
                },
            })
        );
    }

    const activeSession = await prisma.playerSession.findFirst({
        where: {
            playerId: player.id,
            projectId: project.id,
            endTime: null,
        },
    });

    if (activeSession) {
        return new Response(
            JSON.stringify({
                statusCode: 400,
                error: {
                    message: "Session already active",
                },
            })
        );
    }

    await prisma.playerSession.create({
        data: {
            playerId: player.id,
            projectId: project.id,
            startTime: new Date(),
        },
    });

    return new Response(
        JSON.stringify({
            statusCode: 200,
            data: { message: "Session Started" },
        })
    );
}
