const recordButton = document.getElementById("record");
const stopButton = document.getElementById("stop");
const sendButton = document.getElementById("send");
const status = document.getElementById("status");

let mediaRecorder;
let audioChunks = [];

recordButton.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      sendButton.disabled = false;
    };

    mediaRecorder.start();
    status.textContent = "🎙️ Gravando...";
    recordButton.disabled = true;
    stopButton.disabled = false;
  } catch (error) {
    status.textContent = "❌ Erro ao acessar microfone: " + error.message;
  }
};

stopButton.onclick = () => {
  mediaRecorder.stop();
  status.textContent = "✅ Gravação finalizada.";
  recordButton.disabled = false;
  stopButton.disabled = true;
};

sendButton.onclick = async () => {
  const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");

  const endpoint = "https://d54d82ee-5ce0-4d3c-9659-20a95a01db60-00-3joywglwuhfi4.worf.replit.dev/transcribe";
  status.textContent = "📤 Enviando para o servidor...";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    status.textContent = `📄 Transcrição: ${result.text}`;
  } catch (error) {
    console.error("Erro ao enviar áudio:", error);
    status.textContent = `❌ Erro de rede: ${error.message}`;
  }
};
