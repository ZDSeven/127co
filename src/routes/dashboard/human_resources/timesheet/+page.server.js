import * as db from "$lib/db/mysql";

export async function load() {
    try {
        let q = {
            fields: ['*'],
            alias: null,
            from: 'timesheet',
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
        from: 'Timesheet',
        where: `Timesheet_ID = ${id}`,
    };
    db.del(q);
}