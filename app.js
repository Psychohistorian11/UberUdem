let map;
let marker;
let markerDestiny;
let directionsService;
let directionDisplay;
let routeGenerated = false;
let distanceValue;
let distanceText;

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
        buscarRuta(salida,destino)
        buscarConductor()
    }

}

function buscarRuta(salidaNew="",destinoNew="") {
    let salida = document.getElementById("salida").value;
    let destino = document.getElementById("destino").value;

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

            map.setCenter({ lat: lat, lng: lng });
            marker.setPosition({ lat: lat, lng: lng });

            const geocoderDestiny = new google.maps.Geocoder();
            geocoderDestiny.geocode({ address: destino }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {

                    const latDestiny = results[0].geometry.location.lat();
                    const lngDestiny = results[0].geometry.location.lng();
                    
                    markerDestiny.setPosition({ lat: latDestiny, lng: lngDestiny });


                    calculateRoute(); // Llamada a calculateRoute después de obtener las coordenadas de destino
                    enviarInformacion(salida,destino)
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
            distanceValue = response.routes[0].legs[0].distance.value;
            distanceText = response.routes[0].legs[0].distance.text;
            console.log(`Driving distance: ${distanceText}`);
            console.log(`Driving value: ${distanceValue}`);
            mostrarBoton();
        } else {
            alert('No se pudieron mostrar las direcciones debido a: ' + status);
        }
    });
}

function mostrarBoton() {
    if (routeGenerated) {
        const contenedorBoton = document.getElementById("botonContainer");

        // Eliminar cualquier botón existente dentro del contenedor
        contenedorBoton.innerHTML = '';

        // Crear el botón y añadirlo al contenedor
        const botonBuscarConductor = document.createElement("button");
        botonBuscarConductor.textContent = "Buscar Conductor";
        botonBuscarConductor.onclick = buscarConductor;
        contenedorBoton.appendChild(botonBuscarConductor);
    }
}

function buscarConductor() {

    //aquí debe haber algo para la logica del condcutor

    const salida = localStorage.getItem('salida');
    const destino = localStorage.getItem('destino');

    Swal.fire({
        title: "Buscando conductor",
        icon: "info",
        showCloseButton: true,
        showConfirmButton: false,
        html: "<button class='swal2-cancel swal2-styled' onclick='cancelarPedido()'>Cancelar Pedido</button>" +
              "<button class='swal2-cancel swal2-styled' onclick='menuClicked()'>Ir al Menú</button>",    
    });
}


function cancelarPedido() {
    // Limpiar las marcas y la ruta
    marker.setPosition(null);
    markerDestiny.setPosition(null);
    directionDisplay.setDirections({ routes: [] });
    routeGenerated = false;

    // Mostrar el mapa predeterminado
    map.setCenter({ lat: 6.2442, lng: -75.5812 });
    map.setZoom(12);

    // Ocultar el contenedor del botón
    const contenedorBoton = document.getElementById("botonContainer");
    contenedorBoton.innerHTML = '';

    // Limpiar el localStorage
    localStorage.removeItem('salida');
    localStorage.removeItem('destino');

    // Cerrar el cuadro de diálogo de SweetAlert
    Swal.close();

}

function menuClicked() {
    // Puedes agregar aquí el código que se ejecutará cuando se haga clic en el botón "Menu"
    // Por ejemplo, puedes abrir un menú o realizar otra acción relacionada con el menú.
    window.location.href = "index.html";
}

function enviarInformacion(salida, destino){
    localStorage.setItem('salida', salida);
    localStorage.setItem('destino', destino);

}

