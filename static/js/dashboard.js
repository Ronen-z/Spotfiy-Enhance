//* static/js/dashboard.js

//* Function to load HTML content into the main content area
function loadContent(page) {
    const mainContent = document.getElementById('main-content');
    fetch(`/${page}`)
        .then(response => response.text())
        .then(data => {
            //* Load the content into the main content area
            mainContent.innerHTML = data;

            // Call functions based on the loaded page
            if (page === 'profile') {
                loadUserProfile();
                loadTopArtists('medium_term');
                loadRecentlyPlayed();
                loadPlaylistTracks('37i9dQZF1DX4JAvHpjipBk'); // Example playlist ID
            } else if (page === 'top-songs') { 
                loadListeningHistory('short_term');
                loadListeningHistory('medium_term');
                loadListeningHistory('long_term');
            } else if (page === 'top-artists') {
                loadTopArtists('short_term');
                loadTopArtists('medium_term', 'top-artists');
                loadTopArtists('long_term');
            }
        })
        .catch(error => console.error('Error loading content:', error))

}

// Load the profile page by default
document.addEventListener('DOMContentLoaded', () => {
    loadContent('profile');
});

//* Function to load playlists
function loadPlaylists() {
    //* Fetch the playlists from the backend API
    fetch('/api/playlists')
        .then(response => response.json()) //* Parse the JSON response
        .then(data => {
            const mainContent = document.getElementById('main-content');  //* Get the main content div
            mainContent.innerHTML = ''; //* Clear previous content

            //* Create and append a title for the section
            const title = document.createElement('h2');
            title.textContent = 'Playlists';
            mainContent.appendChild(title);

            //* Iterate through the list of playlists and create elements for each playlist
            data.forEach(playlist => {
                const playlistElement = document.createElement('div');
                playlistElement.className = 'playlist';  //* Set the class for styling
                playlistElement.innerHTML = `
                    <img src="${playlist.images[0]?.url || 'default_playlist_image_url.jpg'}" alt="${playlist.name}">
                    <div class="playlist-details">
                        <div class="playlist-name">${playlist.name}</div>
                        <div class="playlist-tracks">${playlist.tracks.total} tracks</div>
                    </div>
                `;
                //* Set the click event to load the playlist tracks
                playlistElement.addEventListener('click', () => loadPlaylistTracks(playlist.id)); 
                //* Add the playlist element to the main content
                mainContent.appendChild(playlistElement); 
            });
        })
        .catch(error => console.error('Error fetching playlists:', error)); //* Handle errors 
}


