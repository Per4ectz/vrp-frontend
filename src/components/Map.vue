<template>
    <div>
        <div id="map" class="map"></div><br>
        <div class="form-check" v-for="layer in layers" :key="layer.id">
            <label class="form-check-label">
                <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="layer.active"
                    @change="layerChanged(layer.id, layer.active)"
                />
                {{ layer.name }}
            </label>
        </div>
    </div>
</template>

<script>

import orders from "../orders.json"
import axios from 'axios'

export default {
    data () {
        return {
            address: null,
            map: null,
            tileLayer: null,
            layers: [{
                id: 0,
                name: 'Restaurants',
                active: false,
                features: [{
                    id: 0,
                    name: 'Bogart\'s Smokehouse',
                    type: 'marker',
                    coords: [38.6109607, -90.2050322],
                    },
                    {
                    id: 1,
                    name: 'Pappy\'s Smokehouse',
                    type: 'marker',
                    coords: [38.6350008, -90.2261532],
                    },
                    {
                    id: 2,
                    name: 'Broadway Oyster Bar',
                    type: 'marker',
                    coords: [38.6188362, -90.1947098],
                    },
                    {
                    id: 3,
                    name: 'Charlie Gitto\'s On the Hill',
                    type: 'marker',
                    coords: [38.617972, -90.2756436],
                    },
                    {
                    id: 4,
                    name: 'Sugarfire',
                    type: 'marker',
                    coords: [38.6304077, -90.1916921],
                    },
                    {
                    id: 5,
                    name: 'The Shaved Duck',
                    type: 'marker',
                    coords: [38.6036282, -90.2381407],
                    },
                    {
                    id: 6,
                    name: 'Mango Restaurant',
                    type: 'marker',
                    coords: [38.6313642, -90.1961267],
                    },
                    {
                    id: 7,
                    name: 'Zia\'s Restaurant',
                    type: 'marker',
                    coords: [38.6157376, -90.27716],
                    },
                    {
                    id: 8,
                    name: 'Anthonio\'s Taverna',
                    type: 'marker',
                    coords: [38.6143846, -90.280048],
                    }],
            },
            {
            id: 1,
            name: 'City/County Boundaries',
            active: false,
                features: [{
                id: 0,
                name: 'City of St. Louis',
                type: 'polygon',
                coords: [
                [13.813118, 100.041182],
                [13.860658, 100.513227],
                [14.020839, 100.525024],
                [13.599460, 100.596947],
                [13.547140, 100.274338],
                ],
                }],
        }],
        }
    },
    mounted() {
        this.initMap();
        this.initLayers();
        // this.reverserCoor();
        this.postData();
    },
    watch : {
         address(val) {
            console.log('valval',val)
        }
    },
    methods: {
        initMap() {
            this.map = L.map('map').setView([13.753960, 100.502243], 10);
            this.tileLayer = L.tileLayer(
            'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
            {
                maxZoom: 18,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
            }
            );
            this.tileLayer.addTo(this.map); 
        },
        initLayers() {
            this.layers.forEach((layer) => {
                const markerFeatures = layer.features.filter(feature => feature.type === 'marker');
                const polygonFeatures = layer.features.filter(feature => feature.type === 'polygon');

                markerFeatures.forEach((feature) => {
                    feature.leafletObject = L.marker(feature.coords).bindPopup(feature.name + ' ' + feature.id);
                });

                polygonFeatures.forEach((feature) => {
                    feature.leafletObject = L.polygon(feature.coords).bindPopup(feature.name);
                });
            });
        },
        layerChanged(layerId, active) { 
            const layer = this.layers.find(layer => layer.id === layerId);
            layer.features.forEach((feature) => {
                if (active) {
                feature.leafletObject.addTo(this.map);
                } else {
                feature.leafletObject.removeFrom(this.map);
                }
            });
        },
        reverserCoor() {
            L.esri.Geocoding.reverseGeocode()
            .latlng([48.8583, 2.2945])
            .run(function (error, result, response) {
                // callback is called with error, result, and raw response
                // result.latlng contains the coordinates of the located address
                this.address = result.address
                // result.address contains information about the match
            });
        },
        postData() {
            axios.post('http://localhost:8080/', {
                orders
            })
            .then((response) => {
                console.log(orders);
            })
            .catch((error) => {
                console.log(error);
            });
        }
    },
    
}
</script>

<style scoped>
#map { 
    height: 500px;
    width: 1000px;
    margin-left: 20px;
}
</style>