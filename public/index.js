let socket = io();

const turnoNumero = document.querySelector(".turno-numero");
const turnoTexto = document.querySelector(".turno-texto");
const puesto = document.querySelector(".puesto");
const turnosEspera = document.querySelector(".turnos-espera");
const turnosAtendidos = document.querySelector(".turnos-atendidos");
const totalAtendidos = document.querySelector(".total-atendidos");
const botonSiguienteTurno = document.querySelector("#siguiente-turno");
const botonCrearTurno = document.querySelector("#crear-turno");
const botonActualizarPuestos = document.querySelector("#actualizar-puesto");

let puestoDisponible;

//Genera numeros aleatorios del 1 al 5
const numerosAleatorio = () => {
  const num = Math.floor(Math.random() * 5) + 1;
  return num;
};

//Creo los turnos en base a si son de espera o atendidos
const crearTurnos = (turno, tipoTurno) => {
  const turnoDiv = document.createElement("div");

  if (!turno) {
    turnoDiv.innerHTML = `<p class="turno-texto-espera">No hay turnos</p>`;
  } else {
    turnoDiv.innerHTML = `<p class="turno-texto-espera">Turno</p>
                        <p class="turno-numero-espera${numerosAleatorio()}">${turno}</p>`;
  }

  if (tipoTurno == "espera") {
    turnoDiv.setAttribute("class", "turno-espera");
    turnosEspera.appendChild(turnoDiv);
  } else {
    turnoDiv.setAttribute("class", "turno-espera");
    turnosAtendidos.appendChild(turnoDiv);
  }
};

//Agarro el primer turno del array y lo pongo como el turno actual y los siguientes 3 en espera
const turnoActual = (turnos) => {
  turnosEspera.innerHTML = "";

  if (!turnos[0]) {
    turnoNumero.textContent = "";
    turnoTexto.textContent = "Sin turnos";
    puesto.textContent = "";
  } else {
    turnoNumero.textContent = turnos[0];
    turnoNumero.setAttribute("class", `turno-numero${numerosAleatorio()}`);
    socket.emit("totalAtendidos");
  }

  crearTurnos(turnos[1], "espera");
  crearTurnos(turnos[2], "espera");
  crearTurnos(turnos[3], "espera");
};

//Le asigna un puesto al turno actual, revisa cual puesto esta desocupado y se lo da
const asignarPuesto = (puestos) => {
  puestoDisponible = puestos.find((puesto) => puesto.ocupado == false);
  if (!puestoDisponible) {
    puesto.textContent = `Espere a que se desocupe un puesto`;
  } else {
    puesto.textContent = `Puesto: ${puestoDisponible.num}`;
  }
};

//Mostramos los turnos atendidos
socket.on("turnosAtendidos", (data) => {
  turnosAtendidos.innerHTML = "";
  data.slice(-3).forEach((turno) => crearTurnos(turno, "atendido"));
});

//Le asignamos un puesto al turno actual
socket.on("puestos", (puestos) => {
  asignarPuesto(puestos);
});

//Mostramos el total de atendidos
socket.on("totalAtendidos", (total) => {
  totalAtendidos.textContent = `Total atendidos: ${total}`;
});

//Una vez atienden al turno actual, pasamos al siguiente, ponemos como ocupado el puesto donde lo atienden y sumamos un atendido mas
const siguienteTurno = (turnos, turnosAtendidos) => {
  //Dejamos la opcion de pasar a siguiente turno incluso si no hay puestos disponibles
  if (puestoDisponible) {
    socket.emit("puestoOcupado", puestoDisponible.num);
  }

  socket.emit("turnoAtendido");
};

//Añadimos el evento a un boton
botonSiguienteTurno.addEventListener("click", siguienteTurno);

socket.on("turnos", (turnos) => {
  turnoActual(turnos);
});

//Creamos un turno
botonCrearTurno.addEventListener("click", () => {
  socket.emit("crearTurno");
});

//Actualizamos los puestos a desocupados
botonActualizarPuestos.addEventListener("click", () => {
  socket.emit("actualizarPuestos");
});
