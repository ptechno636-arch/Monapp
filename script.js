let clients = [];
const STORAGE_KEY = 'atelier-clients-data';

function loadClients(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    clients = raw ? JSON.parse(raw) : [];
  }catch(e){
    clients = [];
  }
  renderAll();
}

function persist(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
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

// --- Enregistrement du formulaire ---
const form = document.getElementById('client-form');
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const nom = document.getElementById('f-nom').value.trim();
  if(!nom){ showToast('Le nom du client est obligatoire.'); return; }

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
    longueurTotale: document.getElementById('mm-totale').value,
  };

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
    statut: editId ? (clients.find(c=>c.id===editId)||{}).statut || 'en_attente' : 'en_attente',
    dateCreation: editId ? (clients.find(c=>c.id===editId)||{}).dateCreation : new Date().toISOString(),
  };

  if(editId){
    clients = clients.map(c => c.id===editId ? data : c);
  }else{
    clients.push(data);
  }

  resetForm();
  renderAll();
  goTab('clients');

  const ok = persist();
  showToast(ok ? (editId ? 'Fiche mise à jour.' : 'Client enregistré.') : "Attention : la sauvegarde a échoué sur cet appareil.");
});

document.getElementById('cancel-edit').addEventListener('click', ()=>{
  resetForm();
  goTab('clients');
});

function resetForm(){
  form.reset();
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
  document.getElementById('mm-totale').value = m.longueurTotale||'';
  document.getElementById('mm-notes').value = c.notesMesures||'';
  document.getElementById('f-tissu').value = c.tissu||'';
  document.getElementById('f-retrait').value = c.dateRetrait||'';
  document.getElementById('f-prix').value = c.prixTotal||'';
  document.getElementById('f-paye').value = c.montantPaye||'';
  document.getElementById('form-title').textContent = 'Modifier ' + c.nom;
  document.getElementById('submit-btn').textContent = 'Mettre à jour';
  document.getElementById('cancel-edit').hidden = false;
  updateResteHint();
  goTab('new-client');
}

function deleteClient(id){
  const c = clients.find(x=>x.id===id);
  if(!c) return;
  if(!confirm(`Supprimer la fiche de ${c.nom} ?`)) return;
  clients = clients.filter(x=>x.id!==id);
  persist();
  renderAll();
  showToast('Fiche supprimée.');
}

function setStatut(id, statut){
  clients = clients.map(c => c.id===id ? {...c, statut} : c);
  persist();
  renderAll();
}

// --- Sauvegarde manuelle (export / import) ---
document.getElementById('export-btn').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(clients, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `atelier-sauvegarde-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Sauvegarde téléchargée.');
});

document.getElementById('import-input').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      const data = JSON.parse(ev.target.result);
      if(!Array.isArray(data)) throw new Error('format invalide');
      clients = data;
      persist();
      renderAll();
      showToast('Sauvegarde importée avec succès.');
    }catch(err){
      showToast("Ce fichier n'est pas une sauvegarde valide.");
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// --- Affichage ---
function renderAll(){
  renderDashboard();
  renderClientsList();
}

function renderDashboard(){
  const enAttente = clients.filter(c=>c.statut!=='livre');
  const retard = clients.filter(c=> c.statut!=='livre' && daysUntil(c.dateRetrait)!==null && daysUntil(c.dateRetrait)<0);
  const semaine = clients.filter(c=>{
    const du = daysUntil(c.dateRetrait);
    return c.statut!=='livre' && du!==null && du>=0 && du<=7;
  });

  document.getElementById('m-attente').textContent = enAttente.length;
  document.getElementById('m-semaine').textContent = semaine.length;
  document.getElementById('m-retard').textContent = retard.length;
  document.getElementById('m-total').textContent = clients.length;

  const upcoming = semaine.slice().sort((a,b)=> (a.dateRetrait||'').localeCompare(b.dateRetrait||''));
  document.getElementById('upcoming-list').innerHTML = upcoming.length ? upcoming.map(c=>cardHtml(c)).join('') :
    '<div class="empty">Aucun retrait prévu dans les 7 prochains jours.</div>';

  document.getElementById('late-list').innerHTML = retard.length ? retard.map(c=>cardHtml(c)).join('') :
    '<div class="empty">Aucun retard en cours.</div>';
}

let activeFilter = 'tous';
document.querySelectorAll('.filters button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderClientsList();
  });
});
document.getElementById('search-input').addEventListener('input', renderClientsList);

function renderClientsList(){
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  let list = clients.slice().sort((a,b)=> (a.dateRetrait||'9999').localeCompare(b.dateRetrait||'9999'));
  if(activeFilter!=='tous') list = list.filter(c=>{
    if(activeFilter==='en_attente') return c.statut!=='livre' && c.statut!=='pret';
    return c.statut===activeFilter;
  });
  if(q) list = list.filter(c=> c.nom.toLowerCase().includes(q));

  document.getElementById('clients-list').innerHTML = list.length ? list.map(c=>cardHtml(c, true)).join('') :
    '<div class="empty">Aucun client trouvé.</div>';
}

function cardHtml(c, withActions){
  const st = statutLabel(c);
  const reste = (c.prixTotal||0) - (c.montantPaye||0);
  const m = c.mesures||{};
  const measureEntries = [
    ['Cou', m.cou], ['Poitrine', m.poitrine], ['Taille', m.taille], ['Bassin', m.bassin],
    ['Carrure', m.carrure], ['Manche', m.longueurManche]
  ].filter(([,v])=>v);

  return `<div class="card">
    <div class="card-row">
      <div>
        <div class="card-name">${escapeHtml(c.nom)}</div>
        <div class="card-sub">${c.tissu ? escapeHtml(c.tissu) : 'Tissu non précisé'} · Retrait : ${fmtDate(c.dateRetrait)}</div>
      </div>
      <span class="tag ${st.cls}">${st.text}</span>
    </div>
    <div class="card-sub" style="margin-top:8px;">
      ${c.telephone ? 'Tél : '+escapeHtml(c.telephone)+' · ' : ''}Reste à payer : ${fmtMoney(reste)}
    </div>
    ${measureEntries.length ? `<div class="measures-mini">${measureEntries.map(([l,v])=>`<span>${l}: ${v}cm</span>`).join('')}</div>` : ''}
    ${withActions ? `<div class="actions">
      <button class="ghost" onclick="editClient('${c.id}')">Modifier</button>
      ${c.statut!=='pret' && c.statut!=='livre' ? `<button class="ghost" onclick="setStatut('${c.id}','pret')">Marquer prêt</button>` : ''}
      ${c.statut!=='livre' ? `<button class="ghost" onclick="setStatut('${c.id}','livre')">Marquer livré</button>` : ''}
      <button class="ghost" onclick="deleteClient('${c.id}')">Supprimer</button>
    </div>` : ''}
  </div>`;
}

function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

loadClients();
