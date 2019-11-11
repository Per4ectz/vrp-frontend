<template>
  <div id="app">
    <!-- <google-map /> -->
    <MapT />
  </div>
</template>

<script>
// import GoogleMap from "./components/GoogleMap";
import MapT from "./components/MapT";


export default {
  name: 'app',
  components: {
    MapT
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
