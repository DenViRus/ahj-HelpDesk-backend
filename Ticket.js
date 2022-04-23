// const fs = require("fs");
const uuid = require("uuid");

class Ticket {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.id = uuid.v4();
    this.status = false;
    this.created = new Date().toLocaleString();
  }
}
module.exports = Ticket;
