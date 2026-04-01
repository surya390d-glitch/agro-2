const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getDB } = require('../database/db');

const router = express.Router();

const CROP_DATABASE = {
    rice: { name: 'Rice', seasons: ['kharif'], soils: ['clay', 'loamy'], waterNeeds: 'high', daysToHarvest: 120, yieldPerAcre: 20, pricePerQuintal: 2000 },
    wheat: { name: 'Wheat', seasons: ['rabi'], soils: ['loamy', 'clay'], waterNeeds: 'medium', daysToHarvest: 150, yieldPerAcre: 18, pricePerQuintal: 2200 },
    cotton: { name: 'Cotton', seasons: ['kharif'], soils: ['black', 'loamy'], waterNeeds: 'medium', daysToHarvest: 180, yieldPerAcre: 8, pricePerQuintal: 5500 },
    sugarcane: { name: 'Sugarcane', seasons: ['annual'], soils: ['loamy', 'alluvial'], waterNeeds: 'high', daysToHarvest: 365, yieldPerAcre: 300, pricePerQuintal: 350 },
    maize: { name: 'Maize', seasons: ['kharif', 'rabi'], soils: ['loamy', 'sandy'], waterNeeds: 'medium', daysToHarvest: 90, yieldPerAcre: 25, pricePerQuintal: 1800 },
    tomato: { name: 'Tomato', seasons: ['rabi', 'summer'], soils: ['loamy', 'sandy'], waterNeeds: 'medium', daysToHarvest: 75, yieldPerAcre: 80, pricePerQuintal: 1500 },
    onion: { name: 'Onion', seasons: ['rabi'], soils: ['loamy', 'alluvial'], waterNeeds: 'medium', daysToHarvest: 100, yieldPerAcre: 60, pricePerQuintal: 1200 },
    banana: { name: 'Banana', seasons: ['annual'], soils: ['loamy', 'alluvial'], waterNeeds: 'high', daysToHarvest: 300, yieldPerAcre: 120, pricePerQuintal: 1000 },
    groundnut: { name: 'Groundnut', seasons: ['kharif'], soils: ['sandy', 'loamy'], waterNeeds: 'low', daysToHarvest: 120, yieldPerAcre: 12, pricePerQuintal: 5000 },
    soybean: { name: 'Soybean', seasons: ['kharif'], soils: ['black', 'loamy'], waterNeeds: 'medium', daysToHarvest: 100, yieldPerAcre: 15, pricePerQuintal: 4000 },
    mustard: { name: 'Mustard', seasons: ['rabi'], soils: ['sandy', 'loamy'], waterNeeds: 'low', daysToHarvest: 110, yieldPerAcre: 10, pricePerQuintal: 5000 },
    turmeric: { name: 'Turmeric', seasons: ['kharif'], soils: ['loamy', 'clay'], waterNeeds: 'high', daysToHarvest: 270, yieldPerAcre: 40, pricePerQuintal: 8000 },
};

router.post('/advise', authenticateToken, (req, res) => {
    try {
        const { soilType, landSize, waterAvailability, waterSource, season } = req.body;
        if (!soilType || !landSize || !waterAvailability || !season) {
            return res.status(400).json({ error: 'soilType, landSize, waterAvailability and season are required' });
        }

        const landSizeNum = Number(landSize);
        if (isNaN(landSizeNum) || landSizeNum <= 0) {
            return res.status(400).json({ error: 'landSize must be a positive number' });
        }

        const recommendations = [];

        for (const [key, crop] of Object.entries(CROP_DATABASE)) {
            let score = 0;
            if (crop.seasons.includes(season)) score += 30;
            if (crop.soils.includes(soilType)) score += 30;
            if (crop.waterNeeds === 'low' && waterAvailability === 'scarce') score += 20;
            if (crop.waterNeeds === 'medium' && waterAvailability === 'moderate') score += 20;
            if (crop.waterNeeds === 'high' && waterAvailability === 'abundant') score += 20;
            if (waterSource === 'canal' || waterSource === 'river') score += 10;
            if (waterSource === 'well' && crop.waterNeeds !== 'high') score += 5;

            if (score >= 30) {
                const totalYield = crop.yieldPerAcre * parseFloat(landSize || 1);
                const profit = (totalYield * crop.pricePerQuintal) - (landSize * 15000);
                recommendations.push({
                    crop: crop.name,
                    score,
                    daysToHarvest: crop.daysToHarvest,
                    expectedYieldQuintals: totalYield.toFixed(1),
                    expectedProfitINR: Math.max(0, profit).toFixed(0),
                    suitability: score >= 60 ? 'Excellent' : score >= 45 ? 'Good' : 'Moderate',
                    tips: getCropTips(key, soilType, waterAvailability)
                });
            }
        }

        recommendations.sort((a, b) => b.score - a.score);

        res.json({
            success: true,
            recommendations: recommendations.slice(0, 5),
            summary: `Based on your ${soilType} soil, ${waterAvailability} water, and ${season} season, here are the best crops for your ${landSize} acres.`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Crop advice failed' });
    }
});

function getCropTips(cropKey, soilType, waterAvailability) {
    const tips = {
        rice: 'Prepare puddled field. Transplant 25-day-old seedlings.',
        wheat: 'Sow seeds at 4cm depth. Apply nitrogen in split doses.',
        cotton: 'Use BT cotton varieties. Monitor bollworms regularly.',
        sugarcane: 'Plant healthy ratoons. Intercrop with legumes.',
        maize: 'Use hybrid seeds. Ensure good drainage.',
        tomato: 'Stake plants at 30cm height. Drip irrigation preferred.',
        onion: 'Transplant 6-week seedlings. Avoid waterlogging.',
        banana: 'Plant tissue-cultured suckers. Bunch care essential.',
        groundnut: 'Inoculate seeds with Rhizobium. Light irrigation.',
        soybean: 'Good nodulation critical. Avoid excess nitrogen.',
        mustard: 'Thin to 15cm spacing. One irrigation at flowering.',
        turmeric: 'Plant seed rhizomes at 45cm spacing. Mulch heavily.',
    };
    return tips[cropKey] || 'Follow standard agronomic practices.';
}

// Save crop selection (for mentorship)
router.post('/select', authenticateToken, (req, res) => {
    try {
        const { cropName, soilType, landSize, season, waterSource } = req.body;
        if (!cropName || !soilType || !landSize || !season) {
            return res.status(400).json({ error: 'cropName, soilType, landSize and season are required' });
        }

        const landSizeNum = Number(landSize);
        if (isNaN(landSizeNum) || landSizeNum <= 0) {
            return res.status(400).json({ error: 'landSize must be a positive number' });
        }

        const db = getDB();
        const result = db.prepare(
            'INSERT INTO selected_crops (user_id, crop_name, soil_type, land_size, season, water_source) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(req.user.id, cropName, soilType, landSize, season, waterSource);

        // Generate mentorship tasks
        const tasks = generateMentorshipTasks(cropName, result.lastInsertRowid, req.user.id);
        const insertTask = db.prepare(
            'INSERT INTO mentorship_tasks (crop_id, user_id, task_title, task_description, week_number, target_date) VALUES (?, ?, ?, ?, ?, ?)'
        );
        tasks.forEach(t => insertTask.run(t.crop_id, t.user_id, t.task_title, t.task_description, t.week_number, t.target_date));

        res.json({ success: true, cropId: result.lastInsertRowid, tasksCreated: tasks.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to select crop' });
    }
});

// Get mentorship tasks
router.get('/mentorship/:cropId', authenticateToken, (req, res) => {
    const db = getDB();
    const crop = db.prepare('SELECT * FROM selected_crops WHERE id = ? AND user_id = ?').get(req.params.cropId, req.user.id);
    if (!crop) return res.status(404).json({ error: 'Crop not found' });
    const tasks = db.prepare('SELECT * FROM mentorship_tasks WHERE crop_id = ? ORDER BY week_number').all(req.params.cropId);
    res.json({ crop, tasks });
});

// Update task
router.put('/mentorship/task/:taskId', authenticateToken, (req, res) => {
    const { isCompleted } = req.body;
    const db = getDB();
    db.prepare('UPDATE mentorship_tasks SET is_completed = ?, completed_at = ? WHERE id = ? AND user_id = ?')
        .run(isCompleted ? 1 : 0, isCompleted ? new Date().toISOString() : null, req.params.taskId, req.user.id);
    res.json({ success: true });
});

// Get all crops for user
router.get('/my-crops', authenticateToken, (req, res) => {
    const db = getDB();
    const crops = db.prepare('SELECT * FROM selected_crops WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json({ crops });
});

function generateMentorshipTasks(cropName, cropId, userId) {
    const taskTemplates = {
        default: [
            { week: 1, title: '🌱 Field Preparation', desc: 'Plow and level the field. Remove weeds and previous crop residue. Take soil sample for testing.' },
            { week: 1, title: '🧪 Soil Testing', desc: 'Submit soil sample to nearest KVK lab. Analyze pH, NPK levels and micronutrients.' },
            { week: 2, title: '🌿 Seed Selection & Treatment', desc: 'Purchase certified seeds. Treat with fungicide/biofertilizer before sowing.' },
            { week: 2, title: '💧 Irrigation Setup', desc: 'Check and repair irrigation channels. Set up drip/sprinkler if available.' },
            { week: 3, title: '🌾 Sowing/Planting', desc: 'Sow seeds at recommended depth and spacing. Mark date for germination check.' },
            { week: 4, title: '🔍 Germination Check', desc: 'Check germination rate (target >85%). Gap filling if needed.' },
            { week: 5, title: '💊 First Fertilizer Application', desc: 'Apply basal dose of NPK as per soil test recommendation.' },
            { week: 6, title: '🐛 First Pest Scouting', desc: 'Scout field for pests and diseases. Note any damage. Do not spray unless threshold reached.' },
            { week: 8, title: '💊 Second Fertilizer Application', desc: 'Apply top-dressing nitrogen fertilizer.' },
            { week: 10, title: '🚿 Critical Irrigation Stage', desc: 'Ensure adequate moisture at critical growth stage. Monitor weather forecast.' },
            { week: 12, title: '🌺 Flowering Stage Care', desc: 'Avoid stress during flowering. Scout for pests. Apply micronutrients if needed.' },
            { week: 16, title: '📦 Pre-Harvest Preparation', desc: 'Arrange labor and equipment. Contact mandis for price discovery. Stop irrigation 10 days before harvest.' },
            { week: 17, title: '🎉 Harvest', desc: 'Harvest at right maturity. Minimize losses. Dry properly before storage.' },
            { week: 18, title: '💰 Market & Sale', desc: 'Compare prices across mandis. Sell at best price. Keep records for next season.' },
        ]
    };

    const now = new Date();
    return (taskTemplates[cropName.toLowerCase()] || taskTemplates.default).map(t => ({
        crop_id: cropId,
        user_id: userId,
        task_title: t.title,
        task_description: t.desc,
        week_number: t.week,
        target_date: new Date(now.getTime() + t.week * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
}

module.exports = router;