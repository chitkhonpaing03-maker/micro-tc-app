
    const FOUNDER_GMAIL = "chitkhonpaing03@gmail.com";
    const LOCAL_STORAGE_KEY = "MICRO_TC_ENTERPRISE_STATE_V3";

    const firebaseConfig = {
      apiKey: "AIzaSyA_FVMmgcE11h09sB8nhFpc0C3BSzq2Qek",
      authDomain: "micro-training-center.firebaseapp.com",
      projectId: "micro-training-center",
      storageBucket: "micro-training-center.firebasestorage.app",
      messagingSenderId: "535516234007",
      appId: "1:535516234007:web:3c8844c8196c39023f3752",
      measurementId: "G-35Y4E4BBFE"
    };

    // Myanmar Cities Coordinates for Live Weather
    const MYANMAR_CITIES = {
      yangon: { name: 'ရန်ကုန်', lat: 16.8409, lon: 96.1735 },
      mandalay: { name: 'မန္တလေး', lat: 21.9588, lon: 96.0891 },
      naypyidaw: { name: 'နေပြည်တော်', lat: 19.7633, lon: 96.0785 },
      taunggyi: { name: 'တောင်ကြီး', lat: 20.7892, lon: 97.0378 },
      mawlamyine: { name: 'မော်လမြိုင်', lat: 16.4905, lon: 97.6282 },
      bago: { name: 'ပဲခူး', lat: 17.3352, lon: 96.4814 },
      monywa: { name: 'မုံရွာ', lat: 22.1086, lon: 95.1358 },
      pathein: { name: 'ပုသိမ်', lat: 16.7792, lon: 94.7321 }
    };

    const defaultData = {
      usdRate: 3550,
      courses: [
        { id: 'c1', name: 'Advance Excel', fee: 50000 },
        { id: 'c2', name: 'Excel for Job Training', fee: 35000 }
      ],
      paymentMethods: [
        'KBZPay', 'WavePay', 'CB Pay', 'AYA Pay', 'UAB Pay', 'OK$',
        'KBZ Bank', 'CB Bank', 'AYA Bank', 'Yoma Bank', 'UAB Bank', 'MAB Bank', 'Cash (ငွေသား)'
      ],
      leadSources: ['Facebook Page Messenger', 'Facebook Ads', 'TikTok', 'Telegram', 'Viber', 'Phone Call'],
      users: [
        {
          id: 'u_founder',
          name: 'Chit Khon Paing (Founder)',
          email: FOUNDER_GMAIL,
          role: 'FOUNDER',
          roles: ['FOUNDER', 'ADMIN', 'MANAGER', 'FINANCE', 'SALES', 'PURCHASE', 'ACADEMIC', 'PAGE_ADMIN'],
          approved: true
        }
      ],
      leads: [],
      expenses: [],
      scripts: [
        {
          id: 'sc1',
          title: '🔥 သင်တန်းကြေးနှင့် KPay အကောင့်ပို့ရန် စာသား',
          body: 'မင်္ဂလာပါရှင့်။ Micro Computer Training Center မှ ကြိုဆိုပါတယ်။ သင်တန်းကြေးကို KBZPay / WavePay ဖြင့် ပေးသွင်းပြီးပါက ပြေစာ Screenshot ပို့ပေးပါရှင့်။ ချက်ချင်း သင်တန်း Group ထဲသို့ ထည့်သွင်းပေးပါမည်။',
          by: 'Founder',
          date: new Date().toISOString().slice(0, 10)
        }
      ],
      batches: [
        {
          id: 'b1',
          name: 'Advance Excel - Online Zoom Batch 1',
          schedule: 'Mon, Wed, Fri (8:00 PM - 9:30 PM)',
          zoom: 'Zoom ID: 882 9910 3341',
          attendanceCount: 0
        }
      ],
      auditLogs: []
    };

    // ================= ENTERPRISE DATA (ADDITIVE — ORIGINAL DATA KEPT) =================
    Object.assign(defaultData, {
      customers: [], students: [], generatedCodes: [], teachers: [], schedules: [], attendance: [],
      notifications: [], invoices: [], certificates: [],
      departments: [
        {id:'D_SALES',name:'Sales Department',active:true},{id:'D_PURCHASE',name:'Purchase Department',active:true},
        {id:'D_PAGE',name:'Page Admin Department',active:true},{id:'D_TEACHER',name:'Teacher Department',active:true},
        {id:'D_HR',name:'HR Department',active:true},{id:'D_ACCOUNT',name:'Accountant Department',active:true},
        {id:'D_MANAGER',name:'Manager Department',active:true}
      ],
      permissions: {
        ADMIN:{View:true,Add:true,Edit:true,Delete:true,Approve:true,Export:true,Report:true,Settings:true},
        MANAGER:{View:true,Add:true,Edit:true,Delete:false,Approve:true,Export:true,Report:true,Settings:false},
        SALES:{View:true,Add:true,Edit:true,Delete:false,Approve:false,Export:true,Report:true,Settings:false},
        PURCHASE:{View:true,Add:true,Edit:true,Delete:false,Approve:false,Export:true,Report:true,Settings:false},
        PAGE_ADMIN:{View:true,Add:true,Edit:true,Delete:false,Approve:false,Export:true,Report:true,Settings:false},
        ACADEMIC:{View:true,Add:true,Edit:true,Delete:false,Approve:false,Export:true,Report:true,Settings:false},
        FINANCE:{View:true,Add:true,Edit:true,Delete:false,Approve:true,Export:true,Report:true,Settings:false},
        TEACHER:{View:true,Add:true,Edit:true,Delete:false,Approve:false,Export:false,Report:false,Settings:false},
        HR:{View:true,Add:true,Edit:true,Delete:false,Approve:true,Export:true,Report:true,Settings:false}
      },
      settings:{brandName:'MTC',logoData:'',studentPortalEnabled:false,aiProvider:'Gemini',defaultStudentType:'Paid Student',codePrefix:'MTC',monthlyCloseDay:28},
      monthlyClosures:[], importHistory:[]
    });

    // Load initial state from LocalStorage or Default
    let state = (() => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...defaultData, ...parsed };
        }
      } catch (e) {}
      return JSON.parse(JSON.stringify(defaultData));
    })();

    let auth = null;
    let db = null;
    let sharedDocRef = null;
    let currentAuthUser = null;
    let currentLeadFilter = 'ALL';
    let currentActiveTab = 'dashboard';
    let lastAiAnalysis = null;
    let tempAttachedImageName = '';

    // Animated Toast Notification Helper
    window.showToast = (message, type = 'success') => {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      const bgClass = type === 'error' ? 'bg-rose-600 text-white' : 'bg-micro-navy text-micro-yellow border border-micro-yellow';
      toast.className = `animate-modal-pop px-4 py-2.5 rounded-2xl shadow-xl text-xs font-extrabold flex items-center gap-2 ${bgClass}`;
      toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i><span>${message}</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 2800);
    };

    // ================= 1. LIVE MYANMAR TIME & WEATHER ENGINE =================
    window.fetchMyanmarWeather = async (cityKey = 'yangon') => {
      const city = MYANMAR_CITIES[cityKey] || MYANMAR_CITIES.yangon;
      const tempEl = document.getElementById('widgetWeatherTemp');
      const iconEl = document.getElementById('widgetWeatherIcon');
      if (tempEl) tempEl.textContent = '...';

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FYangon`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.current) {
          const t = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;
          let desc = 'နေသာ';
          let icon = 'fa-sun';

          if (code >= 1 && code <= 3) { desc = 'တိမ်အသင့်အတင့်'; icon = 'fa-cloud-sun'; }
          else if (code >= 45 && code <= 48) { desc = 'မြူဆိုင်း'; icon = 'fa-smog'; }
          else if (code >= 51 && code <= 67) { desc = 'မိုးရွာ'; icon = 'fa-cloud-rain'; }
          else if (code >= 80 && code <= 99) { desc = 'မိုးထစ်ချုန်း'; icon = 'fa-cloud-bolt'; }

          if (tempEl) tempEl.textContent = `${t}°C (${desc})`;
          if (iconEl) iconEl.className = `fa-solid ${icon} text-micro-yellow`;
        }
      } catch (e) {
        if (tempEl) tempEl.textContent = `32°C (နေသာ)`;
      }
    };

    function startLiveMyanmarWidgets() {
      const updateClock = () => {
        try {
          const now = new Date();
          const timeStr = now.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Yangon',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
          const dateStr = now.toLocaleDateString('en-GB', {
            timeZone: 'Asia/Yangon',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          const clockEl = document.getElementById('widgetClock');
          if (clockEl) clockEl.textContent = `MMT: ${dateStr} • ${timeStr}`;
        } catch (e) {}
      };
      updateClock();
      setInterval(updateClock, 1000);
      window.fetchMyanmarWeather('yangon');
    }
    startLiveMyanmarWidgets();

    // ================= 2. MODAL & DRAWER CONTROLS (ALWAYS ACTIVE) =================
    window.openModal = (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('hidden');
        el.classList.add('flex');
      }
    };

    window.closeModal = (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('flex');
        el.classList.add('hidden');
      }
    };

    window.toggleDrawer = (open) => {
      const overlay = document.getElementById('drawerOverlay');
      if (!overlay) return;
      if (open) {
        overlay.classList.remove('hidden');
      } else {
        overlay.classList.add('hidden');
      }
    };

    // ================= 3. USER AUTH & PERMISSION HELPERS =================
    function renderDynamicDepartmentMenu(){const host=document.getElementById('dynamicDeptMenu');if(!host)return;const fixed=['D_SALES','D_PURCHASE','D_PAGE','D_TEACHER','D_HR','D_ACCOUNT','D_MANAGER'];const extra=(state.departments||[]).filter(d=>d.active!==false&&!fixed.includes(d.id));host.innerHTML=extra.map(d=>{const role=(d.id||'').replace(/^D_/,'');return `<div class="rounded-2xl border border-white/10 overflow-hidden"><button onclick="window.switchTab('enterprise');window.setEnterprisePanel('reports','${esc(role)}')" class="w-full flex items-center justify-between px-3.5 py-3 text-xs font-extrabold hover:bg-white/10"><span class="flex items-center gap-3"><i class="fa-solid fa-building w-5 text-center text-micro-yellow"></i><span>${esc(d.name)}</span></span><i class="fa-solid fa-chevron-right text-[10px]"></i></button></div>`}).join('');}

    function getActiveUser() {
      if (!currentAuthUser) return { approved: false, roles: [] };
      const email = (currentAuthUser.email || '').toLowerCase();
      const isFounder = email === FOUNDER_GMAIL.toLowerCase();
      let u = state.users.find(x => (x.email || '').toLowerCase() === email);
      if (!u && isFounder) {
        u = {
          id: 'u_founder',
          name: 'Chit Khon Paing (Founder)',
          email: FOUNDER_GMAIL,
          role: 'FOUNDER',
          roles: ['FOUNDER', 'ADMIN', 'MANAGER', 'FINANCE', 'SALES', 'PURCHASE', 'ACADEMIC', 'PAGE_ADMIN'],
          approved: true
        };
      }
      if (!u) return { approved: false, roles: [] };
      const roles = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role || 'PAGE_ADMIN'];
      return { ...u, roles };
    }

    function hasDeptAccess(deptList) {
      const u = getActiveUser();
      if (!u.approved) return false;
      if (u.roles.includes('FOUNDER') || u.roles.includes('ADMIN')) return true;
      return deptList.some(d => u.roles.includes(d));
    }

    function canViewFinance() {
      return hasDeptAccess(['FINANCE']);
    }

    async function addAuditLog(actionText) {
      const u = getActiveUser();
      const entry = {
        id: 'log_' + Date.now(),
        user: u.name || (currentAuthUser && currentAuthUser.email) || 'Staff',
        action: actionText,
        time: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Yangon' })
      };
      if (!Array.isArray(state.auditLogs)) state.auditLogs = [];
      state.auditLogs.unshift(entry);
      if (state.auditLogs.length > 60) state.auditLogs = state.auditLogs.slice(0, 60);
    }

    async function syncToCloud(logMessage = '') {
      if (logMessage) await addAuditLog(logMessage);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      } catch (e) {}

      window.renderAll();

      if (sharedDocRef && setDocFn) {
        try {
          await setDocFn(sharedDocRef, state, { merge: true });
        } catch (err) {
          console.warn("Cloud sync warning (saved locally):", err); window.showToast('Cloud Save မအောင်မြင်သေးပါ — Local Data ကို ဆက်ထိန်းထားပါသည်','error');
        }
      }
    }

    function activateUserSession(userObj) {
      currentAuthUser = userObj;
      const email = (userObj.email || '').toLowerCase();
      const isFounder = email === FOUNDER_GMAIL.toLowerCase() || state.users.length === 0;
      let uObj = state.users.find(u => (u.email || '').toLowerCase() === email);

      if (!uObj) {
        const initialRoles = isFounder
          ? ['FOUNDER', 'ADMIN', 'MANAGER', 'FINANCE', 'SALES', 'PURCHASE', 'ACADEMIC', 'PAGE_ADMIN']
          : ['PAGE_ADMIN'];
        uObj = {
          id: 'u_' + Date.now(),
          name: userObj.displayName || email.split('@')[0],
          email: userObj.email,
          role: isFounder ? 'FOUNDER' : 'PAGE_ADMIN',
          roles: initialRoles,
          approved: isFounder,
          permissions: {}
        };
        ensureUserPermissionShape(uObj);
        state.users.push(uObj);
        if (!isFounder) {
          notify('New Staff Approval Request', `${uObj.name} (${uObj.email}) မှ Google/Gmail ဖြင့် ဝင်ရောက်လာပြီး Admin Approval စောင့်ဆိုင်းနေပါသည်`, FOUNDER_GMAIL);
        }
      } else if (isFounder) {
        uObj.role = 'FOUNDER';
        uObj.roles = ['FOUNDER', 'ADMIN', 'MANAGER', 'FINANCE', 'SALES', 'PURCHASE', 'ACADEMIC', 'PAGE_ADMIN'];
        uObj.approved = true;
      }

      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('btnLogout').classList.remove('hidden');
      document.getElementById('btnLogout').classList.add('flex');
      document.getElementById('activeUserEmail').textContent = userObj.email;
      syncToCloud();
    }

    // SECURITY: Never treat a typed email or localStorage session as authentication.
    // Only Firebase Authentication can establish a trusted session.
    window.handleQuickEmailLogin = () => {
      window.showToast('လုံခြုံရေးအတွက် Google Sign-in ဖြင့်သာ ဝင်ရောက်ပါ။', 'error');
    };

    window.handleUsernameLogin = async () => {
      const username=(document.getElementById('usernameLoginInput')?.value||'').trim().toLowerCase();
      const password=document.getElementById('passwordLoginInput')?.value||'';
      if(!username||!password) return window.showToast('Username နှင့် Password နှစ်ခုလုံးထည့်ပါ','error');
      const staff=(state.users||[]).find(u=>(u.username||'').toLowerCase()===username);
      if(!staff||!staff.email) return window.showToast('Username မတွေ့ပါ။ Admin ထံမှ Account ရယူပါ','error');
      if(staff.approved===false) return window.showToast('Admin Approval မရသေးပါ','error');
      if(!auth) return window.showToast('Firebase Authentication မချိတ်ဆက်ရသေးပါ','error');
      try{await signInWithEmailAndPassword(auth,staff.email,password)}catch(e){console.error(e);window.showToast('Username သို့မဟုတ် Password မှားနေပါသည်','error')}
    };
    // Old local-only sessions are untrusted and must not bypass Firebase Authentication.
    localStorage.removeItem('MICRO_TC_ACTIVE_USER');

    // ================= 4. FIREBASE CLOUD CONNECTION =================
    let setDocFn = null;
    let signOutFn = null;
    let signInPopupFn = null;
    let googleProvider = null;

    (async () => {
      try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
        const { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        const { getFirestore, doc, onSnapshot, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        sharedDocRef = doc(db, "micro_training_center", "shared_state");
        setDocFn = setDoc;
        signOutFn = signOut;
        signInPopupFn = signInWithPopup;
        googleProvider = new GoogleAuthProvider();

        const firstSnap = await getDoc(sharedDocRef);
        if (firstSnap.exists()) {
          const cloudData = firstSnap.data();
          state = { ...defaultData, ...cloudData };
          Object.keys(defaultData).forEach(k => {
            if (Array.isArray(defaultData[k]) && !Array.isArray(state[k])) state[k] = JSON.parse(JSON.stringify(defaultData[k]));
            if (defaultData[k] && typeof defaultData[k] === 'object' && !Array.isArray(defaultData[k]) && (!state[k] || typeof state[k] !== 'object')) state[k] = JSON.parse(JSON.stringify(defaultData[k]));
          });
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
          tryStudentPortal();
        } else {
          await setDoc(sharedDocRef, state, { merge: true });
        }
        onSnapshot(sharedDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const cloudData = docSnap.data();
            state = { ...defaultData, ...cloudData };
            Object.keys(defaultData).forEach(k => {
              if (Array.isArray(defaultData[k]) && !Array.isArray(state[k])) state[k] = JSON.parse(JSON.stringify(defaultData[k]));
              if (defaultData[k] && typeof defaultData[k] === 'object' && !Array.isArray(defaultData[k]) && (!state[k] || typeof state[k] !== 'object')) state[k] = JSON.parse(JSON.stringify(defaultData[k]));
            });
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
            document.getElementById('syncStatusBadge').innerHTML = `<i class="fa-solid fa-cloud text-micro-yellow mr-1"></i>Live Synced`;
            ensureMonthlyClose();
            window.renderAll();
          }
        });

        onAuthStateChanged(auth, async (user) => {
          if (user) {
            localStorage.setItem('MICRO_TC_ACTIVE_USER', JSON.stringify({ email: user.email, displayName: user.displayName }));
            activateUserSession(user);
          }
        });
      } catch (err) {
        console.warn("Firebase offline mode active:", err);
      }
    })();

    window.handleGoogleLogin = async () => {
      if (auth && signInPopupFn && googleProvider) {
        try {
          await signInPopupFn(auth, googleProvider);
          window.showToast('Google အကောင့်ဖြင့် ချိတ်ဆက်ပြီးပါပြီ');
          return;
        } catch (e) {
          console.error('Google Sign-in failed:', e);
          window.showToast('Google Login မအောင်မြင်ပါ။ Firebase Authentication နှင့် Authorized Domains ကို စစ်ဆေးပါ။', 'error');
          return;
        }
      }
      window.showToast('Firebase Authentication မချိတ်ဆက်ရသေးပါ။ Setup လမ်းညွှန်ကို ကြည့်ပါ။', 'error');
    };

    window.handleLogout = async () => {
      localStorage.removeItem('MICRO_TC_ACTIVE_USER');
      currentAuthUser = null;
      if (auth && signOutFn) {
        try { await signOutFn(auth); } catch (e) {}
      }
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('pendingLockScreen').classList.add('hidden');
      document.getElementById('mainAppContent').classList.add('hidden');
      document.getElementById('mobileBottomNav').classList.add('hidden');
      document.getElementById('btnLogout').classList.add('hidden');
      document.getElementById('activeUserEmail').textContent = 'Not Signed In';
      document.getElementById('currentRoleBadge').textContent = 'Signed Out';
      window.showToast('အကောင့်မှ ထွက်လိုက်ပါပြီ');
    };

    // ================= 5. NAVIGATION & TABS =================
    const deptTitles = {
      dashboard: '၁။ Overview & P&L Report ချုပ်',
      leads: '၂။ Page Admin & AI Screenshot Scanner',
      sales: '၃။ Sales & Invoices (သင်တန်းအပ်သူများ)',
      manager: '၄။ Manager & Follow-up Content Hub',
      academic: '၅။ Academic & Attendance ဌာန',
      finance: '၆။ Purchase & Finance ဌာန',
      admin: '၇။ Founder / Admin Control Settings',
      enterprise: '၈။ MTC Enterprise Module Center'
    };

    window.switchTab = (tab) => {
      if (!currentAuthUser) {
        window.showToast('ကျေးဇူးပြု၍ Gmail ဖြင့် အရင်ဝင်ရောက်ပါ', 'error');
        return;
      }
      if (tab === 'finance' && !hasDeptAccess(['FINANCE', 'PURCHASE'])) {
        window.showToast('Finance & Purchase ဌာနသို့ ဝင်ရောက်ခွင့် မရှိပါ', 'error');
        return;
      }
      if (tab === 'admin' && !hasDeptAccess(['ADMIN'])) {
        window.showToast('Admin Control Center သို့ Founder နှင့် Admin များသာ ဝင်ရောက်နိုင်သည်', 'error');
        return;
      }
      if (tab === 'enterprise' && currentEnterprisePanel === 'admin' && !isAdmin()) {
        window.showToast('Founder / Admin Control Center သို့ Admin သာ ဝင်ရောက်နိုင်သည်', 'error');
        return;
      }
      if (tab === 'manager' && !hasDeptAccess(['MANAGER', 'SALES', 'PAGE_ADMIN'])) {
        window.showToast('Manager Hub သို့ ဝင်ရောက်ခွင့် မရှိပါ', 'error');
        return;
      }

      currentActiveTab = tab;
      ['dashboard', 'leads', 'sales', 'manager', 'academic', 'finance', 'admin', 'enterprise'].forEach(t => {
        const sec = document.getElementById('tab-' + t);
        if (sec) sec.classList.toggle('hidden', t !== tab);
        const navBtn = document.getElementById('nav-' + t);
        if (navBtn) {
          navBtn.className = t === tab
            ? 'drawer-nav-btn w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold bg-micro-yellow text-micro-navy shadow transition'
            : 'drawer-nav-btn w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold text-slate-200 hover:bg-white/10 transition';
        }
      });

      document.getElementById('currentDeptTitle').textContent = deptTitles[tab] || 'Dashboard';
      window.toggleDrawer(false);
      window.renderAll();
    };

    window.promptUpdateUsdRate = async () => {
      if (!hasDeptAccess(['ADMIN', 'FINANCE'])) {
        return window.showToast('USD Rate ကို Admin နှင့် Finance ဌာနမှသာ ပြင်ဆင်နိုင်သည်', 'error');
      }
      const nextRate = prompt('လက်ရှိ 1 USD ၏ မြန်မာကျပ်ငွေ ပေါက်ဈေးကို ရိုက်ထည့်ပါ (Ks):', state.usdRate || 3550);
      if (nextRate && Number(nextRate) > 0) {
        state.usdRate = Number(nextRate);
        await syncToCloud(`USD Rate ကို ${state.usdRate} Ks သို့ ပြောင်းလဲခဲ့သည်`);
        window.showToast(`1 USD = ${state.usdRate.toLocaleString()} Ks သိမ်းဆည်းပြီးပါပြီ`);
      }
    };

    // ================= 6. FILTERING & RENDERING =================
    function getFilteredLeadsByCourseAndDate() {
      const courseFilter = document.getElementById('dashboardCourseFilter')?.value || 'ALL';
      const startDate = document.getElementById('filterStartDate')?.value || '';
      const endDate = document.getElementById('filterEndDate')?.value || '';

      return (state.leads || []).filter(l => {
        if (courseFilter !== 'ALL' && l.course !== courseFilter) return false;
        if (startDate && (l.date || '') < startDate) return false;
        if (endDate && (l.date || '') > endDate) return false;
        return true;
      });
    }

    function getFilteredExpensesByDate() {
      const startDate = document.getElementById('filterStartDate')?.value || '';
      const endDate = document.getElementById('filterEndDate')?.value || '';
      return (state.expenses || []).filter(e => {
        if (startDate && (e.date || '') < startDate) return false;
        if (endDate && (e.date || '') > endDate) return false;
        return true;
      });
    }

    window.clearDateFilter = () => {
      document.getElementById('filterStartDate').value = '';
      document.getElementById('filterEndDate').value = '';
      window.renderAll();
      window.showToast('ရက်စွဲ စစ်ထုတ်မှု ပြန်လည်ရှင်းလင်းပြီးပါပြီ');
    };

    window.jumpToLeads = (filter) => {
      window.setLeadFilter(filter);
      window.switchTab('leads');
    };

    window.setLeadFilter = (f) => {
      currentLeadFilter = f;
      document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.className = btn.getAttribute('data-filter') === f
          ? 'filter-pill px-3.5 py-2 rounded-xl text-xs font-extrabold bg-micro-navy text-micro-yellow whitespace-nowrap shadow ios-btn'
          : 'filter-pill px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border whitespace-nowrap ios-btn';
      });
      window.renderLeads();
    };

    window.renderAll = () => {
      if (!currentAuthUser) return;
      const user = getActiveUser();
      ensureMonthlyClose();
      const usdRate = Number(state.usdRate || 3550);
      document.getElementById('widgetUsdRate').textContent = `${usdRate.toLocaleString()} Ks`;

      const rolesStr = (user.roles || []).slice(0, 3).join(', ');
      document.getElementById('currentRoleBadge').textContent = `${user.name || ''} (${rolesStr})`;
      document.getElementById('drawerUserName').textContent = user.name || 'Staff Member';
      document.getElementById('drawerUserEmail').textContent = user.email || '';
      renderDynamicDepartmentMenu(); const unreadNoti=(state.notifications||[]).filter(n=>!n.read&&(n.forEmail==='ALL'||!n.forEmail||n.forEmail.toLowerCase()===(user.email||'').toLowerCase()||isAdmin())).length; const nb=document.getElementById('badgeNotifications'); if(nb)nb.textContent=unreadNoti;
      document.getElementById('drawerUserRoles').innerHTML = (user.roles || []).map(r =>
        `<span class="px-2 py-0.5 rounded-md bg-micro-yellow/20 text-micro-yellow font-bold text-[10px]">${r}</span>`
      ).join('');
      document.querySelectorAll('[data-mtc-logo]').forEach(el=>{ if(state.settings.logoData){ el.src=state.settings.logoData; el.classList.remove('hidden'); } });

      if (!user.approved) {
        document.getElementById('pendingLockScreen').classList.remove('hidden');
        document.getElementById('mainAppContent').classList.add('hidden');
        document.getElementById('mobileBottomNav').classList.add('hidden');
        document.getElementById('pendingUserName').textContent = user.name;
        document.getElementById('pendingUserEmail').textContent = user.email;
        return;
      }

      document.getElementById('pendingLockScreen').classList.add('hidden');
      document.getElementById('mainAppContent').classList.remove('hidden');
      document.getElementById('mobileBottomNav').classList.remove('hidden');

      const courseSelect = document.getElementById('dashboardCourseFilter');
      const currentSelectedCourse = courseSelect.value || 'ALL';
      courseSelect.innerHTML = `<option value="ALL">သင်တန်းအားလုံး (All Courses)</option>` +
        state.courses.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      courseSelect.value = state.courses.some(c => c.name === currentSelectedCourse) ? currentSelectedCourse : 'ALL';

      const filteredLeads = getFilteredLeadsByCourseAndDate();
      const filteredExpenses = getFilteredExpensesByDate();

      const hotLeads = filteredLeads.filter(l => l.leadStage === 'HOT' && l.paymentStatus !== 'PAID');
      const paidLeads = filteredLeads.filter(l => l.paymentStatus === 'PAID' || l.paymentStatus === 'PARTIAL');
      const groupPending = filteredLeads.filter(l => (l.paymentStatus === 'PAID' || l.paymentStatus === 'PARTIAL') && (!l.fbGroup || !l.tgGroup));

      document.getElementById('kpiTotalLeads').textContent = filteredLeads.length;
      document.getElementById('kpiHotLeads').textContent = hotLeads.length;
      document.getElementById('kpiPaidCount').textContent = paidLeads.length;
      document.getElementById('kpiGroupPendingCount').textContent = groupPending.length;

      const convRate = filteredLeads.length > 0 ? Math.round((paidLeads.length / filteredLeads.length) * 100) : 0;
      document.getElementById('kpiConversionRate').textContent = `Conversion Rate: ${convRate}%`;

      document.getElementById('badgeLeadsCount').textContent = state.leads.length;
      document.getElementById('badgeSalesCount').textContent = state.leads.filter(l => l.paymentStatus === 'PAID' || l.paymentStatus === 'PARTIAL').length;

      const finBlock = document.getElementById('financeDashboardBlock');
      if (canViewFinance()) {
        finBlock.classList.remove('hidden');
        const rev = filteredLeads.reduce((s, l) => s + Number(l.paidAmount || 0), 0);
        const rec = filteredLeads.reduce((s, l) => s + Number(l.balanceAmount || 0), 0);
        const exp = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
        const net = rev - exp;

        document.getElementById('finTotalRevenue').textContent = rev.toLocaleString() + ' Ks';
        document.getElementById('finTotalRevenueUsd').textContent = `≈ $${(rev / usdRate).toFixed(2)} USD`;
        document.getElementById('finTotalReceivable').textContent = rec.toLocaleString() + ' Ks';
        document.getElementById('finTotalExpense').textContent = exp.toLocaleString() + ' Ks';
        document.getElementById('finTotalExpenseUsd').textContent = `≈ $${(exp / usdRate).toFixed(2)} USD`;
        document.getElementById('finNetProfit').textContent = net.toLocaleString() + ' Ks';
        document.getElementById('finNetProfitUsd').textContent = `≈ $${(net / usdRate).toFixed(2)} USD`;
      } else {
        finBlock.classList.add('hidden');
      }

      renderDashboardBreakdowns(filteredLeads);
      window.renderLeads();
      renderSalesTab(filteredLeads);
      renderManagerTab();
      renderAcademicTab();
      renderFinanceTab(filteredExpenses);
      renderAdminPanel();
      renderEnterprise();
    };

    function renderDashboardBreakdowns(filteredLeads) {
      const showMoney = canViewFinance();
      const cContainer = document.getElementById('dashboardCourseBreakdown');
      cContainer.innerHTML = state.courses.map(c => {
        const cLeads = filteredLeads.filter(l => l.course === c.name);
        const cPaid = cLeads.filter(l => l.paymentStatus === 'PAID' || l.paymentStatus === 'PARTIAL');
        const cRev = cLeads.reduce((s, l) => s + Number(l.paidAmount || 0), 0);
        const pct = cLeads.length > 0 ? Math.round((cPaid.length / cLeads.length) * 100) : 0;
        return `
          <div class="p-3.5 rounded-2xl bg-slate-50 border space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-extrabold text-micro-navy">${c.name}</div>
                <div class="text-[11px] text-slate-500">လာမေးသူ: <strong>${cLeads.length}</strong> ဦး • အပ်နှံသူ: <strong class="text-micro-blue">${cPaid.length}</strong> ဦး (${pct}%)</div>
              </div>
              ${showMoney ? `<div class="font-extrabold text-micro-navy bg-micro-yellow/30 px-2.5 py-1 rounded-lg">${cRev.toLocaleString()} Ks</div>` : `<span class="px-2.5 py-1 rounded-lg bg-blue-100 text-micro-blue font-bold">${cPaid.length} Sales</span>`}
            </div>
            <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-micro-blue rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');

      const sContainer = document.getElementById('dashboardStaffPerformance');
      const staffMap = {};
      filteredLeads.forEach(l => {
        const staffName = l.recordedBy || 'Admin';
        if (!staffMap[staffName]) staffMap[staffName] = { total: 0, hot: 0, sales: 0 };
        staffMap[staffName].total++;
        if (l.leadStage === 'HOT') staffMap[staffName].hot++;
        if (l.paymentStatus === 'PAID' || l.paymentStatus === 'PARTIAL') staffMap[staffName].sales++;
      });

      const entries = Object.entries(staffMap);
      sContainer.innerHTML = entries.length === 0
        ? `<div class="text-slate-400 text-center py-4">မှတ်တမ်း မရှိသေးပါ။</div>`
        : entries.map(([name, st]) => `
          <div class="p-3 rounded-2xl bg-slate-50 border flex items-center justify-between">
            <div>
              <div class="font-extrabold text-micro-navy"><i class="fa-solid fa-user-check text-micro-blue mr-1"></i>${name}</div>
              <div class="text-[11px] text-slate-500">စာရင်းသွင်းမှု: <strong>${st.total}</strong> ဦး • 🔥 Hot: <strong>${st.hot}</strong> ဦး</div>
            </div>
            <span class="px-3 py-1 rounded-xl bg-micro-navy text-micro-yellow font-extrabold">အရောင်း: ${st.sales} ဦး</span>
          </div>
        `).join('');
    }

    // ================= 7. LEADS & AI SCANNER =================
    window.renderLeads = () => {
      const q = (document.getElementById('leadSearchInput')?.value || '').toLowerCase().trim();
      const baseLeads = getFilteredLeadsByCourseAndDate();

      const list = baseLeads.filter(l => {
        if (currentLeadFilter === 'HOT' && l.leadStage !== 'HOT') return false;
        if (currentLeadFilter === 'MEDIUM' && l.leadStage !== 'MEDIUM') return false;
        if (currentLeadFilter === 'INTERESTED' && l.leadStage !== 'INTERESTED') return false;
        if (currentLeadFilter === 'PAID' && l.paymentStatus !== 'PAID' && l.paymentStatus !== 'PARTIAL') return false;
        if (currentLeadFilter === 'NOGROUP' && !((l.paymentStatus === 'PAID' || l.paymentStatus === 'PARTIAL') && (!l.fbGroup || !l.tgGroup))) return false;
        if (q) {
          return `${l.name} ${l.phone} ${l.source} ${l.note || ''} ${l.course} ${l.recordedBy || ''}`.toLowerCase().includes(q);
        }
        return true;
      });

      const container = document.getElementById('leadsContainer');
      if (list.length === 0) {
        container.innerHTML = `<div class="ios-card p-8 text-center text-xs text-slate-400">ရွေးချယ်ထားသော စာရင်း မရှိသေးပါ။ (+ စာရင်းသွင်းရန် ခလုတ်ကိုနှိပ်၍ အသစ်ထည့်နိုင်ပါသည်)</div>`;
        return;
      }

      const showMoney = canViewFinance();

      container.innerHTML = list.map(l => {
        const stageBadge = l.leadStage === 'HOT'
          ? '<span class="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px]">🔥 အပ်ရန်အလားအလာရှိ (Hot)</span>'
          : l.leadStage === 'MEDIUM'
          ? '<span class="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px]">💡 အလယ်အလတ် (Medium)</span>'
          : l.leadStage === 'ENROLLED'
          ? '<span class="px-2.5 py-1 rounded-full bg-micro-navy text-micro-yellow font-extrabold text-[10px]">🎓 အပ်နှံပြီး (Enrolled)</span>'
          : '<span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-extrabold text-[10px]">⭐ စိတ်ဝင်စားသူ</span>';

        const payBadge = l.paymentStatus === 'PAID'
          ? '<span class="px-2.5 py-1 rounded-full bg-micro-blue text-white font-extrabold text-[10px]">✅ ငွေအကြေသွင်းပြီး</span>'
          : l.paymentStatus === 'PARTIAL'
          ? '<span class="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 font-extrabold text-[10px]">🌗 အရစ်ကျသွင်းထားသူ</span>'
          : '<span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">⏳ ငွေမသွင်းရသေး</span>';

        return `
          <div class="ios-card p-4 space-y-3 animate-fade-up">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="font-extrabold text-sm text-micro-navy">${l.name}</h4>
                  <span class="text-[11px] px-2.5 py-0.5 rounded-lg bg-micro-navy text-micro-yellow font-bold">${l.course}</span>
                  ${l.attachedImage ? `<span class="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-micro-blue font-semibold"><i class="fa-solid fa-image mr-1"></i>${l.attachedImage}</span>` : ''}
                </div>
                <div class="text-xs text-slate-600 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <a href="tel:${l.phone}" class="text-micro-blue font-extrabold hover:underline"><i class="fa-solid fa-phone mr-1"></i>${l.phone}</a>
                  <span>• 📍 Source: <strong>${l.source}</strong></span>
                  <span>• 📅 ရက်စွဲ: <strong>${l.date}</strong></span>
                  <span>• 👤 သွင်းသူ: <strong>${l.recordedBy || 'Admin'}</strong></span>
                </div>
                ${showMoney && (Number(l.paidAmount) > 0 || Number(l.balanceAmount) > 0) ? `
                  <div class="text-xs mt-1.5 flex items-center gap-3">
                    <span class="text-micro-blue font-extrabold">သွင်းပြီး: ${Number(l.paidAmount || 0).toLocaleString()} Ks (${l.paymentMethod || '-'})</span>
                    ${Number(l.balanceAmount || 0) > 0 ? `<span class="text-rose-600 font-extrabold">ရရန်ကျန်: ${Number(l.balanceAmount).toLocaleString()} Ks</span>` : ''}
                  </div>
                ` : ''}
              </div>
              <div class="flex flex-col items-end gap-1.5">
                ${stageBadge}
                ${payBadge}
              </div>
            </div>

            ${l.note ? `<div class="text-xs text-slate-700 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200"><i class="fa-regular fa-comment-dots text-micro-blue mr-1.5"></i><strong>မှတ်ချက်:</strong> ${l.note}</div>` : ''}

            <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold ${l.fbGroup ? 'bg-blue-50 text-micro-blue' : 'bg-slate-100 text-slate-400'}">
                  <i class="fa-brands fa-facebook mr-1"></i>FB Group ${l.fbGroup ? '✓' : '✗'}
                </span>
                <span class="px-2 py-0.5 rounded text-[11px] font-bold ${l.tgGroup ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-400'}">
                  <i class="fa-brands fa-telegram mr-1"></i>Telegram ${l.tgGroup ? '✓' : '✗'}
                </span>
              </div>

              <div class="flex items-center gap-2">
                ${(l.paymentStatus === 'PAID' || l.paymentStatus === 'PARTIAL') ? `
                  <button type="button" onclick="window.printStudentInvoice('${l.id}')" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-micro-navy font-extrabold ios-btn">
                    <i class="fa-solid fa-receipt mr-1"></i>Invoice ထုတ်ရန်
                  </button>
                ` : ''}
                <button type="button" onclick="window.openLeadModal('${l.id}')" class="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-micro-blue font-extrabold ios-btn">
                  <i class="fa-solid fa-pen-to-square mr-1"></i>Edit ပြင်ရန်
                </button>
                <button type="button" onclick="window.deleteLead('${l.id}')" class="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold ios-btn">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    };

    window.handleScreenshotUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.getElementById('aiScreenshotPreview');
        img.src = e.target.result;
        img.classList.remove('hidden');
        window.runAiLeadAnalysis(file.name);
      };
      reader.readAsDataURL(file);
    };

    window.handleModalImageAttach = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      tempAttachedImageName = file.name;
      document.getElementById('modalScreenshotStatus').textContent = `✓ ${file.name} တွဲထားပြီး`;
      window.showToast('Screenshot ပုံ တွဲပြီးပါပြီ');
    };

    window.runAiLeadAnalysis = (fileName = '') => {
      const rawText = (document.getElementById('aiChatTextInput').value || '').trim();
      const lower = (rawText + ' ' + fileName).toLowerCase();

      const phoneMatch = rawText.match(/(09\d{7,9})/);
      const detectedPhone = phoneMatch ? phoneMatch[1] : '';

      let detectedCourse = state.courses[0]?.name || 'Advance Excel';
      state.courses.forEach(c => {
        if (lower.includes(c.name.toLowerCase()) || (lower.includes('job') && c.name.toLowerCase().includes('job'))) {
          detectedCourse = c.name;
        }
      });

      let stage = 'HOT';
      let score = '94%';
      let badgeClass = 'bg-rose-100 text-rose-700';
      let advice = '';
      let reply = '';

      if (lower.includes('စဉ်းစား') || lower.includes('နောက်မှ') || lower.includes('busy')) {
        stage = 'MEDIUM';
        score = '68%';
        badgeClass = 'bg-blue-100 text-blue-700';
        advice = 'ဤ Customer သည် သင်တန်းကို စိတ်ဝင်စားသော်လည်း အချိန် သို့မဟုတ် သင်တန်းကြေးကို စဉ်းစားနေဆဲ (Medium Potential) ဖြစ်ပါသည်။ အရစ်ကျ ပေးသွင်းနိုင်ကြောင်းနှင့် သင်တန်းပြီးပါက Certificate ပေးမည့်အကြောင်း ရှင်းပြပေးသင့်ပါသည်။';
        reply = `မင်္ဂလာပါရှင့်... Micro Computer Training Center မှ ${detectedCourse} သင်တန်းလေးကို သင်တန်းကြေး အရစ်ကျ (၂) ကြိမ်ခွဲသွင်းပြီးလည်း တက်ရောက်နိုင်ပါတယ်ရှင့်။ Video Record ဖိုင်များလည်း ပြန်ကြည့်နိုင်တာမို့ အဆင်ပြေတဲ့အချိန် လေ့လာနိုင်ပါတယ်ရှင့်။`;
      } else {
        stage = 'HOT';
        score = '94%';
        badgeClass = 'bg-rose-100 text-rose-700';
        advice = `🔥 အလားအလာ အလွန်ကောင်းသော Customer (Hot Lead) ဖြစ်ပါသည်။ "${detectedCourse}" သင်တန်းအပ်နှံရန် သေချာသလောက်ရှိနေပါပြီ။ KBZPay / WavePay နံပါတ်များကို ချက်ချင်းပို့ပေးပြီး ယနေ့အတွင်း Follow-up လုပ်ပါ။`;
        reply = `မင်္ဂလာပါရှင့်... Micro Computer Training Center ရဲ့ "${detectedCourse}" သင်တန်းလေးအတွက် လူဦးရေ ကန့်သတ်ထားပါတယ်ရှင့်။ KPay / WavePay တို့ဖြင့် ငွေလွှဲပြီး ပြေစာ Screenshot ပို့ပေးပါက သင်တန်း Group ထဲသို့ ချက်ချင်း ထည့်သွင်းပေးပါမယ်ရှင့်။`;
      }

      lastAiAnalysis = {
        phone: detectedPhone,
        course: detectedCourse,
        stage,
        note: rawText || `AI Screenshot Scan (${fileName || 'Chat Image'}) - ${stage} Lead`
      };

      const badgeEl = document.getElementById('aiDetectedBadge');
      badgeEl.className = `px-3 py-1 rounded-full font-extrabold text-xs ${badgeClass}`;
      badgeEl.textContent = `🔥 AI သုံးသပ်ချက်: ${stage} LEAD (${score})`;

      document.getElementById('aiAdviceText').textContent = advice;
      document.getElementById('aiSuggestedReply').textContent = reply;
      document.getElementById('aiScanResultContainer').classList.remove('hidden');
      window.showToast('AI သုံးသပ်ချက် ထွက်ပေါ်လာပါပြီ');
    };

    window.copyAiReply = () => {
      const txt = document.getElementById('aiSuggestedReply').textContent;
      navigator.clipboard.writeText(txt);
      window.showToast('AI ပြန်စာကို Copy ကူးယူပြီးပါပြီ');
    };

    window.openLeadModalFromAi = () => {
      window.openLeadModal();
      if (lastAiAnalysis) {
        document.getElementById('leadPhone').value = lastAiAnalysis.phone || '';
        document.getElementById('leadCourse').value = lastAiAnalysis.course;
        document.getElementById('leadStage').value = lastAiAnalysis.stage;
        document.getElementById('leadNote').value = lastAiAnalysis.note;
      }
    };

    // ================= 8. LEAD MODAL (ADD & EDIT) =================
    window.autoFillCourseFee = () => {
      const cName = document.getElementById('leadCourse').value;
      const found = state.courses.find(c => c.name === cName);
      const editId = document.getElementById('editLeadId').value;
      if (found && !editId && document.getElementById('leadPaymentStatus').value === 'PAID') {
        document.getElementById('leadPaidAmount').value = found.fee;
      }
    };

    window.openLeadModal = (editId = '') => {
      document.getElementById('leadCourse').innerHTML = state.courses.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      document.getElementById('leadSource').innerHTML = state.leadSources.map(s => `<option value="${s}">${s}</option>`).join('');
      document.getElementById('leadPaymentMethod').innerHTML = state.paymentMethods.map(p => `<option value="${p}">${p}</option>`).join('');

      tempAttachedImageName = '';
      document.getElementById('modalScreenshotStatus').textContent = 'ပုံမရွေးရသေးပါ';

      if (editId) {
        const item = state.leads.find(x => x.id === editId);
        if (!item) return;
        document.getElementById('leadModalTitle').textContent = '✏️ စာရင်း ပြန်လည်ပြင်ဆင်ရန် (Edit Lead / Student)';
        document.getElementById('editLeadId').value = item.id;
        document.getElementById('leadName').value = item.name || '';
        document.getElementById('leadPhone').value = item.phone || '';
        document.getElementById('leadDate').value = item.date || new Date().toISOString().slice(0, 10);
        document.getElementById('leadCourse').value = item.course || state.courses[0]?.name || '';
        document.getElementById('leadSource').value = item.source || state.leadSources[0] || '';
        document.getElementById('leadStage').value = item.leadStage || 'INTERESTED';
        document.getElementById('leadPaymentStatus').value = item.paymentStatus || 'UNPAID';
        document.getElementById('leadPaidAmount').value = Number(item.paidAmount || 0);
        document.getElementById('leadBalanceAmount').value = Number(item.balanceAmount || 0);
        document.getElementById('leadPaymentMethod').value = item.paymentMethod || state.paymentMethods[0] || '';
        document.getElementById('chkFbGroup').checked = !!item.fbGroup;
        document.getElementById('chkTgGroup').checked = !!item.tgGroup;
        document.getElementById('leadNote').value = item.note || '';
        if (item.attachedImage) {
          tempAttachedImageName = item.attachedImage;
          document.getElementById('modalScreenshotStatus').textContent = `✓ ${item.attachedImage}`;
        }
      } else {
        document.getElementById('leadModalTitle').textContent = 'သင်တန်းလာမေးသူ / သင်တန်းသား စာရင်းသွင်းရန်';
        document.getElementById('editLeadId').value = '';
        document.getElementById('leadName').value = '';
        document.getElementById('leadPhone').value = '';
        document.getElementById('leadDate').value = new Date().toISOString().slice(0, 10);
        document.getElementById('leadStage').value = 'INTERESTED';
        document.getElementById('leadPaymentStatus').value = 'UNPAID';
        document.getElementById('leadPaidAmount').value = 0;
        document.getElementById('leadBalanceAmount').value = 0;
        document.getElementById('chkFbGroup').checked = false;
        document.getElementById('chkTgGroup').checked = false;
        document.getElementById('leadNote').value = '';
      }

      window.openModal('leadModal');
    };

    window.saveLead = async () => {
      const editId = document.getElementById('editLeadId').value;
      const name = document.getElementById('leadName').value.trim();
      const phone = document.getElementById('leadPhone').value.trim();
      const chosenDate = document.getElementById('leadDate').value || new Date().toISOString().slice(0, 10);

      if (!name || !phone) {
        return window.showToast('အမည်နှင့် ဖုန်းနံပါတ် ထည့်သွင်းပေးပါ', 'error');
      }

      const u = getActiveUser();
      const payload = {
        name,
        phone,
        date: chosenDate,
        course: document.getElementById('leadCourse').value,
        source: document.getElementById('leadSource').value,
        leadStage: document.getElementById('leadStage').value,
        paymentStatus: document.getElementById('leadPaymentStatus').value,
        paidAmount: Number(document.getElementById('leadPaidAmount').value || 0),
        balanceAmount: Number(document.getElementById('leadBalanceAmount').value || 0),
        paymentMethod: document.getElementById('leadPaymentMethod').value,
        fbGroup: document.getElementById('chkFbGroup').checked,
        tgGroup: document.getElementById('chkTgGroup').checked,
        note: document.getElementById('leadNote').value.trim(),
        attachedImage: tempAttachedImageName || ''
      };

      if (editId) {
        const idx = state.leads.findIndex(x => x.id === editId);
        if (idx > -1) {
          state.leads[idx] = { ...state.leads[idx], ...payload, lastEditedBy: u.name };
        }
        window.closeModal('leadModal');
        await syncToCloud(`Lead/ကျောင်းသား "${name}" စာရင်းကို ပြင်ဆင်ခဲ့သည်`);
        window.showToast(`"${name}" စာရင်း ပြင်ဆင်ပြီးပါပြီ`);
      } else {
        state.leads.unshift({
          id: 'L' + Date.now(),
          ...payload,
          recordedBy: u.name || 'Admin'
        });
        window.closeModal('leadModal');
        await syncToCloud(`Lead/ကျောင်းသားအသစ် "${name}" ကို စာရင်းသွင်းခဲ့သည်`);
        window.showToast(`"${name}" စာရင်း အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ`);
      }
    };

    window.deleteLead = async (id) => {
      const target = state.leads.find(x => x.id === id);
      if (!confirm(`"${target?.name || ''}" ၏ စာရင်းကို ဖျက်သိမ်းမှာ သေချာပါသလား?`)) return;
      state.leads = state.leads.filter(x => x.id !== id);
      await syncToCloud(`Lead "${target?.name || id}" ကို ဖျက်သိမ်းခဲ့သည်`);
      window.showToast('စာရင်း ဖျက်သိမ်းပြီးပါပြီ');
    };

    // ================= 9. SALES & INVOICES TAB =================
    function renderSalesTab(filteredLeads) {
      const container = document.getElementById('salesInvoicesContainer');
      const salesList = filteredLeads.filter(l => l.paymentStatus === 'PAID' || l.paymentStatus === 'PARTIAL');

      if (salesList.length === 0) {
        container.innerHTML = `<div class="ios-card p-8 text-center text-xs text-slate-400">ငွေသွင်းပြီးသော အရောင်းဘောက်ချာ စာရင်း မရှိသေးပါ။</div>`;
        return;
      }

      container.innerHTML = salesList.map((l) => `
        <div class="ios-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-micro-blue">
          <div class="space-y-1 text-xs">
            <div class="flex items-center gap-2">
              <span class="font-black text-micro-blue">INV-${l.id.slice(-5)}</span>
              <h4 class="font-extrabold text-sm text-micro-navy">${l.name}</h4>
              <span class="px-2 py-0.5 rounded bg-micro-navy text-micro-yellow font-bold text-[10px]">${l.course}</span>
            </div>
            <div class="text-slate-500">
              ဖုန်း: <strong>${l.phone}</strong> • Pay: <strong>${l.paymentMethod}</strong> • ရက်စွဲ: <strong>${l.date}</strong>
            </div>
            <div class="flex items-center gap-3 pt-1">
              <span class="font-extrabold text-micro-navy">သွင်းပြီးငွေ: ${Number(l.paidAmount || 0).toLocaleString()} Ks</span>
              ${Number(l.balanceAmount || 0) > 0 ? `<span class="font-extrabold text-rose-600">ရရန်ကျန်: ${Number(l.balanceAmount).toLocaleString()} Ks</span>` : '<span class="text-micro-blue font-bold">✓ အကြေပေးချေပြီး</span>'}
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" onclick="window.printStudentInvoice('${l.id}')" class="bg-micro-navy hover:bg-micro-blue text-micro-yellow text-xs font-extrabold px-3.5 py-2 rounded-xl shadow ios-btn">
              <i class="fa-solid fa-file-pdf mr-1"></i> Invoice PDF ထုတ်ရန်
            </button>
            <button type="button" onclick="window.openLeadModal('${l.id}')" class="bg-slate-100 hover:bg-slate-200 text-micro-navy text-xs font-bold px-3 py-2 rounded-xl ios-btn">
              Edit
            </button>
          </div>
        </div>
      `).join('');
    }

    window.printStudentInvoice = (leadId) => {
      const l = state.leads.find(x => x.id === leadId);
      if (!l) return;
      window.showToast('Invoice PDF ထုတ်နေပါသည်...');
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="padding: 32px; font-family: 'Inter', 'Padauk', sans-serif; color: #142143; border: 3px solid #142143; border-radius: 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 3px solid #ffaf00; padding-bottom: 16px; margin-bottom: 20px;">
            <div>
              <h1 style="font-size: 22px; font-weight: 900; color: #142143; margin:0;">MICRO COMPUTER TRAINING CENTER</h1>
              <p style="font-size: 12px; color: #1a5d94; margin:4px 0 0 0; font-weight:bold;">Official Enrollment Receipt / Sales Invoice</p>
            </div>
            <div style="text-align:right; font-size: 12px;">
              <div><strong>Invoice No:</strong> INV-${l.id.slice(-6)}</div>
              <div><strong>Date:</strong> ${l.date}</div>
            </div>
          </div>
          <div style="margin-bottom: 20px; font-size: 13px; line-height: 1.8;">
            <div><strong>Student Name:</strong> ${l.name}</div>
            <div><strong>Phone Number:</strong> ${l.phone}</div>
            <div><strong>Course Enrolled:</strong> ${l.course}</div>
            <div><strong>Payment Method:</strong> ${l.paymentMethod}</div>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom: 24px;">
            <thead>
              <tr style="background:#142143; color:#ffaf00;">
                <th style="padding:10px; text-align:left;">Description</th>
                <th style="padding:10px; text-align:right;">Paid Amount</th>
                <th style="padding:10px; text-align:right;">Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:12px; border:1px solid #cbd5e1; font-weight:bold;">${l.course} Training Fee</td>
                <td style="padding:12px; border:1px solid #cbd5e1; text-align:right; font-weight:bold; color:#142143;">${Number(l.paidAmount || 0).toLocaleString()} Ks</td>
                <td style="padding:12px; border:1px solid #cbd5e1; text-align:right; font-weight:bold; color:#e11d48;">${Number(l.balanceAmount || 0).toLocaleString()} Ks</td>
              </tr>
            </tbody>
          </table>
          <div style="text-align:center; font-size:11px; color:#64748b; margin-top:30px;">
            Thank you for choosing Micro Computer Training Center!
          </div>
        </div>
      `;
      html2pdf().from(el).set({
        margin: 12,
        filename: `Invoice_${l.name}_${l.date}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a5', orientation: 'landscape' }
      }).save();
    };

    // ================= 10. MANAGER HUB & FOLLOW-UP SCRIPTS =================
    function renderManagerTab() {
      const sContainer = document.getElementById('managerScriptsList');
      const scripts = state.scripts || [];
      sContainer.innerHTML = scripts.map(sc => `
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <h4 class="font-extrabold text-micro-navy">${sc.title}</h4>
            <div class="flex items-center gap-1.5">
              <button type="button" onclick="window.copyScriptText('${sc.id}')" class="px-2.5 py-1 rounded-lg bg-micro-navy text-micro-yellow font-bold text-[11px] ios-btn">
                <i class="fa-regular fa-copy mr-1"></i>Copy ကူးရန်
              </button>
              <button type="button" onclick="window.deleteScript('${sc.id}')" class="text-rose-500 px-1.5 font-bold ios-btn">✕</button>
            </div>
          </div>
          <p class="text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border">${sc.body}</p>
          <div class="text-[10px] text-slate-400">ပေးပို့သူ: ${sc.by || 'Manager'} • ${sc.date || ''}</div>
        </div>
      `).join('');

      const hotContainer = document.getElementById('managerHotLeadsList');
      const potentialLeads = state.leads.filter(l => (l.leadStage === 'HOT' || l.leadStage === 'MEDIUM') && l.paymentStatus !== 'PAID');
      hotContainer.innerHTML = potentialLeads.length === 0
        ? `<div class="text-xs text-slate-400 py-4 text-center">လက်ရှိ Follow-up လုပ်ရန် ကျန်ရှိသော Hot/Medium Lead မရှိပါ။</div>`
        : potentialLeads.map(l => `
          <div class="p-3.5 rounded-2xl bg-slate-50 border flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <div class="font-extrabold text-micro-navy">${l.name} (${l.phone}) - <span class="text-micro-blue">${l.course}</span></div>
              <div class="text-slate-500 mt-0.5">မှတ်ချက်: ${l.note || '-'} • တာဝန်ခံ: <strong>${l.recordedBy || 'Admin'}</strong></div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full font-extrabold text-[10px] ${l.leadStage === 'HOT' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}">${l.leadStage}</span>
              <button type="button" onclick="window.openLeadModal('${l.id}')" class="px-3 py-1.5 rounded-xl bg-micro-navy text-micro-yellow font-bold ios-btn">စစ်ဆေး/ပြင်ရန်</button>
            </div>
          </div>
        `).join('');
    }

    window.openScriptModal = () => {
      document.getElementById('scriptTitleInput').value = '';
      document.getElementById('scriptBodyInput').value = '';
      window.openModal('scriptModal');
    };

    window.saveManagerScript = async () => {
      const title = document.getElementById('scriptTitleInput').value.trim();
      const body = document.getElementById('scriptBodyInput').value.trim();
      if (!title || !body) return window.showToast('ခေါင်းစဉ်နှင့် စာသား ထည့်သွင်းပါ', 'error');
      if (!Array.isArray(state.scripts)) state.scripts = [];
      state.scripts.unshift({
        id: 'sc_' + Date.now(),
        title,
        body,
        by: getActiveUser().name,
        date: new Date().toISOString().slice(0, 10)
      });
      window.closeModal('scriptModal');
      await syncToCloud(`Follow-up Content "${title}" အသစ်ထည့်သွင်းခဲ့သည်`);
      window.showToast('Follow-up Content ပေးပို့ပြီးပါပြီ');
    };

    window.copyScriptText = (id) => {
      const sc = (state.scripts || []).find(x => x.id === id);
      if (!sc) return;
      navigator.clipboard.writeText(sc.body);
      window.showToast('Follow-up Content ကို Copy ကူးပြီးပါပြီ');
    };

    window.deleteScript = async (id) => {
      state.scripts = (state.scripts || []).filter(x => x.id !== id);
      await syncToCloud();
    };

    // ================= 11. ACADEMIC & ATTENDANCE TAB =================
    function renderAcademicTab() {
      const container = document.getElementById('academicBatchesContainer');
      const batches = state.batches || [];
      container.innerHTML = batches.map(b => `
        <div class="ios-card p-5 space-y-3 border-t-4 border-micro-blue">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="font-extrabold text-sm text-micro-navy">${b.name}</h4>
              <p class="text-xs text-slate-500 mt-0.5"><i class="fa-regular fa-calendar mr-1"></i>${b.schedule}</p>
            </div>
            <button type="button" onclick="window.deleteBatch('${b.id}')" class="text-rose-500 text-xs font-bold ios-btn">✕</button>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-xl border text-xs text-micro-blue font-semibold break-all">
            <i class="fa-solid fa-video mr-1"></i> ${b.zoom || 'Zoom Link မထည့်ရသေးပါ'}
          </div>
          <div class="flex items-center justify-between pt-2 border-t text-xs">
            <span class="font-bold text-slate-600">Attendance မှတ်တမ်းတင်ပြီး: <strong class="text-micro-blue">${b.attendanceCount || 0} ကြိမ်</strong></span>
            <button type="button" onclick="window.markBatchAttendance('${b.id}')" class="bg-micro-navy hover:bg-micro-blue text-micro-yellow font-bold px-3.5 py-1.5 rounded-xl ios-btn">
              ✓ ယနေ့ Attendance မှတ်မည်
            </button>
          </div>
        </div>
      `).join('');
    }

    window.openBatchModal = () => {
      document.getElementById('batchNameInput').value = '';
      document.getElementById('batchScheduleInput').value = '';
      document.getElementById('batchZoomInput').value = '';
      window.openModal('batchModal');
    };

    window.saveBatch = async () => {
      const name = document.getElementById('batchNameInput').value.trim();
      const schedule = document.getElementById('batchScheduleInput').value.trim();
      const zoom = document.getElementById('batchZoomInput').value.trim();
      if (!name) return window.showToast('Batch အမည် ထည့်ပါ', 'error');
      if (!Array.isArray(state.batches)) state.batches = [];
      state.batches.push({ id: 'b_' + Date.now(), name, schedule, zoom, attendanceCount: 0 });
      window.closeModal('batchModal');
      await syncToCloud(`အတန်းခွဲသစ် "${name}" ဖွင့်လှစ်ခဲ့သည်`);
      window.showToast(`"${name}" အတန်းခွဲ သိမ်းဆည်းပြီးပါပြီ`);
    };

    window.markBatchAttendance = async (bid) => {
      const b = (state.batches || []).find(x => x.id === bid);
      if (!b) return;
      b.attendanceCount = Number(b.attendanceCount || 0) + 1;
      await syncToCloud(`"${b.name}" အတွက် Attendance မှတ်တမ်းတင်ခဲ့သည်`);
      window.showToast(`${b.name} အတွက် Attendance မှတ်ပြီးပါပြီ`);
    };

    window.deleteBatch = async (bid) => {
      if (!confirm('ဤအတန်းခွဲကို ဖျက်မည်မှာ သေချာပါသလား?')) return;
      state.batches = (state.batches || []).filter(x => x.id !== bid);
      await syncToCloud();
    };

    // ================= 12. FINANCE & PURCHASE TAB =================
    function renderFinanceTab(filteredExpenses) {
      const pContainer = document.getElementById('purchaseListSection');
      const list = filteredExpenses || state.expenses;
      pContainer.innerHTML = list.length === 0
        ? `<div class="ios-card p-8 text-center text-xs text-slate-400">Purchase / အသုံးစရိတ် စာရင်း မရှိသေးပါ။</div>`
        : list.map(e => `
          <div class="ios-card p-4 flex flex-wrap items-center justify-between gap-3 text-xs border-l-4 border-rose-500">
            <div>
              <div class="font-extrabold text-sm text-micro-navy">${e.title}</div>
              <div class="text-slate-500 mt-1">
                💳 Pay: <strong>${e.paymentMethod}</strong> • 👤 တာဝန်ခံ: <strong>${e.by}</strong> • 📅 ရက်စွဲ: <strong>${e.date}</strong>
              </div>
              ${e.note ? `<div class="text-slate-600 mt-1">မှတ်ချက်: ${e.note}</div>` : ''}
            </div>
            <div class="flex items-center gap-3">
              <div class="font-black text-sm text-rose-600">-${Number(e.amount).toLocaleString()} Ks</div>
              <button type="button" onclick="window.openExpenseModal('${e.id}')" class="px-3 py-1.5 rounded-xl bg-blue-50 text-micro-blue font-extrabold ios-btn">
                Edit ပြင်ရန်
              </button>
              <button type="button" onclick="window.deleteExpense('${e.id}')" class="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold ios-btn">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>`).join('');
    }

    window.openExpenseModal = (editId = '') => {
      document.getElementById('expPaymentMethod').innerHTML = state.paymentMethods.map(p => `<option value="${p}">${p}</option>`).join('');
      if (editId) {
        const item = state.expenses.find(x => x.id === editId);
        if (!item) return;
        document.getElementById('expenseModalTitle').textContent = '✏️ Purchase / အသုံးစရိတ် ပြန်လည်ပြင်ဆင်ရန်';
        document.getElementById('editExpenseId').value = item.id;
        document.getElementById('expTitle').value = item.title || '';
        document.getElementById('expAmount').value = Number(item.amount || 0);
        document.getElementById('expDate').value = item.date || new Date().toISOString().slice(0, 10);
        document.getElementById('expPaymentMethod').value = item.paymentMethod || state.paymentMethods[0] || '';
        document.getElementById('expBy').value = item.by || getActiveUser().name;
        document.getElementById('expNote').value = item.note || '';
      } else {
        document.getElementById('expenseModalTitle').textContent = 'Purchase / အသုံးစရိတ် အသစ်သွင်းရန်';
        document.getElementById('editExpenseId').value = '';
        document.getElementById('expTitle').value = '';
        document.getElementById('expAmount').value = '';
        document.getElementById('expDate').value = new Date().toISOString().slice(0, 10);
        document.getElementById('expBy').value = getActiveUser().name;
        document.getElementById('expNote').value = '';
      }
      window.openModal('expenseModal');
    };

    window.saveExpense = async () => {
      const editId = document.getElementById('editExpenseId').value;
      const title = document.getElementById('expTitle').value.trim();
      const amount = Number(document.getElementById('expAmount').value || 0);
      const chosenDate = document.getElementById('expDate').value || new Date().toISOString().slice(0, 10);
      if (!title || amount <= 0) return window.showToast('အကြောင်းအရာနှင့် ငွေပမာဏ ထည့်ပါ', 'error');

      const payload = {
        title,
        amount,
        date: chosenDate,
        paymentMethod: document.getElementById('expPaymentMethod').value,
        by: document.getElementById('expBy').value.trim() || getActiveUser().name,
        note: document.getElementById('expNote').value.trim()
      };

      if (editId) {
        const idx = state.expenses.findIndex(x => x.id === editId);
        if (idx > -1) state.expenses[idx] = { ...state.expenses[idx], ...payload };
        window.closeModal('expenseModal');
        await syncToCloud(`အသုံးစရိတ် "${title}" (${amount.toLocaleString()} Ks) ကို ပြင်ဆင်ခဲ့သည်`);
        window.showToast('အသုံးစရိတ် ပြင်ဆင်ပြီးပါပြီ');
      } else {
        state.expenses.unshift({ id: 'E' + Date.now(), ...payload });
        window.closeModal('expenseModal');
        await syncToCloud(`အသုံးစရိတ်သစ် "${title}" (${amount.toLocaleString()} Ks) သွင်းခဲ့သည်`);
        window.showToast('အသုံးစရိတ် သိမ်းဆည်းပြီးပါပြီ');
      }
    };

    window.deleteExpense = async (id) => {
      const target = state.expenses.find(x => x.id === id);
      if (!confirm('ဤအသုံးစရိတ်ကို ဖျက်သိမ်းမှာ သေချာပါသလား?')) return;
      state.expenses = state.expenses.filter(x => x.id !== id);
      await syncToCloud(`အသုံးစရိတ် "${target?.title || id}" ကို ဖျက်သိမ်းခဲ့သည်`);
      window.showToast('အသုံးစရိတ် ဖျက်သိမ်းပြီးပါပြီ');
    };

    // ================= 13. ADMIN PANEL: MULTI-DEPARTMENT APPROVALS & SETTINGS =================
    function renderAdminPanel() {
      const allDepts = ['ADMIN', 'MANAGER', 'FINANCE', 'SALES', 'PURCHASE', 'ACADEMIC', 'PAGE_ADMIN'];

      document.getElementById('staffListContainer').innerHTML = state.users.map(u => {
        const uRoles = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role || 'PAGE_ADMIN'];
        return `
          <div class="p-4 rounded-2xl border bg-slate-50 space-y-3 text-xs">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <strong class="text-sm text-micro-navy">${u.name}</strong>
                <span class="text-slate-500 ml-1">(${u.email})</span>
                ${!u.approved ? '<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold ml-2">⏳ Pending Approval</span>' : '<span class="px-2 py-0.5 rounded bg-blue-100 text-micro-blue font-extrabold ml-2">✓ Approved</span>'}
              </div>
              <div class="flex items-center gap-2">
                <button type="button" onclick="window.toggleApprove('${u.id}')" class="px-3 py-1.5 rounded-xl font-extrabold ios-btn ${u.approved ? 'bg-amber-500 text-white' : 'bg-micro-navy text-micro-yellow'}">
                  ${u.approved ? 'Lock ပြန်ချမည်' : '✓ Approve ပေးမည်'}
                </button>
                <button type="button" onclick="window.openStaffModal('${u.id}')" class="px-3 py-1.5 rounded-xl bg-blue-50 text-micro-blue font-extrabold ios-btn">
                  Edit
                </button>
                <button type="button" onclick="window.deleteStaff('${u.id}')" class="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold ios-btn">✕</button>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
              <span class="text-[11px] font-bold text-slate-500 mr-1">ဌာနတာဝန်များ (နှိပ်၍ တိုး/လျှော့နိုင်သည်):</span>
              ${allDepts.map(dept => {
                const active = uRoles.includes(dept) || uRoles.includes('FOUNDER');
                return `
                  <button type="button" onclick="window.toggleUserDept('${u.id}', '${dept}')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ios-btn ${active ? 'bg-micro-navy text-micro-yellow border-micro-navy' : 'bg-white text-slate-500 border-slate-200'}">
                    ${active ? '✓ ' : '+ '}${dept}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');

      document.getElementById('courseManageList').innerHTML = state.courses.map(c => `
        <div class="flex items-center justify-between bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs">
          <div><strong class="text-micro-navy">${c.name}</strong> — <span class="font-bold text-micro-blue">${Number(c.fee).toLocaleString()} Ks</span></div>
          <div class="flex items-center gap-2">
            <button type="button" onclick="window.editCoursePrompt('${c.id}')" class="text-micro-blue font-bold ios-btn">ပြင်မည်</button>
            <button type="button" onclick="window.removeCourse('${c.id}')" class="text-rose-600 font-bold ios-btn">ဖျက်မည်</button>
          </div>
        </div>`).join('');

      document.getElementById('payManageList').innerHTML = state.paymentMethods.map((p, idx) => `
        <span class="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-micro-navy px-3 py-1 rounded-xl text-xs font-bold">
          ${p} <button type="button" onclick="window.removePayment(${idx})" class="text-rose-500 font-bold ml-1">×</button>
        </span>`).join('');

      document.getElementById('sourceManageList').innerHTML = state.leadSources.map((s, idx) => `
        <span class="inline-flex items-center gap-1.5 bg-slate-100 border text-slate-700 px-3 py-1 rounded-xl text-xs font-bold">
          ${s} <button type="button" onclick="window.removeSource(${idx})" class="text-rose-500 font-bold ml-1">×</button>
        </span>`).join('');

      const logs = state.auditLogs || [];
      document.getElementById('auditLogsContainer').innerHTML = logs.length === 0
        ? `<div class="text-slate-400 py-3">မှတ်တမ်း မရှိသေးပါ။</div>`
        : logs.map(lg => `
          <div class="p-2 rounded-xl bg-slate-50 border flex items-center justify-between">
            <span><strong class="text-micro-navy">${lg.user}:</strong> ${lg.action}</span>
            <span class="text-[10px] text-slate-400 shrink-0 ml-2">${lg.time}</span>
          </div>
        `).join('');
    }

    window.openStaffModal = (editId = '') => {
      const chks = document.querySelectorAll('.staff-role-chk');
      if (editId) {
        const u = state.users.find(x => x.id === editId);
        if (!u) return;
        document.getElementById('editStaffId').value = u.id;
        document.getElementById('staffNameInput').value = u.name || '';
        document.getElementById('staffEmailInput').value = u.email || '';
        document.getElementById('staffUsernameInput').value = u.username || '';
        document.getElementById('staffPhotoInput').value = u.photo || '';
        document.getElementById('staffPasswordInput').value = '';
        const uRoles = Array.isArray(u.roles) ? u.roles : [u.role || 'PAGE_ADMIN'];
        chks.forEach(chk => { chk.checked = uRoles.includes(chk.value); });
      } else {
        document.getElementById('editStaffId').value = '';
        document.getElementById('staffNameInput').value = '';
        document.getElementById('staffEmailInput').value = '';
        document.getElementById('staffUsernameInput').value = '';
        document.getElementById('staffPhotoInput').value = '';
        document.getElementById('staffPasswordInput').value = '';
        chks.forEach(chk => { chk.checked = chk.value === 'PAGE_ADMIN'; });
      }
      window.openModal('staffModal');
    };

    window.saveStaffMember = async () => {
      const editId = document.getElementById('editStaffId').value;
      const name = document.getElementById('staffNameInput').value.trim();
      const email = document.getElementById('staffEmailInput').value.trim();
      const username = document.getElementById('staffUsernameInput').value.trim().toLowerCase();
      const photo = document.getElementById('staffPhotoInput').value.trim();
      const selectedRoles = Array.from(document.querySelectorAll('.staff-role-chk:checked')).map(c => c.value);

      if (!name || !email) return window.showToast('ဝန်ထမ်းအမည်နှင့် Gmail ထည့်သွင်းပါ', 'error');
      if (selectedRoles.length === 0) selectedRoles.push('PAGE_ADMIN');

      if (editId) {
        const u = state.users.find(x => x.id === editId);
        if (u) {
          u.name = name;
          u.email = email;
          u.username = username || u.username || email.split('@')[0];
          u.roles = selectedRoles;
          u.role = selectedRoles[0];
          u.photo = photo;
        }
        window.closeModal('staffModal');
        await syncToCloud(`ဝန်ထမ်း "${name}" ၏ ဌာနတာဝန်များကို ပြင်ဆင်ခဲ့သည်`);
        window.showToast('ဝန်ထမ်းတာဝန်များ ပြင်ဆင်ပြီးပါပြီ');
      } else {
        state.users.push({
          id: 'u_' + Date.now(),
          name,
          email,
          username: username || email.split('@')[0],
          role: selectedRoles[0],
          roles: selectedRoles,
          photo,
          approved: true
        });
        window.closeModal('staffModal');
        await syncToCloud(`ဝန်ထမ်းအသစ် "${name}" ကို ထည့်သွင်းခဲ့သည်`);
        window.showToast(`ဝန်ထမ်းအသစ် "${name}" ထည့်သွင်းပြီးပါပြီ`);
      }
    };

    window.createStaffAccount=async()=>{
      if(!isAdmin())return window.showToast('Founder / Admin သာ Staff Account ဖန်တီးနိုင်သည်','error');
      const name=(document.getElementById('eaName')?.value||'').trim(),email=(document.getElementById('eaEmail')?.value||'').trim().toLowerCase(),username=(document.getElementById('eaUsername')?.value||'').trim().toLowerCase(),password=document.getElementById('eaPassword')?.value||'',role=document.getElementById('eaRole')?.value||'PAGE_ADMIN';
      if(!name||!email||!username||password.length<6)return window.showToast('Name / Gmail / Username / Password(6+) အားလုံးထည့်ပါ','error');
      if(state.users.some(u=>(u.email||'').toLowerCase()===email||(u.username||'').toLowerCase()===username))return window.showToast('Gmail သို့မဟုတ် Username ရှိပြီးသားပါ','error');
      if(!auth)return window.showToast('Firebase Authentication မချိတ်ဆက်ရသေးပါ','error');
      try{const {initializeApp}=await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");const {getAuth,createUserWithEmailAndPassword,signOut}=await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");const secondary=initializeApp(firebaseConfig,'mtc_staff_'+Date.now());const sa=getAuth(secondary);await createUserWithEmailAndPassword(sa,email,password);await signOut(sa).catch(()=>{});const u={id:uid('U'),name,email,username,role,roles:[role],permissions:{},photo:'',approved:false,createdAt:new Date().toISOString(),createdBy:getActiveUser().name};ensureUserPermissionShape(u);state.users.push(u);notify('New Staff Approval Request',`${name} (${email}) Staff Account Approval စောင့်ဆိုင်းနေပါသည်`,FOUNDER_GMAIL);await syncToCloud(`Staff Account ${name} ဖန်တီးခဲ့ပြီး Approval Pending`);window.showToast('Staff Account ဖန်တီးပြီး Approval Pending သိမ်းပြီးပါပြီ');window.setEnterprisePanel('admin');}
      catch(e){console.error(e);window.showToast(e?.code==='auth/email-already-in-use'?'Gmail အကောင့်ရှိပြီးသားပါ':'Staff Account ဖန်တီးမရပါ — Firebase Authentication ကိုစစ်ပါ','error');}
    };

    window.toggleUserDept = async (uid, dept) => {
      const u = state.users.find(x => x.id === uid);
      if (!u) return;
      if (!Array.isArray(u.roles)) u.roles = [u.role || 'PAGE_ADMIN'];
      ensureUserPermissionShape(u);
      if (u.roles.includes(dept)) {
        if (u.roles.length === 1) return window.showToast('အနည်းဆုံး ဌာန ၁ ခု ရှိရပါမည်', 'error');
        u.roles = u.roles.filter(r => r !== dept);
      } else {
        u.roles.push(dept);
      }
      u.role = u.roles[0];
      await syncToCloud(`${u.name} ၏ ဌာနခွင့်ပြုချက် (${dept}) ပြောင်းလဲခဲ့သည်`);
      window.showToast(`${u.name} ၏ ဌာနတာဝန် ပြောင်းလဲပြီးပါပြီ`);
    };

    window.toggleApprove = async (uid) => {
      const u = state.users.find(x => x.id === uid);
      if (u) {
        u.approved = !u.approved;
        await syncToCloud(`${u.name} အား ${u.approved ? 'Approve ပေးခဲ့သည်' : 'Lock ချခဲ့သည်'}`);
        window.showToast(`${u.name} အား ${u.approved ? 'Approve ပေးလိုက်ပါပြီ' : 'Lock ချလိုက်ပါပြီ'}`);
      }
    };

    window.deleteStaff = async (uid) => {
      const u = state.users.find(x => x.id === uid);
      if (!confirm(`"${u?.name || ''}" ကို ဝန်ထမ်းစာရင်းမှ ဖျက်မည်မှာ သေချာပါသလား?`)) return;
      state.users = state.users.filter(x => x.id !== uid);
      await syncToCloud();
    };

    window.addCourse = async () => {
      const name = document.getElementById('newCourseName').value.trim();
      const fee = Number(document.getElementById('newCourseFee').value || 0);
      if (!name) return window.showToast('သင်တန်းအမည် ရိုက်ထည့်ပါ', 'error');
      state.courses.push({ id: 'c_' + Date.now(), name, fee });
      document.getElementById('newCourseName').value = '';
      document.getElementById('newCourseFee').value = '';
      await syncToCloud(`သင်တန်းအသစ် "${name}" ထည့်သွင်းခဲ့သည်`);
      window.showToast(`"${name}" သင်တန်းအသစ် ထည့်ပြီးပါပြီ`);
    };

    window.editCoursePrompt = async (cid) => {
      const c = state.courses.find(x => x.id === cid);
      if (!c) return;
      const newName = prompt('သင်တန်းအမည် ပြင်ဆင်ရန်:', c.name);
      if (!newName) return;
      const newFee = prompt('သင်တန်းကြေး (Ks) ပြင်ဆင်ရန်:', c.fee);
      c.name = newName.trim();
      c.fee = Number(newFee || 0);
      await syncToCloud(`သင်တန်း "${c.name}" အချက်အလက် ပြင်ဆင်ခဲ့သည်`);
      window.showToast('သင်တန်းအချက်အလက် ပြင်ဆင်ပြီးပါပြီ');
    };

    window.removeCourse = async (cid) => {
      state.courses = state.courses.filter(x => x.id !== cid);
      await syncToCloud();
    };

    window.addPaymentMethod = async () => {
      const val = document.getElementById('newPayName').value.trim();
      if (!val) return;
      state.paymentMethods.push(val);
      document.getElementById('newPayName').value = '';
      await syncToCloud();
      window.showToast(`"${val}" ထည့်သွင်းပြီးပါပြီ`);
    };

    window.removePayment = async (idx) => {
      state.paymentMethods.splice(idx, 1);
      await syncToCloud();
    };

    window.addLeadSource = async () => {
      const val = document.getElementById('newSourceInput').value.trim();
      if (!val) return;
      state.leadSources.push(val);
      document.getElementById('newSourceInput').value = '';
      await syncToCloud();
      window.showToast(`"${val}" ထည့်သွင်းပြီးပါပြီ`);
    };

    window.removeSource = async (idx) => {
      state.leadSources.splice(idx, 1);
      await syncToCloud();
    };


    // ================= 14. ENTERPRISE MODULES — FULL WORKING CENTER =================
    const ENT_PANELS=['customers','students','codes','courses','teachers','attendance','reports','documents','notifications','ai','admin'];
    let currentEnterprisePanel='customers';
    let currentReportDept='ALL';
    const REPORT_DEPTS=['ALL','PAGE_ADMIN','SALES','MANAGER','ACADEMIC','PURCHASE','FINANCE','HR','TEACHER'];
    const PERM_ACTIONS=['View','Add','Edit','Delete','Approve','Export','Report','Settings'];
    const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const uid=p=>p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
    const todayISO=()=>new Date().toISOString().slice(0,10);
    function isAdmin(){const u=getActiveUser();return !!(u.roles||[]).some(r=>r==='FOUNDER'||r==='ADMIN')}
    function ensureUserPermissionShape(u){if(!u)return;if(!u.permissions||typeof u.permissions!=='object')u.permissions={};(u.roles||[]).forEach(r=>{if(!u.permissions[r])u.permissions[r]=JSON.parse(JSON.stringify(state.permissions?.[r]||{}));});}
    function hasPermission(action, dept){
      const u=getActiveUser(); if(isAdmin()) return true; if(!u.approved)return false;
      const roles=u.roles||[]; if(!dept)return roles.some(r=>hasPermission(action,r));
      const personal=u.permissions?.[dept]; if(personal&&Object.prototype.hasOwnProperty.call(personal,action))return !!personal[action];
      return roles.includes(dept)&&!!state.permissions?.[dept]?.[action];
    }
    function requirePerm(action,dept){if(!hasPermission(action,dept)){window.showToast(`ဤ Department ၏ ${action} Permission ကို Admin မှ မပေးထားသေးပါ`,'error');return false}return true}
    window.toggleStaffPermission=async(uid,dept,action,checked)=>{if(!isAdmin())return window.showToast('Admin သာ Permission ပြောင်းနိုင်သည်','error');const u=state.users.find(x=>x.id===uid);if(!u)return;ensureUserPermissionShape(u);if(!u.permissions[dept])u.permissions[dept]={};u.permissions[dept][action]=!!checked;await syncToCloud(`${u.name} • ${dept} • ${action} = ${checked?'Allow':'Deny'}`);window.setEnterprisePanel('admin');};
    function monthKey(d=new Date()){return new Date(d).toISOString().slice(0,7)}
    function fmtKs(n){return Number(n||0).toLocaleString()+' Ks'}
    function enterpriseHeader(title,subtitle,button=''){return `<div class="flex flex-col md:flex-row md:items-center justify-between gap-3"><div><h2 class="text-lg font-black text-micro-navy">${title}</h2><p class="text-xs text-slate-500 mt-1">${subtitle}</p></div>${button}</div>`}
    function courseOptions(selected=''){return state.courses.map(c=>`<option value="${esc(c.id)}" ${c.id===selected?'selected':''}>${esc(c.name)}</option>`).join('')}
    function teacherOptions(selected=''){return state.teachers.map(t=>`<option value="${esc(t.id)}" ${t.id===selected?'selected':''}>${esc(t.name)}</option>`).join('')}
    function departmentOptions(selected=''){return state.departments.filter(d=>d.active!==false).map(d=>`<option value="${esc(d.id)}" ${d.id===selected?'selected':''}>${esc(d.name)}</option>`).join('')}
    function courseName(id){return state.courses.find(c=>c.id===id)?.name || id || '-'}
    function deptName(id){return state.departments.find(d=>d.id===id)?.name || id || '-'}
    function studentOptions(selected=''){return state.students.map(t=>`<option value="${esc(t.id)}" ${t.id===selected?'selected':''}>${esc(t.name)} (${esc(t.studentCode||'-')})</option>`).join('')}
    function activePeriodFromUI(){
      const s=document.getElementById('reportStart')?.value||''; const e=document.getElementById('reportEnd')?.value||'';
      return {start:s,end:e,month:document.getElementById('reportMonth')?.value||''};
    }
    function inRange(date,start,end){const d=String(date||'').slice(0,10);return (!start||d>=start)&&(!end||d<=end)}
    function reportRows(dept='ALL',start='',end=''){
      const rows=[];
      const itemDept=(item,fallback)=>item.department||item.dept||item.recordDepartment||fallback;
      const deptMatch=(item,fallback)=>{const d=itemDept(item,fallback); if(dept==='ALL')return true; if((dept==='FINANCE'||dept==='PURCHASE') && item.module==='Expense')return true; return d===dept;};
      (state.students||[]).forEach(x=>{if(inRange(x.date,start,end)&&deptMatch(x,'ACADEMIC'))rows.push({date:x.date,module:'Student',department:itemDept(x,'ACADEMIC'),name:x.name,phone:x.phone||'-',course:courseName(x.courseId)||x.course||'-',type:x.type||'-',amount:x.fee||0,status:'Registered',id:x.id})});
      (state.customers||[]).forEach(x=>{if(inRange(x.date,start,end)&&deptMatch(x,'PAGE_ADMIN'))rows.push({date:x.date,module:'Customer Inquiry',department:itemDept(x,'PAGE_ADMIN'),name:x.name,phone:x.phone||'-',course:x.course||'-',type:'Inquiry',amount:0,status:x.stage||'Inquiry',id:x.id})});
      (state.leads||[]).forEach(x=>{if(inRange(x.date,start,end)&&deptMatch(x,'SALES'))rows.push({date:x.date,module:'Sales/Lead',department:itemDept(x,'SALES'),name:x.name,phone:x.phone||'-',course:x.course||'-',type:x.paymentStatus||'-',amount:Number(x.paidAmount||0),status:x.leadStage||'-',id:x.id})});
      (state.expenses||[]).forEach(x=>{const r={date:x.date,module:'Expense',department:itemDept(x,'FINANCE'),name:x.title||'-',phone:'-',course:x.category||'-',type:'Expense',amount:-Number(x.amount||0),status:'Paid',id:x.id};if(inRange(x.date,start,end)&&deptMatch(r,'FINANCE'))rows.push(r)});
      (state.attendance||[]).forEach(x=>{if(inRange(x.date,start,end)&&deptMatch(x,'ACADEMIC'))rows.push({date:x.date,module:'Attendance',department:itemDept(x,'ACADEMIC'),name:x.studentName||'-',phone:'-',course:x.course||'-',type:'Attendance',amount:0,status:x.status||'-',id:x.id})});
      return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    }
    window.openPendingApprovalFromNotification=()=>{if(isAdmin())window.setEnterprisePanel('admin')};
    function notify(title,body,forEmail=''){
      if(!Array.isArray(state.notifications))state.notifications=[];
      state.notifications.unshift({id:uid('N'),title,body,forEmail:forEmail||'ALL',read:false,date:new Date().toISOString()});
      state.notifications=state.notifications.slice(0,200);
    }
    function openEnt(title,html){document.getElementById('enterpriseModalTitle').textContent=title;document.getElementById('enterpriseModalBody').innerHTML=html;window.openModal('enterpriseModal')}
    window.setReportDept=(dept)=>{ currentReportDept=dept||'ALL'; window.setEnterprisePanel('reports',currentReportDept); };
    window.setEnterprisePanel=(panel,dept='')=>{
      if(panel==='notifications'){const me=(getActiveUser().email||'').toLowerCase();(state.notifications||[]).forEach(n=>{if(n.forEmail==='ALL'||!n.forEmail||n.forEmail.toLowerCase()===me||isAdmin())n.read=true;});try{localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(state))}catch(e){}}
      if(!ENT_PANELS.includes(panel))panel='customers';
      if(dept)currentReportDept=dept;
      const required={customers:'PAGE_ADMIN',students:'ACADEMIC',codes:'ACADEMIC',courses:'ACADEMIC',teachers:'ACADEMIC',attendance:'ACADEMIC',documents:'SALES',ai:'PAGE_ADMIN',admin:'ADMIN'}[panel];
      if(panel==='reports'){ if(currentReportDept!=='ALL' && !hasPermission('Report',currentReportDept)){window.showToast('ဤ Department Report ကို Admin မှ မခွင့်ပြုထားပါ','error');return;} if(currentReportDept==='ALL' && !hasPermission('Report')){window.showToast('Report Permission မရှိပါ','error');return;} }
      else if(required==='ADMIN' && !isAdmin()){window.showToast('Founder / Admin Control Center သို့ Admin သာ ဝင်ရောက်နိုင်သည်','error');return;}
      else if(required && !hasPermission('View',required)){window.showToast('ဤ Department ကိုကြည့်ရှုခွင့် မရှိပါ','error');return;}
      currentEnterprisePanel=panel;
      ENT_PANELS.forEach(p=>document.getElementById('enterprisePanel'+p[0].toUpperCase()+p.slice(1))?.classList.toggle('hidden',p!==panel));
      renderEnterprisePanel();
    };

    window.openCustomerEntry=(editId='')=>{
      const x=editId?(state.customers||[]).find(v=>v.id===editId):null;
      openEnt(editId?'Customer Inquiry ပြင်ဆင်ရန်':'Customer Inquiry စာရင်းသွင်းရန်',`<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <input id="ecId" type="hidden" value="${esc(x?.id||'')}">
        <input id="ecName" class="border rounded-xl px-3 py-2.5" placeholder="Customer Name *" value="${esc(x?.name||'')}">
        <input id="ecPhone" class="border rounded-xl px-3 py-2.5" placeholder="Phone (မရှိရင် မထည့်လည်းရ)" value="${esc(x?.phone==='-'?'':x?.phone||'')}">
        <input id="ecDate" type="date" value="${esc(x?.date||todayISO())}" class="border rounded-xl px-3 py-2.5">
        <select id="ecCourse" class="border rounded-xl px-3 py-2.5"><option value="">Course မသတ်မှတ်ရသေး</option>${courseOptions(x?.courseId||'')}</select>
        <input id="ecSource" class="border rounded-xl px-3 py-2.5" placeholder="Source" value="${esc(x?.source==='-'?'':x?.source||'')}">
        <select id="ecDept" class="border rounded-xl px-3 py-2.5">${departmentOptions(x?.department||'D_PAGE')}</select>
        <textarea id="ecNote" class="sm:col-span-2 border rounded-xl px-3 py-2.5" rows="3" placeholder="Inquiry / Remark">${esc(x?.note==='-'?'':x?.note||'')}</textarea>
      </div><button onclick="window.saveEnterpriseCustomer()" class="mt-4 w-full py-3 rounded-2xl bg-micro-navy text-micro-yellow font-black">💾 ${editId?'ပြင်ဆင်ချက် သိမ်းမည်':'Customer သိမ်းမည်'}</button>`)
    };
    window.saveEnterpriseCustomer=async()=>{
      const id=document.getElementById('ecId').value; const dept=document.getElementById('ecDept').value||'D_PAGE';
      if(!requirePerm(id?'Edit':'Add', dept==='D_PAGE'?'PAGE_ADMIN':dept))return;
      const name=document.getElementById('ecName').value.trim(); if(!name)return window.showToast('Customer Name ထည့်ပါ','error');
      const courseId=document.getElementById('ecCourse').value;
      const obj={name,phone:document.getElementById('ecPhone').value.trim()||'-',date:document.getElementById('ecDate').value||todayISO(),courseId,course:courseId?courseName(courseId):'-',source:document.getElementById('ecSource').value.trim()||'-',note:document.getElementById('ecNote').value.trim()||'-',department:dept==='D_PAGE'?'PAGE_ADMIN':dept,updatedAt:new Date().toISOString()};
      if(id){const t=state.customers.find(v=>v.id===id);if(t)Object.assign(t,obj)}else{state.customers.unshift({id:uid('CUS'),...obj,createdBy:getActiveUser().name,createdAt:new Date().toISOString()});notify('Customer အသစ်',`${name} ကို Customer Inquiry ထဲသို့ ထည့်သွင်းထားသည်`)}
      window.closeModal('enterpriseModal'); await syncToCloud(`Customer "${name}" ${id?'ပြင်ဆင်':'အသစ်ထည့်'} ခဲ့သည်`);window.setEnterprisePanel('customers');
    };

    window.openStudentEntry=(editId='')=>{
      const x=editId?(state.students||[]).find(v=>v.id===editId):null;
      openEnt(editId?'Student Management ပြင်ဆင်ရန်':'Student Management — Student အသစ်သွင်းရန်',`<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <input id="esId" type="hidden" value="${esc(x?.id||'')}"><input id="esName" class="border rounded-xl px-3 py-2.5" placeholder="Student Name *" value="${esc(x?.name||'')}">
        <input id="esPhone" class="border rounded-xl px-3 py-2.5" placeholder="Phone" value="${esc(x?.phone==='-'?'':x?.phone||'')}">
        <input id="esDate" type="date" value="${esc(x?.date||todayISO())}" class="border rounded-xl px-3 py-2.5">
        <select id="esType" class="border rounded-xl px-3 py-2.5"><option ${x?.type==='Paid Student'?'selected':''}>Paid Student</option><option ${x?.type==='Day 1 Free Pass'?'selected':''}>Day 1 Free Pass</option></select>
        <select id="esCourse" class="border rounded-xl px-3 py-2.5">${courseOptions(x?.courseId||'')}</select>
        <input id="esBatch" class="border rounded-xl px-3 py-2.5" placeholder="Batch (optional)" value="${esc(x?.batch==='-'?'':x?.batch||'')}">
        <input id="esFee" type="number" class="border rounded-xl px-3 py-2.5" placeholder="Paid / Course Fee" value="${Number(x?.fee||0)}">
        <select id="esDept" class="border rounded-xl px-3 py-2.5">${departmentOptions(x?.department||'D_ACADEMIC')}</select>
        <textarea id="esNote" class="sm:col-span-2 border rounded-xl px-3 py-2.5" rows="2" placeholder="Remark">${esc(x?.note==='-'?'':x?.note||'')}</textarea>
      </div><button onclick="window.saveEnterpriseStudent()" class="mt-4 w-full py-3 rounded-2xl bg-micro-navy text-micro-yellow font-black">💾 ${editId?'ပြင်ဆင်ချက် သိမ်းမည်':'Student သိမ်းမည်'}</button>`)
    };
    window.saveEnterpriseStudent=async()=>{
      const id=document.getElementById('esId').value; const dept=document.getElementById('esDept').value||'D_ACADEMIC';
      const role=dept==='D_ACADEMIC'?'ACADEMIC':dept; if(!requirePerm(id?'Edit':'Add',role))return;
      const name=document.getElementById('esName').value.trim();if(!name)return window.showToast('Student Name ထည့်ပါ','error');
      const courseId=document.getElementById('esCourse').value; const obj={name,phone:document.getElementById('esPhone').value.trim()||'-',date:document.getElementById('esDate').value||todayISO(),type:document.getElementById('esType').value,courseId,course:courseId?courseName(courseId):'-',batch:document.getElementById('esBatch').value.trim()||'-',fee:Number(document.getElementById('esFee').value||0),note:document.getElementById('esNote').value.trim()||'-',department:role,updatedAt:new Date().toISOString()};
      if(id){const t=state.students.find(v=>v.id===id);if(t)Object.assign(t,obj)}else{state.students.unshift({id:uid('STU'),...obj,studentCode:'',createdBy:getActiveUser().name,createdAt:new Date().toISOString()});notify('Student အသစ်',`${name} ကို Student Management ထဲသို့ ထည့်သွင်းထားသည်`)}
      window.closeModal('enterpriseModal');await syncToCloud(`Student "${name}" ${id?'ပြင်ဆင်':'အသစ်ထည့်'} ခဲ့သည်`);window.setEnterprisePanel('students');
    };
    window.deleteEnterpriseStudent=async(id)=>{if(!requirePerm('Delete','ACADEMIC'))return;const x=state.students.find(v=>v.id===id);if(!x||!confirm(`${x.name} ကို ဖျက်မည်မှာ သေချာပါသလား?`))return;state.students=state.students.filter(v=>v.id!==id);await syncToCloud(`Student "${x.name}" ဖျက်ခဲ့သည်`);window.setEnterprisePanel('students')};

    // Separate code generator: Name + Course selection -> short code; also records it for Page Admin/Reports.
    window.generateStudentCode=async()=>{
      if(!requirePerm('Add','ACADEMIC'))return;
      const name=document.getElementById('codeStudentName')?.value.trim(); const courseId=document.getElementById('codeCourse')?.value;
      if(!name)return window.showToast('Student Name ရိုက်ထည့်ပါ','error'); if(!courseId)return window.showToast('Course / Class ကို Dropdown မှ ရွေးချယ်ပါ','error'); if(!state.courses.some(c=>c.id===courseId))return window.showToast('ရွေးထားသော Course မတွေ့ပါ','error');
      let seq=Number(state.settings.nextCodeSeq||1); let code;
      do{code=`${state.settings.codePrefix||'MTC'}-${new Date().getFullYear().toString().slice(-2)}${String(seq).padStart(4,'0')}`;seq++;}while((state.generatedCodes||[]).some(x=>x.code===code));
      state.settings.nextCodeSeq=seq;
      const student={id:uid('STU'),name,phone:'-',date:todayISO(),type:state.settings.defaultStudentType||'Paid Student',courseId,course:courseName(courseId),batch:'-',fee:Number(state.courses.find(c=>c.id===courseId)?.fee||0),note:'Code Generator မှ စတင်ထားသည်',studentCode:code,department:'ACADEMIC',createdBy:getActiveUser().name,createdAt:new Date().toISOString()};
      state.students.unshift(student); state.generatedCodes.unshift({id:uid('CODE'),code,studentId:student.id,studentName:name,course:student.course,courseId,generatedBy:getActiveUser().name,date:todayISO(),department:'ACADEMIC'});
      notify('Student Code Generated',`${name} • ${student.course} • ${code}`);
      await syncToCloud(`Student Code ${code} ကို ${name} အတွက် Generate လုပ်ခဲ့သည်`);
      document.getElementById('generatedCodeOutput').textContent=code;document.getElementById('generatedCodeMeta').textContent=`${name} • ${student.course}`;window.showToast('Short Student Code Generate ပြီးပါပြီ');
    };
    window.copyGeneratedCode=()=>{const v=document.getElementById('generatedCodeOutput')?.textContent;if(v&&v!=='—')navigator.clipboard?.writeText(v).then(()=>window.showToast('Code Copy ကူးပြီးပါပြီ'))};
    window.shareStudentCode=()=>{const code=document.getElementById('generatedCodeOutput')?.textContent;if(navigator.share&&code&&code!=='—')navigator.share({title:'MTC Student Code',text:`MTC Student Code: ${code}`}).catch(()=>{});else window.copyGeneratedCode()};

    window.openTeacherEntry=(editId='')=>{const x=editId?(state.teachers||[]).find(v=>v.id===editId):null;openEnt(editId?'Teacher ပြင်ဆင်ရန်':'Teacher Management — Teacher အသစ်သွင်းရန်',`<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"><input id="etId" type="hidden" value="${esc(x?.id||'')}"><input id="etName" class="border rounded-xl px-3 py-2.5" placeholder="Teacher Display Name *" value="${esc(x?.name||'')}"><input id="etPhoto" class="border rounded-xl px-3 py-2.5" placeholder="Photo URL (optional)" value="${esc(x?.photo||'')}"><input id="etDept" class="border rounded-xl px-3 py-2.5" placeholder="Department / Role" value="${esc(x?.department||'Teacher')}"><select id="etCourse" class="border rounded-xl px-3 py-2.5">${courseOptions(x?.courseId||'')}</select><input id="etBatch" class="border rounded-xl px-3 py-2.5" placeholder="Batch" value="${esc(x?.batch==='-'?'':x?.batch||'')}"><input id="etRoom" class="border rounded-xl px-3 py-2.5" placeholder="Room" value="${esc(x?.room==='-'?'':x?.room||'')}"><input id="etSchedule" class="sm:col-span-2 border rounded-xl px-3 py-2.5" placeholder="Mon, Wed, Fri • 8:00 PM - 9:30 PM" value="${esc(x?.schedule==='-'?'':x?.schedule||'')}"></div><button onclick="window.saveTeacher()" class="mt-4 w-full py-3 rounded-2xl bg-micro-navy text-micro-yellow font-black">💾 ${editId?'ပြင်ဆင်ချက် သိမ်းမည်':'Teacher သိမ်းမည်'}</button>`) };
    window.saveTeacher=async()=>{const id=document.getElementById('etId').value;if(!requirePerm(id?'Edit':'Add','ACADEMIC'))return;const name=document.getElementById('etName').value.trim();if(!name)return window.showToast('Teacher Name ထည့်ပါ','error');const courseId=document.getElementById('etCourse').value;const obj={name,photo:document.getElementById('etPhoto').value.trim()||'',department:document.getElementById('etDept').value.trim()||'Teacher',courseId,course:courseName(courseId),batch:document.getElementById('etBatch').value.trim()||'-',room:document.getElementById('etRoom').value.trim()||'-',schedule:document.getElementById('etSchedule').value.trim()||'-',updatedAt:new Date().toISOString()};if(id){const t=state.teachers.find(v=>v.id===id);if(t)Object.assign(t,obj)}else state.teachers.unshift({id:uid('T'),...obj});await syncToCloud(`Teacher "${name}" ${id?'ပြင်ဆင်':'အသစ်ထည့်'} ခဲ့သည်`);window.closeModal('enterpriseModal');window.setEnterprisePanel('teachers')};
    window.openScheduleEntry=()=>openEnt('Teacher Schedule / Timetable',`<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"><select id="schTeacher" class="border rounded-xl px-3 py-2.5">${teacherOptions()}</select><select id="schCourse" class="border rounded-xl px-3 py-2.5">${courseOptions()}</select><input id="schDate" type="date" value="${todayISO()}" class="border rounded-xl px-3 py-2.5"><input id="schTime" class="border rounded-xl px-3 py-2.5" placeholder="8:00 PM - 9:30 PM"><input id="schBatch" class="border rounded-xl px-3 py-2.5" placeholder="Batch"><input id="schRoom" class="border rounded-xl px-3 py-2.5" placeholder="Room"></div><button onclick="window.saveSchedule()" class="mt-4 w-full py-3 rounded-2xl bg-micro-navy text-micro-yellow font-black">💾 Schedule သိမ်းမည်</button>`);
    window.saveSchedule=async()=>{if(!requirePerm('Add','ACADEMIC'))return;const tid=document.getElementById('schTeacher').value,t=state.teachers.find(x=>x.id===tid),courseId=document.getElementById('schCourse').value;state.schedules.unshift({id:uid('SCH'),teacherId:tid,teacherName:t?.name||'-',teacherPhoto:t?.photo||'',courseId,course:courseName(courseId),date:document.getElementById('schDate').value,time:document.getElementById('schTime').value||'-',batch:document.getElementById('schBatch').value||'-',room:document.getElementById('schRoom').value||'-',department:'ACADEMIC'});await syncToCloud('Teacher Schedule အသစ်သိမ်းခဲ့သည်');window.closeModal('enterpriseModal');window.setEnterprisePanel('teachers')};
    window.markStudentAttendance=async(sid,status='Present')=>{if(!requirePerm('Add','ACADEMIC'))return;const st=state.students.find(x=>x.id===sid);if(!st)return;const date=document.getElementById('attendanceDate')?.value||todayISO();const old=state.attendance.find(a=>a.studentId===sid&&a.date===date);if(old)old.status=status,old.markedBy=getActiveUser().name;else state.attendance.unshift({id:uid('ATT'),studentId:sid,studentName:st.name,studentCode:st.studentCode||'-',course:st.course,batch:st.batch,date,status,markedBy:getActiveUser().name,department:'ACADEMIC'});await syncToCloud(`Attendance ${st.name} = ${status}`);window.setEnterprisePanel('attendance')};

    window.openCourseEntry=(editId='')=>{const x=editId?(state.courses||[]).find(v=>v.id===editId):null;openEnt(editId?'Course ပြင်ဆင်ရန်':'Course အသစ်ထည့်ရန်',`<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"><input id="entCourseId" type="hidden" value="${esc(x?.id||'')}"><input id="entCourseName" class="border rounded-xl px-3 py-2.5" placeholder="Course Name *" value="${esc(x?.name||'')}"><input id="entCourseFee" type="number" class="border rounded-xl px-3 py-2.5" placeholder="Course Fee" value="${Number(x?.fee||0)}"><input id="entCourseDesc" class="sm:col-span-2 border rounded-xl px-3 py-2.5" placeholder="Description / Batch Notes" value="${esc(x?.description||'')}"></div><button onclick="window.addEntCourse()" class="mt-4 w-full py-3 rounded-2xl bg-micro-navy text-micro-yellow font-black">💾 သိမ်းမည်</button>`)};
    window.addEntCourse=async()=>{const id=document.getElementById('entCourseId').value;if(!requirePerm(id?'Edit':'Add','ACADEMIC'))return;const n=document.getElementById('entCourseName').value.trim(),f=Number(document.getElementById('entCourseFee').value||0);if(!n)return window.showToast('Course Name ထည့်ပါ','error');const obj={name:n,fee:f,description:document.getElementById('entCourseDesc').value.trim()||'-',updatedAt:new Date().toISOString()};if(id){const c=state.courses.find(x=>x.id===id);if(c)Object.assign(c,obj)}else state.courses.push({id:uid('C'),...obj});await syncToCloud(`Course "${n}" ${id?'ပြင်ဆင်':'အသစ်ထည့်'} ခဲ့သည်`);window.closeModal('enterpriseModal');window.setEnterprisePanel('courses')};
    window.removeCourse=async(cid)=>{if(!requirePerm('Delete','ACADEMIC'))return;const c=state.courses.find(x=>x.id===cid);if(!c||!confirm(`"${c.name}" ကို ဖျက်မည်မှာ သေချာပါသလား?`))return;state.courses=state.courses.filter(x=>x.id!==cid);await syncToCloud(`Course "${c.name}" ဖျက်ခဲ့သည်`);window.setEnterprisePanel('courses')};

    window.monthClose=async()=>{
      if(!isAdmin())return window.showToast('Monthly Close ကို Admin သာ လုပ်နိုင်သည်','error');
      const m=monthKey(new Date()); if((state.monthlyClosures||[]).some(x=>x.month===m))return window.showToast(`${m} ကို ပိတ်ပြီးသားပါ`);
      state.monthlyClosures.unshift({month:m,closedAt:new Date().toISOString(),closedBy:getActiveUser().name});
      notify('Monthly Closing',`${m} စာရင်းကို Closing ပိတ်ပြီးပါပြီ`);await syncToCloud(`Monthly Close ${m}`);window.showToast(`${m} Monthly Close ပြီးပါပြီ`);window.setEnterprisePanel('reports');
    };
    function ensureMonthlyClose(){
      const day=new Date().getDate(); const closeDay=Number(state.settings.monthlyCloseDay||28); if(day<=closeDay)return;
      const prev=new Date();prev.setMonth(prev.getMonth()-1);const m=monthKey(prev);if(!(state.monthlyClosures||[]).some(x=>x.month===m)){state.monthlyClosures.unshift({month:m,closedAt:new Date().toISOString(),closedBy:'SYSTEM AUTO CLOSE'});syncToCloud(`System Auto Monthly Close ${m}`)}
    }
    function tryStudentPortal(){
      const code=new URLSearchParams(location.search).get('student');
      if(!code || !state.settings.studentPortalEnabled) return false;
      const st=(state.students||[]).find(x=>(x.studentCode||'').toLowerCase()===code.toLowerCase());
      if(!st){document.getElementById('loginScreen').innerHTML='<div class="ios-card p-8 text-center"><h2 class="text-xl font-black">Student Code မတွေ့ပါ</h2><p class="text-xs text-slate-500 mt-2">Code ကို ပြန်စစ်ပေးပါ။</p></div>';return true;}
      document.getElementById('loginScreen').innerHTML=`<div class="ios-card p-8 text-center space-y-3"><div class="text-[10px] uppercase tracking-widest text-micro-yellow font-black">MTC Student Portal</div><h2 class="text-2xl font-black text-micro-navy">${esc(st.name)}</h2><div class="text-sm text-micro-blue font-black">${esc(st.studentCode||'-')}</div><div class="text-xs text-slate-600">Course: ${esc(st.course||'-')}<br>Type: ${esc(st.type||'-')}<br>Batch: ${esc(st.batch||'-')}<br>Date: ${esc(st.date||'-')}</div></div>`;return true;
    }

    window.exportEnterpriseE=async()=>{
      if(!requirePerm('Export'))return;
      const {start,end}=activePeriodFromUI(); const rows=reportRows(currentReportDept,start,end).map(r=>({Date:r.date,Module:r.module,Department:r.department,Name:r.name,Phone:r.phone,Course:r.course,Type:r.type,Amount:r.amount,Status:r.status,RecordID:r.id}));
      if(window.XLSX){const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'MTC Report');XLSX.writeFile(wb,`MTC_${currentReportDept}_Report_${todayISO()}.xlsx`);}else{const csv='\uFEFF'+['Date,Module,Department,Name,Phone,Course,Type,Amount,Status,RecordID',...rows.map(r=>[r.Date,r.Module,r.Department,r.Name,r.Phone,r.Course,r.Type,r.Amount,r.Status,r.RecordID].map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`MTC_${currentReportDept}_Report_${todayISO()}.csv`;a.click();}state.importHistory.unshift({id:uid('EXP'),type:'E Export',date:new Date().toISOString(),by:getActiveUser().name,department:currentReportDept});await syncToCloud('E / Excel Report Export ထုတ်ခဲ့သည်');
    };
    window.importEnterpriseE=async(ev)=>{
      if(!requirePerm('Add'))return;const file=ev.target.files?.[0];if(!file)return;
      try{const data=await file.arrayBuffer();const wb=XLSX.read(data,{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];const rows=XLSX.utils.sheet_to_json(ws,{defval:''});let count=0;
        for(const o of rows){const name=String(o.StudentName||o.Name||'').trim();if(!name)continue;const code=String(o.StudentCode||o.Code||'').trim();let existing=code?(state.students||[]).find(s=>s.studentCode===code):null;const courseText=String(o.Course||'').trim();const c=state.courses.find(x=>x.name.toLowerCase()===courseText.toLowerCase());const obj={name,phone:String(o.Phone||'-')||'-',date:String(o.Date||todayISO()).slice(0,10),type:String(o.Type||'Paid Student'),courseId:c?.id||'',course:c?.name||courseText||'-',batch:String(o.Batch||'-')||'-',fee:Number(o.Fee||o.Amount||0),note:String(o.Note||'-')||'-',department:String(o.Department||'ACADEMIC'),studentCode:code,updatedAt:new Date().toISOString()};if(existing)Object.assign(existing,obj);else state.students.push({id:uid('STU'),...obj,createdBy:getActiveUser().name,createdAt:new Date().toISOString()});count++}
        state.importHistory.unshift({id:uid('IMP'),type:'E Import',count,date:new Date().toISOString(),by:getActiveUser().name});await syncToCloud(`E Import ဖြင့် ${count} row ထည့်/ပြင်ခဲ့သည်`);window.showToast(`${count} row Import ပြီးပါပြီ`);window.setEnterprisePanel('students');
      }catch(e){console.error(e);window.showToast('Excel file ဖတ်မရပါ','error')}finally{ev.target.value=''}
    };
    window.exportReportPDF=async()=>{
      if(!requirePerm('Export'))return;const {start,end,month}=activePeriodFromUI();let s=start,e=end;if(month){s=month+'-01';const d=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0);e=`${month}-${String(d.getDate()).padStart(2,'0')}`}
      const rows=reportRows(currentReportDept,s,e);const total=rows.reduce((a,r)=>a+Number(r.amount||0),0);const wrap=document.createElement('div');wrap.style.padding='24px';wrap.style.fontFamily='Inter,Padauk,sans-serif';wrap.innerHTML=`<h1 style="color:#142143">MTC Enterprise Report</h1><p>Department: ${esc(currentReportDept)} | ${esc(s||'All')} to ${esc(e||'All')}</p><h3>Total Records: ${rows.length} | Net Amount: ${fmtKs(total)}</h3><table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr style="background:#142143;color:#ffaf00"><th>Date</th><th>Module</th><th>Department</th><th>Name</th><th>Course</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.module)}</td><td>${esc(r.department)}</td><td>${esc(r.name)}</td><td>${esc(r.course)}</td><td>${fmtKs(r.amount)}</td><td>${esc(r.status)}</td></tr>`).join('')}</tbody></table>`;document.body.appendChild(wrap);await html2pdf().from(wrap).set({margin:8,filename:`MTC_${currentReportDept}_Report_${todayISO()}.pdf`,image:{type:'jpeg',quality:.98},html2canvas:{scale:2},jsPDF:{unit:'mm',format:'a4',orientation:'landscape'}}).save();wrap.remove();
    };
    window.exportBackupJSON=()=>{if(!requirePerm('Export'))return;const a=document.createElement('a');a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(state,null,2));a.download=`MTC_Backup_${todayISO()}.json`;a.click()};
    window.importBackupJSON=async(ev)=>{if(!isAdmin())return window.showToast('Backup Restore ကို Admin သာ လုပ်နိုင်သည်','error');const f=ev.target.files?.[0];if(!f)return;try{const parsed=JSON.parse(await f.text());if(!parsed||typeof parsed!=='object')throw new Error('bad');if(!confirm('Backup ကို Restore လုပ်မည်မှာ သေချာပါသလား?'))return;state={...defaultData,...parsed};await syncToCloud('Backup JSON Restore လုပ်ခဲ့သည်');window.showToast('Backup Restore ပြီးပါပြီ');window.setEnterprisePanel('admin')}catch(e){window.showToast('Backup JSON မမှန်ပါ','error')}finally{ev.target.value=''}};

    window.addDepartment=async()=>{if(!requirePerm('Settings','ADMIN'))return;const name=prompt('Department အမည်ထည့်ပါ');if(!name)return;const id='D_'+name.toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');if(state.departments.some(d=>d.id===id||d.name.toLowerCase()===name.toLowerCase()))return window.showToast('Department ရှိပြီးသားပါ','error');state.departments.push({id,name,active:true});if(!state.permissions[id])state.permissions[id]={View:true,Add:false,Edit:false,Delete:false,Approve:false,Export:false,Report:false,Settings:false};await syncToCloud(`Department "${name}" ထည့်သွင်းခဲ့သည်`);window.setEnterprisePanel('admin')};
    window.toggleDepartment=async(id)=>{if(!isAdmin())return;const d=state.departments.find(x=>x.id===id);if(!d)return;d.active=d.active===false;await syncToCloud(`Department "${d.name}" ${d.active?'ဖွင့်':'ပိတ်'} ခဲ့သည်`);window.setEnterprisePanel('admin')};
    window.togglePermission=async(role,action,value)=>{if(!isAdmin())return;state.permissions[role]??={};state.permissions[role][action]=value!==undefined?!!value:!state.permissions[role][action];await syncToCloud(`Permission ${role}/${action} ပြောင်းလဲခဲ့သည်`);window.setEnterprisePanel('admin')};
    window.toggleUserDept=async(uidv,dept)=>{if(!isAdmin())return;const u=state.users.find(x=>x.id===uidv);if(!u)return;u.roles=Array.isArray(u.roles)?u.roles:[];if(u.roles.includes(dept))u.roles=u.roles.filter(r=>r!==dept);else u.roles.push(dept);if(!u.roles.length)u.roles=['PAGE_ADMIN'];u.role=u.roles[0];await syncToCloud(`${u.name} ၏ ${dept} Department Access ပြောင်းလဲခဲ့သည်`);window.setEnterprisePanel('admin')};
    window.toggleApprove=async(uidv)=>{if(!isAdmin())return;const u=state.users.find(x=>x.id===uidv);if(!u)return;u.approved=!u.approved;notify(u.approved?'Account Approved':'Account Locked',`${u.name} (${u.email}) အား ${u.approved?'အသုံးပြုခွင့် ပေးလိုက်ပါပြီ':'အသုံးပြုခွင့် ပိတ်လိုက်ပါပြီ'}`,u.email);await syncToCloud(`${u.name} အား ${u.approved?'Approve':'Lock'} လုပ်ခဲ့သည်`);window.setEnterprisePanel('admin')};

    window.saveEnterpriseSettings=async()=>{if(!isAdmin())return window.showToast('Admin သာ Settings ပြင်နိုင်သည်','error');state.settings.codePrefix=document.getElementById('setPrefix').value.trim()||'MTC';state.settings.aiProvider=document.getElementById('setAiProvider')?.value||state.settings.aiProvider;state.settings.studentPortalEnabled=document.getElementById('setPortal').checked;state.settings.brandName=document.getElementById('setBrand').value.trim()||'MTC';state.settings.monthlyCloseDay=Number(document.getElementById('setCloseDay').value||28);await syncToCloud('Enterprise Admin Settings သိမ်းဆည်းခဲ့သည်');window.showToast('Admin Settings သိမ်းဆည်းပြီးပါပြီ');window.setEnterprisePanel('admin')};
    window.saveLogoFile=async(ev)=>{if(!isAdmin())return;const f=ev.target.files?.[0];if(!f)return;if(f.size>300000) return window.showToast('Logo file 300KB အောက်ထားပါ','error');const r=new FileReader();r.onload=async()=>{state.settings.logoData=r.result;await syncToCloud('MTC Logo ပြောင်းလဲခဲ့သည်');window.showToast('Logo Update ပြီးပါပြီ');window.setEnterprisePanel('admin')};r.readAsDataURL(f)};

    function renderEnterprisePanel(){
      const ids={};ENT_PANELS.forEach(p=>ids[p]=document.getElementById('enterprisePanel'+p[0].toUpperCase()+p.slice(1)));if(!ids[currentEnterprisePanel])return;
      const students=state.students||[],customers=state.customers||[];
      if(currentEnterprisePanel==='customers'){
        const canEdit=hasPermission('Edit','PAGE_ADMIN'); const canDelete=hasPermission('Delete','PAGE_ADMIN');
        ids.customers.innerHTML=enterpriseHeader('Customer Inquiry','Student Management နှင့် သီးခြား Customer Data — လာမေးသူများအတွက် သီးသန့်စာရင်း',`<button onclick="window.openCustomerEntry()" class="bg-micro-navy text-micro-yellow px-4 py-2.5 rounded-2xl font-black">+ Customer အသစ်</button>`)+`<div class="ios-card overflow-auto"><table class="w-full text-xs"><thead><tr class="bg-slate-50"><th class="p-3">Date</th><th class="p-3 text-left">Customer</th><th class="p-3">Phone</th><th class="p-3">Course</th><th class="p-3">Source</th><th class="p-3">Remark</th><th class="p-3">Action</th></tr></thead><tbody>${customers.map(x=>`<tr class="border-t"><td class="p-3">${esc(x.date)}</td><td class="p-3 font-bold">${esc(x.name)}</td><td class="p-3">${esc(x.phone||'-')}</td><td class="p-3">${esc(x.course||'-')}</td><td class="p-3">${esc(x.source||'-')}</td><td class="p-3">${esc(x.note||'-')}</td><td class="p-3 whitespace-nowrap">${canEdit?`<button onclick="window.openCustomerEntry('${x.id}')" class="px-2 py-1 bg-blue-50 rounded-lg">Edit</button>`:''}${canDelete?` <button onclick="window.deleteEnterpriseCustomer('${x.id}')" class="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg">Delete</button>`:''}</td></tr>`).join('')||'<tr><td colspan="7" class="p-8 text-center text-slate-400">Customer မရှိသေးပါ</td></tr>'}</tbody></table></div>`;
      }
      if(currentEnterprisePanel==='students'){
        const canEdit=hasPermission('Edit','ACADEMIC'),canDelete=hasPermission('Delete','ACADEMIC');
        ids.students.innerHTML=enterpriseHeader('Student Management','Paid Student / Day 1 Free Pass ကို သီးခြားခွဲပြီး Data အပြည့်အစုံ သိမ်းဆည်းနိုင်သည်',`<button onclick="window.openStudentEntry()" class="bg-micro-navy text-micro-yellow px-4 py-2.5 rounded-2xl font-black">+ Student အသစ်</button>`)+`<div class="ios-card overflow-auto"><table class="w-full text-xs"><thead><tr class="bg-slate-50"><th class="p-3">Code</th><th class="p-3 text-left">Name</th><th class="p-3">Phone</th><th class="p-3">Type</th><th class="p-3">Course</th><th class="p-3">Batch</th><th class="p-3">Date</th><th class="p-3">Action</th></tr></thead><tbody>${students.map(x=>`<tr class="border-t"><td class="p-3 font-black text-micro-blue">${esc(x.studentCode||'-')}</td><td class="p-3 font-bold">${esc(x.name)}</td><td class="p-3">${esc(x.phone||'-')}</td><td class="p-3">${esc(x.type||'-')}</td><td class="p-3">${esc(x.course||courseName(x.courseId))}</td><td class="p-3">${esc(x.batch||'-')}</td><td class="p-3">${esc(x.date)}</td><td class="p-3 whitespace-nowrap"><button onclick="window.printEnterpriseInvoice('${x.id}')" class="px-2 py-1 bg-blue-50 rounded-lg">Invoice</button> <button onclick="window.printCertificate('${x.id}')" class="px-2 py-1 bg-amber-50 rounded-lg">Certificate</button>${canEdit?` <button onclick="window.openStudentEntry('${x.id}')" class="px-2 py-1 bg-slate-100 rounded-lg">Edit</button>`:''}${canDelete?` <button onclick="window.deleteEnterpriseStudent('${x.id}')" class="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg">Delete</button>`:''}</td></tr>`).join('')||'<tr><td colspan="8" class="p-8 text-center text-slate-400">Student မရှိသေးပါ</td></tr>'}</tbody></table></div>`;
      }
      if(currentEnterprisePanel==='codes'){
        const canAdd=hasPermission('Add','ACADEMIC');
        ids.codes.innerHTML=enterpriseHeader('Student Code Generator','Student Name ကို ရိုက်ထည့်ပြီး Course/Class ကို Dropdown မှ ရွေးကာ Short Code Generate လုပ်နိုင်သည်')+`<div class="grid lg:grid-cols-2 gap-5"><div class="ios-card p-5 space-y-3"><input id="codeStudentName" class="w-full border rounded-xl px-3 py-3" placeholder="Student Name ရိုက်ထည့်ပါ *"><select id="codeCourse" class="w-full border rounded-xl px-3 py-3"><option value="">Course / Class ရွေးချယ်ပါ *</option>${courseOptions()}</select><button ${canAdd?'':'disabled'} onclick="window.generateStudentCode()" class="w-full bg-micro-navy text-micro-yellow py-3 rounded-2xl font-black disabled:opacity-40">Generate Short Code</button><div class="text-center bg-slate-50 rounded-2xl p-5"><div id="generatedCodeOutput" class="text-3xl font-black text-micro-blue">—</div><div id="generatedCodeMeta" class="text-xs text-slate-500 mt-1">Name + Course ရွေးပြီး Generate နှိပ်ပါ</div><div class="flex justify-center gap-2 mt-4"><button onclick="window.copyGeneratedCode()" class="px-4 py-2 rounded-xl bg-white border font-bold">Copy</button><button onclick="window.shareStudentCode()" class="px-4 py-2 rounded-xl bg-micro-yellow font-black">Send</button></div></div></div><div class="ios-card p-5"><h3 class="font-black mb-3">Generated Code History</h3><div class="space-y-2 max-h-96 overflow-auto">${(state.generatedCodes||[]).map(x=>`<div class="p-3 rounded-xl bg-slate-50 border text-xs"><b class="text-micro-blue">${esc(x.code)}</b> — ${esc(x.studentName)} • ${esc(x.course)}<div class="text-slate-400 mt-1">${esc(x.date)} • ${esc(x.generatedBy)}</div></div>`).join('')||'<div class="text-slate-400 text-center py-6">Code မရှိသေးပါ</div>'}</div></div></div>`;
      }
      if(currentEnterprisePanel==='courses'){
        ids.courses.innerHTML=enterpriseHeader('Course Management','Course တစ်ခုထည့်လိုက်တာနဲ့ Student, Code, Batch, Teacher, Attendance, Report, Finance တို့တွင် Dropdown အဖြစ် Auto အသုံးပြုနိုင်သည်',`<button onclick="window.openCourseEntry()" class="bg-micro-navy text-micro-yellow px-4 py-2.5 rounded-2xl font-black">+ Course အသစ်</button>`)+`<div class="ios-card overflow-auto"><table class="w-full text-xs"><thead><tr class="bg-slate-50"><th class="p-3 text-left">Course</th><th class="p-3">Fee</th><th class="p-3">Status</th><th class="p-3">Action</th></tr></thead><tbody>${state.courses.map(c=>`<tr class="border-t"><td class="p-3 font-bold">${esc(c.name)}</td><td class="p-3">${fmtKs(c.fee)}</td><td class="p-3">Active</td><td class="p-3"><button onclick="window.openCourseEntry('${c.id}')" class="px-2 py-1 bg-blue-50 rounded">Edit</button> <button onclick="window.removeCourse('${c.id}')" class="px-2 py-1 bg-rose-50 text-rose-600 rounded">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
      }
      if(currentEnterprisePanel==='teachers'){
        ids.teachers.innerHTML=enterpriseHeader('Teacher & Schedule','Teacher Photo + Display Name + Course + Batch + Room + Day/Time Schedule',`<div class="flex gap-2"><button onclick="window.openTeacherEntry()" class="bg-micro-navy text-micro-yellow px-4 py-2.5 rounded-2xl font-black">+ Teacher</button><button onclick="window.openScheduleEntry()" class="bg-micro-yellow text-micro-navy px-4 py-2.5 rounded-2xl font-black">+ Schedule</button></div>`)+`<div class="ios-card p-4 overflow-auto"><h3 class="font-black mb-3">Teachers</h3><table class="w-full text-xs"><thead><tr class="bg-slate-50"><th class="p-3 text-left">Teacher</th><th class="p-3">Course</th><th class="p-3">Batch</th><th class="p-3">Role</th><th class="p-3">Action</th></tr></thead><tbody>${(state.teachers||[]).map(t=>`<tr class="border-t"><td class="p-3"><div class="flex items-center gap-2"><img src="${esc(t.photo||'https://placehold.co/48x48?text=T')}" class="w-10 h-10 rounded-xl object-cover border"><div><b>${esc(t.name)}</b><div class="text-slate-400">${esc(t.room||'-')}</div></div></div></td><td class="p-3">${esc(t.course||courseName(t.courseId))}</td><td class="p-3">${esc(t.batch||'-')}</td><td class="p-3">${esc(t.department||'Teacher')}</td><td class="p-3"><button onclick="window.openTeacherEntry('${t.id}')" class="px-2 py-1 bg-blue-50 rounded">Edit</button></td></tr>`).join('')||'<tr><td colspan="5" class="p-6 text-center text-slate-400">Teacher မရှိသေးပါ</td></tr>'}</tbody></table></div><div class="ios-card p-4 overflow-auto"><h3 class="font-black mb-3">Timetable</h3><table class="w-full text-xs"><thead><tr class="bg-slate-50"><th class="p-3">Date</th><th class="p-3">Teacher</th><th class="p-3">Course</th><th class="p-3">Batch</th><th class="p-3">Time</th><th class="p-3">Room</th></tr></thead><tbody>${(state.schedules||[]).map(s=>`<tr class="border-t"><td class="p-3">${esc(s.date)}</td><td class="p-3"><div class="flex items-center gap-2"><img src="${esc(s.teacherPhoto||'https://placehold.co/32x32?text=T')}" class="w-8 h-8 rounded-lg object-cover"><span>${esc(s.teacherName)}</span></div></td><td class="p-3">${esc(s.course)}</td><td class="p-3">${esc(s.batch)}</td><td class="p-3">${esc(s.time)}</td><td class="p-3">${esc(s.room)}</td></tr>`).join('')||'<tr><td colspan="6" class="p-6 text-center text-slate-400">Schedule မရှိသေးပါ</td></tr>'}</tbody></table></div>`;
      }
      if(currentEnterprisePanel==='attendance'){
        const date=document.getElementById('attendanceDate')?.value||todayISO();
        ids.attendance.innerHTML=enterpriseHeader('Attendance','Present / Absent / Late ကို Date အလိုက် မှတ်တမ်းတင်၊ ပြန်ကြည့်၊ Filter လုပ်နိုင်သည်',`<input id="attendanceDate" type="date" value="${esc(date)}" onchange="window.setEnterprisePanel('attendance','ACADEMIC')" class="border rounded-xl px-3 py-2 text-xs">`)+`<div class="ios-card overflow-auto"><table class="w-full text-xs"><thead><tr class="bg-slate-50"><th class="p-3 text-left">Student</th><th class="p-3">Code</th><th class="p-3">Course</th><th class="p-3">Date</th><th class="p-3">Status</th><th class="p-3">By</th><th class="p-3">Mark</th></tr></thead><tbody>${students.map(x=>{const a=(state.attendance||[]).find(v=>v.studentId===x.id&&v.date===date);return `<tr class="border-t"><td class="p-3 font-bold">${esc(x.name)}</td><td class="p-3">${esc(x.studentCode||'-')}</td><td class="p-3">${esc(x.course)}</td><td class="p-3">${date}</td><td class="p-3">${esc(a?.status||'-')}</td><td class="p-3">${esc(a?.markedBy||'-')}</td><td class="p-3 whitespace-nowrap"><button onclick="window.markStudentAttendance('${x.id}','Present')" class="px-2 py-1 bg-emerald-50 rounded">Present</button> <button onclick="window.markStudentAttendance('${x.id}','Absent')" class="px-2 py-1 bg-rose-50 rounded">Absent</button> <button onclick="window.markStudentAttendance('${x.id}','Late')" class="px-2 py-1 bg-amber-50 rounded">Late</button></td></tr>`}).join('')||'<tr><td colspan="7" class="p-6 text-center">Student မရှိသေးပါ</td></tr>'}</tbody></table></div>`;
      }
      if(currentEnterprisePanel==='reports'){
        const rp=activePeriodFromUI(); let s=rp.start,e=rp.end;if(rp.month){s=rp.month+'-01';const d=new Date(Number(rp.month.slice(0,4)),Number(rp.month.slice(5,7)),0);e=`${rp.month}-${String(d.getDate()).padStart(2,'0')}`}
        const rows=reportRows(currentReportDept,s,e),total=rows.reduce((a,r)=>a+Number(r.amount||0),0),closed=(state.monthlyClosures||[]).map(x=>x.month);
        ids.reports.innerHTML=enterpriseHeader('Reports / E Import & Export','Department အလိုက် Detail + Summary • Start Date → End Date • Month / Multi-Month • E/Excel + PDF',`<button onclick="window.exportBackupJSON()" class="bg-white border px-3 py-2 rounded-xl font-bold">Backup</button>`)+`<div class="ios-card p-4"><div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"><div><label class="font-bold">Department</label><select id="reportDept" onchange="currentReportDept=this.value;window.setEnterprisePanel('reports')" class="w-full border rounded-xl px-3 py-2"><option value="ALL">All Departments</option>${REPORT_DEPTS.filter(x=>x!=='ALL').map(x=>`<option value="${x}" ${x===currentReportDept?'selected':''}>${x}</option>`).join('')}</select></div><div><label class="font-bold">Start Date</label><input id="reportStart" type="date" value="${esc(rp.start)}" class="w-full border rounded-xl px-3 py-2"></div><div><label class="font-bold">End Date</label><input id="reportEnd" type="date" value="${esc(rp.end)}" class="w-full border rounded-xl px-3 py-2"></div><div><label class="font-bold">Month</label><input id="reportMonth" type="month" value="${esc(rp.month)}" class="w-full border rounded-xl px-3 py-2"></div></div><div class="flex flex-wrap gap-2 mt-3"><button onclick="window.setEnterprisePanel('reports')" class="px-4 py-2.5 rounded-xl bg-micro-navy text-micro-yellow font-black">Apply Filter</button><button onclick="window.exportEnterpriseE()" class="px-4 py-2.5 rounded-xl bg-micro-yellow text-micro-navy font-black">E / Excel Report</button><button onclick="window.exportReportPDF()" class="px-4 py-2.5 rounded-xl bg-white border font-bold">PDF Report</button><label class="px-4 py-2.5 rounded-xl bg-slate-100 border font-bold cursor-pointer">E Import<input type="file" accept=".xlsx,.xls,.csv" class="hidden" onchange="window.importEnterpriseE(event)"></label></div><div class="text-[10px] text-slate-500 mt-2">Export ထုတ်ထားသော E file ကို ပြင်ဆင်ပြီး Import ပြန်လုပ်နိုင်သည်။ StudentCode ရှိလျှင် ရှိပြီးသား Student ကို update လုပ်ပြီး မရှိလျှင် အသစ်ထည့်မည်။</div></div><div class="grid sm:grid-cols-4 gap-3"><div class="ios-card p-4"><div class="text-xs text-slate-500">Records</div><div class="text-2xl font-black">${rows.length}</div></div><div class="ios-card p-4"><div class="text-xs text-slate-500">Positive / Income</div><div class="text-2xl font-black text-emerald-600">${fmtKs(rows.filter(r=>r.amount>0).reduce((a,r)=>a+r.amount,0))}</div></div><div class="ios-card p-4"><div class="text-xs text-slate-500">Expense</div><div class="text-2xl font-black text-rose-600">${fmtKs(Math.abs(rows.filter(r=>r.amount<0).reduce((a,r)=>a+r.amount,0)))}</div></div><div class="ios-card p-4"><div class="text-xs text-slate-500">Net</div><div class="text-2xl font-black">${fmtKs(total)}</div></div></div><div class="ios-card p-4 overflow-auto"><div class="flex items-center justify-between mb-3"><h3 class="font-black">Detail Report</h3><span class="text-[10px] text-slate-400">${s||'All'} → ${e||'All'}</span></div><table class="w-full text-xs"><thead><tr class="bg-slate-50"><th class="p-2">Date</th><th class="p-2">Module</th><th class="p-2">Department</th><th class="p-2 text-left">Name</th><th class="p-2">Course</th><th class="p-2">Amount</th><th class="p-2">Status</th></tr></thead><tbody>${rows.map(r=>`<tr class="border-t"><td class="p-2">${esc(r.date)}</td><td class="p-2">${esc(r.module)}</td><td class="p-2">${esc(r.department)}</td><td class="p-2 text-left font-bold">${esc(r.name)}</td><td class="p-2">${esc(r.course)}</td><td class="p-2">${fmtKs(r.amount)}</td><td class="p-2">${esc(r.status)}</td></tr>`).join('')||'<tr><td colspan="7" class="p-6 text-center text-slate-400">Data မရှိပါ</td></tr>'}</tbody></table></div><div class="ios-card p-4"><h3 class="font-black mb-3">Summary Report</h3><div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">${['SALES','ACADEMIC','PAGE_ADMIN','MANAGER','PURCHASE','FINANCE','HR','TEACHER'].map(d=>{const rr=reportRows(d,s,e);return `<div class="p-3 rounded-xl bg-slate-50 border"><b>${d}</b><div>Records: ${rr.length}</div><div>Net: ${fmtKs(rr.reduce((a,r)=>a+r.amount,0))}</div></div>`}).join('')}</div><div class="mt-3 text-[10px] text-slate-500">Monthly Closing: ${closed.length?closed.join(', '):'မရှိသေးပါ'}</div></div>`;
      }
      if(currentEnterprisePanel==='documents'){
        ids.documents.innerHTML=enterpriseHeader('Invoice & Certificate','Student Data မှ Auto ဖြည့်ပြီး MTC branding ဖြင့် Invoice / Certificate ထုတ်နိုင်သည်')+`<div class="ios-card overflow-auto"><table class="w-full text-xs"><thead><tr class="bg-slate-50"><th class="p-3 text-left">Student</th><th class="p-3">Code</th><th class="p-3">Course</th><th class="p-3">Type</th><th class="p-3">Documents</th></tr></thead><tbody>${students.map(x=>`<tr class="border-t"><td class="p-3 font-bold">${esc(x.name)}</td><td class="p-3">${esc(x.studentCode||'-')}</td><td class="p-3">${esc(x.course)}</td><td class="p-3">${esc(x.type)}</td><td class="p-3 whitespace-nowrap"><button onclick="window.printEnterpriseInvoice('${x.id}')" class="px-3 py-1.5 bg-blue-50 text-micro-blue rounded-xl font-bold">Invoice</button> <button onclick="window.printCertificate('${x.id}')" class="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl font-bold">Certificate</button></td></tr>`).join('')||'<tr><td colspan="5" class="p-8 text-center text-slate-400">Student မရှိသေးပါ</td></tr>'}</tbody></table></div>`;
      }
      if(currentEnterprisePanel==='notifications'){
        const me=(getActiveUser().email||'').toLowerCase();const ns=(state.notifications||[]).filter(n=>n.forEmail==='ALL'||!n.forEmail||n.forEmail.toLowerCase()===me||isAdmin());
        ids.notifications.innerHTML=enterpriseHeader('Notifications','Account Approval, Department Access, Data Save, Monthly Close နှင့် System alerts အားလုံး ဒီ Menu ထဲမှာ စုစည်းထားသည်')+`<div class="space-y-2">${ns.map(n=>`<div class="ios-card p-4 border-l-4 ${n.read?'border-slate-200':'border-micro-yellow'}"><div class="flex justify-between gap-3"><b>${esc(n.title)}</b><span class="text-[10px] text-slate-400">${esc(n.date)}</span></div><div class="text-xs text-slate-600 mt-1">${esc(n.body)}</div></div>`).join('')||'<div class="ios-card p-8 text-center text-slate-400">Notification မရှိသေးပါ</div>'}</div>`;
      }
      if(currentEnterprisePanel==='ai'){
        ids.ai.innerHTML=enterpriseHeader('AI Assistant','Gemini ကို default သုံးနိုင်ပြီး မရပါက OpenAI provider ကို ရွေးနိုင်သည်')+`<div class="ios-card p-5 space-y-4"><div class="grid sm:grid-cols-2 gap-3"><select id="setAiProvider" class="border rounded-xl px-3 py-2.5"><option ${state.settings.aiProvider==='Gemini'?'selected':''}>Gemini</option><option ${state.settings.aiProvider==='OpenAI'?'selected':''}>OpenAI</option></select><input id="aiPrompt" class="border rounded-xl px-3 py-2.5" placeholder="AI ကို မေးလိုသည့် အကြောင်းအရာ"></div><button onclick="window.runEnterpriseAi()" class="w-full bg-micro-navy text-micro-yellow py-3 rounded-2xl font-black">AI Analysis</button><div id="aiEnterpriseOutput" class="bg-slate-50 rounded-2xl p-4 text-xs min-h-24">AI provider ကို ရွေးပြီး မေးခွန်းထည့်ပါ။ API key ကို public HTML ထဲ မထည့်ထားပါ။</div></div>`;
      }
      if(currentEnterprisePanel==='admin'){
        const users=state.users||[];
        ids.admin.innerHTML=enterpriseHeader('Founder / Admin Control Center','Admin Settings + Admin Control တစ်နေရာတည်း — Department, Staff, Approval, Permissions, Reports, Dashboard, Branding, Defaults, Backup/Restore အားလုံးကို checkbox ဖြင့် ထိန်းချုပ်နိုင်သည်')+`<div class="grid lg:grid-cols-2 gap-5"><div class="ios-card p-5 space-y-3"><h3 class="font-black">Staff Account Create</h3><input id="eaName" class="w-full border rounded-xl px-3 py-2.5 text-xs" placeholder="Staff Name"><input id="eaEmail" type="email" class="w-full border rounded-xl px-3 py-2.5 text-xs" placeholder="Staff Gmail"><input id="eaUsername" class="w-full border rounded-xl px-3 py-2.5 text-xs" placeholder="Username"><input id="eaPassword" type="password" class="w-full border rounded-xl px-3 py-2.5 text-xs" placeholder="Temporary Password (6+ chars)"><select id="eaRole" class="w-full border rounded-xl px-3 py-2.5 text-xs">${Object.keys(state.permissions).map(r=>`<option>${r}</option>`).join('')}</select><button onclick="window.createStaffAccount()" class="w-full bg-micro-navy text-micro-yellow py-3 rounded-2xl font-black">Create Staff Account</button></div><div class="ios-card p-5 space-y-3"><h3 class="font-black">Brand / Defaults</h3><input id="setBrand" value="${esc(state.settings.brandName)}" class="w-full border rounded-xl px-3 py-2.5 text-xs" placeholder="Brand Name"><input id="setPrefix" value="${esc(state.settings.codePrefix)}" class="w-full border rounded-xl px-3 py-2.5 text-xs" placeholder="Student Code Prefix"><input id="setCloseDay" type="number" min="1" max="31" value="${Number(state.settings.monthlyCloseDay||28)}" class="w-full border rounded-xl px-3 py-2.5 text-xs" placeholder="Monthly Close Day"><label class="flex items-center gap-2 text-xs"><input id="setPortal" type="checkbox" ${state.settings.studentPortalEnabled?'checked':''}> Student Portal Public Access (later)</label><label class="flex items-center gap-2 text-xs"><input id="setLogo" type="file" accept="image/*" onchange="window.saveLogoFile(event)"> MTC Logo Upload / Change</label><button onclick="window.saveEnterpriseSettings()" class="w-full bg-micro-yellow text-micro-navy py-3 rounded-2xl font-black">Save Settings</button><div class="flex gap-2"><button onclick="window.exportBackupJSON()" class="flex-1 bg-white border py-2.5 rounded-xl font-bold">Backup</button><label class="flex-1 bg-white border py-2.5 rounded-xl font-bold text-center cursor-pointer">Restore<input type="file" accept=".json" class="hidden" onchange="window.importBackupJSON(event)"></label></div></div></div><div class="ios-card p-5 space-y-3"><h3 class="font-black">Department & Permission Matrix — checkbox = allow</h3><div class="overflow-auto"><table class="w-full text-[11px]"><thead><tr><th class="p-2 text-left">Department / Role</th>${PERM_ACTIONS.map(a=>`<th class="p-2">${a}</th>`).join('')}</tr></thead><tbody>${Object.keys(state.permissions).map(r=>`<tr class="border-t"><td class="p-2 font-bold">${esc(r)}</td>${PERM_ACTIONS.map(a=>`<td class="p-2 text-center"><input type="checkbox" ${state.permissions[r]?.[a]?'checked':''} onchange="window.togglePermission('${esc(r)}','${a}',this.checked)"></td>`).join('')}</tr>`).join('')}</tbody></table></div></div><div class="ios-card p-5 space-y-3"><div class="flex items-center justify-between"><h3 class="font-black">Departments</h3><button onclick="window.addDepartment()" class="bg-micro-yellow text-micro-navy px-3 py-2 rounded-xl font-black">+ Department</button></div>${state.departments.map(d=>`<div class="p-3 bg-slate-50 rounded-xl border flex items-center justify-between gap-2"><span>${esc(d.name)}</span><div class="flex items-center gap-2"><b class="text-[10px] ${d.active===false?'text-rose-600':'text-emerald-600'}">${d.active===false?'Closed':'Active'}</b><button onclick="window.toggleDepartment('${d.id}')" class="px-2 py-1 rounded-lg border text-[10px]">${d.active===false?'Open':'Close'}</button></div></div>`).join('')}</div><div class="ios-card p-5 border-2 border-micro-yellow bg-amber-50 space-y-3"><div class="flex items-center justify-between"><h3 class="font-black">🔔 Pending Staff Approvals</h3><b class="text-xs text-amber-700">${users.filter(u=>u.approved===false).length} Pending</b></div>${users.filter(u=>u.approved===false).map(u=>`<div class="p-3 bg-white border rounded-xl flex items-center justify-between gap-3"><div><b>${esc(u.name)}</b><div class="text-[10px] text-slate-500">${esc(u.email||'-')} • @${esc(u.username||'-')}</div></div><button onclick="window.toggleApprove('${u.id}')" class="px-4 py-2 rounded-xl bg-micro-navy text-micro-yellow font-black">Approve</button></div>`).join('')||'<div class="text-xs text-slate-500">Pending request မရှိပါ။</div>'}</div><div class="ios-card p-5 space-y-3"><h3 class="font-black">Staff Approval + Department Access</h3>${users.map(u=>`<div class="p-3 rounded-xl bg-slate-50 border"><div class="flex flex-wrap justify-between gap-2"><div><b>${esc(u.name)}</b> <span class="text-slate-400">${esc(u.username||u.email)}</span><div class="text-[10px] text-slate-500">${esc(u.email||'')}</div></div><button onclick="window.toggleApprove('${u.id}')" class="px-3 py-1.5 rounded-xl ${u.approved?'bg-emerald-100 text-emerald-700':'bg-micro-navy text-micro-yellow'} font-bold">${u.approved?'✓ Approved':'Approve'}</button></div><div class="flex flex-wrap gap-2 mt-2">${Object.keys(state.permissions).filter(r=>!['ADMIN'].includes(r)).map(r=>`<label class="flex items-center gap-1 text-[10px] bg-white border rounded-lg px-2 py-1"><input type="checkbox" ${Array.isArray(u.roles)&&u.roles.includes(r)?'checked':''} onchange="window.toggleUserDept('${u.id}','${r}')">${r}</label>`).join('')}</div><div class="mt-3 overflow-auto"><div class="text-[10px] font-black text-slate-500 mb-1">Per-Staff Permission — checkbox = allow</div><table class="w-full text-[9px]"><thead><tr><th class="text-left p-1">Department</th>${PERM_ACTIONS.map(a=>`<th class="p-1">${a}</th>`).join('')}</tr></thead><tbody>${(u.roles||[]).filter(r=>r!=='ADMIN'&&r!=='FOUNDER').map(r=>{ensureUserPermissionShape(u);return `<tr class="border-t"><td class="p-1 font-bold">${esc(r)}</td>${PERM_ACTIONS.map(a=>`<td class="p-1 text-center"><input type="checkbox" ${u.permissions?.[r]?.[a]?'checked':''} onchange="window.toggleStaffPermission('${u.id}','${r}','${a}',this.checked)"></td>`).join('')}</tr>`}).join('')}</tbody></table></div></div>`).join('')}</div>`;
      }
    }
    window.deleteEnterpriseCustomer=async(id)=>{if(!requirePerm('Delete','PAGE_ADMIN'))return;const x=state.customers.find(v=>v.id===id);if(!x||!confirm(`${x.name} ကို ဖျက်မည်မှာ သေချာပါသလား?`))return;state.customers=state.customers.filter(v=>v.id!==id);await syncToCloud(`Customer "${x.name}" ဖျက်ခဲ့သည်`);window.setEnterprisePanel('customers')};
    window.runEnterpriseAi=()=>{const provider=document.getElementById('setAiProvider')?.value||state.settings.aiProvider;const prompt=document.getElementById('aiPrompt')?.value||'';const out=document.getElementById('aiEnterpriseOutput');if(!prompt)return window.showToast('AI Prompt ထည့်ပါ','error');out.textContent=`${provider} AI ကို အသုံးပြုရန် secure API endpoint / Firebase Cloud Function လိုအပ်ပါသည်။ ယခု UI က provider ကို မှတ်တမ်းတင်ပြီး Prompt ကို ပြသပေးသည်။ Public HTML ထဲ API key မထည့်ထားပါ။`;state.settings.aiProvider=provider;syncToCloud('AI Provider setting ပြောင်းလဲခဲ့သည်')};
    function renderEnterprise(){if(currentActiveTab==='enterprise')renderEnterprisePanel()}

    // ================= 14. EXPORT TO EXCEL (CSV), PDF & BACKUP JSON =================
    window.exportBackupJSON = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `MicroTC_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      window.showToast('Backup ဖိုင် ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ');
    };

    window.exportCSV = () => {
      const filtered = getFilteredLeadsByCourseAndDate();
      const headers = ['Date', 'Name', 'Phone', 'Course', 'Source', 'LeadStage', 'PaymentStatus', 'PaidAmount', 'BalanceAmount', 'PaymentMethod', 'RecordedBy', 'Note'];
      const rows = filtered.map(l => [
        l.date,
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${l.phone || ''}"`,
        `"${l.course || ''}"`,
        `"${l.source || ''}"`,
        l.leadStage,
        l.paymentStatus,
        l.paidAmount || 0,
        l.balanceAmount || 0,
        `"${l.paymentMethod || ''}"`,
        `"${l.recordedBy || ''}"`,
        `"${(l.note || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MicroTC_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.showToast('Excel (CSV) ဖိုင် ထုတ်ယူပြီးပါပြီ');
    };

    window.exportReportPDF = () => {
      window.showToast('PDF Report ထုတ်ယူနေပါသည်...');
      const showMoney = canViewFinance();
      const filteredLeads = getFilteredLeadsByCourseAndDate();
      const filteredExpenses = getFilteredExpensesByDate();
      const rev = filteredLeads.reduce((s, l) => s + Number(l.paidAmount || 0), 0);
      const exp = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px; font-family: 'Inter', 'Padauk', sans-serif; color: #142143;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 3px solid #ffaf00; padding-bottom: 10px; margin-bottom: 15px;">
            <div>
              <h2 style="margin: 0; color: #142143; font-weight: 900;">Micro Computer Training Center</h2>
              <p style="font-size: 11px; color: #1a5d94; margin: 2px 0 0 0;">Management & Department Summary Report (${new Date().toISOString().slice(0, 10)})</p>
            </div>
            ${showMoney ? `
              <div style="text-align:right; font-size: 11px;">
                <div><strong>Total Revenue:</strong> ${rev.toLocaleString()} Ks</div>
                <div><strong>Total Expenses:</strong> ${exp.toLocaleString()} Ks</div>
                <div style="color:#1a5d94;"><strong>Net Profit:</strong> ${(rev - exp).toLocaleString()} Ks</div>
              </div>
            ` : ''}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px;">
            <thead>
              <tr style="background: #142143; color: #ffaf00;">
                <th style="padding: 7px; border: 1px solid #CBD5E1;">ရက်စွဲ</th>
                <th style="padding: 7px; border: 1px solid #CBD5E1;">အမည်</th>
                <th style="padding: 7px; border: 1px solid #CBD5E1;">ဖုန်း</th>
                <th style="padding: 7px; border: 1px solid #CBD5E1;">သင်တန်း</th>
                <th style="padding: 7px; border: 1px solid #CBD5E1;">Source</th>
                <th style="padding: 7px; border: 1px solid #CBD5E1;">အလားအလာ</th>
                <th style="padding: 7px; border: 1px solid #CBD5E1;">အခြေအနေ</th>
                <th style="padding: 7px; border: 1px solid #CBD5E1;">သွင်းသူ</th>
                ${showMoney ? '<th style="padding: 7px; border: 1px solid #CBD5E1;">သွင်းပြီးငွေ</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredLeads.map(l => `
                <tr>
                  <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">${l.date}</td>
                  <td style="padding: 6px; border: 1px solid #CBD5E1; font-weight:bold;">${l.name}</td>
                  <td style="padding: 6px; border: 1px solid #CBD5E1;">${l.phone}</td>
                  <td style="padding: 6px; border: 1px solid #CBD5E1;">${l.course}</td>
                  <td style="padding: 6px; border: 1px solid #CBD5E1;">${l.source}</td>
                  <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">${l.leadStage}</td>
                  <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">${l.paymentStatus}</td>
                  <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">${l.recordedBy || '-'}</td>${showMoney ? `<td style="padding: 6px; border: 1px solid #CBD5E1; text-align: right; font-weight:bold;">${Number(l.paidAmount || 0).toLocaleString()} Ks</td>` : ''}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;

      html2pdf().from(element).set({
        margin: 10,
        filename: `MicroTC_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }).save();
    };
  