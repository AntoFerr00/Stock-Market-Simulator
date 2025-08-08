// server.js
// This is the updated backend with secure password handling using bcrypt.

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt'); // For hashing passwords

const app = express();
const PORT = 3001;
const saltRounds = 10; // For bcrypt hashing

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Setup ---
const DB_PATH = path.join(__dirname, 'db.json');

// Function to read the database file
const readDb = () => {
    if (!fs.existsSync(DB_PATH)) {
        // The DB now stores users and portfolios separately
        const defaultDb = { users: {}, portfolios: {} };
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb));
    }
    const data = fs.readFileSync(DB_PATH);
    return JSON.parse(data);
};

// Function to write to the database file
const writeDb = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// --- Mock Financial Data (Unchanged) ---
const MOCK_STOCKS = {
    // --- US Stocks (NYSE & NASDAQ) ---
    'AAPL': { name: 'Apple Inc.', currency: 'USD', basePrice: 210 },
    'MSFT': { name: 'Microsoft Corp.', currency: 'USD', basePrice: 450 },
    'GOOGL': { name: 'Alphabet Inc. (Google)', currency: 'USD', basePrice: 180 },
    'AMZN': { name: 'Amazon.com, Inc.', currency: 'USD', basePrice: 190 },
    'NVDA': { name: 'NVIDIA Corporation', currency: 'USD', basePrice: 125 },
    'TSLA': { name: 'Tesla, Inc.', currency: 'USD', basePrice: 185 },
    'META': { name: 'Meta Platforms, Inc.', currency: 'USD', basePrice: 500 },
    'JPM': { name: 'JPMorgan Chase & Co.', currency: 'USD', basePrice: 200 },
    'V': { name: 'Visa Inc.', currency: 'USD', basePrice: 275 },
    'DIS': { name: 'The Walt Disney Company', currency: 'USD', basePrice: 105 },
    'NKE': { name: 'NIKE, Inc.', currency: 'USD', basePrice: 95 },

    // --- European Stocks ---
    'VOW3.DE': { name: 'Volkswagen AG', currency: 'EUR', basePrice: 125 },
    'SIE.DE': { name: 'Siemens AG', currency: 'EUR', basePrice: 170 },
    'SAP.DE': { name: 'SAP SE', currency: 'EUR', basePrice: 180 },
    'AIR.PA': { name: 'Airbus SE', currency: 'EUR', basePrice: 150 },
    'LVMH.PA': { name: 'LVMH Moët Hennessy', currency: 'EUR', basePrice: 730 },
    'NESN.SW': { name: 'Nestlé S.A.', currency: 'CHF', basePrice: 95 },
    'NOVN.SW': { name: 'Novartis AG', currency: 'CHF', basePrice: 94 },
    'ASML.AS': { name: 'ASML Holding N.V.', currency: 'EUR', basePrice: 970 },

    // --- Asian Stocks ---
    'TM': { name: 'Toyota Motor Corp.', currency: 'USD', basePrice: 205 }, // ADR
    '7203.T': { name: 'Toyota Motor Corp. (Tokyo)', currency: 'JPY', basePrice: 3200 },
    'SONY': { name: 'Sony Group Corporation', currency: 'USD', basePrice: 85 }, // ADR
    '6758.T': { name: 'Sony Group Corp. (Tokyo)', currency: 'JPY', basePrice: 13000 },
    'BABA': { name: 'Alibaba Group Holding Ltd.', currency: 'USD', basePrice: 75 }, // ADR
    '0700.HK': { name: 'Tencent Holdings Ltd.', currency: 'HKD', basePrice: 380 },
    'SSNLF': { name: 'Samsung Electronics Co., Ltd.', currency: 'USD', basePrice: 1400 }, // ADR
};
const getMockStockPrice = (basePrice) => (basePrice * (1 + (Math.random() - 0.5) * 0.02));
const getMockCurrencyRate = (from, to) => {
    if (from === to) return 1.0;
    const rates = { 'USD-EUR': 0.92, 'EUR-USD': 1.08 };
    return rates[`${from}-${to}`] || 1.0;
};


// --- API Endpoints ---

// POST: Register a new user
app.post('/api/register', async (req, res) => {
    const { userId, password } = req.body;
    if (!userId || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const db = readDb();
    if (db.users[userId]) {
        return res.status(409).json({ message: "Username already exists." });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store the new user
    db.users[userId] = { hashedPassword };

    // Create a new portfolio for the user
    db.portfolios[userId] = {
        userId: userId,
        cash: 10000.00,
        currency: 'EUR',
        stocks: {},
        history: [],
    };

    writeDb(db);
    // Send back the new portfolio on successful registration
    res.status(201).json(db.portfolios[userId]);
});

// POST: Log in an existing user
app.post('/api/login', async (req, res) => {
    const { userId, password } = req.body;
    if (!userId || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const db = readDb();
    const user = db.users[userId];
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (isMatch) {
        // On successful login, send back the user's portfolio
        res.status(200).json(db.portfolios[userId]);
    } else {
        res.status(401).json({ message: "Invalid password." });
    }
});

// GET: Fetch a user's portfolio (for refreshing data)
app.get('/api/portfolio/:userId', (req, res) => {
    const { userId } = req.params;
    const db = readDb();

    if (db.portfolios[userId]) {
        res.json(db.portfolios[userId]);
    } else {
        res.status(404).json({ message: "Portfolio not found." });
    }
});

// POST: Update a user's portfolio (for trades)
// This endpoint remains the same, as it's accessed after login.
app.post('/api/portfolio/:userId/trade', (req, res) => {
    const { userId } = req.params;
    const { ticker, shares, tradeType } = req.body;

    if (!ticker || !shares || !tradeType || shares <= 0) {
        return res.status(400).json({ message: "Invalid trade request." });
    }
    const stockData = MOCK_STOCKS[ticker.toUpperCase()];
    if (!stockData) {
        return res.status(404).json({ message: `Stock with ticker '${ticker}' not found.` });
    }

    const db = readDb();
    const portfolio = db.portfolios[userId];
    if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found." });
    }
    
    const rate = getMockCurrencyRate(stockData.currency, portfolio.currency);
    const priceInBase = getMockStockPrice(stockData.basePrice) * rate;
    const totalCost = shares * priceInBase;

    if (tradeType === 'buy') {
        if (portfolio.cash < totalCost) {
            return res.status(400).json({ message: "Not enough cash." });
        }
        portfolio.cash -= totalCost;
        const existingHolding = portfolio.stocks[ticker];
        if (existingHolding) {
            const totalShares = existingHolding.shares + parseInt(shares);
            const totalValue = (existingHolding.shares * existingHolding.avgPrice) + totalCost;
            portfolio.stocks[ticker].shares = totalShares;
            portfolio.stocks[ticker].avgPrice = totalValue / totalShares;
        } else {
            portfolio.stocks[ticker] = { shares: parseInt(shares), avgPrice: priceInBase };
        }
    } else { // Sell
        const existingHolding = portfolio.stocks[ticker];
        if (!existingHolding || existingHolding.shares < shares) {
            return res.status(400).json({ message: "Not enough shares to sell." });
        }
        portfolio.cash += totalCost;
        portfolio.stocks[ticker].shares -= parseInt(shares);
        if (portfolio.stocks[ticker].shares === 0) {
            delete portfolio.stocks[ticker];
        }
    }

    portfolio.history.push({
        type: tradeType,
        ticker: ticker,
        shares: parseInt(shares),
        price: priceInBase,
        total: totalCost,
        timestamp: new Date().toISOString(),
    });

    writeDb(db);
    res.json(portfolio);
});


// --- Start the server ---
app.listen(PORT, () => {
    console.log(`🚀 Stock simulator server running on http://localhost:${PORT}`);
});
