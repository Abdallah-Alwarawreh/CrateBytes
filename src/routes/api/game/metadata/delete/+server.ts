import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../../prisma.js";

export async function DELETE({ locals, params, request }) {
    const playerId = locals.user.playerId;
    const projectKey = locals.user.projectKey;

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
        where: {
            projectKey,
        },
        select: {
            id: true,
        },
    });

    if (!project) {
        return new Response(
            JSON.stringify({
                statusCode: 404,
                error: {
                    message: "Project not found",
                },
            })
        );
    }

    await prisma.playerCustomData.delete({
        where: {
            playerId_projectId: {
                playerId,
                projectId: project.id,
            },
        },
    });

    return new Response(
        JSON.stringify({
            statusCode: 200,
            data: { message: "Deleted" },
        })
    );
}
