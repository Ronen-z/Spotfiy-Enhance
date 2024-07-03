//* static/js/profile.js

// Fetch and display recently played tracks
function loadRecentlyPlayed() {
    fetch('/api/recently-played')
        .then(response => response.json())
        .then(data => {
            const mainContent = document.getElementById('recently-played');
            mainContent.innerHTML = '';

            data.items.forEach(item => {
                const track = item.track;
                const songElement = document.createElement('div');
                songElement.className = 'song';
                songElement.innerHTML = `
                    <img src="${track.album.images[0].url}" alt="${track.name}">
                    <div class="song-details">
                        <div class="song-title">${track.name}</div>
                        <div class="song-artist">${track.artists.map(artist => artist.name).join(', ')}</div>
                    </div>
                `;
                mainContent.appendChild(songElement);
            });
        })
        .catch(error => console.error('Error fetching recently played tracks:', error));
}

//* Function to load tracks of a specific playlist
function loadPlaylistTracks(playlistId) {
    //* Fetch the tracks of the specified playlist from the backend API
    fetch(`/api/playlists/${playlistId}/tracks`)
        .then(response => response.json()) //* Parse the JSON response
        .then(data => {
            const mainContent = document.getElementById('playlist-songs'); //* Get the main content div
            mainContent.innerHTML = ''; //* Clear previous content

            //* Iterate through the list of tracks and create elements for each track
            data.forEach(item => {
                const track = item.track; //* Extract track details
                const songElement = document.createElement('div');
                songElement.className = 'song'; //* Set the class for styling
                songElement.innerHTML = `
                    <img src="${track.album.images[0].url}" alt="${track.name}">
                    <div class="song-details">
                        <div class="song-title">${track.name}</div>
                        <div class="song-artist">${track.artists.map(artist => artist.name).join(', ')}</div>
                    </div>
                `;
                //* Add the track element to the main content
                mainContent.appendChild(songElement);
            });
        })
        .catch(error => console.error('Error fetching playlist tracks:', error)); //* Handle errors
}

// Fetch and display user profile information
function loadUserProfile() {
    fetch('/api/user-profile')
        .then(response => response.json())
        .then(data => {
            const profilePictureContainer = document.getElementById('profile-picture');
            const profilePictureUrl = data.images[0]?.url || 'default_profile_picture.jpg'; // Use a default picture if none exists
            profilePictureContainer.innerHTML = `<img src="${profilePictureUrl}" alt="Profile Picture">`;

            const profileNameContainer = document.getElementById('profile-name');
            profileNameContainer.textContent = data.display_name;
        })
        .catch(error => console.error('Error fetching user profile:', error));
}
