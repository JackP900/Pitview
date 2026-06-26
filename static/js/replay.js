console.log("replay loaded")

let intervalId = null
let allReadingsA = []
let allReadingsB = []
let index = 0

fetch("/sessions")
    .then(response => response.json())
    .then(sessions => {
        sessions.forEach(function(session) {
            const option1 = document.createElement("option")
            option1.value = session.id
            option1.text = session.name
            document.getElementById("sessionSelect1").appendChild(option1)

            const option2 = document.createElement("option")
            option2.value = session.id
            option2.text = session.name
            document.getElementById("sessionSelect2").appendChild(option2)
        })
    })


const sessionSelect1 = document.getElementById("sessionSelect1")
const deleteBtn = document.getElementById("deleteBtn")
deleteBtn.onclick = function() {
    fetch("/delete/" + sessionSelect1.value, {method: "DELETE"})
    .then(function() {sessionSelect1.remove(sessionSelect1.selectedIndex)})
}


const throttleDataA = []
const brakeDataA = []
const steeringDataA = []

const throttleDataB = []
const brakeDataB = []
const steeringDataB = []

const labels = []
const maxPoints = 50

const chartOptions = {
    animation: false,
    maintainAspectRatio: false,
    scales: {
        y: { min: 0, max: 1 },
        x: { min: 0, max: 50, ticks: { stepsize: 1 } }
    }
}

// One chart per metric. Session A is solid, Session B is dashed, so the
// two runs can still be compared side by side without the clutter of
// six lines stacked on a single chart.
const throttleChart = new Chart(document.getElementById("throttleChart"), {
    type: "line",
    data: { labels: labels, datasets: [
        {label: "Throttle A", data: throttleDataA, borderColor: "green"},
        {label: "Throttle B", data: throttleDataB, borderColor: "green", borderDash: [5, 5]}
    ]},
    options: chartOptions
})

const brakeChart = new Chart(document.getElementById("brakeChart"), {
    type: "line",
    data: { labels: labels, datasets: [
        {label: "Brake A", data: brakeDataA, borderColor: "red"},
        {label: "Brake B", data: brakeDataB, borderColor: "red", borderDash: [5, 5]}
    ]},
    options: chartOptions
})

const steeringChart = new Chart(document.getElementById("steeringChart"), {
    type: "line",
    data: { labels: labels, datasets: [
        {label: "Steering A", data: steeringDataA, borderColor: "blue"},
        {label: "Steering B", data: steeringDataB, borderColor: "blue", borderDash: [5, 5]}
    ]},
    options: chartOptions
})

function updateCharts() {
    throttleChart.update()
    brakeChart.update()
    steeringChart.update()
}


// Checkboxes now show/hide each metric's chart.
document.getElementById("throttleCheck").onchange = function() {
    document.getElementById("throttleCard").style.display = this.checked ? "" : "none"
}
document.getElementById("brakeCheck").onchange = function() {
    document.getElementById("brakeCard").style.display = this.checked ? "" : "none"
}
document.getElementById("steeringCheck").onchange = function() {
    document.getElementById("steeringCard").style.display = this.checked ? "" : "none"
}


const playBtn = document.getElementById("playbtn")
playBtn.onclick = function() {
    clearTimeout(intervalId)

    throttleDataA.length = 0
    brakeDataA.length = 0
    steeringDataA.length = 0
    throttleDataB.length = 0
    brakeDataB.length = 0
    steeringDataB.length = 0
    labels.length = 0
    index = 0

    const sessionId1 = document.getElementById("sessionSelect1").value
    const sessionId2 = document.getElementById("sessionSelect2").value

    Promise.all([
        fetch("/sessions/" + sessionId1 + "/readings").then(r => r.json()),
        fetch("/sessions/" + sessionId2 + "/readings").then(r => r.json())
    ]).then(function([readingsA, readingsB]) {

        allReadingsA = readingsA
        allReadingsB = readingsB

        const minlength = Math.min(readingsA.length, readingsB.length)
        document.getElementById("scrubber").max = minlength - 1

        function playNext() {
            if (index >= minlength - 1) return

            const readingA = allReadingsA[index]
            const readingB = allReadingsB[index]

            throttleDataA.push(readingA.throttle)
            brakeDataA.push(readingA.brake)
            steeringDataA.push(readingA.steering)

            throttleDataB.push(readingB.throttle)
            brakeDataB.push(readingB.brake)
            steeringDataB.push(readingB.steering)

            labels.push(labels.length)

            if (throttleDataA.length >= maxPoints) { throttleDataA.shift() }
            if (brakeDataA.length >= maxPoints) { brakeDataA.shift() }
            if (steeringDataA.length >= maxPoints) { steeringDataA.shift() }
            if (throttleDataB.length >= maxPoints) { throttleDataB.shift() }
            if (brakeDataB.length >= maxPoints) { brakeDataB.shift() }
            if (steeringDataB.length >= maxPoints) { steeringDataB.shift() }
            if (labels.length >= maxPoints) { labels.shift() }

            const delay = (allReadingsA[index + 1].timestamp - allReadingsA[index].timestamp) * 1000
            updateCharts()
            index++

            document.getElementById("scrubber").value = index

            intervalId = setTimeout(playNext, delay)
        }
        playNext()
    })

}


const stopBtn = document.getElementById("stopbtn")
stopBtn.onclick = function() {
    clearTimeout(intervalId)
}


const scrubber = document.getElementById("scrubber")
scrubber.oninput = function() {
    index = parseInt(scrubber.value)

    clearTimeout(intervalId)

    throttleDataA.length = 0
    brakeDataA.length = 0
    steeringDataA.length = 0
    throttleDataB.length = 0
    brakeDataB.length = 0
    steeringDataB.length = 0
    labels.length = 0

    const start = Math.max(0, index - maxPoints)
    for (let i = start; i <= index; i++) {
        const readingA = allReadingsA[i]
        const readingB = allReadingsB[i]

        throttleDataA.push(readingA.throttle)
        brakeDataA.push(readingA.brake)
        steeringDataA.push(readingA.steering)

        throttleDataB.push(readingB.throttle)
        brakeDataB.push(readingB.brake)
        steeringDataB.push(readingB.steering)

        labels.push(i)
    }

    updateCharts()
}
