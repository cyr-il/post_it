import './bootstrap.js';
import './styles/app.css';

interact('.card').draggable({
    inertia: true,
    autoScroll: true,
    onstart: function (event) {
        event.target.classList.add('dragging');
    },
    onend: function (event) {
        event.target.classList.remove('dragging');
    }
});

// Fonction pour récupérer les états des post-its côté serveur
function fetchPostitStates() {
    var xhrStates = new XMLHttpRequest();
    xhrStates.open('GET', '/get-postit-states', true);

    return new Promise(function (resolve, reject) {
        xhrStates.onload = function () {
            if (xhrStates.status >= 200 && xhrStates.status < 300) {
                var postitStates = JSON.parse(xhrStates.responseText);
                console.log('Etats des post-its:', postitStates);
                resolve(postitStates);
            } else {
                reject(xhrStates.statusText);
            }
        };

        xhrStates.onerror = function () {
            reject(xhrStates.statusText);
        };

        xhrStates.send();
    });
}

// Envoi de la requête AJAX pour mettre à jour le statut du post-it
function updatePostitStatus(card, column) {
    var postitId = card.getAttribute('data-postit-id');
    var nouvelEtat = column.getAttribute('data-etat');
    var color = column.getAttribute('data-color');
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/deplacer-postit/' + postitId + '/' + nouvelEtat + '/' + color, true);

    // Gestionnaire d'événements pour traiter la réponse
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Le statut du post-it a été mis à jour avec succès.');
            console.log('Réponse du serveur:', xhr.responseText); // Ajoutez cette ligne
        } else {
            console.error('Erreur lors de la mise à jour du statut du post-it:', xhr.statusText);
        }
    };

    // Gestionnaire d'événements pour traiter les erreurs de réseau
    xhr.onerror = function () {
        console.error('Erreur réseau lors de la mise à jour du statut du post-it.');
    };
    console.log('Requête AJAX envoyée:', xhr);


    xhr.send();
}

// Gestionnaire d'événement pour le drop
interact('.column').dropzone({
    accept: '.card',
    ondrop: function (event) {
        const card = event.relatedTarget;
        const column = event.target;

        // Ajoutez la classe "dropped" à la carte
        card.classList.add('dropped');

        if(!card.classList.contains('card-green')) {

            // Ajoutez la carte à la nouvelle colonne avec la classe appropriée
            if (column.id == "col-b" || column.id == "col-c") {
                card.classList.add('card-blue');
                card.classList.remove('card-yellow', 'card-green');
            } else if (column.id == "col-d") {
                card.classList.add('card-green');
                card.classList.remove('card-yellow', 'card-blue');
            } else {
                card.classList.add('card-yellow');
                card.classList.remove('card-blue', 'card-green');
            }
            // Ajoutez la carte à la nouvelle colonne
            column.appendChild(card);
    
            // Envoi de la requête AJAX pour mettre à jour le statut du post-it
            updatePostitStatus(card, column);
        }

        // Débogage - Affiche les classes de la carte après le déplacement
        console.log('Classes de la carte après le déplacement :', card.classList);
    }
});

// Appel de la fonction pour récupérer les états des post-its au chargement de la page
fetchPostitStates().then(function (postitStates) {
    // Appliquer les états récupérés aux cartes existantes
    Object.keys(postitStates).forEach(function (postitId) {
        var state = postitStates[postitId];
        var card = document.querySelector('[data-postit-id="' + postitId + '"]');

        if (card) {
            // Ajoutez la classe appropriée en fonction de l'état
            card.classList.remove('card-yellow', 'card-green', 'card-blue'); 
            if (state === 'en_cours' || state === 'ikos') {
                card.classList.add('card-blue');
            } else if (state === 'pret') {
                card.classList.add('card-green');
            } else {
                card.classList.add('card-yellow');
            }
        }
    });
}).catch(function (error) {
    console.error('Erreur lors de la récupération des états des post-its:', error);
});

// Écouter les changements dans la barre de recherche
$('#search-input').on('input', function() {
    var query = $(this).val().toLowerCase(); // Récupérer la valeur de la recherche en minuscules
    // Filtrer les cards en fonction de la recherche
    $('.card').each(function() {
        var text = $(this).text().toLowerCase(); // Récupérer le texte de la card en minuscules
        // Afficher ou masquer la card en fonction de la correspondance avec la recherche
        $(this).toggle(text.includes(query));
    });
});

function fetchPostitDeadLines() {
    var xhrStates = new XMLHttpRequest();
    xhrStates.open('GET', '/get-deadlines', true);

    return new Promise(function (resolve, reject) {
        xhrStates.onload = function () {
            if (xhrStates.status >= 200 && xhrStates.status < 300) {
                var postitStates = JSON.parse(xhrStates.responseText);
                console.log('Deadlines:', postitStates);
                if (typeof postitStates === 'object') {
                    var deadlines = {};
                    Object.keys(postitStates).forEach(function(postitId) {
                        deadlines[postitId] = new Date(postitStates[postitId]);
                    });
                    resolve(deadlines);
                } else {
                    reject("Les états des post-its ne sont pas au format attendu");
                }
            }else {
                reject(xhrStates.statusText);
            }
        };

        xhrStates.onerror = function () {
            reject(xhrStates.statusText);
        };

        xhrStates.send();
    });
}

fetchPostitDeadLines().then(function (deadlines) {
    Object.keys(deadlines).forEach(function (postitId) {
        var card = document.querySelector('[data-postit-id="' + postitId + '"]');
        console.log('Carte correspondante:', card);
        var deadline = deadlines[postitId];

        console.log('Deadline:', deadline);

        if (card) {
            var today = new Date();
            var timeDiff = deadline.getTime() - today.getTime();
            var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
            if (daysDiff < 3 && !card.classList.contains('card-green')) {
                // Appliquer une classe CSS spécifique pour changer la couleur de la carte
                card.classList.remove('card-yellow', 'card-blue');
                card.classList.add('card-red');
            }
        }
    });
}).catch(function (error) {
    console.error('Erreur lors de la récupération des états des post-its:', error);
});