import type { RequestHandler } from "@sveltejs/kit";
import { db } from "../../../../../drizzle.js";
import {
    playersessionTable,
    playerTable,
    projectTable,
} from "../../../../../db/schema.js";
import { and, eq, isNull } from "drizzle-orm";

export async function POST(event) {
    const playerId = event.locals.user.playerId;
    const projectKey = event.locals.user.projectKey;

    if (!projectKey || !playerId) {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Project key or player id not provided",
                data: {},
            }),
            { status: 400 }
        );
    }

    const projects = await db
        .select()
        .from(projectTable)
        .where(eq(projectTable.projectKey, projectKey));

    if (!projects[0]) {
        return new Response(
            JSON.stringify({
                status: 404,
                error: "Project not found",
                data: {},
            }),
            { status: 404 }
        );
    }

    const project = projects[0];

    const players = await db
        .select()
        .from(playerTable)
        .where(
            and(
                eq(playerTable.playerId, playerId),
                eq(playerTable.projectId, project.id!)
            )
        );

    if (!players[0]) {
        return new Response(
            JSON.stringify({
                status: 404,
                error: "Player not found",
                data: {},
            }),
            { status: 404 }
        );
    }

    const player = players[0];

    const activeSessions = await db
        .select()
        .from(playersessionTable)
        .where(
            and(
                eq(playersessionTable.playerId, player.id!),
                eq(playersessionTable.projectId, project.id!),
                isNull(playersessionTable.endTime)
            )
        );

    if (activeSessions[0]) {
        return new Response(
            JSON.stringify({
                status: 400,
                error: "Session already active",
                data: {},
            }),
            { status: 400 }
        );
    }

    await db.insert(playersessionTable).values({
        playerId: player.id,
        projectId: project.id,
        startTime: new Date(),
    });

    await prisma.playerSession.create({
        data: {
            playerId: player.id,
            projectId: project.id,
            startTime: new Date(),
        },
    });

    return new Response(
        JSON.stringify({
            status: 201,
            error: null,
            data: { message: "Session Started" },
        }),
        { status: 201 }
    );
}
