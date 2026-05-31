console.log("replay loaded")

fetch("/sessions")
    .then(response => response.json())
    .then(sessions => {
        sessions.forEach(function(session) {
        const option = document.createElement("option")
        option.value = session.id
        option.text = "Session" + session.id + " - " + new Date(session.created_at * 1000)
        document.getElementById("sessionSelect").appendChild(option)
        })
    })

const throttleData = []
const brakeData = []
const steeringData = []
const labels = []


const throttleReplayChart = new Chart(document.getElementById("throttleReplayChart"), {
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

const brakeReplayChart = new Chart(document.getElementById("brakeReplayChart"), {
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

const steeringReplayChart = new Chart(document.getElementById("steeringReplayChart"), {
    type: "line",
    data: {
        labels:labels,
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


const playBtn = document.getElementById("playbtn")
playBtn.onclick = function() {
    const sessionId = document.getElementById("sessionSelect").value
    fetch("/sessions/" + sessionId + "/readings")
        .then(response => response.json())
        .then(readings => {
            let index = 0
            setInterval(function() {
                if (index < readings.length) {
                    const reading = readings[index]
                    index++
                }
            }, 100)
        })
}