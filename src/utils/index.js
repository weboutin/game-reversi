exports.reversi = function (m, n, player, blocks) {
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
    return { hasReversi, reversiBlocks: tmpBlocks }
}
