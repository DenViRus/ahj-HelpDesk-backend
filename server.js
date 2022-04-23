const http = require("http");
const path = require("path");
const Ticket = require("./Ticket.js");
// // const fs = require("fs");
const Koa = require("koa");
const koaBody = require("koa-body");
// const koaStatic = require("koa-static");
const app = new Koa();

const tickets = [];

const ticket1 = new Ticket("Поменять краску в принтере, ком. 404", "Принтер HP LG 1210, картриджи на складе");
const ticket2 = new Ticket("Установить обновление KB-5555", "Вышло критическое обновление для Windows, нужно поставить обновления в следующем приоритете: 1. Сервера (не забыть сделать бэкап!) 2. Рабочие станции");
const ticket3 = new Ticket("Реализовать д/з ahj-http-HelpDesk", "Сделать прототип API для сервиса управления заявками");
const ticket4 = new Ticket("Реализовать д/з ahj-http-HelpDesk-frontend", "Написать фронтенд, который будет работать с готовым backend HelpDesk");
tickets.push(ticket1);
tickets.push(ticket2);
tickets.push(ticket3);
tickets.push(ticket4);

// // => Static file handling
// const public = path.join(__dirname, "/public");
// app.use(koaStatic(public));

// => CORS
app.use(async (ctx, next) => {
  const origin = ctx.request.get("Origin");
  if (!origin) {
    return await next();
  }

  const headers = { "Access-Control-Allow-Origin": "*" };

  if (ctx.request.method === "OPTIONS") {
    ctx.response.set({ ...headers });
  }

  if (ctx.request.method !== "OPTIONS") {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get("Access-Control-Request-Method")) {
    ctx.response.set({
      ...headers,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
    });

    if (ctx.request.get("Access-Control-Request-Headers")) {
      ctx.response.set("Access-Control-Allow-Headers", ctx.request.get("Access-Control-Request-Headers"));
    }

    ctx.response.status = 204;
  }
});

// => Body Parsers
app.use(
  koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
  })
);

// => GET/POST
app.use(async (ctx) => {
  const { method, id } = ctx.request.query;
  const { name, description, status } = ctx.request.body;
  switch (method) {
    case "allTickets":
      ctx.response.body = tickets.map((item) => {
        const ticket = {
          name: item.name,
          description: item.description,
          id: item.id,
          status: item.status,
          created: item.created,
        };
        return ticket;
      });
      break;
    case "ticketById":
      if (id) {
        const ticket = tickets.find((item) => item.id === id);
        if (ticket) {
          ctx.response.body = ticket;
        } else {
          ctx.response.status = 404;
        }
      }
      break;
    case "createTicket":
      const newTicket = new Ticket(name, description);
      tickets.push(newTicket);
      const ticket = tickets.find((item) => item.id === newTicket.id);
      if (ticket) {
        ctx.response.body = ticket;
      } else {
        ctx.response.status = 404;
      }
      break;
    case "removeById":
      if (id) {
        const ticket = tickets.find((item) => item.id === id);
        if (ticket) {
          const index = tickets.findIndex((item) => item.id === id);
          tickets.splice(index, 1);
          ctx.response.body = ticket;
        } else {
          ctx.response.status = 404;
        }
      }
      break;
    case "editTicket":
      if (id) {
        const ticket = tickets.find((item) => item.id === id);
        if (ticket) {
          ticket.name = name;
          ticket.description = description;
          ctx.response.body = ticket;
        } else {
          ctx.response.status = 404;
        }
      }
      break;
    case "checkTicket":
      if (id) {
        const ticket = tickets.find((item) => item.id === id);
        if (ticket) {
          ticket.status = status;
          ctx.response.body = ticket;
        } else {
          ctx.response.status = 404;
        }
      }
      break;
    default:
      ctx.response.status = 404;
      return;
  }
});
const server = http.createServer(app.callback());
const port = process.env.PORT || 7070;
server.listen(port, () => console.log("Server started!!"));
