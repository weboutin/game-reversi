<template>
  <div class="main-game">
    <div class="header">黑白棋</div>
    <div id="ctrl-area">
      <div class="menu">
        <div class="menu-restart" @click="clickRestart">投了</div>
        <div class="current-chess">轮到黑子</div>
        <div class="count">黑子数:{{ blackChessCount }}</div>
        <div class="count">白字数:{{ whiteChessCount }}</div>
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
    <CommonPopup :isShow="isShow" @close="isShow = false">
      <div class="restartPopup">
        <div class="restartPopup-ensure" @click="restart">认输</div>
        <div class="restartPopup-cancel" @click="clickCancel">取消</div>
      </div>
    </CommonPopup>
  </div>
</template>

<script>
import CommonPopup from '../components/common/popup'

const GAME_RECORD = 'game-record'



export default {
  name: 'MainGame',
  components: {
    CommonPopup
  },
  data: () => {
    return {
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
      score: 4,
      isShow: false,
      currentPlayer: 0,
      blackChessCount: 2,
      whiteChessCount: 2,
    }
  },
  methods: {
    play(i, j) {
      if (this.blocks[i][j] != -1) return
      //判断是否可以下子
      this.checkCanPlay();
      //翻转棋子
      const hasReversi = this.reversi(i, j)
      //不符合下棋规则
      if (!hasReversi) {
        return
      }
      //下子
      this.blocks[i][j] = this.currentPlayer
      //切换棋手
      if (this.currentPlayer == 0) {
        this.currentPlayer = 1
      } else {
        this.currentPlayer = 0
      }
      this.render()
      this.countChess()
    },

    countChess() {
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
    },

    checkCanPlay() {

    },
    reversi(m, n) {
      let hasReversi = false
      //往8个方向搜索是否存在最近同子
      let sameIndex = 0
      //往下搜索
      let i = m + 1, j = n
      let tmpM = m, tmpN = n
      while (i < 8) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == this.currentPlayer) {
          sameIndex = i
          break
        }
        i++
      }
      if (sameIndex != 0 && Math.abs(sameIndex - tmpM) != 1) {
        hasReversi = true
        while (tmpM < sameIndex) {
          this.blocks[tmpM][j] = this.currentPlayer
          tmpM++
        }
      }
      //往上搜索
      tmpM = m, tmpN = n
      sameIndex = 0
      i = m - 1, j = n
      while (i > 0) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == this.currentPlayer) {
          sameIndex = i
          break
        }
        i--
      }
      if (sameIndex != 0 && Math.abs(sameIndex - tmpM) != 1) {
        hasReversi = true
        while (tmpM > sameIndex) {
          this.blocks[tmpM][j] = this.currentPlayer
          tmpM--
        }
      }
      //往右搜索
      tmpM = m, tmpN = n
      sameIndex = 0
      i = m, j = n + 1
      while (j < 8) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == this.currentPlayer) {
          sameIndex = j
          break
        }
        j++
      }
      if (sameIndex != 0 && Math.abs(sameIndex - tmpN) != 1) {
        hasReversi = true
        while (tmpN < sameIndex) {
          this.blocks[i][tmpN] = this.currentPlayer
          tmpN++
        }
      }
      //往左搜索
      tmpM = m, tmpN = n
      sameIndex = 0
      i = m, j = n - 1
      while (j > 0) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == this.currentPlayer) {
          sameIndex = j
          break
        }
        j--
      }
      if (sameIndex != 0 && Math.abs(sameIndex - tmpN) != 1) {
        hasReversi = true
        while (tmpN > sameIndex) {
          this.blocks[i][tmpN] = this.currentPlayer
          tmpN--
        }
      }
      //往左上
      let sameMultIndex = 0
      tmpM = m, tmpN = n
      i = m - 1, j = n - 1
      while (i > 0 && j > 0) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == this.currentPlayer) {
          sameMultIndex = [i, j]
          break
        }
        j--
        i--
      }
      if (sameMultIndex != 0 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
        hasReversi = true
        while (tmpM > sameMultIndex[0] && tmpN > sameMultIndex[1]) {
          this.blocks[tmpM][tmpN] = this.currentPlayer
          tmpM--
          tmpN--
        }
      }
      //往左下
      sameMultIndex = 0
      tmpM = m, tmpN = n
      i = m + 1, j = n - 1
      while (i < 8 && j > 0) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == this.currentPlayer) {
          sameMultIndex = [i, j]
          break
        }
        i++
        j--
      }
      if (sameMultIndex != 0 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
        hasReversi = true
        while (tmpM < sameMultIndex[0] && tmpN > sameMultIndex[1]) {
          this.blocks[tmpM][tmpN] = this.currentPlayer
          tmpM++
          tmpN--
        }
      }
      //往右下
      sameMultIndex = 0
      tmpM = m, tmpN = n
      i = m + 1, j = n + 1
      while (i < 8 && j < 8) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == this.currentPlayer) {
          sameMultIndex = [i, j]
          break
        }
        i++
        j++
      }
      if (sameMultIndex != 0 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
        hasReversi = true
        while (tmpM < sameMultIndex[0] && tmpN < sameMultIndex[1]) {
          this.blocks[tmpM][tmpN] = this.currentPlayer
          tmpM++
          tmpN++
        }
      }
      //往右上
      sameMultIndex = 0
      tmpM = m, tmpN = n
      i = m - 1, j = n + 1
      while (i > 0 && j < 8) {
        if (this.blocks[i][j] == -1) break
        if (this.blocks[i][j] == this.currentPlayer) {
          sameMultIndex = [i, j]
          break
        }
        i--
        j++
      }
      if (sameMultIndex != 0 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
        hasReversi = true
        while (tmpM > sameMultIndex[0] && tmpN < sameMultIndex[1]) {
          this.blocks[tmpM][tmpN] = this.currentPlayer
          tmpM--
          tmpN++
        }
      }

      return hasReversi
    },
    clickRestart() {
      this.isShow = true
    },
    clickCancel() {
      this.isShow = false
    },
    restart() {
      localStorage.removeItem(GAME_RECORD)
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

    init() {
    },

  },
  mounted() {
    this.init()
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

.menu-score {
  width: 210px;
  height: 60px;
  background-color: rgb(227, 198, 67);
  border-radius: 5px;
  color: rgb(255, 255, 255);
  font-size: 30px;
  line-height: 60px;
  box-sizing: border-box;
  padding-left: 20px;
}

.menu-restart {
  width: 100px;
  height: 60px;
  background-color: rgb(201, 96, 96);
  line-height: 60px;
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
</style>
