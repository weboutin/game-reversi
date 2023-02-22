<template>
  <div class="main-game">
    <div class="header">黑白棋</div>
    <div id="ctrl-area">
      <div class="menu">
        <div class="menu-lost" @click="clickLost">投了</div>
        <div class="menu-score">
          <div class="current-chess">轮到 {{ this.currentPlayer == 0 ? '黑子' : '白子' }}</div>
          <div class="count">黑子数:{{ blackChessCount }}</div>
          <div class="count">白字数:{{ whiteChessCount }}</div>
        </div>
      </div>
      <div class="ctr-pannel-box">
        <div class="ctr-pannel">
          <div v-for="row, rowIndex in blocks" :key="rowIndex" class="ctr-pannel-row">
            <div v-for="block, blockIndex in row" :key="`${rowIndex}-${blockIndex}`" :class="['block-box']">
              <div class="block" @click="play(rowIndex, blockIndex)">
                <div :class="['chess', block == 0 ? 'black-chess' : 'white-chess']" v-if="block != -1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="new-game-box">
      <div class="btn-new-game">开始下一局</div>
    </div>
    <CommonPopup :isShow="isShow" @close="isShow = false">
      <div class="restartPopup">
        <div class="restartPopup-ensure" @click="restart">认输</div>
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
      // gameStatus: store.state.gameStatus,
      blocks: [
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, 0, 1, -1, -1, -1],
        [-1, -1, -1, 1, 0, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1],
      ],
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
      score: 4,
      isShow: false,
      currentPlayer: 0,
      blackChessCount: 2,
      whiteChessCount: 2,
      isEnd: false
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
    }
  },
  methods: {
    getCurrentChessColor(player) {
      return player == 0 ? '黑' : '白'
    },
    getAnotherPlayer() {
      return this.currentPlayer == 0 ? 1 : 0
    },
    play(i, j) {
      if (this.blocks[i][j] != -1) return
      //翻转棋子
      const { hasReversi, tmpBlocks } = this.reversi(i, j, this.currentPlayer)
      //不符合下棋规则
      if (!hasReversi) {
        return
      }
      //下子
      this.blocks = tmpBlocks
      this.blocks[i][j] = this.currentPlayer

      this.render()
      // 判断胜负
      const isEnd = this.countChess()
      if (isEnd) return

      //判断对手是否存在下子空间
      const canPlay = this.checkCanPlay();

      //继续由当前棋手下子
      if (!canPlay) {
        this.$message
        this.$toast.show(`${this.getCurrentChessColor(this.getAnotherPlayer)}子没有可放置位置，本轮弃权`)
        return
      }


      //切换棋手
      if (this.currentPlayer == 0) {
        this.currentPlayer = 1
      } else {
        this.currentPlayer = 0
      }
    },

    countChess() {
      this.blackChessCount = 0
      this.whiteChessCount = 0
      this.emptyChess = 0
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (this.blocks[i][j] == 0) {
            this.blackChessCount++
          } else if (this.blocks[i][j] == 1) {
            this.whiteChessCount++
          } else if (this.blocks[i][j] == -1) {
            this.emptyChess++
          }
        }
      }
      // 棋盘下满
      // 其中一方为0
      if (this.blackChessCount == 0 || this.whiteChessCount == 0 || this.emptyChess == 0) {
        if (this.blackChessCount > this.whiteChessCount) {
          this.$toast.show(`黑子胜利`)
        } else {
          this.$toast.show(`白子子胜利`)
        }
        this.isEnd = true
        return true
      }
      return false
    },

    checkCanPlay() {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (this.blocks[i][j] == -1) {
            const { hasReversi } = this.reversi(i, j, this.getAnotherPlayer(this.currentPlayer))
            if (hasReversi) {
              return true
            }
          }

        }
      }
      return false
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
      const info = this.$cookies.get(this.$storagekey)
      info.gameStatus = constant.GAME_STATUS.STARTED
      store.commit('changeStatus', constant.GAME_STATUS.STARTED)
      this.$cookies.set(this.$storagekey, JSON.stringify(info))
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

.menu-score {
  width: 220px;
  padding-bottom: 5px;
  box-sizing: border-box;
  height: 40px;
  display: flex;
  align-items: end;
  justify-content: space-between;
}
</style>
