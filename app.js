const $ = id => document.getElementById(id);
const KEY = "connections-fr-state";

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

function pickPuzzleForToday() {
  return window.getPuzzleForToday();
}

function init() {
  const puzzle = pickPuzzleForToday();
  let state = load();

  if (!state || state.date !== today()) {
    state = {
      date: today(),
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
    $("dateLabel").textContent = state.date;
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
        save(state); render();
      };
      grid.appendChild(d);
    });

    $("submitBtn").disabled = state.selected.length !== 4;
  }

  $("submitBtn").onclick = () => {
    const sel = state.selected.slice().sort().join("|");
    const match = state.puzzle.groups.find(
      g => g.words.slice().sort().join("|") === sel
    );

    if (match) {
      state.found.push(match);
      state.msg = "✅ Groupe trouvé";
      state.selected = [];
      if (state.found.length === 4) {
        state.done = true;
        state.msg = "🎉 Bravo !";
      }
    } else {
      state.mistakes++;
      state.msg = "❌ Mauvaise combinaison";
      state.selected = [];
      if (state.mistakes >= 4) {
        state.done = true;
        state.msg = "⛔ Terminé";
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
    save(state); render();
  };

  $("resetBtn").onclick = () => {
    localStorage.removeItem(KEY);
    location.reload();
  };

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }

  render();
}

init();
