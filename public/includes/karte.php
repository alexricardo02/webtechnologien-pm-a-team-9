<div id="map">
    <script>
        // 1. Map initialisierung
        var map = L.map('map').setView([51.1657, 10.4515], 6);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO'
        }).addTo(map);

        var currentLegend = null;       
        var currentGeoJsonLayer = null; 

        // 2. Leyend Funktion 
        function updateDynamicLegend(values, colorScale, limits) {
            // Leyend cleanup
            if (currentLegend) {
                map.removeControl(currentLegend);
            }

            if (!values || values.length === 0 || !colorScale || !limits) return;

            currentLegend = L.control({ position: 'topright' });

            currentLegend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                div.style.padding = '10px 12px';
                div.style.borderRadius = '8px';
                div.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                div.style.boxShadow = '0 0 15px rgba(0,0,0,0.1)';
                div.style.backdropFilter = 'blur(10px)';
                div.style.lineHeight = '1.5';

                div.innerHTML = '<strong style="display:block; margin-bottom:5px;">Opferzahlen</strong>';

                for (var i = 0; i < limits.length - 1; i++) {
                    var from = Math.round(limits[i]);
                    var to = Math.round(limits[i + 1]);
                    var color = colorScale(from + (to - from) / 2).hex();

                    div.innerHTML +=
                        '<div style="display:flex; align-items:center; gap:8px;">' +
                        '<i style="background:' + color + '; width: 18px; height: 18px; border-radius:3px; opacity: 0.8"></i> ' +
                        '<span>' + from.toLocaleString('de-DE') + (to ? ' &ndash; ' + to.toLocaleString('de-DE') : '+') + '</span>' +
                        '</div>';
                }
                return div;
            };
            currentLegend.addTo(map);
        }

        // 3. Main Funktion
        window.initMap = function (geoJSONData, opferIndex) {
            map.invalidateSize();

            const values = Object.values(opferIndex).filter(v => v > 0);
            let colorScale = null;
            let limits = null;

            if (values.length > 0) {
                // Scale wird mit quantilen erstellt
                limits = chroma.limits(values, 'quantile', 7); 
                colorScale = chroma.scale('YlOrRd').classes(limits);
            }

            function dynamicGetColor(d) {
                if (!d || d === 0) return '#FFFFFF';
                return colorScale ? colorScale(d).hex() : '#FFEDA0';
            }

            // Namen prozessieren und Werte den GeoJSON-Eigenschaften zuweisen
            geoJSONData.features.forEach(function (feature) {
                var ags = feature.properties.cca_2; 

                var amountOfOpfer = 0;
                if (opferIndex.hasOwnProperty(ags)) {
                    amountOfOpfer = opferIndex[ags];
                }
                
                // Wir speichern den Wert in den Eigenschaften des Features
                feature.properties.total_opfer = amountOfOpfer;
            });

            

            if (currentGeoJsonLayer) {
                map.removeLayer(currentGeoJsonLayer);
            }

            var bounds = L.latLngBounds();
            var hasSelection = false;

            currentGeoJsonLayer = L.geoJSON(geoJSONData, {
                style: function (f) {
                    return {
                        fillColor: dynamicGetColor(f.properties.total_opfer),
                        weight: 0.5,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.8
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(
                        "Landkreis: <strong>" + feature.properties.name_2 + "</strong><br>" +
                        "Code (AGS): <code>" + feature.properties.cca_2 + "</code><br>" +
                        "Gesamt Opfer: " + (feature.properties.total_opfer > 0 
                            ? feature.properties.total_opfer.toLocaleString('de-DE') 
                            : "keine Daten")
                    );

                    layer.on({
                        mouseover: function (e) {
                            var layer = e.target;
                            layer.setStyle({ weight: 3, color: '#666', fillOpacity: 0.7 });
                            layer.bringToFront();
                        },
                        mouseout: function (e) {
                            currentGeoJsonLayer.resetStyle(e.target);
                        }
                    });

                    // Zoom logic
                    var normName = DataManager.normalizeName(feature.properties.name_2);
                    if (window.selectedLandkreise && window.selectedLandkreise.size > 0) {
                        var selectionList = Array.from(window.selectedLandkreise).map(s => DataManager.normalizeName(s));
                        
                        if (selectionList.includes(normName)) {
                            bounds.extend(layer.getBounds());
                            hasSelection = true;
                        }
                    }
                }
            }).addTo(map);

            // Leyend aktualisieren
            updateDynamicLegend(values, colorScale, limits);

            // Zoom to selection or default
            if (hasSelection) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
            } else {
                map.setView([51.1657, 10.4515], 6);
            }
            
        };
    </script>
</div>