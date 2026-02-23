import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nhrsomjlltxldpzdntsu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ocnNvbWpsbHR4bGRwemRudHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTg4NDEsImV4cCI6MjA4NzI3NDg0MX0.EJ16zCQdusouJMcgMrEGScKbx0Z8Oxuwxwhnutg1Pv8"
);

const REGLES_CATEGORIE = [
  { categorie: "Gardien", mots: ["gardien", "concierge", "bulletin de paie", "bulletin paie", "paie gardien", "salaire", "urssaf", "conges payes", "congés payés", "medecine du travail", "médecine du travail"] },
  { categorie: "Gaz", mots: ["gaz", "grdf", "engie gaz", "primagaz", "antargaz", "butagaz"] },
  { categorie: "Electricité", mots: ["electricite", "électricité", "electrique", "électrique", "edf", "enedis", "courant", "eclairage", "éclairage"] },
  { categorie: "Eau", mots: ["eau potable", "veolia", "saur", "suez eau", "lyonnaise", "consommation eau", "facture eau"] },
  { categorie: "Compteur eau", mots: ["compteur eau", "compteur d'eau", "relevé compteur", "releve compteur", "albasini"] },
  { categorie: "Syndic", mots: ["syndic", "foncia", "nexity", "gestimmo", "loiselet", "cabinet", "honoraires syndic", "frais syndic"] },
  { categorie: "Assurance", mots: ["assurance", "axa", "mma", "allianz", "groupama", "covea", "maif", "pacifica", "prime assurance", "contrat assurance"] },
  { categorie: "Plomberie", mots: ["plomberie", "plombier", "canalisation", "fuite", "robinet", "chaudiere", "chaudière", "chauffage", "radiateur"] },
  { categorie: "Menuiserie", mots: ["menuiserie", "menuisier", "porte", "fenetre", "fenêtre", "vitrage", "vitre", "volet"] },
  { categorie: "Serrurerie", mots: ["serrurerie", "serrurier", "serrure", "verrou", "interphone", "digicode", "badge"] },
  { categorie: "Deratisation", mots: ["deratisation", "dératisation", "nuisibles", "desinsectisation", "désinsectisation", "cafards", "rats", "souris", "punaises"] },
  { categorie: "Porte Parking", mots: ["parking", "porte parking", "portail", "barriere", "barrière", "telecommande", "télécommande", "motorisation"] },
];

function devinerCategorie(label) {
  if (!label) return "Autre";
  const norm = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const { categorie, mots } of REGLES_CATEGORIE) {
    for (const mot of mots) {
      const motNorm = mot.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (norm.includes(motNorm)) return categorie;
    }
  }
  return "Autre";
}

const { data: depenses, error } = await supabase
  .from("depenses")
  .select("id, label, categorie")
  .eq("categorie", "Autre");

if (error) { console.error("Erreur fetch:", error.message); process.exit(1); }

console.log(`${depenses.length} dépenses en "Autre" trouvées.\n`);

let reclassifiees = 0;
for (const d of depenses) {
  const nouvelleCat = devinerCategorie(d.label);
  if (nouvelleCat !== "Autre") {
    const { error: err } = await supabase.from("depenses").update({ categorie: nouvelleCat }).eq("id", d.id);
    if (err) {
      console.log(`  ❌ ${d.label} → erreur: ${err.message}`);
    } else {
      console.log(`  ✅ "${d.label}" → ${nouvelleCat}`);
      reclassifiees++;
    }
  } else {
    console.log(`  — "${d.label}" → reste Autre`);
  }
}

console.log(`\nTerminé : ${reclassifiees} dépense(s) reclassifiée(s).`);
