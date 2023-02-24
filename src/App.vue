<template>
  <div id="app">
    <div v-if="connectError" class="connect-fail">
      连接失败，请刷新重新
    </div>
    <template v-else>
      <div v-if="wsConnecting" class="loading">
        <svg width='40px' height='40px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid" class="uil-default">
          <rect x="0" y="0" width="100" height="100" fill="none" class="bk"></rect>
          <!--以一个点为原点，按一定角度旋转绘制矩形，并在矩形的opacity属性上添加上渐变效果 -->
          <!--rect绘制x y 是矩形左上角的坐标，width height是矩形的宽高，rx ry为矩形的圆角radius  rotate 旋转  -->
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(0 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0s' repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(30 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.08333333333333333s'
              repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(60 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.16666666666666666s'
              repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(90 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.25s' repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(120 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.3333333333333333s'
              repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(150 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.4166666666666667s'
              repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(180 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.5s' repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(210 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.5833333333333334s'
              repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(240 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.6666666666666666s'
              repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(270 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.75s' repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(300 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.8333333333333334s'
              repeatCount='indefinite' />
          </rect>
          <rect x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#00a9f2'
            transform='rotate(330 50 50) translate(0 -30)'>
            <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.9166666666666666s'
              repeatCount='indefinite' />
          </rect>
        </svg>
        <div class="loading-text">正在建立连接 ...</div>
      </div>
      <div v-else>
        <WebMode v-if="gameStatus == 1 || gameStatus == 2 || gameStatus == 3" />
        <Menu v-if="gameStatus == 0" />
        <ComputerMode v-if="gameStatus == 4" />
      </div>
    </template>
  </div>
</template>

<script>
import 'reset.css'

import WebMode from './components/WebMode.vue'
import Menu from './components/Menu.vue'
import ComputerMode from './components/ComputerMode.vue'
import store from './stores'
import WSService from './services/WSService'

export default {
  name: 'App',
  components: {
    WebMode,
    Menu,
    ComputerMode,
  },
  computed: {
    gameStatus: {
      get() {
        return store.state.gameStatus
      }
    }
  },
  data: function () {
    return {
      state: store.state.gameStatus,
      wsConnecting: true,
      connectError: false
    }
  },
  mounted() {
    //loading
    WSService.tryConnect(() => {
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
          store.commit('setNewestBlock', obj.data.newestBlock)
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
    }, () => {
      this.connectError = true
    })
  }
}
</script>

<style scoped>
.loading {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.loading-text {
  margin-top: 10px;
}

.connect-fail {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
</style>
