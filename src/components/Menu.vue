

<template>
	<div>
		<Header />
		<div class="main">
			<div class="mode-box">
				<div class="title">人机模式</div>
				<div class="btn-vs-computer" @click="vsComputer">挑战电脑</div>
			</div>
			<div class="mode-box">
				<div class="title">联网模式</div>
				<div class="text">加入房间: </div>
				<div class="join-box">
					<input v-model="inputRoomId" placeholder="房间号">
					<div class="btn-ensure" @click="joinGame">进入</div>
				</div>
				<div class="btn-create" @click="createRoom">创建房间</div>
				<div class="btn-back" @click="backRoom" v-if="gameStatus == 2">返回对局</div>
			</div>
		</div>
	</div>
</template>

<script>
import wsService from '../services/WSService'
import constant from '../constant'
import store from '../stores'
import Header from '@/components/common/header'

export default {
	name: 'JoinGame',
	components: {
		Header
	},
	data: function () {
		return {
			userId: '',
			gameStatus: store.state.gameStatus,
			inputRoomId: ''
		}
	},
	methods: {
		vsComputer: function () {
			store.commit('setPage', constant.PAGE.AI)
		},
		backRoom: function () {
			store.commit('setPage', constant.PAGE.WEB)
		},
		joinGame: function () {
			const roomId = this.inputRoomId
			const userId = this.createUserId()
			wsService.registerHandler('join-room-success', (data) => {
				const info = {
					userId,
					gameStatus: constant.GAME_STATUS.CREATED,
					roomId: data.data.roomId
				}
				this.$cookies.set(this.$storagekey, JSON.stringify(info))
				store.commit('changeStatus', constant.GAME_STATUS.STARTED)
				store.commit('setPage', constant.PAGE.WEB)
				store.commit('setRoomId', info.roomId)
				store.commit('setUserId', userId)
				store.commit('setCurrentPlayer', data.data.currentPlayer)
				store.commit('setOwnPlayer', 1)
				store.commit('setBlocks', constant.DEFAULT_BLOCKS)
				store.commit('setNewestBlock', [])
			})
			wsService.send({
				action: 'join-room',
				data: {
					roomId,
					userId
				}
			})
		},
		createRoom: function () {
			const userId = this.createUserId()
			wsService.registerHandler('create-room-success', (data) => {
				const info = {
					userId,
					roomId: data.data.roomId
				}
				this.$cookies.set(this.$storagekey, JSON.stringify(info))
				store.commit('changeStatus', constant.GAME_STATUS.CREATED)
				store.commit('setPage', constant.PAGE.WEB)
				store.commit('setRoomId', info.roomId)
				store.commit('setUserId', userId)
				store.commit('setOwnPlayer', 0)
				store.commit('setCurrentPlayer', data.data.currentPlayer)
				store.commit('setBlocks', constant.DEFAULT_BLOCKS)
				store.commit('setNewestBlock', [])
			})
			wsService.send({
				action: 'create-room',
				data: {
					userId
				}
			})
		},
		createUserId: function () {
			return new Date().getTime()
		}
	},
	mounted: function () {

		wsService.registerHandler('room-not-exists', () => {
			this.$toast.show('房间号不存在')
		})
	}

}
</script>

<style scoped>
.title {
	font-size: 25px;
	height: 50px;
	line-height: 50px;
	width: 100%;
}

.text {
	width: 100%;
}

.main {
	margin-top: 20px;
	padding: 0 20px;
}

.mode-box {
	width: 100%;
	height: 180px;
	display: flex;
	flex-wrap: wrap;
}

.btn-create {
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

.join-box {
	width: 100%;
	display: flex;
	margin-top: 10px;
	justify-content: space-between;
}

input {
	font-size: 20px;
	width: 70%;
	height: 40px;
	box-sizing: border-box;
	padding-left: 5px;
	border: 1px solid rgba(137, 161, 196, 0.8);
	border-radius: 5px;
}

.btn-ensure {
	width: 80px;
	height: 40px;
	background-color: rgb(49, 180, 62);
	line-height: 40px;
	text-align: center;
	border-radius: 5px;
	cursor: pointer;
	color: rgb(255, 255, 255);
}

.btn-vs-computer {
	width: 100%;
	height: 40px;
	background-color: rgb(98, 145, 214);
	line-height: 40px;
	text-align: center;
	border-radius: 5px;
	cursor: pointer;
	color: rgb(255, 255, 255);
}

.btn-back {
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