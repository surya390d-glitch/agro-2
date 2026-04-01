const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const MARKET_DATA = {
  'Tamil Nadu': {
    crops: [
      { name: 'Rice (Ponni)', price: 2180, unit: 'quintal', trend: 'up', change: '+2.3%', market: 'Chennai, Thanjavur' },
      { name: 'Banana', price: 1200, unit: 'quintal', trend: 'up', change: '+5.1%', market: 'Trichy, Madurai' },
      { name: 'Turmeric', price: 8500, unit: 'quintal', trend: 'stable', change: '0.0%', market: 'Erode' },
      { name: 'Tomato', price: 1800, unit: 'quintal', trend: 'down', change: '-3.2%', market: 'Koyambedu, Madurai' },
      { name: 'Onion', price: 1400, unit: 'quintal', trend: 'up', change: '+8.5%', market: 'Chennai, Salem' },
      { name: 'Sugarcane', price: 380, unit: 'quintal', trend: 'stable', change: '+0.5%', market: 'Coimbatore, Trichy' },
      { name: 'Groundnut', price: 5200, unit: 'quintal', trend: 'up', change: '+3.7%', market: 'Ariyalur, Villupuram' },
      { name: 'Cotton', price: 6200, unit: 'quintal', trend: 'down', change: '-1.8%', market: 'Coimbatore, Tirunelveli' }
    ]
  },
  'Maharashtra': {
    crops: [
      { name: 'Soybean', price: 4200, unit: 'quintal', trend: 'up', change: '+4.5%', market: 'Nagpur, Akola' },
      { name: 'Cotton', price: 6100, unit: 'quintal', trend: 'stable', change: '-0.5%', market: 'Aurangabad, Latur' },
      { name: 'Onion', price: 1350, unit: 'quintal', trend: 'up', change: '+12.3%', market: 'Nashik, Pune' },
      { name: 'Grapes', price: 4500, unit: 'quintal', trend: 'up', change: '+6.2%', market: 'Nashik, Sangli' },
      { name: 'Sugarcane', price: 350, unit: 'quintal', trend: 'stable', change: '0.0%', market: 'Kolhapur, Pune' },
      { name: 'Pomegranate', price: 8000, unit: 'quintal', trend: 'up', change: '+3.1%', market: 'Solapur, Sangli' }
    ]
  },
  'Punjab': {
    crops: [
      { name: 'Wheat', price: 2275, unit: 'quintal', trend: 'stable', change: '+0.8%', market: 'Amritsar, Ludhiana' },
      { name: 'Rice (Basmati)', price: 3800, unit: 'quintal', trend: 'up', change: '+5.5%', market: 'Amritsar, Patiala' },
      { name: 'Maize', price: 1950, unit: 'quintal', trend: 'down', change: '-2.1%', market: 'Ludhiana, Jalandhar' },
      { name: 'Potato', price: 1100, unit: 'quintal', trend: 'down', change: '-8.3%', market: 'Hoshiarpur, Amritsar' },
      { name: 'Mustard', price: 5300, unit: 'quintal', trend: 'up', change: '+4.2%', market: 'Bathinda, Sangrur' }
    ]
  },
  'Uttar Pradesh': {
    crops: [
      { name: 'Wheat', price: 2200, unit: 'quintal', trend: 'stable', change: '+1.1%', market: 'Agra, Lucknow' },
      { name: 'Sugarcane', price: 360, unit: 'quintal', trend: 'stable', change: '0.0%', market: 'Muzaffarnagar, Meerut' },
      { name: 'Potato', price: 1050, unit: 'quintal', trend: 'down', change: '-5.2%', market: 'Agra, Kanpur' },
      { name: 'Mustard', price: 5100, unit: 'quintal', trend: 'up', change: '+3.8%', market: 'Agra, Mathura' },
      { name: 'Onion', price: 1250, unit: 'quintal', trend: 'up', change: '+9.1%', market: 'Lucknow, Varanasi' }
    ]
  },
  'default': {
    crops: [
      { name: 'Rice', price: 2100, unit: 'quintal', trend: 'stable', change: '+1.5%', market: 'Local Mandi' },
      { name: 'Wheat', price: 2200, unit: 'quintal', trend: 'up', change: '+2.0%', market: 'Local Mandi' },
      { name: 'Maize', price: 1850, unit: 'quintal', trend: 'down', change: '-1.5%', market: 'Local Mandi' },
      { name: 'Soybean', price: 4100, unit: 'quintal', trend: 'up', change: '+3.0%', market: 'Local Mandi' },
      { name: 'Cotton', price: 6000, unit: 'quintal', trend: 'stable', change: '0.0%', market: 'Local Mandi' },
      { name: 'Sugarcane', price: 355, unit: 'quintal', trend: 'stable', change: '+0.3%', market: 'Local Mandi' },
      { name: 'Onion', price: 1300, unit: 'quintal', trend: 'up', change: '+7.0%', market: 'Local Mandi' },
      { name: 'Tomato', price: 1600, unit: 'quintal', trend: 'down', change: '-4.0%', market: 'Local Mandi' },
      { name: 'Potato', price: 1100, unit: 'quintal', trend: 'down', change: '-6.0%', market: 'Local Mandi' },
      { name: 'Groundnut', price: 5000, unit: 'quintal', trend: 'up', change: '+2.5%', market: 'Local Mandi' },
    ]
  }
};

router.get('/prices', authenticateToken, (req, res) => {
  try {
    const { state } = req.query;
    const stateData = MARKET_DATA[state] || MARKET_DATA['default'];

    const sortedByProfit = [...stateData.crops].sort((a, b) => b.price - a.price);
    const trendingUp = stateData.crops.filter(c => c.trend === 'up');

    res.json({
      success: true,
      state: state || 'All India',
      lastUpdated: new Date().toISOString(),
      prices: stateData.crops,
      topProfitable: sortedByProfit.slice(0, 3),
      trendingUp,
      disclaimer: 'Prices are indicative. Check e-NAM (enam.gov.in) and AGMARKNET for real-time prices.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Market price fetch failed' });
  }
});

module.exports = router;
