<template>
  <div class="main-game">
    <div class="menu">
      <div class="menu-score">{{ score }}</div>
    </div>
    <div class="ctr-pannel">
      <div v-for="row, rowIndex in blocks" :key="rowIndex" class="ctr-pannel-row">
        <div v-for="block, blockIndex in row" :key="`${rowIndex}-${blockIndex}`"
          :class="['block', `block-custom-style-${block}`]">{{ block == -1 ? '' :
          block }}</div>
      </div>
    </div>
  </div>
</template>

<script>


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
}

export default {
  name: 'MainGame',
  props: {
    msg: String
  },
  data: () => {
    return {
      blocks: [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
      ],
      score: 4
    }
  },
  methods: {
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
      // 如果没有产生移动，不产生新的数值
      if (!moved) return


      for (let i = 0; i < this.blocks.length - 1; i++) {
        for (let j = 0; j < this.blocks[i].length; j++) {
          this.$set(this.blocks[i], j, this.blocks[i][j])
        }
      }

      let maxBlockValue = 2;
      for (let i = 0; i < this.blocks.length; i++) {
        for (let j = 0; j < this.blocks[i].length; j++) {
          if (this.blocks[i][j] > maxBlockValue) {
            maxBlockValue = this.blocks[i][j]
          }
        }
      }
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
      // console.log(this.score)
    },

    init() {
      this.createRandom([2], 2)
    },

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
      // window.event.keyCode
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-game {
  width: 1000px;
  height: 1000px;
  position: fixed;
  left: 50%;
  margin-left: -500px;
}
.menu {
  width: 200px;
  height: 100px;
}

.menu-score {
  width: 100px;
  height: 80px;
  background-color: rgb(227, 198, 67);
  border-radius: 5px;
  color: rgb(255, 255, 255);
  font-size: 40px;
  line-height: 80px;
}

.ctr-pannel {
  width: 600px;
  height: 600px;
  position: fixed;
}

.ctr-pannel-row {
  display: flex;
}

.block {
  width: 100px;
  height: 100px;
  background-color: rgb(200, 192, 179);
  text-align: center;
  line-height: 100px;
  border-radius: 5px;
  padding-top: 10px; 
  font-size: 40px;
  margin-top: 10px;
  margin-left: 10px;
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
</style>
