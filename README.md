# React & Node.js Stock Market Simulator

This project is a web-based stock market simulator that allows users to register, log in, and manage a virtual stock portfolio. It provides a safe and interactive environment to practice trading strategies with a starting virtual cash balance of €10,000.

The application is built with a React frontend and a Node.js (Express) backend, using a simple JSON file as a local database.

## Features

* **User Authentication:** Secure user registration and login with password hashing (`bcrypt`).
* **Portfolio Management:** View total portfolio value, profit/loss, and available cash.
* **Stock Trading:** Buy and sell a variety of stocks from major global markets.
* **Transaction History:** Keep a record of all buy and sell transactions.
* **Stock Discovery:** Browse and search a list of all available stocks.
* **Persistent Data:** User portfolios are saved locally in a JSON file on the server.

## Tech Stack

* **Frontend:** React, Axios
* **Backend:** Node.js, Express.js
* **Styling:** Plain CSS
* **Security:** bcrypt for password hashing

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

* [Node.js](https://nodejs.org/en/) (which includes npm)

## Setup & Installation

The project is divided into two main parts: the `stock-server` (backend) and the `stock-simulator` (frontend). You need to install the dependencies for both.

### 1. Backend Setup

First, set up the Node.js server.

```bash
# Navigate to the backend directory
cd stock-server

# Install the required npm packages
npm install
```

### 2. Frontend Setup
Next, set up the React application in a separate terminal.

```bash
# Navigate to the frontend directory
cd stock-simulator

# Install the required npm packages
npm install
```

## Running the Application
To run the simulator, you must have both the backend server and the frontend application running at the same time in two separate terminals.

Terminal 1: Start the Backend Server
Bash

```bash
# In the stock-server directory
node server.js
```

You should see the following output, indicating the server is running:
🚀 Stock simulator server running on http://localhost:3001

Terminal 2: Start the Frontend Application
Bash

```bash
# In the stock-simulator directory
npm start
```

```bash
# In the stock-server directory
node server.js
```

You should see the following output, indicating the server is running:
🚀 Stock simulator server running on http://localhost:3001

Terminal 2: Start the Frontend Application
Bash

```bash
# In the stock-simulator directory
npm start
```

```bash
# In the stock-server directory
node server.js
```

You should see the following output, indicating the server is running:
🚀 Stock simulator server running on http://localhost:3001

Terminal 2: Start the Frontend Application

```bash
# In the stock-simulator directory
npm start
```

This will automatically open your default web browser to http://localhost:3000.

How to Use
Once the application is open in your browser, you will see a login/registration screen.

Click "Register" to create a new account with a username and password.

After registering, you will be automatically logged in.

You can now view your portfolio, buy/sell stocks using the "Trade Stocks" widget, and browse available stocks in the "Find a Stock" widget.

Your session is stored in the browser. If you close the tab and reopen it, you will remain logged in. Click the logout button to return to the login screen.