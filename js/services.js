const BASE_URL = "https://pokeapi.co/api/v2/pokemon";


export async function fetchPokemon(name) {
    const url = `${BASE_URL}/${name.toLowerCase()}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Pokémon no encontrado");
    }
    return res.json();
}

export async function fetchPokemonList(limit = 10, offset = 0) {
    const url = `${BASE_URL}?limit=${limit}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Error al cargar la lista");
    }
    console.log(res);
    return res.json();
}

export async function fetchPokemonDetails(results) {
    try {
        const promises = results.map(item => {
            if (!item.url) {
                throw new Error("Elemento sin URL en results");
            }
            return fetch(item.url).then(res => {
                if (!res.ok) throw new Error(`Error al cargar ${item.url}`);
                return res.json();
            });
        });
        return Promise.all(promises);
    } catch (error) {
        console.error("Error en fetchPokemonDetails:", error);
        throw error;
    }
}
