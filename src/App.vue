<template>
  <div id="app">
    <MainGame />
  </div>
</template>

<script>
import MainGame from './components/MainGameMobile.vue'
import 'reset.css'

export default {
  name: 'App',
  components: {
    MainGame
  }
}
</script>
