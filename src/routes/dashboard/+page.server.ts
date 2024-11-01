import { fail, redirect, type Actions } from "@sveltejs/kit";
import { db } from "../../drizzle";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { createProjectSchema, deleteProjectSchema } from "../../schema";
import { getPosts } from "$lib/utils";
import {
    leaderboardentryTable,
    leaderboardTable,
    playerTable,
    projectTable,
} from "../../db/schema";
import { desc, eq } from "drizzle-orm";

export const load = (async ({ parent }) => {
    const { session } = await parent();

    if (!session) {
        throw redirect(302, "/login");
    }

    if (!session.user?.id) {
        throw redirect(302, "/login");
    }

    const Projects = await db
        .select()
        .from(projectTable)
        .where(eq(projectTable.ownerId, session.user.id))
        .orderBy(desc(projectTable.createdAt));

    // TODO: pull from database
    const { posts } = await getPosts(0);

    return {
        Projects: Projects.map((project) => ({
            id: project.id,
            name: project.name,
            description: project.description,
        })),
        News: posts,
        CreateProjectForm: await superValidate(zod(createProjectSchema)),
        DeleteProjectForm: await superValidate(zod(deleteProjectSchema)),
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    CreateProject: async (event) => {
        const CreateProjectForm = await superValidate(
            event,
            zod(createProjectSchema)
        );

        const session = await event.locals.auth();
        if (!session) {
            return fail(401, {
                CreateProjectForm,
            });
        }

        if (!CreateProjectForm.valid) {
            return fail(400, {
                CreateProjectForm,
            });
        }

        if (!session.user?.id) {
            return fail(401, {
                CreateProjectForm,
            });
        }

        await db
            .insert(projectTable)
            .values({
                name: CreateProjectForm.data.name,
                description: CreateProjectForm.data.description,
                ownerId: session.user.id,
                projectKey: createProjectKey(session.user.id),
            })
            .$returningId();

        const project = await db
            .select({ id: projectTable.id })
            .from(projectTable)
            .where(eq(projectTable.ownerId, session.user.id))
            .orderBy(desc(projectTable.createdAt))
            .limit(1);

        if (!project) {
            return fail(500, {
                CreateProjectForm,
            });
        }

        return {
            CreateProjectForm,
            projectId: project[0].id,
        };
    },
    DeleteProject: async (event) => {
        const DeleteProjectForm = await superValidate(
            event,
            zod(deleteProjectSchema)
        );

        const session = await event.locals.auth();
        if (!session) {
            return fail(401, {
                DeleteProjectForm,
            });
        }

        if (!DeleteProjectForm.valid) {
            return fail(400, {
                DeleteProjectForm,
            });
        }

        await db
            .delete(projectTable)
            .where(eq(projectTable.id, DeleteProjectForm.data.ProjectId));

        return {
            DeleteProjectForm,
        };
    },
};

function randomString(length: number) {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        .split("")
        .sort(() => Math.random() - 0.5)
        .slice(0, length)
        .join("");
}

function createProjectKey(userId: string) {
    return `${userId}-${randomString(16)}`;
}
