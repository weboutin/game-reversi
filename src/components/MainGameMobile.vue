<template>
  <div class="main-game">
    <div class="header">黑白棋</div>
    <div id="ctrl-area">
      <div class="menu">
        <div class="menu-lost" @click="clickLost">投降</div>
        <div class="menu-hint" @click="getHints">提示</div>
        <div class="menu-record">
          <div class="menu-user">
            <span class="menu-item">持有 {{ this.ownPlayer == 0 ? '黑子' : '白子' }}</span>
            <span class="menu-item">轮到 {{ this.currentPlayer == 0 ? '黑子' : '白子' }}</span>
          </div>
          <div class="menu-score">
            <span class="menu-item">黑子数:{{ blackChessCount }}</span>
            <span class="menu-item">白子数:{{ whiteChessCount }}</span>
          </div>
        </div>
      </div>
      <div class="ctr-pannel-box">
        <div class="ctr-pannel">
          <div v-for="row, rowIndex in blocks" :key="rowIndex" class="ctr-pannel-row">
            <div v-for="block, blockIndex in row" :key="`${rowIndex}-${blockIndex}`" :class="['block-box']">
              <!-- <div :class="['block', (rowIndex == newestBlock[0] && blockIndex == newestBlock[1]) ? 'newest-block' : '']" -->
              <div class="block" @click="play(rowIndex, blockIndex)">
                <div class="newest-block" v-if="rowIndex == newestBlock[0] && blockIndex == newestBlock[1]"></div>
                <div class="hint-block" v-if="hintGroups.includes(`${rowIndex},${blockIndex}`)"></div>
                <div :class="['chess', block == 0 ? 'black-chess' : 'white-chess']" v-if="block != -1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="new-game-box" v-if="ownPlayer == 0 && gameStatus == 3">
      <div class="btn-new-game" @click="continueNext">开始下一局</div>
    </div>
    <CommonPopup :isShow="isShow" @close="isShow = false">
      <div class="restartPopup">
        <div class="restartPopup-ensure" @click="giveup">认输</div>
        <div class="restartPopup-cancel" @click="clickCancel">取消</div>
      </div>
    </CommonPopup>
    <ServerMsg v-if="gameStatus == 1" :message="`房间号${roomId}：等待对手加入 ...`"></ServerMsg>
  </div>
</template>

<script>
import CommonPopup from '../components/common/popup'
import store from '../stores'
import ServerMsg from '../components/common/server-msg'
import wsService from '@/services/WSService'
import constant from '../constant'



export default {
  name: 'MainGame',
  components: {
    CommonPopup,
    ServerMsg
  },
  data: () => {
    return {
      newestBlock: [],
      // gameStatus: store.state.gameStatus,
      // blocks: [
      //   [-1, -1, -1, -1, -1, -1, -1, -1],
      //   [-1, -1, -1, -1, -1, -1, -1, -1],
      //   [-1, -1, -1, -1, -1, -1, -1, -1],
      //   [-1, -1, -1, 0, 1, -1, -1, -1],
      //   [-1, -1, -1, 1, 0, -1, -1, -1],
      //   [-1, -1, -1, -1, -1, -1, -1, -1],
      //   [-1, -1, -1, -1, -1, -1, -1, -1],
      //   [-1, -1, -1, -1, -1, -1, -1, -1],
      // ],
      // blocks: [
      //   [1, 1, 1, -1, 1, 1, 1, 1],
      //   [0, 1, 1, -1, 1, 1, 0, 1],
      //   [0, 0, 1, 1, 1, 0, 1, 1],
      //   [0, 0, 0, 0, 1, 0, 0, 1],
      //   [0, 0, 1, 0, 1, 1, 1, 1],
      //   [0, 0, 0, 0, 0, 1, -1, 1],
      //   [0, 0, 1, 0, 1, 0, 1, -1],
      //   [0, 0, 0, 0, 0, 0, 0, -1],
      // ],
      isShow: false,
      // currentPlayer: 0,
      blackChessCount: 2,
      whiteChessCount: 2,
      hintGroups: []
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
    }
  },
  watch: {
    blocks: {
      immediate: true,
      handler: function () {
        this.blackChessCount = 0
        this.whiteChessCount = 0
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (this.blocks[i][j] == 0) {
              this.blackChessCount++
            } else if (this.blocks[i][j] == 1) {
              this.whiteChessCount++
            }
          }
        }

      }
    }
  },
  methods: {
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
    getHints() {
      if (this.currentPlayer != this.ownPlayer) {
        this.$toast.show('正在等待对方下棋')
        return
      }
      const tmp = []
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (this.blocks[i][j] == -1) {
            const { hasReversi } = this.reversi(i, j, this.currentPlayer)
            if (hasReversi) tmp.push(`${i},${j}`)
          }
        }
      }
      this.hintGroups = tmp
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
    play(i, j) {
      if (this.currentPlayer != this.ownPlayer) return
      if (this.blocks[i][j] != -1) return
      //翻转棋子
      const { hasReversi, tmpBlocks } = this.reversi(i, j, this.currentPlayer)
      //不符合下棋规则
      if (!hasReversi) {
        return
      }
      //下子
      tmpBlocks[i][j] = this.currentPlayer

      wsService.send({
        action: 'play',
        data: {
          newestBlock: [i, j],
          roomId: this.roomId,
          blocks: tmpBlocks,
        }
      })
    },
    reversi(m, n, player) {
      let tmpBlocks = JSON.parse(JSON.stringify(this.blocks))
      let hasReversi = false
      //往8个方向搜索是否存在最近同子
      let sameIndex = -1
      //往下搜索
      let i = m + 1, j = n
      let tmpM = m, tmpN = n
      while (i < 8) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == player) {
          sameIndex = i
          break
        }
        i++
      }
      if (sameIndex != -1 && Math.abs(sameIndex - tmpM) != 1) {
        hasReversi = true
        while (tmpM < sameIndex) {
          tmpBlocks[tmpM][j] = player
          tmpM++
        }
      }
      //往上搜索
      tmpM = m, tmpN = n
      sameIndex = -1
      i = m - 1, j = n
      while (i >= 0) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == player) {
          sameIndex = i
          break
        }
        i--
      }
      if (sameIndex != -1 && Math.abs(sameIndex - tmpM) != 1) {
        hasReversi = true
        while (tmpM > sameIndex) {
          tmpBlocks[tmpM][j] = player
          tmpM--
        }
      }
      //往右搜索
      tmpM = m, tmpN = n
      sameIndex = -1
      i = m, j = n + 1
      while (j < 8) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == player) {
          sameIndex = j
          break
        }
        j++
      }
      if (sameIndex != -1 && Math.abs(sameIndex - tmpN) != 1) {
        hasReversi = true
        while (tmpN < sameIndex) {
          tmpBlocks[i][tmpN] = player
          tmpN++
        }
      }
      //往左搜索
      tmpM = m, tmpN = n
      sameIndex = -1
      i = m, j = n - 1
      while (j >= 0) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == player) {
          sameIndex = j
          break
        }
        j--
      }
      if (sameIndex != -1 && Math.abs(sameIndex - tmpN) != 1) {
        hasReversi = true
        while (tmpN > sameIndex) {
          tmpBlocks[i][tmpN] = player
          tmpN--
        }
      }
      //往左上
      let sameMultIndex = -1
      tmpM = m, tmpN = n
      i = m - 1, j = n - 1
      while (i >= 0 && j >= 0) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == player) {
          sameMultIndex = [i, j]
          break
        }
        j--
        i--
      }
      if (sameMultIndex != -1 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
        hasReversi = true
        while (tmpM > sameMultIndex[0] && tmpN > sameMultIndex[1]) {
          tmpBlocks[tmpM][tmpN] = player
          tmpM--
          tmpN--
        }
      }
      //往左下
      sameMultIndex = -1
      tmpM = m, tmpN = n
      i = m + 1, j = n - 1
      while (i < 8 && j >= 0) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == player) {
          sameMultIndex = [i, j]
          break
        }
        i++
        j--
      }
      if (sameMultIndex != -1 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
        hasReversi = true
        while (tmpM < sameMultIndex[0] && tmpN > sameMultIndex[1]) {
          tmpBlocks[tmpM][tmpN] = player
          tmpM++
          tmpN--
        }
      }
      //往右下
      sameMultIndex = -1
      tmpM = m, tmpN = n
      i = m + 1, j = n + 1
      while (i < 8 && j < 8) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == player) {
          sameMultIndex = [i, j]
          break
        }
        i++
        j++
      }
      if (sameMultIndex != -1 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
        hasReversi = true
        while (tmpM < sameMultIndex[0] && tmpN < sameMultIndex[1]) {
          tmpBlocks[tmpM][tmpN] = player
          tmpM++
          tmpN++
        }
      }
      //往右上
      sameMultIndex = -1
      tmpM = m, tmpN = n
      i = m - 1, j = n + 1
      while (i >= 0 && j < 8) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == player) {
          sameMultIndex = [i, j]
          break
        }
        i--
        j++
      }
      if (sameMultIndex != -1 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
        hasReversi = true
        while (tmpM > sameMultIndex[0] && tmpN < sameMultIndex[1]) {
          tmpBlocks[tmpM][tmpN] = player
          tmpM--
          tmpN++
        }
      }

      return { hasReversi, tmpBlocks }
    },
    clickLost() {
      this.isShow = true
    },
    clickCancel() {
      this.isShow = false
    },
    restart() {
      this.isShow = false
      this.isShowLost = false
      this.blocks = [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
      ]
      this.render()
    },
    render() {
      for (let i = 0; i < this.blocks.length - 1; i++) {
        for (let j = 0; j < this.blocks[i].length; j++) {
          this.$set(this.blocks[i], j, this.blocks[i][j])
        }
      }
    },

  },
  mounted() {
    wsService.registerHandler('start-game', () => {
      this.$toast.show('游戏开始')
      store.commit('changeStatus', constant.GAME_STATUS.STARTED)
    })

    wsService.registerHandler('play-success', (obj) => {
      this.hintGroups = []
      store.commit('setBlocks', obj.data.blocks)
      store.commit('setCurrentPlayer', obj.data.currentPlayer)
      const newestBlock = obj.data.newestBlock
      this.newestBlock = newestBlock
      this.render()
    })

    wsService.registerHandler('chess-continue', (obj) => {
      this.$toast.show(`[${obj.data.currentPlayer == 0 ? '黑': '白'}]子继续`)
      store.commit('setBlocks', obj.data.blocks)
      store.commit('setCurrentPlayer', obj.data.currentPlayer)
      this.render()
    })

    wsService.registerHandler('game-end', (obj) => {
      store.commit('setBlocks', obj.data.blocks)
      store.commit('changeStatus', constant.GAME_STATUS.END)
      const winner = obj.data.winner
      this.$toast.show(`${winner == 0 ? '黑子' : '白子'} 胜利`)
      this.render()
    })
    wsService.registerHandler('restart-success', (obj) => {
      store.commit('setBlocks', obj.data.blocks)
      this.$toast.show(`重新开始游戏`)
      store.commit('changeStatus', constant.GAME_STATUS.STARTED)
      this.render()
    })
    wsService.registerHandler('giveup-success', (obj) => {
      const giveUpPlayer = obj.data.giveUpPlayer
      store.commit('setBlocks', obj.data.blocks)
      this.$toast.show(`${giveUpPlayer == this.userId ? '你' : '对方'}认输了，棋局将重新开始`)
      store.commit('changeStatus', constant.GAME_STATUS.STARTED)
      this.render()
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-game {
  width: 100%;
  box-sizing: border-box;
}

.header {
  width: 100%;
  height: 58px;
  line-height: 58px;
  border-bottom: 1px solid;
  box-sizing: border-box;
  padding: 0 10px;
  font-size: 30px;
}

.menu {
  margin-top: 30px;
  width: 100%;
  padding: 0 10px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  /* justify-content: ; */
}


.menu-lost {
  width: 100px;
  height: 40px;
  background-color: rgb(96, 189, 201);
  line-height: 40px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  color: rgb(255, 255, 255);
}

.menu-hint {
  margin-left: 10px;
  width: 100px;
  height: 40px;
  background-color: rgb(96, 201, 96);
  line-height: 40px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  color: rgb(255, 255, 255);
}


.menu-change {
  width: 100px;
  height: 40px;
  background-color: rgb(201, 96, 96);
  line-height: 40px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  color: rgb(255, 255, 255);
}

.ctr-pannel-box {
  width: 100%;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 10px;
  margin-top: 30px;
}

.ctr-pannel {
  border: 3px solid rgb(183, 172, 160);
  border-radius: 3px;
  width: 363px;
  height: 363px;
}

.ctr-pannel-row {
  display: flex;
}

.block-box {
  width: 45px;
  height: 45px;
  box-sizing: border-box;
  padding: 3px;
}

.block {
  text-align: center;
  font-size: 40px;
  width: 42px;
  height: 42px;
  line-height: 42px;
  background-color: rgb(200, 192, 179);
  display: flex;
  justify-content: center;
  align-items: center;
}

.restartPopup {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
  padding-bottom: 50px;
}

.restartPopup-ensure {
  width: 80%;
  height: 50px;
  background-color: #0065e6;
  color: #fff;
  box-sizing: border-box;
  border-radius: 10px;
  line-height: 50px;
  text-align: center;
}

.restartPopup-cancel {
  width: 80%;
  height: 50px;
  background-color: #e6ece1;
  box-sizing: border-box;
  border-radius: 10px;
  line-height: 50px;
  text-align: center;
  margin-top: 20px;
}

.white-chess {
  background-color: white;
}

.black-chess {
  background-color: black;
}

.chess {
  width: 30px;
  height: 30px;
  border-radius: 100px;
}

.new-game-box {
  padding: 0 10px;
  box-sizing: border-box;
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
}

.menu-record {
  width: 220px;
  padding-bottom: 5px;
  box-sizing: border-box;
  height: 40px;
  margin-left: 10px;
  /* align-items: end;
  justify-content: space-between; */
}

.menu-user {
  display: flex;
}

.menu-item {
  width: 100px;
}

.menu-score {
  display: flex;
  margin-top: 5px;
}

.newest-block {
  width: 40px;
  height: 40px;
  border: 1px solid;
  position: absolute;
  color: #0065e6;
}

.hint-block {
  width: 20px;
  height: 20px;
  border: 1px solid;
  position: absolute;
  color: rgb(81, 155, 75);
  border-radius: 100px;
}
</style>
