// src/App.js
// This version updates the StockFinder component to display a searchable list of all available stocks.

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ArrowUpRight, ArrowDownRight, DollarSign, Search, Briefcase, History, LogOut, TrendingUp, TrendingDown, Coins, User, Lock } from 'lucide-react';

import './App.css';

// --- API Configuration ---
const API_URL = 'http://localhost:3001/api';

// --- Mock Financial Data (Expanded List to match server) ---
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
    const rates = { 'USD-EUR': 0.92, 'EUR-USD': 1.08, 'JPY-EUR': 0.0058, 'CHF-EUR': 1.02, 'HKD-EUR': 0.12 };
    return rates[`${from}-${to}`] || 1.0;
};
const findStockDisplayData = (ticker) => {
    const stock = MOCK_STOCKS[ticker.toUpperCase()];
    if (!stock) return null;
    return {
        ticker: ticker.toUpperCase(),
        name: stock.name,
        price: getMockStockPrice(stock.basePrice),
        currency: stock.currency,
    };
};

// --- Helper Components (Unchanged) ---
const StatCard = ({ icon, title, value, change, iconBgColor }) => ( <div className="stat-card"><div className="stat-card-content"><div className="stat-card-info"><div className="stat-card-icon" style={{ backgroundColor: iconBgColor }}>{icon}</div><div><p className="stat-card-title">{title}</p><p className="stat-card-value">{value}</p></div></div>{change && (<div className={`stat-card-change ${change.startsWith('+') ? 'positive' : 'negative'}`}>{change.startsWith('+') ? <TrendingUp size={16} /> : <TrendingDown size={16} />}{change}</div>)}</div></div>);
const Spinner = () => (<div className="spinner-container"><div className="spinner"></div></div>);

// --- Core App Components (Portfolio, TradeWidget, TransactionHistory are unchanged) ---
const Portfolio = ({ portfolio, baseCurrency }) => {
    const [marketData, setMarketData] = useState({});
    useEffect(() => {
        const displayData = {};
        Object.keys(portfolio.stocks || {}).forEach(ticker => { displayData[ticker] = findStockDisplayData(ticker); });
        setMarketData(displayData);
    }, [portfolio.stocks]);
    const { totalValue, totalPL, totalPLPercent } = useMemo(() => {
        let currentMarketValue = 0;
        Object.entries(portfolio.stocks || {}).forEach(([ticker, holding]) => {
            const currentDisplayData = marketData[ticker];
            if (currentDisplayData) {
                const rate = getMockCurrencyRate(currentDisplayData.currency, baseCurrency);
                const currentPriceInBase = getMockStockPrice(MOCK_STOCKS[ticker].basePrice) * rate;
                currentMarketValue += holding.shares * currentPriceInBase;
            }
        });
        const totalValue = portfolio.cash + currentMarketValue;
        const initialInvestment = 10000;
        const totalPL = totalValue - initialInvestment;
        const totalPLPercent = (totalPL / initialInvestment) * 100;
        return { totalValue, totalPL, totalPLPercent };
    }, [portfolio, marketData, baseCurrency]);
    return (<div className="card"><h2 className="card-title"><Briefcase className="icon-blue" /> Your Portfolio</h2><div className="stats-grid"><StatCard icon={<DollarSign size={20} className="icon-green" />} title="Total Value" value={`${baseCurrency} ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} iconBgColor="rgba(34, 197, 94, 0.1)" /><StatCard icon={totalPL >= 0 ? <TrendingUp size={20} className="icon-blue" /> : <TrendingDown size={20} className="icon-red" />} title="Total P/L" value={`${baseCurrency} ${totalPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} change={`${totalPL >= 0 ? '+' : ''}${totalPLPercent.toFixed(2)}%`} iconBgColor={totalPL >= 0 ? "rgba(59, 130, 246, 0.1)" : "rgba(239, 68, 68, 0.1)"} /><StatCard icon={<Coins size={20} className="icon-yellow" />} title="Available Cash" value={`${baseCurrency} ${(portfolio.cash || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} iconBgColor="rgba(234, 179, 8, 0.1)" /></div><div className="table-container"><table><thead><tr><th>Asset</th><th className="text-right">Shares</th><th className="text-right">Avg. Price</th><th className="text-right">Current Price</th><th className="text-right">Market Value</th><th className="text-right">P/L</th></tr></thead><tbody>{Object.entries(portfolio.stocks || {}).map(([ticker, holding]) => { const currentDisplayData = marketData[ticker]; if (!currentDisplayData) return <tr key={ticker}><td colSpan="6"><Spinner/></td></tr>; const rate = getMockCurrencyRate(currentDisplayData.currency, baseCurrency); const currentPriceInBase = getMockStockPrice(MOCK_STOCKS[ticker].basePrice) * rate; const marketValue = holding.shares * currentPriceInBase; const pl = marketValue - (holding.shares * holding.avgPrice); const plPercent = (pl / (holding.shares * holding.avgPrice)) * 100; const plClass = pl >= 0 ? 'positive' : 'negative'; return (<tr key={ticker}><td className="font-semibold">{currentDisplayData.name} ({ticker})</td><td className="text-right">{holding.shares}</td><td className="text-right">{holding.avgPrice.toFixed(2)}</td><td className="text-right">{currentPriceInBase.toFixed(2)}</td><td className="text-right">{marketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td className={`font-semibold text-right ${plClass}`}>{pl.toFixed(2)} ({plPercent.toFixed(2)}%)</td></tr>);})}</tbody></table>{Object.keys(portfolio.stocks || {}).length === 0 && (<p className="empty-message">You don't own any stocks yet. Use the trade panel to buy your first stock!</p>)}</div></div>);
};
const TradeWidget = ({ userId, onTradeSuccess }) => {
    const [ticker, setTicker] = useState(''); const [shares, setShares] = useState(''); const [tradeType, setTradeType] = useState('buy'); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [loading, setLoading] = useState(false);
    const handleTrade = async () => {
        if (!ticker || !shares || shares <= 0) { setError("Please enter a valid ticker and number of shares."); return; }
        setLoading(true); setError(''); setSuccess('');
        try {
            const response = await axios.post(`${API_URL}/portfolio/${userId}/trade`, { ticker: ticker.toUpperCase(), shares: parseInt(shares), tradeType: tradeType });
            onTradeSuccess(response.data); setSuccess(`Successfully ${tradeType === 'buy' ? 'bought' : 'sold'} ${shares} shares of ${ticker.toUpperCase()}.`); setTicker(''); setShares('');
        } catch (err) { setError(err.response?.data?.message || "An error occurred during the trade."); } finally { setLoading(false); setTimeout(() => setSuccess(''), 5000); }
    };
    return (<div className="card"><h3 className="card-subtitle">Trade Stocks</h3><div className="trade-toggle"><button onClick={() => setTradeType('buy')} className={tradeType === 'buy' ? 'active buy' : ''}>Buy</button><button onClick={() => setTradeType('sell')} className={tradeType === 'sell' ? 'active sell' : ''}>Sell</button></div><div className="form-group"><input type="text" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} placeholder="Ticker (e.g. AAPL)" /><input type="number" value={shares} onChange={e => setShares(e.target.value)} placeholder="Number of Shares" /><button onClick={handleTrade} disabled={loading} className={`btn-trade ${tradeType}`}>{loading ? <Spinner /> : `Execute ${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)}`}</button></div>{error && <p className="message error">{error}</p>}{success && <p className="message success">{success}</p>}</div>);
};
const TransactionHistory = ({ history, baseCurrency }) => {
    return (<div className="card"><h2 className="card-title"><History className="icon-blue" /> Transaction History</h2><div className="table-container history-table"><table><thead><tr><th>Date</th><th>Type</th><th>Ticker</th><th className="text-right">Shares</th><th className="text-right">Total</th></tr></thead><tbody>{[...(history || [])].reverse().map((tx, index) => (<tr key={index}><td className="text-sm text-muted">{new Date(tx.timestamp).toLocaleDateString()}</td><td className={`font-semibold ${tx.type === 'buy' ? 'positive' : 'negative'}`}><div className="type-cell">{tx.type === 'buy' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}{tx.type.toUpperCase()}</div></td><td className="font-semibold">{tx.ticker}</td><td className="text-right">{tx.shares}</td><td className="text-right">{baseCurrency} {tx.total.toFixed(2)}</td></tr>))}</tbody></table>{(history || []).length === 0 && (<p className="empty-message">No transactions yet.</p>)}</div></div>);
};
const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [isRegister, setIsRegister] = useState(false); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) { setError("Username and password cannot be empty."); return; }
        setLoading(true); setError('');
        const endpoint = isRegister ? 'register' : 'login';
        try {
            const response = await axios.post(`${API_URL}/${endpoint}`, { userId: username.trim(), password: password.trim() });
            onLoginSuccess(username.trim(), response.data);
        } catch (err) { setError(err.response?.data?.message || "An unknown error occurred."); } finally { setLoading(false); }
    };
    return (<div className="login-container"><div className="login-card"><h1 className="login-title">Stock Simulator</h1><p className="login-subtitle">{isRegister ? "Create a new account" : "Sign in to your account"}</p><form onSubmit={handleSubmit} className="login-form"><div className="input-group"><User className="input-icon" /><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required/></div><div className="input-group"><Lock className="input-icon" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required/></div>{error && <p className="message error">{error}</p>}<button type="submit" className="login-button" disabled={loading}>{loading ? <Spinner /> : (isRegister ? "Register" : "Login")}</button></form><p className="toggle-form">{isRegister ? "Already have an account?" : "Don't have an account?"}<button onClick={() => setIsRegister(!isRegister)}>{isRegister ? "Login" : "Register"}</button></p></div></div>);
};

// --- UPDATED StockFinder Component ---
const StockFinder = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);

    const allStocks = useMemo(() => Object.keys(MOCK_STOCKS).map(ticker => ({
        ticker,
        name: MOCK_STOCKS[ticker].name
    })), []);

    const filteredStocks = allStocks.filter(stock =>
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStockClick = (ticker) => {
        const data = findStockDisplayData(ticker);
        setSelectedStock(data);
    };

    return (
        <div className="card">
            <h3 className="card-subtitle"><Search className="icon-blue" /> Find a Stock</h3>
            <div className="finder-form">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by name or ticker..."
                />
            </div>

            <div className="stock-list-container">
                {filteredStocks.map(stock => (
                    <div key={stock.ticker} className="stock-list-item" onClick={() => handleStockClick(stock.ticker)}>
                        <span className="stock-list-name">{stock.name}</span>
                        <span className="stock-list-ticker">{stock.ticker}</span>
                    </div>
                ))}
                 {filteredStocks.length === 0 && (
                    <p className="empty-message">No stocks match your search.</p>
                )}
            </div>

            {selectedStock && (
                <div className="finder-result">
                    <h4>{selectedStock.name} ({selectedStock.ticker})</h4>
                    <p className="price">
                        {selectedStock.price.toFixed(2)} <span className="currency">{selectedStock.currency}</span>
                    </p>
                </div>
            )}
        </div>
    );
};


// --- Main App Component (Unchanged) ---
export default function App() {
    const [userId, setUserId] = useState(null);
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUserId = localStorage.getItem('stock_simulator_userId');
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!userId) return;
        const fetchPortfolio = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/portfolio/${userId}`);
                setPortfolio(response.data);
            } catch (err) {
                setError("Could not connect to the server. Is it running?");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [userId]);

    const handleLoginSuccess = (loggedInUserId, portfolioData) => {
        localStorage.setItem('stock_simulator_userId', loggedInUserId);
        setUserId(loggedInUserId);
        setPortfolio(portfolioData);
    };

    const handleLogout = () => {
        localStorage.removeItem('stock_simulator_userId');
        setUserId(null);
        setPortfolio(null);
    };

    if (!userId) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    if (loading) {
        return (<div className="app-container loading"><Spinner /></div>);
    }
    
    if (error) {
         return (<div className="app-container error"><p>{error}</p></div>);
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>React Stock Simulator</h1>
                <div className="user-info">
                    <span>{userId}</span>
                    <LogOut size={16} className="logout-icon" onClick={handleLogout} />
                </div>
            </header>
            <main className="app-main">
                {portfolio ? (
                    <div className="layout-grid">
                        <div className="main-column">
                           <Portfolio portfolio={portfolio} baseCurrency={portfolio.currency} />
                           <TransactionHistory history={portfolio.history} baseCurrency={portfolio.currency} />
                        </div>
                        <div className="sidebar-column">
                            <TradeWidget userId={userId} onTradeSuccess={setPortfolio} />
                            <StockFinder />
                        </div>
                    </div>
                ) : (<p>Loading portfolio...</p>)}
            </main>
        </div>
    );
}
