<template>
<div>
    <div id="map" class="map"></div> 
    <b-button id="btn" variant="primary" @click="putData()">Put API</b-button>
    
</div>
</template>

<script>
import orders from "../orders.json"
import axios from 'axios'

export default {
    data() {
        return {
            map: null,
            tileLayer: null,
            marker: null,
            polygon: null
        }
    },
    mounted() {
        this.initMap()
        this.initMarker()
        this.initPolygon()
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
        initMarker() {
           this.marker = L.marker([13.753960, 100.502243]).addTo(this.map)
        },
        initPolygon() {
            this.polygon = L.polygon([[13.813118, 100.041182],
                [13.860658, 100.513227],
                [14.020839, 100.525024],
                [13.599460, 100.596947],
                [13.547140, 100.274338]]).addTo(this.map)
        },
        putData() {
            axios.put('http://localhost:8080/api/order', {
                orders
            })
            .then((response) => {
                response.data.forEach((e) => {
                    if(e.carNumber === 0) {
                        var carNum0 = []
                        carNum0.push[e]
                        console.log(carNum0)
                    }
                    
                })
                // console.log('Response',carNum1);


            })
            .catch((error) => {
                console.log(error);
            });
        }
    }
}
</script>

<style scoped>
#map { 
    height: 500px;
    width: 1880px;
    margin-left: 20px;
}
#btn {
    margin-top: 20px;
}
</style>