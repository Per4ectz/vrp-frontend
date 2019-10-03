var express = require("express");
var app = express();
var fs = require('fs');

let jsontest = require('../src/studentx.json')

function generateRandomLat() {
    var arr = [];
    for(let i = 0; i<=9; i++) {
        // var arr = [];
        arr.push([])
        arr[i].push(Math.random().toFixed(6) * (+14 - +13) + +13, Math.random().toFixed(6) * (+100.6 - +100) + +100)
    }
    return arr;
}

var x = generateRandomLat()

// console.log(x[0])

// var myData = [];
// rows.each(function (index) {
//     var obj = { 
//         id: $this.find('.elementOne').val(),
//         name: $this.find('.elementTwo').text(),
//         type: 'marker',
//         coords: x[0]
//     };
//     myData.push(obj);
// });

var orders = [];
x.forEach((c) => {
    console.log(c)
    var s = {
        coordinates : c, width: 100,
        length: 100,
        height: 100,
        weight: 10 ,
    }
    orders.push(s)    
})
var allOrder = {
    data: orders
}

let data = JSON.stringify(allOrder, null, 2);

fs.writeFile('studentx.json', data, (err) => {
    if (err) throw err;
    console.log('Data written to file');
});

app.get("/url", (req, res, next) => {
    res.json(jsontest);
   });


app.listen(3000, () => {
 console.log("Server running on port 3000");
});

