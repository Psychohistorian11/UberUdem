let map;
let initialMap;
let marker;
let markerDestiny;
let directionsService;
let directionDisplay;
let routeGenerated = false;


function initMap() {


    // Configurar el mapa inicial
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 6.2442, lng: -75.5812 },
        zoom: 12,
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

    google.maps.event.addListenerOnce(map, 'idle', () => {
        document.getElementById("map").classList.add('show-map');
        
    });


    const salida = localStorage.getItem('salida');
    const destino = localStorage.getItem('destino');

    if (salida != "" && destino != ""){
        Swal.fire({
            title: "Pasajero Disponible",
            icon: "info",
            showCloseButton: true,
            showConfirmButton: false,
            html: "<button class='swal2-cancel swal2-styled' onclick='acceptTravel()'>Aceptar Viaje</button>" +
                  "<button class='swal2-cancel swal2-styled' onclick='cancelTravel()'>Cancelar Viaje</button>",    
        });
        
    }
}

function acceptTravel(){

}

function cancelTravel(){
    
}

function buscarRuta(salidaNew="",destinoNew="") {

    if(salidaNew != "" && destinoNew != ""){
        salida = salidaNew
        destino = destinoNew
    }

    // API de Geocodificación para obtener las coordenadas
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: salida }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();

            initialMap.setCenter({ lat: lat, lng: lng });
            marker.setPosition({ lat: lat, lng: lng });

            const geocoderDestiny = new google.maps.Geocoder();
            geocoderDestiny.geocode({ address: destino }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {

                    const latDestiny = results[0].geometry.location.lat();
                    const lngDestiny = results[0].geometry.location.lng();
                    
                    markerDestiny.setPosition({ lat: latDestiny, lng: lngDestiny });


                    calculateRoute();
             
                } else {
                    console.error("Error al obtener las coordenadas:", status);
                    Swal.fire({
                        title: "Ingresar Dirección",
                        
                        
                    });
                }
            });
        } else {
            console.error("Error al obtener las coordenadas:", status);
            Swal.fire({
                title: "Ingresar Dirección",
                icon: "warning",
                
                
            });
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
            routeGenerated = true;
        } else {
            alert('No se pudieron mostrar las direcciones debido a: ' + status);
        }
    });
}