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
@import url('https://fonts.googleapis.com/css?family=Montserrat&display=swap');
#app {
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 1rem;
}

@media (max-width: 1440px) {
  #app {
    font-size: 0.8rem;
  }
}
</style>
