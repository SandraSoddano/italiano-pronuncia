let mediaRecorder, audioChunks = [];

const recordButton = document.getElementById("record");
const stopButton = document.getElementById("stop");
const sendButton = document.getElementById("send");
const status = document.getElementById("status");

recordButton.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = e => {
    audioChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    sendButton.disabled = false;
  };

  mediaRecorder.start();
  status.textContent = "🎙️ Gravando...";
  recordButton.disabled = true;
  stopButton.disabled = false;
};

stopButton.onclick = () => {
  mediaRecorder.stop();
  status.textContent = "⏹️ Gravação finalizada!";
  stopButton.disabled = true;
};

sendButton.onclick = async () => {
  const blob = new Blob(audioChunks, { type: 'audio/webm' });
  const formData = new FormData();
  formData.append("audio", blob);

  status.textContent = "⏳ Enviando...";

  // Substitua abaixo com o endpoint real:
  const response = await fetch("https://YOUR_PROXY_URL/transcribe", {
    method: "POST",
    body: formData
  });

  const result = await response.json();
  status.textContent = `✅ Transcrição: ${result.text}`;
};
