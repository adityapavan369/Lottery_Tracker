const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(bodyParser.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, userId: this.lastID, email });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.id, email: user.email });
  });
});

// Inventory endpoints
app.post('/api/inventory/add-pack', authenticateToken, (req, res) => {
  const { name, packSize, qrCode } = req.body;
  const userId = req.user.id;

  if (!name || !packSize || !qrCode) {
    return res.status(400).json({ error: 'Name, pack size, and QR code required' });
  }

  db.run(
    'INSERT INTO ticket_packs (name, pack_size, qr_code, user_id) VALUES (?, ?, ?, ?)',
    [name, packSize, qrCode, userId],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'QR code already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ 
        packId: this.lastID, 
        name, 
        packSize, 
        qrCode,
        message: 'Ticket pack added successfully' 
      });
    }
  );
});

app.get('/api/inventory/packs', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT * FROM ticket_packs WHERE user_id = ? ORDER BY added_at DESC',
    [userId],
    (err, packs) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ packs });
    }
  );
});

// Daily sales endpoints
app.post('/api/sales/start-day', authenticateToken, (req, res) => {
  const { packId, startTicketNumber } = req.body;
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  if (!packId || !startTicketNumber) {
    return res.status(400).json({ error: 'Pack ID and start ticket number required' });
  }

  // Check if there's already an open sale for today
  db.get(
    'SELECT * FROM daily_sales WHERE sale_date = ? AND user_id = ? AND status = ?',
    [today, userId, 'open'],
    (err, existingSale) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingSale) {
        return res.status(400).json({ error: 'A sale is already open for today' });
      }

      db.run(
        'INSERT INTO daily_sales (sale_date, start_ticket_number, pack_id, user_id, status) VALUES (?, ?, ?, ?, ?)',
        [today, startTicketNumber, packId, userId, 'open'],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({ 
            saleId: this.lastID, 
            saleDate: today,
            startTicketNumber,
            packId,
            status: 'open',
            message: 'Daily sale started successfully' 
          });
        }
      );
    }
  );
});

app.get('/api/sales/previous-end-number', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get(
    'SELECT end_ticket_number FROM daily_sales WHERE user_id = ? AND status = ? ORDER BY sale_date DESC, closed_at DESC LIMIT 1',
    [userId, 'closed'],
    (err, sale) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const endNumber = sale ? sale.end_ticket_number : null;
      res.json({ previousEndNumber: endNumber });
    }
  );
});

app.post('/api/sales/close-day', authenticateToken, (req, res) => {
  const { endTicketNumber } = req.body;
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  if (!endTicketNumber) {
    return res.status(400).json({ error: 'End ticket number required' });
  }

  // Get the open sale for today
  db.get(
    'SELECT * FROM daily_sales WHERE sale_date = ? AND user_id = ? AND status = ?',
    [today, userId, 'open'],
    (err, sale) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!sale) {
        return res.status(404).json({ error: 'No open sale found for today' });
      }

      // Calculate tickets sold and revenue (assuming $1 per ticket)
      const ticketsSold = endTicketNumber - sale.start_ticket_number + 1;
      const totalRevenue = ticketsSold * 1.00; // $1 per ticket

      db.run(
        'UPDATE daily_sales SET end_ticket_number = ?, tickets_sold = ?, total_revenue = ?, status = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [endTicketNumber, ticketsSold, totalRevenue, 'closed', sale.id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({ 
            saleId: sale.id,
            startTicketNumber: sale.start_ticket_number,
            endTicketNumber,
            ticketsSold,
            totalRevenue,
            status: 'closed',
            message: 'Daily sale closed successfully' 
          });
        }
      );
    }
  );
});

app.get('/api/sales/today', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  db.get(
    `SELECT ds.*, tp.name as pack_name 
     FROM daily_sales ds 
     LEFT JOIN ticket_packs tp ON ds.pack_id = tp.id 
     WHERE ds.sale_date = ? AND ds.user_id = ?`,
    [today, userId],
    (err, sale) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ sale: sale || null });
    }
  );
});

app.get('/api/sales/history', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT ds.*, tp.name as pack_name 
     FROM daily_sales ds 
     LEFT JOIN ticket_packs tp ON ds.pack_id = tp.id 
     WHERE ds.user_id = ? 
     ORDER BY ds.sale_date DESC, ds.created_at DESC 
     LIMIT 30`,
    [userId],
    (err, sales) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ sales });
    }
  );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lottery Tracker API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
