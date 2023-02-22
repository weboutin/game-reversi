

// console.log(VUE_APP_WS_SERVER_URL)
// console.log(process.env.VUE_APP_WS_SERVER_URL)

const WS_URL = process.env.VUE_APP_WS_SERVER_URL



class WSService {
	socket = null

	isReady = false

	handlers = {}

	connect(func) {
		if (this.socket) return this.socket

		// this.conn = new WebSocket('ws://124.223.207.198:7080/')
		this.socket = new WebSocket(WS_URL)


		this.socket.addEventListener('open', () => {
			this.isReady = true
			func()
		});

		this.socket.addEventListener('message', (event) => {
			try {
				const obj = JSON.parse(event.data)
				this.handlerServerMsg(obj)
			} catch (e) {
				console.warn(e)
			}
		});
		return this.socket
	}
	send(obj) {
		if (!this.isReady) {
			console.warn('conn not ready')
			return
		}
		this.socket.send(JSON.stringify(obj))
	}

	handlerServerMsg(obj) {
		console.log(obj)
		this.handlers[obj.action].forEach(func => {
			func(obj)
		});
	}
	registerHandler(key, func) {
		if (!this.handlers[key]) {
			this.handlers[key] = []
			this.handlers[key].push(func)
		} else {
			this.handlers[key].push(func)
		}
	}

}

export default new WSService()