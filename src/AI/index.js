
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
}

exports.play = function (blocks, player, level) {
	if (level == 1) {
		return levelOne(blocks, player)
	}
	if (level == 2) {
		return levelTwo(blocks, player)
	}
	if (level == 3) {
		return levelThree(blocks, player)
	}
}

function levelOne(blocks, player) {
	const tmp = []
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			if (blocks[i][j] == -1) {
				const { hasReversi, scores } = reversi(i, j, player, blocks, { needScore: false })
				if (hasReversi) tmp.push(`${i},${j},${scores}`)
			}
		}
	}
	const index = getRandomInt(0, tmp.length)
	const result = {
		m: Number(tmp[index].split(',')[0]),
		n: Number(tmp[index].split(',')[1]),
	}
	return result
}

function levelTwo(blocks, player) {
	const scoreMap = {}
	let maxScore = null
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			if (blocks[i][j] == -1) {
				const { hasReversi, score } = reversi(i, j, player, blocks, { needScore: true })
				if (hasReversi) {
					if (maxScore == null) {
						maxScore = score
					} else if (score > maxScore) {
						maxScore = score
					}
					if (!scoreMap[score]) {
						scoreMap[score] = []
						scoreMap[score].push(`${i},${j}`)
					} else {
						scoreMap[score].push(`${i},${j}`)
					}
				}
			}
		}
	}
	const arr = scoreMap[maxScore]
	const index = getRandomInt(0, arr.length)
	const result = {
		m: Number(arr[index].split(',')[0]),
		n: Number(arr[index].split(',')[1]),
	}
	return result
}

function levelThree(blocks, player) {
	const scoreMap = {}
	let maxScore = null
	let resultMap = {}
	let tmp = ['0,0', '0,7', '7,7', '7,0']
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			if (blocks[i][j] == -1) {
				const { hasReversi, score } = reversi(i, j, player, blocks, { needScore: true })
				if (hasReversi) {
					resultMap[`${i},${j}`] = score
					if (maxScore == null) {
						maxScore = score
					} else if (score > maxScore) {
						maxScore = score
					}
					if (!scoreMap[score]) {
						scoreMap[score] = []
						scoreMap[score].push(`${i},${j}`)
					} else {
						scoreMap[score].push(`${i},${j}`)
					}
				}
			}
		}
	}
	let tryMaxCount = 0
	let tryMax = null
	for (let i = 0; i < tmp.length; i++) {
		if (resultMap[tmp[i]] && resultMap[tmp[i] > tryMaxCount]) {
			tryMaxCount = resultMap[tmp[i]]
			tryMax = tmp[i]
		}
	}
	if (tryMax) {

		return {
			m: Number(tryMax.split(',')[0]),
			n: Number(tryMax.split(',')[1]),
		}
	}
	const arr = scoreMap[maxScore]
	const index = getRandomInt(0, arr.length)
	const result = {
		m: Number(arr[index].split(',')[0]),
		n: Number(arr[index].split(',')[1]),
	}
	return result
}


function reversi(m, n, player, blocks, options) {
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
	let blackChessCount = 0
	let whiteChessCount = 0
	if (options.needScore) {
		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (tmpBlocks[i][j] == 0) {
					blackChessCount++
				} else if (tmpBlocks[i][j] == 1) {
					whiteChessCount++
				}
			}
		}
	}
	return {
		hasReversi,
		tmpBlocks,
		score: player == 0 ? (blackChessCount - whiteChessCount) : (whiteChessCount - blackChessCount)
	}
}
