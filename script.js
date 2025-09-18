const API_KEY = 'e531989d5be7060139836d8ac9388411'; // New API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const providerUrls = {
    'netflix': 'https://www.netflix.com/search?q=',
    'amazon prime video': 'https://www.amazon.com/s?k=',
    'hulu': 'https://www.hulu.com/search?q=',
    'disney+': 'https://www.disneyplus.com/search?q=',
    'hbo max': 'https://www.hbomax.com/search?q=',
    'apple tv+': 'https://tv.apple.com/search?q=',
    'paramount+': 'https://www.paramountplus.com/search?q=',
    'peacock': 'https://www.peacocktv.com/search?q=',
    'crunchyroll': 'https://www.crunchyroll.com/search?q=',
    'funimation': 'https://www.funimation.com/search?q=',
    
    // Add more providers as needed
};

document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    console.log('Searching for:', query);
    if (!query) {
        alert('Please enter a search term.');
        return;
    }
    searchMoviesTV(query);
});

async function searchMoviesTV(query) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p>Loading...</p>';

    try {
        const fetchUrl = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
        console.log('Fetch URL:', fetchUrl);
        const response = await fetch(fetchUrl);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.results && data.results.length > 0) {
            resultsDiv.innerHTML = '';
            for (const item of data.results.slice(0, 10)) { // Limit to 10 results
                if (item.media_type === 'movie' || item.media_type === 'tv') {
                    const providers = await getWatchProviders(item.id, item.media_type);
                    const externalIds = await getExternalIds(item.id, item.media_type);
                    displayResult(item, providers, externalIds);
                }
            }
        } else {
            resultsDiv.innerHTML = '<p>No results found.</p>';
        }
    } catch (error) {
        resultsDiv.innerHTML = '<p>Error fetching data. Check API key and try again.</p>';
        console.error(error);
    }
}

async function getWatchProviders(id, mediaType) {
    try {
        const response = await fetch(`${BASE_URL}/${mediaType}/${id}/watch/providers?api_key=${API_KEY}`);
        const data = await response.json();
        return data.results?.US?.flatrate || []; // US streaming providers
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function getExternalIds(id, mediaType) {
    try {
        const response = await fetch(`${BASE_URL}/${mediaType}/${id}/external_ids?api_key=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function displayResult(item, providers, externalIds) {
    const resultsDiv = document.getElementById('results');
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result';

    const title = item.title || item.name;
    const poster = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image';

    // Construct watch on site link (example: TMDB homepage or external link if available)
    // Add the requested fixed URL as available to watch on site
    const watchLink = 'https://night677coder.github.io/mytheater';

    let providersList = '';
    if (providers.length > 0) {
        providersList = providers
            .map((provider) => {
                const providerNameLower = provider.provider_name.toLowerCase();
                const baseUrl = providerUrls[providerNameLower];
                const searchUrl = baseUrl ? `${baseUrl}${encodeURIComponent(title)}` : `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + provider.provider_name)}`;
                return `<li><a href="${searchUrl}" target="_blank" rel="noopener noreferrer">${provider.provider_name}</a></li>`;
            })
            .join('');
    } else {
        providersList = '<li>No streaming links available</li>';
    }

    // Add a direct link to TMDB page for the movie or TV show
    const tmdbUrl = `https://www.themoviedb.org/${item.media_type}/${item.id}`;

    resultDiv.innerHTML = `
        <h3>${title} (${item.media_type})</h3>
        <img src="${poster}" alt="${title}">
        <p>Available on:</p>
        <ul>
            ${providersList}
        </ul>
        <p><a href="${watchLink}" target="_blank" rel="noopener noreferrer">Watch on site</a></p>
        <p><a href="${tmdbUrl}" target="_blank" rel="noopener noreferrer">More info on TMDB</a></p>
    `;

    resultsDiv.appendChild(resultDiv);
}
