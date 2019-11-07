<template>
<div>
    <h1 style="margin-bottom: 30px">Vehicle Routing Problem</h1>

    <div id="orderAmount" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left">Order Amount</label>
        <b-form-input v-model="orderAmount" placeholder="Number of orders" style="width: 150px" v-bind:disabled="file != null"></b-form-input>
    </div>

    <span style="margin-right: 20px">or</span>

    <div id="uploadField" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left">Upload Order</label>
        <b-form-file id="uploadBtn" accept=".json" v-model="file" 
        :state="Boolean(file)" placeholder="Choose a file" drop-placeholder="Drop file here..." 
        style="text-align: left; width: 250px" v-bind:disabled="orderAmount != ''"></b-form-file>
    </div>
    
    <div id="carNumField" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left">Car Amount</label>
        <b-form-input v-model="carNum" placeholder="Number of cars" style="width: 150px"></b-form-input>
    </div>

    <div id="solutionSelect" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left">Solution</label>
        <b-form-select v-model="selected" :options="options"></b-form-select>
    </div>
    <b-button variant="primary" style="width: 200px" @click="putData()">Submit</b-button>

    <div id="map" class="map"></div> 
    
    <!-- <b-button id="btn" variant="primary" @click="putData()">Put API</b-button> -->
    
</div>
</template>

<script>
import axios from 'axios'


export default {
    data() {
        return {
            file: null,
            fileData: null,
            carNum: '',
            orderAmount: '',
            orderArray: null,
            map: null,
            tileLayer: null,
            marker: null,
            polygon: null,
            order: null,
            selected: null,
                options: [
                { value: null, text: 'Please select a solution' },
                { value: 'kmean', text: 'Kmean' },
                ],
            myIcon : L.divIcon({
                className: 'my-div-icon',
                iconSize: [30, 30]}),
            colour: [],
            colorZ: null
            }
             
    },
    mounted() {
        this.initMap()
        this.initMarker()
        this.initPolygon()
        
    },
    watch: {
        file(val) {
            this.readOrder()
            console.log(val)
        },
        colour(val) {
            console.log(val)
        },

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
            // this.marker = L.marker([13.753960, 100.502243], {icon: this.myIcon}).addTo(this.map)
            const markerStyles = `
            background-color: white;
            width: 2rem;
            height: 2rem;
            display: inline-block;
            left: -1.5rem;
            top: -1.5rem;
            position: absolute;
            border-radius: 3rem 3rem 0;
            transform: rotate(45deg);
            border:3px solid rgba(19, 28, 160, 0.5);`

            const iconz = L.divIcon({
            className: "my-custom-pin",
            iconAnchor: [0, 24],
            labelAnchor: [-6, 0],
            popupAnchor: [0, -36],
            html: `<span style="${markerStyles}" />`
            })

                this.marker = L.marker([13.753960, 100.502243], {icon: iconz}).addTo(this.map)
           
           
        },
        initPolygon() {
            this.polygon = L.polygon([[13.813118, 100.041182],
                [13.860658, 100.513227],
                [14.020839, 100.525024],
                [13.599460, 100.596947],
                [13.547140, 100.274338]]).addTo(this.map)
        },
        async readOrder() {

            const fileValue = new FileReader();
            fileValue.onload = (e) => {
                // this.fileData =  e.target.result
                // console.log('File read : ',e.target.result)
            }
            fileValue.readAsText(this.file);
            this.fileData = fileValue
            console.log('teste : ',this.fileData.result)

        },
        putData() {
            this.genOrder()

            var orders = {
                solution: this.selected,
                numberOfCars: this.carNum,
                orders: this.orderArray
            }
            console.log(orders)

            axios.put('http://161.246.35.125:8080/api/order', {
                orders
            })
            .then((response) => {
                for(var c = 0; c < this.carNum;c++) this.getRandomColor()
                response.data.forEach((e) => {
                
                const myCustomColour = this.colour[e.carNumber]
                const markerHtmlStyles = `
                background-color: ${myCustomColour};
                width: 2rem;
                height: 2rem;
                display: inline-block;
                left: -1.5rem;
                top: -1.5rem;
                position: absolute;
                border-radius: 3rem 3rem 0;
                transform: rotate(45deg);
                border:3px solid rgba(0, 0, 0, 0.5);`

                const iconx = L.divIcon({
                className: "my-custom-pin",
                iconSize: [30, 30],
                html: `<span style="${markerHtmlStyles}" />`
                })

                this.marker = L.marker(e.coordinates, {icon: iconx}).addTo(this.map);
                // this.marker.bindPopup(this.colour).openPopup();
                    console.log(e.carNumber)
                })
            })
            .catch((error) => {
                console.log(error);
            });
        },
        getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            this.colour.push(color) 
        },
        genOrder() {
            var arr = [];
            for(let i = 0; i<this.orderAmount; i++) {
                arr.push([])
                arr[i].push(Math.random().toFixed(6) * (+14.0 - +13.5) + +13.5, Math.random().toFixed(6) * (+100.6 - +100.0) + +100.0)
            }

            var orders = [];
            arr.forEach((c) => {
                var s = {
                    coordinates : c, width: 100,
                    length: 100,
                    height: 100,
                    weight: 10 ,
                }
                orders.push(s)
                this.orderArray = orders
            })
        }
    }
}
</script>

<style lang="scss">

#map { 
    height: 700px;
    width: 1880px;
    margin-left: 20px;
    margin-top: 20px;
}

#btn {
    margin-top: 20px;
}
// .my-div-icon {

//     background: blue;
//     border:3px solid rgba(0, 0, 0, 0.5);
//     left: -1.5rem;
//     top: -1.5rem;
//     position: absolute;
//     border-radius: 1rem 1rem 0;
//     display: inline-block;
//     transform: rotate(45deg);
// }

.marker-icon-red {

    background: red;
    border:3px solid rgba(255, 255, 255, 0.5);
    left: -1.5rem;
    top: -1.5rem;
    position: absolute;
    border-radius: 1rem 1rem 0;
    display: inline-block;
    // transform: rotate(270deg);
}


</style>