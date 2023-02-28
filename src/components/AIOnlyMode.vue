<template>
  <div>
    <Header />
    <div class="main">
      <div class="pannel">
        <div class="pannel-control">
          <button class="btn-restart" @click="restart">重开</button>
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
        @playerContinue="onPlayerContinue" :ownerStatus="0" @count="onCount" :isShowHints="isShowHints" />
    </div>
  </div>
</template>

<script>
import ChessBoard from './common/chessboard'
import Header from './common/header'
import AI from '../AI/index'
import constant from '@/constant'

export default {
  name: 'ComputerMode',
  components: {
    ChessBoard,
    Header
  },
  data: () => {
    return {
      currentPlayer: 0,
      blackCount: 0,
      whiteCount: 0,
      isShowHints: false,
      levelOneWin: 0,
      levelTwoWin: 0,
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
      // this.currentPlayer = this.switchPlayer(this.currentPlayer)
      setTimeout(() => {
        if (data.player == 0) {
          const { m, n } = AI.play(data.blocks, 1, 3)
          this.$refs['chessBoard'].play(m, n, 1)
        } else {
          const { m, n } = AI.play(data.blocks, 0, 2)
          this.$refs['chessBoard'].play(m, n, 0)
        }
      }, 0);
    },
    onEnd: function (winner) {
      // this.$toast.show(`${this.transferText(winner)}胜利`)
      winner == 0 ? this.levelTwoWin++ : this.levelOneWin++
      console.log(`levelOne胜场 ${this.levelOneWin}, levelTwo胜场 ${this.levelTwoWin}`)
      setTimeout(() => {
        console.log('开始下一场')
        this.restart()
        this.onPlay({
          blocks: constant.DEFAULT_BLOCKS,
          player: 1
        })
      }, 0)
    },
    onPlayerContinue(player, blocks) {
      // this.$toast.show(`${this.transferText(player)}继续行棋`)
      console.log(`${this.transferText(player)}继续行棋`)
      setTimeout(() => {
        if (player == 0) {
          const { m, n } = AI.play(blocks, 0, 3)
          this.$refs['chessBoard'].play(m, n, 0)
        } else {
          const { m, n } = AI.play(blocks, 1, 2)
          this.$refs['chessBoard'].play(m, n, 1)
        }
      }, 0)
    },
    onCount(black, white) {
      this.blackCount = black
      this.whiteCount = white
    }
  },
  mounted() {
    this.onPlay({
      blocks: constant.DEFAULT_BLOCKS,
      player: 1
    })
  }

}
</script>

<style scoped>
.main {
  margin-top: 10px;
  padding: 0 10px;
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
</style>