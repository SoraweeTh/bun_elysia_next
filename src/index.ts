import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";

import CustomerController from "./controllers/CustomerController";      // not much popular
import { UserController } from "./controllers/UserController";          // most popular
import { DepartmentController } from "./controllers/DepartmentController";

const checkSignIn = async ({jwt, request, set} : any) => {
  const token = request.headers.get('Authorization') ?? '';
  if (!token) {
    set.status = 401;
    return 'Unauthorized';
  }

  const payload = await jwt.verify(token);
  if (!payload) {
    set.status = 401;
    return 'Unauthorized';
  }
}

const app = new Elysia()
.use(cors())              // Cross Origin Request Security : to create API and allow front-end or mobile app to connect
.use(staticPlugin())      // static file : to create API with some resources such as file of image, video, document, excel, txt ...
.use(swagger({
  documentation: {
    tags: [
      { name: "User", description: "User related endpoint" },
      { name: "Customer", description: "Customer related endpoint" },
      { name: "Department", description: "Department related endpoint" }
    ]
  }
}))                       // API client 
.use(jwt({
  name: "jwt",
  secret: "S3cr3t",
}))

.group("/users", (app) => app
  .get("/", UserController.list, {tags: ["User"]})
  .post("/", UserController.create, {tags: ["User"]})
  .put("/:id", UserController.update, {tags: ["User"]})
  .delete("/:id", UserController.remove, {tags: ["User"]})
  .get("/some-field", UserController.findSomeField, {tags: ["User"]})
  .get("/sort", UserController.sort, {tags: ["User"]})
  .get("/filter", UserController.filter, {tags: ["User"]})
  .get("/more-than", UserController.moreThan, {tags: ["User"]})
  .get("/less-than", UserController.lessThan, {tags: ["User"]})
  .get("/not-equal", UserController.notEqual, {tags: ["User"]})
  .get("/in", UserController.in, {tags: ["User"]})
  .get("/is-null", UserController.isNull, {tags: ["User"]})
  .get("/is-not-null", UserController.isNotNull, {tags: ["User"]})
  .get("/between", UserController.between, {tags: ["User"]})
  .get("/count", UserController.count, {tags: ["User"]})
  .get("/sum", UserController.aggr, {tags: ["User"]})
  .get("/user-and-department", UserController.joinDepartment, {tags: ["User"]})
  .post("/sign-in", UserController.signin, {tags: ["User"]})
  .get('/info', UserController.info, {tags: ["User"], beforeHandle: checkSignIn})
)

.group("/department", app => app 
  .get("/", DepartmentController.list, {tags: ["Department"]})
  .post("/", DepartmentController.create, {tags: ["Department"]})
  .get("/user-in-department/:id", DepartmentController.userInDepartment, {tags: ["Department"]})
  .post("/create-department-and-user", DepartmentController.createDepartmentAndUsers, {tags: ["Department"]})
  .get("/count-users-in-department", DepartmentController.countUsersInDepartment, {tags: ["Department"]})
)

.group('/customers', app => app 
  .get("/", CustomerController.list, {tags: ["Customer"]})
  .post("/", CustomerController.create, {tags: ["Customer"]})
  .put("/:id", CustomerController.update, {tags: ["Customer"]})
  .delete("/:id", CustomerController.remove, {tags: ["Customer"]})
)



.post("/login", async ({jwt, cookie: {auth}}) => {
  const user = {
    id: 1,
    name: "Vee",
    username: "Veecop",
    level: "admin"
  }

  const token = await jwt.sign(user);
  auth.set({
    value: token,
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/profile'
  })
  return {token: token};
})

.get("/profile", ({jwt, cookie: {auth}}) => {
  const user = jwt.verify(auth.value);
  return user;
})

.get("/logout", ({cookie: {auth}}) => {
  auth.remove();
  return {message: "Logged out successful"};
})

.get("/info", async ({jwt, request}) => {
  if (request.headers.get("Authorization") === null) {
    return {message: "No authorization header"};
  }

  const token = request.headers.get("Authorization") ?? "";
  if (token === "") {
    return {message: "No token"};
  }

  const payload = await jwt.verify(token);
  return {
    message: "Hello Elysia",
    payload: payload
  };
})

.get("/", () => "Hello Elysia")
.get("/hello", () => "Hello World!")

// get with params
.get("/hello/:name", ({params}) => `Hello ${params.name}`)

// get multiple params
.get("hello/:name/:age", ({params}) => {
  const name = params.name;
  const age = params.age;
  return `Hello ${name}, you are ${age} years old.`
})

.get("/customers", () => {
  const customers = [
    {name: "John", age: 20},
    {name: "Jane", age: 25},
    {name: "Mike", age: 22},
    {name: "Wilt", age: 24},
  ];
  return customers
})

// get customer by id
.get("/customers/:id", ({params}) => {
  const customers = [
    {id: 1, name: "John", age: 20},
    {id: 2, name: "Jane", age: 25},
    {id: 3, name: "Mike", age: 22},
    {id: 4, name: "Wilt", age: 24},
  ];
  const customer = customers.find((customer) => customer.id === Number(params.id));
  if (!customer) {
    return "Customer not found";
  }
  return customer;
})

// return with query
.get("/customers/query", ({query}) => {
  const name = query.name;
  const age = query.age;
  return `query: ${name} ${age}`;
})

// response with http status
.get("/customers/status", () => {
  return new Response("Hello world!", {status: 200});
})

// create
.post("/customers/create", ({body} : {body: any}) => {
  // console.log(body);
  const name = body.name;
  const age = body.age;
  return `body: ${name} ${age}`;
})

// update
.put("/customers/update/:id", ({params, body} : {params: any; body: any}) => {
  const id = params.id;
  const name = body.name;
  const age = body.age;
  return `params: ${id}  body: ${name} ${age}`;
})

.put("/customers/updateAll/:id", ({params, body} : {
  params: {id: string};
  body: {name: string; age: number};
}) => {
  const id = params.id;
  const name = body.name;
  const age = body.age;
  return `params: ${id}  body: ${name} ${age}`;
})

.delete("/customers/delete/:id", ({params} : {params: any}) => {
  const id = params.id;
  return `params: ${id}`;
})



// upload file
.post("/upload-file", ({body}: {body: {file: File}}) => {
  const file = body.file;
  console.log(file);
  Bun.write('uploads/' + file.name, file);
  return {message: "File uploaded"};
})

// write file
.get("/write-file", () => {
  Bun.write('demo.txt', 'Hello World!');
  return {message: "File written"};
})

// read file
.get("/read-file", () => {
  const file = Bun.file('demo.txt');
  return file.text();
})

// port
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
