const arena = document.querySelector("#arena");
const scoreEl = document.querySelector("#score");
const levelEl = document.querySelector("#level");
const timerEl = document.querySelector("#timer");
const message = document.querySelector("#message");
const eventLog = document.querySelector("#eventLog");
const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const axeCursor = document.querySelector("#axeCursor");

let audioContext = null;

const riskyAccess = [
  ["Datacenter", "Badge clone near cage A"],
  ["AI Agent", "Tool use request: finance data"],
  ["Payroll Vault", "Privileged export attempt"],
  ["Root Console", "Admin shell from new device"],
  ["Source Repo", "Token pull on main branch"],
  ["Prod Database", "Read query outside change window"],
  ["Executive Suite", "After-hours guest pass"],
  ["Secrets Store", "Bulk credential browse"],
  ["Cloud Admin", "MFA fatigue pattern"],
  ["Security Desk", "Camera override request"],
  ["Wire Transfer", "New payee for urgent invoice"],
  ["Backup Vault", "Restore key requested off-hours"],
  ["Customer PII", "Bulk download from unknown IP"],
  ["Badge Printer", "Temporary badge override"],
  ["Model Weights", "Export to personal drive"],
  ["Legal Archive", "Hold notice folder opened"],
  ["HR Records", "Salary file copied"],
  ["SOC Console", "Alert suppression attempt"],
  ["Firewall Admin", "Inbound rule from internet"],
  ["Kubernetes Prod", "Privileged pod exec"],
  ["Vendor Portal", "Admin role self-assigned"],
  ["Finance Share", "Quarter close file export"],
  ["GitHub Admin", "Deploy key created"],
  ["Okta Admin", "MFA factor reset"],
  ["VPN Gateway", "Impossible travel login"],
  ["Service Account", "Token created without ticket"],
  ["Data Lake", "Full table scan at midnight"],
  ["Payment Gateway", "Refund limit change"],
  ["Incident Room", "Evidence zip downloaded"],
  ["Board Deck", "Unreleased strategy opened"],
  ["Cloud Billing", "Budget alerts disabled"],
  ["Privileged Access", "Emergency elevation requested"],
  ["Production SSH", "Root login from new host"],
  ["Release Pipeline", "Approval gate skipped"],
  ["Audit Logs", "Retention policy shortened"],
  ["DLP Console", "Policy disabled temporarily"],
  ["Crypto Wallet", "Signing key accessed"],
  ["Domain Registrar", "DNS transfer unlocked"],
  ["Email Admin", "Mailbox forwarding rule"],
  ["SAML Config", "Certificate replaced"],
  ["Admin Laptop", "Remote wipe cancelled"],
  ["CFO Inbox", "Delegate access granted"],
  ["Source Secrets", "Env file opened"],
  ["Database Snapshot", "Copied to public bucket"],
  ["Security Keys", "New hardware key enrolled"],
  ["AI Toolchain", "Agent given shell access"],
  ["Private Roadmap", "Export request from contractor"],
  ["SCADA Console", "Manual override started"],
  ["NDA Folder", "External share created"],
  ["Identity Graph", "Mass permission lookup"],
  ["Password Vault", "Shared folder exported"],
  ["API Gateway", "Rate limits removed"],
  ["Token Broker", "Long-lived token minted"],
  ["Crown Jewels", "Access from unmanaged device"],
  ["Prod Config", "Debug mode enabled"],
  ["Data Warehouse", "Sensitive view queried"],
  ["Key Management", "Decrypt permission added"],
  ["Partner SFTP", "Unknown key uploaded"],
  ["Executive Travel", "Itinerary file opened"],
  ["Zero Trust Policy", "Device check bypassed"],
  ["Camera Network", "Blind spot schedule edited"],
  ["Build Signing", "Certificate exported"],
  ["Privileged Chat", "Confidential channel scraped"],
  ["Code Scanning", "Critical finding dismissed"],
  ["Network Core", "Route table modified"]
];

const lowRiskAccess = [
  ["Bathroom", "Routine badge tap"],
  ["Janitors Closet", "Approved service route"],
  ["Snack Room", "Coffee refill detour"],
  ["Mail Room", "Package pickup"],
  ["Bike Storage", "Employee check-in"],
  ["Supply Cabinet", "Printer paper request"],
  ["Wellness Room", "Booked reservation"],
  ["Lobby Kiosk", "Visitor map lookup"],
  ["Cafeteria", "Lunch payment scan"],
  ["Training Room", "Scheduled workshop entry"],
  ["Parking Garage", "Employee vehicle entry"],
  ["Coat Check", "Personal locker access"],
  ["Copy Room", "Print pickup"],
  ["Reception Desk", "Guest badge return"],
  ["Mothers Room", "Reserved time slot"],
  ["Break Room", "Water refill"],
  ["Gym", "Morning workout check-in"],
  ["Conference A", "Booked team meeting"],
  ["Conference B", "Calendar owner present"],
  ["IT Help Desk", "Keyboard replacement"],
  ["Facilities Desk", "Light repair request"],
  ["Lost and Found", "Umbrella pickup"],
  ["First Aid Kit", "Bandage request"],
  ["Loading Dock", "Expected courier arrival"],
  ["Mail Slot", "Internal memo drop"],
  ["Vending Area", "Snack purchase"],
  ["Quiet Room", "Focus block reservation"],
  ["Phone Booth", "Private call booking"],
  ["Visitor Lounge", "Escorted guest waiting"],
  ["Kitchen Pantry", "Tea restock"],
  ["Supply Shelf", "Sticky note pickup"],
  ["Elevator Lobby", "Normal floor call"],
  ["Stairwell", "Fitness challenge route"],
  ["Bike Cage", "Registered bike removal"],
  ["Shower Room", "Post-commute access"],
  ["Makerspace", "Approved demo hour"],
  ["Library Shelf", "Policy binder checkout"],
  ["Training Portal", "Annual course launch"],
  ["Benefits Site", "Open enrollment FAQ"],
  ["Public Website CMS", "Typo fix draft"],
  ["Test Sandbox", "Demo account login"],
  ["Dev Playground", "Mock data query"],
  ["Printer Queue", "Own document release"],
  ["Calendar Room", "Reservation lookup"],
  ["Travel Portal", "Hotel policy search"],
  ["Expense App", "Receipt photo upload"],
  ["Team Wiki", "Read-only page view"],
  ["Badge Office", "Photo retake appointment"],
  ["Facilities Map", "Desk location lookup"],
  ["Coffee Bar", "Loyalty scan"],
  ["Event Hall", "All-hands attendance"],
  ["Shipping Cart", "Laptop box request"],
  ["Office Playlist", "Song request added"]
];

const state = {
  active: new Map(),
  level: 1,
  score: 0,
  seconds: 60,
  riskyClosed: 0,
  missedRisk: 0,
  falseAlarms: 0,
  running: false,
  paused: false,
  spawnTimer: null,
  clockTimer: null,
  nextSpawnAt: 0,
  remainingSpawnMs: 0
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function levelSettings() {
  return {
    spawnMs: Math.max(380, 1520 - state.level * 118),
    lifeMs: Math.max(720, 2700 - state.level * 170),
    maxActive: Math.min(7, 2 + Math.floor(state.level / 2)),
    riskChance: Math.min(0.84, 0.58 + state.level * 0.03)
  };
}

function updateHud() {
  scoreEl.textContent = state.score;
  levelEl.textContent = state.level;
  timerEl.textContent = state.seconds;
  pauseButton.textContent = state.paused ? "Resume" : "Pause";
  pauseButton.disabled = !state.running;
}

function addLog(text, type = "") {
  const entry = document.createElement("li");
  entry.className = type;
  entry.textContent = text;
  eventLog.prepend(entry);

  while (eventLog.children.length > 7) {
    eventLog.lastElementChild.remove();
  }
}

function setCenterMessage(title, detail, visible = true) {
  message.innerHTML = `<strong>${title}</strong><span>${detail}</span>`;
  message.classList.toggle("hide", !visible);
}

function scheduleSpawn() {
  if (!state.running || state.paused) return;

  clearTimeout(state.spawnTimer);
  const { spawnMs } = levelSettings();
  const jitter = Math.random() * 260;
  const delay = state.remainingSpawnMs || spawnMs + jitter;
  state.remainingSpawnMs = 0;
  state.nextSpawnAt = Date.now() + delay;
  state.spawnTimer = setTimeout(() => {
    spawnDoor();
    scheduleSpawn();
  }, delay);
}

function startGame() {
  initializeAudio();
  clearTimeout(state.spawnTimer);
  clearInterval(state.clockTimer);

  for (const door of state.active.values()) {
    door.element.remove();
    clearTimeout(door.timeout);
  }

  Object.assign(state, {
    active: new Map(),
    level: 1,
    score: 0,
    seconds: 60,
    riskyClosed: 0,
    missedRisk: 0,
    falseAlarms: 0,
    running: true,
    paused: false,
    spawnTimer: null,
    clockTimer: null,
    nextSpawnAt: 0,
    remainingSpawnMs: 0
  });

  eventLog.innerHTML = "";
  updateHud();
  setCenterMessage("Doors opening", "Only shut risky attempts.", false);
  startButton.textContent = "Restart";
  pauseButton.disabled = false;

  startClock();

  spawnDoor();
  scheduleSpawn();
}

function startClock() {
  clearInterval(state.clockTimer);
  state.clockTimer = setInterval(() => {
    state.seconds -= 1;
    updateHud();

    if (state.seconds <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  state.running = false;
  state.paused = false;
  clearTimeout(state.spawnTimer);
  clearInterval(state.clockTimer);

  for (const door of state.active.values()) {
    clearTimeout(door.timeout);
    door.element.classList.add("shut");
    setTimeout(() => door.element.remove(), 180);
  }
  state.active.clear();

  setCenterMessage(
    "Shift complete",
    `Score ${state.score}. Risk doors shut ${state.riskyClosed}. Missed ${state.missedRisk}.`,
    true
  );
  addLog(`Final score: ${state.score}`, "good");
  updateHud();
}

function spawnDoor() {
  if (!state.running || state.paused) return;

  const settings = levelSettings();
  if (state.active.size >= settings.maxActive) return;

  const isRisk = Math.random() < settings.riskChance;
  const [title, detail] = randomItem(isRisk ? riskyAccess : lowRiskAccess);
  const id = crypto.randomUUID();
  const size = randomDoorSize();
  const position = randomDoorPosition(size);

  const door = document.createElement("button");
  door.type = "button";
  door.className = `door ${isRisk ? "risk" : "safe"}`;
  door.style.width = `${size.width}%`;
  door.style.height = `${size.height}%`;
  door.style.left = `${position.left}%`;
  door.style.top = `${position.top}%`;
  door.setAttribute("aria-label", `Access door: ${title}. ${detail}`);
  door.innerHTML = `
    <span class="door-inner">
      <span class="door-title">${title}<span class="door-detail">${detail}</span></span>
    </span>
    <span class="door-leaf" aria-hidden="true"></span>
  `;

  door.addEventListener("click", () => closeDoor(id));
  arena.append(door);

  requestAnimationFrame(() => door.classList.add("open"));
  playDoorOpenSound();

  const timeout = setTimeout(() => expireDoor(id), settings.lifeMs);
  state.active.set(id, {
    element: door,
    isRisk,
    title,
    timeout,
    openedAt: Date.now(),
    lifeMs: settings.lifeMs,
    remainingMs: settings.lifeMs
  });
}

function randomDoorSize() {
  const width = 16 + Math.random() * 9;
  const height = 17 + Math.random() * 9;
  return { width, height };
}

function randomDoorPosition(size) {
  return {
    left: Math.random() * (100 - size.width - 2) + 1,
    top: Math.random() * (100 - size.height - 2) + 1
  };
}

function closeDoor(id) {
  const door = state.active.get(id);
  if (!door || state.paused) return;

  clearTimeout(door.timeout);
  state.active.delete(id);
  door.element.classList.add("shut");
  setTimeout(() => door.element.remove(), 180);

  if (door.isRisk) {
    const points = 10 + state.level * 3;
    state.score += points;
    state.riskyClosed += 1;
    addLog(`Closed ${door.title}: +${points}`, "good");
    updateLevel();
  } else {
    state.falseAlarms += 1;
    state.score = Math.max(0, state.score - 6);
    addLog(`False alarm: ${door.title} -6`, "bad");
  }

  updateHud();
}

function expireDoor(id) {
  const door = state.active.get(id);
  if (!door || state.paused) return;

  state.active.delete(id);
  door.element.classList.add("shut");
  setTimeout(() => door.element.remove(), 180);

  if (door.isRisk) {
    state.missedRisk += 1;
    state.score = Math.max(0, state.score - 4);
    addLog(`Missed ${door.title}: -4`, "bad");
    updateHud();
  }
}

function updateLevel() {
  const nextLevel = Math.min(10, 1 + Math.floor(state.riskyClosed / 5));
  if (nextLevel > state.level) {
    state.level = nextLevel;
    addLog(`Level ${state.level}: doors are moving faster`, "good");
    scheduleSpawn();
  }
}

function togglePause() {
  if (!state.running) return;

  if (state.paused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

function pauseGame() {
  state.paused = true;
  arena.classList.add("paused");
  clearTimeout(state.spawnTimer);
  clearInterval(state.clockTimer);
  state.remainingSpawnMs = Math.max(120, state.nextSpawnAt - Date.now());

  for (const door of state.active.values()) {
    clearTimeout(door.timeout);
    door.remainingMs = Math.max(120, door.remainingMs - (Date.now() - door.openedAt));
  }

  setCenterMessage("Paused", "Resume when you are ready.", true);
  updateHud();
}

function resumeGame() {
  state.paused = false;
  arena.classList.remove("paused");
  setCenterMessage("Doors opening", "Only shut risky attempts.", false);

  for (const [id, door] of state.active) {
    door.openedAt = Date.now();
    door.timeout = setTimeout(() => expireDoor(id), door.remainingMs);
  }

  startClock();
  scheduleSpawn();
  updateHud();
}

function initializeAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;

  if (!audioContext) {
    audioContext = new AudioCtor();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playDoorOpenSound() {
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  const thud = audioContext.createOscillator();
  const thudGain = audioContext.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(260, now);
  oscillator.frequency.exponentialRampToValueAtTime(72, now + 0.22);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2100, now);
  filter.frequency.exponentialRampToValueAtTime(340, now + 0.24);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.34, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

  thud.type = "sine";
  thud.frequency.setValueAtTime(72, now + 0.04);
  thud.frequency.exponentialRampToValueAtTime(38, now + 0.18);
  thudGain.gain.setValueAtTime(0.0001, now + 0.04);
  thudGain.gain.exponentialRampToValueAtTime(0.42, now + 0.07);
  thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  thud.connect(thudGain);
  thudGain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.28);
  thud.start(now + 0.04);
  thud.stop(now + 0.22);
}

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
window.addEventListener("pointermove", moveAxeCursor);
window.addEventListener("pointerdown", chopAxeCursor);
document.addEventListener("pointerleave", () => axeCursor.classList.remove("visible"));
updateHud();

function moveAxeCursor(event) {
  axeCursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  axeCursor.classList.add("visible");
}

function chopAxeCursor() {
  axeCursor.classList.remove("chop");
  void axeCursor.offsetWidth;
  axeCursor.classList.add("chop");
}
