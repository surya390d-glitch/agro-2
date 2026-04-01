const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const { getDB } = require('../database/db');

const router = express.Router();

const EN_RESPONSES = {
  greeting: "Hello! I'm AgroBot 🌱 Ask me anything about farming — crops, pests, weather or markets!",
  irrigation: "For optimal irrigation, check soil moisture 5cm deep. Most crops need irrigation when topsoil feels dry. For Drip, run early morning.",
  fertilizer: "Apply fertilizers (like Urea or NPK) in the morning or evening. Always ensure the soil is slightly damp to prevent root burn. Organic manure is best before sowing.",
  pest: "Use Integrated Pest Management (IPM). Start with organic neem-oil sprays for Aphids/Whiteflies. Use chemical sprays only if infestation exceeds 10%.",
  disease: "For fungal diseases (Rust/Blight), immediately remove infected leaves. Ensure proper spacing for airflow and apply Copper Oxychloride or Mancozeb.",
  weather: "Monitor local apps for heavy rainfall. Avoid spraying any chemicals 24 hours before expected rain. Secure harvested crops under tarps.",
  harvest: "Harvest when grains are hard and golden. For vegetables, harvest early morning to maintain freshness. Use proper mechanized tools.",
  market: "Always check the e-NAM portal before selling to local Mandis. Grading your produce (Size A vs B) can increase your profit margins significantly.",
  soil: "Soil health is key. Test your soil every 2 years. Maintain pH around 6.5. Add rich compost/vermicompost annually to increase carbon content.",
  default: "I primarily focus on farming (Irrigation, Pests, Fertilizers, Markets, Weather, Soil). Could you please rephrase your agricultural question?"
};

async function translateText(text, targetLang) {
  if (!text || targetLang === 'en') return text;
  try {
    const res = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
      params: { client: 'gtx', sl: 'auto', tl: targetLang, dt: 't', q: text }
    });
    return res.data[0].map(x => x[0]).join('');
  } catch (err) {
    return text;
  }
}

async function getResponse(rawMessage, language) {
  // Translate the input to EN so our matching works universally!
  const enMessage = await translateText(rawMessage, 'en');
  const msg = (enMessage || '').toLowerCase();
  
  let basicAnswer = EN_RESPONSES.default;
  if (msg.includes('hello') || msg.includes('hi ') || msg.includes('hey') || msg.includes('greet')) basicAnswer = EN_RESPONSES.greeting;
  else if (msg.includes('water') || msg.includes('irrigat')) basicAnswer = EN_RESPONSES.irrigation;
  else if (msg.includes('fertil') || msg.includes('urea') || msg.includes('npk') || msg.includes('compost')) basicAnswer = EN_RESPONSES.fertilizer;
  else if (msg.includes('pest') || msg.includes('insect') || msg.includes('bug') || msg.includes('aphid') || msg.includes('control')) basicAnswer = EN_RESPONSES.pest;
  else if (msg.includes('disease') || msg.includes('fung') || msg.includes('rust') || msg.includes('rot') || msg.includes('sick')) basicAnswer = EN_RESPONSES.disease;
  else if (msg.includes('weather') || msg.includes('rain') || msg.includes('storm')) basicAnswer = EN_RESPONSES.weather;
  else if (msg.includes('harvest') || msg.includes('collect') || msg.includes('yield') || msg.includes('reap')) basicAnswer = EN_RESPONSES.harvest;
  else if (msg.includes('market') || msg.includes('price') || msg.includes('sell') || msg.includes('mandi') || msg.includes('cost')) basicAnswer = EN_RESPONSES.market;
  else if (msg.includes('soil') || msg.includes('ph ') || msg.includes('mud')) basicAnswer = EN_RESPONSES.soil;

  // Now translate back to the user's selected language
  const finalAnswer = await translateText(basicAnswer, language);
  return finalAnswer;
}

router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // Ensure we don't crash by waiting for the translator
    const response = await getResponse(message, language);
    
    const db = getDB();
    db.prepare('INSERT INTO chat_history (user_id, message, response, language) VALUES (?, ?, ?, ?)')
      .run(req.user.id, message, response, language);

    res.json({ success: true, response, language });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

router.get('/history', authenticateToken, (req, res) => {
  const db = getDB();
  const history = db.prepare('SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json({ history: history.reverse() });
});

module.exports = router;
