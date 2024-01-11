import * as db from "$lib/util/hr/db/mysql";

export async function load() {
    try {
        let q = {
            fields: ['*'],
            alias: null,
            from: 'job',
            where: null,
            groupBy: null,
            having: null,
            orderBy: null
        }

        return db.get(q);
    } catch (error) {
        console.error('Got an Error!!!');
        console.log(error);
        return error;
    }
}

export const actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id');
        queryDelete(id);
    }
}

function queryDelete(id) {
    let q = {
        from: 'Job',
        where: `Job_ID = ${id}`,
    };
    db.del(q);
}