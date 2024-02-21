let map;
let marker;
let markerDestiny;
let driverMarker;
let directionsService;
let directionDisplay;
let routeGenerated = false;
let driverInWay = "0";


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

    var markerOptions = {
        map: map, 
        title: 'Mi marcador',
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, 
          fillColor: '#FF0000',
          fillOpacity: 1,
          strokeColor: '#000000',
          strokeWeight: 2,
          scale: 5 
        }
      };

    driverMarker = new google.maps.Marker(markerOptions,{
        map: map,
    })

    google.maps.event.addListenerOnce(map, 'idle', () => {
        document.getElementById("map").classList.add('show-map');
        
    });

    //Ubicación del conductor
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            ({coords: {latitude, longitude }}) => {
                const coords = {
                    lat: latitude,
                    lng: longitude,
                };
                driverMarker.setPosition(coords)
                localStorage.setItem("latDriver",coords.lat)
                localStorage.setItem("lngDriver", coords.lng)
            },
            () => {
                alert("El navegador esta bien, pero ocurrio un error");
            }
        );
    }else{
        alert("El navegador no dispone de la geolocalización");
    }
    


    const salida = localStorage.getItem('salida');
    const destino = localStorage.getItem('destino');


    if (salida != null && destino != null){
        Swal.fire({
            title: "Pasajero Disponible",
            icon: "info",
            showCloseButton: true,
            showConfirmButton: false,
            html: "<button class='swal2-cancel swal2-styled' onclick='showMap()'>Mostrar Ruta</button>" +
                  "<button class='swal2-cancel swal2-styled' onclick='cancelTravel()'>Cancelar Viaje</button>",    
        });
        
    }

    let inWay = localStorage.getItem("driverInWay")
    if (inWay == "1"){
        driverInWay = "0"; 
    }
}

function showMap(){
    const salida = localStorage.getItem('salida');
    const destino = localStorage.getItem('destino'); 
    const kilometros = localStorage.getItem("kilometros");
    const precio = localStorage.getItem("precio");
    console.log(kilometros + " "+ precio)
    buscarRuta(salida,destino);
    const divEsperandoPasajero = document.querySelector("#esperandoPasajero");

    const tituloDistancia = document.createElement("div");
        tituloDistancia.textContent = "Distancia (km)";
        tituloDistancia.style.fontSize = "27px";
        tituloDistancia.style.marginTop = "20px";
        tituloDistancia.style.marginBottom = "10px";

        const textoDistancia = document.createElement("div");
        textoDistancia.textContent = kilometros;
        textoDistancia.style.fontSize = "30px";
        textoDistancia.style.padding = "10px 180px"; 
        textoDistancia.style.borderRadius = "10px";
        textoDistancia.style.backgroundColor = "#84d2f6";


        const tituloPrecio = document.createElement("div");
        tituloPrecio.textContent = "Valor del viaje (COP)";
        tituloPrecio.style.fontSize = "27px";
        tituloPrecio.style.marginBottom = "10px";
        tituloPrecio.style.marginTop = "20px";

        const textoPrecio = document.createElement("div");
        textoPrecio.textContent = "$" + precio ;
        textoPrecio.style.fontSize = "30px";
        textoPrecio.style.padding = "10px 180px"; 
        textoPrecio.style.borderRadius = "10px"; 
        textoPrecio.style.backgroundColor = "#84d2f6"; 
        textoPrecio.style.marginBottom = "40px";


    const botonAccept = document.createElement("button");
    botonAccept.textContent = "Aceptar viaje";
    botonAccept.addEventListener("click", () => {
        acceptTravel(salida)
    });
  
    const botonCancel = document.createElement("button");
    botonCancel.textContent = "Cancelar viaje";
    botonCancel.addEventListener("click", () => {
       cancelTravel()
    });
  
    // Reemplaza el contenido del div
    divEsperandoPasajero.innerHTML = "";
    divEsperandoPasajero.appendChild(tituloDistancia);
    divEsperandoPasajero.appendChild(textoDistancia);
    divEsperandoPasajero.appendChild(tituloPrecio);
    divEsperandoPasajero.appendChild(textoPrecio);

    divEsperandoPasajero.appendChild(botonAccept);
    divEsperandoPasajero.appendChild(botonCancel);
  
    Swal.close();

    
}


function acceptTravel(salida) {

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: salida }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            const latFinal = results[0].geometry.location.lat();
            const lngFinal = results[0].geometry.location.lng();
            localStorage.setItem("latFinal", latFinal)
            localStorage.setItem("lngFinal", lngFinal)
            
            const latDriver = localStorage.getItem('latDriver');
            const lngDriver = localStorage.getItem('lngDriver'); 
            
        
            directionsService.route({
                origin: {
                    lat: parseFloat(latDriver),
                    lng: parseFloat(lngDriver),
                },
                destination: {
                    lat: parseFloat(latFinal),
                    lng: parseFloat(lngFinal),
                },
                travelMode: google.maps.TravelMode.DRIVING,
            }, (response, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionDisplay.setDirections(response);
                    routeGenerated = true;
                    enCamino()
                } else {
                    alert('No se pudieron mostrar las direcciones debido a: ' + status);
                }
            });
        }
    
    }) 

}

function enCamino(){

    const divEsperandoPasajero = document.querySelector("#esperandoPasajero");

    const infoDiv = document.createElement("div");
    infoDiv.textContent = "De camino a recoger al pasajero, factura enviada";
    infoDiv.style.fontWeight = "bold";
    infoDiv.style.marginBottom = "10px";
    infoDiv.style.fontSize = "40px"

    divEsperandoPasajero.innerHTML = "";
    divEsperandoPasajero.appendChild(infoDiv);

    driverInWay = "1";
    localStorage.setItem("driverInWay", driverInWay);
    const email = localStorage.getItem("correoElectronico")
    enviarFactura(email)

}

function enviarFactura(email){
    const salida = localStorage.getItem("salida")
    const destino = localStorage.getItem("destino")
    const kilometros = localStorage.getItem("kilometros")
    const precio = localStorage.getItem("precio")
    console.log(email)
    console.log(salida)
    console.log(destino)
    console.log(kilometros)
    console.log(precio)

    var params = {
        from_name : 'Cristian' ,
        email: email,
        origen : salida ,
        destino: destino,
        kilometros: kilometros,
        precio: precio
    }

    emailjs.send("service_t3jqvpu", "template_nne188a", params).then(function(res){
        alert("Succes" + res.status)
    })
}

function cancelTravel() {

    const divEsperandoPasajero = document.querySelector("#esperandoPasajero");

    marker.setPosition(null);
    markerDestiny.setPosition(null);
    directionDisplay.setDirections({ routes: [] });
    routeGenerated = false;

    map.setCenter({ lat: 6.2442, lng: -75.5812 });
    map.setZoom(12);

    Swal.close();

    const infoDiv = document.createElement("div");
    infoDiv.textContent = "Esperando Pasajero";
    infoDiv.style.fontWeight = "bold";
    infoDiv.style.marginBottom = "10px";
    infoDiv.style.fontSize = "40px"


    var img = document.createElement('img');
    img.src = 'loading.gif';
    img.alt = 'Cargando';
    img.width = 60;
    img.height = 60;

    // Agregar el nuevo elemento al cuerpo del documento (o al contenedor que desees)
    divEsperandoPasajero.innerHTML = "";
    divEsperandoPasajero.appendChild(infoDiv);
    divEsperandoPasajero.appendChild(img);

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

            map.setCenter({ lat: lat, lng: lng });
            marker.setPosition({ lat: lat, lng: lng });

            const geocoderDestiny = new google.maps.Geocoder();
            geocoderDestiny.geocode({ address: destino }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {

                    const latDestiny = results[0].geometry.location.lat();
                    const lngDestiny = results[0].geometry.location.lng();
                    
                    markerDestiny.setPosition({ lat: latDestiny, lng: lngDestiny });
                    marker.setMap(null);
                    markerDestiny.setMap(null);

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