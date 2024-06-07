let curremPage = 1;
let totalPage = 0;
let itemsPerPage = 12;
const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
    
};

document.getElementById('search-button').addEventListener('click', () => {
    const search = document.getElementById('search').value.trim().toLowerCase();
    const searchType = document.getElementById('search-type').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';

    if (!search) {
        errorMessage.textContent = 'Por favor, ingrese un nombre o ID de Pokémon.';
        return;
    }

    if (searchType === 'id' && !/^\d+$/.test(search)) {
        errorMessage.textContent = 'Por favor, ingrese solo números para la búsqueda por ID.';
        return;
    }

    if (searchType === 'name' && !/^[a-z]+$/.test(search)) {
        errorMessage.textContent = 'Por favor, ingrese solo letras para la búsqueda por nombre.';
        return;
    }

    const url = `https://pokeapi.co/api/v2/pokemon/${search}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Pokemon no encontrado');
            }
            return response.json();
        })
        .then(data => {
            const pokemon = document.getElementById('pokemon');
            pokemon.innerHTML = `
                <h2>${data.name}</h2>
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif" alt="${data.name}">
                <p>Altura: ${data.height}</p>
                <p>Peso: ${data.weight}</p>
            `;
        })
        .catch(error => {
            console.error(error);
            document.getElementById('pokemon').innerHTML = '<p>Pokemon no encontrado</p>';
        });
});

async function mostrarPokem() {
    const offset = (curremPage - 1) * itemsPerPage;
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${itemsPerPage}`;
    try {
        const response = await fetch(url);
        const responseJson = await response.json();
        const pokemonList = document.getElementById('pokemon-list');
        
        pokemonList.innerHTML = ''; 
        
        totalPage = Math.ceil(responseJson.count / itemsPerPage);

        responseJson.results.forEach(pokemon => {
            fetch(pokemon.url)
                .then(response => response.json())
                .then(data => {
                    const pokemonDiv = document.createElement('div');
                    pokemonDiv.className = 'pokemon-container';
                    const types = data.types.map(typeInfo => typeInfo.type.name);

                    const typesHtml = types.map(type => {
                        const color = typeColors[type] || '#777'; 
                        return `<span class="pokemon-type" style="background-color: ${color};">${type}</span>`;
                    }).join(' ');

                    pokemonDiv.innerHTML = `
                        <div class="lista_contenedor">
                        <h3>ID: ${data.id}</h3>
                            <h3>${data.name.toUpperCase()}</h3>
                            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif" alt="${data.name}">
                            <div>${typesHtml}</div>
                        </div>
                    `;
                    
                    pokemonDiv.addEventListener('click', () => {
                        mostrarPokemonDetalle(data);
                    });

                    pokemonList.appendChild(pokemonDiv);
                });
        });

        document.getElementById('pageInfo').textContent = `Página ${curremPage} of ${totalPage}`;
    } catch (error) {
        console.error(error);
    }
}

document.getElementById('previous-button').addEventListener('click', () => {
    if (curremPage > 1) {
        curremPage--;
        mostrarPokem();
    }
});
document.getElementById('next-button').addEventListener('click', () => {
    if (curremPage < totalPage) {
        curremPage++;
        mostrarPokem();
    }
})
function mostrarPokemonDetalle(data) {
    const pokemon = document.getElementById('pokemon');
    pokemon.innerHTML = `
        <h2>${data.name.toUpperCase()}</h2>
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif" alt="${data.name}">
        <p>Altura: ${data.height}</p>
        <p>Peso: ${data.weight}</p>
        <p>Habilidades: ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
        <div id="evolutions"></div>
    `;
    document.getElementById('pokemon-list').style.display = 'none';
    document.getElementById('back-button').style.display = 'block';
    

    fetch(data.species.url)
        .then(response => response.json())
        .then(speciesData => {
            fetch(speciesData.evolution_chain.url)
                .then(response => response.json())
                .then(evolutionData => {
                    mostrarEvoluciones(evolutionData.chain, data.name);
                });
        });
}

function mostrarEvoluciones(chain, currentName) {
    const evolutionsDiv = document.getElementById('evolutions');
    evolutionsDiv.innerHTML = `<h3>Evoluciones</h3>`;
    agregarEvolucion(chain, currentName, evolutionsDiv);
}

function agregarEvolucion(evolution, currentName, evolutionsDiv) {
    const name = evolution.species.name;

    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        .then(response => response.json())
        .then(data => {
            const evolutionDiv = document.createElement('div');
            evolutionDiv.className = 'evolution-container';
            evolutionDiv.innerHTML = `
                <img src="${data.sprites.front_default}" alt="${name}">
                <p>${name.toUpperCase()}</p>
            `;
            evolutionDiv.addEventListener('click', () => {
                mostrarPokemonDetalle(data);
            });
            evolutionsDiv.appendChild(evolutionDiv);
        });

    if (evolution.evolves_to.length > 0) {
        agregarEvolucion(evolution.evolves_to[0], currentName, evolutionsDiv);
    }
}

document.getElementById('back-button').addEventListener('click', () => {
    document.getElementById('pokemon').innerHTML = '';
    
    document.getElementById('pokemon-list').style.display = '';
    document.getElementById('back-button').style.display = 'none';
    
    mostrarPokem();
});




document.getElementById('pokemon-type-selector').addEventListener('change', function(event) {
    let selectedType = event.target.value;
    mostrarPokemPorTipo(selectedType);
});
async function mostrarPokemPorTipo(tipo) {
    try {
        let url = `https://pokeapi.co/api/v2/type/${tipo}`;
        let response = await fetch(url);
        let responseJson = await response.json();
        let pokemonList = document.getElementById('pokemon-list');
        pokemonList.innerHTML = ''; 
        
        let pokemonDetailsPromises = responseJson.pokemon.map(pokemonEntry => 
            fetch(pokemonEntry.pokemon.url).then(response => response.json())
        );
        
        let pokemonDetails = await Promise.all(pokemonDetailsPromises);
        
        pokemonDetails.forEach(data => {
            const types = data.types.map(typeInfo => typeInfo.type.name);
            const typesHtml = types.map(type => {
                const color = typeColors[type] || '#777'; 
                return `<span class="pokemon-type" style="background-color: ${color};">${type}</span>`;
            }).join(' ');

            const pokemonDiv = document.createElement('div');
            pokemonDiv.className = 'pokemon-container';
            pokemonDiv.innerHTML = `
                <div class="lista_contenedor">
                    <h3>ID: ${data.id}</h3>
                    <h3>${data.name.toUpperCase()}</h3>
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif" class="image">
                    <div>${typesHtml}</div>
                </div>
            `;
            
            pokemonDiv.addEventListener('click', () => {
                mostrarPokemonDetalle(data);
            });
            
            pokemonList.appendChild(pokemonDiv);
        });
    } catch (error) {
        console.error(error);
    }
}