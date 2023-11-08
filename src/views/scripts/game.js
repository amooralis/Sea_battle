const CANVAS_WIDTH = 400;
const FIELD_SIZE = CANVAS_WIDTH / 10;

const playerField = document.getElementById('player');
const pcField = document.getElementById('pc');

const ship1 = document.getElementById("ship1")
const ship2 = document.getElementById("ship2")
const ship3 = document.getElementById("ship3")
const ship4 = document.getElementById("ship4")


class Game {
    constructor() {
        this.ctxPlayer = playerField.getContext('2d');
        this.ctxPc = pcField.getContext('2d');
        this.player = this.createFields()
        this.pc = undefined
        this.ships = {
            1: 4,
            2: 3,
            3: 2,
            4: 1
        }
        this.battleId = undefined
        this.listShipsOfPlayer = []
        this.listShipsOfPc = []
        this.stateOfShip = "start"
        this.tmpStart = undefined
        this.tmpEnd = undefined
        this.settingMode = undefined
        this.enemyFill().then(() => this.printPcField())
    }

    showShipsCount() {
        document.getElementById("ship_4_count").innerHTML = this.ships[4]
        document.getElementById("ship_3_count").innerHTML = this.ships[3]
        document.getElementById("ship_2_count").innerHTML = this.ships[2]
        document.getElementById("ship_1_count").innerHTML = this.ships[1]
    }

    createFields() {
        return Array(10).fill().map(() => Array(10).fill(null));
    }

    printPlayerField() {
        for (let x = 0, i = 0; x < playerField.width; x += FIELD_SIZE, i++) {
            for (let y = 0, j = 0; y < playerField.height; y += FIELD_SIZE, j++) {
                if (this.player[i][j] === null) {
                    this.ctxPlayer.strokeRect(x, y, FIELD_SIZE, FIELD_SIZE);
                } else if (this.player[i][j] === "ship") {
                    this.ctxPlayer.fillStyle = "black"
                    this.ctxPlayer.fillRect(x, y, FIELD_SIZE, FIELD_SIZE);
                } else if (this.player[i][j] === "miss") {
                    this.ctxPlayer.fillStyle = "grey"
                    this.ctxPlayer.fillRect(x, y, FIELD_SIZE, FIELD_SIZE);
                } else if (this.player[i][j] === "hit") {
                    this.ctxPlayer.fillStyle = "red"
                    this.ctxPlayer.fillRect(x, y, FIELD_SIZE, FIELD_SIZE);
                    this.ctxPlayer.beginPath()
                    this.ctxPlayer.moveTo(x, y)
                    this.ctxPlayer.lineTo(x + FIELD_SIZE, y + FIELD_SIZE)
                    this.ctxPlayer.stroke()
                    this.ctxPlayer.moveTo(x + FIELD_SIZE, y)
                    this.ctxPlayer.lineTo(x, y + FIELD_SIZE)
                    this.ctxPlayer.stroke()
                }
            }
        }
    }

    printPcField() {
        for (let x = 0, i = 0; x < pcField.width; x += FIELD_SIZE, i++) {
            for (let y = 0, j = 0; y < pcField.height; y += FIELD_SIZE, j++) {
                if (this.pc[i][j] === null || this.pc[i][j] === "ship") {
                    this.ctxPc.strokeRect(x, y, FIELD_SIZE, FIELD_SIZE);
                } else if (this.pc[i][j] === "miss") {
                    this.ctxPc.fillStyle = "grey"
                    this.ctxPc.fillRect(x, y, FIELD_SIZE, FIELD_SIZE);
                } else if (this.pc[i][j] === "hit") {
                    this.ctxPc.fillStyle = "red"
                    this.ctxPc.fillRect(x, y, FIELD_SIZE, FIELD_SIZE);
                    this.ctxPc.beginPath()
                    this.ctxPc.moveTo(x, y)
                    this.ctxPc.lineTo(x + FIELD_SIZE, y + FIELD_SIZE)
                    this.ctxPc.stroke()
                    this.ctxPc.moveTo(x + FIELD_SIZE, y)
                    this.ctxPc.lineTo(x, y + FIELD_SIZE)
                    this.ctxPc.stroke()
                }
            }
        }
    }

    getCoordinates(e) {
        const x = e.pageX - playerField.offsetLeft;
        const y = e.pageY - playerField.offsetTop;
        return {
            x: Math.floor(x / FIELD_SIZE),
            y: Math.floor(y / FIELD_SIZE)
        }
    }

    getCoordinatesEnemy(e) {
        const x = e.pageX - pcField.offsetLeft;
        const y = e.pageY - pcField.offsetTop;
        return {
            x: Math.floor(x / FIELD_SIZE),
            y: Math.floor(y / FIELD_SIZE)
        }
    }

    handleShip(e) {
        if (this.ships[this.settingMode] > 0) {
            if (this.stateOfShip === "start") {
                this.stateOfShip = "end"
                this.tmpStart = this.getCoordinates(e)
            } else if (this.stateOfShip === "end") {
                this.stateOfShip = "start"
                this.tmpEnd = this.getCoordinates(e)
                if (this.isValidPosition()) {
                    this.setShipPlayer()
                    this.ships[this.settingMode] -= 1
                    this.settingMode = undefined
                    this.showShipsCount()
                    this.printPlayerField()
                } else {
                    this.settingMode = undefined
                }
            }
        }
        if (this.isStartTrigger()) {
            this.stateOfShip = undefined
            this.settingMode = undefined
            document.getElementById("shipMenu").style.display = "none"
            fetch("/battle", {
                method: "POST"
            })
                .then(res => res.json())
                .then(res => {
                    this.battleId = res.id
                })
            alert("Игра началась")
        }
    }

    isValidPosition() {
        return !!(this.isHorVert() && this.isLenOk() && this.isHaveDistance());
    }

    isHorVert() {
        if (!(this.tmpStart.x !== this.tmpEnd.x && this.tmpStart.y !== this.tmpEnd.y)) {
            return true
        }
        alert("Нельзя ставить корабль таким образом")
        return false
    }

    isLenOk() {
        if (this.tmpStart.x === this.tmpEnd.x) {
            if (Math.abs(this.tmpStart.y - this.tmpEnd.y) + 1 === this.settingMode) return true
            alert("Неверная длина корабля 1")
            return false
        }
        if (Math.abs(this.tmpStart.x - this.tmpEnd.x) + 1 === this.settingMode) return true
        alert("Неверная длина корабля 2")
        return false
    }

    isHaveDistance() {
        let begin, end
        if (this.tmpStart.x === this.tmpEnd.x) {
            if (this.tmpStart.y > this.tmpEnd.y) {
                begin = this.tmpEnd.y
                end = this.tmpStart.y
            } else {
                begin = this.tmpStart.y
                end = this.tmpEnd.y
            }
            for (let i = this.tmpStart.x - 1; i <= this.tmpStart.x + 1; i++) {
                for (let j = begin - 1; j <= end + 1; j++) {
                    if (i >= 0 && i <= 9 && j >= 0 && j <= 9 && this.player[i][j] === "ship") {
                        alert("Корабль слишком рядом с другим кораблем")
                        return false
                    }
                }
            }
        } else {
            if (this.tmpStart.x > this.tmpEnd.x) {
                begin = this.tmpEnd.x
                end = this.tmpStart.x
            } else {
                begin = this.tmpStart.x
                end = this.tmpEnd.x
            }
            for (let j = this.tmpStart.y - 1; j <= this.tmpStart.y + 1; j++) {
                for (let i = begin - 1; i <= end + 1; i++) {
                    if (i >= 0 && i <= 9 && j >= 0 && j <= 9 && this.player[i][j] === "ship") {
                        alert("Корабль слишком рядом с другим кораблем")
                        return false
                    }
                }
            }
        }
        return true
    }

    isHaveDistanceEnemy() {
        let begin, end
        if (this.tmpStart.x === this.tmpEnd.x) {
            if (this.tmpStart.y > this.tmpEnd.y) {
                begin = this.tmpEnd.y
                end = this.tmpStart.y
            } else {
                begin = this.tmpStart.y
                end = this.tmpEnd.y
            }
            for (let i = this.tmpStart.x - 1; i <= this.tmpStart.x + 1; i++) {
                for (let j = begin - 1; j <= end + 1; j++) {
                    if (i < 0 || i > 9 || j < 0 || j > 9) {
                        return false
                    }
                    if (this.pc[i][j] === "ship") {
                        return false
                    }
                }
            }
        } else {
            if (this.tmpStart.x > this.tmpEnd.x) {
                begin = this.tmpEnd.x
                end = this.tmpStart.x
            } else {
                begin = this.tmpStart.x
                end = this.tmpEnd.x
            }
            for (let j = this.tmpStart.y - 1; j <= this.tmpStart.y + 1; j++) {
                for (let i = begin - 1; i <= end + 1; i++) {
                    if (i < 0 || i > 9 || j < 0 || j > 9) {
                        return false
                    }
                    if (this.pc[i][j] === "ship") {
                        return false
                    }
                }
            }
        }
        return true
    }

    setShipPlayer() {
        let begin, end
        if (this.tmpStart.x === this.tmpEnd.x) {
            if (this.tmpStart.y > this.tmpEnd.y) {
                begin = this.tmpEnd.y
                end = this.tmpStart.y
            } else {
                begin = this.tmpStart.y
                end = this.tmpEnd.y
            }
            const ship = new Ship(this.settingMode)
            for (let j = end; j >= begin; j--) {
                ship.setCoordinates(this.tmpStart.x, j)
                this.player[this.tmpStart.x][j] = "ship"
            }
            this.listShipsOfPlayer.push(ship)
        } else {
            if (this.tmpStart.x > this.tmpEnd.x) {
                begin = this.tmpEnd.x
                end = this.tmpStart.x
            } else {
                begin = this.tmpStart.x
                end = this.tmpEnd.x
            }
            const ship = new Ship(this.settingMode)
            for (let i = end; i >= begin; i--) {
                ship.setCoordinates(i, this.tmpStart.y)
                this.player[i][this.tmpStart.y] = "ship"
            }
            this.listShipsOfPlayer.push(ship)
        }
    }

    setShipPc(index) {
        let begin, end
        if (this.tmpStart.x === this.tmpEnd.x) {
            if (this.tmpStart.y > this.tmpEnd.y) {
                begin = this.tmpEnd.y
                end = this.tmpStart.y
            } else {
                begin = this.tmpStart.y
                end = this.tmpEnd.y
            }
            const ship = new Ship(index)
            for (let j = end; j >= begin; j--) {
                ship.setCoordinates(this.tmpStart.x, j)
                this.pc[this.tmpStart.x][j] = "ship"
            }
            this.listShipsOfPc.push(ship)

        } else {
            if (this.tmpStart.x > this.tmpEnd.x) {
                begin = this.tmpEnd.x
                end = this.tmpStart.x
            } else {
                begin = this.tmpStart.x
                end = this.tmpEnd.x
            }
            const ship = new Ship(index)
            for (let i = end; i >= begin; i--) {
                ship.setCoordinates(i, this.tmpStart.y)
                this.pc[i][this.tmpStart.y] = "ship"
            }
            this.listShipsOfPc.push(ship)
        }
    }

    isStartTrigger() {
        return this.ships[1] === 0 && this.ships[2] === 0 && this.ships[3] === 0 && this.ships[4] === 0
    }

    async enemyFill() {
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]
        let isFilling = true
        while (isFilling) {
            this.listShipsOfPc = []
            const ships = {
                1: 4,
                2: 3,
                3: 2,
                4: 1
            }
            let tmp = 0
            this.pc = this.createFields()
            for (let i = 4; i >= 1; i--, tmp < 600) {
                while (ships[i] > 0 && tmp < 600) {
                    const x = Math.floor(Math.random() * 10)
                    const y = Math.floor(Math.random() * 10)
                    if (this.pc[x][y] === null) {
                        this.tmpStart = {x, y}
                        const direction = directions[Math.floor(Math.random() * 4)]
                        this.tmpEnd = {x: x + direction[0] * (i - 1), y: y + direction[1] * (i - 1)}
                        if (this.isHaveDistanceEnemy()) {
                            ships[i] -= 1
                            this.setShipPc(i)
                        }
                    }
                    tmp++
                }
            }
            if (tmp < 600) {
                isFilling = false
            }
        }

        this.tmpStart = undefined
        this.tmpEnd = undefined
    }

    movePc() {
        let isMoved = false
        while (!isMoved) {
            const x = Math.floor(Math.random() * 10)
            const y = Math.floor(Math.random() * 10)
            if (this.player[x][y] === "hit" || this.player[x][y] === "miss") continue
            if (this.player[x][y] === null) {
                isMoved = true
                this.player[x][y] = "miss"
                this.printPlayerField()
            }
            if (this.player[x][y] === "ship") {
                this.setHitPc(x, y)
                this.printPlayerField()
                if (this.checkIsLose()) {
                    alert("Вы проиграли")
                    this.stateOfShip = "end";
                    const resultBattle = this.countShips()
                    fetch(`/battle/${this.battleId}`, {
                        method: "PUT",
                        body: JSON.stringify({
                            status: false,
                            destroyedShip1: resultBattle[1],
                            destroyedShip2: resultBattle[2],
                            destroyedShip3: resultBattle[3],
                            destroyedShip4: resultBattle[4],
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }).then(() => {
                        document.location.href = "/myStats"
                    })
                }
            }
        }
    }

    movePlayer(e) {
        const coordinates = this.getCoordinatesEnemy(e)
        if (this.pc[coordinates.x][coordinates.y] === null) {
            this.pc[coordinates.x][coordinates.y] = "miss"
            this.printPcField()
            this.movePc()
        } else if (this.pc[coordinates.x][coordinates.y] === "ship") {
            this.setHit(coordinates.x, coordinates.y)
            this.printPcField()
            if (this.checkIsWin()) {
                alert("Вы выиграли");
                this.stateOfShip = "end";
                const resultBattle = this.countShips()
                fetch(`/battle/${this.battleId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        status: true,
                        destroyedShip1: resultBattle[1],
                        destroyedShip2: resultBattle[2],
                        destroyedShip3: resultBattle[3],
                        destroyedShip4: resultBattle[4],
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(() => {
                        document.location.href = "/myStats"
                    })
            }
        }
    }

    setHit(x, y) {
        for (let ship of this.listShipsOfPc) {
            if (ship.isShoot(x, y)) {
                this.pc[x][y] = "hit"
            }
        }
    }

    setHitPc(x, y) {
        for (let ship of this.listShipsOfPlayer) {
            if (ship.isShoot(x, y)) {
                this.player[x][y] = "hit"
            }
        }
    }

    countShips() {
        let count = {}
        for (let ship of this.listShipsOfPc) {
            if (ship.isKilled) count[ship.size] = count[ship.size] ? count[ship.size] + 1 : 1
        }
        return count
    }

    checkIsWin() {
        for (let ship of this.listShipsOfPc) {
            if (!ship.isKilled) return false
        }
        return true
    }

    checkIsLose() {
        for (let ship of this.listShipsOfPlayer) {
            if (!ship.isKilled) return false
        }
        return true
    }
}

class Ship {
    constructor(size) {
        this.size = size
        this.coordinates = []
        this.isKilled = false
    }

    setCoordinates(x, y) {
        this.coordinates.push({x, y, isKill: false})
    }

    isShoot(x, y) {
        for (let elem of this.coordinates) {
            if (elem.x === x && elem.y === y) {
                elem.isKill = true
                if (!this.checkIsAlive()) this.isKilled = true
                return true
            }
        }
        return false
    }

    checkIsAlive() {
        for (let elem of this.coordinates) {
            if (!elem.isKill) return true
        }
        return false
    }
}


const game = new Game()

game.printPlayerField()
game.printPcField()
game.showShipsCount()


ship1.addEventListener("click", () => {
    game.settingMode = 1
    game.stateOfShip = "start"
    game.tmpStart = undefined
    game.tmpEnd = undefined
})

ship2.addEventListener("click", () => {
    game.settingMode = 2
    game.stateOfShip = "start"
    game.tmpStart = undefined
    game.tmpEnd = undefined
})
ship3.addEventListener("click", () => {
    game.settingMode = 3
    game.stateOfShip = "start"
    game.tmpStart = undefined
    game.tmpEnd = undefined
})

ship4.addEventListener("click", () => {
    game.settingMode = 4
    game.stateOfShip = "start"
    game.tmpStart = undefined
    game.tmpEnd = undefined
})

playerField.addEventListener("click", (e) => {
    if (game.stateOfShip !== undefined) {
        game.handleShip(e)
    }
})

pcField.addEventListener("click", (e) => {
    if (game.stateOfShip === undefined) {
        game.movePlayer(e)
    }
})

window.addEventListener("beforeunload", (e) => {
    e.preventDefault()

    if (game.stateOfShip === undefined) {
        const resultBattle = game.countShips()
        fetch(`/battle/${game.battleId}`, {
            method: "PUT",
            body: JSON.stringify({
                status: false,
                destroyedShip1: resultBattle[1],
                destroyedShip2: resultBattle[2],
                destroyedShip3: resultBattle[3],
                destroyedShip4: resultBattle[4]
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        e.returnValue = true
    }
})

