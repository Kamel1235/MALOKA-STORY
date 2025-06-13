const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET current settings
// There should ideally be only one settings document.
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // If no settings exist, create a default one
      settings = new Settings({});
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update settings
// This will find one document and update it, or create it if it doesn't exist (upsert: true)
router.put('/', async (req, res) => {
  try {
    const updatedSettings = await Settings.findOneAndUpdate(
      {}, // Find the single settings document (or create if none)
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.json(updatedSettings);
  } catch (err) {
    res.status(400).json({ message: err.message }); // 400 for bad request (validation error)
  }
});

module.exports = router;
