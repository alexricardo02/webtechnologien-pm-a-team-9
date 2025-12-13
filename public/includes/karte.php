<div id="map">
    <script>


        // load map
        var map = L.map('map').setView([51.1657, 10.4515], 6);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO'
        }).addTo(map);

        // map styling
        function style(feature) {
            return {
                fillColor: getColor(feature.properties.total_opfer),
                weight: 0.5,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.8
            };
        }

        // color scale
        function getColor(d) {
            return d > 150000 ? '#800026' :  // very high
                d > 100000 ? '#BD0026' :
                    d > 80000 ? '#E31A1C' :
                        d > 50000 ? '#FC4E2A' :
                            d > 25000 ? '#FD8D3C' :
                                d > 10000 ? '#FEB24C' :
                                    d > 5000 ? '#FED976' :
                                        d > 0 ? '#FFEDA0' : // low
                                            '#FFFFFF';
        }


        var urlApi = 'includes/api_opfer.php';

        // load both json files
        Promise.all([
            // CHANGE 1: We fetch the API response (JSON), not the raw text file
            fetch(urlApi).then(res => {
                if (!res.ok) throw new Error("Error loading API data");
                return res.json();
            }),

            // CHANGE 2: Load the map
            fetch('data/landkreise.geo.json').then(res => {
                if (!res.ok) throw new Error("Error loading GeoJSON");
                return res.json();
            })
        ])
            .then(function ([opferDaten, geoJSONData]) {


                // Now we loop through the GeoJSON features and add the total Opfer
                geoJSONData.features.forEach(function (feature) {

                    var landkreisName = feature.properties.NAME_3.toLowerCase().trim();

                    var amountOfOpfer = 0;

                    // Matching
                    if (opferDaten[landkreisName]) {
                        // Case 1: Exact match (e.g., "berlin" == "berlin")
                        amountOfOpfer = opferDaten[landkreisName];
                    }
                    else if (landkreisName.includes("städte")) {
                        // Case 2: GADM correction (e.g., "osnabrück städte" -> search for "osnabrück")
                        var correctedName = landkreisName.replace(" städte", "").trim();
                        if (opferDaten[correctedName]) {
                            amountOfOpfer = opferDaten[correctedName];
                        }
                    }

                    // We store the total inside the map to use it when painting
                    feature.properties.total_opfer = amountOfOpfer;
                });



                // Finally, we add the GeoJSON to the map. We store the layer in a variable to reset the style on mouseout
                var geojsonLayer = L.geoJSON(geoJSONData, {
                    style: style, // Leaflet applies this function to EACH shape automatically
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup(
                            "Landkreis: " + "<strong>" + feature.properties.NAME_3 + "</strong>" +
                            "<br>Gesamt Opfer: " + feature.properties.total_opfer
                        );

                        layer.on({
                            mouseover: function (e) {
                                var layer = e.target;
                                layer.setStyle({
                                    weight: 3,
                                    color: '#666',
                                    dashArray: '',
                                    fillOpacity: 0.7
                                });
                                layer.bringToFront();
                            },
                            mouseout: function (e) {
                                geojsonLayer.resetStyle(e.target);
                            }
                        });

                    }
                }).addTo(map);

                // Legend

                var legend = L.control({ position: 'topright' });
                legend.onAdd = function (map) {
                    var div = L.DomUtil.create('div', 'info legend'),
                        grades = [0, 5000, 10000, 25000, 50000, 80000, 100000, 150000, 200000]

                    // Legend div styling
                    div.style.padding = '6px 8px';
                    div.style.borderRadius = '5px';
                    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
                    div.style.backdropFilter = 'blur(10px)';

                    div.innerHTML += '<strong>Gesamt Opfer</strong><br>';

                    // loop through our density intervals and generate a label with a colored square for each interval
                    for (var i = 0; i < grades.length; i++) {

                        var from = grades[i];
                        var to = grades[i + 1];

                        var color = getColor(from + 1);

                        div.innerHTML +=
                            '<i style="background:' + color + '; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7"></i> ' +
                            Math.round(from) + (to ? ' - ' + Math.round(to) + '<br>' : '+');
                    }

                    return div;
                }

                legend.addTo(map);

            }).catch(function (error) {
                console.error("There was an error trying to load the data", error);
                alert("Fix this thing");
            });
    </script>
</div>