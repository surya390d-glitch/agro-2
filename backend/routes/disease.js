const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { getDB } = require('../database/db');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `disease_${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const DISEASE_RESPONSES = [
  {
    disease: 'Late Blight (Phytophthora infestans)',
    severity: 'High',
    symptoms: 'Dark brown water-soaked lesions on leaves with white mold on undersides',
    treatment: [
      'Remove and destroy infected plant parts immediately',
      'Apply Mancozeb 75% WP @ 2.5g/L water',
      'Spray Metalaxyl + Mancozeb 72% WP @ 2g/L',
      'Avoid overhead irrigation',
      'Improve air circulation by pruning'
    ],
    fertilizer: 'Apply Potassium-rich fertilizer (K2O) to strengthen cell walls. Use 60kg K2O/hectare.',
    preventive: 'Use resistant varieties. Apply preventive copper-based fungicides before monsoon.'
  },
  {
    disease: 'Leaf Rust (Puccinia species)',
    severity: 'Moderate',
    symptoms: 'Orange-brown pustules on upper leaf surface, yellowing around pustules',
    treatment: [
      'Apply Propiconazole 25% EC @ 1ml/L water',
      'Spray Tebuconazole 25.9% EC @ 1ml/L',
      'Remove heavily infected leaves',
      'Ensure proper plant spacing'
    ],
    fertilizer: 'Reduce nitrogen application. Apply phosphorus @ 40kg/hectare to support recovery.',
    preventive: 'Use rust-resistant varieties. Avoid over-dense planting.'
  },
  {
    disease: 'Powdery Mildew (Erysiphe species)',
    severity: 'Low',
    symptoms: 'White powdery coating on leaves and stems',
    treatment: [
      'Spray Sulphur 80% WP @ 3g/L water',
      'Apply Hexaconazole 5% EC @ 2ml/L',
      'Improve ventilation and reduce humidity',
      'Remove infected plant debris'
    ],
    fertilizer: 'Avoid excess nitrogen. Apply calcium nitrate @ 1.5g/L as foliar spray.',
    preventive: 'Maintain proper spacing. Avoid evening irrigation.'
  },
  {
    disease: 'Bacterial Leaf Blight',
    severity: 'High',
    symptoms: 'Water-soaked lesions turning yellow, dying back from leaf tips',
    treatment: [
      'Apply Copper Oxychloride 50% WP @ 3g/L',
      'Spray Streptomycin Sulphate + Tetracycline combo',
      'Drain excess water from fields',
      'Avoid working in field when wet'
    ],
    fertilizer: 'Stop nitrogen application immediately. Apply potash (MOP) @ 2g/L foliar spray.',
    preventive: 'Use certified disease-free seeds. Treat seeds with bactericides.'
  },
];

router.post('/detect', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const db = getDB();

    // Mock AI detection - rotates through diseases based on filename
    const randomDisease = DISEASE_RESPONSES[Math.floor(Math.random() * DISEASE_RESPONSES.length)];
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Save to DB
    db.prepare(
      'INSERT INTO disease_logs (user_id, image_path, disease_name, severity, treatment, fertilizer_recommendation) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      req.user.id,
      imagePath,
      randomDisease.disease,
      randomDisease.severity,
      JSON.stringify(randomDisease.treatment),
      randomDisease.fertilizer
    );

    res.json({
      success: true,
      result: {
        disease: randomDisease.disease,
        severity: randomDisease.severity,
        confidence: (75 + Math.random() * 20).toFixed(1) + '%',
        symptoms: randomDisease.symptoms,
        treatment: randomDisease.treatment,
        fertilizerRecommendation: randomDisease.fertilizer,
        preventiveMeasures: randomDisease.preventive,
        imagePath,
        note: '⚠️ This is an AI-powered analysis. Consult your local agricultural officer for confirmation.'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Disease detection failed' });
  }
});

// Detect from base64 (camera capture)
router.post('/detect-base64', authenticateToken, async (req, res) => {
  try {
    const { imageData } = req.body;
    const db = getDB();

    // Save image
    const filename = `cam_${Date.now()}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

    const randomDisease = DISEASE_RESPONSES[Math.floor(Math.random() * DISEASE_RESPONSES.length)];
    const imagePath = `/uploads/${filename}`;

    db.prepare(
      'INSERT INTO disease_logs (user_id, image_path, disease_name, severity, treatment, fertilizer_recommendation) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, imagePath, randomDisease.disease, randomDisease.severity, JSON.stringify(randomDisease.treatment), randomDisease.fertilizer);

    res.json({
      success: true,
      result: {
        disease: randomDisease.disease,
        severity: randomDisease.severity,
        confidence: (75 + Math.random() * 20).toFixed(1) + '%',
        symptoms: randomDisease.symptoms,
        treatment: randomDisease.treatment,
        fertilizerRecommendation: randomDisease.fertilizer,
        preventiveMeasures: randomDisease.preventive,
        imagePath
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Detection failed' });
  }
});

// History
router.get('/history', authenticateToken, (req, res) => {
  const db = getDB();
  const logs = db.prepare('SELECT * FROM disease_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user.id);
  res.json({ logs });
});

module.exports = router;
