let map;
let marker;
let markerDestiny;
let directionsService;
let directionDisplay;
let directionDisplayDriver;
let routeGenerated = false;


function initMap() {


    // Configurar el mapa inicial
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 6.2442, lng: -75.5812 },
        zoom: 12,
    });

    directionsService = new google.maps.DirectionsService();
    directionDisplay = new google.maps.DirectionsRenderer();
    directionDisplayDriver = new google.maps.DirectionsRenderer();

    directionDisplay.setMap(map);
    directionDisplayDriver.setMap(map);

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
   
    driverMarker = new google.maps.Marker({
        map:map,
        draggable: true,
    })


    google.maps.event.addListenerOnce(map, 'idle', () => {
        document.getElementById("map").classList.add('show-map');
        
    });

    const salida = localStorage.getItem('salida');
    const destino = localStorage.getItem('destino');
    if (salida != null && destino != null){
        buscarRuta(salida,destino)
        buscarConductor()
    }

    let driverInWay = localStorage.getItem("driverInWay")
    if (driverInWay == "1"){
        driverOnTheWay();
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
                    distanceText = localStorage.getItem("kilometros");
                    precio = localStorage.getItem("precio");
                    enviarInformacion(salida, destino, distanceText, precio);
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
            localStorage.setItem("kilometros", distanceText);
            precio = Math.round(calcularPrecio(distanceValue));
            localStorage.setItem("precio", precio);
            mostrarBoton(distanceText, precio);
        } else {
            alert('No se pudieron mostrar las direcciones debido a: ' + status);
        }
    });
}

function mostrarBoton(distanceText, precio) {
    if (routeGenerated) {
        const contenedorBoton = document.getElementById("botonContainer");

        // Eliminar cualquier botón existente dentro del contenedor
        contenedorBoton.innerHTML = '';


        // Crear un div para el título "precio"
        const tituloPrecio = document.createElement("div");
        tituloPrecio.textContent = "Precio";
        tituloPrecio.style.fontWeight = "bold";
        tituloPrecio.style.marginBottom = "5px";
        tituloPrecio.style.fontSize = "20px"

        // Crear un div para mostrar el texto encima del botón
        const textoDiv = document.createElement("div");
        textoDiv.textContent = distanceText + ': $  ' + precio;
        textoDiv.style.fontWeight = "bold";
        textoDiv.style.fontSize = "20px";

        // Crear el botón y añadirlo al contenedor
        const botonBuscarConductor = document.createElement("button");
        botonBuscarConductor.textContent = "Buscar Conductor";
        botonBuscarConductor.onclick = buscarConductor;
        
        contenedorBoton.appendChild(tituloPrecio);
        contenedorBoton.appendChild(textoDiv);
        contenedorBoton.appendChild(botonBuscarConductor);

        contenedorBoton.style.textAlign = "center";
        contenedorBoton.style.marginTop = "15px";
    }
}

function buscarConductor() {

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
    driverOnTheWay = false;
    localStorage.setItem("driverOnTheWay", driverOnTheWay)
    Swal.close();

}

function menuClicked() {
    // Puedes agregar aquí el código que se ejecutará cuando se haga clic en el botón "Menu"
    // Por ejemplo, puedes abrir un menú o realizar otra acción relacionada con el menú.
    window.location.href = "index.html";
}

function enviarInformacion(salida, destino, distanceText, precio){

    localStorage.setItem("kilometros", distanceText);
    localStorage.setItem("precio", precio);
    localStorage.setItem('salida', salida);
    localStorage.setItem('destino', destino);
    
}

function calcularPrecio(distanceValue) {
    valor_km = 1300;
    distancia_km = distanceValue/1000;
    if (distancia_km < 4.1){
        return 5200
    } 
    precio = (distancia_km*valor_km);
    return precio.toString()
}

function driverOnTheWay(){
    Swal.close();

    const divEsperandoPasajero = document.querySelector("#registro");

    const infoDiv = document.createElement("div");
    infoDiv.textContent = "¡Nuestro conductor esta de camino a recogerte!";
    infoDiv.style.fontWeight = "bold";
    infoDiv.style.marginBottom = "10px";
    infoDiv.style.fontSize = "40px"

    const botonAccept = document.createElement("button");
    botonAccept.textContent = "Cancelar Viaje";
    botonAccept.addEventListener("click", () => {
        cancelarPedido()
    });

    divEsperandoPasajero.innerHTML = "";
    divEsperandoPasajero.appendChild(infoDiv);
    divEsperandoPasajero.appendChild(botonAccept);

    driverInWay = "0";
    localStorage.setItem("driverInWay", driverInWay)
}
    



