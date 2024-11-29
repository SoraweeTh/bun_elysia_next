import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DepartmentController = {
    list: async () => {
        return await prisma.department.findMany({
            include: {
                users: true
            }
        }
        );
    },
    create: async ({body}: {
        body: {
            name: string
        }
    }) => {
        try {
            await prisma.department.create({
                data: body
            });
            return {message: "success"};
        } catch (err) {
            return err;
        }
    },

    userInDepartment: async ({params}: {
        params: {
            id: string
        }
    }) => {
        try {
            const users = await prisma.department.findMany({
                where: {
                    id: parseInt(params.id)
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            email: true,
                            password: false,
                            credit: true,
                            level: true
                        },
                        where: {
                            level: "admin"
                        }
                    }
                },
                orderBy: {
                    id: "asc"
                }
            });
            return {users: users}
        } catch (err) {
            return err;
        }
    },

    createDepartmentAndUsers: async ({body}: {
        body: {
            department: {
                name: string
            },
            users: {
                email: string,
                password: string
            }[]
        }
    }) => {
        try {
            const department = await prisma.department.create({
                data: {
                    name: body.department.name
                }
            });
            await prisma.user.createMany({
                data: body.users.map((user) => ({
                    email: user.email,
                    password: user.password,
                    departmentId: department.id
                }))
            });
            return {message: "success"}
        } catch (err) {
            return err;
        }
    },

    countUsersInDepartment: async () => {
        try {
            const count = await prisma.department.findMany({
                select: {
                    id: true,
                    name: true,
                    _count: {
                        select: {
                            users: true
                        }
                    }
                }
            });
            return {department: count};
        } catch (err) {
            return err;
        }
    }
}