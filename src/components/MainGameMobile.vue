<template>
  <div class="main-game">
    <div class="header">2048</div>
    <div id="ctrl-area">
      <div class="menu">
        <div class="menu-score">score: {{ score }}</div>
        <div class="menu-restart" @click="clickRestart">重开</div>
      </div>
      <div class="ctr-pannel-box">
        <div class="ctr-pannel">
          <div v-for="row, rowIndex in blocks" :key="rowIndex" class="ctr-pannel-row">
            <div v-for="block, blockIndex in row" :key="`${rowIndex}-${blockIndex}`" :class="['block-box']">
              <div :class="['block', `block-custom-style-${block}`]">
                {{ block == -1 ? '' : block }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <CommonPopup :isShow="isShow" @close="isShow = false">
      <div class="restartPopup">
        <div class="restartPopup-ensure" @click="restart">重开</div>
        <div class="restartPopup-cancel" @click="clickCancel">取消</div>
      </div>
    </CommonPopup>
    <CommonPopup :isShow="isShowLost" @close="isShowLost = false">
      <div class="lostPopup">
        <div class="lostPopup-text">You Lost !</div>
        <div class="restartPopup-ensure" @click="restart">重开</div>
      </div>
    </CommonPopup>
  </div>
</template>

<script>
import CommonPopup from '../components/common/popup'

const GAME_RECORD = 'game-record'


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
}

export default {
  name: 'MainGame',
  components: {
    CommonPopup
  },
  data: () => {
    return {
      blocks: [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
      ],
      score: 4,
      isShow: false,
      isShowLost: false
    }
  },
  methods: {
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
      this.createRandom([2], 2)
      this.render()
    },
    createRandom(values, count) {
      let value = values[0]
      if (values.length > 1) {
        value = getRandomInt(0, 10) < 5 ? values[0] : values[1]
      }
      // 空白的位置的数量
      for (let n = 0; n < count; n++) {
        let emptyCount = 0
        for (let i = 0; i < this.blocks.length; i++) {
          for (let j = 0; j < this.blocks[i].length; j++) {
            if (this.blocks[i][j] == -1) {
              emptyCount++
            }
          }
        }
        let index = getRandomInt(0, emptyCount)
        for (let i = 0; i < this.blocks.length; i++) {
          for (let j = 0; j < this.blocks[i].length; j++) {
            if (this.blocks[i][j] !== -1) continue
            if (index == 0) {
              this.blocks[i][j] = value
            }
            index--;
          }
        }
      }
      this.$set(this.blocks, this.blocks)
    },
    mergeBlock(direction, reverse) {
      let moved = false
      if (reverse) {
        for (let i = 0; i < this.blocks.length; i++) {
          for (let j = 0; j < this.blocks[i].length; j++) {
            let next, tmpi, tmpj
            if (direction == 'row') {
              for (let n = j; n < this.blocks[i].length - 1; n++) {
                next = this.blocks[i][n + 1]
                if (next != -1) {
                  tmpi = i
                  tmpj = n + 1
                  break
                }
              }
            } else {
              for (let n = i; n < this.blocks.length - 1; n++) {
                next = this.blocks[n + 1][j]
                if (next != -1) {
                  tmpi = n + 1
                  tmpj = j
                  break
                }
              }
            }
            if (next == -1) continue
            if (this.blocks[i][j] == next) {
              moved = true
              this.blocks[i][j] = this.blocks[i][j] * 2
              this.blocks[tmpi][tmpj] = -1
            }
          }
        }
      } else {
        for (let i = this.blocks.length - 1; i >= 0; i--) {
          for (let j = this.blocks[i].length - 1; j >= 0; j--) {
            let next, tmpi, tmpj
            if (direction == 'row') {
              for (let n = j; n > 0; n--) {
                next = this.blocks[i][n - 1]
                if (next != -1) {
                  tmpi = i
                  tmpj = n - 1
                  break
                }
              }
            } else {
              for (let n = i; n > 0; n--) {
                next = this.blocks[n - 1][j]
                if (next != -1) {
                  tmpi = n - 1
                  tmpj = j
                  break
                }
              }
            }
            if (next == -1) continue
            if (this.blocks[i][j] == next) {
              moved = true
              this.blocks[i][j] = this.blocks[i][j] * 2
              this.blocks[tmpi][tmpj] = -1
            }
          }
        }
      }


      if (direction == 'row') {
        if (reverse) {
          for (let i = 0; i < this.blocks.length; i++) {
            for (let j = 0; j < this.blocks[i].length - 1; j++) {
              for (let k = 0; k < this.blocks[i].length - 1; k++) {
                if (this.blocks[i][k] == -1) {
                  if (this.blocks[i][k + 1] != -1) moved = true
                  let tmp = this.blocks[i][k]
                  this.blocks[i][k] = this.blocks[i][k + 1]
                  this.blocks[i][k + 1] = tmp
                }
              }
            }
          }
        } else {
          for (let i = this.blocks.length - 1; i >= 0; i--) {
            for (let j = this.blocks.length - 1; j >= 0; j--) {
              for (let k = this.blocks[i].length - 1; k > 0; k--) {
                if (this.blocks[i][k] == -1) {
                  if (this.blocks[i][k - 1] != -1) moved = true
                  let tmp = this.blocks[i][k]
                  this.blocks[i][k] = this.blocks[i][k - 1]
                  this.blocks[i][k - 1] = tmp
                }
              }
            }
          }

        }
      } else {
        if (reverse) {
          for (let i = 0; i < this.blocks.length - 1; i++) {
            for (let j = 0; j < this.blocks[i].length; j++) {
              for (let k = 0; k < this.blocks[i].length - 1; k++) {
                if (this.blocks[k][j] == -1) {
                  if (this.blocks[k + 1][j] != -1) moved = true
                  let tmp = this.blocks[k][j]
                  this.blocks[k][j] = this.blocks[k + 1][j]
                  this.blocks[k + 1][j] = tmp

                }
              }
            }
          }
        } else {
          for (let i = this.blocks.length - 1; i >= 0; i--) {
            for (let j = this.blocks.length - 1; j >= 0; j--) {
              for (let k = this.blocks[i].length - 1; k > 0; k--) {
                if (this.blocks[k][j] == -1) {
                  if (this.blocks[k - 1][j] != -1) moved = true
                  let tmp = this.blocks[k][j]
                  this.blocks[k][j] = this.blocks[k - 1][j]
                  this.blocks[k - 1][j] = tmp
                }
              }
            }
          }

        }
      }
      if (!moved) return


      for (let i = 0; i < this.blocks.length - 1; i++) {
        for (let j = 0; j < this.blocks[i].length; j++) {
          this.$set(this.blocks[i], j, this.blocks[i][j])
        }
      }

      let maxBlockValue = 2;
      this.render()
      if (maxBlockValue < 512) {
        this.createRandom([2], 1)
      } else if (maxBlockValue >= 512 && maxBlockValue < 1024) {
        this.createRandom([2], 1)
      } else if (maxBlockValue >= 1024) {
        this.createRandom([2, 4], 1)
      }


      this.score = 0
      for (let i = 0; i < this.blocks.length; i++) {
        for (let j = 0; j < this.blocks[i].length; j++) {
          if (this.blocks[i][j] != -1) {
            this.score += this.blocks[i][j]
          }
        }
      }

      if (this.checkIsLost()) {
        localStorage.removeItem(GAME_RECORD)
        this.isShowLost = true
      }

      localStorage.setItem(GAME_RECORD, JSON.stringify(this.blocks))
    },
    render() {
      for (let i = 0; i < this.blocks.length - 1; i++) {
        for (let j = 0; j < this.blocks[i].length; j++) {
          this.$set(this.blocks[i], j, this.blocks[i][j])
        }
      }
    },

    init() {
      const record = localStorage.getItem(GAME_RECORD)
      if (record) {
        this.blocks = JSON.parse(record)
        this.render()
      } else {
        this.createRandom([2], 2)
      }
    },
    checkIsLost() {
      const len = this.blocks.length
      for (let i = 0; i < this.blocks.length; i++) {
        for (let j = 0; j < this.blocks[i].length; j++) {
          const current = this.blocks[i][j]
          // console.log(`${i} ${j}`)
          if (current == -1) {
            return false
          }
          //上下左右存在相等元素
          if (i > 0 && current == this.blocks[i - 1][j]) {
            return false
          }
          if (i < len - 1 && current == this.blocks[i + 1][j]) {
            return false
          }
          if (j > 0 && current == this.blocks[i][j - 1]) {
            return false
          }
          if (j < len - 1 && current == this.blocks[i][j + 1]) {
            return false
          }
        }
      }
      //输掉游戏
      return true
    }

  },
  mounted() {
    this.init()
    // 上38 下40 左37 右39
    document.onkeydown = () => {
      const keyCode = window.event.keyCode
      switch (keyCode) {
        case 38: this.mergeBlock('column', true); break;
        case 40: this.mergeBlock('column', false); break;
        case 37: this.mergeBlock('row', true); break;
        case 39: this.mergeBlock('row', false); break;
      }
    }
    let handler = ''
    // window.addEventListener('touchstart', function (e) {
    document.getElementById('ctrl-area').addEventListener('touchstart', function (e) {
      handler = ''
      // console.log('touchstart:', e)
      this.startX = e.changedTouches[0].pageX
      this.startY = e.changedTouches[0].pageY
    })
    // window.addEventListener('touchmove', function (e) {
    document.getElementById('ctrl-area').addEventListener('touchmove', function (e) {
      e.preventDefault()
      // console.log('touchmove:', e)
      if (e.changedTouches.length) {
        let moveEndX = e.changedTouches[0].pageX
        let moveEndY = e.changedTouches[0].pageY
        let X = moveEndX - this.startX
        let Y = moveEndY - this.startY
        if (Math.abs(X) > Math.abs(Y) && X > 0) {
          handler = 'right'
          // console.log("left 2 right", X, Y);
        } else if (Math.abs(X) > Math.abs(Y) && X < 0) {
          handler = 'left'
          // console.log("right 2 left", X, Y);
        } else if (Math.abs(Y) > Math.abs(X) && Y > 0) {
          handler = 'bottom'
          // console.log("top 2 bottom", X, Y);
        } else if (Math.abs(Y) > Math.abs(X) && Y < 0) {
          handler = 'top'
          // console.log("bottom 2 top", X, Y);
        } else {
          // console.log("just touch", X, Y);
        }
      }
    }, { passive: false })
    document.getElementById('ctrl-area').addEventListener('touchend', () => {
      // window.addEventListener('touchend', () => {
      switch (handler) {
        case 'top': this.mergeBlock('column', true); break;
        case 'bottom': this.mergeBlock('column', false); break;
        case 'left': this.mergeBlock('row', true); break;
        case 'right': this.mergeBlock('row', false); break;
      }
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
  width: 360px;
  height: 360px;
}

.ctr-pannel-row {
  display: flex;
}

.block-box {
  width: 90px;
  height: 90px;
  box-sizing: border-box;
  padding: 3px;
}

.block {
  text-align: center;
  font-size: 40px;
  width: 84px;
  height: 84px;
  line-height: 84px;
  background-color: rgb(200, 192, 179);
}

.block-custom-style--1 {
  background-color: rgb(200, 192, 179);
  color: rgb(117, 108, 107);
}

.block-custom-style-2 {
  background-color: rgb(235, 226, 217);
  color: rgb(117, 108, 107);
}

.block-custom-style-4 {
  background-color: rgb(234, 221, 204);
  color: rgb(117, 108, 107);
}

.block-custom-style-8 {
  background-color: rgb(231, 179, 131);
  color: rgb(255, 255, 255);
}

.block-custom-style-16 {
  background-color: rgb(229, 152, 108);
  color: rgb(255, 255, 255);
}

.block-custom-style-32 {
  background-color: rgb(228, 130, 100);
  color: rgb(255, 255, 255);
}

.block-custom-style-64 {
  background-color: rgb(226, 103, 70);
  color: rgb(255, 255, 255);
}

.block-custom-style-128 {
  background-color: rgb(229, 208, 107);
  color: rgb(255, 255, 255);
}

.block-custom-style-256 {
  background-color: rgb(229, 208, 127);
  color: rgb(255, 255, 255);
}

.block-custom-style-512 {
  background-color: rgb(229, 208, 137);
  color: rgb(255, 255, 255);
}

.block-custom-style-1024 {
  background-color: rgb(229, 208, 147);
  color: rgb(255, 255, 255);
}

.block-custom-style-2048 {
  background-color: rgb(229, 208, 157);
  color: rgb(255, 255, 255);
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

.lostPopup-text {
  width: 100%;
  text-align: center;
  font-size: 20px;
  margin-top: 50px;
}

.lostPopup {
  height: 200px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

#ctrl-area {
  width: 100%;
  min-height: 100vh -120px;
}
</style>
