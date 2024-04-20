window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

let bigBrother
let processor
let speechHandling = false
let stopped = true

const RECORD = document.querySelector(".record")
const TRANSCRIPT = document.querySelector(".transcript")

const INDICATE_START = () => {
  console.info("Speech:: Started")
}

const PROCESS_AUDIO = (payload) => {
  console.info("Speech:: Payload")
  const transcript = payload.results[payload.results.length - 1][0].transcript
  // const isFinal = payload.results[payload.results.length - 1].isFinal;
  TRANSCRIPT.innerHTML = transcript.split(" ").reduce((acc, cur) => {
    return `${acc}<span class="${cur}">${cur}${
      cur.toLowerCase() === "golden" ? "<span>Golden</span>" : ""
    }</span> `
  }, "")
}

const ON_END = () => {
  // Have to restart it on mobile device as it'll close on each read
  if (!stopped && bigBrother) bigBrother.start()
  console.info("Speech:: Ended")
}

const TOGGLE_RECORDING = async () => {
  if (!speechHandling) {
    speechHandling = true
    // Set up the SpeechRecognition system
    stopped = false
    // Create a new speech recognition handler and run it
    bigBrother = new window.SpeechRecognition()
    bigBrother.continuous = true
    bigBrother.interimResults = true
    bigBrother.addEventListener("start", INDICATE_START)
    bigBrother.addEventListener("result", PROCESS_AUDIO)
    bigBrother.addEventListener("end", ON_END)
    bigBrother.start()
    document.documentElement.dataset.recording = true
  } else {
    speechHandling = false
    // Wind it down
    stopped = true
    document.documentElement.dataset.recording = false
    if (bigBrother) bigBrother.stop()
    console.info("Admin Remote:: Speech disabled")
  }
}

TOGGLE_RECORDING()

RECORD.addEventListener("click", TOGGLE_RECORDING)
