// src/models/Service.js - ES6 version for your project structure
import mongoose from 'mongoose';

// Schema for individual styles within a service
const StyleSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String, // Will store image URL or path
  },
  images: [String], // For services like Foot Spa that have multiple images
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false // Don't create separate _id for subdocuments
});

// Main Service Schema
const ServiceSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  styles: [StyleSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Also update updatedAt for modified styles
  if (this.isModified('styles')) {
    this.styles.forEach(style => {
      if (style.isNew || style.isModified()) {
        style.updatedAt = Date.now();
      }
    });
  }
  
  next();
});

// Create indexes for better query performance
ServiceSchema.index({ name: 1 });
ServiceSchema.index({ 'styles.name': 1 });
ServiceSchema.index({ 'styles.category': 1 });
ServiceSchema.index({ isActive: 1 });

// Instance methods
ServiceSchema.methods.addStyle = function(styleData) {
  const maxStyleId = this.styles.reduce((max, style) => 
    style.id > max ? style.id : max, 0
  );
  
  const newStyle = {
    ...styleData,
    id: maxStyleId + 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.styles.push(newStyle);
  this.updatedAt = new Date();
  
  return newStyle;
};

ServiceSchema.methods.updateStyle = function(styleId, updateData) {
  const style = this.styles.id(styleId);
  if (!style) {
    throw new Error('Style not found');
  }
  
  Object.assign(style, updateData, { updatedAt: new Date() });
  this.updatedAt = new Date();
  
  return style;
};

ServiceSchema.methods.removeStyle = function(styleId) {
  const style = this.styles.id(styleId);
  if (!style) {
    throw new Error('Style not found');
  }
  
  style.isActive = false;
  style.updatedAt = new Date();
  this.updatedAt = new Date();
  
  return style;
};

// Static methods
ServiceSchema.statics.findByName = function(name) {
  return this.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    isActive: true
  });
};

ServiceSchema.statics.searchStyles = function(query, limit = 50) {
  return this.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$styles' },
    { 
      $match: { 
        'styles.isActive': { $ne: false },
        'styles.name': { $regex: query, $options: 'i' }
      }
    },
    {
      $project: {
        serviceName: '$name',
        serviceId: '$_id',
        style: '$styles'
      }
    },
    { $limit: limit }
  ]);
};

const Service = mongoose.model('Service', ServiceSchema);

export default Service;