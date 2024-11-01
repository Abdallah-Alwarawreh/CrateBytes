import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "../../../../drizzle.js";

export async function GET({ params, url }) {
    const { id } = params;
    const page = url.searchParams.get("page") || "1";

    const leaderboard = await prisma.leaderboard.findUnique({
        where: { id },
        select: { id: true, name: true, description: true },
    });

    if (!leaderboard) {
        return new Response(
            JSON.stringify({
                status: 404,
                error: "Leaderboard not found",
                data: {},
            }),
            { status: 404 }
        );
    }

    const pageNumber = parseInt(page, 10);
    const startIndex = pageNumber === 0 ? 0 : (pageNumber - 1) * 10;

    const entries = await prisma.leaderboardEntry.findMany({
        where: { leaderboardId: id },
        select: {
            player: {
                select: {
                    guest: true,
                    playerId: true,
                    PlayerCustomData: {
                        select: { data: true },
                    },
                },
            },
            score: true,
        },
        orderBy: { score: "desc" },
        skip: startIndex,
        take: 10,
    });

    const totalEntries = await prisma.leaderboardEntry.count({
        where: { leaderboardId: id },
    });

    const formattedEntries = entries.map((entry) => ({
        ...entry,
        player: {
            playerId: entry.player.playerId,
            guest: entry.player.guest,
            entryData: entry.player.PlayerCustomData[0] || null,
        },
    }));

    return new Response(
        JSON.stringify({
            status: 200,
            error: null,
            data: {
                leaderboard,
                entries: formattedEntries,
                totalEntries,
                pages: Math.ceil(totalEntries / 10),
            },
        }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }
    );
}
