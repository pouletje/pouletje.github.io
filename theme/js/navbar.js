fetch('/theme/templates/navbar.html')
    .then(response => response.text())
    .then(data => {
        const navbar = document.getElementById('navbar');
        navbar.innerHTML = data;
        navbar.classList.add('sticky');
    })
    .catch(error => console.error('Error loading navbar:', error));
