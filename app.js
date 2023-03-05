// IMPORTS

import { Configuration, OpenAIApi } from "openai";
import { talk } from "text-to-speech-js";

// DOM

let stopButton = document.querySelector('.stop');
let blob;

// MEDIA CAPTURE

let video = document.createElement('video');
video.setAttribute('controls', true);
video.setAttribute('width', 400);

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then((stream) => video.srcObject = stream)
document.body.append(video);
video.muted = true;
video.play();


const recorder = new MediaRecorder(video.srcObject);
recorder.start();

// MEDIA CAPTURE HANDLERS

stopButton.addEventListener('click', () => {
    recorder.stop();
    console.log('stopped');
});
recorder.addEventListener('dataavailable', (e) => {
    blob = e.data;
});

// OPENAI - TRANSCRIBE CAPTURE TO TEXT

const configuration = new Configuration(
    {apiKey: process.env.OPENAI_API_KEY});
const openai = new OpenAIApi(configuration);

const transcript = openai.createTranscription('whisper-1', blob); // does a blob work?

// OPENAI - FEED TEXT TO GPT

const completion = openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
        {'role': 'user', 'content': transcript.text}
    ]
});

// CONVERT GPT RESPONSE TO SPEECH, PLAY AUDIO FILE IN BROWSER

const response = completion.choices[0].message.content;
talk({text: response, notNow: false});