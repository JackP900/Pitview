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


const telemetryReplayChart = new Chart(document.getElementById("telemetryReplayChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            {label: "Throttle A", data: throttleDataA, borderColor: "green"},
            {label: "Brake A", data: brakeDataA, borderColor: "red"},
            {label: "Steering A", data: steeringDataA, borderColor: "blue"},
            {label: "Throttle B", data: throttleDataB, borderColor: "green", borderDash: [5, 5]},
            {label: "Brake B", data: brakeDataB, borderColor: "red", borderDash: [5, 5]},
            {label: "Steering B", data: steeringDataB, borderColor: "blue", borderDash: [5, 5]}
        ]
    },
    options: {
        animation: false,
        scales: {
            y: {
                min: 0,
                max: 1
            },
            x: {
                min: 0,
                max: 50,
                ticks: {
                    stepsize: 1
                }
            }

    
        }
    }
})


document.getElementById("throttleCheck").onchange = function() {
    telemetryReplayChart.data.datasets[0].hidden = !this.checked
    telemetryReplayChart.data.datasets[3].hidden = !this.checked
    telemetryReplayChart.update()
}

document.getElementById("brakeCheck").onchange = function() {
    telemetryReplayChart.data.datasets[1].hidden = !this.checked
    telemetryReplayChart.data.datasets[4].hidden = !this.checked
    telemetryReplayChart.update()
}

document.getElementById("steeringCheck").onchange = function() {
    telemetryReplayChart.data.datasets[2].hidden = !this.checked
    telemetryReplayChart.data.datasets[5].hidden = !this.checked
    telemetryReplayChart.update()
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
            telemetryReplayChart.update()
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

    telemetryReplayChart.update()
}