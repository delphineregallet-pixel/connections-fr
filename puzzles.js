/* puzzles.js — Connections FR (365 jours)
   Génération automatique d’un puzzle par jour
   Stable, offline, sans serveur
*/

(function () {

  const BANK = [
    { label: "Oiseaux", words: ["MERLE","MOINEAU","HIRONDELLE","PIGEON","CORBEAU","MOUETTE","CANARD","PIE","HIBOU","AIGLE"] },
    { label: "Fruits", words: ["POMME","POIRE","BANANE","CERISE","RAISIN","ABRICOT","FIGUE","MANGUE","ORANGE","CITRON"] },
    { label: "Légumes", words: ["CAROTTE","TOMATE","COURGETTE","AUBERGINE","POIVRON","CONCOMBRE","BROCOLI","CHOU","RADIS","ÉPINARD"] },
    { label: "Poissons", words: ["SAUMON","THON","SARDINE","TRUITE","CARPE","CABILLAUD","MAQUEREAU","BAR","SOLE","RAIE"] },
    { label: "Couleurs", words: ["BLEU","VERT","ROUGE","JAUNE","ROSE","ORANGE","VIOLET","GRIS","NOIR","BLANC"] },
    { label: "Temps", words: ["PLUIE","VENT","ORAGE","BROUILLARD","NEIGE","GRÊLE","CANICULE","GEL","BRISE","AVERSÉE"] },
    { label: "Informatique", words: ["CLAVIER","SOURIS","ÉCRAN","DOSSIER","FICHIER","ONGLET","NAVIGATEUR","RÉSEAU","SERVEUR","CAPTEUR"] },
    { label: "Cuisine", words: ["FOURCHETTE","CUILLÈRE","COUTEAU","ASSIETTE","VERRE","BOL","POÊLE","NAPPE","SPATULE","LOUCHE"] },
    { label: "Pâtisserie", words: ["FARINE","SUCRE","BEURRE","ŒUF","LEVURE","VANILLE","CHOCOLAT","CRÈME","GLAÇAGE","PÂTE"] },
    { label: "Boissons", words: ["CAFÉ","THÉ","JUS","EAU","SODA","SIROP","INFUSION","SMOOTHIE","LAIT","LIMONADE"] },
    { label: "Musique", words: ["PIANO","GUITARE","VIOLON","BATTERIE","FLÛTE","SAXOPHONE","TROMPETTE","BASSE","MICRO","AMPLI"] },
    { label: "Cinéma", words: ["SALLE","PROJECTEUR","GÉNÉRIQUE","RÉALISATEUR","ACTEUR","SCÉNARIO","CASTING","AFFICHE","PLAN","MONTAGE"] },
    { label: "Lecture", words: ["ROMAN","CHAPITRE","PAGE","COUVERTURE","AUTEUR","INTRIGUE","PERSONNAGE","BIBLIOTHÈQUE","PROLOGUE","ÉDITION"] },
    { label: "École", words: ["CAHIER","STYLO","CRAYON","GOMME","RÈGLE","TROUSSE","TABLEAU","DICTÉE","LEÇON","EXAMEN"] },
    { label: "Maison", words: ["SALON","CUISINE","CHAMBRE","COULOIR","GARAGE","JARDIN","CAVE","BALCON","TOIT","ESCALIER"] },
    { label: "Vêtements", words: ["CHEMISE","PANTALON","JUPE","ROBE","MANTEAU","VESTE","PULL","ÉCHARPE","CHAUSSETTE","CEINTURE"] },
    { label: "Chaussures", words: ["BASKETS","BOTTINES","ESCARPINS","MOCASSINS","SANDALES","BALLERINES","DERBIES","RANGERS","CHAUSSONS","ESPADRILLES"] },
    { label: "Bijoux", words: ["BAGUE","BRACELET","COLLIER","CHAÎNE","BROCHE","JONC","ALLIANCE","PENDENTIF","PERLE","DIAMANT"] },
    { label: "Sports", words: ["FOOT","TENNIS","RUGBY","NATATION","COURSE","SKI","JUDO","BOXE","VÉLO","BASKET"] },
    { label: "Transports", words: ["MÉTRO","BUS","TRAM","TRAIN","AVION","TAXI","VÉLO","BATEAU","VOITURE","MOTO"] },
    { label: "Ville", words: ["RUE","PLACE","FEU","TROTTOIR","MAIRIE","MUSÉE","CAFÉ","PARC","PONT","BOULEVARD"] },
    { label: "Voyage", words: ["VALISE","PASSEPORT","BILLET","HÔTEL","CARTE","GUIDE","DOUANE","EXCURSION","SOUVENIR","RÉSERVATION"] },
    { label: "Émotions", words: ["JOIE","TRISTESSE","COLÈRE","PEUR","SURPRISE","HONT E".replace(" ",""),"FIERTÉ","NOSTALGIE","ESPOIR","ENVIE"] },
    { label: "Corps", words: ["TÊTE","COU","ÉPAULE","BRAS","MAIN","DOIGT","JAMBE","PIED","DOS","GENOU"] },
    { label: "Animaux", words: ["CHIEN","CHAT","CHEVAL","VACHE","MOUTON","LAPIN","RENARD","OURS","LOUP","DAUPHIN"] },
    { label: "Insectes", words: ["ABEILLE","GUÊPE","MOUCHE","MOUSTIQUE","FOURMI","PAPILLON","COCCINELLE","LIBELLULE","PUCE","SCARABÉE"] },
    { label: "Arbres", words: ["CHÊNE","PIN","SAPIN","BOULEAU","OLIVIER","PLATANE","SAULE","PEUPLIER","CYPRÈS","NOISETIER"] },
    { label: "Fleurs", words: ["ROSE","TULIPE","LILAS","IRIS","PIVOINE","MUGUET","JASMIN","ORCHIDÉE","MARGUERITE","LAVANDE"] },
    { label: "Jeux", words: ["ÉCHECS","DAMES","CARTES","DÉS","PUZZLE","DOMINOS","UNO","SCRABBLE","MONOPOLY","MORPION"] },
    { label: "Internet", words: ["EMAIL","LIEN","PUB","COOKIE","POST","COMMENTAIRE","ABONNÉ","HASHTAG","STREAM","CLOUD"] }
  ];

  function rng(seed) {
    let x = seed;
    return () => {
      x ^= x << 13;
      x ^= x >> 17;
      x ^= x << 5;
      return (x >>> 0) / 4294967296;
    };
  }

  function dayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  function generate(date) {
    const seed = date.getFullYear() * 1000 + dayOfYear(date);
    const rand = rng(seed);

    const cats = [];
    while (cats.length < 4) {
      const c = BANK[Math.floor(rand() * BANK.length)];
      if (!cats.includes(c)) cats.push(c);
    }

    const used = new Set();
    const groups = cats.map(c => {
      const w = [];
      while (w.length < 4) {
        const word = c.words[Math.floor(rand() * c.words.length)];
        if (!w.includes(word) && !used.has(word)) {
          w.push(word);
          used.add(word);
        }
      }
      return { label: c.label, words: w };
    });

    return {
      id: date.toISOString().slice(0,10),
      groups
    };
  }

  window.getPuzzleForToday = function () {
    return generate(new Date());
  };

})();
