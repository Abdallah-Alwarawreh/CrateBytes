import { relations } from "drizzle-orm/relations";
import {
    userTable,
    accountTable,
    projectTable,
    leaderboardTable,
    leaderboardentryTable,
    playerTable,
    playercustomdataTable,
    playersessionTable,
    sessionTable,
} from "./schema";

export const accountRelations = relations(accountTable, ({ one }) => ({
    user: one(userTable, {
        fields: [accountTable.userId],
        references: [userTable.id],
    }),
}));

export const userRelations = relations(userTable, ({ many }) => ({
    accounts: many(accountTable),
    projects: many(projectTable),
    sessions: many(sessionTable),
}));

export const leaderboardRelations = relations(
    leaderboardTable,
    ({ one, many }) => ({
        project: one(projectTable, {
            fields: [leaderboardTable.projectId],
            references: [projectTable.id],
        }),
        leaderboardentries: many(leaderboardentryTable),
    })
);

export const projectRelations = relations(projectTable, ({ one, many }) => ({
    leaderboards: many(leaderboardTable),
    players: many(playerTable),
    playersessions: many(playersessionTable),
    user: one(userTable, {
        fields: [projectTable.ownerId],
        references: [userTable.id],
    }),
}));

export const leaderboardentryRelations = relations(
    leaderboardentryTable,
    ({ one }) => ({
        leaderboard: one(leaderboardTable, {
            fields: [leaderboardentryTable.leaderboardId],
            references: [leaderboardTable.id],
        }),
        player: one(playerTable, {
            fields: [leaderboardentryTable.playerId],
            references: [playerTable.id],
        }),
    })
);

export const playerRelations = relations(playerTable, ({ one, many }) => ({
    leaderboardentries: many(leaderboardentryTable),
    project: one(projectTable, {
        fields: [playerTable.projectId],
        references: [projectTable.id],
    }),
    playercustomdata: many(playercustomdataTable),
    playersessions: many(playersessionTable),
}));

export const playercustomdataRelations = relations(
    playercustomdataTable,
    ({ one }) => ({
        player: one(playerTable, {
            fields: [playercustomdataTable.playerId],
            references: [playerTable.id],
        }),
    })
);

export const playersessionRelations = relations(
    playersessionTable,
    ({ one }) => ({
        player: one(playerTable, {
            fields: [playersessionTable.playerId],
            references: [playerTable.id],
        }),
        project: one(projectTable, {
            fields: [playersessionTable.projectId],
            references: [projectTable.id],
        }),
    })
);

export const sessionRelations = relations(sessionTable, ({ one }) => ({
    user: one(userTable, {
        fields: [sessionTable.userId],
        references: [userTable.id],
    }),
}));
