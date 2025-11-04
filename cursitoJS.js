const peliculas = [
    "El Viaje de Chihiro",
    "El Señor de los Anillos",
    "El Padrino",
    "Interstellar",
    "Superman",
    "Superman II",
]

const horarios = [
    "12:00",
    "15:00",
    "18:00",
    "19:00",
]

let asientosSeleccionados = [];
let asientosBloqueados = [];
let cantidadEntradas = 0;
let total = 0;

function elegirPelicula() {
    let pelicula = prompt("Elija una pelicula: \n" + peliculas.join("\n"));
    while(!peliculas.includes(pelicula)) {
        pelicula = prompt("Pelicula no disponible. Elija una pelicula: \n" + peliculas.join("\n"));
    }
    return pelicula;
}

function elegirHorario() {
    let horario = prompt("Elija un horario: \n" + horarios.join("\n"));
    while(!horarios.includes(horario)) {
        horario = prompt("Horario no disponible. Elija un horario: \n" + horarios.join("\n"));
    }
    return horario;
}

function elegirCantidadEntradas() {
    cantidadEntradas = parseInt(prompt("¿Cuántas entradas desea comprar? (1-5): "));
    while(cantidadEntradas < 1 || cantidadEntradas > 5 || isNaN(cantidadEntradas)) {
        cantidadEntradas = parseInt(prompt("Cantidad inválida. ¿Cuántas entradas desea comprar? (1-5): "));
    }
    return cantidadEntradas;
}

function elegirAsiento() {
    //TO-DO: VALIDAR QUE EL ASIENTO SE GUARDE EN ARRAY POR PELICULA Y HORARIO
    let asientosOcupados = [];

    for(let i = 0; i < cantidadEntradas; i++) {
        let asiento = parseInt(prompt("Seleccione sus asientos (1-100): "));

        while(asiento < 1 || asiento > 100 || isNaN(asiento)) {
            asiento = parseInt(prompt("Asiento inválido. Seleccione sus asientos (1-100): "));
        }

        while(asientosBloqueados.includes(asiento)) {
            asiento = parseInt(prompt(`El asiento ${asiento} ya está ocupado. Seleccione otro asiento (1-100): `));
        }

        while(asientosOcupados.includes(asiento)) {
            asiento = parseInt(prompt(`El asiento ${asiento} ya está ocupado. Seleccione otro asiento (1-100): `));
        }

        asientosOcupados.push(asiento);

    }
    return asientosOcupados;

}

function mostrarResumen(pelicula, horario, cantidad, asientos) {
    let total = cantidad * 5500;
    console.log("Resumen de su compra:");
    console.log("Pelicula: " + pelicula);
    console.log("Horario: " + horario);
    console.log("Cantidad de entradas: " + cantidad);
    console.log("Asientos: " + asientos);
    console.log("Total a pagar: $" + total);

    const modificacion = prompt("¿Desea modificar su compra? (si/no): ").toLowerCase();
    const quiereModificar = modificacion === "si";

    if(quiereModificar) {
        console.log('Se modificará la compra.');
        comprarEntradas();
    }else {
        console.log('no entra?');
        asientosBloqueados = asientosBloqueados.concat(asientos);
        console.log('Asientos bloqueados: ' + asientosBloqueados);
        const resumen = `Compra confirmada:\nPelicula: ${pelicula}\nHorario: ${horario}\nCantidad de entradas: ${cantidad}\nAsientos: ${asientos}\nTotal a pagar: $${total}\n¡Disfrute la película!`;
        console.log(resumen);
    }
}

function comprarEntradas() {
    const peliculaSeleccionada = elegirPelicula();
    const horarioSeleccionado = elegirHorario();
    const cantidadEntradas = elegirCantidadEntradas();
    const asientosSeleccionados = elegirAsiento();

    const resumen = mostrarResumen(peliculaSeleccionada, horarioSeleccionado, cantidadEntradas, asientosSeleccionados);
    return resumen;
}