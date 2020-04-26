<template>
  <div>
    <div id="orderMenu">
      <el-button id="menuBtn" @click="clickMenu()"><i class="el-icon-menu"></i></el-button>
      <el-menu class="el-menu-vertical-demo" :collapse="isCollapse" style="text-align: left !important">
        <el-menu-item index="1" @click="createClick()">
          <i class="el-icon-add-location" variant="outline-primary"></i>
          <span slot="title">Create Order Request</span>
        </el-menu-item>

        <el-menu-item index="2" @click="reqListClick()">
          <i class="el-icon-tickets"></i>
          <span slot="title">Request List</span>
        </el-menu-item>

        <el-menu-item index="3" @click="infoClick()">
          <i class="el-icon-map-location"></i>
          <span slot="title">Order Information</span>
        </el-menu-item>
      </el-menu>
    </div>

    <el-dialog id="createOrder" title="Create Order Request" :visible.sync="dialogCreateVisible">
      <div id="solutionSelect" style="display: block; margin-bottom: 20px">
        <label style="text-align: left; font-weight: bold;">Solution</label>
        <b-form-select v-model="selected" :options="options"></b-form-select>
      </div>

      <div id="orderAmount" style="display: inline-block; margin-bottom: 20px;margin-right: 20px">
        <label style="display: inline-block;text-align: left; font-weight: bold;">Order Amount</label>
        <b-form-input
          v-model="orderAmount"
          placeholder="Number of orders"
          v-bind:disabled="this.file != null"
        ></b-form-input>
      </div>

      <span style="margin-top: 20px;margin-right: 20px">or</span>
      
      <div id="uploadField" style="display: inline-block; margin-bottom: 20px">
        <label style="display: inline-block; text-align: left; font-weight: bold;">Upload Order</label>
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
      

      <div id="carNumField" style="display: block; margin-bottom: 20px">
        <label style="display: inline-block; text-align: left; font-weight: bold;">Car Amount</label>
        <b-form-input
          class="car-num-field"
          v-model="carNum"
          placeholder="Number of cars"
          v-bind:disabled="isDisabled"
        ></b-form-input>
      </div>

      <div style="margin-top: 40px; text-align: center">

      <b-button id="submitBtn" variant="primary" @click="putData()">Submit</b-button>
      <b-button id="clearBtn" variant="secondary" @click="clearData()">Clear</b-button>
      </div>
    </el-dialog>

    <el-dialog id="reqTable" title="Request List" :visible.sync="dialogTableVisible">
      <el-table :data="requestArray">
        <el-table-column property="reqId" label="Request Id" width="250"></el-table-column>
        <el-table-column property="solution" label="Solution" width="100"></el-table-column>
        <el-table-column property="orderAm" label="Order Amount" width="150"></el-table-column>
        <el-table-column property="carAmount" label="Car Amount" width="150"></el-table-column>
        <el-table-column property="reqStatus" label="Status"></el-table-column>
        <el-table-column property="operation" label="Operations">
          <template slot-scope="scope">
        <el-button @click.native.prevent="plotOrder(scope.$index, requestArray)" v-bind:disabled="requestArray[scope.$index].reqStatus == 'pending'" type="primary" size="mini" >Plot Order</el-button>
      </template>
          
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog  id="infoDialog" title="Order Information" :visible.sync="dialogInfoVisible">
      
      <el-card shadow="always">
        <div slot="header" class="clearfix">
          <span>Total Volume</span>
        </div>
        <div v-if="volumeTotal">{{ volumeTotal.toFixed(2) }}</div>
        <div style="color: #909399" v-else>No Data</div>
      </el-card>

      <el-card shadow="always" style="margin-top: 20px">
        <el-table :data="infoData" >
        <el-table-column type="index" label="Car No." width="100"></el-table-column>
        <el-table-column label="Color" width="100" >
          <div v-for="color in colors"
            :key="color"
            :style="{ 'background-color': color}" class="item-color">
          </div>
        </el-table-column>
        <el-table-column property="volumeI" label="Volume"></el-table-column>
        <el-table-column property="distanceI" label="Distance"></el-table-column>
      </el-table>
      </el-card>
    </el-dialog>
    
    <div v-loading="loading" id="map" class="map"></div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      isCollapse: true,
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
        { value: "qlearning", text: "Q-Learning" },
        { value: "kmean and qlearning", text: "Kmean and Q-Learning"}
      ],
      colour: [],
      markerLayer: null,
      loading: false,
      requestID: null,
      requestInterval: null,
      dialogCreateVisible: false,
      dialogTableVisible: false,
      dialogInfoVisible: false,
      orderData : []
      ,haveList : false
      ,requestArray : []
      ,orderInfo : [],
      distanceArray : null,
      volumeArray: null,
      volumeTotal: 0,
      infoData: null,
      totalTemp: 0,
      colors: ['ddd'],
      totalArray: []
    };
  },
  mounted() {
    this.initMap();
  },
  computed: {
    isDisabled() {
      return this.selected == "qlearning" || this.selected == "kmean and qlearning" 
      // || this.file != null;
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
      if (val == "qlearning" || val == "kmean and qlearning") this.carNum = null;
    },
    dialogCreateVisible(val) {
      if(!val) {
        setTimeout(() => {
          this.orderAmount = "";
          this.carNum = null;
          this.selected = null;

        }, 500);
        
      }
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
    readOrder() {
      // const fileValue = new FileReader();
      // fileValue.onload = e => {
      //   this.fileData = e.target.result
      //   // console.log('File read : ',this.fileData)
      // };
      // fileValue.readAsText(this.file);
      // this.fileData = fileValue;
      // console.log('teste : ',this.fileData.result)
    },
    putData() {
      // this.orderData = null;
      this.loading = true;
      // this.orderInfo = []
      this.totalTemp = 0
      if(this.fileData != null){
        var fileArray = []
        this.fileData.orders.forEach(o => {
          var oo = {
            coordinates: { lat: o[0], lon: o[1] },
            width: Math.floor(Math.random() * 50 ) + 10,
            length: Math.floor(Math.random() * 100 ) + 2,
            height: Math.floor(Math.random() * 100 )+ 15
          };
          this.fileArray.push(oo);
          this.orderArray = this.fileArray;
        })
        console.log('File Data :', this.orderArray)
      }else this.genOrder();
      if (this.markerLayer == null) {
        this.markerLayer = L.layerGroup().addTo(this.map);
      } 
      // else {
      //   this.markerLayer.clearLayers();
      // }
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
          setTimeout(() => this.loading = false, 500); 
          // console.log(this.requestArray)

          if (this.requestInterval) {
            clearInterval(this.requestInterval);
            this.requestInterval = null;
          }

          this.requestInterval = setInterval(() => {
            axios
              .get(`http://localhost:8080/api/request/${this.requestID}`)
              .then(res => {
                const { status, orders } = res.data.request;
                 var resCheck = {
                  reqId : id,
                  solution : res.data.request.solution,
                  orderAm: orders.length,
                  carAmount : res.data.request.numberOfCars,
                  reqStatus : status
                }

                console.log(this.requestArray)
                this.pushToArray(this.requestArray, resCheck)
                this.haveList = true

                // console.log('Order Data : ',orders)

                if (status === "finish" || status === "reject") {
                  clearInterval(this.requestInterval);
                  this.requestInterval = null;
                  this.orderData.push(orders)
                  // this.orderToArray(this.orderData, orders)
                  console.log('FINISH',this.orderData)

                  this.volumeArray = res.data.request.volume
                  var volAr = [];
                  for (let i = 0; i < this.volumeArray.length; i++) {
                    var info = {
                      distanceI : res.data.request.distance[i].toFixed(2),
                      volumeI : res.data.request.volume[i].toFixed(2)
                    } 
                    this.totalTemp += this.volumeArray[i]
                    this.infoArrayUpdate(volAr, info)
                    // this.volAr.push(info)
                  }
                this.orderInfo.push(volAr)
                } 
                // else {
                //   this.orderToArray(this.orderData, orders)
                //   console.log('Pending',this.orderData)
                // }
              });
          }, 5000);
          this.dialogCreateVisible = false
        })
        .catch(error => {
          console.log(error);
        });
    },
    plotOrder(index,stat) {
      this.markerLayer.clearLayers();
      var carNumCheck = 0
      var findCarNum = false;
      if(this.selected == "kmean"){
        for (var c = 0; c < this.carNum; c++) this.getRandomColor();
      } else{
        this.orderData[index].forEach(e => {
          if(carNumCheck <= e.carNumber) carNumCheck = e.carNumber;
        })
        carNumCheck = carNumCheck + 1
        findCarNum = true
      }
      if(findCarNum == true){
        for (var cc = 0; cc < carNumCheck; cc++) this.getRandomColor();
        findCarNum = false
      }
      
      // console.log('Order DATA :',this.orderData)

      this.orderData[index].forEach(e => { 
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
      this.colour = []
      this.infoData = this.orderInfo[index]
      console.log('ORDER INFO',this.orderInfo)
      console.log('INFO DATA',this.infoData)

      if(this.totalArray[index] != this.totalTemp) this.totalArray.push(this.totalTemp)
      console.log('TOTAL ARRAY',this.totalArray)
      
      this.volumeTotal = this.totalArray[index]
      

      // for (let i = 0; i < this.volumeArray.length; i++) {
      //   var info = {
      //     distanceI : res.data.request.distance[i].toFixed(2),
      //     volumeI : res.data.request.volume[i].toFixed(2)
      //   } 
      //   this.volumeTotal += this.volumeArray[i]
      //   this.orderInfo.push(info)
      // }
    },
    pushToArray(arr, obj) {
      const index = arr.findIndex((e) => e.reqId == obj.reqId);
      if (index === -1) {
          arr.push(obj);
      } else {
          arr[index] = obj;
      }
    },
    orderToArray(arr,obj) {
      const index = arr.findIndex((e) => e._id == obj._id);
      if (index === -1) {
          arr.push(obj);
      } else {
          arr[index] = obj;
      }
    },
    infoArrayUpdate(arr,obj) {
      const infoIndex = arr.findIndex((ia) => ia.distanceI == obj.distanceI);
      if (infoIndex === -1) {
          arr.push(obj);
      } else {
          arr[infoIndex] = obj;
      }
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
    createClick(){
      this.dialogCreateVisible = true
    },
    reqListClick(){
      this.dialogTableVisible = true
      this.haveList = false
    },
    infoClick(){
      this.dialogInfoVisible = true
    },
    clearData() {
      // this.markerLayer.clearLayers();
      this.orderAmount = null;
      this.carNum = null;
      this.selected = null;
      console.log("Click Clear Btn!");
    },
    clickMenu() {
      this.isCollapse = this.isCollapse ? false : true;
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

#createOrder {
  text-align: left;
}

#uploadField {
  width: 500px;
}

.item-color {
  height: 25px;
  width: 25px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
}

#orderMenu {
  background: white;
  margin-top: 10px;
  padding: 10px;
  position: absolute;
  left: 10px;
  top: 0px;
  z-index: 1;
  // width: 500px;
  // height: 100px;
  border-radius: 10px;
  box-shadow: 0px 0px 14px 1px rgba(0, 0, 0, 0.1);
}
#reqList {
  border: 0.5px skyblue;
  border-style: solid;
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
.el-dialog__header{
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.item {
  font-size: 16px;
  color:DodgerBlue;
}

#reqTable {
  width: 2000px;
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
    width: 350px;
  }
}

#uploadBtn {
  width: 250px;
}

#carNumField {
  .form-control {
    width: 915px;
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