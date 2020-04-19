<template>
  <div>
    <!-- <h1 style="margin-bottom: 30px">Vehicle Routing Problem</h1> -->
    <div id="orderGen">
      <div id="solutionSelect" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left; font-weight: bold;">Solution</label>
        <b-form-select v-model="selected" :options="options"></b-form-select>
      </div>

      <div id="orderAmount" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left; font-weight: bold;">Order Amount</label>
        <b-form-input
          v-model="orderAmount"
          placeholder="Number of orders"
          v-bind:disabled="this.file != null"
        ></b-form-input>
      </div>
      <span style="margin-right: 20px">or</span>
      <div id="uploadField" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left; font-weight: bold;">Upload Order</label>
        <b-form-file
          id="uploadBtn"
          accept=".json"
          v-model="file"
          :state="Boolean(file)"
          placeholder="Choose a file"
          drop-placeholder="Drop file here..."
          style="text-align: left;"
          v-bind:disabled="orderAmount != ''"
        ></b-form-file>
      </div>

      <div id="carNumField" style="display: inline-block; margin-right: 20px">
        <label style="display: block; text-align: left; font-weight: bold;">Car Amount</label>
        <b-form-input
          class="car-num-field"
          v-model="carNum"
          placeholder="Number of cars"
          v-bind:disabled="isDisabled"
        ></b-form-input>
      </div>

      <b-button id="submitBtn" variant="primary" @click="putData()">Submit</b-button>
      <b-button id="clearBtn" variant="secondary" @click="clearData()">Clear</b-button>
    </div>
    <b-button id="reqList" variant="primary" @click="dialogTableVisible = true">List</b-button>

    <el-dialog title="Request List" :visible.sync="dialogTableVisible">
      <el-table :data="orderData">
        <!-- <el-table-column property="date" label="Request No." width="200"></el-table-column> -->
        <!-- <el-table-column property="" label="Order Amount" width="200"></el-table-column> -->
        <el-table-column property="status" label="Status"></el-table-column>
        <el-table-column property="operation" label="Operations">
          <el-button size="mini" @click="dialogTableVisible = false">Plot</el-button>
        </el-table-column>
      </el-table>
    </el-dialog>
    
    <div v-loading="loading" id="map" class="map"></div>

    <!-- <b-button id="btn" variant="primary" @click="putData()">Put API</b-button> -->
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      file: null,
      fileData: null,
      carNum: "",
      orderAmount: "",
      orderArray: null,
      map: null,
      tileLayer: null,
      marker: null,
      polygon: null,
      order: null,
      selected: null,
      options: [
        { value: null, text: "Please select a solution" },
        { value: "kmean", text: "Kmean" },
        { value: "qlearning", text: "Q-Learning" }
      ],
      colour: [],
      colorZ: null,
      markerLayer: null,
      loading: false,
      requestID: null,
      requestInterval: null,
      dialogTableVisible: false
      ,orderData : null
      ,orderStatus : []
      ,reqID : []
    };
  },
  mounted() {
    this.initMap();
  },
  computed: {
    isDisabled() {
      return this.selected == "qlearning" || this.file != null;
    },
    isLoading() {
      return this.loading;
    }
  },
  watch: {
    file(val) {
      this.readOrder();
      console.log(val);
    },
    selected(val) {
      if (val == "qlearning") this.carNum = null;
    }
  },
  methods: {
    initMap() {
      
      this.map = L.map("map",{ zoomControl: false }).setView([13.75396, 100.502243], 10);
      this.tileLayer = L.tileLayer(
        "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
        {
          maxZoom: 18,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
        }
      );
      this.tileLayer.addTo(this.map);
    },
    initPolygon() {
      this.polygon = L.polygon([
        [13.813118, 100.041182],
        [13.860658, 100.513227],
        [14.020839, 100.525024],
        [13.59946, 100.596947],
        [13.54714, 100.274338]
      ]).addTo(this.map);
    },
    async readOrder() {
      const fileValue = new FileReader();
      fileValue.onload = e => {
        // this.fileData =  e.target.result
        // console.log('File read : ',e.target.result)
      };
      fileValue.readAsText(this.file);
      this.fileData = fileValue;
      // console.log('teste : ',this.fileData.result)
    },
    putData() {
      this.loading = true;
      this.genOrder();
      if (this.markerLayer == null) {
        this.markerLayer = L.layerGroup().addTo(this.map);
      } else {
        this.markerLayer.clearLayers();
      }
      var orders = {
        solution: this.selected,
        numberOfCars: this.carNum,
        orders: this.orderArray
      };
      console.log(orders);
      axios
        .put("http://localhost:8080/api/request", {
          orders
        })
        .then(response => {
          const { id } = response.data;

          this.requestID = id;
          console.log(response)
          // if(orders) {
          //   this.orderData = res.data
          //   // this.orderStatus = status
          // }

          if (this.requestInterval) {
            clearInterval(this.requestInterval);
            this.requestInterval = null;
          }

          this.requestInterval = setInterval(() => {
            axios
              .get(`http://localhost:8080/api/request/${this.requestID}`)
              .then(res => {
                const { status, orders } = res.data;
                // console.log(res)
                
                if (status === "finish" || status === "reject") {
                  clearInterval(this.requestInterval);
                  this.requestInterval = null;

                  var carNumCheck = 0
                  var findCarNum = false;
                  if(this.selected == "kmean"){
                    for (var c = 0; c < this.carNum; c++) this.getRandomColor();
                  } else{
                    orders.forEach(e => {
                      if(carNumCheck <= e.carNumber) carNumCheck = e.carNumber;
                    })
                    carNumCheck = carNumCheck + 1
                    findCarNum = true
                  }
                  if(findCarNum == true){
                    for (var c = 0; c < carNumCheck; c++) this.getRandomColor();
                    findCarNum = false
                  }

                  orders.forEach(e => { 
                    // console.log(this.colour)
                    const myCustomColour = this.colour[e.carNumber];
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
                      border:3px solid rgba(0, 0, 0, 0.5);`;

                    const iconx = L.divIcon({
                      className: "my-custom-pin",
                      iconAnchor: [0, 24],
                      labelAnchor: [-6, 0],
                      popupAnchor: [0, -36],
                      html:
                        `<span style="${markerHtmlStyles}" />` +
                        `<div style="font-weight: bold; font-size: 15px; transform: rotate(-45deg); color:black; font-family: Montserrat; padding: 2px;">${e.deliveryOrder}</div>`
                    });
                    this.marker = L.marker(e.coordinates, {
                      icon: iconx
                    }).addTo(this.markerLayer);
                    // console.log(e.carNumber);
                  }) 
                  this.loading = false
                  this.colour = []
                }
              });
          }, 5000);
        })
        .catch(error => {
          console.log(error);
        });
    },
    getRandomColor() {
      var letters = "0123456789ABCDEF";
      var color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      this.colour.push(color);
    },
    genOrder() {
      var arr = [];
      for (let i = 0; i < this.orderAmount; i++) {
        arr.push([]);
        arr[i].push(
          Math.random().toFixed(6) * (+13.9 - +13.6) + +13.6,
          Math.random().toFixed(6) * (+100.5 - +100.1) + +100.1
        );
      }

      var orders = [];
      arr.forEach(c => {
        var s = {
          coordinates: { lat: c[0], lon: c[1] },
          width: Math.floor(Math.random() * 50 ) + 10,
          length: Math.floor(Math.random() * 100 ) + 2,
          height: Math.floor(Math.random() * 100 )+ 15
        };
        orders.push(s);
        this.orderArray = orders;
      });
    },
    clearData() {
      // this.markerLayer.clearLayers();
      this.orderAmount = null;
      this.carNum = null;
      this.selected = null;
      console.log("Click Clear Btn!");
    }
  }
};
</script>

<style lang="scss">
#orderGen {
  background: white;
  margin-top: 10px;
  padding: 10px;
  position: absolute;
  left: 10px;
  top: 0px;
  z-index: 1;
  width: 72%;
  height: 100px;
  border-radius: 10px;
  box-shadow: 0px 0px 14px 1px rgba(0, 0, 0, 0.1);
}
#reqList {
  margin-top: 10px;
  padding: 10px;
  position: absolute;
  left: 1400px;
  top: 0px;
  z-index: 1;
  width: 100px;
  height: 100px;
  border-radius: 10px;
  box-shadow: 0px 0px 14px 1px rgba(0, 0, 0, 0.1);
}
#map {
  height: 100vh;
  width: 100vw;
  z-index: 0;
}

#btn {
  margin-top: 20px;
}

#orderAmount {
  .form-control {
    width: 170px;
  }
}

#uploadBtn {
  width: 250px;
}

#carNumField {
  .form-control {
    width: 160px;
  }
}

#submitBtn {
  width: 200px;
  margin-right: 20px;
}

#clearBtn {
  width: 200px;
}

@media (max-width: 1440px) {
  #orderGen {
    height: 90px;
  }
  #solutionSelect {
    .custom-select {
      width: 195px;
      font-size: 0.8rem;
    }
  }
  #orderAmount {
    .form-control {
      width: 150px;
      font-size: 0.8rem;
    }
  }
  #uploadBtn {
    width: 180px;
    font-size: 0.8rem;
  }
  #carNumField {
    .form-control {
      width: 135px;
      font-size: 0.8rem;
    }
  }
  #submitBtn {
    width: 110px;
    font-size: 0.8rem;
    margin-right: 10px;
  }
  #clearBtn {
    width: 110px;
    font-size: 0.8rem;
  }
}
</style>