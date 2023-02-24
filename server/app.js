const WebSocketServer = require('ws').WebSocketServer

const wss = new WebSocketServer({ port: 7080 });

const constant = require('../src/constant')

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
}

function genRoomId() {
	let roomId = ''
	for (let i = 0; i < 3; i++) {
		roomId += getRandomInt(0, 10)
	}
	return roomId
}


const roomGroups = {}

const defaultBlocks = [
	[-1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, 0, 1, -1, -1, -1],
	[-1, -1, -1, 1, 0, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1],
]

class Chess {
	blocks = defaultBlocks
	currentPlayer = null
	wsMap = {}
	ownChess = {}
	gameStatus = constant.GAME_STATUS.MENU
	newestBlock = []
}


/**
 * 判断游戏是否结束
 */
function getWinner(blocks) {
	let blackChessCount = 0
	let whiteChessCount = 0
	let emptyChessCount = 0
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			if (blocks[i][j] == 0) {
				blackChessCount++
			} else if (blocks[i][j] == 1) {
				whiteChessCount++
			} else if (blocks[i][j] == -1) {
				emptyChessCount++
			}
		}
	}
	// 棋盘下满
	// 其中一方为0
	if (blackChessCount == 0 || whiteChessCount == 0 || emptyChessCount == 0) {
		if (blackChessCount > whiteChessCount) {
			return {
				isEnd: true,
				winner: 0
			}
		} else {
			return {
				isEnd: true,
				winner: 1
			}
		}
	}
	return {
		isEnd: false,
		winner: null
	}
}
/**
 * 判断一方是否有下棋空间
 */
function checkCanPlay(blocks, chessColorCode) {
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			if (blocks[i][j] == -1) {
				const { hasReversi } = reversi(i, j, chessColorCode, blocks)
				if (hasReversi) {
					return true
				}
			}
		}
	}
	return false
}

function reversi(m, n, player, blocks) {
	let tmpBlocks = JSON.parse(JSON.stringify(blocks))
	let hasReversi = false
	//往8个方向搜索是否存在最近同子
	let sameIndex = -1
	//往下搜索
	let i = m + 1, j = n
	let tmpM = m, tmpN = n
	while (i < 8) {
		if (tmpBlocks[i][j] == -1) break
		if (tmpBlocks[i][j] == player) {
			sameIndex = i
			break
		}
		i++
	}
	if (sameIndex != -1 && Math.abs(sameIndex - tmpM) != 1) {
		hasReversi = true
		while (tmpM < sameIndex) {
			tmpBlocks[tmpM][j] = player
			tmpM++
		}
	}
	//往上搜索
	tmpM = m, tmpN = n
	sameIndex = -1
	i = m - 1, j = n
	while (i >= 0) {
		if (tmpBlocks[i][j] == -1) break
		if (tmpBlocks[i][j] == player) {
			sameIndex = i
			break
		}
		i--
	}
	if (sameIndex != -1 && Math.abs(sameIndex - tmpM) != 1) {
		hasReversi = true
		while (tmpM > sameIndex) {
			tmpBlocks[tmpM][j] = player
			tmpM--
		}
	}
	//往右搜索
	tmpM = m, tmpN = n
	sameIndex = -1
	i = m, j = n + 1
	while (j < 8) {
		if (tmpBlocks[i][j] == -1) break
		if (tmpBlocks[i][j] == player) {
			sameIndex = j
			break
		}
		j++
	}
	if (sameIndex != -1 && Math.abs(sameIndex - tmpN) != 1) {
		hasReversi = true
		while (tmpN < sameIndex) {
			tmpBlocks[i][tmpN] = player
			tmpN++
		}
	}
	//往左搜索
	tmpM = m, tmpN = n
	sameIndex = -1
	i = m, j = n - 1
	while (j >= 0) {
		if (tmpBlocks[i][j] == -1) break
		if (tmpBlocks[i][j] == player) {
			sameIndex = j
			break
		}
		j--
	}
	if (sameIndex != -1 && Math.abs(sameIndex - tmpN) != 1) {
		hasReversi = true
		while (tmpN > sameIndex) {
			tmpBlocks[i][tmpN] = player
			tmpN--
		}
	}
	//往左上
	let sameMultIndex = -1
	tmpM = m, tmpN = n
	i = m - 1, j = n - 1
	while (i >= 0 && j >= 0) {
		if (tmpBlocks[i][j] == -1) break
		if (tmpBlocks[i][j] == player) {
			sameMultIndex = [i, j]
			break
		}
		j--
		i--
	}
	if (sameMultIndex != -1 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
		hasReversi = true
		while (tmpM > sameMultIndex[0] && tmpN > sameMultIndex[1]) {
			tmpBlocks[tmpM][tmpN] = player
			tmpM--
			tmpN--
		}
	}
	//往左下
	sameMultIndex = -1
	tmpM = m, tmpN = n
	i = m + 1, j = n - 1
	while (i < 8 && j >= 0) {
		if (tmpBlocks[i][j] == -1) break
		if (tmpBlocks[i][j] == player) {
			sameMultIndex = [i, j]
			break
		}
		i++
		j--
	}
	if (sameMultIndex != -1 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
		hasReversi = true
		while (tmpM < sameMultIndex[0] && tmpN > sameMultIndex[1]) {
			tmpBlocks[tmpM][tmpN] = player
			tmpM++
			tmpN--
		}
	}
	//往右下
	sameMultIndex = -1
	tmpM = m, tmpN = n
	i = m + 1, j = n + 1
	while (i < 8 && j < 8) {
		if (tmpBlocks[i][j] == -1) break
		if (tmpBlocks[i][j] == player) {
			sameMultIndex = [i, j]
			break
		}
		i++
		j++
	}
	if (sameMultIndex != -1 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
		hasReversi = true
		while (tmpM < sameMultIndex[0] && tmpN < sameMultIndex[1]) {
			tmpBlocks[tmpM][tmpN] = player
			tmpM++
			tmpN++
		}
	}
	//往右上
	sameMultIndex = -1
	tmpM = m, tmpN = n
	i = m - 1, j = n + 1
	while (i >= 0 && j < 8) {
		if (tmpBlocks[i][j] == -1) break
		if (tmpBlocks[i][j] == player) {
			sameMultIndex = [i, j]
			break
		}
		i--
		j++
	}
	if (sameMultIndex != -1 && Math.abs(sameMultIndex[0] - tmpM) != 1 && Math.abs(sameMultIndex[1] - tmpN) != 1) {
		hasReversi = true
		while (tmpM > sameMultIndex[0] && tmpN < sameMultIndex[1]) {
			tmpBlocks[tmpM][tmpN] = player
			tmpM--
			tmpN++
		}
	}
	return { hasReversi, tmpBlocks }
}

function publish(roomId, data) {
	for (let userId in roomGroups[roomId].wsMap) {
		const uWs = roomGroups[roomId].wsMap[userId]
		uWs.send(JSON.stringify(data))
	}
}

function getAnotherChessColorCode(code) {
	return code === 0 ? 1 : 0
}


wss.on('connection', function connection(ws) {
	const actionMap = {
		'create-room': (obj) => {
			const roomId = genRoomId()
			roomGroups[roomId] = new Chess()
			roomGroups[roomId].wsMap[obj.data.userId] = ws
			roomGroups[roomId].ownChess[obj.data.userId] = 0
			roomGroups[roomId].gameStatus = constant.GAME_STATUS.CREATED
			roomGroups[roomId].currentPlayer = 0
			ws.send(JSON.stringify({
				action: 'create-room-success',
				data: {
					roomId,
					currentPlayer: 0
				}
			}))
		},
		'join-room': (obj) => {
			const roomId = obj.data.roomId
			if (!roomGroups[roomId]) {
				ws.send(JSON.stringify({
					action: 'room-not-exists',
					data: {
					}
				}))
				return
			}
			roomGroups[roomId].wsMap[obj.data.userId] = ws
			roomGroups[roomId].whiteUserId = obj.data.userid
			roomGroups[roomId].gameStatus = constant.GAME_STATUS.STARTED
			roomGroups[roomId].ownChess[obj.data.userId] = 1
			ws.send(JSON.stringify({
				action: 'join-room-success',
				data: {
					roomId: obj.data.roomId,
					currentPlayer: 0
				}
			}))

			for (let userId in roomGroups[roomId].wsMap) {
				const uWs = roomGroups[roomId].wsMap[userId]
				uWs.send(JSON.stringify({
					action: 'start-game',
					data: {
						blocks: roomGroups[roomId].blocks,
						black: roomGroups[roomId].blackUserId,
						white: roomGroups[roomId].whiteUserId
					}
				}))
			}
		},
		'play': (obj) => {
			try {
				const roomId = obj.data.roomId
				const blocks = obj.data.blocks
				const newestBlock = obj.data.newestBlock
				roomGroups[roomId].blocks = blocks
				roomGroups[roomId].newestBlock = newestBlock
				const { winner, isEnd } = getWinner(blocks)
				const currentPlayer = roomGroups[roomId].currentPlayer
				if (isEnd) {
					roomGroups[roomId].gameStatus = constant.GAME_STATUS.END
					publish(roomId, {
						action: 'game-end',
						data: {
							winner,
							blocks,
							newestBlock
						}
					})
					return
				}
				const canplay = checkCanPlay(blocks, getAnotherChessColorCode(currentPlayer))
				if (!canplay) {
					publish(roomId, {
						action: 'chess-continue',
						data: {
							blocks,
							currentPlayer: currentPlayer,
							newestBlock
						}
					})
					return
				}

				roomGroups[roomId].currentPlayer = getAnotherChessColorCode(currentPlayer)


				publish(roomId, {
					action: 'play-success',
					data: {
						blocks,
						currentPlayer: getAnotherChessColorCode(currentPlayer),
						newestBlock
					}
				})
			} catch (e) {
				console.log(e)
			}
		},
		'sync': (obj) => {
			const { roomId, userId } = obj.data
			if (roomGroups[roomId]) {
				roomGroups[roomId].wsMap[userId] = ws
			}
			ws.send(JSON.stringify({
				action: 'sync-success',
				data: {
					roomId,
					userId,
					gameStatus: roomGroups[roomId] ? roomGroups[roomId].gameStatus : constant.GAME_STATUS.MENU,
					blocks: roomGroups[roomId] ? roomGroups[roomId].blocks : defaultBlocks,
					ownChess: roomGroups[roomId] ? roomGroups[roomId].ownChess : [],
					currentPlayer: roomGroups[roomId] ? roomGroups[roomId].currentPlayer : 0,
					newestBlock: roomGroups[roomId] ? roomGroups[roomId].newestBlock : []
				}
			}))
		},
		'restart': (obj) => {
			const { roomId } = obj.data
			roomGroups[roomId].gameStatus = constant.GAME_STATUS.STARTED
			roomGroups[roomId].blocks = defaultBlocks
			roomGroups[roomId].currentPlayer = 0
			roomGroups[roomId].newestBlock = []
			publish(roomId, {
				action: 'restart-success',
				data: {
					blocks: defaultBlocks,
					currentPlayer: 0,
				}
			})
		},
		'giveup': (obj) => {
			const { roomId, userId } = obj.data
			roomGroups[roomId].gameStatus = constant.GAME_STATUS.STARTED
			roomGroups[roomId].blocks = defaultBlocks
			roomGroups[roomId].currentPlayer = 0
			roomGroups[roomId].newestBlock = []
			publish(roomId, {
				action: 'giveup-success',
				data: {
					blocks: defaultBlocks,
					currentPlayer: 0,
					giveUpPlayer: userId
				}
			})
		}

	}
	ws.on('error', console.error);

	ws.on('message', function message(data) {
		try {
			const obj = JSON.parse(data.toString())
			console.log(obj)
			actionMap[obj.action].call(this, obj)
		} catch { }
	});

});
