<template>
<div>
    <h1 style="margin-bottom: 30px">Vehicle Routing Problem</h1>
    <div id="uploadField" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left">Upload Order</label>
        <b-form-file id="uploadBtn" accept=".json" v-model="file" 
        :state="Boolean(file)" placeholder="Choose a file" drop-placeholder="Drop file here..." 
        style="text-align: left; width: 250px"></b-form-file>
    </div>

    <div id="carNumField" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left">Car number</label>
        <b-form-input v-model="carNum" placeholder="Car number" style="width: 150px"></b-form-input>
    </div>

    <div id="solutionSelect" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left">Solution</label>
        <b-form-select v-model="selected" :options="options"></b-form-select>
    </div>
    <b-button variant="primary" style="width: 200px">Submit</b-button>

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
            file: null,
            carNum: '',
            map: null,
            tileLayer: null,
            marker: null,
            polygon: null,
            selected: null,
                options: [
                { value: null, text: 'Please select a solution' },
                { value: 'a', text: 'Kmean' },
                ]
            } 
    },
    mounted() {
        this.initMap()
        this.initMarker()
        this.initPolygon()
    },
    watch: {
        file(val){
            console.log(val)
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

<style lang="scss">
#map { 
    height: 500px;
    width: 1880px;
    margin-left: 20px;
    margin-top: 20px;
}

#btn {
    margin-top: 20px;
}
</style>