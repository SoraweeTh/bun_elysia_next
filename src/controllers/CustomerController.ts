export default {
    list: () => {
        const customers = [
            {id: 1, name: "John", email: "John@test.com"},
            {id: 2, name: "Jane", email: "Jane@test.com"},
            {id: 3, name: "Bob", email: "Bob@test.com"},
        ]
        return customers
    },
    create: ({body}: {
        body : {
            id: number,
            name: string,
            email: string
        }
    }) => {
        return body;
    },
    update: ({body, params}: {
        body: {
            name: string,
            email: string
        },
        params: {
            id: number
        }
    }) => {
        return {body: body, id: params.id};
    },
    remove: ({params}: {
        params: {
            id: number
        }
    }) => {
        return {id: params.id};
    }
}