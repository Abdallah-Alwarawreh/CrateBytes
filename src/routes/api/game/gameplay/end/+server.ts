import type { RequestHandler } from "@sveltejs/kit";
import { db } from "../../../../../drizzle.js";
import {
    playersessionTable,
    playerTable,
    projectTable,
} from "../../../../../db/schema.js";
import { and, eq, isNull } from "drizzle-orm";

const EXPIRATION_TIME_MS = 10 * 60 * 1000;

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

    if (!activeSessions[0]) {
        return new Response(
            JSON.stringify({
                status: 404,
                error: "No active session found",
                data: {},
            }),
            { status: 404 }
        );
    }

    const activeSession = activeSessions[0];

    const currentTime = new Date();
    let sessionEndTime = currentTime;

    if (activeSession.lastHeartbeat) {
        const lastHeartbeatTime = new Date(
            activeSession.lastHeartbeat
        ).getTime();
        const timeSinceLastHeartbeat =
            currentTime.getTime() - lastHeartbeatTime;

        if (timeSinceLastHeartbeat > EXPIRATION_TIME_MS) {
            sessionEndTime = new Date(lastHeartbeatTime + EXPIRATION_TIME_MS);
        }
    }

    const sessionStartTime = new Date(activeSession.startTime);
    const sessionDuration =
        (sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000;

    await db
        .update(playersessionTable)
        .set({
            endTime: sessionEndTime.toISOString(),
        })
        .where(eq(playersessionTable.id, activeSession.id!));

    await db
        .update(playerTable)
        .set({
            playTime: player.playTime + Math.floor(sessionDuration),
        })
        .where(eq(playerTable.id, player.id!));

    return new Response(
        JSON.stringify({
            status: 200,
            error: null,
            data: { message: "Session ended successfully", sessionDuration },
        }),
        { status: 200 }
    );
}
