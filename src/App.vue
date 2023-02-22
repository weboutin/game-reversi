<template>
  <div id="app">
    <div v-if="wsConnecting">
      正在建立连接 ..
    </div>
    <div v-else>
      <MainGame v-if="!inMenu" />
      <JoinGame v-else />
    </div>
  </div>
</template>

<script>
import 'reset.css'

import MainGame from './components/MainGameMobile.vue'
import JoinGame from './components/JoinGame.vue'
import store from './stores'
import constant from './constant'
import WSService from './services/WSService'


export default {
  name: 'App',
  components: {
    MainGame,
    JoinGame
  },
  computed: {
    inMenu: {
      get() {
        return store.state.gameStatus === constant.GAME_STATUS.MENU
      }
    }
  },
  data: function () {
    return {
      state: store.state.gameStatus,
      wsConnecting: true
    }
  },
  mounted() {
    //loading
    WSService.connect(() => {
      const info = this.$cookies.get(this.$storagekey)
      if (info) {
        WSService.registerHandler('sync-success', (obj) => {
          if (obj.data.roomId != info.roomId) return
          store.commit('changeStatus', obj.data.gameStatus)
          store.commit('setRoomId', obj.data.roomId)
          store.commit('setUserId', obj.data.userId)
          store.commit('setBlocks', obj.data.blocks)
          const ownChess = obj.data.ownChess
          store.commit('setOwnPlayer', ownChess[obj.data.userId])
          store.commit('setCurrentPlayer', obj.data.currentPlayer)
          this.wsConnecting = false
        })
        WSService.send({
          action: 'sync',
          data: {
            userId: info.userId,
            roomId: info.roomId
          }
        })
      } else {
        this.wsConnecting = false
      }
    })
  }
}
</script>
