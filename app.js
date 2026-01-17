const $ = id => document.getElementById(id);
const KEY = "connections-fr-state-v2";

function today() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function shuffle(a) {
  const b = a.slice();
  for (let i=b.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [b[i],b[j]]=[b[j],b[i]];
  }
  return b;
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)); }
  catch { return null; }
}

function save(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

function getPuzzle(date, puzzleNumber) {
  // puzzles.js expose getPuzzleFor(date, n)
  return window.getPuzzleFor(date, puzzleNumber);
}

function bestOverlapMessage(puzzle, selection, foundGroups) {
  const sel = new Set(selection);
  const alreadyFound = new Set(foundGroups.flatMap(g => g.words));
  let best = 0;

  for (const g of puzzle.groups) {
    // ignore groups already found
    if (g.words.every(w => alreadyFound.has(w))) continue;

    let k = 0;
    for (const w of g.words) if (sel.has(w)) k++;
    if (k > best) best = k;
  }

  if (best === 3) return "👀 Presque ! Tu as 3 mots en commun (3/4).";
  if (best === 2) return "Pas loin… mais pas encore.";
  return "❌ Mauvaise combinaison";
}

function init() {
  let state = load();

  // state.puzzleNumber: permet plusieurs puzzles par jour
  if (!state || state.date !== today()) {
    state = { date: today(), puzzleNumber: 1 };
  }

  // construit / recharge le puzzle courant
  const puzzle = getPuzzle(new Date(), state.puzzleNumber);

  // si on change de puzzleNumber, on repart propre
  if (!state.puzzle || state.puzzle.id !== puzzle.id) {
    state = {
      date: today(),
      puzzleNumber: state.puzzleNumber || 1,
      puzzle,
      words: shuffle(puzzle.groups.flatMap(g => g.words)),
      selected: [],
      found: [],
      mistakes: 0,
      done: false,
      msg: ""
    };
    save(state);
  }

  function render() {
    $("dateLabel").textContent = `${state.date} · Puzzle #${state.puzzleNumber}`;
    $("mistakes").textContent = state.mistakes;
    $("found").textContent = state.found.length;
    $("msg").textContent = state.msg;

    const fg = $("foundGroups");
    fg.innerHTML = "";
    state.found.forEach(g => {
      fg.innerHTML += `
        <div class="groupCard">
          <div class="groupTitle">${g.label}</div>
          <div class="groupWords">${g.words.join(" · ")}</div>
        </div>`;
    });

    const used = new Set(state.found.flatMap(g => g.words));
    const grid = $("grid");
    grid.innerHTML = "";

    state.words.filter(w => !used.has(w)).forEach(w => {
      const d = document.createElement("div");
      d.className = "tile" + (state.selected.includes(w) ? " sel" : "");
      d.textContent = w;
      d.onclick = () => {
        if (state.done) return;
        const i = state.selected.indexOf(w);
        if (i >= 0) state.selected.splice(i,1);
        else if (state.selected.length < 4) state.selected.push(w);
        state.msg = "";
        save(state); render();
      };
      grid.appendChild(d);
    });

    $("submitBtn").disabled = state.selected.length !== 4 || state.done;
  }

  $("submitBtn").onclick = () => {
    if (state.done) return;

    const selKey = state.selected.slice().sort().join("|");
    const match = state.puzzle.groups.find(
      g => g.words.slice().sort().join("|") === selKey
    );

    if (match) {
      // évite doublons
      if (!state.found.some(g => g.label === match.label)) state.found.push(match);
      state.msg = "✅ Groupe trouvé";
      state.selected = [];

      if (state.found.length === 4) {
        state.done = true;
        state.msg = "🎉 Bravo ! Puzzle terminé.";
      }
    } else {
      state.mistakes++;
      state.msg = bestOverlapMessage(state.puzzle, state.selected, state.found);
      state.selected = [];

      if (state.mistakes >= 4) {
        state.done = true;
        state.msg = "⛔ 4 erreurs. Puzzle terminé.";
      }
    }

    save(state); render();
  };

  $("shuffleBtn").onclick = () => {
    state.words = shuffle(state.words);
    save(state); render();
  };

  $("deselectBtn").onclick = () => {
    state.selected = [];
    state.msg = "";
    save(state); render();
  };

  $("resetBtn").onclick = () => {
    localStorage.removeItem(KEY);
    location.reload();
  };

  $("newPuzzleBtn").onclick = () => {
    // puzzle suivant, même jour
    const next = (state.puzzleNumber || 1) + 1;
    const base = { date: today(), puzzleNumber: next };
    localStorage.setItem(KEY, JSON.stringify(base));
    location.reload();
  };

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }

  render();
}

init();
