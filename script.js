let clients = [];
let unsubscribe = null;

// ---------- Authentification ----------
const loginScreen = document.getElementById('login-screen');
const appEl = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  auth.signInWithEmailAndPassword(email, pass).catch(err=>{
    loginError.textContent = "E-mail ou mot de passe incorrect.";
  });
});

document.getElementById('logout-btn').addEventListener('click', ()=>{
  auth.signOut();
});

auth.onAuthStateChanged(user=>{
  if(user){
    loginScreen.hidden = true;
    const welcome = document.getElementById('welcome-screen');
    document.getElementById('welcome-email').textContent = user.email;
    welcome.hidden = false;
    setTimeout(()=>{
      welcome.hidden = true;
      appEl.hidden = false;
      startSync();
    }, 1400);
  }else{
    loginScreen.hidden = false;
    appEl.hidden = true;
    if(unsubscribe){ unsubscribe(); unsubscribe = null; }
    clients = [];
  }
});

// ---------- Synchronisation en temps réel (Firestore) ----------
function startSync(){
  const status = document.getElementById('sync-status');
  unsubscribe = db.collection('clients').onSnapshot(snapshot=>{
    clients = snapshot.docs.map(d=>d.data());
    renderAll();
    status.textContent = "Synchronisé avec toute l'équipe ✓";
  }, err=>{
    status.textContent = "Erreur de connexion à la base partagée.";
  });
}

async function saveClientRemote(data){
  try{
    await db.collection('clients').doc(data.id).set(data);
    return true;
  }catch(e){
    return false;
  }
}

async function deleteClientRemote(id){
  try{
    await db.collection('clients').doc(id).delete();
    return true;
  }catch(e){
    return false;
  }
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

function fmtMoney(n){
  n = Number(n)||0;
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function fmtDate(iso){
  if(!iso) return 'Non fixée';
  const d = new Date(iso+'T00:00:00');
  return d.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
}

function daysUntil(iso){
  if(!iso) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(iso+'T00:00:00');
  return Math.round((d-today)/86400000);
}

function statutLabel(c){
  if(c.statut==='livre') return {cls:'tag-livre', text:'Livré'};
  if(c.statut==='pret') return {cls:'tag-pret', text:'Prêt'};
  const du = daysUntil(c.dateRetrait);
  if(du !== null && du < 0) return {cls:'tag-retard', text:'En retard'};
  return {cls:'tag-attente', text:'En attente'};
}

// --- Onglets ---
document.querySelectorAll('nav button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('main > section').forEach(s=>s.hidden = true);
    document.getElementById(btn.dataset.tab).hidden = false;
  });
});

function goTab(tab){
  document.querySelector(`nav button[data-tab="${tab}"]`).click();
}

// --- Avertissement jour + reste à payer ---
const retraitInput = document.getElementById('f-retrait');
retraitInput.addEventListener('change', ()=>{
  const w = document.getElementById('warn-jour');
  if(!retraitInput.value){ w.style.display='none'; return; }
  const day = new Date(retraitInput.value+'T00:00:00').getDay();
  w.style.display = [2,3,4].includes(day) ? 'none' : 'block';
});

function updateResteHint(){
  const prix = Number(document.getElementById('f-prix').value)||0;
  const paye = Number(document.getElementById('f-paye').value)||0;
  const reste = prix - paye;
  document.getElementById('reste-hint').textContent = prix ? `Reste à payer : ${fmtMoney(reste)}` : '';
}

document.getElementById('f-prix').addEventListener('input', updateResteHint);
document.getElementById('f-paye').addEventListener('input', updateResteHint);

// --- Photo (compressée avant stockage) ---
let currentPhoto = '';

document.getElementById('f-photo').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();

  reader.onload = (ev)=>{
    const img = new Image();

    img.onload = ()=>{
      const canvas = document.createElement('canvas');
      const maxW = 480;
      const scale = Math.min(1, maxW / img.width);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      canvas.getContext('2d').drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      currentPhoto = canvas.toDataURL('image/jpeg', 0.6);

      const preview = document.getElementById('photo-preview');
      preview.src = currentPhoto;
      preview.style.display = 'block';
    };

    img.src = ev.target.result;
  };

  reader.readAsDataURL(file);
});

// --- Enregistrement du formulaire ---
const form = document.getElementById('client-form');

form.addEventListener('submit', async (e)=>{
  e.preventDefault();

  const nom = document.getElementById('f-nom').value.trim();

  if(!nom){
    showToast('Le nom du client est obligatoire.');
    return;
  }

  const editId = document.getElementById('edit-id').value;

  const measures = {
    cou: document.getElementById('mm-cou').value,
    poitrine: document.getElementById('mm-poitrine').value,
    taille: document.getElementById('mm-taille').value,
    bassin: document.getElementById('mm-bassin').value,
    carrure: document.getElementById('mm-carrure').value,
    longueurDos: document.getElementById('mm-longdos').value,
    longueurManche: document.getElementById('mm-manche').value,
    tourBras: document.getElementById('mm-bras').value,
    tourPoignet: document.getElementById('mm-poignet').value,
    longueurGenou: document.getElementById('mm-genou').value,
    longueurChemise: document.getElementById('mm-chemise').value,
    longueurTotale: document.getElementById('mm-totale').value,
  };

  const editingClient = editId ? clients.find(c=>c.id===editId) : null;

  const data = {
    id: editId || ('c_' + Date.now()),
    nom,
    telephone: document.getElementById('f-tel').value.trim(),
    mesures: measures,
    notesMesures: document.getElementById('mm-notes').value.trim(),
    tissu: document.getElementById('f-tissu').value.trim(),
    dateRetrait: document.getElementById('f-retrait').value,
    prixTotal: Number(document.getElementById('f-prix').value)||0,
    montantPaye: Number(document.getElementById('f-paye').value)||0,
    statut: editId ? (editingClient||{}).statut || 'en_attente' : 'en_attente',
    dateCreation: editId ? (editingClient||{}).dateCreation : new Date().toISOString(),
    modifiePar: (auth.currentUser && auth.currentUser.email) || '',
    photo: currentPhoto || (editingClient && editingClient.photo) || '',
  };

  // Affichage optimiste : on montre tout de suite, la synchro suit derrière.
  if(editId){
    clients = clients.map(c => c.id===editId ? data : c);
  }else{
    clients.push(data);
  }

  resetForm();
  renderAll();
  goTab('clients');

  const ok = await saveClientRemote(data);

  showToast(
    ok
      ? (editId
          ? "Fiche mise à jour pour toute l'équipe."
          : "Client enregistré pour toute l'équipe.")
      : "La sauvegarde en ligne a échoué, vérifie ta connexion internet."
  );
});

document.getElementById('cancel-edit').addEventListener('click', ()=>{
  resetForm();
  goTab('clients');
});

function resetForm(){
  form.reset();
  currentPhoto = '';

  document.getElementById('photo-preview').style.display = 'none';
  document.getElementById('photo-preview').src = '';

  document.getElementById('edit-id').value='';
  document.getElementById('form-title').textContent = 'Nouveau client';
  document.getElementById('submit-btn').textContent = 'Enregistrer le client';
  document.getElementById('cancel-edit').hidden = true;
  document.getElementById('warn-jour').style.display='none';
  document.getElementById('reste-hint').textContent='';
}

function editClient(id){
  const c = clients.find(x=>x.id===id);
  if(!c) return;

  document.getElementById('edit-id').value = c.id;
  document.getElementById('f-nom').value = c.nom||'';
  document.getElementById('f-tel').value = c.telephone||'';

  const m = c.mesures||{};

  document.getElementById('mm-cou').value = m.cou||'';
  document.getElementById('mm-poitrine').value = m.poitrine||'';
  document.getElementById('mm-taille').value = m.taille||'';
  document.getElementById('mm-bassin').value = m.bassin||'';
  document.getElementById('mm-carrure').value = m.carrure||'';
  document.getElementById('mm-longdos').value = m.longueurDos||'';
  document.getElementById('mm-manche').value = m.longueurManche||'';
  document.getElementById('mm-bras').value = m.tourBras||'';
  document.getElementById('mm-poignet').value = m.tourPoignet||'';
  document.getElementById('mm-genou').value = m.longueurGenou||'';
  document.getElementById('mm-chemise').value = m.longueurChemise||'';
  document.getElementById('mm-totale').value = m.longueurTotale||'';
  document.getElementById('mm-notes').value = c.notesMesures||'';
  document.getElementById('f-tissu').value = c.tissu||'';
  document.getElementById('f-retrait').value = c.dateRetrait||'';
  document.getElementById('f-prix').value = c.prixTotal||'';
  document.getElementById('f-paye').value = c.montantPaye||'';

  currentPhoto = c.photo || '';

  const preview = document.getElementById('photo-preview');

  if(c.photo){
    preview.src = c.photo;
    preview.style.display='block';
  }else{
    preview.style.display='none';
  }

  document.getElementById('form-title').textContent = 'Modifier ' + c.nom;
  document.getElementById('submit-btn').textContent = 'Mettre à jour';
  document.getElementById('cancel-edit').hidden = false;

  updateResteHint();
  goTab('new-client');
}

async function deleteClient(id){
  const c = clients.find(x=>x.id===id);
  if(!c) return;

  if(!confirm(`Supprimer la fiche de ${c.nom} ? Cette action est visible par toute l'équipe.`)) return;

  clients = clients.filter(x=>x.id!==id);
  renderAll();

  await deleteClientRemote(id);

  showToast("Fiche supprimée pour toute l'équipe.");
}

async function setStatut(id, statut){
  const c = clients.find(x=>x.id===id);
  if(!c) return;

  const updated = {...c, statut};

  clients = clients.map(x => x.id===id ? updated : x);

  renderAll();

  await saveClientRemote(updated);
}

// --- Sauvegarde manuelle (export) ---
document.getElementById('export-btn').addEventListener('click', ()=>{
  const blob = new Blob(
    [JSON.stringify(clients, null, 2)],
    {type:'application/json'}
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = `elikem-sauvegarde-${new Date().toISOString().slice(0,10)}.json`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);

  showToast('Sauvegarde téléchargée.');
});

// --- Affichage ---
function renderAll(){
  renderDashboard();
  renderClientsList();
}

function renderDashboard(){
  const enAttente = clients.filter(c=>c.statut!=='livre');

  const retard = clients.filter(
    c=> c.statut!=='livre' &&
    daysUntil(c.dateRetrait)!==null &&
    daysUntil(c.dateRetrait)<0
  );

  const urgent = clients.filter(c=>{
    const du = daysUntil(c.dateRetrait);
    return c.statut!=='livre' &&
      du!==null &&
      du>=0 &&
      du<=1;
  });

  const semaine = clients.filter(c=>{
    const du = daysUntil(c.dateRetrait);
    return c.statut!=='livre' &&
      du!==null &&
      du>=0 &&
      du<=7;
  });

  document.getElementById('m-attente').textContent = enAttente.length;
  document.getElementById('m-semaine').textContent = semaine.length;
  document.getElementById('m-retard').textContent = retard.length;
  document.getElementById('m-total').textContent = clients.length;

  document.getElementById('urgent-list').innerHTML = urgent.length
    ? urgent.map(c=>cardHtml(c)).join('')
    : '<div class="empty">Rien d\'urgent pour le moment.</div>';

  const upcoming = semaine
    .slice()
    .sort((a,b)=> (a.dateRetrait||'').localeCompare(b.dateRetrait||''));

  document.getElementById('upcoming-list').innerHTML = upcoming.length
    ? upcoming.map(c=>cardHtml(c)).join('')
    : '<div class="empty">Aucun retrait prévu dans les 7 prochains jours.</div>';

  document.getElementById('late-list').innerHTML = retard.length
    ? retard.map(c=>cardHtml(c)).join('')
    : '<div class="empty">Aucun retard en cours.</div>';
}

let activeFilter = 'tous';

document.querySelectorAll('.filters button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.filters button').forEach(
      b=>b.classList.remove('active')
    );

    btn.classList.add('active');
    activeFilter = btn.dataset.filter;

    renderClientsList();
  });
});

document.getElementById('search-input').addEventListener(
  'input',
  renderClientsList
);

function renderClientsList(){
  const q = document
    .getElementById('search-input')
    .value
    .trim()
    .toLowerCase();

  let list = clients
    .slice()
    .sort((a,b)=> (a.dateRetrait||'9999').localeCompare(b.dateRetrait||'9999'));

  if(activeFilter!=='tous'){
    list = list.filter(c=>{
      if(activeFilter==='en_attente'){
        return c.statut!=='livre' && c.statut!=='pret';
      }

      return c.statut===activeFilter;
    });
  }

  if(q){
    list = list.filter(c=> c.nom.toLowerCase().includes(q));
  }

  document.getElementById('clients-list').innerHTML = list.length
    ? list.map(c=>cardHtml(c, true)).join('')
    : '<div class="empty">Aucun client trouvé.</div>';
}

function cardHtml(c, withActions){
  const st = statutLabel(c);
  const reste = (c.prixTotal||0) - (c.montantPaye||0);
  const m = c.mesures||{};

  const measureEntries = [
    ['Cou', m.cou],
    ['Poitrine', m.poitrine],
    ['Taille', m.taille],
    ['Bassin', m.bassin],
    ['Carrure', m.carrure],
    ['Manche', m.longueurManche]
  ].filter(([,v])=>v);

  return `<div class="card">
    <div class="card-row">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        ${c.photo ? `<img src="${c.photo}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid var(--line);flex-shrink:0;">` : ''}
        <div>
          <div class="card-name">${escapeHtml(c.nom)}</div>
          <div class="card-sub">${c.tissu ? escapeHtml(c.tissu) : 'Tissu non précisé'} · Retrait : ${fmtDate(c.dateRetrait)}</div>
        </div>
      </div>

      <span class="tag ${st.cls}">${st.text}</span>
    </div>

    <div class="card-sub" style="margin-top:8px;">
      ${c.telephone ? 'Tél : '+escapeHtml(c.telephone)+' · ' : ''}Reste à payer : ${fmtMoney(reste)}
    </div>

    ${measureEntries.length ? `<div class="measures-mini">${measureEntries.map(([l,v])=>`<span>${l}: ${v}cm</span>`).join('')}</div>` : ''}

    ${c.modifiePar ? `<div class="card-sub" style="margin-top:4px;font-size:11px;">Ajouté par ${escapeHtml(c.modifiePar)}</div>` : ''}

    ${withActions ? `<div class="actions">
      <button class="ghost" onclick="editClient('${c.id}')">Modifier</button>
      ${c.statut!=='pret' && c.statut!=='livre' ? `<button class="ghost" onclick="setStatut('${c.id}','pret')">Marquer prêt</button>` : ''}
      ${c.statut!=='livre' ? `<button class="ghost" onclick="setStatut('${c.id}','livre')">Marquer livré</button>` : ''}
      <button class="ghost" onclick="deleteClient('${c.id}')">Supprimer</button>
    </div>` : ''}
  </div>`;
}

function escapeHtml(s){
  return (s||'').replace(
    /[&<>"']/g,
    m => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[m])
  );
}
