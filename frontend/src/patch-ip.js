const fs = require('fs');
const files = [
  'd:/Agro/frontend/src/pages/PestAlertsPage.jsx',
  'd:/Agro/frontend/src/pages/MentorshipPage.jsx',
  'd:/Agro/frontend/src/pages/MarketPricePage.jsx',
  'd:/Agro/frontend/src/pages/CropAdvisorPage.jsx',
  'd:/Agro/frontend/src/pages/DiseaseDetectionPage.jsx',
  'd:/Agro/frontend/src/pages/FertilizerPage.jsx',
  'd:/Agro/frontend/src/pages/ChatbotPage.jsx',
  'd:/Agro/frontend/src/context/AuthContext.jsx',
  'd:/Agro/frontend/src/config.js'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/http:\/\/localhost:5000\/api/g, "http://${window.location.hostname}:5000/api");
    content = content.replace(/const API = 'http:\/\/\$\{window\.location\.hostname\}:5000\/api';/g, "const API = `http://${window.location.hostname}:5000/api`;");
    // Also patch config.js correctly 
    content = content.replace(/const API_BASE_URL = import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/\$\{window\.location\.hostname\}:5000\/api';/g, "const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;");
    fs.writeFileSync(f, content);
  }
});
console.log('Fixed API endpoints for mobile access.');
