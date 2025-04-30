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
  };

  mediaRecorder.start();
  status.textContent = "🎙️ Gravando...";
  recordButton.disabled = true;
  stopButton.disabled = false;
  sendButton.disabled = true;
};

stopButton.onclick = () => {
  mediaRecorder.stop();
  status.textContent = "⏹️ Gravação finalizada";
  recordButton.disabled = false;
  stopButton.disabled = true;
};

sendButton.onclick = async () => {
  status.textContent = "⏳ Enviando...";
  const blob = new Blob(audioChunks, { type: "audio/mp3" });
  const formData = new FormData();
  formData.append("file", blob, "audio.mp3");

  try {
    const uploadResponse = await fetch("https://file.io", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadData.success) {
      throw new Error("Falha no upload: " + uploadData.message);
    }

    const audioUrl = uploadData.link;

    // 🔁 ENVIA PARA O GPT VIA ACTION
    const response = await fetch(
      "https://d54d82ee-5ce0-4d3c-9659-20a95a01db60-00-3joywglwuhfi4.worf.replit.dev/transcribe",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioUrl }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Erro da API: " + errorText);
    }

    status.textContent = "✅ Enviado com sucesso!";
    sendButton.disabled = true;
  } catch (error) {
    status.innerHTML =
      "❌ <b>Erro de rede:</b> " + (error.message || "Falha desconhecida");
  }
};
