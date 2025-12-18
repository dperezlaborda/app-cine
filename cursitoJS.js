const userSelecction = {
    movie: null,
    showTime: null,
    tickets: 0,
    seats: [],
};

let screeningRooms = [];
let moviesIds = [];
let showtimes = [];


async function fetchMoviesIds() {
    try {
        const response = await fetch('./json/moviesIds.json');
        const data = await response.json();
        moviesIds = data;
        return data;
    }catch (error) {
        console.error('Error fetching movies IDs:', error);
        return [];
    }
}

async function fetchShowTimes() {
    try {
        const response = await fetch('./json/showTimes.json');
        const data = await response.json();
        showtimes = data;
        return data;
    }catch(error) {
        console.error('Error fetching show times:', error);
        return [];
    }
}

async function fetchMovies(moviesIds) {
    try{
        const response = moviesIds.map((id) => 
            fetch(`https://api.imdbapi.dev/titles/${id}`).then((res) => {
                return res.json();
            })
        ) 

        const data = await Promise.all(response);
        return data;

    } catch (error) {
        const card = document.createElement("div");
        const name = document.createElement("h2");
        card.className = "card";
        name.innerText = "Falló el proceso";
        card.appendChild(name);
        document.body.appendChild(card);

        console.error('Error fetching movies:', error);
    }
}

function createBackButton(text, onClickCallback){
    const backBttn = document.createElement("button");
    backBttn.innerText = text;
    backBttn.classList.add("back-bttn");
    backBttn.onclick = onClickCallback;
    return backBttn;
}

function handleGoBack(){
    clearSelection();
    initHome();
}

async function initHome() {
    const loader = document.getElementById("loader");
    
    try {
        if(loader){
            loader.style.display = "block";
            loader.innerText = "Cargando películas...";
        }

        await fetchMoviesIds();
        await fetchShowTimes();

        const movies = await fetchMovies(moviesIds);
        showMoviesContainer(movies);
    } catch (error) {
        console.error('Error initializing home:', error);
        Swal.fire({
            title: 'Error',
            icon: 'error',
            text: 'Hubo un error al cargar las películas. Por favor, intente nuevamente más tarde.',
        });
    } finally {
        if(loader){
            loader.style.display = "none";
        }
    }
}

class ScreeningRoom  {
    constructor(id, movie, showTime, capacidad) {
        this.id = id;
        this.movie = movie;
        this.showTime = showTime;
        this.availableSeats = capacidad;
    }
}

function loadRoomsFromStorage() {
    try{
        screeningRooms = JSON.parse(localStorage.getItem('salas')) || [];
    }catch (error) {
        console.error('Error loading rooms from storage:', error);
        screeningRooms = [];
    }
}

function saveRoomsToStorage(rooms) {
    try{
        localStorage.setItem('salas', JSON.stringify(rooms));
    }catch (error) {
        console.error('Error saving rooms to storage:', error);
    }
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

function formatRuntime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function showMoviesContainer(moviesList) {
    const moviesContainer = document.getElementById("movies-container");
   
    moviesList.forEach(movie => {
            const movieCard = document.createElement("article");
            movieCard.classList.add("movie-card");

            const image = document.createElement("img");
            image.classList.add("movie-card-image");
            image.src = movie.primaryImage.url;
            image.alt = movie.primaryTitle

            const title = document.createElement("h3");
            title.innerText = movie.primaryTitle;

            const time = document.createElement("p");
            time.classList.add("movie-card-time");
            time.innerText = formatRuntime(movie.runtimeSeconds);

            const rating = document.createElement("p");
            rating.classList.add("movie-card-rating");
            rating.innerText = `⭐ ${movie.rating.aggregateRating}`;

            const buyBttn = document.createElement("button");
            buyBttn.innerText = "Seleccionar Película";
            buyBttn.classList.add("movie-card-bttn");

            buyBttn.onclick = () => {
                selectMovie(movie);
            };

            movieCard.appendChild(image);
            movieCard.appendChild(title);
            movieCard.appendChild(time);
            movieCard.appendChild(rating);
            movieCard.appendChild(buyBttn);
            moviesContainer.appendChild(movieCard);
    });
}

function selectMovie(movie) {

    const selectedMovie = document.getElementById("selectedObject");
    selectedMovie.classList.add("selected-movie");
    userSelecction.movie = movie.primaryTitle;

    const backBttn = createBackButton("← Volver a Películas", () => handleGoBack());
    selectedMovie.appendChild(backBttn);

    const title = document.createElement("h3");
    title.classList.add("selected-movie-title");
    title.innerText = `Película seleccionada: ${movie.primaryTitle}`;

    const infoContainer = document.createElement("div");
    infoContainer.classList.add("selected-movie-info-container");

    const plot = document.createElement("p");
    plot.classList.add("selected-movie-plot");
    plot.innerText = `Sinopsis: ${movie.plot}`;

    const directors = document.createElement("p");
    directors.classList.add("selected-movie-directors");
    directors.innerText =  `Dirigida por: ${movie.directors.map(director => director.displayName).join(', ')}`;

    infoContainer.appendChild(plot);
    infoContainer.appendChild(directors);

    const starsContainer = document.createElement("div");
    starsContainer.classList.add("stars-container");

    movie.stars.forEach(star => {

        const starContainer = document.createElement("div");
        starContainer.classList.add("star-container");

        const starImg = document.createElement("img");
        const starName = document.createElement("p");

        starImg.src = star.primaryImage.url;
        starImg.alt = star.displayName;
        starImg.classList.add("star-image");

        starName.innerText = star.displayName;
        starName.classList.add("star-name");

        starContainer.appendChild(starImg);
        starContainer.appendChild(starName);

        starsContainer.appendChild(starContainer);
    })

    selectedMovie.appendChild(title)
    selectedMovie.appendChild(infoContainer);
    selectedMovie.appendChild(starsContainer);

    hideElements();
    showSchedule();
}

function showSchedule() {
    const selectedShowTime= document.getElementById("selectedShowTime");
    selectedShowTime.classList.add("selected-showtime");

    const showTimeTitle = document.createElement("h2");
    showTimeTitle.innerText = "Horarios:";
    showTimeTitle.classList.add("showtime-title");
    selectedShowTime.appendChild(showTimeTitle);
    
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
    title.classList.add("seats-card-title");

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
                Toastify({
                    text: "Debe seleccionar al menos una butaca para continuar.",
                    duration: 3000,
                    gravity: "top",
                    style: {
                        background: "linear-gradient(to right, #4a9eff, #2a6bb6ff)" 
                    }
                }).showToast();
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
    try{
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

        hideElements();

        Swal.fire({
            title: '¡Compra Confirmada!',
            html: `
                <p>Película: <strong>${userSelecction.movie}</strong></p>
                <p>Horario: <strong>${userSelecction.showTime}</strong></p>
                <p>Butacas: <strong>${userSelecction.seats.join(', ')}</strong></p>
                <p>Total: <strong>${seatsCount} entrada(s)</strong></p>
                `,
            icon: 'success',
            confirmButtonText: 'Realizar otra compra',
            confirmButtonColor: '#4a9eff',
            background: '#23211E',
            color: '#fff',
            backdrop: `
                    rgba(0, 0, 0, 0.6)
                    url(https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXR3bmo1czZtZzlybjJuaWh0OHV3MTlrYW9jbWtlaWg2Y2J6a2FlZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/k3CEWZju4vkkBJkDxi/giphy.gif)
                    right 20px top 20px / 200px 200px
                    no-repeat
                `
            }).then((result) => {
                if (result.isConfirmed) {
                    clearSelection();
                    showPreviousPurchase();
                    initHome();
                }
            });
    }catch (error) {
        console.error('Error completing purchase:', error);
    }
    
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
        const selectedObject = document.getElementById("selectedObject");
        selectedObject.innerHTML = '';
        
    }

    if(userSelecction.tickets > 0){
        const selectedSeats = document.getElementById("selectedSeats");
        selectedSeats.innerHTML = '';
    }

}

function showPreviousPurchase() {
    try{
        const storedPurchases = JSON.parse(localStorage.getItem('compras')) || [];
        if (storedPurchases.length > 0) {
            const lastPurchase = storedPurchases[storedPurchases.length - 1];
    
            Toastify({
                text: `Última compra: ${lastPurchase.tickets} entradas para "${lastPurchase.movie}" a las ${lastPurchase.showTime}.`,
                duration: 4000,
                gravity: "top",
                close: true,
                style: {
                    background: "linear-gradient(to right, #4a9eff, #2a6bb6ff)",
                    borderRadius: "8px",
                }
            }).showToast();
        }
    }catch (error) {
        console.error('Error showing previous purchase:', error);
    }
}


window.addEventListener('DOMContentLoaded', () => {
    initHome();
    loadRoomsFromStorage();
    showPreviousPurchase();
});



