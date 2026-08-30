# Atelier — Carnet de mesures numérique

Application web pour enregistrer les clients, leurs mesures, le tissu apporté,
la date de retrait et le solde à payer. Fonctionne entièrement dans le
navigateur : aucune connexion internet n'est nécessaire une fois la page ouverte,
et aucun serveur ni base de données externe n'est requis.

## Fichiers du projet

- `index.html` — la page
- `style.css` — l'habillage visuel
- `script.js` — le fonctionnement (ajout, recherche, sauvegarde)
- `assets/` — dossier réservé pour un futur logo ou des images

## Où sont stockées les données ?

Les fiches clients sont sauvegardées directement dans le navigateur utilisé
(mémoire appelée `localStorage`), sur l'ordinateur ou le téléphone qui a servi
à les créer. Il n'y a pas de compte à créer, rien à payer.

**Points importants :**
- Utilise toujours le même navigateur (ex: toujours Chrome, pas une fois Chrome
  une fois Firefox) et le même appareil pour retrouver les données.
- Si tu vides l'historique/les données de navigation du navigateur, les fiches
  clients seront perdues. Utilise régulièrement le bouton **"Exporter une
  sauvegarde"** en haut du tableau de bord : il télécharge un fichier `.json`
  que tu peux garder sur une clé USB, Google Drive, etc. Le bouton
  **"Importer une sauvegarde"** permet de tout restaurer si besoin.

## Déployer gratuitement sur GitHub Pages (pas à pas)

Cette méthode met le site en ligne gratuitement, avec une adresse du type
`https://ton-nom-utilisateur.github.io/MonApplication/`.

### Étape 1 — Créer un compte GitHub
1. Va sur https://github.com
2. Clique sur **Sign up** (S'inscrire), en haut à droite.
3. Renseigne un e-mail, un mot de passe, un nom d'utilisateur, puis suis les
   instructions à l'écran (vérification, etc.). C'est gratuit.

### Étape 2 — Créer un nouveau dépôt (repository)
1. Une fois connecté, clique sur le **+** en haut à droite, puis
   **New repository**.
2. Dans **Repository name**, écris `MonApplication`.
3. Laisse le dépôt en **Public**.
4. Ne coche aucune case supplémentaire (pas de README, pas de .gitignore).
5. Clique sur **Create repository**.

### Étape 3 — Mettre en ligne les fichiers
1. Sur la page du dépôt qui vient de s'ouvrir, clique sur le lien
   **uploading an existing file** (« en important un fichier existant »).
2. Glisse-dépose (ou sélectionne) les fichiers suivants depuis ton ordinateur :
   `index.html`, `style.css`, `script.js`, `README.md`, et le dossier `assets`.
3. Tout en bas de la page, clique sur le bouton vert **Commit changes**.

### Étape 4 — Activer l'hébergement (GitHub Pages)
1. Toujours sur la page du dépôt, clique sur l'onglet **Settings** (Paramètres),
   en haut.
2. Dans le menu à gauche, clique sur **Pages**.
3. Sous **Build and deployment**, dans **Branch**, choisis `main` (ou `master`)
   et laisse le dossier sur `/ (root)`.
4. Clique sur **Save**.
5. Attends 1 à 2 minutes, puis rafraîchis la page : une bannière verte affiche
   l'adresse de ton site, du type
   `https://ton-nom-utilisateur.github.io/MonApplication/`.

### Étape 5 — Utiliser le site
1. Ouvre l'adresse obtenue à l'étape précédente dans ton navigateur.
2. Ajoute-la à tes favoris, ou crée un raccourci sur l'écran d'accueil de ton
   téléphone pour y accéder rapidement.
3. Utilise toujours ce même lien, sur le même appareil et le même navigateur,
   pour retrouver tes clients.

### Mettre à jour le site plus tard
Si tu modifies un fichier (par exemple pour ajouter un champ), retourne dans
le dépôt sur GitHub, ouvre le fichier concerné, clique sur l'icône crayon
(**Edit**), colle le nouveau contenu, puis **Commit changes**. Le site se
met à jour automatiquement après une ou deux minutes.
