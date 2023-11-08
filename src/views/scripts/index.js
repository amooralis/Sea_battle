const gameLink = document.getElementById("play")
const statsLink = document.getElementById("stats")
const beatLink = document.getElementById("best")
const logoutLink = document.getElementById("logout")

gameLink.addEventListener("click", () => {
    if (gameLink.classList.contains("is-active")) return
    window.location.href = "http://localhost:3456/"
})

statsLink.addEventListener("click", () => {
    if (statsLink.classList.contains("is-active")) return
    window.location.href = "http://localhost:3456/myStats"
})

beatLink.addEventListener("click", () => {
    if (beatLink.classList.contains("is-active")) return
    window.location.href = "http://localhost:3456/bestPlayers"
})

logoutLink.addEventListener("click", () => {
    window.location.href = "http://localhost:3456/logout"
})
