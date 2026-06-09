console.log("replay loaded")
let intervalId = null
let allReadings = []
let index = 0

fetch("/sessions")
    .then(response => response.json())
    .then(sessions => {
        sessions.forEach(function(session) {
        const option = document.createElement("option")
        option.value = session.id
        option.text = session.name
        document.getElementById("sessionSelect").appendChild(option)
        })
    })

const sessionSelect = document.getElementById("sessionSelect")
const deleteBtn = document.getElementById("deleteBtn")
deleteBtn.onclick = function() {
    fetch("/delete/" + sessionSelect.value, {method: "DELETE"})
    .then(function() {sessionSelect.remove(sessionSelect.selectedIndex)})
    
}


const throttleData = []
const brakeData = []
const steeringData = []
const labels = []
const maxPoints = 50


const telemetryReplayChart = new Chart(document.getElementById("telemetryReplayChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            {label: "Throttle", data: throttleData, borderColor: "green"},
            {label: "Brake", data: brakeData, borderColor: "red"},
            {label: "Steering", data: steeringData, borderColor: "blue"}
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
                max: 50
            }
        }
    }
})


const playBtn = document.getElementById("playbtn")
playBtn.onclick = function() {
    clearTimeout(intervalId)
    throttleData.length = 0
    brakeData.length = 0
    steeringData.length = 0
    labels.length = 0
    const sessionId = document.getElementById("sessionSelect").value
    fetch("/sessions/" + sessionId + "/readings")
        .then(response => response.json())
        .then(readings => {
            allReadings = readings
            function playNext() {
                if (index >= allReadings.length - 1) {
                    return
                }
                const reading = allReadings[index]
                throttleData.push(reading.throttle)
                brakeData.push(reading.brake)
                steeringData.push(reading.steering)
                labels.push(labels.length)

                if (throttleData.length >= maxPoints) {
                    throttleData.shift()
                }
                if (brakeData.length >= maxPoints) {
                    brakeData.shift()
                }
                if (steeringData.length >= maxPoints) {
                    steeringData.shift()
                }
                if (labels.length >= maxPoints) {
                    labels.shift()
                }

                const delay = (allReadings[index + 1].timestamp - allReadings[index].timestamp) * 1000
                telemetryReplayChart.update()

                index++

                intervalId = setTimeout(playNext, delay)
            }
            document.getElementById("scrubber").max = readings.length - 1
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
    throttleData.length = 0
    brakeData.length = 0
    steeringData.length = 0
    labels.length = 0

    const start = Math.max(0, index - maxPoints)
    for (let i = start; i <= index; i++) {
        const reading = allReadings[i]
        throttleData.push(reading.throttle)
        brakeData.push(reading.brake)
        steeringData.push(reading.steering)
        labels.push(i)
    }

    telemetryReplayChart.update()


}