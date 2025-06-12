# 🎨 ColorGrid

**ColorGrid** is a real-time, 2-player color conquest game built with the **MERN** stack and **Socket.IO**. Inspired by the simplicity of games like *Tic Tac Toe* and *Connect 4*, players compete on a 5×5 grid to control the largest connected block of their color.

---

## 🚀 Features

- 🧠 Turn-based multiplayer gameplay
- 🎨 Dynamic 5×5 color grid
- 🔗 Real-time interaction via Socket.IO (no page reloads!)
- 📊 Match history and leaderboard
- 🧍 User authentication and profile management
- 💰 Coin system with win/loss tracking
- 🖥️ Clean, component-based React frontend

---

## 🕹️ Gameplay Rules

- Each player is assigned a random color.
- Players take turns filling one cell per turn.
- The game ends when the grid is full.
- The winner is the player with the largest *island* (connected cells of the same color).
- Draws are possible.
- Forfeiting results in an automatic loss.

---

## 📦 Tech Stack

- **Frontend:** React, Vite, React Router, Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MongoDB with Mongoose
- **Other:** REST APIs, useContext, React Hooks, Basic CSS (customizable with Tailwind)

---

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/saadi54humayun/color-grid.git
cd color-grid
