# Axe-cess

Axe-cess is a 2D browser game inspired by whack-a-mole. Doors appear inside a square arena and reveal access attempts. The player uses an axe cursor to quickly shut the risky attempts while leaving harmless doors alone.

## Features

- 60-second game rounds
- Levels 1-10 with faster door spawning
- 118 access-attempt door scenarios
- Mix of high-risk and low-risk access descriptions
- Neutral door styling so risk must be inferred from the text
- Axe cursor with chop animation
- Door-opening sound effect
- Pause and resume controls
- Score, level, timer, and attempt log

## Play Locally

Open `index.html` directly in a browser, or run the local server:

```powershell
node dev-server.cjs
```

Then visit:

```text
http://127.0.0.1:5173/
```

## Files

- `index.html` - page structure
- `styles.css` - game layout, doors, and axe cursor
- `game.js` - game loop, scoring, levels, audio, and interactions
- `dev-server.cjs` - small local static server
