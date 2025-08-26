// routes/search.js
import express from 'express';
import Service from '../models/Service.js'; // adjust to your model path
const router = express.Router();

// Search services by style name
router.get('/styles', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Query is required' });

  try {
    // Find all services where at least one style matches query
    const services = await Service.find({
      'styles.name': { $regex: query, $options: 'i' }
    });

    // Flatten styles with serviceName
    const results = [];
    services.forEach(service => {
      (service.styles || []).forEach(style => {
        if (style.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            ...style.toObject(),
            serviceName: service.name
          });
        }
      });
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
