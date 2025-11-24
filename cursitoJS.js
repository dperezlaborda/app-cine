const movies = [
    {
        title: "El Viaje de Chihiro",
        image: "https://www.themoviedb.org/t/p/w1280/laXrmaTRuroArSPfsGlvTbeWxVA.jpg"
    },
    {
        title: "El Señor de los Anillos",
        image: "https://www.themoviedb.org/t/p/w1280/z632eZtXaw76ZE5mMMGOBXCpm1T.jpg"
    },
    {
        title: "El Padrino",
        image: "https://www.themoviedb.org/t/p/w1280/ApiEfzSkrqS4m1L5a2GwWXzIiAs.jpg"
    },
    {
        title: "Drácula",
        image: "https://www.themoviedb.org/t/p/w1280/ff7fyDdtXM2wu9jsm9gOMYtpvOl.jpg"
    },
    {
        title: "Superman",
        image: "https://www.themoviedb.org/t/p/w1280/fvUJb08yatV2b3NUSwuYdQKYoFd.jpg"
    },
    {
        title: "Depredador",
        image: "https://www.themoviedb.org/t/p/w1280/jl5Y5p2pbhgRwREWbll2RbciG5Z.jpg"
    }
];

const showtimes = [
    "12:00",
    "15:00",
    "18:00",
    "19:00",
]

const userSelecction = {
    movie: null,
    showTime: null,
    tickets: 0,
    seats: [],
};

let screeningRooms = [];

class ScreeningRoom  {
    constructor(id, movie, showTime, capacidad) {
        this.id = id;
        this.movie = movie;
        this.showTime = showTime;
        this.availableSeats = capacidad;
    }
}

function loadRoomsFromStorage() {
    screeningRooms = JSON.parse(localStorage.getItem('salas')) || [];
}

function saveRoomsToStorage(rooms) {
    localStorage.setItem('salas', JSON.stringify(rooms));
}

function createScreeningRoom(movie, showTime) {
    let room = screeningRooms.find(room => room.movie === movie && room.showTime === showTime);
    if (!room) {
        const newId = screeningRooms.length + 1;
        room = new ScreeningRoom (newId, movie, showTime, 8);
        screeningRooms.push(room);
        saveRoomsToStorage(screeningRooms)
    }
    return room;
}

function showMoviesContainer() {
   const moviesContainer = document.getElementById("movies-container");
   
   movies.forEach(movie => {
       const movieCard = document.createElement("article");
       movieCard.classList.add("movie-card");

       const image = document.createElement("img");
       image.classList.add("movie-card-image");
       image.src = movie.image;
       image.alt = movie.title

       const title = document.createElement("h3");
       title.innerText = movie.title;

       const buyBttn = document.createElement("button");
       buyBttn.innerText = "Seleccionar Película";
       buyBttn.classList.add("movie-card-bttn");

       buyBttn.onclick = () => {
           selectMovie(movie.title);
       };

       movieCard.appendChild(image);
       movieCard.appendChild(title);
       movieCard.appendChild(buyBttn);
       moviesContainer.appendChild(movieCard);
   });
}

function selectMovie(movie) {
    const selectedMovie = document.getElementById("selectedObject");
    selectedMovie.classList.add("selected-movie");
    userSelecction.movie = movie;

    const title = document.createElement("h3");
    title.innerText = `Película seleccionada: ${movie}`;

    selectedMovie.appendChild(title)

    hideElements();
    showSchedule();
}

function showSchedule() {
    const selectedShowTime= document.getElementById("selectedShowTime");
    selectedShowTime.classList.add("selected-showtime");
    
    showtimes.forEach(showTime => {
        const scheduleCard = document.createElement("div");
        scheduleCard.classList.add("showtime-card");

        const title = document.createElement("h3");
        title.innerText = showTime;

        const selectBttn = document.createElement("button");
        selectBttn.innerText = "Seleccionar";
        selectBttn.classList.add("select-horario-bttn");

        selectBttn.onclick = () => {
            selectSchedule(showTime);
        }

        scheduleCard.appendChild(title);
        scheduleCard.appendChild(selectBttn);
        selectedShowTime.appendChild(scheduleCard);
    });
};

function selectSchedule(showTime) {
    const selectedSchedule = document.getElementById("selectedObject");
    userSelecction.showTime = showTime;

    const title = document.createElement("h3");
    title.innerText = `Horario seleccionado: ${showTime}`;
    selectedSchedule.appendChild(title);

    hideElements();
    selectSeats();
}

function selectSeats() {
    const selectedSeatsContainer = document.getElementById("selectedSeats");
    
    const seatsCard = document.createElement("div");
    seatsCard.classList.add("seats-card");

    const title = document.createElement("h3");
    title.innerText = "Selección de Butacas";

    const currentRoom = createScreeningRoom(userSelecction.movie, userSelecction.showTime);

    seatsCard.appendChild(title);
    selectedSeatsContainer.appendChild(seatsCard);

    showGridSeats(seatsCard, currentRoom);
};

function showGridSeats(container, currentRoom) {
    const gridContainer = document.createElement("div");
    gridContainer.classList.add("grid-seats-container");

    const info = document.createElement("p");
    info.innerText = `Seleccione la cantidad de butacas, disponibles: ${currentRoom.availableSeats}`;
    
    const selectedSeats = [];

    if (currentRoom.availableSeats > 0) {
        for (let i = 1; i <= currentRoom.availableSeats; i++) {
            const seatBttn = document.createElement("button");
            seatBttn.classList.add("seat-bttn");
            seatBttn.innerText = i;

            seatBttn.onclick = () => {
                const index = selectedSeats.indexOf(i);
            
                if (index === -1){
                    selectedSeats.push(i);
                    seatBttn.classList.add("selected-seat");
                } else {
                    selectedSeats.splice(index, 1);
                    seatBttn.classList.remove("selected-seat");
                }
            }

            gridContainer.appendChild(seatBttn);
        }

        const confirmBttn = document.createElement("button");
        confirmBttn.innerText = "Confirmar Compra";
        confirmBttn.classList.add("confirm-bttn");

        confirmBttn.onclick = () => {
            if (selectedSeats.length > 0) {
                userSelecction.tickets = selectedSeats.length;
                userSelecction.seats = selectedSeats;
                completePurchase(selectedSeats.length);
            }else{
                alert("Debe seleccionar al menos 1 butaca");
            }
        }

        container.appendChild(info);
        container.appendChild(gridContainer);
        container.appendChild(confirmBttn);
    }else{
        const noSeats = document.createElement("p");
        noSeats.innerText = "No hay butacas disponibles para este horario.";
        container.appendChild(noSeats);
    }
}

function completePurchase(seatsCount) {
    userSelecction.tickets = seatsCount;

    const currentRoom = createScreeningRoom(userSelecction.movie, userSelecction.showTime);
    currentRoom.availableSeats -= seatsCount;
    saveRoomsToStorage(screeningRooms)

    const newPurchase = {
        movie: userSelecction.movie,
        showTime: userSelecction.showTime,
        tickets: userSelecction.tickets,
        seats: userSelecction.seats
    };

    const store = JSON.parse(localStorage.getItem('compras')) || [];
    store.push(newPurchase);
    localStorage.setItem('compras', JSON.stringify(store));

    const title = document.createElement("h3");
    title.innerText = `Compra confirmada para pelicula ${userSelecction.movie} en el horario ${userSelecction.showTime} por ${seatsCount} butacas. ¡Gracias por su compra!`;

    const buyAgainBttn = document.createElement("button");
    buyAgainBttn.innerText = "Realizar otra compra";
    buyAgainBttn.classList.add("buy-again-bttn");
    buyAgainBttn.onclick = () => {
        clearSelection();
        showMoviesContainer();
    }

    selectedObject.appendChild(title);
    selectedObject.appendChild(buyAgainBttn);
    hideElements();
}

function clearSelection(){
    userSelecction.movie = null;
    userSelecction.showTime = null;
    userSelecction.tickets = 0;
    userSelecction.seats = [];

    document.getElementById("selectedObject").innerHTML = '';
    document.getElementById("selectedShowTime").innerHTML = '';
    document.getElementById("selectedSeats").innerHTML = '';
    document.getElementById("movies-container").innerHTML = '';
}

function hideElements() {
    if(userSelecction.movie){
        const moviesContainer = document.getElementById("movies-container");
        moviesContainer.innerHTML = '';
    }

    if(userSelecction.showTime){
        const selectedSchedule = document.getElementById("selectedShowTime");
        selectedSchedule.innerHTML = '';
    }

    if(userSelecction.tickets > 0){
        const selectedSeats = document.getElementById("selectedSeats");
        selectedSeats.innerHTML = '';
    }

}

function showPreviousPurchase() {
    const lastPurchaseDiv = document.getElementById("lastPurchase");
    const storedPurchases = JSON.parse(localStorage.getItem('compras')) || [];
    if (storedPurchases.length > 0) {
        const lastPurchase = storedPurchases[storedPurchases.length - 1];
        lastPurchaseDiv.innerHTML = `<h3>Última compra: ${lastPurchase.tickets} entradas para "${lastPurchase.movie}" a las ${lastPurchase.showTime}.</h3>`;
    }else {
        lastPurchaseDiv.innerHTML = `<h3>No hay compras realizadas aún.</h3>`;
    }
}


window.addEventListener('DOMContentLoaded', () => {
    loadRoomsFromStorage();
    showPreviousPurchase();
    showMoviesContainer();
});



