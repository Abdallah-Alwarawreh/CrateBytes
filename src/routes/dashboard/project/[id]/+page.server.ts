import { redirect } from "@sveltejs/kit";
import { prisma } from "../../../../drizzle";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, locals, url }) => {
    const session = await locals.auth();

    if (!session) {
        throw redirect(302, "/login");
    }

    if (!params.id) {
        throw redirect(302, "/dashboard");
    }

    const project = await prisma.project.findUnique({
        where: {
            id: params.id,
            ownerId: session.user?.id,
        },
        include: {
            owner: true,
        },
    });

    if (!project) {
        throw redirect(302, "/dashboard");
    }

    redirect(302, url.href + "/analytics");

    // return {
    //     project: {
    //         id: project.id,
    //         name: project.name,
    //         description: project.description,
    //     },
    //     owner: {
    //         name: project.owner.name,
    //         image: project.owner.image,
    //     },
    // };
}) satisfies PageServerLoad;
