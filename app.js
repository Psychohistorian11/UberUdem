let map;
let marker;
let markerDestiny;
let directionsService;
let directionDisplay;

function initMap() {
    // Configurar el mapa inicial
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 6.2442, lng: -75.5812 },
        zoom: 10,
    });

    directionsService = new google.maps.DirectionsService();
    directionDisplay = new google.maps.DirectionsRenderer();

    directionDisplay.setMap(map);

    // Inicializar el marcador
    marker = new google.maps.Marker({
        map: map,
        draggable: true,
    });

    // Inicializar el marcador de destino
    markerDestiny = new google.maps.Marker({
        map: map,
        draggable: true,
    });

    google.maps.event.addListener(marker, 'dragend', function (event) {
        const lat = marker.getPosition().lat();
        const lng = marker.getPosition().lng();
        console.log("Nuevas coordenadas:", lat, lng);
    });

    google.maps.event.addListener(markerDestiny, 'dragend', function (event) {
        const lat = markerDestiny.getPosition().lat();
        const lng = markerDestiny.getPosition().lng();
        console.log("Nuevas coordenadas Destino:", lat, lng);
    });

    google.maps.event.addListenerOnce(map, 'idle', () => {
        document.getElementById("map").classList.add('show-map');
    });
}

function buscarRuta() {
    const salida = document.getElementById("salida").value;

    // API de Geocodificación para obtener las coordenadas
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: salida }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();

            map.setCenter({ lat: lat, lng: lng });

            marker.setPosition({ lat: lat, lng: lng });

            const destino = document.getElementById("destino").value;

            const geocoderDestiny = new google.maps.Geocoder();
            geocoderDestiny.geocode({ address: destino }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    const latDestiny = results[0].geometry.location.lat();
                    const lngDestiny = results[0].geometry.location.lng();

                    markerDestiny.setPosition({ lat: latDestiny, lng: lngDestiny });

                    calculateRoute(); // Llamada a calculateRoute después de obtener las coordenadas de destino
                } else {
                    console.error("Error al obtener las coordenadas:", status);
                }
            });
        } else {
            console.error("Error al obtener las coordenadas:", status);
        }
    });
}

function calculateRoute() {
    directionsService.route({
        origin: {
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng(),
        },
        destination: {
            lat: markerDestiny.getPosition().lat(),
            lng: markerDestiny.getPosition().lng(),
        },
        travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionDisplay.setDirections(response);
        } else {
            alert('No se pudieron mostrar las direcciones debido a: ' + status);
        }
    });
}
