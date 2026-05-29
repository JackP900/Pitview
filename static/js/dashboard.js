const source = new EventSource("/stream")
source.onmessage = function(event) {
    const reading = JSON.parse(event.data)
    console.log(reading)
}