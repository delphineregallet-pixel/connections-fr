(function () {
  // Catégories plus piégeuses (mots “à double lecture”, objets/fonctions, préfixes, etc.)
  // On garde 4 groupes de 4, avec un peu de “faux amis” sans empêcher la solution unique.
  const BANK = [
    { label: "Peut être 'chargé'", words: ["TÉLÉPHONE","CAMION","DOSSIER","ARME","ACCUSATION","BAGAGE","BATTERIE","CARTE","COMPTE","HISTOIRE"] },
    { label: "En ligne", words: ["BANQUE","TRAIN","ARTICLE","JEU","FACTURE","BILLET","RECETTE","COURS","SÉRIE","COMMANDE"] },
    { label: "Fait un 'clic'", words: ["SOURIS","APPAREIL PHOTO","STYLO","PIÈGE","CLAPET","BOUTON","SÉCURITÉ","COMPTEUR","TÉLÉCOMMANDE","STAPLER"] },
    { label: "Peut être 'à plat'", words: ["PNEU","BATTERIE","MER","SODA","TARTE","VOIX","LUMIÈRE","VENT","CHAMPAGNE","DOS"] },

    { label: "Préfixes courants", words: ["TÉLÉ","AUTO","MICRO","PHOTO","BIO","HYPER","SUPER","MÉGA","MULTI","INTER"] },
    { label: "Suffixes courants", words: ["-LOGIE","-PHOBIE","-PHILE","-SCOPE","-MÈTRE","-GÈNE","-GONE","-CIDE","-CRATE","-THÈQUE"] },

    { label: "Synonymes de 'rapide'", words: ["VIF","PROMPT","EXPRESS","FLASH","FUSÉE","ÉCLAIR","PRESSÉ","HÂTIF","AGILE","NERVEUX"] },
    { label: "Synonymes de 'calme'", words: ["ZEN","POSÉ","SEREIN","DOUX","TRANQUILLE","PAISIBLE","ASSAGI","LENT","CALME","MUET"] },

    { label: "Peut être 'clé'", words: ["SOLUTION","SERRURE","MUSIQUE","RÉPONSE","CARTE","CODE","INDICE","PORTAIL","ACCÈS","SECRET"] },
    { label: "Peut être 'banc'", words: ["POISSON","MEUBLE","ÉCOLE","SABLE","BRUME","BANQUE","FLEUVE","PARC","TRIBUNE","ÉGLISE"] },

    { label: "Autour d'un procès", words: ["JUGE","AVOCAT","TÉMOIN","VERDICT","DOSSIER","APPEL","LOI","JURY","PLAIDOIRIE","TRIBUNAL"] },
    { label: "Au restaurant", words: ["MENU","ADDITION","SERVIETTE","VERRE","ASSIETTE","CUILLÈRE","FOURCHETTE","NAPPE","POURBOIRE","RÉSERVATION"] },

    { label: "Peut être 'source'", words: ["RIVIÈRE","ARTICLE","INFO","BUG","ÉNERGIE","ORIGINE","CITATION","DONNÉE","PHOTO","RÉFÉRENCE"] },
    { label: "Peut être 'plan'", words: ["CARTE","STRATÉGIE","DESSIN","PROJET","ÉTAGE","CINÉMA","SCHÉMA","PLANNING","PROGRAMME","FEUILLE"] },

    { label: "Se ferme", words: ["PORTE","ZIP","SESSION","ONGLET","DÉBAT","BOUTEILLE","Dossier".toUpperCase(),"COMPTE","VALISE","RIDEAU"] },
    { label: "Se 'lance'", words: ["DÉFI","PROJET","FUSÉE","APPLICATION","SÉRIE","CAMPAGNE","MOTEUR","TENDANCE","RUMEUR","PROCÉDURE"] }
  ];

  function rng32(seed) {
    let x = seed | 0;
    return function () {
      x ^= x << 13; x |= 0;
      x ^= x >>> 17; x |= 0;
      x ^= x << 5; x |= 0;
      return (x >>> 0) / 4294967296;
    };
  }

  function dayOfYearUTC(d) {
    const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const start = new Date(Date.UTC(d.getFullYear(), 0, 1));
    return Math.floor((dt - start) / 86400000); // 0..365
  }

  function pickUnique(rand, n, max) {
    const s = new Set();
    while (s.size < n) s.add(Math.floor(rand() * max));
    return [...s];
  }

  function pick4(rand, arr, used) {
    const out = [];
    let guard = 0;
    while (out.length < 4 && guard++ < 200) {
      const w = arr[Math.floor(rand() * arr.length)];
      if (!out.includes(w) && !used.has(w)) out.push(w);
    }
    // dernier recours
    if (out.length < 4) {
      for (const w of arr) if (!out.includes(w)) out.push(w);
      out.length = 4;
    }
    out.forEach(w => used.add(w));
    return out;
  }

  function generate(date, puzzleNumber) {
    const doy = dayOfYearUTC(date) % 365;
    const n = Math.max(1, (puzzleNumber|0) || 1);

    // seed: stable par jour, et variant selon puzzle # (pour en faire plusieurs)
    const seed = (date.getFullYear() * 100000 + doy * 100 + (n % 100)) | 0;
    const rand = rng32(seed);

    const catIdx = pickUnique(rand, 4, BANK.length);
    const cats = catIdx.map(i => BANK[i]);

    const used = new Set();
    const groups = cats.map(c => ({
      label: c.label,
      words: pick4(rand, c.words, used)
    }));

    return {
      id: `${date.toISOString().slice(0,10)}#${n}`,
      groups
    };
  }

  window.getPuzzleFor = function (date, puzzleNumber) {
    return generate(date, puzzleNumber);
  };

  window.getPuzzleForToday = function () {
    return generate(new Date(), 1);
  };
})();
