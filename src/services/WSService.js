

// console.log(VUE_APP_WS_SERVER_URL)
// console.log(process.env.VUE_APP_WS_SERVER_URL)

const WS_URL = process.env.VUE_APP_WS_SERVER_URL



class WSService {
	socket = null

	isReady = false

	handlers = {}

	maxTry = 3;

	tryTimes = 0


	tryConnect(func, errCb) {
		if (this.socket) return this.socket

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


		setTimeout(() => {
			if (!this.isReady) {
				console.log(`try connect times ${this.tryTimes}`)
				this.socket.close()
				this.socket = null
				this.tryTimes++
				if (this.tryTimes < this.maxTry) {
					this.tryConnect(func, errCb)
				} else {
					errCb()
				}
			}
		}, 4000)
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
		console.log(this.handlers[obj.action])
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