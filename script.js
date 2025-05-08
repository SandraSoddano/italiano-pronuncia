let mediaRecorder;
let audioChunks = [];

document.getElementById("record").addEventListener("click", async () => {
  audioChunks = [];  // Limpa qualquer gravação anterior
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = event => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", blob);

    // Enviar para o servidor
    fetch("https://d54d82ee-5ce0-4d3c-9659-20a95a01db60-00-3joywglwuhfi4.worf.replit.dev/transcribe", {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById("status").textContent = `📝 Transcrição: ${data.text}`;
    })
    .catch(error => {
      document.getElementById("status").textContent = `⚠️ Erro: ${error.message || "Erro ao enviar o áudio."}`;
      console.error(error);
    });
  };

  mediaRecorder.start();
  document.getElementById("record").disabled = true;
  document.getElementById("stop").disabled = false;
  document.getElementById("send").disabled = true;
  document.getElementById("status").textContent = "🎙️ Gravando...";
});

document.getElementById("stop").addEventListener("click", () => {
  mediaRecorder.stop();
  document.getElementById("record").disabled = false;
  document.getElementById("stop").disabled = true;
  document.getElementById("send").disabled = false;
  document.getElementById("status").textContent = "🛑 Gravação finalizada. Pronto para enviar.";
});
