<template>
	<div class="chess-board">
		<div v-for="row, rowIndex in blocks" :key="rowIndex" class="chess-board-row">
			<div v-for="block, blockIndex in row" :key="`${rowIndex}-${blockIndex}`" :class="['block-box']">
				<div class="block" @click="handlerPlay(rowIndex, blockIndex, currentPlayer)">
					<div class="newest-block" v-if="rowIndex == newestBlock[0] && blockIndex == newestBlock[1]"></div>
					<div class="hint-block" v-if="hintBlocks.includes(`${rowIndex},${blockIndex}`) && isShowHints"></div>
					<div :class="['chess', block == 0 ? 'black-chess' : 'white-chess']" v-if="block != -1"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { OWNER_STATUS } from '../../../constant/'

import { reversi } from '../../../utils/'

import constant from '../../../constant'

export default {
	name: 'ChessBoard',
	props: {
		ownerStatus: {
			type: Number,
			default: constant.OWNER_STATUS.BOTH
		},
		// 当前正要操作的子
		currentPlayer: {
			type: Number,
			default: 0
		},
		isShowHints: {
			type: Boolean,
			default: false
		},
		forceUpdateBlocks: {
			type: Array,
			default: () => []
		},
		forceUpdateNewest: {
			type: Array,
			default: () => []
		},
		chessContinueChecker: {
			type: Boolean,
			default: true
		}

	},
	data: function () {
		return {
			newestBlock: [],
			blocks: constant.DEFAULT_BLOCKS,
			hintBlocks: []
		}
	},
	watch: {
		forceUpdateBlocks: {
			immediate: true,
			handler: function (val) {
				if (val.length > 0) {
					this.blocks = val
				}
			}
		},
		forceUpdateNewest: {
			immediate: true,
			handler: function (val) {
				this.newestBlock = val
			}
		},
		blocks: {
			immediate: true,
			handler: function () {
				let black = 0
				let white = 0
				const hintBlocks = []
				for (let i = 0; i < 8; i++) {
					for (let j = 0; j < 8; j++) {
						if (this.blocks[i][j] == 0) {
							black++
						} else if (this.blocks[i][j] == 1) {
							white++
						}
						if (this.blocks[i][j] == -1) {
							const { hasReversi } = reversi(i, j, this.currentPlayer, this.blocks)
							if (hasReversi) hintBlocks.push(`${i},${j}`)
						}
					}
				}
				this.hintBlocks = hintBlocks
				this.$emit('count', black, white)
			}
		}
	},
	methods: {
		getHints() {
			const tmp = []
			this.hintGroups = tmp
		},

		getAnotherPlayer(player) {
			return player == 0 ? 1 : 0
		},

		restart() {
			this.newestBlock = [];
			this.blocks = [
				[-1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, 0, 1, -1, -1, -1],
				[-1, -1, -1, 1, 0, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1],
				[-1, -1, -1, -1, -1, -1, -1, -1],
			]
		},

		/**
		 * 判定是否可以操作下子，用于区分单人，双人，联网模式
		 */
		handlerPlay(i, j, player) {
			if (this.ownerStatus == OWNER_STATUS.BLACK_ONLY && this.currentPlayer == 1) {
				return
			}
			if (this.ownerStatus == OWNER_STATUS.WHITE_ONLY && this.currentPlayer == 0) {
				return
			}
			if (this.ownerStatus == OWNER_STATUS.BOTH_NOT) {
				return
			}
			if (this.currentPlayer != player) return
			this.play(i, j, player)
		},

		getWinner(blocks, fource) {
			let black = 0
			let white = 0
			let empty = 0
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					if (blocks[i][j] == 0) {
						black++
					} else if (blocks[i][j] == 1) {
						white++
					} else {
						empty++
					}
				}
			}
			if (fource) {
				return black > white ? 0 : 1
			}

			if (empty == 0 || black == 0 || white == 0) {
				return black > white ? 0 : 1
			} else {
				return null
			}
		},

		checkCanPlay(blocks, player) {
			for (let i = 0; i < 8; i++) {
				for (let j = 0; j < 8; j++) {
					if (blocks[i][j] == -1) {
						const { hasReversi } = reversi(i, j, player, blocks)
						if (hasReversi) {
							return true
						}
					}
				}
			}
			return false
		},
		render(blocks) {
			this.blocks = blocks
		},

		play(i, j, player) {
			// 只能放置在空白位置
			if (this.blocks[i][j] !== -1) return

			let _blocks = JSON.parse(JSON.stringify(this.blocks))

			//翻转棋子
			const { hasReversi, reversiBlocks } = reversi(i, j, player, _blocks)
			//不符合下棋规则
			if (!hasReversi) {
				return
			}

			//下子
			reversiBlocks[i][j] = player

			//声明最新下子
			this.newestBlock = [i, j]

			//渲染到视图层
			this.blocks = reversiBlocks

			if (this.chessContinueChecker) {
				const winner = this.getWinner(this.blocks)
				if (winner) {
					this.$emit('end', winner)
					return
				}

				//判断另一方是否存在下子空间
				const anotherCanPlay = this.checkCanPlay(this.blocks, this.getAnotherPlayer(player))
				if (!anotherCanPlay) {
					const currentCanPlay = this.checkCanPlay(this.blocks, player)
					//双方皆没有下子空间
					if (!currentCanPlay) {
						const winner = this.getWinner(this.blocks, true)
						this.$emit('end', winner)
						return
					}
					this.$emit('playerContinue', player)
					return
				}
			}

			this.$emit('play', {
				i, j, player, blocks: reversiBlocks
			})
		},
	}
}
</script>

<style scoped>
.chess-board {
	border: 3px solid rgb(183, 172, 160);
	border-radius: 3px;
	width: 363px;
	height: 363px;
}

.chess-board-row {
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