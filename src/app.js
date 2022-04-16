var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
  clients: {},
  reset: function reset() {
    this.clients = {};
  },
  addAppointment: function addAppointment(client, date) {
    date.status = "pending";
    this.clients[client]
      ? this.clients[client].push(date)
      : (this.clients[client] = [date]);
    return date;
  },
  attend: function attend(client, date) {
    let app;
    if (this.clients[client]) {
      this.clients[client].forEach((c) => {
        if (c.date === date) {
          c.status = "attended";
          app = c;
        }
      });
    }
    return app;
  },
  expire: function expire(client, date) {
    let app;
    if (this.clients[client]) {
      this.clients[client].forEach((c) => {
        if (c.date === date) {
          c.status = "expired";
          app = c;
        }
      });
    }
    return app;
  },
  cancel: function cancel(client, date) {
    let app;
    if (this.clients[client]) {
      this.clients[client].forEach((c) => {
        if (c.date === date) {
          c.status = "cancelled";
          app = c;
        }
      });
    }
    return app;
  },
  erase: function erase(client, condition) {
    if (["pending", "attended", "expired", "cancelled"].includes(condition)) {
      let eleminated = this.clients[client].filter(
        (e) => e.status === condition
      );
      this.clients[client] = this.clients[client].filter(
        (e) => e.status !== condition
      );
      return eleminated;
    } else if (condition.includes("/")) {
      let eleminated = this.clients[client].filter(
        (e) => e.status === condition
      );
      this.clients[client] = this.clients[client].filter(
        (e) => e.date !== condition
      );
      return eleminated;
    }
  },
  getAppointments: function getAppointments(client, status) {
    if (!status) {
      return this.clients[client];
    }
    return this.clients[client].filter((e) => e.status === status);
  },
  getClients: function () {
    return Object.keys(this.clients);
  },
};

server.use(bodyParser.json());

server.get("/api", (req, res) => {
  res.send(model.clients);
});

server.post("/api/Appointments", (req, res) => {
  const { client, appointment } = req.body;
  if (!client) {
    return res.status(400).send("the body must have a client property");
  }
  if (typeof client !== "string") {
    return res.status(400).send("client must be a string");
  }
  const data = model.addAppointment(client, appointment);
  res.send(data);
});

server.get("/api/Appointments/:name", (req, res) => {
  const { name } = req.params;
  const { date, option } = req.query;
  if (!model.getClients().includes(name)) {
    return res.status(400).send("the client does not exist");
  }
  const clientAppointment = model.getAppointments(name);
  const existAppointment = clientAppointment.filter((e) => e.date === date);
  if (existAppointment.length === 0) {
    return res
      .status(400)
      .send("the client does not have a appointment for that date");
  }

  if (!["attend", "expire", "cancel"].includes(option)) {
    return res.status(400).send("the option must be attend, expire or cancel");
  }

  let data;
  option === "attend"
    ? (data = model.attend(name, date))
    : option === "expire"
    ? (data = model.expire(name, date))
    : option === "cancel"
    ? (data = model.cancel(name, date))
    : null;
  res.send(data);
});

server.get("/api/Appointments/:name/erase", (req, res) => {
  const { name } = req.params;
  const { date } = req.query;
  if (!model.getClients().includes(name)) {
    return res.status(400).send("the client does not exist");
  }
  if (name && date) {
    let eleminate = model.erase(name, date);
    return res.status(200).json(eleminate);
  }
});

server.get("/api/Appointments/getAppointments/:name", (req, res) => {
  const { name } = req.params;
  const { status } = req.query;
  return res.send(model.getAppointments(name, status));
});

server.get('/api/Appointments/clients', (req, res) => {        
    let data = model.getClients()
    res.status(200).send(data)
});

server.listen(3000);

module.exports = { model, server };
