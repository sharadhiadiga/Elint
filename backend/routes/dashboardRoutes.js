const express = require('express');
const router = express.Router();
const Party = require('../models/Party');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const summary = {
      ordersInProgress: 0,
      ordersInQueue: 0,
      ordersCompleted: 0
    };

    orderStats.forEach(stat => {
      if (stat._id === 'in_progress') {
        summary.ordersInProgress = stat.count;
      } else if (stat._id === 'queue') {
        summary.ordersInQueue = stat.count;
      } else if (stat._id === 'completed') {
        summary.ordersCompleted = stat.count;
      }
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales data for chart
router.get('/sales-chart', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else {
      startDate = new Date(now.getFullYear(), 0, 1); // Year
    }

    const salesData = await Sale.aggregate([
      {
        $match: {
          invoiceDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%d %b', date: '$invoiceDate' }
          },
          total: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Calculate total sale for period
    const totalSale = salesData.reduce((sum, item) => sum + item.total, 0);

    res.json({
      totalSale,
      chartData: salesData.map(item => ({
        date: item._id,
        amount: item.total
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders chart data (In Progress orders over time)
router.get('/orders-in-progress-chart', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else {
      startDate = new Date(now.getFullYear(), 0, 1); // Year
    }

    const ordersData = await Order.aggregate([
      {
        $match: {
          status: 'in_progress',
          startedDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%d %b', date: '$startedDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      chartData: ordersData.map(item => ({
        date: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders chart data (Queue orders over time)
router.get('/orders-in-queue-chart', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else {
      startDate = new Date(now.getFullYear(), 0, 1); // Year
    }

    const ordersData = await Order.aggregate([
      {
        $match: {
          status: 'queue',
          orderDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%d %b', date: '$orderDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      chartData: ordersData.map(item => ({
        date: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent transactions
router.get('/recent-transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('party', 'name')
      .sort({ transactionDate: -1 })
      .limit(10);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
