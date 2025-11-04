const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Party = require('../models/Party');
const Item = require('../models/Item');

// Get all purchases
router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('party', 'name phone')
      .populate('items.item', 'name')
      .sort({ billDate: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single purchase
router.get('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('party')
      .populate('items.item');
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create purchase
router.post('/', async (req, res) => {
  try {
    const purchase = new Purchase(req.body);
    const newPurchase = await purchase.save();

    // Update party balance
    const party = await Party.findById(req.body.party);
    if (party) {
      party.currentBalance += req.body.balanceAmount;
      party.balanceType = 'payable';
      await party.save();
    }

    // Update item stock
    for (const purchaseItem of req.body.items) {
      const item = await Item.findById(purchaseItem.item);
      if (item) {
        item.stockQuantity += purchaseItem.quantity;
        await item.save();
      }
    }

    res.status(201).json(newPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update purchase
router.put('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    Object.assign(purchase, req.body);
    const updatedPurchase = await purchase.save();
    res.json(updatedPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete purchase
router.delete('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    await purchase.deleteOne();
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
