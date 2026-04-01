const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const FERTILIZER_DB = {
  rice: {
    general: {
      summary: 'Rice requires balanced NPK with micronutrients for optimal yield.',
      schedule: [
        { stage: 'Basal (Before Transplanting)', fertilizers: [{ name: 'Urea', dose: '33 kg/acre', nutrients: 'Nitrogen' }, { name: 'SSP (Single Super Phosphate)', dose: '50 kg/acre', nutrients: 'Phosphorus' }, { name: 'Muriate of Potash (MOP)', dose: '27 kg/acre', nutrients: 'Potassium' }] },
        { stage: 'Tillering (21-25 DAT)', fertilizers: [{ name: 'Urea', dose: '33 kg/acre', nutrients: 'Nitrogen' }] },
        { stage: 'Panicle Initiation (45-50 DAT)', fertilizers: [{ name: 'Urea', dose: '17 kg/acre', nutrients: 'Nitrogen' }, { name: 'Zinc Sulphate', dose: '5 kg/acre', nutrients: 'Zinc' }] }
      ],
      micronutrients: 'Apply Zinc Sulphate @ 25 kg/ha where deficiency occurs. Use Ferrous Sulphate in alkaline soils.',
      organic: 'Apply 5 tonnes FYM/ha before final plowing. Use Azolla as biofertilizer.'
    }
  },
  wheat: {
    general: {
      summary: 'Wheat needs high nitrogen and moderate phosphorus for good grain filling.',
      schedule: [
        { stage: 'Basal (At Sowing)', fertilizers: [{ name: 'DAP (Di-Ammonium Phosphate)', dose: '50 kg/acre', nutrients: 'N+P' }, { name: 'MOP', dose: '20 kg/acre', nutrients: 'Potassium' }] },
        { stage: 'Crown Root Stage (20-25 DAS)', fertilizers: [{ name: 'Urea', dose: '55 kg/acre', nutrients: 'Nitrogen' }] },
        { stage: 'Jointing Stage (45 DAS)', fertilizers: [{ name: 'Urea', dose: '27 kg/acre', nutrients: 'Nitrogen' }] }
      ],
      micronutrients: 'Zinc @ 25 kg/ha, Boron @ 1 kg/ha if deficient.',
      organic: 'Apply 5 tonnes FYM/ha. Use Azotobacter + PSB biofertilizer.'
    }
  },
  cotton: {
    general: {
      summary: 'Cotton is a heavy feeder. Split nitrogen application is crucial.',
      schedule: [
        { stage: 'Basal (At Sowing)', fertilizers: [{ name: 'DAP', dose: '50 kg/acre', nutrients: 'N+P' }, { name: 'MOP', dose: '17 kg/acre', nutrients: 'Potassium' }] },
        { stage: 'Squaring (30-35 DAS)', fertilizers: [{ name: 'Urea', dose: '27 kg/acre', nutrients: 'Nitrogen' }] },
        { stage: 'Boll Formation (60 DAS)', fertilizers: [{ name: 'Urea', dose: '27 kg/acre', nutrients: 'Nitrogen' }, { name: 'MOP', dose: '17 kg/acre', nutrients: 'Potassium' }] }
      ],
      micronutrients: 'Boron @ 0.2% foliar spray at flowering. Zinc spray for linting quality.',
      organic: 'FYM @ 5 tonnes/ha. Municipal compost improves boll weight.'
    }
  },
  default: {
    general: {
      summary: 'General fertilizer recommendation for your crop.',
      schedule: [
        { stage: 'Basal Application', fertilizers: [{ name: 'DAP', dose: '50 kg/acre', nutrients: 'Nitrogen + Phosphorus' }, { name: 'MOP', dose: '20 kg/acre', nutrients: 'Potassium' }] },
        { stage: 'Top Dressing (30 DAS)', fertilizers: [{ name: 'Urea', dose: '30 kg/acre', nutrients: 'Nitrogen' }] }
      ],
      micronutrients: 'Apply micronutrient mixture as per soil test report.',
      organic: 'Apply FYM @ 5 tonnes/ha before sowing for best results.'
    }
  }
};

router.post('/recommend', authenticateToken, (req, res) => {
  try {
    const { cropName, soilType, deficiency } = req.body;
    const cropKey = cropName ? cropName.toLowerCase() : 'default';
    const data = FERTILIZER_DB[cropKey] || FERTILIZER_DB['default'];

    // Soil-specific adjustments
    const soilAdjustments = {
      sandy: 'Sandy soils: apply fertilizers in split doses. Avoid single large applications. Use slow-release fertilizers.',
      clay: 'Clay soils: ensure good drainage before fertilizer application. Phosphorus fixation is high, so increase P dose by 20%.',
      black: 'Black (Vertisol) soils: naturally rich in potassium. Reduce K dose by 25%. Add phosphorus and zinc.',
      loamy: 'Loamy soils: ideal for most fertilizers. Follow standard doses.',
      alluvial: 'Alluvial soils: generally fertile. Focus on nitrogen management with split applications.'
    };

    res.json({
      success: true,
      crop: cropName || 'General',
      soilType,
      recommendation: data.general,
      soilAdvice: soilAdjustments[soilType] || soilAdjustments['loamy'],
      deficiencyManagement: deficiency ? getDeficiencyResponse(deficiency) : null,
      importantTips: [
        '📋 Conduct soil test before applying fertilizers',
        '⏰ Apply at the right crop stage for maximum uptake',
        '💧 Water the soil before applying granular fertilizers',
        '🌱 Never exceed recommended doses to avoid soil degradation',
        '♻️ Combine organic + chemical for sustainable farming'
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fertilizer recommendation failed' });
  }
});

function getDeficiencyResponse(deficiency) {
  const deficiencies = {
    nitrogen: { symptom: 'Pale yellow leaves starting from older leaves', remedy: 'Apply Urea @ 1% foliar spray or increase nitrogen base dose by 20%' },
    phosphorus: { symptom: 'Purple/reddish discoloration on leaves, stunted root growth', remedy: 'Apply DAP foliar spray @ 2% or soil application of SSP' },
    potassium: { symptom: 'Brown scorching at leaf margins, weak stems', remedy: 'Spray Potassium Nitrate @ 1% or apply MOP to soil' },
    zinc: { symptom: 'Short internodes, small leaves, white stripes on young leaves', remedy: 'Spray Zinc Sulphate @ 0.5% or soil apply @ 25kg/ha' },
    iron: { symptom: 'Yellowing between veins of young leaves (interveinal chlorosis)', remedy: 'Spray Ferrous Sulphate @ 0.5% with citric acid' },
    boron: { symptom: 'Distorted young leaves, hollow stems, poor fruit set', remedy: 'Spray Borax @ 0.2% at flowering stage' }
  };
  return deficiencies[deficiency.toLowerCase()] || { symptom: 'Consult soil test report', remedy: 'Apply balanced NPK and micronutrient mix' };
}

module.exports = router;
