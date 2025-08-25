// src/routes/services.js - ES6 version for your project structure
import express from 'express';
import Service from '../models/Service.js';

const router = express.Router();

// ============================
// GET all services
// ============================
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services', error: error.message });
  }
});

// ============================
// GET service by ID
// ============================
router.get('/id/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    res.status(500).json({ message: 'Failed to fetch service', error: error.message });
  }
});

// ============================
// GET service by name
// ============================
router.get('/name/:serviceName', async (req, res) => {
  try {
    const serviceName = decodeURIComponent(req.params.serviceName);
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
      isActive: true
    });
    
    if (!service) {
      return res.status(404).json({ message: `Service '${serviceName}' not found` });
    }
    
    res.json(service);
  } catch (error) {
    console.error('Error fetching service by name:', error);
    res.status(500).json({ message: 'Failed to fetch service', error: error.message });
  }
});

// ============================
// GET styles by service (no category filter)
// ============================
router.get('/:serviceName/styles', async (req, res) => {
  try {
    const { serviceName } = req.params;
    
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
      isActive: true
    });
    
    if (!service) {
      return res.status(404).json({ message: `Service '${serviceName}' not found` });
    }

    let filteredStyles = service.styles.filter(style => style.isActive !== false);

    res.json({
      serviceName: service.name,
      serviceId: service._id,
      styles: filteredStyles,
      totalStyles: filteredStyles.length
    });
  } catch (error) {
    console.error('Error fetching styles:', error);
    res.status(500).json({ message: 'Failed to fetch styles', error: error.message });
  }
});

// ============================
// GET styles by service + category
// ============================
router.get('/:serviceName/styles/:category', async (req, res) => {
  try {
    const { serviceName, category } = req.params;
    
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
      isActive: true
    });
    
    if (!service) {
      return res.status(404).json({ message: `Service '${serviceName}' not found` });
    }

    let filteredStyles = service.styles.filter(style => style.isActive !== false);

    filteredStyles = filteredStyles.filter(style => 
      style.category && style.category.toLowerCase() === category.toLowerCase()
    );

    res.json({
      serviceName: service.name,
      serviceId: service._id,
      styles: filteredStyles,
      totalStyles: filteredStyles.length
    });
  } catch (error) {
    console.error('Error fetching styles:', error);
    res.status(500).json({ message: 'Failed to fetch styles', error: error.message });
  }
});

// ============================
// Search styles across all services
// ============================
router.get('/search/styles', async (req, res) => {
  try {
    const { query, limit = 50 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
    }

    const services = await Service.find({ isActive: true });
    
    const results = [];
    
    for (const service of services) {
      const matchingStyles = service.styles
        .filter(style => 
          style.isActive !== false &&
          style.name && 
          style.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(style => ({
          ...style.toObject(),
          serviceName: service.name,
          serviceId: service._id
        }));
      
      results.push(...matchingStyles);
    }

    const limitedResults = results.slice(0, parseInt(limit));

    res.json({
      query: query.trim(),
      results: limitedResults,
      totalFound: results.length,
      showing: limitedResults.length
    });
  } catch (error) {
    console.error('Error searching styles:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

// ============================
// POST - Create new service
// ============================
router.post('/', async (req, res) => {
  try {
    const { name, description, styles } = req.body;
    
    const existingService = await Service.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingService) {
      return res.status(400).json({ message: 'Service with this name already exists' });
    }

    const lastService = await Service.findOne().sort({ id: -1 });
    const nextId = lastService ? lastService.id + 1 : 1;

    const service = new Service({
      id: nextId,
      name: name.trim(),
      description: description?.trim(),
      styles: styles || []
    });

    const newService = await service.save();
    res.status(201).json({
      message: 'Service created successfully',
      service: newService
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(400).json({ message: 'Failed to create service', error: error.message });
  }
});

// ============================
// PUT - Update service
// ============================
router.put('/id/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id, 
      { 
        ...req.body,
        updatedAt: new Date()
      }, 
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(400).json({ message: 'Failed to update service', error: error.message });
  }
});

// ============================
// PUT - Add style to service
// ============================
router.put('/:serviceName/styles', async (req, res) => {
  try {
    const serviceName = decodeURIComponent(req.params.serviceName);
    const newStyle = req.body;
    
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') }
    });
    
    if (!service) {
      return res.status(404).json({ message: `Service '${serviceName}' not found` });
    }

    const maxStyleId = service.styles.reduce((max, style) => 
      style.id > max ? style.id : max, 0
    );
    
    newStyle.id = maxStyleId + 1;
    service.styles.push(newStyle);
    service.updatedAt = new Date();
    
    await service.save();
    
    res.json({
      message: 'Style added successfully',
      service,
      addedStyle: newStyle
    });
  } catch (error) {
    console.error('Error adding style:', error);
    res.status(400).json({ message: 'Failed to add style', error: error.message });
  }
});

// ============================
// DELETE service (soft delete)
// ============================
router.delete('/id/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({ 
      message: 'Service deactivated successfully',
      service
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Failed to delete service', error: error.message });
  }
});

// ============================
// GET service categories
// ============================
router.get('/categories/:serviceName', async (req, res) => {
  try {
    const serviceName = decodeURIComponent(req.params.serviceName);
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
      isActive: true
    });
    
    if (!service) {
      return res.status(404).json({ message: `Service '${serviceName}' not found` });
    }

    const categories = [...new Set(service.styles
      .filter(style => style.category && style.isActive !== false)
      .map(style => style.category)
    )];

    res.json({
      serviceName: service.name,
      categories,
      totalCategories: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

export default router;
