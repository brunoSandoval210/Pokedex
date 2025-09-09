
import { loading, cardsContainer, limitSelect, searchForm, searchInput, cleanButton, paginationNext, paginationPrev } from './variables.js';
import { fetchPokemon, fetchPokemonList, fetchPokemonDetails } from './services.js';

let currentOffset = 0;
let currentLimit = 10;

function limpiarCards() {
    cardsContainer.querySelectorAll('.card-pokemon').forEach(card => card.remove());
    cardsContainer.querySelectorAll('.error-message').forEach(card => card.remove());
}

// Buscar Pokémon
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    limpiarCards();
    const valor = searchInput.value.trim();
    if (!valor) return;

    try {
        const pokemon = await fetchPokemon(valor);
        mostrarPokemon(pokemon);

        // deshabilitar paginación al buscar
        limitSelect.disabled = true;
        paginationNext.disabled = true;
        paginationPrev.disabled = true;
    } catch (error) {
        mostrarError("Pokémon no encontrado. Intenta de nuevo.");
    }
});

// Limpiar búsqueda
cleanButton.addEventListener('click', () => {
    searchInput.value = '';
    limpiarCards();
    limitSelect.disabled = false;
    paginationNext.disabled = false;
    paginationPrev.disabled = false;
    currentOffset = 0;
    cargarPokemones();
});

// Paginación
paginationNext.addEventListener('click', () => {
    currentOffset += currentLimit;
    cargarPokemones();
});

paginationPrev.addEventListener('click', () => {
    currentOffset = Math.max(0, currentOffset - currentLimit);
    cargarPokemones();
});

limitSelect.addEventListener('change', () => {
    currentLimit = parseInt(limitSelect.value) || 10;
    currentOffset = 0;
    cargarPokemones();
});

function mostrarError(msg) {
    const div = document.createElement('div');
    div.classList.add('error-message');
    div.textContent = msg;
    cardsContainer.appendChild(div);
}

// Cargar Pokémon con paginación
async function cargarPokemones() {

    loading.style.display = "block";
    limitSelect.disabled = true;
    paginationNext.disabled = true;
    paginationPrev.disabled = true;
    searchInput.disabled = true;

    limpiarCards();
    currentLimit = parseInt(limitSelect.value) || 10;

    try {
        const response = await fetchPokemonList(currentLimit, currentOffset);
        console.log(response);
        const pokemones = await fetchPokemonDetails(response.results);

        pokemones.sort((a, b) => a.id - b.id).forEach(mostrarPokemon);
        actualizarBotones(response);
    } catch (error) {
        mostrarError("Error al cargar la lista");
        console.error(error);
    } finally {
        loading.style.display = "none"; 
        limitSelect.disabled = false;
        paginationNext.disabled = false;
        paginationPrev.disabled = false;
        searchInput.disabled = false;
    }
}

function actualizarBotones(response) {
    paginationPrev.disabled = (response.previous == null);
    paginationNext.disabled = (response.next == null);
}

function mostrarPokemon(pokemon) {
    const tipos = pokemon.types.map(
        type => `<p class="${type.type.name} type">${type.type.name}</p>`
    ).join('');

    const id = pokemon.id.toString().padStart(3, '0');

    const img = getPokemonImage(pokemon);

    const div = document.createElement('div');
    div.classList.add('card-pokemon');
    div.innerHTML = `
        <p class="pokemon-id-black">#${id}</p>
        <div class="pokemon-image">
            <img src="${img}" alt="${pokemon.name}">
        </div>
        <div class="pokemon-info">
            <div class="name-container">
                <p class="pokemon-id">#${id}</p>
                <p class="pokemon-name">${pokemon.name}</p>
            </div>
            <div class="type-pokemon">${tipos}</div>
            <div class="pokemon-stats">
                <p class="stat">${pokemon.height}m</p>
                <p class="stat">${pokemon.weight}kg</p>
            </div>
        </div>
    `;
    cardsContainer.appendChild(div);
}

function getPokemonImage(pokemon) {
    return (
        pokemon.sprites.other?.dream_world?.front_default ??
        pokemon.sprites.other?.home?.front_default ??
        pokemon.sprites.other?.["official-artwork"]?.front_default ??
        pokemon.sprites.other?.showdown?.front_default ??
        pokemon.sprites.front_default // fallback final
    );
}


// Inicial
cargarPokemones();