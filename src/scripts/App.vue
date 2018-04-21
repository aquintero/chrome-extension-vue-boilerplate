<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html {
  overflow: hidden;
}
.content {
  max-height: 100vh;
}
.scroll-container {
  height: 100%;
  overflow-y: scroll;
  backface-visibility: hidden;
}
</style>
