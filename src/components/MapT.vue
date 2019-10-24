<template>
<div>
    <h1 style="margin-bottom: 30px">Vehicle Routing Problem</h1>

    <!-- <div id="uploadField" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left">Upload Order</label>
        <b-form-file id="uploadBtn" accept=".json" v-model="file" 
        :state="Boolean(file)" placeholder="Choose a file" drop-placeholder="Drop file here..." 
        style="text-align: left; width: 250px"></b-form-file>
    </div> -->
    
    <div id="carNumField" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left">Car number</label>
        <b-form-input v-model="carNum" placeholder="Car number" style="width: 150px"></b-form-input>
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
            order: null,
            selected: null,
                options: [
                { value: null, text: 'Please select a solution' },
                { value: 'kmean', text: 'Kmean' },
                ],
            myIcon : L.divIcon({
                className: 'my-div-icon',
                iconSize: [30, 30]}),
            mycolor: '#000000'
            }
             
    },
    mounted() {
        this.initMap()
        this.initMarker()
        this.initPolygon()
        
    },
    watch: {
        // file(val){
        //     // const fileValue = new FileReader();
        //     // fileValue.onload = e => console.log(e.target.result);
        //     // var orderVal = fileValue.readAsText(val);
        //     this.readOrder()
        //     console.log(val)
        // },
        carNum(val) {
            console.log('Input Car Num', val)
        },
        selected(val) {
            console.log('Input Solution', val)
        },
        order(val) {
            this.loopMarker()
            // console.log('Order', val)
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
            
           this.marker = L.marker([13.753960, 100.502243], {icon: this.myIcon}).addTo(this.map)
           
        },
        initPolygon() {
            this.polygon = L.polygon([[13.813118, 100.041182],
                [13.860658, 100.513227],
                [14.020839, 100.525024],
                [13.599460, 100.596947],
                [13.547140, 100.274338]]).addTo(this.map)
        },
        readOrder() {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload =  (e) => e.target.result;
            var ad = reader.readAsText(file);
            console.log(ad)

            // const fileValue = new FileReader();
            // fileValue.onload = e => console.log(e.target.result);
            // var orderVal = fileValue.readAsText(this.file);
            // console.log(orderVal)
        },
        loopMarker() {
            console.log(this.order)
        },
        putData() {
            // var orders = {
            //     solution: this.selected,
            //     numberOfCars: this.carNum,
            //     orders: "Hello"
            // }
            // console.log(orders)
            axios.put('http://localhost:8080/api/order', {
                orders
            })
            .then((response) => {
                // response.data.forEach((e) => {
                //     if(e.carNumber === 0) {
                //         var carNum0 = []
                //         carNum0.push[e]
                //         console.log(carNum0)
                //     }
                    
                // })
                // var co = [];
                response.data.forEach((e) => {
                    this.setRandomColor()
                    this.marker = L.marker(e.coordinates, {icon: this.myIcon}).addTo(this.map)
                    console.log(e.carNumber)
                })
                // console.log(co);
                // console.log(response.data[0])
                // console.log(response.data[1])
                // this.order = response.data


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
            return color;
        },
        setRandomColor() {
            this.myIcon.scss("background", this.getRandomColor());
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
.my-div-icon {
    background: blue;
    border: 2px solid #FFFFFF;
    width: 3rem;
    height: 3rem;
    left: -1.5rem;
    top: -1.5rem;
    border-radius: 3rem 3rem 0;
    // transform: rotate(45deg);
}
</style>