import { firebaseConfig } from './firebase-config.js';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

const S = {
  user: null, profile: null, view: 'dashboard', data: {},
  settings: { academyName: 'Micro Training Center', logoUrl: '', studentPortalEnabled: false },
  filters: { student: '' }
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const currentMonth = () => today().slice(0, 7);
const monthStart = () => `${currentMonth()}-01`;
const money = n => new Intl.NumberFormat('en-US').format(Number(n) || 0) + ' MMK';
const dateOnly = v => typeof v === 'string' ? v : (v?.toDate ? v.toDate().toISOString().slice(0,10) : '');

function toast(text, type='') {
  const el = document.createElement('div'); el.className = `toast ${type}`; el.textContent = text;
  $('#toast-root').appendChild(el); setTimeout(() => el.remove(), 3200);
}
function can(permission) {
  return S.profile?.role === 'admin' || (S.profile?.permissions || []).includes('*') || (S.profile?.permissions || []).includes(permission);
}
function navAllowed(view) { return can(view === 'schedule' ? 'schedule' : view); }
async function audit(action, meta={}) {
  if (!S.user) return;
  try { await addDoc(collection(db,'auditLogs'), { action, meta, uid:S.user.uid, user:S.profile?.displayName || S.user.email || 'Staff', time:serverTimestamp() }); } catch (_) {}
}

async function loadCollection(name, sortField='') {
  try {
    const refc = collection(db, name);
    const snap = sortField ? await getDocs(query(refc, orderBy(sortField, 'desc'), limit(500))) : await getDocs(refc);
    return snap.docs.map(d => ({ id:d.id, ...d.data() }));
  } catch (_) {
    try { const snap = await getDocs(collection(db,name)); return snap.docs.map(d=>({id:d.id,...d.data()})); } catch (_) { return []; }
  }
}
async function load() {
  const specs = [['students'],['courses'],['staff'],['batches'],['attendance'],['transactions'],['approvals'],['studentCodes'],['departments'],['users']];
  for (const [n] of specs) S.data[n] = await loadCollection(n);
  try { const q = await getDoc(doc(db,'settings','main')); if (q.exists()) S.settings = {...S.settings,...q.data()}; } catch (_) {}
}

const nav = [
  ['dashboard','⌂','Dashboard'],['students','◉','Students'],['courses','▣','Courses'],['schedule','◷','Schedule'],
  ['attendance','✓','Attendance'],['finance','₵','Finance'],['reports','▤','Reports'],['staff','♙','Staff'],
  ['approvals','⌁','Approvals'],['settings','⚙','Settings']
];

function stat(label, value, hint, icon='') { return `<div class="stat"><span class="stat-icon">${icon}</span><small>${label}</small><strong>${value}</strong><em>${hint}</em></div>`; }
function empty(text='Data မရှိသေးပါ') { return `<div class="empty"><div>◎</div><b>${esc(text)}</b><small>Data ထည့်လိုက်တာနဲ့ ဒီနေရာမှာ အလိုအလျောက်ပေါ်လာပါမယ်။</small></div>`; }
function pageTitle(title, sub, action='') { return `<div class="page-title"><div><span class="eyebrow">MTC ENTERPRISE</span><h1>${title}</h1><p>${sub}</p></div>${action}</div>`; }

function render() {
  const titles = Object.fromEntries(nav.map(x=>[x[0],x[2]]));
  $('#title').textContent = titles[S.view] || 'Dashboard';
  $('#nav').innerHTML = nav.map(([v,i,t]) => `<button class="nav ${S.view===v?'active':''}" data-v="${v}"><span class="nav-ico">${i}</span><span>${t}</span></button>`).join('');
  $('#who').innerHTML = `<span class="who-name">${esc(S.profile?.displayName || 'Staff')}</span><small>${esc(S.profile?.role || 'staff')}</small>`;
  const logo = S.settings.logoUrl || 'assets/logo.svg';
  $('#sideLogo').src = logo; $('#auth-logo').src = logo;
  $('#academy').textContent = S.settings.academyName || 'Micro Training Center';
  $('#view').innerHTML = (views[S.view] || views.dashboard)();
  bind();
}

const views = {
  dashboard() {
    const st=S.data.students||[], co=S.data.courses||[], sf=S.data.staff||[], tx=S.data.transactions||[];
    const m=currentMonth(), mt=tx.filter(x=>String(x.date||'').startsWith(m));
    const inc=mt.filter(x=>x.type==='income').reduce((a,x)=>a+(+x.amount||0),0), ex=mt.filter(x=>x.type==='expense').reduce((a,x)=>a+(+x.amount||0),0);
    const present=(S.data.attendance||[]).filter(x=>x.date===today()&&x.status==='present').length;
    return `<div class="dashboard-wrap">
      <section class="hero"><div><span class="eyebrow">${m} • CLOUD CONNECTED</span><h1>Welcome back, ${esc(S.profile?.displayName||'MTC Team')}.</h1><p>သင်တန်း၊ သင်တန်းသား၊ ဆရာ၊ Attendance နဲ့ Finance ကို တစ်နေရာတည်းကနေ စီမံပါ။</p><div class="hero-actions"><button class="primary" data-act="student">＋ Student အသစ်</button><button class="ghost" data-act="report">Report ကြည့်မယ်</button></div></div><div class="hero-mark">MTC</div></section>
      <div class="stats">${stat('Students',st.length,'စုစုပေါင်း record','◉')}${stat('Courses',co.length,'Active courses','▣')}${stat('Teachers / Staff',sf.length,'Profiles','♙')}${stat('Today Attendance',present,'Present','✓')}</div>
      <div class="grid2"><section class="panel"><div class="panel-head"><div><span class="eyebrow">QUICK ACTIONS</span><h2>နေ့စဉ်အလုပ်များ</h2></div></div><div class="quick">${can('students')?`<button data-act="student"><span>01</span><b>Student အသစ်</b><small>Paid / Day-1 Free + Code Auto Generate</small></button>`:''}${can('courses')?`<button data-act="course"><span>02</span><b>Course အသစ်</b><small>နေရာတိုင်းမှာ Auto selector update</small></button>`:''}${can('attendance')?`<button data-act="attendance"><span>03</span><b>Attendance</b><small>ယနေ့အတွက် တစ်ချက်နှိပ်ပြီး မှတ်တမ်းတင်</small></button>`:''}<button data-act="report"><span>04</span><b>Report Center</b><small>Start / End Date + Detail / Summary</small></button></div></section>
      <section class="panel"><div class="panel-head"><div><span class="eyebrow">MONTHLY CONTROL</span><h2>${m} Period</h2></div><span class="pill green">Cloud</span></div><div class="finance-mini"><div><small>Income</small><b>${money(inc)}</b></div><div><small>Expense</small><b>${money(ex)}</b></div><div><small>Balance</small><b>${money(inc-ex)}</b></div></div><p class="muted">လကုန်သွားရင် အရင်လ record မဖျက်ဘဲ Date/Period အလိုက် သီးခြားပြန်ကြည့်နိုင်ပါတယ်။</p></section></div>
    </div>`;
  },
  students() {
    const all=S.data.students||[], q=(S.filters.student||'').toLowerCase();
    const r=all.filter(s=>[s.name,s.code,s.phone,s.courseName,s.enrollmentType].join(' ').toLowerCase().includes(q));
    return `<div class="content">${pageTitle('Students','သင်တန်းသားစာရင်း • Code • Course • Paid / Day-1 Free',`<button id="addStudent" class="primary">＋ Add Student</button>`)}
      <section class="panel"><div class="toolbar"><input id="studentSearch" value="${esc(S.filters.student)}" placeholder="နာမည် / Code / Phone / Course ရှာရန်"><button id="exp" class="soft">Export E</button></div><div class="table"><table><thead><tr><th>Code</th><th>Name</th><th>Course</th><th>Type</th><th>Phone</th><th>Start</th><th>Status</th></tr></thead><tbody>${r.map(rowStudent).join('')||`<tr><td colspan="7">${empty('Student မရှိသေးပါ')}</td></tr>`}</tbody></table></div></section></div>`;
  },
  courses() {
    const r=S.data.courses||[];
    return `<div class="content">${pageTitle('Course Management','Course အသစ်တစ်ခုထည့်တာနဲ့ Student / Schedule / Report selector တွေမှာ Auto အသုံးပြုနိုင်ပါတယ်။',can('courses')?`<button id="addCourse" class="primary">＋ Add Course</button>`:'')}
      <div class="cards">${r.map(c=>`<article class="course"><div class="course-top"><span class="pill">MTC</span><span class="pill ${c.active===false?'red':'green'}">${c.active===false?'Inactive':'Active'}</span></div><h2>${esc(c.name)}</h2><p>${esc(c.description||'Description မထည့်ရသေးပါ')}</p><div class="course-meta"><b>${money(c.fee)}</b><span>${esc(c.duration||'Duration မသတ်မှတ်ရသေး')}</span></div></article>`).join('')||empty('Course မရှိသေးပါ')}</div></div>`;
  },
  schedule() {
    const b=S.data.batches||[], sf=S.data.staff||[], co=S.data.courses||[];
    const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const cards=b.slice().sort((a,z)=>String(a.day).localeCompare(String(z.day))).map(x=>{const t=sf.find(s=>s.id===x.teacherId); const c=co.find(c=>c.id===x.courseId); return `<article class="schedule-card"><div class="teacher-photo">${t?.photoUrl?`<img src="${esc(t.photoUrl)}">`:(esc((t?.displayName||'T').slice(0,1)))}</div><div class="schedule-main"><div class="schedule-row"><span class="pill">${esc(x.day||'—')}</span><span class="pill">${esc(x.room||'Room —')}</span></div><h2>${esc(x.name||'Batch')}</h2><p class="course-label">${esc(c?.name||x.courseName||'Course')}</p><div class="teacher-line"><b>${esc(t?.displayName||x.teacherName||'Teacher မရွေးရသေး')}</b><span>•</span><span>${esc(x.start||'—')} – ${esc(x.end||'—')}</span></div></div></article>`}).join('');
    return `<div class="content">${pageTitle('Teacher Schedule','ဆရာတစ်ဦးချင်းစီရဲ့ ပုံ၊ ကိုယ်ပိုင်နာမည်၊ Course၊ Batch၊ အချိန်နဲ့ Room ကို တစ်နေရာတည်းမှာကြည့်နိုင်ပါတယ်။',can('schedule')?`<button id="addBatch" class="primary">＋ Add Schedule</button>`:'')}<div class="schedule-grid">${cards||empty('Schedule မရှိသေးပါ')}</div></div>`;
  },
  attendance() {
    const st=S.data.students||[], a=S.data.attendance||[], d=today();
    return `<div class="content">${pageTitle('Attendance','ယနေ့ Attendance ကို လွယ်လွယ်ကူကူမှတ်တမ်းတင်ပါ။',can('attendance')?`<button id="bulk" class="primary">＋ Mark Attendance</button>`:'')}
      <section class="panel"><div class="panel-head"><div><span class="eyebrow">TODAY</span><h2>${d}</h2></div><span class="pill">${a.filter(x=>x.date===d&&x.status==='present').length} Present</span></div>${st.map(s=>{const x=a.find(z=>z.date===d&&z.studentId===s.id);return `<div class="att"><div><b>${esc(s.name)}</b><small>${esc(s.code)} • ${esc(s.courseName||'')}</small></div><button class="soft toggle ${x?.status==='present'?'ok':''}" data-id="${esc(s.id)}" data-status="${x?.status==='present'?'absent':'present'}">${x?.status==='present'?'✓ Present':'Mark Present'}</button></div>`}).join('')||empty('Student မရှိသေးပါ')}</section></div>`;
  },
  finance() {
    const t=S.data.transactions||[], m=currentMonth(), mt=t.filter(x=>String(x.date||'').startsWith(m));
    const i=mt.filter(x=>x.type==='income').reduce((a,x)=>a+(+x.amount||0),0), e=mt.filter(x=>x.type==='expense').reduce((a,x)=>a+(+x.amount||0),0);
    return `<div class="content">${pageTitle('Finance','လက်ရှိလကို Dashboard မှာ သီးခြားပြပြီး အရင်လတွေကို Reports ကနေ ပြန်ကြည့်နိုင်ပါတယ်။',can('finance')?`<button id="addTx" class="primary">＋ Add Transaction</button>`:'')}<div class="stats compact">${stat('This Month Income',money(i),m,'↑')}${stat('This Month Expense',money(e),m,'↓')}${stat('Balance',money(i-e),'Net','₿')}</div><section class="panel"><div class="panel-head"><div><span class="eyebrow">${m}</span><h2>Transactions</h2></div><button id="financeExport" class="soft">Export E</button></div><div class="table"><table><thead><tr><th>Date</th><th>Period</th><th>Type</th><th>Category</th><th>Note</th><th>Amount</th></tr></thead><tbody>${t.slice().sort((a,z)=>String(z.date).localeCompare(String(a.date))).map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.period||String(x.date||'').slice(0,7))}</td><td><span class="pill ${x.type==='income'?'green':'red'}">${esc(x.type)}</span></td><td>${esc(x.category)}</td><td>${esc(x.note)}</td><td><b>${money(x.amount)}</b></td></tr>`).join('')||`<tr><td colspan="6">${empty('Transaction မရှိသေးပါ')}</td></tr>`}</tbody></table></div></section></div>`;
  },
  reports() {
    const start=monthStart(), end=today();
    return `<div class="content">${pageTitle('Report Center','Start Date / End Date ရွေးပြီး အရင်လ၊ လအများကြီး၊ လက်ရှိလ အားလုံးကို ပြန်ကြည့်နိုင်ပါတယ်။','')}
      <section class="panel report-filters"><label>Start Date<input id="rs" type="date" value="${start}"></label><label>End Date<input id="re" type="date" value="${end}"></label><label>Report Type<select id="rt"><option value="summary">Summary</option><option value="detail">Detail</option></select></label><button id="run" class="primary">Generate Report</button></section><section id="report" class="panel">${empty('Generate Report ကိုနှိပ်ပါ')}</section></div>`;
  },
  staff() {
    const r=S.data.staff||[];
    return `<div class="content">${pageTitle('Staff & Teachers','ဝန်ထမ်းတိုင်း ကိုယ်ပိုင် Display Name၊ Photo၊ Department၊ Role နဲ့ Permission ရှိနိုင်ပါတယ်။',can('staff')?`<button id="addStaff" class="primary">＋ Add Staff</button>`:'')}<div class="cards">${r.map(s=>`<article class="staff-card"><div class="teacher-photo">${s.photoUrl?`<img src="${esc(s.photoUrl)}">`:esc((s.displayName||'S').slice(0,1))}</div><h2>${esc(s.displayName||'Staff')}</h2><p>${esc(s.role||'staff')} · ${esc(s.department||'General')}</p><div class="chips">${(s.permissions||[]).slice(0,4).map(x=>`<span>${esc(x)}</span>`).join('')}</div></article>`).join('')||empty('Staff မရှိသေးပါ')}</div></div>`;
  },
  approvals() {
    const r=S.data.approvals||[];
    return `<div class="content">${pageTitle('Approval Workflow','လိုအပ်တဲ့ operation တွေအတွက် approval record ထားနိုင်ပါတယ်။','')}<section class="panel"><div class="table"><table><thead><tr><th>Request</th><th>Requester</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>${r.map(x=>`<tr><td>${esc(x.title)}</td><td>${esc(x.requesterName)}</td><td><span class="pill">${esc(x.status)}</span></td><td>${esc(x.date||dateOnly(x.createdAt))}</td><td>${x.status==='pending'&&can('approve')?`<button class="soft approve" data-id="${esc(x.id)}">Approve</button>`:''}</td></tr>`).join('')||`<tr><td colspan="5">${empty('Approval request မရှိသေးပါ')}</td></tr>`}</tbody></table></div></section></div>`;
  },
  settings() {
    return `<div class="content">${pageTitle('Settings','MTC branding၊ logo၊ Student Portal နဲ့ Data migration settings ကို ဒီနေရာကနေ ထိန်းချုပ်ပါ။','')}
      <div class="grid2"><section class="panel"><span class="eyebrow">BRANDING</span><h2>App Identity</h2><label>Academy Name<input id="setName" value="${esc(S.settings.academyName)}"></label><label>Logo Upload<input id="logo" type="file" accept="image/*"></label><div class="preview"><img src="${esc(S.settings.logoUrl||'assets/logo.svg')}"></div><button id="saveSet" class="primary">Save Settings</button></section>
      <section class="panel"><span class="eyebrow">STUDENT PORTAL</span><h2>Private for now</h2><p class="muted">Code-only Student Portal ကို လောလောဆယ် OFF ထားထားပါတယ်။ Domain ရလာတဲ့အခါ ON လုပ်နိုင်အောင် setting ထားထားပါတယ်။</p><label class="switch"><input id="portal" type="checkbox" ${S.settings.studentPortalEnabled?'checked':''}> Student Portal Enabled</label><hr><span class="eyebrow">DATA SAFETY</span><p>Firestore records မဖျက်ဘဲ Date / Period အလိုက် history ပြန်ကြည့်နိုင်ပါတယ်။</p><p>လက်ရှိ legacy <code>shared_state</code> Data ကို import လုပ်မယ့် migration tool ကို သီးခြားသုံးနိုင်ပါတယ်။</p></section></div>
      <section class="panel"><span class="eyebrow">LEGACY MIGRATION</span><h2>Old shared_state → New Collections</h2><p class="muted">မူရင်း Data ကို မဖျက်ပါ။ Legacy collection name ကို ထည့်ပြီး Import လုပ်ပါက students / courses / batches / expenseCategories / leadSources စတာတွေကို copy လုပ်ပေးပါမယ်။</p><div class="migration-row"><input id="legacyCollection" placeholder="ဥပမာ: micro_training_center" value=""><button id="migrate" class="soft">Import shared_state safely</button></div></section>
    </div>`;
  }
};

function rowStudent(s){return `<tr><td><span class="code">${esc(s.code||'—')}</span></td><td><b>${esc(s.name)}</b></td><td>${esc(s.courseName||'—')}</td><td><span class="pill ${s.enrollmentType==='free'?'yellow':'green'}">${s.enrollmentType==='free'?'Day-1 Free':'Paid'}</span></td><td>${esc(s.phone||'—')}</td><td>${esc(s.startDate||'—')}</td><td>${esc(s.status||'active')}</td></tr>`}

function modal(title, body, save, saveText='Save') {
  $('#modal').innerHTML=`<div class="back"><div class="modal"><header><div><span class="eyebrow">MTC ENTERPRISE</span><h2>${title}</h2></div><button id="close" class="close">×</button></header><div class="modal-body">${body}</div><footer><button id="cancel" class="soft">Cancel</button><button id="save" class="primary">${saveText}</button></footer></div></div>`;
  $('#close').onclick=close; $('#cancel').onclick=close;
  $('#save').onclick=async()=>{try{await save();close();await load();render();toast('Saved successfully','ok')}catch(e){console.error(e);toast(e.message||'Save failed','err')}};
}
function close(){ $('#modal').innerHTML=''; }

function codegen(name, course) {
  const clean = s => String(s||'').normalize('NFKD').replace(/[^A-Za-z0-9]/g,'').toUpperCase();
  const a=clean(name).slice(0,2)||'MT', b=clean(course).slice(0,2)||'C';
  return `${a}${b}${String(Date.now()).slice(-3)}`;
}
async function uniqueStudentCode(name, course) {
  let code=codegen(name,course); let n=0;
  while((S.data.students||[]).some(s=>s.id===code || s.code===code)){ code=`${code.slice(0,4)}${Math.floor(100+Math.random()*900)}`; if(++n>20) throw Error('Student Code Generate မအောင်မြင်ပါ'); }
  return code;
}

function studentForm(){
  const cs=(S.data.courses||[]).filter(c=>c.active!==false);
  if(!cs.length) return toast('Student မထည့်ခင် Course တစ်ခုအရင်ထည့်ပါ','err');
  modal('New Student',`<div class="formgrid"><label>Student Name *<input id="sn" placeholder="ဥပမာ — Mg Mg"></label><label>Enrollment Type *<select id="st"><option value="paid">Paid</option><option value="free">Day-1 Free Pass</option></select></label><label>Course *<select id="sc">${cs.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label><label>Phone <small>(မရှိရင် မထည့်ပါနဲ့)</small><input id="sp" inputmode="tel" placeholder="Optional"></label><label>Start Date<input id="sd" type="date" value="${today()}"></label></div><div class="codebox"><span>SHORT STUDENT CODE</span><strong id="previewCode">Name + Course ထည့်ပြီး Save လုပ်တဲ့အချိန် Auto Generate</strong></div>`,async()=>{
    const n=$('#sn').value.trim(), cid=$('#sc').value, c=cs.find(x=>x.id===cid); if(!n||!c) throw Error('Student Name နဲ့ Course ကို ဖြည့်/ရွေးပါ');
    const code=await uniqueStudentCode(n,c.name); const p={name:n,courseId:cid,courseName:c.name,phone:$('#sp').value.trim(),enrollmentType:$('#st').value,startDate:$('#sd').value,status:'active',code,period:$('#sd').value.slice(0,7),createdAt:serverTimestamp(),updatedAt:serverTimestamp(),createdBy:S.user.uid};
    await setDoc(doc(db,'students',code),p); await setDoc(doc(db,'studentCodes',code),{code,studentName:n,courseName:c.name,type:p.enrollmentType,studentId:code,active:true,createdAt:serverTimestamp()}); await audit('student_code_generated',{code,name:n,course:c.name,type:p.enrollmentType});
    navigator.clipboard?.writeText(code).catch(()=>{}); toast(`Student Code: ${code} (Copy လုပ်ပြီးပါပြီ)`,'ok');
  },'Generate & Save');
}
function courseForm(){modal('Add Course',`<div class="formgrid"><label>Course Name *<input id="cn" placeholder="ဥပမာ — Excel Basic"></label><label>Fee<input id="cf" type="number" min="0" value="0"></label><label>Duration<input id="cd" placeholder="ဥပမာ — 1 Month"></label><label>Description<textarea id="cx" placeholder="Course အကြောင်း"></textarea></label></div>`,async()=>{let n=$('#cn').value.trim();if(!n)throw Error('Course Name ထည့်ပါ');await addDoc(collection(db,'courses'),{name:n,fee:+$('#cf').value||0,duration:$('#cd').value.trim(),description:$('#cx').value.trim(),active:true,createdAt:serverTimestamp(),createdBy:S.user.uid});await audit('course_created',{name:n})})}
function batchForm(){const cs=(S.data.courses||[]).filter(c=>c.active!==false), sf=(S.data.staff||[]).filter(s=>['teacher','staff','manager','admin'].includes(s.role||'staff'));if(!cs.length)return toast('Course အရင်ထည့်ပါ','err');modal('Teacher Schedule',`<div class="formgrid"><label>Batch Name<input id="bn" placeholder="ဥပမာ — Batch 01"></label><label>Course<select id="bc">${cs.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label><label>Teacher<select id="bt"><option value="">-- Teacher ရွေးပါ --</option>${sf.map(s=>`<option value="${esc(s.id)}">${esc(s.displayName)}</option>`).join('')}</select></label><label>Day<select id="bd"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option></select></label><label>Start<input id="bs" type="time"></label><label>End<input id="be" type="time"></label><label>Room<input id="br" placeholder="Room / Zoom"></label></div>`,async()=>{const t=sf.find(s=>s.id===$('#bt').value), c=cs.find(x=>x.id===$('#bc').value);await addDoc(collection(db,'batches'),{name:$('#bn').value.trim()||'Batch',courseId:c?.id||'',courseName:c?.name||'',teacherId:t?.id||'',teacherName:t?.displayName||'',teacherPhoto:t?.photoUrl||'',day:$('#bd').value,start:$('#bs').value,end:$('#be').value,room:$('#br').value.trim(),active:true,createdAt:serverTimestamp(),createdBy:S.user.uid});await audit('schedule_created',{course:c?.name,teacher:t?.displayName})})}
function staffForm(){if(!can('staff'))return toast('Permission မရှိပါ','err');modal('Staff / Teacher Profile',`<div class="formgrid"><label>Display Name *<input id="fn" placeholder="ဝန်ထမ်းကိုယ်ပိုင်နာမည်"></label><label>Role<select id="fr"><option value="staff">Staff</option><option value="teacher">Teacher</option><option value="manager">Manager</option></select></label><label>Department<select id="fd"><option>General</option><option>Administration</option><option>Academic</option><option>Finance</option><option>Marketing</option><option>HR</option><option>IT</option></select></label><label>Photo URL<input id="fp" placeholder="Photo URL (optional)"></label><label>Permissions<input id="fq" value="dashboard,students,courses,schedule,attendance,finance,reports"></label></div><p class="muted">မှတ်ချက် — Firebase Auth account ကို Client-side မှာ password သိမ်းပြီးဖန်တီးခြင်း မလုပ်ပါ။ Staff profile ကို ဒီနေရာမှာ စီမံပြီး login account provisioning ကို Firebase/Backend မှာ လုံခြုံစွာလုပ်ရပါမယ်။</p>`,async()=>{const n=$('#fn').value.trim();if(!n)throw Error('Display Name ထည့်ပါ');await addDoc(collection(db,'staff'),{displayName:n,role:$('#fr').value,department:$('#fd').value,photoUrl:$('#fp').value.trim(),permissions:$('#fq').value.split(',').map(x=>x.trim()).filter(Boolean),createdAt:serverTimestamp(),createdBy:S.user.uid});await audit('staff_profile_created',{name:n,role:$('#fr').value})})}
function txForm(){modal('Add Transaction',`<div class="formgrid"><label>Date<input id="td" type="date" value="${today()}"></label><label>Type<select id="tt"><option value="income">Income</option><option value="expense">Expense</option></select></label><label>Category<input id="tc" placeholder="ဥပမာ — Course Fee / Rent"></label><label>Amount<input id="ta" type="number" min="0" placeholder="0"></label><label>Note<textarea id="tn" placeholder="မှတ်ချက်"></textarea></label></div>`,async()=>{const d=$('#td').value;if(!d)throw Error('Date ထည့်ပါ');await addDoc(collection(db,'transactions'),{date:d,period:d.slice(0,7),type:$('#tt').value,category:$('#tc').value.trim(),amount:+$('#ta').value||0,note:$('#tn').value.trim(),createdAt:serverTimestamp(),createdBy:S.user.uid});await audit('transaction_created',{date:d,type:$('#tt').value,amount:+$('#ta').value||0})})}
function attendanceForm(){const st=S.data.students||[];if(!st.length)return toast('Student မရှိသေးပါ','err');modal('Mark Attendance',`<label>Date<input id="ad" type="date" value="${today()}"></label><div class="bulk">${st.map(s=>`<label><input type="checkbox" value="${esc(s.id)}"> <span><b>${esc(s.name)}</b><small>${esc(s.code)} • ${esc(s.courseName||'')}</small></span></label>`).join('')}</div>`,async()=>{const d=$('#ad').value,b=writeBatch(db);$$('.bulk input:checked').forEach(i=>b.set(doc(collection(db,'attendance')),{studentId:i.value,date:d,period:d.slice(0,7),status:'present',markedBy:S.user.uid,createdAt:serverTimestamp()}));await b.commit();await audit('attendance_bulk_marked',{date:d,count:$$('.bulk input:checked').length})})}
async function markAttendance(id,status){const d=today(), old=(S.data.attendance||[]).find(x=>x.date===d&&x.studentId===id);if(old)await updateDoc(doc(db,'attendance',old.id),{status,updatedAt:serverTimestamp()});else await addDoc(collection(db,'attendance'),{studentId:id,date:d,period:d.slice(0,7),status,markedBy:S.user.uid,createdAt:serverTimestamp()});await load();render()}
function csv(rows,name){if(!rows.length)return toast('Export လုပ်ရန် Data မရှိပါ','err');const keys=[...new Set(rows.flatMap(x=>Object.keys(x)))];const s='\ufeff'+[keys.join(','),...rows.map(x=>keys.map(k=>`"${String(x[k]??'').replaceAll('"','""')}"`).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/csv;charset=utf-8'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

async function report(){const s=$('#rs').value,e=$('#re').value,type=$('#rt').value;if(!s||!e||s>e)return toast('Start Date / End Date မှန်အောင်ရွေးပါ','err');const st=(S.data.students||[]).filter(x=>{const d=x.startDate||dateOnly(x.createdAt);return d>=s&&d<=e});const at=(S.data.attendance||[]).filter(x=>x.date>=s&&x.date<=e);const tx=(S.data.transactions||[]).filter(x=>(x.date||'')>=s&&(x.date||'')<=e);const inc=tx.filter(x=>x.type==='income').reduce((a,x)=>a+(+x.amount||0),0),ex=tx.filter(x=>x.type==='expense').reduce((a,x)=>a+(+x.amount||0),0);const days=new Set(at.filter(x=>x.status==='present').map(x=>x.date)).size;
  if(type==='summary'){$('#report').innerHTML=`<div class="report-head"><div><span class="eyebrow">SUMMARY</span><h2>${s} → ${e}</h2></div><button id="download" class="primary">Download E</button></div><div class="stats compact">${stat('New Students',st.length,'Enrolled','◉')}${stat('Present Marks',at.filter(x=>x.status==='present').length,'Attendance','✓')}${stat('Active Days',days,'Attendance days','◷')}${stat('Income',money(inc),'','↑')}${stat('Expense',money(ex),'','↓')}${stat('Balance',money(inc-ex),'','₿')}</div>`;$('#download').onclick=()=>csv([{startDate:s,endDate:e,newStudents:st.length,presentMarks:at.filter(x=>x.status==='present').length,attendanceDays:days,income:inc,expense:ex,balance:inc-ex}],'MTC_Summary_Report.csv')}
  else {const rows=[...tx.map(x=>({date:x.date,period:x.period||x.date?.slice(0,7),type:x.type,student:x.note||'',code:'',amount:x.amount,status:''})),...at.map(x=>{const z=st.find(q=>q.id===x.studentId)||(S.data.students||[]).find(q=>q.id===x.studentId)||{};return{date:x.date,period:x.period||x.date?.slice(0,7),type:'attendance',student:z.name||'',code:z.code||'',amount:'',status:x.status}})].sort((a,b)=>String(a.date).localeCompare(String(b.date)));$('#report').innerHTML=`<div class="report-head"><div><span class="eyebrow">DETAIL</span><h2>${s} → ${e}</h2></div><button id="download" class="primary">Download E</button></div><div class="table"><table><thead><tr><th>Date</th><th>Period</th><th>Type</th><th>Student</th><th>Code</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.period)}</td><td>${esc(x.type)}</td><td>${esc(x.student)}</td><td>${esc(x.code)}</td><td>${x.amount?money(x.amount):'—'}</td><td>${esc(x.status)}</td></tr>`).join('')||`<tr><td colspan="7">${empty('Data မရှိပါ')}</td></tr>`}</tbody></table></div>`;$('#download').onclick=()=>csv(rows,'MTC_Detail_Report.csv')}}

async function saveSettings(){if(!can('settings'))return toast('Permission မရှိပါ','err');await setDoc(doc(db,'settings','main'),{academyName:$('#setName').value.trim()||'Micro Training Center',studentPortalEnabled:$('#portal').checked,updatedAt:serverTimestamp(),updatedBy:S.user.uid},{merge:true});await audit('settings_updated',{});await load();render();toast('Settings saved','ok')}
async function uploadLogo(e){const f=e.target.files?.[0];if(!f)return;if(f.size>2*1024*1024)return toast('Logo 2MB အောက်ဖြစ်ရပါမယ်','err');if(!f.type.startsWith('image/'))return toast('Image file ပဲရွေးပါ','err');const r=ref(storage,`branding/logo-${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]/g,'')}`);await uploadBytes(r,f);const u=await getDownloadURL(r);await setDoc(doc(db,'settings','main'),{logoUrl:u},{merge:true});await audit('logo_updated',{});await load();render();toast('Logo updated','ok')}

async function migrateLegacy(){if(!can('settings'))return toast('Permission မရှိပါ','err');const collectionName=$('#legacyCollection').value.trim();if(!collectionName)return toast('Legacy collection name ထည့်ပါ','err');try{const snap=await getDoc(doc(db,collectionName,'shared_state'));if(!snap.exists())throw Error('shared_state document မတွေ့ပါ');const old=snap.data()||{};let count=0;const batch=writeBatch(db);const addArray=(field,target,mapper)=>{for(const item of Array.isArray(old[field])?old[field]:[]){const mapped=mapper(item);const id=mapped.id||`${target}_${Date.now()}_${count}`;batch.set(doc(db,target,id),mapped,{merge:true});count++;}};
  addArray('courses','courses',x=>({id:x.id,name:x.name||'Course',fee:Number(x.fee)||0,active:true,legacy:true}));
  addArray('batches','batches',x=>({id:x.id,name:x.name||'Batch',attendanceCount:x.attendanceCount||0,scheduled:x.schedule||x.scheduled||'',room:x.room||'',legacy:true}));
  addArray('expenseCategories','expenseCategories',x=>({id:x.id,name:x.name||String(x),legacy:true}));
  addArray('leadSources','leadSources',x=>({id:x.id,name:x.name||String(x),legacy:true}));
  await batch.commit();await audit('legacy_migration',{collectionName,count});await load();render();toast(`Legacy migration completed: ${count} records copied`,'ok');
} catch(e){toast(e.message||'Migration failed','err')}}

function bind(){
  $$('#nav .nav').forEach(b=>b.onclick=()=>{const v=b.dataset.v;if(!navAllowed(v))return toast('Permission မရှိပါ','err');S.view=v;render()});
  $('#newStudent')?.addEventListener('click',studentForm); $('#addStudent')?.addEventListener('click',studentForm); $('#addCourse')?.addEventListener('click',courseForm); $('#addBatch')?.addEventListener('click',batchForm); $('#addStaff')?.addEventListener('click',staffForm); $('#addTx')?.addEventListener('click',txForm); $('#bulk')?.addEventListener('click',attendanceForm);
  $('#exp')?.addEventListener('click',()=>csv(S.data.students||[],'MTC_Students.csv')); $('#financeExport')?.addEventListener('click',()=>csv(S.data.transactions||[],'MTC_Finance.csv')); $('#run')?.addEventListener('click',report);
  $('#studentSearch')?.addEventListener('input',e=>{S.filters.student=e.target.value;render()});
  $$('.toggle').forEach(b=>b.onclick=()=>markAttendance(b.dataset.id,b.dataset.status));
  $$('.approve').forEach(b=>b.onclick=async()=>{try{await updateDoc(doc(db,'approvals',b.dataset.id),{status:'approved',approvedBy:S.user.uid,approvedAt:serverTimestamp()});await audit('approval_approved',{id:b.dataset.id});await load();render()}catch(e){toast(e.message,'err')}});
  $('#saveSet')?.addEventListener('click',saveSettings); $('#logo')?.addEventListener('change',e=>uploadLogo(e).catch(err=>toast(err.message,'err'))); $('#migrate')?.addEventListener('click',migrateLegacy);
  $$('[data-act]').forEach(b=>b.onclick=()=>{const a=b.dataset.act;if(a==='student')studentForm();if(a==='course')courseForm();if(a==='attendance')attendanceForm();if(a==='report'){S.view='reports';render()}});
}

$$('.tabs button').forEach(b=>b.onclick=()=>{$$('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#googlePanel').classList.toggle('hide',b.dataset.tab!=='google');$('#passPanel').classList.toggle('hide',b.dataset.tab!=='password')});
$('#googleLogin').onclick=async()=>{try{await signInWithPopup(auth,new GoogleAuthProvider())}catch(e){toast(e.message||'Google login failed','err')}};
$('#passLogin').onclick=async()=>{const u=$('#username').value.trim().toLowerCase(),p=$('#password').value;if(!u||!p)return toast('Username / Password ထည့်ပါ','err');try{await signInWithEmailAndPassword(auth,u+'@mtc.local',p)}catch(e){toast('Username / Password Login မအောင်မြင်ပါ','err')}};
$('#logout').onclick=()=>signOut(auth); $('#menu').onclick=()=>document.querySelector('aside').classList.toggle('open');

async function ensureProfile(u){
  const pRef=doc(db,'users',u.uid), p=await getDoc(pRef);
  if(p.exists()) return {id:p.id,...p.data()};
  // First-time setup: the first authenticated Google account is intended to be the initial admin.
  // After setup, admins should change/verify roles in Firestore. This avoids storing passwords in the app.
  let role='staff', permissions=['dashboard','students','courses','schedule','attendance','reports'];
  try {
    const setupRef=doc(db,'settings','main'); const setup=await getDoc(setupRef);
    if(!setup.exists() || setup.data().setupComplete!==true){ role='admin'; permissions=['*']; await setDoc(setupRef,{setupComplete:true,setupBy:u.uid,setupAt:serverTimestamp()},{merge:true}); }
  } catch (_) {}
  const profile={displayName:u.displayName||'MTC Staff',email:u.email||'',role,department:'General',permissions,photoUrl:u.photoURL||''};
  await setDoc(pRef,profile); S.profile=profile; await audit('profile_created',{role}); return {id:u.uid,...profile};
}

onAuthStateChanged(auth,async u=>{S.user=u;if(!u){$('#auth').classList.remove('hide');$('#app').classList.add('hide');return}try{S.profile=await ensureProfile(u);$('#auth').classList.add('hide');$('#app').classList.remove('hide');await load();render()}catch(e){console.error(e);toast('Profile/Data access မအောင်မြင်ပါ — Firestore Rules ကို စစ်ပါ','err');await signOut(auth)}});
