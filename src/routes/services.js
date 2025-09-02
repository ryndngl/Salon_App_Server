// src/routes/services.js - Optimized with better response structure
import express from 'express';
import Service from '../models/Service.js';
import authentication from '../middlewares/authentication.js';

const router = express.Router();

// ============================
// PUBLIC ROUTES (No authentication needed)
// ============================

// GET all services (LIGHTWEIGHT - No styles included)
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .select('id name description isActive createdAt updatedAt')
      .lean(); // Use lean() for better performance
    
    // Add style count to each service
    const servicesWithCounts = await Promise.all(
      services.map(async (service) => {
        const fullService = await Service.findById(service._id);
        const activeStylesCount = fullService.styles.filter(style => style.isActive !== false).length;
        
        return {
          ...service,
          totalStyles: activeStylesCount,
          hasStyles: activeStylesCount > 0
        };
      })
    );

    res.json({
      success: true,
      count: servicesWithCounts.length,
      data: servicesWithCounts
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch services', 
      error: error.message 
    });
  }
});

// GET service by ID with FULL data including styles
router.get('/id/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }
    
    // Filter active styles only
    const activeStyles = service.styles.filter(style => style.isActive !== false);
    
    res.json({
      success: true,
      data: {
        ...service.toObject(),
        styles: activeStyles,
        totalStyles: activeStyles.length
      }
    });
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch service', 
      error: error.message 
    });
  }
});

// GET service by name with FULL data including styles
router.get('/name/:serviceName', async (req, res) => {
  try {
    const serviceName = decodeURIComponent(req.params.serviceName);
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
      isActive: true
    });
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: `Service '${serviceName}' not found` 
      });
    }
    
    // Filter active styles only
    const activeStyles = service.styles.filter(style => style.isActive !== false);
    
    res.json({
      success: true,
      data: {
        ...service.toObject(),
        styles: activeStyles,
        totalStyles: activeStyles.length
      }
    });
  } catch (error) {
    console.error('Error fetching service by name:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch service', 
      error: error.message 
    });
  }
});

// GET styles by service (no category filter) - STYLES ONLY
router.get('/:serviceName/styles', async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
      isActive: true
    });
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: `Service '${serviceName}' not found` 
      });
    }

    let filteredStyles = service.styles.filter(style => style.isActive !== false);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedStyles = filteredStyles.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        serviceName: service.name,
        serviceId: service._id,
        styles: paginatedStyles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredStyles.length / limit),
          totalStyles: filteredStyles.length,
          hasNext: endIndex < filteredStyles.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching styles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch styles', 
      error: error.message 
    });
  }
});

// GET styles by service + category
router.get('/:serviceName/styles/:category', async (req, res) => {
  try {
    const { serviceName, category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
      isActive: true
    });
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: `Service '${serviceName}' not found` 
      });
    }

    let filteredStyles = service.styles.filter(style => 
      style.isActive !== false &&
      style.category && 
      style.category.toLowerCase() === category.toLowerCase()
    );
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedStyles = filteredStyles.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        serviceName: service.name,
        serviceId: service._id,
        category: category,
        styles: paginatedStyles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredStyles.length / limit),
          totalStyles: filteredStyles.length,
          hasNext: endIndex < filteredStyles.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching styles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch styles', 
      error: error.message 
    });
  }
});

// GET service summary (lightweight version with basic info only)
router.get('/summary', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .select('id name description')
      .lean();

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error fetching service summary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch service summary', 
      error: error.message 
    });
  }
});

// Search styles across all services
router.get('/search/styles', async (req, res) => {
  try {
    const { query, limit = 50 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query must be at least 2 characters long' 
      });
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
      success: true,
      data: {
        query: query.trim(),
        results: limitedResults,
        totalFound: results.length,
        showing: limitedResults.length
      }
    });
  } catch (error) {
    console.error('Error searching styles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Search failed', 
      error: error.message 
    });
  }
});

// GET service categories
router.get('/categories/:serviceName', async (req, res) => {
  try {
    const serviceName = decodeURIComponent(req.params.serviceName);
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') },
      isActive: true
    });
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: `Service '${serviceName}' not found` 
      });
    }

    const categories = [...new Set(service.styles
      .filter(style => style.category && style.isActive !== false)
      .map(style => style.category)
    )];

    res.json({
      success: true,
      data: {
        serviceName: service.name,
        categories,
        totalCategories: categories.length
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch categories', 
      error: error.message 
    });
  }
});

// ============================
// PROTECTED ROUTES (Authentication required)
// ============================

// POST - Create new service (PROTECTED)
router.post('/', authentication, async (req, res) => {
  try {
    console.log('User creating service:', req.user.fullName);
    
    const { name, description, styles } = req.body;
    
    const existingService = await Service.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingService) {
      return res.status(400).json({ 
        success: false,
        message: 'Service with this name already exists' 
      });
    }

    const lastService = await Service.findOne().sort({ id: -1 });
    const nextId = lastService ? lastService.id + 1 : 1;

    const service = new Service({
      id: nextId,
      name: name.trim(),
      description: description?.trim(),
      styles: styles || [],
      createdBy: req.user.id,
      createdByName: req.user.fullName
    });

    const newService = await service.save();
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService,
      createdBy: req.user.fullName
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(400).json({ 
      success: false,
      message: 'Failed to create service', 
      error: error.message
    });
  }
});

// PUT - Update service (PROTECTED)
router.put('/id/:id', authentication, async (req, res) => {
  try {
    console.log('User updating service:', req.user.fullName);
    
    const service = await Service.findByIdAndUpdate(
      req.params.id, 
      { 
        ...req.body,
        updatedAt: new Date(),
        lastModifiedBy: req.user.id,
        lastModifiedByName: req.user.fullName
      }, 
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service,
      updatedBy: req.user.fullName
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(400).json({ 
      success: false,
      message: 'Failed to update service', 
      error: error.message
    });
  }
});

// PUT - Add style to service (PROTECTED)
router.put('/:serviceName/styles', authentication, async (req, res) => {
  try {
    console.log('User adding style:', req.user.fullName);
    
    const serviceName = decodeURIComponent(req.params.serviceName);
    const newStyle = req.body;
    
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${serviceName}$`, 'i') }
    });
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: `Service '${serviceName}' not found` 
      });
    }

    const maxStyleId = service.styles.reduce((max, style) => 
      style.id > max ? style.id : max, 0
    );
    
    newStyle.id = maxStyleId + 1;
    newStyle.addedBy = req.user.id;
    newStyle.addedByName = req.user.fullName;
    newStyle.addedAt = new Date();
    
    service.styles.push(newStyle);
    service.updatedAt = new Date();
    service.lastModifiedBy = req.user.id;
    service.lastModifiedByName = req.user.fullName;
    
    await service.save();
    
    res.json({
      success: true,
      message: 'Style added successfully',
      data: {
        service,
        addedStyle: newStyle
      },
      addedBy: req.user.fullName
    });
  } catch (error) {
    console.error('Error adding style:', error);
    res.status(400).json({ 
      success: false,
      message: 'Failed to add style', 
      error: error.message
    });
  }
});

// DELETE service - soft delete (PROTECTED)
router.delete('/id/:id', authentication, async (req, res) => {
  try {
    console.log('User deactivating service:', req.user.fullName);
    
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        updatedAt: new Date(),
        deactivatedBy: req.user.id,
        deactivatedByName: req.user.fullName,
        deactivatedAt: new Date()
      },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Service deactivated successfully',
      data: service,
      deactivatedBy: req.user.fullName
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete service', 
      error: error.message
    });
  }
});

export default router;