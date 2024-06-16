import exp from "constants";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const port = process.env.PORT || 3000;

let turnos = [
  "B83",
  "A01",
  "D45",
  "C99",
  "B07",
  "D21",
  "A34",
  "C56",
  "B02",
  "D78",
  "C12",
  "B46",
  "A77",
  "D11",
  "C65",
  "B90",
  "A23",
  "D00",
  "C35",
];

let turnosAtendidos = [];

let puestos = [
  { num: 1, ocupado: false },
  { num: 2, ocupado: false },
  { num: 3, ocupado: false },
  { num: 4, ocupado: false },
  { num: 5, ocupado: false },
  { num: 6, ocupado: false },
  { num: 7, ocupado: false },
  { num: 8, ocupado: false },
  { num: 9, ocupado: false },
  { num: 10, ocupado: false },
];

let totalAtendidos = 0;

app.use(express.static("./public"));
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

const server = http.createServer(app);
const io = new Server(server);

server.listen(port, () => {
  console.log(`El server se inicio en el puero ${port}`);
});

io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  socket.emit("turnos", turnos);
  socket.emit("turnosAtendidos", turnosAtendidos);
  socket.emit("totalAtendidos", totalAtendidos);
  socket.emit("puestos", puestos);

  //El turno actual pasa a atendido
  socket.on("turnoAtendido", () => {
    turnosAtendidos.push(turnos[0]);
    turnos.shift();
    io.sockets.emit("turnos", turnos);
    io.sockets.emit("turnosAtendidos", turnosAtendidos);
    io.sockets.emit("totalAtendidos", totalAtendidos);
  });

  //Aumenta totalesAtendidos
  socket.on("totalAtendidos", () => {
    totalAtendidos++;
  });

  //Recibimos el puesto ocupado y lo pasamos a true
  socket.on("puestoOcupado", (data) => {
    const puestoOcupado = puestos.find((puesto) => puesto.num == data);
    puestoOcupado.ocupado = true;
    io.sockets.emit("puestos", puestos);
  });

  //Creamos un turno
  socket.on("crearTurno", () => {
    turnos.push("C01");
    io.sockets.emit("turnos", turnos);
    io.sockets.emit("turnosAtendidos", turnosAtendidos);
    io.sockets.emit("totalAtendidos", totalAtendidos);
  });

  //Actualizo los puestos a desocupados
  socket.on("actualizarPuestos", () => {
    puestos.forEach((puesto) => {
      puesto.ocupado = false;
      io.sockets.emit("puestos", puestos);
      console.log(puesto.ocupado);
    });
  });
});
