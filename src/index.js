var express = require("express");
var app = express();
var fs = require('fs');

// let jsontest = require('./orders.json')

function generateRandomLat() {
    var arr = {};
    for(let i = 0; i<=299; i++) {
        // var arr = [];
        arr.push([])
        arr[i].push(Math.random().toFixed(6) * (+14.0 - +13.5) + +13.5, Math.random().toFixed(6) * (+100.6 - +100.0) + +100.0)
    }
    return arr;
}

var x = generateRandomLat()

var orders = [];
x.forEach((c) => {
    // console.log(c)
    var s = {
        coordinates : {lat:c[0], lon:c[1]}, width: Math.floor((Math.random() * 50) + 1),
        length: Math.floor((Math.random() * 100) + 1),
        height: Math.floor((Math.random() * 50) + 1)
    } 
    orders.push(s)    
})
var allOrder = {
    solution: "kmean",
    numberOfCars: "20",
    orders: orders
}

console.log('Hello')

let data = JSON.stringify(allOrder, null, 2);

fs.writeFile('orders.json', data, (err) => {
    if (err) throw err;
    console.log('Data written to file');
});

app.get("/url", (req, res, next) => {
    res.json(jsontest);
   });



app.listen(3000, () => {
 console.log("Server running on port 3000");
});

