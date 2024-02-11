let map;
let marker;
let markerDestiny;
let directionsService;
let directionDisplay;
let routeGenerated = false;

let originList = [];
let destinyList = [];

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
   
        google.maps.event.addListener(marker, 'dragend', function (event) {
            console.log(marker);
            const lat = marker.getPosition().lat();
            const lng = marker.getPosition().lng();
            console.log("Nuevas coordenadas:", lat, lng);
            calculateRoute();
            })
    

 
        google.maps.event.addListener(markerDestiny, 'dragend', function (event) {
            const lat = markerDestiny.getPosition().lat();
            const lng = markerDestiny.getPosition().lng();
            console.log("Nuevas coordenadas Destino:", lat, lng);
            });


    google.maps.event.addListenerOnce(map, 'idle', () => {
        document.getElementById("map").classList.add('show-map');
        
    });

    // Recuperar desde localStorage al inicializar el mapa
    const storedOriginList = localStorage.getItem('originList');
    const storedDestinyList = localStorage.getItem('destinyList');

    if (storedOriginList && storedDestinyList) {
        originList = JSON.parse(storedOriginList);
        destinyList = JSON.parse(storedDestinyList);
    }

    if (originList.length > 0 && destinyList.length > 0) {
            buscarRuta(originList[0],destinyList[0])
    }
}

function buscarRuta(salidaNew=null,destinoNew=null) {
    let salida = document.getElementById("salida").value;
    let destino = document.getElementById("destino").value;

    if (salida == ""){
        salida = salidaNew
    } 
    if (destino == ""){
        destino = destinoNew
    }

    originList.push(salida);
    destinyList.push(destino);

    localStorage.setItem('originList', JSON.stringify(originList));
    localStorage.setItem('destinyList', JSON.stringify(destinyList));

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
        origin: originList[0], 
        destination: destinyList[0],
        travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionDisplay.setDirections(response);
            routeGenerated = true;
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
    Swal.fire({
        title: "Buscando conductor",
        icon: "info",
        showCancelButton: true,
        showCloseButton: true,
        showConfirmButton: false,
        html: "<button class='swal2-cancel swal2-styled' onclick='cancelarPedido()'>Cancelar Pedido</button>", 
        html: "<button class='swal2-cancel swal2-styled' onclick='menuClicked()'> ir al Menu</button>",    
    });

    // Limpiar el localStorage


    // Puedes agregar aquí el código para buscar un conductor
}

function cancelarPedido() {
    // Limpiar las listas
    originList = [];
    destinyList = [];

    // Limpiar el localStorage también, si es necesario
    localStorage.removeItem('originList');
    localStorage.removeItem('destinyList');

    // Puedes agregar aquí más lógica si es necesario antes de redirigir al menú
    menuClicked();
}

function menuClicked() {
    // Puedes agregar aquí el código que se ejecutará cuando se haga clic en el botón "Menu"
    // Por ejemplo, puedes abrir un menú o realizar otra acción relacionada con el menú.
    window.location.href = "index.html";
}


