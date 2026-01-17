const $ = id => document.getElementById(id);

function today() {
  return new Date().toISOString().slice(0,10);
}

function params() {
  const p = new URLSearchParams(location.search);
  return {
    d: p.get("d") || today(),
    n: parseInt(p.get("n") || "1", 10)
  };
}

function setParams(d,n) {
  const p = new URLSearchParams();
  p.set("d", d);
  p.set("n", n);
  history.replaceState(null,"",`?${p.toString()}`);
}

function shuffle(a) {
  const b = a.slice();
  for (let i=b.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [b[i],b[j]]=[b[j],b[i]];
  }
  return b;
}

function key(id) { return "connections:"+id; }

function load(k){ try{return JSON.parse(localStorage.getItem(k));}catch{return null;} }
function save(k,s){ localStorage.setItem(k,JSON.stringify(s)); }

function overlapMsg(puzzle, sel, found) {
  const s = new Set(sel);
  const used = new Set(found.flatMap(g=>g.words));
  let best = 0;

  puzzle.groups.forEach(g=>{
    if (g.words.every(w=>used.has(w))) return;
    let c = 0;
    g.words.forEach(w=>{ if(s.has(w)) c++; });
    best = Math.max(best,c);
  });

  return best===3
    ? "👀 Presque ! Tu as 3 mots en commun (3/4)."
    : "❌ Mauvaise combinaison";
}

function revealAll(state) {
  const done = new Set(state.found.map(g=>g.label));
  state.puzzle.groups.forEach(g=>{
    if(!done.has(g.label)) state.found.push(g);
  });
}

function init() {
  const {d,n} = params();
  setParams(d,n);

  const puzzle = window.getPuzzleFor(new Date(d), n);
  const k = key(puzzle.id);

  let state = load(k);
  if(!state){
    state = {
      puzzle, d, n,
      words: shuffle(puzzle.groups.flatMap(g=>g.words)),
      selected:[], found:[],
      mistakes:0, done:false, msg:""
    };
    save(k,state);
  }

  function render(){
    $("dateLabel").textContent = `${d} · Puzzle #${n}`;
    $("mistakes").textContent = state.mistakes;
    $("found").textContent = state.found.length;
    $("msg").textContent = state.msg;

    $("foundGroups").innerHTML =
      state.found.map(g=>`
        <div class="groupCard">
          <div class="groupTitle">${g.label}</div>
          <div class="groupWords">${g.words.join(" · ")}</div>
        </div>`).join("");

    const used = new Set(state.found.flatMap(g=>g.words));
    $("grid").innerHTML = "";

    state.words.filter(w=>!used.has(w)).forEach(w=>{
      const t = document.createElement("div");
      t.className = "tile"+(state.selected.includes(w)?" sel":"");
      t.textContent = w;
      t.onclick = ()=>{
        if(state.done) return;
        const i = state.selected.indexOf(w);
        i>=0 ? state.selected.splice(i,1) :
          state.selected.length<4 && state.selected.push(w);
        state.msg="";
        save(k,state); render();
      };
      $("grid").appendChild(t);
    });

    $("submitBtn").disabled = state.selected.length!==4 || state.done;
  }

  $("submitBtn").onclick = ()=>{
    if(state.done) return;

    const s = state.selected.slice().sort().join("|");
    const m = state.puzzle.groups.find(
      g=>g.words.slice().sort().join("|")===s
    );

    if(m){
      state.found.push(m);
      state.msg="✅ Groupe trouvé";
      state.selected=[];
      if(state.found.length===4){
        state.done=true;
        state.msg="🎉 Bravo !";
      }
    } else {
      state.mistakes++;
      state.msg = overlapMsg(state.puzzle,state.selected,state.found);
      state.selected=[];
      if(state.mistakes>=4){
        state.done=true;
        revealAll(state);
        state.msg="⛔ 4 erreurs. Voici les solutions.";
      }
    }
    save(k,state); render();
  };

  $("shuffleBtn").onclick=()=>{
    if(state.done) return;
    state.words = shuffle(state.words);
    save(k,state); render();
  };

  $("deselectBtn").onclick=()=>{
    state.selected=[]; state.msg="";
    save(k,state); render();
  };

  $("resetBtn").onclick=()=>{
    localStorage.removeItem(k);
    location.reload();
  };

  $("newPuzzleBtn").onclick=()=>{
    setParams(d,n+1);
    location.reload();
  };

  $("shareBtn").onclick=async ()=>{
    const url = location.href;
    if(navigator.share){
      await navigator.share({title:"Connections FR",url});
    } else {
      navigator.clipboard.writeText(url);
      state.msg="Lien copié";
    }
  };

  render();
}

init();
