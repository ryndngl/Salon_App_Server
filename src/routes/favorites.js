// routes/favorites.js
import express from 'express';
import User from '../models/User.js'; // Adjust path as needed
import auth from '../middlewares/authentication.js'; // Adjust path as needed

const router = express.Router();

// Get user favorites
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favorites');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user.favorites || [],
      count: user.favorites?.length || 0
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching favorites' 
    });
  }
});

// Add to favorites
router.post('/add', auth, async (req, res) => {
  try {
    const { service, style } = req.body;

    // Validate required fields
    if (!service?.name || !style?.name) {
      return res.status(400).json({
        success: false,
        message: 'Service and style information required'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Initialize favorites array if it doesn't exist
    if (!user.favorites) {
      user.favorites = [];
    }

    // Create unique key for the favorite
    const favoriteKey = `${service.name.toLowerCase().trim()}|${style.name.toLowerCase().trim()}`;
    
    // Check if already in favorites
    const existingFavorite = user.favorites.find(fav => {
      const existingKey = `${fav.service?.name?.toLowerCase().trim()}|${fav.name?.toLowerCase().trim()}`;
      return existingKey === favoriteKey;
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Item already in favorites'
      });
    }

    // Create favorite object
    const favoriteItem = {
      ...style,
      service: {
        name: service.name,
        _id: service._id || service.id
      },
      addedAt: new Date()
    };

    // Add to favorites
    user.favorites.push(favoriteItem);
    await user.save();

    res.json({
      success: true,
      message: 'Added to favorites successfully',
      data: favoriteItem,
      count: user.favorites.length
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding to favorites' 
    });
  }
});

// Remove from favorites
router.delete('/remove', auth, async (req, res) => {
  try {
    const { serviceName, styleName } = req.body;

    if (!serviceName || !styleName) {
      return res.status(400).json({
        success: false,
        message: 'Service name and style name required'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.favorites || user.favorites.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No favorites found'
      });
    }

    // Create key for removal
    const removeKey = `${serviceName.toLowerCase().trim()}|${styleName.toLowerCase().trim()}`;
    
    // Find and remove the favorite
    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter(fav => {
      const favoriteKey = `${fav.service?.name?.toLowerCase().trim()}|${fav.name?.toLowerCase().trim()}`;
      return favoriteKey !== removeKey;
    });

    if (user.favorites.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Removed from favorites successfully',
      count: user.favorites.length
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while removing from favorites' 
    });
  }
});

// Remove from favorites by ID (alternative endpoint)
router.delete('/remove/:favoriteId', auth, async (req, res) => {
  try {
    const { favoriteId } = req.params;

    if (!favoriteId) {
      return res.status(400).json({
        success: false,
        message: 'Favorite ID required'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.favorites || user.favorites.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No favorites found'
      });
    }

    // Find and remove by MongoDB ObjectId
    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter(fav => 
      fav._id.toString() !== favoriteId
    );

    if (user.favorites.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Removed from favorites successfully',
      count: user.favorites.length
    });
  } catch (error) {
    console.error('Remove favorite by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while removing from favorites' 
    });
  }
});

// Clear all favorites
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.favorites = [];
    await user.save();

    res.json({
      success: true,
      message: 'All favorites cleared successfully',
      count: 0
    });
  } catch (error) {
    console.error('Clear favorites error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while clearing favorites' 
    });
  }
});

// Check if item is in favorites
router.post('/check', auth, async (req, res) => {
  try {
    const { serviceName, styleName } = req.body;

    if (!serviceName || !styleName) {
      return res.status(400).json({
        success: false,
        message: 'Service name and style name required'
      });
    }

    const user = await User.findById(req.user.id).select('favorites');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const checkKey = `${serviceName.toLowerCase().trim()}|${styleName.toLowerCase().trim()}`;
    
    const isFavorite = user.favorites?.some(fav => {
      const favoriteKey = `${fav.service?.name?.toLowerCase().trim()}|${fav.name?.toLowerCase().trim()}`;
      return favoriteKey === checkKey;
    }) || false;

    res.json({
      success: true,
      isFavorite,
      message: isFavorite ? 'Item is in favorites' : 'Item is not in favorites'
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while checking favorites' 
    });
  }
});

export default router;