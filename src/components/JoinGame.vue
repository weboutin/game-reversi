

<template>
	<div>
		<div class="header">黑白棋{{ this.gameStatus }}</div>
		<div class="main">
			<div class="text">加入房间: </div>
			<input v-model="inputRoomId" placeholder="房间号">
			<div class="btn-ensure" @click="joinGame">进入</div>
			<div class="btn-create" @click="createRoom">创建房间 </div>
		</div>
	</div>
</template>

<script>
import wsService from '../services/WSService'
import constant from '../constant'
import store from '../stores'

export default {
	name: 'JoinGame',
	data: function () {
		return {
			userId: '',
			gameStatus: store.state.gameStatus,
			inputRoomId: ''
		}
	},
	methods: {
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
				store.commit('setRoomId', info.roomId)
				store.commit('setUserId', userId)
        store.commit('setCurrentPlayer', data.data.currentPlayer)
        store.commit('setOwnPlayer', 1)
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
				store.commit('setRoomId', info.roomId)
				store.commit('setUserId', userId)
        store.commit('setOwnPlayer', 0)
        store.commit('setCurrentPlayer', data.data.currentPlayer)
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
	}

}
</script>

<style scoped>
.header {
	width: 100%;
	height: 58px;
	line-height: 58px;
	border-bottom: 1px solid;
	box-sizing: border-box;
	padding: 0 10px;
	font-size: 30px;
}

.text {
	margin-top: 20px;
}

.main {
	padding: 0 20px;
}

input {
	margin-top: 20px;
	font-size: 20px;
	width: 80%;
	height: 40px;
	border: non;
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

.btn-ensure {
	margin-top: 20px;
	width: 100%;
	height: 40px;
	background-color: rgb(49, 180, 62);
	line-height: 40px;
	text-align: center;
	border-radius: 5px;
	cursor: pointer;
	color: rgb(255, 255, 255);
}
</style>