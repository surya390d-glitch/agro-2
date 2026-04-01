const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const PEST_DATABASE = {
  january: [
    { pest: 'Aphids', crops: ['wheat', 'mustard', 'vegetables'], severity: 'High', description: 'Sap-sucking insects forming colonies under leaves', management: 'Spray Imidacloprid 17.8% SL @ 0.5ml/L or Thiamethoxam 25%WG', organic: 'Neem oil @ 5ml/L + soap solution' },
    { pest: 'White Fly', crops: ['cotton', 'tomato', 'brinjal'], severity: 'Moderate', description: 'Tiny white flies causing yellowing and viral diseases', management: 'Yellow sticky traps + Acetamiprid 20%SP @ 0.2g/L', organic: 'Reflective mulches, strong water spray' }
  ],
  february: [
    { pest: 'Powdery Mildew', crops: ['wheat', 'peas', 'cucurbits'], severity: 'High', description: 'White powdery fungal growth on leaves', management: 'Sulphur 80%WP @ 3g/L or Hexaconazole 5%EC @ 2ml/L', organic: 'Baking soda solution @ 5g/L' }
  ],
  march: [
    { pest: 'Stem Borer', crops: ['wheat', 'maize', 'sugarcane'], severity: 'High', description: 'Larvae bore into stems causing dead hearts', management: 'Carbofuran 3G granules in whorls, Chlorpyrifos spray', organic: 'Trichogramma parasitoids release' },
    { pest: 'Thrips', crops: ['onion', 'chilli', 'groundnut'], severity: 'Moderate', description: 'Tiny insects causing silvery streaks on leaves', management: 'Spinosad 45%SC @ 0.3ml/L, Fipronil 5%SC', organic: 'Blue sticky traps, neem-based sprays' }
  ],
  april: [
    { pest: 'Fruit Fly', crops: ['mango', 'guava', 'cucumber', 'tomato'], severity: 'High', description: 'Maggots in fruits causing premature drop', management: 'Malathion bait spray, protein hydrolysate traps', organic: 'Methyl eugenol traps for male flies' }
  ],
  may: [
    { pest: 'Red Spider Mite', crops: ['cotton', 'brinjal', 'tomato'], severity: 'High', description: 'Tiny red mites causing bronzing and webbing on leaves', management: 'Dicofol 18.5%EC @ 2.5ml/L or Abamectin', organic: 'Strong water spray, predatory mites' }
  ],
  june: [
    { pest: 'Brown Plant Hopper', crops: ['rice'], severity: 'Very High', description: 'Hopperburn - circular patches of dead plants in fields', management: 'Buprofezin 25%SC @ 1ml/L, drain field and spray', organic: 'Light traps at night, potassium silicate' }
  ],
  july: [
    { pest: 'Leaf Folder', crops: ['rice'], severity: 'High', description: 'Caterpillars folding leaves and feeding inside', management: 'Chlorantraniliprole 18.5%SC @ 0.3ml/L, Indoxacarb', organic: 'Neem-based products, light traps' },
    { pest: 'Blast Disease (Fungal)', crops: ['rice'], severity: 'Very High', description: 'Diamond-shaped lesions on leaves, node blast', management: 'Tricyclazole 75%WP @ 0.6g/L, Isoprothiolane', organic: 'Silicon-based foliar spray, balanced fertilization' }
  ],
  august: [
    { pest: 'Bollworm', crops: ['cotton', 'tomato', 'chickpea'], severity: 'Very High', description: 'Caterpillars boring into bolls and fruits', management: 'Bt-based sprays, Spinosad, Emamectin benzoate', organic: 'Pheromone traps, Trichogramma cards, HaNPV' }
  ],
  september: [
    { pest: 'Pod Borer', crops: ['pigeonpea', 'chickpea', 'soybean'], severity: 'High', description: 'Larvae feeding on pods and seeds', management: 'Chlorpyrifos 20%EC @ 2ml/L, Indoxacarb 14.5%SC', organic: 'Bird perches, NSKE 5%, light traps' }
  ],
  october: [
    { pest: 'Whitefly (Tobacco)', crops: ['cotton', 'tomato', 'soybean'], severity: 'High', description: 'Vector for viral diseases, heavy populations build up', management: 'Triazophos 40%EC @ 2ml/L alternated with Imidacloprid', organic: 'Yellow traps, neem oil spray' }
  ],
  november: [
    { pest: 'Aphids', crops: ['wheat', 'mustard', 'vegetables'], severity: 'Moderate', description: 'Early season aphid infestation on new crop', management: 'Dimethoate 30%EC @ 1ml/L, Thiamethoxam', organic: 'Neem soap spray, lady bird beetle conservation' }
  ],
  december: [
    { pest: 'Cutworms', crops: ['wheat', 'vegetables', 'potato'], severity: 'Moderate', description: 'Caterpillars cut seedlings at soil level at night', management: 'Apply Chlorpyrifos 20%EC in irrigation water or bait', organic: 'Deep plowing, Bacillus thuringiensis' }
  ]
};

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

router.get('/alerts', authenticateToken, (req, res) => {
  try {
    const { state, crops } = req.query;
    const now = new Date();
    const currentMonth = MONTHS[now.getMonth()];
    const nextMonth = MONTHS[(now.getMonth() + 1) % 12];

    const currentPests = (PEST_DATABASE[currentMonth] || []);
    const upcomingPests = (PEST_DATABASE[nextMonth] || []);

    // Filter by crops if provided
    const userCrops = crops ? crops.split(',').map(c => c.toLowerCase().trim()) : null;

    const filterPests = (pests) => userCrops
      ? pests.filter(p => p.crops.some(c => userCrops.includes(c)))
      : pests;

    res.json({
      success: true,
      month: currentMonth,
      state: state || 'All India',
      currentAlerts: filterPests(currentPests),
      upcomingAlerts: filterPests(upcomingPests).map(p => ({ ...p, upcoming: true })),
      generalTips: [
        '🔍 Scout your fields every 3-4 days during critical growth stages',
        '📊 Follow Economic Threshold Levels before spraying',
        '🌿 Rotate pesticides to prevent resistance development',
        '🐝 Avoid spraying during bee-active hours (8am-5pm) for pollinators'
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pest alerts' });
  }
});

module.exports = router;
