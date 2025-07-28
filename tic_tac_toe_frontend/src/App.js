import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Color palette:
 * - Accent: #ff6347 (for highlights, X, O, current player)
 * - Primary: #1e90ff (for primary CTA and X)
 * - Secondary: #23272f (for secondary backgrounds, O)
 * Board, squares, buttons, status all use minimalistic light theme.
 */

// PUBLIC_INTERFACE
function App() {
  // Game State
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);

  // For minimal dark toggle, but defaults to light per requirements:
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Calculate derived state
  const currentSquares = history[stepNumber];
  const winnerInfo = calculateWinner(currentSquares);
  const isDraw = !winnerInfo && currentSquares.every(Boolean);

  // PUBLIC_INTERFACE
  function handleClick(i) {
    // If game over or occupied, ignore
    if (winnerInfo || currentSquares[i]) return;
    const squares = currentSquares.slice();
    squares[i] = xIsNext ? "X" : "O";
    const newHistory = history.slice(0, stepNumber + 1).concat([squares]);
    setHistory(newHistory);
    setStepNumber(newHistory.length - 1);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function jumpTo(step) {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setHistory([Array(9).fill(null)]);
    setStepNumber(0);
    setXIsNext(true);
  }

  // PUBLIC_INTERFACE
  function handleUndo() {
    if (stepNumber > 0) {
      setStepNumber(stepNumber - 1);
      setXIsNext((stepNumber - 1) % 2 === 0);
    }
  }

  // PUBLIC_INTERFACE
  function handleRedo() {
    if (stepNumber < history.length - 1) {
      setStepNumber(stepNumber + 1);
      setXIsNext((stepNumber + 1) % 2 === 0);
    }
  }

  const playerXColor = "var(--primary-color)";
  const playerOColor = "var(--accent-color)";

  // Build status message & highlight
  let status;
  if (winnerInfo) {
    status = (
      <span data-testid="winner">
        Winner:{" "}
        <span
          className={
            winnerInfo.winner === "X"
              ? "player-x status-player"
              : "player-o status-player"
          }
        >
          {winnerInfo.winner}
        </span>
      </span>
    );
  } else if (isDraw) {
    status = <span data-testid="draw">It's a draw!</span>;
  } else {
    status = (
      <span>
        Next:{" "}
        <span
          className={
            xIsNext ? "player-x status-player" : "player-o status-player"
          }
        >
          {xIsNext ? "X" : "O"}
        </span>
      </span>
    );
  }

  return (
    <div className="App">
      <div className="game-container">
        <h1 className="game-title">Tic Tac Toe</h1>
        <div className="status-bar">{status}</div>
        <Board
          squares={currentSquares}
          onClick={handleClick}
          winningLine={winnerInfo?.line}
        />
        <div className="controls-row">
          <button className="ttt-btn" onClick={handleUndo} disabled={stepNumber === 0}>
            Undo
          </button>
          <button className="ttt-btn" onClick={handleReset}>
            Reset
          </button>
          <button
            className="ttt-btn"
            onClick={handleRedo}
            disabled={stepNumber === history.length - 1}
          >
            Redo
          </button>
        </div>
        <div className="player-indicator">
          <span className={xIsNext ? "player-x active" : "player-x"}>X</span>
          <span className="vs">vs</span>
          <span className={xIsNext ? "player-o" : "player-o active"}>O</span>
        </div>
        <button
          className="theme-toggle"
          onClick={() =>
            setTheme((prev) => (prev === "light" ? "dark" : "light"))
          }
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
      <footer className="footer-min">
        <span>
          Modern minimalistic React Tic Tac Toe |&nbsp;
          <a
            className="footer-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Docs
          </a>
        </span>
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
function Board({ squares, onClick, winningLine }) {
  // Show 3x3 board, highlight winning squares if any
  // Responsive, minimalistic
  function renderSquare(i) {
    const isWinningSquare = winningLine?.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onClick(i)}
        highlight={isWinningSquare}
      />
    );
  }
  let rows = [];
  for (let r = 0; r < 3; r++) {
    let row = [];
    for (let c = 0; c < 3; c++) {
      row.push(renderSquare(r * 3 + c));
    }
    rows.push(
      <div className="board-row" key={r}>
        {row}
      </div>
    );
  }
  return <div className="ttt-board">{rows}</div>;
}

// PUBLIC_INTERFACE
function Square({ value, onClick, highlight }) {
  // value is 'X', 'O', or null
  let classes = "ttt-square";
  if (highlight) classes += " highlight";
  classes += value === "X" ? " x-square" : value === "O" ? " o-square" : "";
  return (
    <button className={classes} onClick={onClick} disabled={!!value}>
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  // Returns {winner: 'X' or 'O', line: [indices]}, or null
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}

export default App;
