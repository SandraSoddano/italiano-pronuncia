const recordButton = document.getElementById("record");
const stopButton = document.getElementById("stop");
const sendButton = document.getElementById("send");
const status = document.getElementById("status");

let mediaRecorder;
let audioChunks = [];

recordButton.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (e) => {
    audioChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    sendButton.disabled = false;
    status.textContent = "✅ Gravação finalizada!";
  };

  mediaRecorder.start();
  status.textContent = "🎙️ Gravando...";
  recordButton.disabled = true;
  stopButton.disabled = false;
};

stopButton.onclick = () => {
  mediaRecorder.stop();
  stopButton.disabled = true;
  recordButton.disabled = false;
};

sendButton.onclick = async () => {
  const blob = new Blob(audioChunks, { type: "audio/mp3" });
  const file = new File([blob], `audio-${Date.now()}.mp3`, { type: "audio/mp3" });

  const formData = new FormData();
  formData.append("file", file);

  status.textContent = "⏳ Enviando...";

  try {
    const response = await fetch("https://whisper-proxy.sandraluciavarg.repl.co/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resposta do servidor com erro:", response.status, errorText);
      status.textContent = `❌ Erro ${response.status}: ${errorText}`;
      return;
    }

    const data = await response.json();

    if (data && data.text) {
      window.opener.postMessage({ transcription: data.text }, "*");
      window.close();
    } else {
      status.textContent = "❌ Erro: resposta sem transcrição.";
      console.warn("Resposta recebida mas sem texto:", data);
    }
  } catch (error) {
    console.error("Erro na conexão com o servidor:", error);
    status.textContent = `❌ Erro de rede: ${error.message}`;
  }
};
