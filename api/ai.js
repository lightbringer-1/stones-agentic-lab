// ai.js
const overlay = document.getElementById('aiOverlay');
const talkBtnId = 'talkBtn';

function setOverlay(text) {
  overlay.textContent = text;
}

async function chatToServer(userText) {
  const r = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ userText })
  });
  if (!r.ok) throw new Error('Chat server error');
  const j = await r.json();
  return j.text || 'Ready.';
}

async function speak(text) {
  const r = await fetch('/api/voice', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ text })
  });
  if (!r.ok) throw new Error('Voice server error');
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await audio.play();
  return true;
}

// Web Speech API (STT)
function getRecognizer() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
}

async function handleTalkPress() {
  const rec = getRecognizer();
  if (!rec) {
    setOverlay('🎤 Browser STT not available. Type instead or try Chrome.');
    return;
  }
  setOverlay('🎤 Listening… (say: “Agent, what’s next?”)');
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = async (e) => {
    try {
      const text = e.results[0][0].transcript;
      setOverlay('🧠 Thinking…');
      const reply = await chatToServer(text);
      setOverlay(`🗨️ ${reply}`);
      await speak(reply);
    } catch (err) {
      setOverlay('⚠️ Error responding. Check API keys/config.');
    }
  };
  rec.onerror = () => setOverlay('⚠️ Mic error. Check permissions.');
  rec.onend = () => {}; // idle
  rec.start();
}

export function wireAI() {
  const b = document.getElementById(talkBtnId);
  if (!b) return;
  b.addEventListener('click', handleTalkPress);
  setOverlay('👋 Voice ready. Click “Talk” and speak.');
}
