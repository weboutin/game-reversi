<template>
	<div class="popup">
		<div class="mask" @click="hide" v-if="visiable"></div>
		<transition name="fade">
			<div class="main fade" v-if="visiable">
				<slot></slot>
			</div>
		</transition>
	</div>
</template>


<script>
export default {
	name: 'CommonPopup',
	props: {
		isShow: Boolean
	},
	data: function () {
		return {
			visiable: false
		}
	},
	methods: {
		hide: function () {
			this.visiable = false
			this.$emit('close')
		}
	},
	watch: {
		isShow: {
			immediate: true,
			handler: function (val) {
				this.visiable = val

			}
		}
	}
}
</script>

<style scoped>
.mask {
	position: fixed;
	width: 100%;
	height: 100%;
	top: 0px;
	background-color: rgb(94, 85, 85, 0.1);
}

.main {
	width: 100%;
	position: fixed;
	background-color: white;
	bottom: 0px;
	border-radius: 10px 10px 0 0;
	transform: translate3d(0, 0, 0);
	transition: opacity 0.3s, transform 0.4s, top 0.4s, bottom 0.4s;
}

.fade-enter,
.fade-leave-active {
	opacity: 0;
	transform: translate(0%, -100%);
}

.fade-enter,
.fade-leave-active {
	opacity: 0;
	transform: translate(0%, 100%);
}
</style>
