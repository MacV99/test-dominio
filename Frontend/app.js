// Mensaje de bienvenida automático
window.onload = function () {
  const hour = new Date().getHours();
  let greeting = "¡Hola!";
  if (hour < 12) greeting = "¡Buenos días!";
  else if (hour < 18) greeting = "¡Buenas tardes!";
  else greeting = "¡Buenas noches!";

  const welcomeMessage = `${greeting} Bienvenido a Boliglobos Latino. ¿En qué puedo ayudarte hoy?`;
  appendMessage('assistant', welcomeMessage);
};

// Función para enviar mensajes
async function sendMessage() {
  const userInput = document.getElementById('user-input').value.trim();
  if (!userInput) {
    alert("Por favor, escribe un mensaje válido.");
    return;
  }

  appendMessage('user', userInput);
  document.getElementById('user-input').value = '';

  const typingIndicator = document.getElementById('typing-indicator');
  typingIndicator.style.display = 'block';

  try {
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userInput }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    appendMessage('assistant', data.response);
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = `
  ¡Ups! Algo salió mal. Por favor, contáctanos directamente a través de nuestra línea oficial de WhatsApp:
  <a href="https://api.whatsapp.com/send?phone=+573184215899&text=Hola,%20quiero%20adquirir%20un%20producto%F0%9F%8E%88" target="_blank">
    WhatsApp Boliglobos Latino
  </a>.
  `;
    appendMessage('assistant', errorMessage);
  } finally {
    typingIndicator.style.display = 'none';
  }
}
// Funciones auxiliares
async function createThread() {
  const response = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Error al crear el Thread: ${response.statusText}`);
  }

  return await response.json();
}

async function addMessageToThread(threadId, message) {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: "user",
      content: message
    })
  });

  if (!response.ok) {
    throw new Error(`Error al agregar el mensaje: ${response.statusText}`);
  }

  return await response.json();
}

async function createRun(threadId) {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistant_id: assistantId
    })
  });

  if (!response.ok) {
    throw new Error(`Error al crear el Run: ${response.statusText}`);
  }

  return await response.json();
}

async function checkRunStatus(threadId, runId) {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    throw new Error(`Error al verificar el estado del Run: ${response.statusText}`);
  }

  return await response.json();
}

async function getThreadMessages(threadId) {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener los mensajes: ${response.statusText}`);
  }

  return await response.json();
}

// Función para formatear mensajes
function formatMessage(message) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.replace(urlRegex, (url) => {
    if (url.includes('wa.me') || url.includes('whatsapp.com')) {
      return `<a href="${url}" target="_blank">WhatsApp Boliglobos Latino</a>`;
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return `<a href="${url}" target="_blank">Síguenos en YouTube</a>`;
    } else if (url.includes('facebook.com')) {
      return `<a href="${url}" target="_blank">Visítanos en Facebook</a>`;
    } else if (url.includes('instagram.com')) {
      return `<a href="${url}" target="_blank">Síguenos en Instagram</a>`;
    } else {
      return `<a href="${url}" target="_blank">${url}</a>`;
    }
  });
}

// Función para agregar mensajes al chat
function appendMessage(sender, message) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.innerHTML = `<p>${message}</p>`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll automático
}
