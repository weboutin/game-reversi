<template>
	<div>
		<div class="mask"></div>
		<div class="message-box">{{ message }}</div>
	</div>
</template>

<script>
export default {
	name: 'CommonToast',
	props: {
		message: String
	},
	created() {
	}
}
</script>

<style scoped>
.message-box {
	width: 200px;
	position: fixed;
	display: flex;
	align-items: center;
	height: 100px;
	background-color: rgb(67, 96, 190);
	color: white;
	font-size: 20px;
	top: 40%;
	padding: 0 20px;
	box-sizing: border-box;
	transform: translateX(-50%);
	left: 50%;
	border-radius: 10px;
}

.mask {
	position: fixed;
	width: 100%;
	height: 100%;
	top: 0px;
	background-color: rgb(94, 85, 85, 0.6);
}
</style>