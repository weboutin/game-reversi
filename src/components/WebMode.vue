<template>
  <div>
    <Header />
    <div class="main-wrap">
      <ServerMsg v-if="gameStatus == 1" :message="`房间号${roomId}：等待对手加入 ...`"></ServerMsg>
      <div class="main">
        <div class="pannel">
          <div class="pannel-control">
            <button class="btn-restart" @click="clickLost">认输</button>
            <button class="btn-hint" @click="getHints">
              {{ isShowHints ? '关闭提示' : '提示' }}
            </button>
          </div>
          <div class="pannel-display">
            <div class="pannel-display-item">黑子数: {{ blackCount }}</div>
            <div class="pannel-display-item">白子数: {{ whiteCount }}</div>
          </div>
        </div>
        <ChessBoard ref="chessBoard" :newestBlock="[]" @end=onEnd @play="onPlay" :currentPlayer="currentPlayer"
          @playerContinue="onPlayerContinue" :ownerStatus="ownPlayer" @count="onCount" :isShowHints="isShowHints"
          :forceUpdateBlocks="blocksFromServer" :forceUpdateNewest="newestBlockFromServer" :chessContinueChecker="false"/>
        <div class="new-game-box" v-if="ownPlayer == 0 && gameStatus == 3">
          <div class="btn-new-game" @click="continueNext">开始下一局</div>
        </div>
      </div>
    </div>
    <CommonPopup :isShow="isShow" @close="isShow = false">
      <div class="give-up-popup">
        <div class="give-up-popup-ensure" @click="giveup">认输</div>
        <div class="give-up-popup-cancel" @click="clickCancel">取消</div>
      </div>
    </CommonPopup>
  </div>
</template>

<script>
import CommonPopup from '../components/common/popup'
import store from '../stores'
import ServerMsg from '../components/common/server-msg'
import wsService from '@/services/WSService'
import constant from '../constant'
import ChessBoard from './common/chessboard'

import Header from '@/components/common/header'

export default {
  name: 'MainGame',
  components: {
    CommonPopup,
    ServerMsg,
    Header,
    ChessBoard
  },
  data: () => {
    return {
      isShow: false,
      blackCount: 0,
      whiteCount: 0,
      isShowHints: false,
      blocksFromServer: [],
      newestBlockFromServer: []
    }
  },
  computed: {
    gameStatus: {
      get() {
        return store.state.gameStatus
      }
    },
    roomId: {
      get() {
        return store.state.roomId
      }
    },
    blocks: {
      get() {
        return store.state.blocks
      },
    },
    currentPlayer: {
      get() {
        return store.state.currentPlayer
      }
    },
    ownPlayer: {
      get() {
        return store.state.ownPlayer
      }
    },
    userId: {
      get() {
        return store.state.userId
      }
    },
    newestBlock: {
      get() {
        return store.state.newestBlock
      }
    }
  },
  watch: {
    blocks: {
      immediate: true,
      handler: function () {
        this.blocksFromServer = this.blocks
      }
    },
    newestBlock: {
      immediate: true,
      handler: function () {
        this.newestBlockFromServer = this.newestBlock
      }
    }
  },
  methods: {
    restart() {
      this.currentPlayer = 0
      this.$refs['chessBoard'].restart()
    },
    getHints() {
      this.isShowHints = !this.isShowHints
    },
    transferText(player) {
      return player == 0 ? '黑子' : '白子'
    },
    switchPlayer(player) {
      return player == 0 ? 1 : 0
    },
    onPlay: function (data) {
      store.commit('setCurrentPlayer', this.switchPlayer(this.currentPlayer))
      wsService.send({
        action: 'play',
        data: {
          roomId: this.roomId,
          blocks: data.blocks,
          newestBlock: [data.i, data.j]
        }
      })
    },
    onEnd: function () {
      // this.$toast.show(`${this.transferText(winner)}胜利`)
    },
    onPlayerContinue(player) {
      console.log(`continue ${player}`)
    },
    onCount(black, white) {
      this.blackCount = black
      this.whiteCount = white
    },
    giveup() {
      this.isShow = false
      wsService.send({
        action: 'giveup',
        data: {
          roomId: this.roomId,
          userId: this.userId
        }
      })
    },
    continueNext() {
      wsService.send({
        action: 'restart',
        data: {
          roomId: this.roomId,
        }
      })
    },
    getCurrentChessColor(player) {
      return player == 0 ? '黑' : '白'
    },
    clickLost() {
      this.isShow = true
    },
    clickCancel() {
      this.isShow = false
    },
    resetAll() {
      store.commit('setBlocks', constant.DEFAULT_BLOCKS)
      store.commit('setCurrentPlayer', 0)
      store.commit('setNewestBlock', [])
      store.commit('changeStatus', constant.GAME_STATUS.END)
    }
  },
  mounted() {
    wsService.registerHandler('start-game', (obj) => {
      this.$toast.show('游戏开始')
      store.commit('changeStatus', constant.GAME_STATUS.STARTED)
      store.commit('setBlocks', obj.data.blocks)
    })

    wsService.registerHandler('play-success', (obj) => {
      this.hintGroups = []
      store.commit('setBlocks', obj.data.blocks)
      store.commit('setCurrentPlayer', obj.data.currentPlayer)
      store.commit('setNewestBlock', obj.data.newestBlock)
    })

    wsService.registerHandler('chess-continue', (obj) => {
      this.$toast.show(`[${obj.data.currentPlayer == 0 ? '黑' : '白'}]子继续`)
      store.commit('setBlocks', obj.data.blocks)
      store.commit('setCurrentPlayer', obj.data.currentPlayer)
    })

    wsService.registerHandler('game-end', (obj) => {
      const winner = obj.data.winner
      this.$toast.show(`${winner == 0 ? '黑子' : '白子'} 胜利`)
      this.resetAll()
    })

    wsService.registerHandler('restart-success', () => {
      this.resetAll()
      store.commit('changeStatus', constant.GAME_STATUS.STARTED)
    })

    wsService.registerHandler('giveup-success', (obj) => {
      const giveUpPlayer = obj.data.giveUpPlayer
      this.$toast.show(`${giveUpPlayer == this.userId ? '你' : '对方'}认输了，棋局将重新开始`)
      this.resetAll()
      store.commit('changeStatus', constant.GAME_STATUS.STARTED)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-wrap {
  width: 100%;
}

.main {
  box-sizing: border-box;
  padding: 0 10px;
  width: 100%;
}

.pannel-control {
  width: 218px;
  display: flex;
  justify-content: space-between;
}

.btn-restart {
  width: 100px;
  height: 40px;
  border: none;
  background-color: rgb(98, 145, 214);
  line-height: 40px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  color: rgb(255, 255, 255);
}

.pannel {
  display: flex;
  height: 80px;
  align-items: center;
  justify-content: space-between;
}

.btn-hint {
  width: 100px;
  height: 40px;
  border: none;
  background-color: rgb(112, 230, 138);
  line-height: 40px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  color: rgb(255, 255, 255);
}

.pannel-display {
  display: flex;
  align-items: end;
  height: 40px;
  font-size: 14px;
  color: rgb(85, 82, 82, 0.8);
}

.pannel-display-item {
  margin-left: 10px;
}

.give-up-popup {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
  padding-bottom: 50px;
}

.give-up-popup-ensure {
  width: 80%;
  height: 50px;
  background-color: #0065e6;
  color: #fff;
  box-sizing: border-box;
  border-radius: 10px;
  line-height: 50px;
  text-align: center;
}

.give-up-popup-cancel {
  width: 80%;
  height: 50px;
  background-color: #e6ece1;
  box-sizing: border-box;
  border-radius: 10px;
  line-height: 50px;
  text-align: center;
  margin-top: 20px;
}

.btn-new-game {
  width: 100%;
  height: 40px;
  background-color: rgb(98, 145, 214);
  line-height: 40px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  color: rgb(255, 255, 255);
  margin-top: 20px;
}
</style>
