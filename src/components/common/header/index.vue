
<template>
	<div class="header">
		<span>黑白棋</span>
		<button class="btn-menu" @click="home">主菜单</button>
	</div>
</template>



<script>

import store from '@/stores'
import constant from '@/constant'

export default {
	name: 'CommonHeader',
	methods: {
		home: function() {
			store.commit('changeStatus', constant.GAME_STATUS.MENU)
		}
	}
}
</script>

<style scoped>
.header {
	width: 100%;
	height: 58px;
	font-size: 20px;
	line-height: 58px;
	box-sizing: border-box;
	padding: 0 20px;
	box-shadow: 1px 1px 5px rgb(133, 126, 126);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.btn-menu {
	width: 60px;
	height: 30px;
	border: none;
	background-color: rgb(112, 230, 138);
	text-align: center;
	border-radius: 5px;
	cursor: pointer;
	color: rgb(255, 255, 255);
}
</style>