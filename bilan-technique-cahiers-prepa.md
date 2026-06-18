# Cahiers d'un prépa — bilan technique

Document de référence du site : ce qu'il contient, comment chaque pièce fonctionne, et les gestes à connaître pour le maintenir. Pensé pour être rouvert dans plusieurs mois sans rien avoir à redécouvrir.

---

## Le site en une phrase

Un site statique qui publie des polycopiés de CPGE PT (maths, physique, SI) rédigés en LaTeX, construit avec Astro, hébergé gratuitement sur Cloudflare Pages, et mis à jour d'un simple `git push`.

---

## Le modèle mental : Astro ≈ LaTeX

Tout le projet repose sur la même logique que LaTeX, sous d'autres noms :

| LaTeX | Astro |
|---|---|
| Fichiers `.tex` (sources) | Fichiers `.astro` et `.md` (sources) |
| `latexmk` / `pdflatex` (compiler) | `npm run build` (compiler) |
| Le `.pdf` produit | Le dossier `dist/` rempli de `.html` |
| Préambule / `\documentclass` | `Layout.astro` (gabarit commun) |
| Macros / `\input` | Les composants (`PolyCard`, `Header`…) |
| Une faute de macro casse la compilation | Une faute dans le schéma casse le build |
| `latexmk -pvc` (aperçu continu) | `npm run dev` (rechargement à chaud) |

**Conséquence clé :** une fois le site en ligne, Astro ne tourne plus — comme un PDF n'a pas besoin de LaTeX pour être lu. Le site final n'est que du HTML/CSS servi par Cloudflare.

Il y a **deux boucles** distinctes :
- **`localhost` + `npm run dev`** : le brouillon privé, sur ta machine. Tu le démarres et l'arrêtes.
- **L'URL `.pages.dev`** : le vrai site, public et toujours allumé, géré par Cloudflare. Tu le mets à jour avec `git push`.

---

## La pile technique

- **Astro 6** — générateur de site statique.
- **Sortie statique** (`output: "static"`) — aucun serveur, aucun adaptateur.
- **Polices** auto-hébergées via l'API Fonts d'Astro (`astro:assets`) : Source Serif 4 (titres) et Source Sans 3 (texte).
- **Dépôt** : GitHub (`sebastianmrc/cahiers-dun-prepa`).
- **Hébergement** : Cloudflare **Pages** (statique), redéploiement automatique à chaque push.

---

## L'architecture des fichiers

```
public/
  polys/<matiere>/<slug>.pdf   ← les PDF, servis tels quels (racine du site)

src/
  pages/                       ← un fichier = une page (le nom donne l'URL)
    index.astro                  /            (accueil)
    [matiere].astro              /mathematiques/ et /physique/ (route dynamique)
    a-propos.astro               /a-propos/
    404.astro                    page introuvable
    si/
      index.astro                /si/         (liste SI + chaîne interactive)
      fonction/
        [fonction].astro         /si/fonction/<f>/  (8 pages générées)
  layouts/
    Layout.astro               ← gabarit commun (head, Header, slot, Footer)
  components/
    Header.astro, Footer.astro, PolyCard.astro, ChaineSI.astro
  data/
    fonctions.ts               ← les 8 fonctions SI (source unique de vérité)
  content/polys/<matiere>/<slug>.md  ← les fiches (métadonnées d'un poly)
  styles/global.css            ← palette, typographie, mise en page
  content.config.ts            ← le SCHÉMA du catalogue

astro.config.mjs               ← config du projet (les polices)
```

**Distinction qui revient sans cesse :**
- `src/` = l'atelier : tout y est transformé par Astro au build.
- `public/` = la zone de transit : tout y est recopié tel quel. Le dossier `public/` correspond à la racine du site (un fichier `public/polys/si/x.pdf` est servi à `…/polys/si/x.pdf`).

---

## Les systèmes clés

### 1. Le catalogue — content collections

C'est le cœur. Toutes les infos d'un poly vivent dans une fiche `.md`, et un **schéma** (dans `src/content.config.ts`) dit ce qu'une fiche doit contenir. Si une fiche a une faute (`matiere: mahts`) ou un champ manquant, le build s'arrête — c'est le filet de sécurité.

Le schéma actuel :

```ts
schema: z.object({
  titre: z.string(),
  matiere: z.enum(['maths', 'physique', 'si']),
  annee: z.enum(['ptsi', 'pt']),
  ordre: z.number(),                 // position dans la progression
  pdf: z.string(),                   // chemin web, ex. /polys/maths/series.pdf
  maj: z.coerce.date(),
  fonctions: z.array(z.enum(FONCTION_IDS)).default([]),  // SI uniquement
  resume: z.string().optional(),
})
```

Ensuite, n'importe quelle page récupère tout le catalogue avec `getCollection('polys')`, puis filtre/trie. Compteurs, listes, derniers ajouts, chaîne SI : tout n'est qu'une **requête** sur cette liste. Une info n'existe qu'à un seul endroit, donc rien ne peut diverger.

### 2. La source de vérité des fonctions SI — `fonctions.ts`

`src/data/fonctions.ts` contient les 8 fonctions de la chaîne SI, chacune avec `id`, `label`, `chaine` (`information`/`puissance`), `definition` et `composants`. Il exporte aussi `FONCTION_IDS` (la liste des identifiants), que le schéma importe pour valider le champ `fonctions`. **Une seule liste** : le schéma, les pages de fonction et la chaîne s'en servent tous.

### 3. Le gabarit et les composants

- `Layout.astro` : la coquille commune (`<head>` avec les polices, `Header`, un `<slot />` pour le contenu, `Footer`, et l'import de `global.css`). Toutes les pages l'utilisent.
- `PolyCard.astro` : la carte d'un poly (titre, métadonnées, boutons Consulter/Télécharger). Définie une fois, réutilisée partout via des **props**.
- `Header.astro` / `Footer.astro` : navigation et pied de page.
- `ChaineSI.astro` : la chaîne interactive (voir plus bas).

### 4. Le routage — fichier = page

L'emplacement d'un fichier dans `src/pages/` détermine son adresse. Pas de table de routes à tenir.

Les **routes dynamiques** (nom entre crochets + `getStaticPaths`) génèrent plusieurs pages depuis des données :
- `[matiere].astro` fabrique `/mathematiques/` et `/physique/`.
- `si/fonction/[fonction].astro` fabrique les 8 pages de fonction depuis `FONCTIONS`.

`getStaticPaths` renvoie une liste de `{ params, props }` : `params` définit l'adresse, `props` transmet à la page de quoi s'afficher.

### 5. La chaîne SI interactive — amélioration progressive

`ChaineSI.astro` affiche les deux chaînes en HTML/CSS, où **chaque bloc est un vrai lien** vers `/si/fonction/<f>/`. Trois couches :
1. **Sans JavaScript** : cliquer un bloc navigue vers la page de fonction. Fonctionnel et accessible d'emblée.
2. **Avec JavaScript** : le clic est intercepté (`e.preventDefault()`), un panneau s'ouvre sous la chaîne (définition, composants, polys associés), et l'URL est mise à jour via `history.pushState`. Recharger = on tombe sur la vraie page de fonction (le repli).
3. **Responsive** : les blocs s'enroulent naturellement, et sous 600 px ils s'empilent en colonne. Pas besoin d'accordéon séparé.

Le pont build → navigateur se fait avec `define:vars={{ donnees }}` : Astro calcule au build les données des fonctions (et leurs polys via `getCollection`) et les livre au script du navigateur.

---

## Les deux boucles de travail

### En local

```bash
npm run dev        # une fois par session ; ouvre l'URL localhost affichée
```

Tu laisses tourner, et chaque `Cmd+S` recharge la page (rechargement à chaud). `Ctrl+C` pour arrêter. **Un seul serveur à la fois** : si le numéro de port grimpe (4322, 4323…), c'est qu'un ancien serveur traîne — ferme les vieux terminaux.

### En production (déploiement)

```bash
git add .
git commit -m "message"
git push
```

`git push` **est** la commande de déploiement. Cloudflare détecte le push, lance `npm run build`, et met le résultat en ligne sur la même URL. Rien à téléverser à la main, rien à redémarrer.

### À propos d'`astro sync`

`npm run dev` régénère les types au démarrage, donc tu n'as **pas** besoin de `npx astro sync` au quotidien. Ne le ressors que dans deux cas : après avoir modifié le **schéma** (`content.config.ts`), ou si VS Code affiche des erreurs de type fantômes. Même là, redémarrer `npm run dev` suffit souvent.

---

## Ajouter un nouveau poly (la recette)

1. Compile ton cours en LaTeX → obtiens le `.pdf`.
2. Nomme-le en slug propre : minuscules, sans accents, tirets (`series-entieres.pdf`).
3. Dépose le PDF dans `public/polys/<matiere>/` (directement, **sans** sous-dossier d'année).
4. Crée la fiche `src/content/polys/<matiere>/<slug>.md` :

```yaml
---
titre: Conversion électromécanique
matiere: si
annee: pt
ordre: 7
pdf: /polys/si/conversion-electromecanique.pdf
maj: 2026-04-12
fonctions: [convertir, alimenter]   # SI seulement ; sinon, omettre
resume: Une phrase de résumé.        # facultatif
---
```

5. Sauvegarde, vérifie sur `localhost` (le serveur recharge tout seul).
6. `git add . && git commit -m "ajout : ..." && git push`. En ligne ~2 min plus tard, **sur la même URL**.

Tu ne touches à aucune autre page : index, compteurs, listes et chaîne se régénèrent à partir de la fiche.

---

## Le déploiement Cloudflare — à savoir

- C'est un projet **Pages statique** (build `npm run build`, sortie `dist`), pas un « Worker ».
- **Ne le laisse pas devenir un Worker avec l'adaptateur `@astrojs/cloudflare`.** Cet adaptateur, ajouté automatiquement par le flux « Worker », provisionne un espace KV qui fait échouer les redéploiements suivants (`a namespace … already exists [code: 10014]`). Un site statique n'a besoin d'aucun adaptateur.
- Si un build échoue à l'étape « Deploying », regarde le log : si tu vois un adaptateur ou un KV, c'est que le projet est repassé en mode Worker — recrée-le via l'onglet **Pages**.

---

## Les règles d'or (pièges rencontrés, à ne plus refaire)

- **Fichier = URL.** L'emplacement dans `src/pages/` est l'adresse. Noms en minuscules ASCII, tirets, pas d'accents.
- **Profondeur des imports = nombre de dossiers jusqu'à `src/`.** `src/pages/404.astro` → `../` (un cran). `src/pages/si/index.astro` → `../../`. `src/pages/si/fonction/[fonction].astro` → `../../../`.
- **Trois fichiers, trois rôles :**
  - `astro.config.mjs` = config du projet (les polices). Jamais de schéma, jamais d'`astro:content` ici.
  - `content.config.ts` = le schéma. C'est le **seul** endroit où vivent `defineCollection`, `z.…` et l'import `astro:content`.
  - `data/fonctions.ts` = des données pures (aucun `z.`).
  - Réflexe : si tu vois `z.` ou `astro:content`, ça va dans `content.config.ts`.
- **Modifier le schéma** → relancer `npx astro sync`, et s'assurer que les fiches existantes respectent le nouveau schéma (sinon utiliser `.optional()` ou `.default()`).
- **Les PDF dans `public/`** doivent correspondre **exactement** au chemin du champ `pdf:`. Pas de sous-dossiers d'année dans `public/`.
- **« Aucune erreur dans le terminal » ≠ ça marche.** Astro ne signale souvent le problème qu'au chargement de la page, ou dans le log de build. Vérifie la page réelle.
- **Bon port.** En cas de doute, utilise l'adresse `Local http://localhost:…` affichée par `npm run dev`, pas une ancienne mémorisée.

---

## Pour aller plus loin (v2, si l'envie vient)

- **Recherche plein texte** avec Pagefind (indexe le site au build).
- **Vignettes de première page** des PDF (générées au build avec `pdftoppm`).
- **Flux RSS** des derniers ajouts.
- **`sitemap.xml`** via l'intégration `@astrojs/sitemap` (nécessite d'ajouter `site:` dans `astro.config.mjs`).
- **Nom de domaine personnalisé** via Cloudflare (Projet → Custom domains).

Rien d'urgent : le site se suffit à lui-même.
