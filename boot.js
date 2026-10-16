/* MTC Enterprise safety boot: keeps the auth UI usable if a remote Firebase module is blocked. */
(function(){
  var auth=document.getElementById('auth');
  var tabs=document.querySelectorAll('[data-tab]');
  var gp=document.getElementById('googlePanel'), pp=document.getElementById('passPanel');
  tabs.forEach(function(btn){btn.addEventListener('click',function(){
    tabs.forEach(function(x){x.classList.toggle('active',x===btn)});
    var isPass=btn.getAttribute('data-tab')==='password';
    if(gp) gp.classList.toggle('hide',isPass); if(pp) pp.classList.toggle('hide',!isPass);
  })});
  var lang=document.getElementById('authLangToggle');
  if(lang) lang.addEventListener('click',function(){
    var isEn=document.documentElement.lang==='en';
    document.documentElement.lang=isEn?'my':'en';
    lang.textContent=isEn?'မြန်မာ / English':'Myanmar / English';
  });
  window.addEventListener('error',function(e){
    if(e && /app\.js|firebase|module/i.test(String(e.filename||'')+' '+String(e.message||''))){
      var n=document.createElement('div'); n.className='toast err'; n.textContent='System service မရနိုင်သေးပါ။ Internet/VPN ကို စစ်ပြီး Refresh လုပ်ပါ။';
      document.body.appendChild(n); setTimeout(function(){n.remove()},5000);
    }
  });
})();
