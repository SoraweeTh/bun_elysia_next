import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const UserController = {
    list: async () => {
        return await prisma.user.findMany();
    },

    create: async ({body} : {
       body: {
        email: string,
        password: string,
       } 
    }) => {
        try {
            await prisma.user.create({
                data: body
            });
            return {message: "success"};
        } catch (err) {
            return err;
        }
    },
    update: async ({params, body}: {
        params: {
            id: string
        },
        body: {
            email: string,
            password: string
        }
    }) => {
        try {
            await prisma.user.update({
                where: {
                    id: parseInt(params.id)
                },
                data: body
            });
            return {message: "success"};
        } catch (err) {
            return err;
        }
    },
    remove: async ({params}: {
        params: {
            id: string
        }
    }) => {
        try {
            await prisma.user.delete({
                where: {
                    id: parseInt(params.id)
                }
            });
            return {message: "deleted success"};
        } catch (err) {
            return err;
        }
    },
    findSomeField: async () => {
        try {
            return await prisma.user.findMany({
                select: {
                    id: true,
                    credit: true,
                    level: true
                }
            });
        } catch (err) {
            return err;
        }
    },
    sort: async () => {
        try {
            return await prisma.user.findMany({
                orderBy: {
                    credit: "desc"
                }
            });
        } catch (err) {
            return err;
        }
    },
    filter: async () => {
        try {
            return await prisma.user.findMany({
                where: {
                    level: "user",
                    credit: {
                        gt: 199
                    }
                }
            });
        } catch (err) {
            return err;
        }
    },
    moreThan: async () => {
        try {
            return await prisma.user.findMany({
                where: {
                    credit: {gt: 100}
                }
            });
        } catch (err) {
            return err;
        }
    },
    lessThan: async () => {
        try {
            return await prisma.user.findMany({
                where: {
                    credit: {lt: 200}
                }
            });
        } catch (err) {
            return err;
        }
    },
    notEqual: async () => {
        try {
            return await prisma.user.findMany({
                where: {
                    credit: {not: 250}
                }
            });
        } catch (err) {
            return err;
        }
    },
    in: async () => {
        try {
            return await prisma.user.findMany({
                where: {
                    credit: {in: [100, 200]}
                }
            })
        } catch (err) {
            return err;
        }
    },
    isNull: async () => {
        try {
            return await prisma.user.findMany({
                where: {
                    credit: {equals: null}
                }
            });
        } catch (err) {
            return err;
        }
    },
    isNotNull: async () => {
        try {
            return await prisma.user.findMany({
                where: {
                    credit: {not: null}
                }
            });
        } catch (err) {
            return err;
        }
    },
    between: async () => {
        try {
            return await prisma.user.findMany({
                where: {
                    credit: {gte: 100, lte: 300}
                }
            });
        } catch (err) {
            return err;
        }
    },
    count: async () => {
        try {
            const total = await prisma.user.count();
            return { total };
        } catch (err) {
            return err;
        }
    },
    aggr: async () => {
        try {
            const result = await prisma.user.aggregate({
                _sum: {credit: true },
                _avg: {credit: true},
                _max: {credit: true},
                _min: {credit: true}
            });
            return {
                sum: result._sum.credit,
                avg: result._avg.credit,
                max: result._max.credit,
                min: result._min.credit
            };
        } catch (err) {
            return err;
        }
    },
    joinDepartment: async () => {
        try {
            const users = await prisma.user.findMany({
                include: {
                    department: true
                }
            });
            return users;
        } catch (err) {
            return err;
        }
    },

    signin: async ({body, jwt}: {
        body: {
            email: string, 
            password: string 
        },
        jwt: any
    }) => {
        try {
            const user = await prisma.user.findFirst({
                select: {
                    id: true,
                    email: true,
                    level: true
                },
                where: {
                    email: body.email,
                    password: body.password
                }
            });

            if (!user) {
                return { message: 'User not found' };
            }

            const token = await jwt.sign(user);
            return {token: token, user: user};
        } catch (err) {
            return err;
        }
    },

    info: async ({jwt, request}: {
        jwt: any,
        request: Request
    }) => {
        try {
            const token = request.headers.get('Authorization') ?? '';
            const payload = await jwt.verify(token);
            return { payload: payload }
        } catch (err) {
            return err;
        }
    }
}


