import {
    mysqlTable,
    mysqlSchema,
    index,
    foreignKey,
    primaryKey,
    unique,
    varchar,
    text,
    int,
    datetime,
    tinyint,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { cuid2 } from "drizzle-cuid2/mysql";

export const accountTable = mysqlTable(
    "account",
    {
        id: cuid2("id").defaultRandom(),
        userId: varchar({ length: 512 })
            .notNull()
            .references(() => userTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        type: varchar({ length: 512 }).notNull(),
        provider: varchar({ length: 512 }).notNull(),
        providerAccountId: varchar({ length: 512 }).notNull(),
        refreshToken: text("refresh_token"),
        accessToken: text("access_token"),
        expiresAt: int("expires_at"),
        tokenType: varchar("token_type", { length: 512 }),
        scope: varchar({ length: 512 }),
        idToken: text("id_token"),
        sessionState: varchar("session_state", { length: 512 }),
        refreshTokenExpiresIn: int("refresh_token_expires_in"),
        createdAt: datetime({ mode: "string", fsp: 3 })
            .default(sql`(CURRENT_TIMESTAMP(3))`)
            .notNull(),
        updatedAt: datetime({ mode: "string", fsp: 3 })
            .notNull()
            .$onUpdate(() => new Date().toISOString()),
    },
    (table) => {
        return {
            accountUserIdIdx: index("Account_userId_idx").on(table.userId),
            accountId: primaryKey({ columns: [table.id], name: "account_id" }),
            accountIdKey: unique("Account_id_key").on(table.id),
            accountUserIdKey: unique("Account_userId_key").on(table.userId),
            accountProviderProviderAccountIdKey: unique(
                "Account_provider_providerAccountId_key"
            ).on(table.provider, table.providerAccountId),
        };
    }
);

export const leaderboardTable = mysqlTable(
    "leaderboard",
    {
        id: cuid2("id").defaultRandom(),
        projectId: varchar({ length: 512 })
            .notNull()
            .references(() => projectTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        name: varchar({ length: 512 }).notNull(),
        description: varchar({ length: 512 }),
        createdAt: datetime({ mode: "string", fsp: 3 })
            .default(sql`(CURRENT_TIMESTAMP(3))`)
            .notNull(),
        updatedAt: datetime({ mode: "string", fsp: 3 })
            .notNull()
            .$onUpdate(() => new Date().toISOString()),
    },
    (table) => {
        return {
            leaderboardId: primaryKey({
                columns: [table.id],
                name: "leaderboard_id",
            }),
            leaderboardIdKey: unique("Leaderboard_id_key").on(table.id),
        };
    }
);

export const leaderboardentryTable = mysqlTable(
    "leaderboardentry",
    {
        id: cuid2("id").defaultRandom(),
        playerId: varchar({ length: 512 })
            .notNull()
            .references(() => playerTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        leaderboardId: varchar({ length: 512 })
            .notNull()
            .references(() => leaderboardTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        score: int().notNull(),
        createdAt: datetime({ mode: "string", fsp: 3 })
            .default(sql`(CURRENT_TIMESTAMP(3))`)
            .notNull(),
        updatedAt: datetime({ mode: "string", fsp: 3 })
            .notNull()
            .$onUpdate(() => new Date().toISOString()),
    },
    (table) => {
        return {
            leaderboardentryId: primaryKey({
                columns: [table.id],
                name: "leaderboardentry_id",
            }),
            leaderboardEntryIdKey: unique("LeaderboardEntry_id_key").on(
                table.id
            ),
            leaderboardEntryPlayerIdLeaderboardIdKey: unique(
                "LeaderboardEntry_playerId_leaderboardId_key"
            ).on(table.playerId, table.leaderboardId),
        };
    }
);

export const playerTable = mysqlTable(
    "player",
    {
        id: cuid2("id").defaultRandom(),
        playerId: varchar({ length: 512 }).notNull(),
        guest: tinyint().notNull(),
        playTime: int().notNull(),
        projectId: varchar({ length: 512 })
            .notNull()
            .references(() => projectTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        lastPlayed: datetime({ mode: "string", fsp: 3 }).notNull(),
        createdAt: datetime({ mode: "string", fsp: 3 })
            .default(sql`(CURRENT_TIMESTAMP(3))`)
            .notNull(),
        updatedAt: datetime({ mode: "string", fsp: 3 })
            .notNull()
            .$onUpdate(() => new Date().toISOString()),
    },
    (table) => {
        return {
            playerId: primaryKey({ columns: [table.id], name: "player_id" }),
            playerIdKey: unique("Player_id_key").on(table.id),
            playerPlayerIdKey: unique("Player_playerId_key").on(table.playerId),
        };
    }
);

export const playercustomdataTable = mysqlTable(
    "playercustomdata",
    {
        id: cuid2("id").defaultRandom(),
        playerId: varchar({ length: 512 })
            .notNull()
            .references(() => playerTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        projectId: varchar({ length: 512 }).notNull(),
        data: varchar({ length: 255 }).notNull(),
        createdAt: datetime({ mode: "string", fsp: 3 })
            .default(sql`(CURRENT_TIMESTAMP(3))`)
            .notNull(),
        updatedAt: datetime({ mode: "string", fsp: 3 })
            .notNull()
            .$onUpdate(() => new Date().toISOString()),
    },
    (table) => {
        return {
            playercustomdataId: primaryKey({
                columns: [table.id],
                name: "playercustomdata_id",
            }),
            playerCustomDataIdKey: unique("PlayerCustomData_id_key").on(
                table.id
            ),
            playerCustomDataPlayerIdKey: unique(
                "PlayerCustomData_playerId_key"
            ).on(table.playerId),
            playerCustomDataPlayerIdProjectIdKey: unique(
                "PlayerCustomData_playerId_projectId_key"
            ).on(table.playerId, table.projectId),
        };
    }
);

export const playersessionTable = mysqlTable(
    "playersession",
    {
        id: cuid2("id").defaultRandom(),
        playerId: varchar({ length: 512 })
            .notNull()
            .references(() => playerTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        projectId: varchar({ length: 512 })
            .notNull()
            .references(() => projectTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        startTime: datetime({ mode: "string", fsp: 3 })
            .default(sql`(CURRENT_TIMESTAMP(3))`)
            .notNull(),
        endTime: datetime({ mode: "string", fsp: 3 }),
        lastHeartbeat: datetime({ mode: "string", fsp: 3 }),
        createdAt: datetime({ mode: "string", fsp: 3 })
            .default(sql`(CURRENT_TIMESTAMP(3))`)
            .notNull(),
        updatedAt: datetime({ mode: "string", fsp: 3 })
            .notNull()
            .$onUpdate(() => new Date().toISOString()),
    },
    (table) => {
        return {
            playersessionId: primaryKey({
                columns: [table.id],
                name: "playersession_id",
            }),
            playerSessionIdKey: unique("PlayerSession_id_key").on(table.id),
            playerSessionPlayerIdProjectIdStartTimeKey: unique(
                "PlayerSession_playerId_projectId_startTime_key"
            ).on(table.playerId, table.projectId, table.startTime),
        };
    }
);

export const projectTable = mysqlTable(
    "project",
    {
        id: cuid2("id").defaultRandom(),
        name: varchar({ length: 50 }).notNull(),
        description: varchar({ length: 255 }),
        ownerId: varchar({ length: 512 })
            .notNull()
            .references(() => userTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        projectKey: varchar({ length: 512 }).notNull(),
        steamPublisherKey: varchar({ length: 50 }),
        steamAppId: int(),
        createdAt: datetime({ mode: "string", fsp: 3 })
            .default(sql`(CURRENT_TIMESTAMP(3))`)
            .notNull(),
        updatedAt: datetime({ mode: "string", fsp: 3 })
            .notNull()
            .$onUpdate(() => new Date().toISOString()),
    },
    (table) => {
        return {
            projectId: primaryKey({ columns: [table.id], name: "project_id" }),
            projectIdKey: unique("Project_id_key").on(table.id),
            projectProjectKeyKey: unique("Project_projectKey_key").on(
                table.projectKey
            ),
        };
    }
);

export const sessionTable = mysqlTable(
    "session",
    {
        id: cuid2("id").defaultRandom(),
        sessionToken: varchar({ length: 512 }).notNull(),
        userId: varchar({ length: 512 })
            .notNull()
            .references(() => userTable.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        expires: datetime({ mode: "string", fsp: 3 }).notNull(),
        createdAt: datetime({ mode: "string", fsp: 3 })
            .default(sql`(CURRENT_TIMESTAMP(3))`)
            .notNull(),
        updatedAt: datetime({ mode: "string", fsp: 3 })
            .notNull()
            .$onUpdate(() => new Date().toISOString()),
    },
    (table) => {
        return {
            sessionUserIdIdx: index("Session_userId_idx").on(table.userId),
            sessionId: primaryKey({ columns: [table.id], name: "session_id" }),
            sessionIdKey: unique("Session_id_key").on(table.id),
            sessionSessionTokenKey: unique("Session_sessionToken_key").on(
                table.sessionToken
            ),
        };
    }
);

export const userTable = mysqlTable(
    "user",
    {
        id: cuid2("id").defaultRandom(),
        name: varchar({ length: 512 }),
        username: varchar({ length: 512 }),
        email: varchar({ length: 512 }),
        emailVerified: datetime({ mode: "string", fsp: 3 }),
        image: varchar({ length: 512 }),
        createdAt: datetime({ mode: "string", fsp: 3 })
            .default(sql`(CURRENT_TIMESTAMP(3))`)
            .notNull(),
        updatedAt: datetime({ mode: "string", fsp: 3 })
            .notNull()
            .$onUpdate(() => new Date().toISOString()),
    },
    (table) => {
        return {
            userId: primaryKey({ columns: [table.id], name: "user_id" }),
            userIdKey: unique("User_id_key").on(table.id),
            userUsernameKey: unique("User_username_key").on(table.username),
            userEmailKey: unique("User_email_key").on(table.email),
        };
    }
);

export const verificationtokenTable = mysqlTable(
    "verificationtoken",
    {
        identifier: varchar({ length: 512 }).notNull(),
        token: varchar({ length: 512 }).notNull(),
        expires: datetime({ mode: "string", fsp: 3 }).notNull(),
    },
    (table) => {
        return {
            verificationTokenIdentifierTokenKey: unique(
                "VerificationToken_identifier_token_key"
            ).on(table.identifier, table.token),
        };
    }
);
