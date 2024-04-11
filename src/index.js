
document.addEventListener("DOMContentLoaded", () => {
    function displayMovies() {
        fetch('http://localhost:3000/films')
            .then(response => response.json())
            .then(data => {
                const filmList = document.getElementById('films');
                filmList.innerHTML = ''; // clear the content of the li

                data.forEach(movie => {
                    const li = document.createElement('li');
                    li.classList.add('film', 'item');
                    li.textContent = movie.title;

                    // Create delete button
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('delete-button');
                    deleteButton.addEventListener('click', () => {
                        deleteFilm(movie.id, li); // Call deleteFilm function passing movie id and list item
                    });

                    // Append delete button to list item
                    li.appendChild(deleteButton);

                    li.addEventListener('click', (e) => {
                        e.preventDefault();
                        displayMovieInfo(movie);
                        displayMoviePoster(movie.poster);
                    });
                    
                    filmList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching or parsing films:', error));
    }

    function displayMoviePoster(posterURL) {
        const posterImg = document.getElementById('poster');
        posterImg.src = posterURL;
    }

    function displayMovieInfo(movie) {
        const titleElement = document.getElementById('title');
        const runtimeElement = document.getElementById('runtime');
        const descriptionElement = document.getElementById('film-info');
        const showtimeElement = document.getElementById('showtime');
        const ticketNumElement = document.getElementById('ticket-num');
        const buyTicketBtn = document.getElementById('buy-ticket'); // Define buyTicketBtn here

        titleElement.textContent = movie.title;
        runtimeElement.textContent = movie.runtime + ' minutes';
        descriptionElement.textContent = movie.description;
        showtimeElement.textContent = movie.showtime;
        const availableTickets = movie.capacity - movie.tickets_sold;
        ticketNumElement.textContent = availableTickets;

        // Update Buy Ticket button based on available tickets
        if (availableTickets > 0) {
            buyTicketBtn.textContent = 'Buy Ticket';
            buyTicketBtn.disabled = false;
        } else {
            buyTicketBtn.textContent = 'Sold Out';
            buyTicketBtn.disabled = true;
        }

        // Add event listener to buy tickets button
        buyTicketBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default form submission behavior

            if (availableTickets > 0) {
                // Update the frontend ticket count
                ticketNumElement.textContent = availableTickets - 1;

                // Make a PATCH request to update the tickets_sold on server
                const updatedTicketsSold = movie.tickets_sold + 1;
                updateTicketsSold(movie.id, updatedTicketsSold)
                    .then(() => {
                        // Fetch updated movie data after tickets are sold
                        return fetch('http://localhost:3000/films');
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Find the updated movie from the response data
                        const updatedMovie = data.find(item => item.id === movie.id);
                        // Update movie info in the DOM with the latest data
                        displayMovieInfo(updatedMovie);
                    })
                    .catch(error => console.error('Error fetching updated movie data:', error));
            } else {
                // If tickets are sold out, disable button and display "Sold Out"
                buyTicketBtn.textContent = 'Sold Out';
                buyTicketBtn.disabled = true;
            }
        });
    }

    function updateTicketsSold(movieId, updatedTicketsSold) {
        return fetch(`http://localhost:3000/films/${movieId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tickets_sold: updatedTicketsSold
            })
        })
            .then(response => response.json())
            .then(updatedMovie => console.log('Tickets sold updated:', updatedMovie))
            .catch(error => console.error('Error updating tickets sold', error));
    }

    function deleteFilm(movieId, listItem) {
        fetch(`http://localhost:3000/films/${movieId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete film');
                }
                // Remove the film from the list in the UI
                listItem.remove();
            })
            .catch(error => console.error('Error deleting film:', error));
    }

    displayMovies();
});

  
  
  