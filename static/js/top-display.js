function loadTopArtists(timeRange = 'medium_term', page = 'profile') {
    fetch(`/api/top-artists?time_range=${timeRange}`)
        .then(response => response.json())
        .then(data => {
            let mainContent;
            if (timeRange === 'medium_term') {
                if (page === 'profile') {
                        mainContent = document.getElementById('top-artists');
                    } else if (page === 'top-artists') {
                        mainContent = document.getElementById('top-month-artist'); 
                    }
            } else if (timeRange === 'long_term') {
                mainContent = document.getElementById('top-year-artist'); 
            } else if (timeRange === 'short_term') {
                mainContent = document.getElementById('top-week-artist'); 
            }

            mainContent.innerHTML = ''; // Clear previous content
            
            // Iterate through the list of top artists and create elements for each artist
            data.items.forEach((artist, index) => {
                const artistElement = document.createElement('div');
                artistElement.className = 'artist'; // Set the class for styling
                artistElement.innerHTML = `
                    <div class="artist-rank">${index + 1}</div>
                    <img src="${artist.images[0].url}" alt="${artist.name}">
                    <div class="artist-details">
                        <div class="artist-name">${artist.name}</div>
                    </div>
                `;
                // Add the artist element to the main content
                mainContent.appendChild(artistElement);
            });
        })
        .catch(error => console.error('Error fetching top artists:', error)); // Handle errors
}

function loadListeningHistory(timeRange = 'medium_term') {
    fetch(`/api/listening-history?time_range=${timeRange}`)
        .then(response => response.json())
        .then(data => {
            let mainContent;
            if (timeRange === 'medium_term') {
                mainContent = document.getElementById('top-month'); // Get the main content div
            } else if (timeRange === 'long_term') {
                mainContent = document.getElementById('top-year'); // Get the main content div
            } else if (timeRange === 'short_term') {
                mainContent = document.getElementById('top-week'); // Get the main content div
            }

            mainContent.innerHTML = ''; // Clear previous content
            
            // Iterate through the list of top tracks and create elements for each track
            data.items.forEach((track, index) => {
                const songElement = document.createElement('div');
                songElement.className = 'song'; // Set the class for styling
                songElement.innerHTML = `
                    <div class="song-rank">${index + 1}</div>
                    <img src="${track.album.images[0].url}" alt="${track.name}">
                    <div class="song-details">
                        <div class="song-title">${track.name}</div>
                        <div class="song-artist">${track.artists.map(artist => artist.name).join(', ')}</div>
                    </div>
                `;
                // Add the track element to the main content
                mainContent.appendChild(songElement);
            });
        })
        .catch(error => console.error('Error fetching listening history:', error)); // Handle errors
}
