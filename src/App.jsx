import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const COLORS = {
  bg: "#F7F5F0",
  surface: "#FFFFFF",
  primary: "#1A3A2A",
  accent: "#4CAF7D",
  accentLight: "#E8F5EE",
  text: "#1A1A1A",
  textMuted: "#6B7280",
  border: "#E5E0D8",
  danger: "#E53935",
  warning: "#F59E0B",
  info: "#3B82F6",
};

const BUDGET_ANNUEL = 180000;
const BUDGET_MENSUEL = BUDGET_ANNUEL / 12; // 15 000 €/mois
const MOIS_LABELS = { "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr", "05": "Mai", "06": "Jun", "07": "Jul", "08": "Aoû", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc" };

// ─── Mini Bar Chart ────────────────────────────────────────────────────
const PIE_COLORS = ["#4CAF7D", "#3B82F6", "#F59E0B", "#E53935", "#A78BFA"];

function PieChart({ data }) {
  if (!data || data.length === 0) return <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Aucune donnée</div>;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Aucune donnée</div>;

  const r = 75, cx = 80, cy = 80;
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const a = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += a;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = a > Math.PI ? 1 : 0;
    return { path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, color: PIE_COLORS[i % PIE_COLORS.length], ...d };
  });

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
      <svg width={160} height={160} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth={2} />)}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 600 }}>{d.label}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{Math.round((d.value / total) * 100)}% · {Math.round(d.value).toLocaleString("fr-FR")} €</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: COLORS.surface, borderRadius: 16, padding: "20px", border: `1px solid ${COLORS.border}`, cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}

function Badge({ label, color }) {
  const map = { Ouvert: COLORS.info, "En cours": COLORS.warning, Résolu: COLORS.accent, Terminé: COLORS.textMuted, Termine: COLORS.textMuted, Haute: COLORS.danger, Moyenne: COLORS.warning, Faible: COLORS.accent };
  const c = map[label] || color || COLORS.accent;
  return <span style={{ background: c + "22", color: c, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{label}</span>;
}

function SectionTitle({ title }) {
  return <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", fontWeight: 700, color: COLORS.primary, marginBottom: 20, letterSpacing: "-0.01em" }}>{title}</h2>;
}

function Spinner() {
  return <div style={{ textAlign: "center", padding: 40, color: COLORS.textMuted, fontSize: 14 }}>Chargement...</div>;
}

// ─── LOGIN ─────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [nom, setNom] = useState("");
  const [lot, setLot] = useState("");

  const handle = async () => {
    setLoading(true);
    setError("");
    if (isRegister) {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from("residents").insert({ id: data.user.id, nom, lot });
      }
      setError("Compte créé ! Vérifiez votre email pour confirmer.");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError("Email ou mot de passe incorrect.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${COLORS.border}`,
    fontSize: 15, outline: "none", boxSizing: "border-box", background: COLORS.bg, marginBottom: 12,
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: COLORS.surface, borderRadius: 24, padding: 32, width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏢</div>
          <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 24, color: COLORS.primary, fontWeight: 700, marginBottom: 4 }}>Residence Inkerman</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14 }}>Espace copropriétaires</p>
        </div>

        {isRegister && (
          <>
            <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom complet" style={inputStyle} />
            <input value={lot} onChange={e => setLot(e.target.value)} placeholder="Votre lot (ex: Lot 12)" style={inputStyle} />
          </>
        )}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" type="password" style={inputStyle} />

        {error && <div style={{ color: COLORS.danger, fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</div>}

        <button
          onClick={handle}
          disabled={loading}
          style={{ width: "100%", padding: 16, background: COLORS.primary, color: "white", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}
        >
          {loading ? "..." : isRegister ? "Créer mon compte" : "Se connecter"}
        </button>

        <div style={{ textAlign: "center" }}>
          <button onClick={() => setIsRegister(!isRegister)} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
            {isRegister ? "Déjà un compte ? Se connecter" : "Créer un compte"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────
function Dashboard({ setPage, user, resident }) {
  const [depenses, setDepenses] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [d, t, v] = await Promise.all([
        supabase.from("depenses").select("*").order("date", { ascending: false }),
        supabase.from("tickets").select("*").order("created_at", { ascending: false }),
        supabase.from("votes").select("*"),
      ]);
      setDepenses(d.data || []);
      setTickets(t.data || []);
      setVotes(v.data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  const moisCourant = new Date().toISOString().slice(0, 7);
  const annee = moisCourant.split("-")[0];
  const numMois = parseInt(moisCourant.split("-")[1]);

  const totalMois = depenses.filter(d => d.date?.startsWith(moisCourant)).reduce((s, d) => s + Number(d.montant), 0);
  const ecartMois = totalMois - BUDGET_MENSUEL;
  const totalAnnee = depenses.filter(d => d.date?.startsWith(annee)).reduce((s, d) => s + Number(d.montant), 0);
  const budgetEcoule = BUDGET_MENSUEL * numMois;
  const pctBudget = budgetEcoule > 0 ? Math.min(Math.round((totalAnnee / budgetEcoule) * 100), 100) : 0;

  const ticketsOuverts = tickets.filter(t => t.statut !== "Résolu" && t.statut !== "Resolu").length;
  const votesEnCours = votes.filter(v => v.statut === "En cours").length;

  const depensesAnnee = depenses.filter(d => d.date?.startsWith(annee));
  const parCategorie = depensesAnnee.reduce((acc, d) => {
    acc[d.categorie] = (acc[d.categorie] || 0) + Number(d.montant);
    return acc;
  }, {});
  const triees = Object.entries(parCategorie).sort((a, b) => b[1] - a[1]);
  const top3 = triees.slice(0, 3).map(([label, value]) => ({ label, value }));
  const autresTotal = triees.slice(3).reduce((s, [, v]) => s + v, 0);
  const pieData = autresTotal > 0 ? [...top3, { label: "Autres", value: autresTotal }] : top3;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: 26, color: COLORS.primary, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>{resident?.nom || user.email}</h1>
        {resident?.lot && <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 600 }}>{resident.lot}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Depuis Janvier", value: `${Math.round(totalAnnee).toLocaleString("fr-FR")} €`, sub: `${(totalAnnee - budgetEcoule) > 0 ? "+" : ""}${Math.round(totalAnnee - budgetEcoule).toLocaleString("fr-FR")} € vs budget`, color: (totalAnnee - budgetEcoule) > 0 ? COLORS.danger : COLORS.accent, action: "charges" },
          { label: "Tickets ouverts", value: ticketsOuverts, sub: "signalements actifs", color: COLORS.warning, action: "tickets" },
          { label: "Votes en cours", value: votesEnCours, sub: "en attente de vote", color: COLORS.info, action: "votes" },
          { label: "Documents", value: "📄", sub: "accéder aux docs", color: COLORS.primary, action: "documents" },
        ].map((k) => (
          <Card key={k.label} onClick={() => setPage(k.action)}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</div>
            <div style={{ fontSize: 28, fontFamily: "'Georgia', serif", fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 17, fontFamily: "serif", marginBottom: 12 }}>Budget {annee}</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Annuel</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.primary, fontFamily: "serif" }}>{BUDGET_ANNUEL.toLocaleString("fr-FR")} €</div>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>
          Consommé depuis janv. :{" "}
          <strong style={{ color: totalAnnee > BUDGET_ANNUEL ? COLORS.danger : COLORS.text }}>{Math.round(totalAnnee).toLocaleString("fr-FR")} €</strong>
          {" "}/ {BUDGET_ANNUEL.toLocaleString("fr-FR")} €
        </div>
        <div style={{ height: 8, borderRadius: 4, background: COLORS.border, overflow: "hidden", marginBottom: 4 }}>
          <div style={{ height: "100%", width: `${Math.min(Math.round((totalAnnee / BUDGET_ANNUEL) * 100), 100)}%`, background: totalAnnee > BUDGET_ANNUEL ? COLORS.danger : COLORS.accent, borderRadius: 4 }} />
        </div>
        <div style={{ fontSize: 11, color: totalAnnee > BUDGET_ANNUEL ? COLORS.danger : COLORS.textMuted, textAlign: "right" }}>
          {Math.min(Math.round((totalAnnee / BUDGET_ANNUEL) * 100), 100)}% du budget annuel consommé
        </div>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 17, fontFamily: "serif", marginBottom: 16 }}>Répartition</div>
        <PieChart data={pieData} />
      </Card>

    </div>
  );
}

// ─── HELPER : label ressemble à un nom de fichier ? ───────────────────
function nomEstFichier(label) {
  if (!label) return false;
  const s = label.trim();
  // Ex : P.915349.1, P.916624, ou purement numérique ≥ 5 chiffres
  return /^P\.\d+(\.\d+)*$/.test(s) || /^\d{5,}$/.test(s);
}

// ─── POPUP SAISIE (montant + nom fournisseur) ──────────────────────────
function PopupSaisie({ depense, onSave, onClose }) {
  const labelManquant = nomEstFichier(depense.label);
  const [montant, setMontant] = useState(depense.montant > 0 ? String(depense.montant) : "");
  const [label, setLabel] = useState(labelManquant ? "" : depense.label);
  const [categorie, setCategorie] = useState(depense.categorie || "Autre");
  const [saving, setSaving] = useState(false);

  const categorieDevinee = devinerCategorie(label);
  const categorieAutoDisponible = label.trim() && categorieDevinee !== "Autre" && categorieDevinee !== categorie;

  const montantVal = parseFloat(montant.replace(",", "."));
  const peutSauver = (montantVal > 0) || (labelManquant && label.trim().length > 0);

  const sauvegarder = async () => {
    if (!peutSauver) return;
    setSaving(true);
    const updates = {};
    if (montantVal > 0) updates.montant = montantVal;
    if (labelManquant && label.trim()) updates.label = label.trim();
    if (categorie !== depense.categorie) updates.categorie = categorie;
    await supabase.from("depenses").update(updates).eq("id", depense.id);
    setSaving(false);
    onSave();
  };

  const isPdf = depense.facture_url?.toLowerCase().includes(".pdf");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: 0 }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 480, background: COLORS.primary, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{depense.label}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{depense.date} · {depense.categorie}</div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: 32, height: 32, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>

      {/* Visionneuse PDF / image */}
      <div style={{ width: "100%", maxWidth: 480, flex: 1, overflow: "hidden", background: "#111", minHeight: 0 }}>
        {depense.facture_url ? (
          isPdf ? (
            <iframe src={depense.facture_url} title="Facture" style={{ width: "100%", height: "100%", border: "none", minHeight: 360 }} />
          ) : (
            <img src={depense.facture_url} alt="Facture" style={{ width: "100%", maxHeight: 420, objectFit: "contain" }} />
          )
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#888", fontSize: 14 }}>
            Aucune facture attachée
          </div>
        )}
      </div>

      {/* Saisie */}
      <div style={{ width: "100%", maxWidth: 480, background: COLORS.surface, padding: 16, borderTop: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        {depense.facture_url && (
          <a href={depense.facture_url} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 12, color: COLORS.accent, marginBottom: 12, fontWeight: 600, textDecoration: "none" }}>
            ↗ Ouvrir dans un nouvel onglet
          </a>
        )}

        {/* Champ nom fournisseur (si label = nom de fichier) */}
        {labelManquant && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 6, fontWeight: 600 }}>Nom du fournisseur :</div>
            <input
              value={label}
              onChange={e => { const v = e.target.value; setLabel(v); const cat = devinerCategorie(v); if (cat !== "Autre") setCategorie(cat); }}
              placeholder="Ex : EDF, Albasini, URSSAF…"
              autoFocus
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `2px solid ${COLORS.warning}`, fontSize: 15, fontWeight: 600, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        )}

        {/* Catégorie */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 6, fontWeight: 600 }}>Catégorie :</div>
          {categorieAutoDisponible && (
            <button
              onClick={() => setCategorie(categorieDevinee)}
              style={{ display: "block", width: "100%", marginBottom: 8, padding: "8px 12px", background: COLORS.accentLight, border: `1px solid ${COLORS.accent}`, borderRadius: 10, fontSize: 13, color: COLORS.accent, fontWeight: 700, cursor: "pointer", textAlign: "left" }}
            >
              ✨ Utiliser "{categorieDevinee}" (détecté automatiquement)
            </button>
          )}
          <select
            value={categorie}
            onChange={e => setCategorie(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 14, outline: "none" }}
          >
            {CATEGORIES.filter(c => c !== "Tout").map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Champ montant */}
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8, fontWeight: 600 }}>
          {depense.montant > 0 ? "Corriger le montant :" : "Saisir le montant total TTC :"}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={montant}
            onChange={e => setMontant(e.target.value)}
            placeholder="Ex : 528,00"
            type="number"
            step="0.01"
            autoFocus={!labelManquant}
            style={{ flex: 1, padding: "14px 16px", borderRadius: 12, border: `2px solid ${COLORS.accent}`, fontSize: 18, fontWeight: 700, outline: "none", textAlign: "right" }}
          />
          <span style={{ display: "flex", alignItems: "center", fontSize: 18, fontWeight: 700, color: COLORS.primary }}>€</span>
          <button
            onClick={sauvegarder}
            disabled={saving || !peutSauver}
            style={{ padding: "14px 20px", background: COLORS.primary, color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: saving || !peutSauver ? 0.5 : 1 }}
          >
            {saving ? "..." : "✓"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHARGES ───────────────────────────────────────────────────────────
const CATEGORIES = ["Tout", "Gaz", "Electricité", "Eau", "Gardien", "Syndic", "Assurance", "Plomberie", "Menuiserie", "Deratisation", "Serrurerie", "Porte Parking", "Ascenseur", "Jardinage", "Impôts", "Autre"];

const REGLES_CATEGORIE = [
  { categorie: "Gardien", mots: ["gardien", "concierge", "bulletin de paie", "bulletin paie", "paie gardien", "salaire", "urssaf", "conges payes", "congés payés", "medecine du travail", "médecine du travail", "formation"] },
  { categorie: "Gaz", mots: ["gaz", "grdf", "engie gaz", "primagaz", "antargaz", "butagaz"] },
  { categorie: "Electricité", mots: ["electricite", "électricité", "electrique", "électrique", "edf", "enedis", "courant", "eclairage", "éclairage"] },
  { categorie: "Eau", mots: ["eau potable", "veolia", "saur", "suez eau", "lyonnaise", "consommation eau", "facture eau", "ocea", "ocea smart building", "compteur eau", "compteur d'eau", "relevé compteur", "releve compteur", "albasini"] },
  { categorie: "Syndic", mots: ["syndic", "foncia", "nexity", "gestimmo", "loiselet", "cabinet", "honoraires syndic", "frais syndic"] },
  { categorie: "Assurance", mots: ["assurance", "axa", "mma", "allianz", "groupama", "covea", "maif", "pacifica", "prime assurance", "contrat assurance"] },
  { categorie: "Plomberie", mots: ["plomberie", "plombier", "canalisation", "fuite", "robinet", "chaudiere", "chaudière", "chauffage", "radiateur"] },
  { categorie: "Menuiserie", mots: ["menuiserie", "menuisier", "porte", "fenetre", "fenêtre", "vitrage", "vitre", "volet"] },
  { categorie: "Serrurerie", mots: ["serrurerie", "serrurier", "serrure", "verrou", "interphone", "digicode", "badge"] },
  { categorie: "Deratisation", mots: ["deratisation", "dératisation", "nuisibles", "desinsectisation", "désinsectisation", "cafards", "rats", "souris", "punaises"] },
  { categorie: "Porte Parking", mots: ["parking", "porte parking", "portail", "barriere", "barrière", "telecommande", "télécommande", "motorisation"] },
  { categorie: "Ascenseur", mots: ["ascenseur", "otis", "schindler", "kone", "thyssenkrupp", "lift", "monte-charge"] },
  { categorie: "Jardinage", mots: ["jardinage", "jardinier", "espaces verts", "espace vert", "nettoyage espaces verts", "taille", "tonte", "pelouse", "elagage", "élagage", "arbres"] },
  { categorie: "Impôts", mots: ["prelevement a la source", "prélèvement à la source", "impots", "impôts", "taxe fonciere", "taxe foncière", "dgfip", "tresor public", "trésor public"] },
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

async function extraireContactsFactures(nomFournisseur) {
  const { data: factures } = await supabase
    .from("depenses")
    .select("facture_url")
    .ilike("label", nomFournisseur)
    .not("facture_url", "is", null)
    .limit(3);

  if (!factures || factures.length === 0) return null;

  for (const { facture_url } of factures) {
    try {
      const resp = await fetch(facture_url);
      const blob = await resp.blob();
      const isPdf = blob.type === "application/pdf" || facture_url.toLowerCase().includes(".pdf");
      const base64 = await new Promise(res => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.readAsDataURL(blob);
      });

      const body = {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: [
            isPdf
              ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
              : { type: "image", source: { type: "base64", media_type: blob.type || "image/jpeg", data: base64 } },
            { type: "text", text: 'Extrais le numéro de téléphone et l\'email de ce document. Réponds UNIQUEMENT en JSON: {"telephone": "...", "email": "..."}. Si non trouvé, mets null.' }
          ]
        }]
      };

      const aiResp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-allow-browser": "true",
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const aiData = await aiResp.json();
      const text = aiData.content?.[0]?.text || "";
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.telephone || parsed.email) return parsed;
      }
    } catch { continue; }
  }
  return null;
}

async function syncFournisseur(label, categorie) {
  if (!label || nomEstFichier(label)) return;
  const nom = label.trim();
  const { data } = await supabase.from("fournisseurs").select("id").ilike("nom", nom).limit(1);
  if (!data || data.length === 0) {
    await supabase.from("fournisseurs").insert({ nom, categorie: categorie || "Autre" });
  }
}

function Charges() {
  const [depenses, setDepenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMassUpload, setShowMassUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [label, setLabel] = useState("");
  const [montant, setMontant] = useState("");
  const [categorie, setCategorie] = useState("Gaz");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fichier, setFichier] = useState(null);
  const [moisSelectionne, setMoisSelectionne] = useState("2026-01");
  const [fichiersSelectionnes, setFichiersSelectionnes] = useState([]);
  const [metadonnees, setMetadonnees] = useState([]);
  const [modeVue, setModeVue] = useState("annee");
  const [filtreCategorie, setFiltreCategorie] = useState("Tout");
  const [depenseACompleter, setDepenseACompleter] = useState(null);

  const load = async () => {
    const { data } = await supabase.from("depenses").select("*").order("date", { ascending: false });
    const depenses = data || [];
    setDepenses(depenses);
    setLoading(false);
    // Reclassification automatique silencieuse
    const aReclassifier = depenses.filter(d => d.categorie === "Autre" || d.categorie === "Compteur eau");
    if (aReclassifier.length > 0) {
      const updates = aReclassifier
        .map(d => {
          const cat = devinerCategorie(d.label);
          return { id: d.id, cat: (cat === "Autre" && d.categorie === "Compteur eau") ? "Eau" : cat };
        })
        .filter(u => u.cat !== "Autre");
      if (updates.length > 0) {
        await Promise.all(updates.map(u => supabase.from("depenses").update({ categorie: u.cat }).eq("id", u.id)));
        const { data: fresh } = await supabase.from("depenses").select("*").order("date", { ascending: false });
        setDepenses(fresh || []);
      }
    }
  };

  useEffect(() => { load(); }, []);

  const selectionnerFichiers = (e) => {
    const files = Array.from(e.target.files);
    setFichiersSelectionnes(files);
    setMetadonnees(files.map(f => {
      const nom = f.name.replace(/\.[^/.]+$/, "");
      return { nom, montant: "", categorie: devinerCategorie(nom), date: new Date().toISOString().split("T")[0] };
    }));
  };

  const massUpload = async () => {
    if (fichiersSelectionnes.length === 0) return;
    setUploading(true);
    const progress = fichiersSelectionnes.map(f => ({ nom: f.name, statut: "En attente" }));
    setUploadProgress([...progress]);
    for (let i = 0; i < fichiersSelectionnes.length; i++) {
      const fich = fichiersSelectionnes[i];
      const meta = metadonnees[i];
      progress[i].statut = "Upload...";
      setUploadProgress([...progress]);
      try {
        const nomFichier = `${Date.now()}_${fich.name}`;
        const { error: uploadError } = await supabase.storage.from("factures").upload(nomFichier, fich);
        let facture_url = null;
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("factures").getPublicUrl(nomFichier);
          facture_url = urlData.publicUrl;
        }
        await supabase.from("depenses").insert({ label: meta.nom, montant: Number(meta.montant) || 0, categorie: meta.categorie, date: meta.date, facture_url });
        await syncFournisseur(meta.nom, meta.categorie);
        progress[i].statut = "✅ OK";
      } catch { progress[i].statut = "❌ Erreur"; }
      setUploadProgress([...progress]);
    }
    setUploading(false);
    setFichiersSelectionnes([]);
    setMetadonnees([]);
    setTimeout(() => { setShowMassUpload(false); setUploadProgress([]); load(); }, 1500);
  };

  const ajouterDepense = async () => {
    if (!label.trim() || !montant) return;
    setUploading(true);
    let facture_url = null;
    if (fichier) {
      const nomFichier = `${Date.now()}_${fichier.name}`;
      const { error } = await supabase.storage.from("factures").upload(nomFichier, fichier);
      if (!error) {
        const { data: urlData } = supabase.storage.from("factures").getPublicUrl(nomFichier);
        facture_url = urlData.publicUrl;
      }
    }
    await supabase.from("depenses").insert({ label, montant: Number(montant), categorie, date, facture_url });
    await syncFournisseur(label, categorie);
    setLabel(""); setMontant(""); setCategorie("Gaz"); setDate(new Date().toISOString().split("T")[0]); setFichier(null);
    setShowForm(false); setUploading(false); load();
  };

  if (loading) return <Spinner />;

  const aCompleterCount = depenses.filter(d => (!d.montant || Number(d.montant) === 0) || nomEstFichier(d.label)).length;
  const annee = moisSelectionne.split("-")[0];
  const aujourd_hui = new Date().toISOString().split("T")[0];
  const depensesFiltrees = depenses.filter(d => {
    const bonMois = modeVue === "mois"
      ? d.date?.startsWith(moisSelectionne)
      : d.date?.startsWith(annee) && d.date <= aujourd_hui;
    const bonneCat = filtreCategorie === "Tout" || d.categorie === filtreCategorie;
    return bonMois && bonneCat;
  });
  const totalReel = depensesFiltrees.reduce((s, d) => s + Number(d.montant), 0);
  const moisEcoules = new Date().getMonth() + 1; // 1 = jan, 2 = fev, etc.
  const budgetPeriode = modeVue === "mois" ? BUDGET_MENSUEL : BUDGET_MENSUEL * moisEcoules;
  const ecart = totalReel - budgetPeriode;

  const moisChart = Array.from({ length: 6 }, (_, i) => `${annee}-${String(i + 1).padStart(2, "0")}`);
  const chartData = moisChart.map(mois => {
    const reel = depenses.filter(d => d.date?.startsWith(mois) && (filtreCategorie === "Tout" || d.categorie === filtreCategorie)).reduce((s, d) => s + Number(d.montant), 0);
    return { mois: MOIS_LABELS[mois.split("-")[1]], budget: BUDGET_MENSUEL, reel };
  });

  const inputStyle = { width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" };

  return (
    <div>
      {depenseACompleter && (
        <PopupSaisie
          depense={depenseACompleter}
          onClose={() => setDepenseACompleter(null)}
          onSave={() => { setDepenseACompleter(null); load(); }}
        />
      )}

      <SectionTitle title="Charges & Dépenses" />

      {aCompleterCount > 0 && (
        <div
          onClick={() => {
            const first = depenses.find(d => (!d.montant || Number(d.montant) === 0) || nomEstFichier(d.label));
            if (first) setDepenseACompleter(first);
          }}
          style={{ background: "#fffbeb", border: `1px solid ${COLORS.warning}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.warning }}>{aCompleterCount} facture{aCompleterCount > 1 ? "s" : ""} à compléter</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>Toucher pour saisir les informations manquantes</div>
          </div>
          <span style={{ color: COLORS.warning, fontSize: 18 }}>›</span>
        </div>
      )}

<div style={{ background: COLORS.accentLight, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: COLORS.primary }}>Budget <strong>{annee}</strong></div>
        <div style={{ fontSize: 13, color: COLORS.accent, fontWeight: 700 }}>{BUDGET_MENSUEL.toLocaleString("fr-FR")} €/mois · {BUDGET_ANNUEL.toLocaleString("fr-FR")} €/an</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["annee", "mois"].map(m => (
          <button key={m} onClick={() => setModeVue(m)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${modeVue === m ? COLORS.accent : COLORS.border}`, background: modeVue === m ? COLORS.accentLight : COLORS.surface, color: modeVue === m ? COLORS.accent : COLORS.textMuted, fontWeight: modeVue === m ? 700 : 400, fontSize: 13, cursor: "pointer" }}>
            {m === "mois" ? "📅 Par mois" : "📆 Depuis janvier"}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, width: "max-content" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFiltreCategorie(c)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filtreCategorie === c ? COLORS.accent : COLORS.border}`, background: filtreCategorie === c ? COLORS.accentLight : COLORS.surface, color: filtreCategorie === c ? COLORS.accent : COLORS.textMuted, fontWeight: filtreCategorie === c ? 700 : 400, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {modeVue === "mois" && (
        <div style={{ marginBottom: 16 }}>
          <select value={moisSelectionne} onChange={e => setMoisSelectionne(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 14, outline: "none", background: COLORS.surface }}>
            {Array.from({ length: 12 }, (_, i) => {
              const m = `${annee}-${String(i + 1).padStart(2, "0")}`;
              const [anneeOpt, moisOpt] = m.split("-");
              const nomMois = { "01": "Janvier", "02": "Février", "03": "Mars", "04": "Avril", "05": "Mai", "06": "Juin", "07": "Juillet", "08": "Août", "09": "Septembre", "10": "Octobre", "11": "Novembre", "12": "Décembre" };
              return <option key={m} value={m}>{nomMois[moisOpt]} {anneeOpt}</option>;
            })}
          </select>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Réel", value: `${Math.round(totalReel).toLocaleString("fr-FR")} €`, color: ecart > 0 ? COLORS.danger : COLORS.accent },
          { label: "Budget", value: `${Math.round(budgetPeriode).toLocaleString("fr-FR")} €`, color: COLORS.textMuted },
          { label: "Écart", value: `${ecart > 0 ? "+" : ""}${Math.round(ecart).toLocaleString("fr-FR")} €`, color: ecart > 0 ? COLORS.danger : COLORS.accent },
        ].map((k) => (
          <Card key={k.label} style={{ textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontFamily: "serif", fontWeight: 700, color: k.color }}>{k.value}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 17, fontFamily: "serif", marginBottom: 12 }}>
          {modeVue === "mois" ? `Budget — ${moisSelectionne}` : `Budget YTD — ${annee}`}
          {filtreCategorie !== "Tout" ? ` · ${filtreCategorie}` : ""}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Réel</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: totalReel > budgetPeriode ? COLORS.danger : COLORS.accent, fontFamily: "serif" }}>{Math.round(totalReel).toLocaleString("fr-FR")} €</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{modeVue === "mois" ? "Budget mensuel" : `Budget ${moisEcoules} mois`}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.primary, fontFamily: "serif" }}>{Math.round(budgetPeriode).toLocaleString("fr-FR")} €</div>
          </div>
        </div>
        {(() => {
          const pct = budgetPeriode > 0 ? Math.min(Math.round((totalReel / budgetPeriode) * 100), 100) : 0;
          const depasse = totalReel > budgetPeriode;
          return (
            <>
              <div style={{ height: 10, borderRadius: 5, background: COLORS.border, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: depasse ? COLORS.danger : COLORS.accent, borderRadius: 5 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: depasse ? COLORS.danger : COLORS.textMuted }}>
                  {depasse ? `+${Math.round(totalReel - budgetPeriode).toLocaleString("fr-FR")} € au-dessus` : `${Math.round(budgetPeriode - totalReel).toLocaleString("fr-FR")} € restants`}
                </span>
                <span style={{ color: depasse ? COLORS.danger : COLORS.textMuted, fontWeight: 700 }}>{pct}%</span>
              </div>
            </>
          );
        })()}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 17, fontFamily: "serif", marginBottom: 16 }}>
          {modeVue === "mois" ? `Dépenses — ${moisSelectionne}` : `Dépenses — ${annee}`}
          {filtreCategorie !== "Tout" ? ` · ${filtreCategorie}` : ""}
        </div>
        {depensesFiltrees.map((d) => {
          const montantManquant = !d.montant || Number(d.montant) === 0;
          const labelManquant = nomEstFichier(d.label);
          const aCompleter = montantManquant || labelManquant;
          return (
            <div
              key={d.id}
              onClick={() => (aCompleter || d.facture_url) && setDepenseACompleter(d)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${COLORS.border}`, cursor: (aCompleter || d.facture_url) ? "pointer" : "default", background: aCompleter ? "#fffbeb" : "transparent", margin: aCompleter ? "0 -20px" : 0, padding: aCompleter ? "12px 20px" : "12px 0" }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500 }}>{d.label}</div>
                  {labelManquant && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: COLORS.warning + "33", color: COLORS.warning, padding: "2px 8px", borderRadius: 20 }}>Nom ?</span>
                  )}
                  {montantManquant && !labelManquant && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: COLORS.warning + "33", color: COLORS.warning, padding: "2px 8px", borderRadius: 20 }}>Montant ?</span>
                  )}
                  {montantManquant && labelManquant && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: COLORS.warning + "33", color: COLORS.warning, padding: "2px 8px", borderRadius: 20 }}>À compléter</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{d.categorie} · {d.date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                {montantManquant ? (
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.warning }}>— €</div>
                ) : (
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary, fontFamily: "serif" }}>{Math.round(Number(d.montant)).toLocaleString("fr-FR")} €</div>
                )}
                {(aCompleter || d.facture_url) && <span style={{ fontSize: 16, color: COLORS.textMuted }}>›</span>}
              </div>
            </div>
          );
        })}
        {depensesFiltrees.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Aucune dépense</div>}
      </Card>

      {showMassUpload && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 17, fontFamily: "serif", marginBottom: 12 }}>📦 Import multiple factures</div>
          {fichiersSelectionnes.length === 0 ? (
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "24px", borderRadius: 10, border: `2px dashed ${COLORS.accent}`, cursor: "pointer", background: COLORS.accentLight, textAlign: "center" }}>
              <span style={{ fontSize: 36 }}>📂</span>
              <span style={{ fontSize: 14, color: COLORS.primary, fontWeight: 600 }}>Sélectionner plusieurs factures</span>
              <span style={{ fontSize: 12, color: COLORS.textMuted }}>PDF, images — sélection multiple autorisée</span>
              <input type="file" accept=".pdf,image/*" multiple onChange={selectionnerFichiers} style={{ display: "none" }} />
            </label>
          ) : (
            <div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>{fichiersSelectionnes.length} fichier(s) — complète les infos :</div>
              {metadonnees.map((meta, i) => (
                <div key={i} style={{ marginBottom: 12, padding: 12, background: COLORS.bg, borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600, marginBottom: 8 }}>📎 {fichiersSelectionnes[i].name}</div>
                  <input value={meta.nom} onChange={e => { const m = [...metadonnees]; m[i].nom = e.target.value; setMetadonnees(m); }} placeholder="Libellé" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, marginBottom: 6, boxSizing: "border-box", outline: "none" }} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={meta.montant} onChange={e => { const m = [...metadonnees]; m[i].montant = e.target.value; setMetadonnees(m); }} placeholder="Montant €" type="number" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }} />
                    <input value={meta.date} onChange={e => { const m = [...metadonnees]; m[i].date = e.target.value; setMetadonnees(m); }} type="date" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }} />
                  </div>
                  <select value={meta.categorie} onChange={e => { const m = [...metadonnees]; m[i].categorie = e.target.value; setMetadonnees(m); }} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, marginTop: 6, outline: "none" }}>
                    {CATEGORIES.filter(c => c !== "Tout").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              ))}
              {uploadProgress.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {uploadProgress.map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", color: COLORS.textMuted }}>
                      <span>📎 {p.nom}</span><span>{p.statut}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={massUpload} disabled={uploading} style={{ flex: 1, padding: 12, background: COLORS.primary, color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  {uploading ? "Upload en cours..." : `⬆️ Uploader ${fichiersSelectionnes.length} facture(s)`}
                </button>
                <button onClick={() => { setShowMassUpload(false); setFichiersSelectionnes([]); setMetadonnees([]); }} style={{ padding: 12, background: COLORS.bg, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
              </div>
            </div>
          )}
        </Card>
      )}

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 17, fontFamily: "serif", marginBottom: 12 }}>Nouvelle dépense</div>
          <input value={label} onChange={e => { const v = e.target.value; setLabel(v); setCategorie(devinerCategorie(v)); }} placeholder="Libellé *" style={inputStyle} />
          <input value={montant} onChange={e => setMontant(e.target.value)} placeholder="Montant en € *" type="number" style={inputStyle} />
          <select value={categorie} onChange={e => setCategorie(e.target.value)} style={{ ...inputStyle }}>
            {CATEGORIES.filter(c => c !== "Tout").map(c => <option key={c}>{c}</option>)}
          </select>
          <input value={date} onChange={e => setDate(e.target.value)} type="date" style={inputStyle} />
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Facture (PDF ou image) — optionnel</div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px", borderRadius: 10, border: `2px dashed ${COLORS.border}`, cursor: "pointer", background: COLORS.bg }}>
              <span style={{ fontSize: 20 }}>📎</span>
              <span style={{ fontSize: 13, color: COLORS.textMuted }}>{fichier ? fichier.name : "Choisir un fichier..."}</span>
              <input type="file" accept=".pdf,image/*" onChange={e => setFichier(e.target.files[0])} style={{ display: "none" }} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={ajouterDepense} disabled={uploading} style={{ flex: 1, padding: 12, background: COLORS.primary, color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>{uploading ? "Envoi..." : "Ajouter"}</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, background: COLORS.bg, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
          </div>
        </Card>
      )}

      {!showForm && !showMassUpload && (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowMassUpload(true)} style={{ flex: 1, padding: 14, background: COLORS.accent, color: "white", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>📦 Import multiple</button>
          <button onClick={() => setShowForm(true)} style={{ flex: 1, padding: 14, background: COLORS.primary, color: "white", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Ajouter</button>
        </div>
      )}
    </div>
  );
}

// ─── DOCUMENTS ─────────────────────────────────────────────────────────
function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("documents").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setDocuments(data || []);
      setLoading(false);
    });
  }, []);

  const icons = { PV: "📋", Reglement: "📜", Budget: "💰", Contrat: "📝", Entretien: "🔧" };

  if (loading) return <Spinner />;

  return (
    <div>
      <SectionTitle title="Documents" />
      <Card>
        {documents.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Aucun document disponible</div>}
        {documents.map((d) => (
          <a key={d.id} href={d.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${COLORS.border}`, textDecoration: "none" }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>{icons[d.type] || "📄"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{d.titre}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 3 }}>
                <Badge label={d.type} color={COLORS.primary} /> · {d.created_at?.split("T")[0]} · {d.taille}
              </div>
            </div>
            <div style={{ fontSize: 20, color: COLORS.textMuted }}>↓</div>
          </a>
        ))}
      </Card>
    </div>
  );
}

// ─── ANNUAIRE ──────────────────────────────────────────────────────────
function Annuaire() {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("residents").select("*").order("nom").then(({ data }) => {
      setResidents(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  const filtered = residents.filter(r =>
    r.nom?.toLowerCase().includes(search.toLowerCase()) || r.lot?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionTitle title="Annuaire" />
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un résident..." style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${COLORS.border}`, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box", background: COLORS.surface }} />
      <Card>
        {filtered.map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: COLORS.accent, flexShrink: 0, fontFamily: "serif" }}>
              {r.nom?.[0] || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{r.nom}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{r.lot} · {r.etage}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Aucun résident trouvé</div>}
      </Card>
    </div>
  );
}

// ─── TICKETS ───────────────────────────────────────────────────────────
function Tickets({ user }) {
  const [tickets, setTickets] = useState([]);
  const [filtre, setFiltre] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [priorite, setPriorite] = useState("Moyenne");
  const [ticketEdite, setTicketEdite] = useState(null); // { id, titre, description, priorite }

  const load = async () => {
    const { data } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const creerTicket = async () => {
    if (!titre.trim()) return;
    await supabase.from("tickets").insert({ titre, description, priorite, statut: "Ouvert", auteur_id: user.id });
    setTitre(""); setDescription(""); setPriorite("Moyenne"); setShowForm(false);
    load();
  };

  const modifierTicket = async () => {
    if (!ticketEdite?.titre.trim()) return;
    await supabase.from("tickets").update({ titre: ticketEdite.titre, description: ticketEdite.description, priorite: ticketEdite.priorite }).eq("id", ticketEdite.id);
    setTicketEdite(null);
    load();
  };

  const inputStyle = { width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" };

  if (loading) return <Spinner />;

  const filtres = ["Tous", "Ouvert", "En cours", "Résolu"];
  const filtered = tickets.filter(t => filtre === "Tous" || t.statut === filtre);

  return (
    <div>
      <SectionTitle title="Signalements" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filtres.map(f => (
          <button key={f} onClick={() => setFiltre(f)} style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${filtre === f ? COLORS.accent : COLORS.border}`, background: filtre === f ? COLORS.accentLight : COLORS.surface, color: filtre === f ? COLORS.accent : COLORS.textMuted, fontSize: 13, cursor: "pointer", fontWeight: filtre === f ? 700 : 400 }}>
            {f}
          </button>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        {filtered.map(t => {
          const estAuteur = t.auteur_id === user.id;
          const enEdition = ticketEdite?.id === t.id;

          if (enEdition) {
            return (
              <div key={t.id} style={{ padding: "14px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, marginBottom: 10 }}>Modifier le signalement</div>
                <input value={ticketEdite.titre} onChange={e => setTicketEdite({ ...ticketEdite, titre: e.target.value })} placeholder="Titre *" style={inputStyle} />
                <textarea value={ticketEdite.description} onChange={e => setTicketEdite({ ...ticketEdite, description: e.target.value })} placeholder="Description" rows={3} style={{ ...inputStyle, resize: "none" }} />
                <select value={ticketEdite.priorite} onChange={e => setTicketEdite({ ...ticketEdite, priorite: e.target.value })} style={{ ...inputStyle, marginBottom: 12 }}>
                  <option>Faible</option><option>Moyenne</option><option>Haute</option>
                </select>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={modifierTicket} style={{ flex: 1, padding: 10, background: COLORS.primary, color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Enregistrer</button>
                  <button onClick={() => setTicketEdite(null)} style={{ flex: 1, padding: 10, background: COLORS.bg, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Annuler</button>
                </div>
              </div>
            );
          }

          return (
            <div key={t.id} onClick={() => estAuteur && setTicketEdite({ id: t.id, titre: t.titre, description: t.description || "", priorite: t.priorite })} style={{ padding: "14px 0", borderBottom: `1px solid ${COLORS.border}`, cursor: estAuteur ? "pointer" : "default" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 600, flex: 1, paddingRight: 10 }}>{t.titre}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {estAuteur && <span style={{ fontSize: 12, color: COLORS.textMuted }}>✏️</span>}
                  <Badge label={t.statut} />
                </div>
              </div>
              {t.description && <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>{t.description}</div>}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge label={t.priorite} />
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{t.created_at?.split("T")[0]}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Aucun signalement</div>}
      </Card>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 17, fontFamily: "serif", marginBottom: 12 }}>Nouveau signalement</div>
          <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre du problème *" style={inputStyle} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optionnel)" rows={3} style={{ ...inputStyle, resize: "none" }} />
          <select value={priorite} onChange={e => setPriorite(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }}>
            <option>Faible</option><option>Moyenne</option><option>Haute</option>
          </select>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={creerTicket} style={{ flex: 1, padding: 12, background: COLORS.primary, color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Envoyer</button>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, background: COLORS.bg, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Annuler</button>
          </div>
        </Card>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: 14, background: COLORS.primary, color: "white", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          + Nouveau signalement
        </button>
      )}
    </div>
  );
}

// ─── MESSAGERIE ────────────────────────────────────────────────────────
function Messagerie({ user, resident }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("messages").select("*, residents(nom)").order("created_at");
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!msg.trim()) return;
    await supabase.from("messages").insert({ contenu: msg, auteur_id: user.id });
    setMsg("");
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      <SectionTitle title="Messagerie" />
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16 }}>
        {messages.map(m => {
          const isMe = m.auteur_id === user.id;
          const nom = m.residents?.nom || "Résident";
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
              {!isMe && (
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: COLORS.accent, flexShrink: 0 }}>
                  {nom[0]}
                </div>
              )}
              <div style={{ maxWidth: "75%" }}>
                {!isMe && <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{nom}</div>}
                <div style={{ background: isMe ? COLORS.primary : COLORS.surface, color: isMe ? "white" : COLORS.text, borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px", fontSize: 14, border: isMe ? "none" : `1px solid ${COLORS.border}`, lineHeight: 1.5 }}>
                  {m.contenu}
                </div>
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4, textAlign: isMe ? "right" : "left" }}>{m.created_at?.split("T")[1]?.slice(0, 5)}</div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center" }}>Aucun message pour l'instant</div>}
      </div>
      <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Votre message..." style={{ flex: 1, padding: "12px 16px", borderRadius: 24, border: `1px solid ${COLORS.border}`, fontSize: 14, outline: "none", background: COLORS.surface }} />
        <button onClick={send} style={{ width: 46, height: 46, borderRadius: "50%", background: COLORS.primary, color: "white", border: "none", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
      </div>
    </div>
  );
}

// ─── VOTES ─────────────────────────────────────────────────────────────
function Votes({ user }) {
  const [votes, setVotes] = useState([]);
  const [reponses, setReponses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [v, r] = await Promise.all([
      supabase.from("votes").select("*"),
      supabase.from("votes_reponses").select("*").eq("resident_id", user.id),
    ]);
    setVotes(v.data || []);
    setReponses(r.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const voter = async (voteId, choix) => {
    await supabase.from("votes_reponses").insert({ vote_id: voteId, resident_id: user.id, choix });
    load();
  };

  const getResultats = async (voteId) => {
    const { data } = await supabase.from("votes_reponses").select("choix").eq("vote_id", voteId);
    return {
      pour: data?.filter(r => r.choix === "pour").length || 0,
      contre: data?.filter(r => r.choix === "contre").length || 0,
      abstention: data?.filter(r => r.choix === "abstention").length || 0,
    };
  };

  const [resultats, setResultats] = useState({});
  useEffect(() => {
    votes.forEach(async v => {
      const r = await getResultats(v.id);
      setResultats(prev => ({ ...prev, [v.id]: r }));
    });
  }, [votes]);

  if (loading) return <Spinner />;

  return (
    <div>
      <SectionTitle title="Votes en ligne" />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {votes.map(v => {
          const aVote = reponses.some(r => r.vote_id === v.id);
          const r = resultats[v.id] || { pour: 0, contre: 0, abstention: 0 };
          const total = r.pour + r.contre + r.abstention;
          const pctPour = total ? Math.round((r.pour / total) * 100) : 0;
          const pctContre = total ? Math.round((r.contre / total) * 100) : 0;
          return (
            <Card key={v.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <Badge label={v.statut} />
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>Clôture : {v.echeance}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary, fontFamily: "serif", marginBottom: 16, lineHeight: 1.4 }}>{v.question}</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", height: 10, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: `${pctPour}%`, background: COLORS.accent }} />
                  <div style={{ width: `${pctContre}%`, background: COLORS.danger }} />
                  <div style={{ flex: 1, background: COLORS.border }} />
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                  <span style={{ color: COLORS.accent }}>✓ Pour : {r.pour} ({pctPour}%)</span>
                  <span style={{ color: COLORS.danger }}>✗ Contre : {r.contre} ({pctContre}%)</span>
                  <span style={{ color: COLORS.textMuted }}>— Abs. : {r.abstention}</span>
                </div>
              </div>
              {v.statut === "En cours" && !aVote && (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => voter(v.id, "pour")} style={{ flex: 1, padding: 10, background: COLORS.accentLight, color: COLORS.accent, border: `1px solid ${COLORS.accent}`, borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>✓ Pour</button>
                  <button onClick={() => voter(v.id, "contre")} style={{ flex: 1, padding: 10, background: "#fef2f2", color: COLORS.danger, border: `1px solid ${COLORS.danger}`, borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>✗ Contre</button>
                  <button onClick={() => voter(v.id, "abstention")} style={{ flex: 1, padding: 10, background: COLORS.bg, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>— Abst.</button>
                </div>
              )}
              {aVote && <div style={{ textAlign: "center", fontSize: 13, color: COLORS.accent, fontWeight: 600, marginTop: 8 }}>✓ Vous avez voté</div>}
            </Card>
          );
        })}
        {votes.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Aucun vote disponible</div>}
      </div>
    </div>
  );
}

// ─── FOURNISSEURS ───────────────────────────────────────────────────────
function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedF, setSelectedF] = useState(null);
  const [editTel, setEditTel] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("fournisseurs").select("*").order("nom");
    setFournisseurs(data || []);
    return data || [];
  };

  useEffect(() => {
    const sync = async () => {
      const existants_data = await load();
      const existants = new Set(existants_data.map(f => f.nom.toLowerCase()));
      const { data: depenses } = await supabase.from("depenses").select("label, categorie");
      const map = {};
      (depenses || []).forEach(d => {
        const label = d.label?.trim();
        if (!label || nomEstFichier(label) || existants.has(label.toLowerCase())) return;
        if (!map[label]) map[label] = {};
        const cat = d.categorie || "Autre";
        map[label][cat] = (map[label][cat] || 0) + 1;
      });
      const candidats = Object.entries(map).map(([n, cats]) => {
        const cat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0][0];
        return { nom: n, categorie: cat };
      });
      if (candidats.length > 0) await supabase.from("fournisseurs").insert(candidats);
      await load();
      setLoading(false);
    };
    sync();
  }, []);

  const sauvegarder = async () => {
    setSaving(true);
    await supabase.from("fournisseurs").update({ telephone: editTel, email: editEmail, notes: editNotes }).eq("id", selectedF.id);
    const updated = { ...selectedF, telephone: editTel, email: editEmail, notes: editNotes };
    setSelectedF(updated);
    setFournisseurs(prev => prev.map(f => f.id === updated.id ? updated : f));
    setSaving(false);
  };

  if (loading) return <Spinner />;

  const inputStyle = { width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none" };

  // ── Vue détail fournisseur ──
  if (selectedF) {
    return (
      <div>
        <button onClick={() => setSelectedF(null)} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 16 }}>← {selectedCat}</button>
        <Card>
          <div style={{ fontWeight: 700, color: COLORS.primary, fontSize: 20, fontFamily: "serif", marginBottom: 4 }}>{selectedF.nom}</div>
          <Badge label={selectedF.categorie} color={COLORS.primary} />
          <button
            onClick={async () => {
              setExtracting(true);
              const result = await extraireContactsFactures(selectedF.nom);
              if (result) {
                if (result.telephone) setEditTel(result.telephone);
                if (result.email) setEditEmail(result.email);
              } else {
                alert("Aucun contact trouvé dans les factures.");
              }
              setExtracting(false);
            }}
            disabled={extracting}
            style={{ marginTop: 16, width: "100%", padding: 12, background: COLORS.accentLight, color: COLORS.accent, border: `1px solid ${COLORS.accent}`, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: extracting ? 0.6 : 1 }}
          >
            {extracting ? "Analyse des factures en cours..." : "✨ Extraire depuis les factures"}
          </button>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Téléphone</div>
              <input value={editTel} onChange={e => setEditTel(e.target.value)} placeholder="Non renseigné" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Email</div>
              <input value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Non renseigné" type="email" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Notes</div>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Notes..." rows={3} style={{ ...inputStyle, resize: "none" }} />
            </div>
            <button onClick={sauvegarder} disabled={saving} style={{ width: "100%", padding: 14, background: COLORS.primary, color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Vue liste fournisseurs d'une catégorie ──
  if (selectedCat) {
    const liste = fournisseurs.filter(f => f.categorie === selectedCat);
    return (
      <div>
        <button onClick={() => setSelectedCat(null)} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Catégories</button>
        <SectionTitle title={selectedCat} />
        <Card>
          {liste.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Aucun fournisseur</div>}
          {liste.map(f => (
            <div key={f.id} onClick={() => { setSelectedF(f); setEditTel(f.telephone || ""); setEditEmail(f.email || ""); setEditNotes(f.notes || ""); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
              <div>
                <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{f.nom}</div>
                {(f.telephone || f.email) && (
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                    {f.telephone && `📞 ${f.telephone}`}{f.telephone && f.email && "  "}{f.email && `✉️ ${f.email}`}
                  </div>
                )}
              </div>
              <span style={{ color: COLORS.textMuted, fontSize: 18 }}>›</span>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  // ── Vue catégories ──
  const cats = [...new Set(fournisseurs.map(f => f.categorie).filter(Boolean))].sort();
  return (
    <div>
      <SectionTitle title="Fournisseurs" />
      <Card>
        {cats.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Aucun fournisseur</div>}
        {cats.map(cat => {
          const count = fournisseurs.filter(f => f.categorie === cat).length;
          return (
            <div key={cat} onClick={() => setSelectedCat(cat)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
              <div>
                <div style={{ fontSize: 15, color: COLORS.text, fontWeight: 600 }}>{cat}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{count} fournisseur{count > 1 ? "s" : ""}</div>
              </div>
              <span style={{ color: COLORS.textMuted, fontSize: 18 }}>›</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ─── NAV ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Accueil", icon: "🏠" },
  { id: "charges", label: "Charges", icon: "💰" },
  { id: "documents", label: "Docs", icon: "📄" },
  { id: "annuaire", label: "Annuaire", icon: "👥" },
  { id: "tickets", label: "Tickets", icon: "🔧" },
  { id: "messagerie", label: "Messages", icon: "💬" },
  { id: "votes", label: "Votes", icon: "🗳️" },
  { id: "fournisseurs", label: "Fournisseurs", icon: "🏢" },
];

// ─── APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [resident, setResident] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadResident(session.user.id);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadResident(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadResident = async (userId) => {
    const { data } = await supabase.from("residents").select("*").eq("id", userId).single();
    setResident(data);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setResident(null);
  };

  if (authLoading) return <div style={{ minHeight: "100vh", background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Georgia, serif", fontSize: 18 }}>Chargement...</div>;
  if (!session) return <Login onLogin={setSession} />;

  const PAGES = { dashboard: Dashboard, charges: Charges, documents: Documents, annuaire: Annuaire, tickets: Tickets, messagerie: Messagerie, votes: Votes, fournisseurs: Fournisseurs };
  const PageComponent = PAGES[page] || Dashboard;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'Helvetica Neue', -apple-system, sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: COLORS.primary, padding: "16px 20px 14px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}
            >
              <div style={{ width: 22, height: 2, background: "white", borderRadius: 2 }} />
              <div style={{ width: 22, height: 2, background: "white", borderRadius: 2 }} />
              <div style={{ width: 22, height: 2, background: "white", borderRadius: 2 }} />
            </button>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>Résidence</div>
              <div style={{ color: "white", fontFamily: "'Georgia', serif", fontSize: 18, fontWeight: 700 }}>Residence Inkerman</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => { const i = NAV.findIndex(n => n.id === page); if (i > 0) setPage(NAV[i - 1].id); }}
              disabled={NAV.findIndex(n => n.id === page) === 0}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, cursor: "pointer", color: "white", fontSize: 30, padding: "2px 10px", opacity: NAV.findIndex(n => n.id === page) === 0 ? 0.3 : 1, lineHeight: 1, display: "flex", alignItems: "center" }}
            >‹</button>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, minWidth: 70, textAlign: "center" }}>{NAV.find(n => n.id === page)?.label}</span>
            <button
              onClick={() => { const i = NAV.findIndex(n => n.id === page); if (i < NAV.length - 1) setPage(NAV[i + 1].id); }}
              disabled={NAV.findIndex(n => n.id === page) === NAV.length - 1}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, cursor: "pointer", color: "white", fontSize: 30, padding: "2px 10px", opacity: NAV.findIndex(n => n.id === page) === NAV.length - 1 ? 0.3 : 1, lineHeight: 1, display: "flex", alignItems: "center" }}
            >›</button>
          </div>
        </div>

        {menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 150 }}
            />
            <div style={{ position: "absolute", top: "100%", left: 0, background: COLORS.surface, borderRadius: "0 0 16px 0", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 200, minWidth: 220, overflow: "hidden" }}>
              {NAV.map((n, i) => (
                <button
                  key={n.id}
                  onClick={() => { setPage(n.id); setMenuOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    width: "100%", padding: "14px 20px",
                    background: page === n.id ? COLORS.accentLight : "none",
                    border: "none",
                    borderBottom: `1px solid ${COLORS.border}`,
                    cursor: "pointer",
                    color: page === n.id ? COLORS.accent : COLORS.text,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{n.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: page === n.id ? 700 : 400 }}>{n.label}</span>
                </button>
              ))}
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "14px 20px", background: "none", border: "none", cursor: "pointer", color: COLORS.danger }}
              >
                <span style={{ fontSize: 20 }}>🚪</span>
                <span style={{ fontSize: 15 }}>Déconnexion</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "20px 16px 40px", overflowX: "hidden" }}>
        <PageComponent setPage={setPage} user={session.user} resident={resident} />
      </div>
    </div>
  );
}
