import Vue from 'vue'
import Vuex from 'vuex'


import constant from '../constant'

Vue.use(Vuex)



export default new Vuex.Store({
	state: {
		gameStatus: constant.GAME_STATUS.MENU,
		roomId: '',
		userId: '',
		currentPlayer: 0,
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
		ownPlayer: 0,
		newestBlock: []
	},
	mutations: {
		changeStatus(state, payload) {
			state.gameStatus = payload
		},
		setRoomId(state, payload) {
			state.roomId = payload
		},
		setUserId(state, payload) {
			state.userId = payload
		},
		setBlocks(state, payload) {
			state.blocks = payload
		},
		setCurrentPlayer(state, payload) {
			state.currentPlayer = payload
		},
		setOwnPlayer(state, payload) {
			state.ownPlayer = payload
		},
		setNewestBlock(state, payload) {
			state.newestBlock = payload
		}
	}
})