const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Party = require('../models/Party');
const Item = require('../models/Item');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('party', 'name phone')
      .populate('items.item', 'name')
      .sort({ invoiceDate: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single sale
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('party')
      .populate('items.item');
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create sale
router.post('/', async (req, res) => {
  try {
    const sale = new Sale(req.body);
    const newSale = await sale.save();

    // Update party balance
    const party = await Party.findById(req.body.party);
    if (party) {
      party.currentBalance += req.body.balanceAmount;
      party.balanceType = 'receivable';
      await party.save();
    }

    // Update item stock
    for (const saleItem of req.body.items) {
      const item = await Item.findById(saleItem.item);
      if (item) {
        item.stockQuantity -= saleItem.quantity;
        await item.save();
      }
    }

    res.status(201).json(newSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update sale
router.put('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    Object.assign(sale, req.body);
    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete sale
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    await sale.deleteOne();
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
