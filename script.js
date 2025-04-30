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

  mediaRecorder.onstop = async () => {
    sendButton.disabled = false;

    const blob = new Blob(audioChunks, { type: "audio/mp3" });
    const filename = `audio-${Date.now()}.mp3`;
    const file = new File([blob], filename, { type: "audio/mp3" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload", "true");

    status.textContent = "⏳ Enviando...";

    // 🔗 Atualize o link abaixo se necessário
    const proxyEndpoint = "https://whisper-proxy.sandraluciavarg.repl.co/transcribe";

    try {
      const response = await fetch(proxyEndpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result && result.text) {
        window.opener.postMessage({ transcript: result.text }, "*");
        window.close(); // Fecha o gravador
      } else {
        status.textContent = "❌ Falha ao transcrever.";
      }
    } catch (error) {
      console.error("Erro ao enviar áudio:", error);
      status.textContent = "❌ Erro ao conectar com o GPT.";
    }
  };

  mediaRecorder.start();
  status.textContent = "🎙️ Gravando...";
  recordButton.disabled = true;
  stopButton.disabled = false;
};

stopButton.onclick = () => {
  mediaRecorder.stop();
  status.textContent = "✅ Gravação finalizada!";
  stopButton.disabled = true;
  recordButton.disabled = false;
};
