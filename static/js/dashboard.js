console.log("Dashboard loaded")

const maxPoints = 50
const throttleData = []
const brakeData = []
const steeringData = []
const labels = []

const throttleChart = new Chart(document.getElementById("throttleChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Throttle",
            data: throttleData,
            borderColor: "green"
        }]
    },
    options: {
        animation: false
    }
})

const brakeChart = new Chart(document.getElementById("brakeChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Brake",
            data: brakeData,
            borderColor: "red"
        }]
    },
    options: {
        animation: false
    }
})

const steeringChart = new Chart(document.getElementById("steeringChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Steering",
            data: steeringData,
            borderColor: "blue"
        }] 
    },
    options: {
        animation: false
    }
})


const source = new EventSource("/stream")
source.onmessage = function(event) {
    const reading = JSON.parse(event.data)
    
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

    throttleChart.update()
    brakeChart.update()
    steeringChart.update()
}