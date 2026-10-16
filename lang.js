(() => {
  const KEY = 'mtc-lang';
  let lang = localStorage.getItem(KEY) || 'my';
  const map = {
    en: {
      'ပင်မစာမျက်နှာ':'Dashboard','သင်တန်းသားများ':'Students','သင်တန်းများ':'Courses','အချိန်ဇယား':'Schedule','တက်ရောက်မှု':'Attendance','ငွေစာရင်း':'Finance','အစီရင်ခံစာ':'Reports','ဝန်ထမ်း / ဆရာ':'Staff','အတည်ပြုချက်များ':'Approvals','ဆက်တင်':'Settings',
      '＋ သင်တန်းသားအသစ်':'＋ New Student','＋ Student အသစ်':'＋ New Student','＋ သင်တန်းသားထည့်မည်':'＋ Add Student','＋ သင်တန်းထည့်မည်':'＋ Add Course','＋ အချိန်ဇယားထည့်မည်':'＋ Add Schedule','＋ တက်ရောက်မှုမှတ်မည်':'＋ Mark Attendance','ဘာသာစကား':'Language','မြန်မာ / English':'Myanmar / English',
      'ပြန်လည်ကြိုဆိုပါတယ်':'Welcome back','နေ့စဉ်အလုပ်များ':'Daily tasks','Course အသစ်':'New Course','Student အသစ်':'New Student','တက်ရောက်မှု':'Attendance','ငွေစာရင်း':'Finance','အစီရင်ခံစာ':'Reports','ဆရာ အချိန်ဇယား':'Teacher Schedule','သင်တန်းစီမံခန့်ခွဲမှု':'Course Management','သင်တန်းသားစာရင်း':'Student List',
      'နာမည် / Code / ဖုန်း / Course ရှာရန်':'Search name / code / phone / course','ဒေတာ မရှိသေးပါ':'No data yet','ခွင့်ပြုချက် မရှိပါ':'No permission','သိမ်းဆည်းပြီးပါပြီ':'Saved successfully'
    },
    my: {
      'Dashboard':'ပင်မစာမျက်နှာ','Students':'သင်တန်းသားများ','Courses':'သင်တန်းများ','Schedule':'အချိန်ဇယား','Attendance':'တက်ရောက်မှု','Finance':'ငွေစာရင်း','Reports':'အစီရင်ခံစာ','Staff':'ဝန်ထမ်း / ဆရာ','Approvals':'အတည်ပြုချက်များ','Settings':'ဆက်တင်',
      '＋ New Student':'＋ သင်တန်းသားအသစ်','＋ Add Student':'＋ သင်တန်းသားထည့်မည်','＋ Add Course':'＋ သင်တန်းထည့်မည်','＋ Add Schedule':'＋ အချိန်ဇယားထည့်မည်','＋ Mark Attendance':'＋ တက်ရောက်မှုမှတ်မည်','Language':'ဘာသာစကား','Myanmar / English':'မြန်မာ / English','Welcome back':'ပြန်လည်ကြိုဆိုပါတယ်','Daily tasks':'နေ့စဉ်အလုပ်များ','New Course':'Course အသစ်','New Student':'Student အသစ်','Teacher Schedule':'ဆရာ အချိန်ဇယား','Course Management':'သင်တန်းစီမံခန့်ခွဲမှု','Search name / code / phone / course':'နာမည် / Code / ဖုန်း / Course ရှာရန်','No data yet':'ဒေတာ မရှိသေးပါ','No permission':'ခွင့်ပြုချက် မရှိပါ','Saved successfully':'သိမ်းဆည်းပြီးပါပြီ'
    }
  };
  function translate(root=document.body){
    const dict=map[lang]||map.my;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{ let s=n.nodeValue; Object.entries(dict).forEach(([a,b])=>{s=s.split(a).join(b)}); n.nodeValue=s; });
    root.querySelectorAll('input[placeholder]').forEach(el=>{ const d=dict[el.placeholder]; if(d) el.placeholder=d; });
    document.documentElement.lang=lang==='en'?'en':'my';
    const b=document.querySelector('#langToggle'); if(b) b.textContent=lang==='my'?'EN':'MY';
  }
  function toggle(){lang=lang==='my'?'en':'my';localStorage.setItem(KEY,lang);translate();}
  document.addEventListener('DOMContentLoaded',()=>{
    const b=document.querySelector('#langToggle'); if(b) b.addEventListener('click',toggle);
    translate();
    new MutationObserver(()=>translate(document.querySelector('#view')||document.body)).observe(document.body,{childList:true,subtree:true});
  });
})();
