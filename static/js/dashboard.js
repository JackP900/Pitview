console.log("Dashboard loaded")

const maxPoints = 50
const throttleData = []
const brakeData = []
const steeringData = []
const labels = []

let latencySum = 0
let latencyCount = 0
let msgCount = 0

setInterval(function() {
    console.log("readings/sec:", msgCount)
    msgCount = 0
}, 1000)

setInterval(function() {
    telemetryChart.update()
}, 33)

const telemetryChart = new Chart(document.getElementById("telemetryChart"), {
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
                max: 50,
                ticks: {
                    stepsize: 1
                }
            }
        }
    }
})

const source = new EventSource("/stream")
source.onmessage = function(event) {
    const reading = JSON.parse(event.data)

    const latencyMs = (Date.now() / 1000 - reading.timestamp) * 1000
    latencySum += latencyMs
    latencyCount++
    if (latencyCount % 100 === 0) {
        console.log("avg latency:", (latencySum / latencyCount).toFixed(1), "ms")
    }

    msgCount++

    if (reading.anomaly == true){
        message = document.getElementById("anomalyWarning")
        message.textContent = "Anomaly Detected"
    }
    else {
        document.getElementById("anomalyWarning").textContent = ""
    }

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

}

const startBtn = document.getElementById("startBtn")
startBtn.onclick = function() {
    document.getElementById("modal").style.display = "block"
}

const stopBtn = document.getElementById("stopBtn")
stopBtn.onclick = function() {
    fetch("/stop", {method: "POST" })
    document.getElementById("recordingIndicator").style.display = "none"
}

const confirmBtn = document.getElementById("confirmBtn")
confirmBtn.onclick = function() {
    fetch("/start", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ name: document.getElementById("sessionName").value })
    }).then(function() {
        document.getElementById("modal").style.display = "none"
        document.getElementById("recordingIndicator").style.display = "block"
    })
}