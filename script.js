const scriptURL = "https://script.google.com/macros/s/AKfycbxC_981gm8HedrJLdDtKccF1UFiVxGZsl1zuoXGuj-TBzamtm2P7M7ravEydFS-OZKJZQ/exec";

// navbar hide on scroll
let lastScroll = 0;
const nav = document.querySelector('nav.topbar');
window.addEventListener('scroll', ()=>{
  const st = window.scrollY;
  if(st > lastScroll && st > 50) nav.classList.add('hidden');
  else nav.classList.remove('hidden');
  lastScroll = st;
});

// helper: show result in a card
function showResult(target, data){
  target.innerHTML = `
    <div class="result-card fade-in">
      <h3 style="margin:0;color:#00695c;">${data.studentName}</h3>
      <p style="margin:6px 0 0;color:#0277bd;">ID: ${data.studentId}</p>
      <div class="result-row">
        <div class="result-item"><div style="color:#0288d1;font-weight:700">Creativity</div><div><strong>${data.creativityHours||0}</strong> hrs</div></div>
        <div class="result-item"><div style="color:#43a047;font-weight:700">Action</div><div><strong>${data.actionHours||0}</strong> hrs</div></div>
        <div class="result-item"><div style="color:#2e7d32;font-weight:700">Service</div><div><strong>${data.serviceHours||0}</strong> hrs</div></div>
      </div>
      <div style="margin-top:12px;background:linear-gradient(90deg,#4fc3f7,#43a047);color:#fff;padding:8px 12px;border-radius:9px;display:inline-block;font-weight:800">Total ${data.totalHours||0} hrs</div>
    </div>
  `;
}

// submit page logic
function submitForm(formId, resultTargetId){
  const form = document.getElementById(formId);
  const target = document.getElementById(resultTargetId);
  function submitHours(e){
    e && e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    // prevent double submit by disabling button
    const btn = form.querySelector('button[type="button"].submitBtn');
    if(btn){
      btn.disabled = true; btn.style.opacity = 0.7;
    }
    fetch(scriptURL,{method:'POST',headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
      .then(res=>res.json())
      .then(res=>{
        if(res.status==='success'){ target.innerHTML = '<div class="card fade-in" style="padding:12px;color:#0a6237">✅ Submitted successfully</div>'; form.reset(); }
        else{ target.innerHTML = '<div class="card" style="padding:12px;color:#b00020">❌ Submit failed: '+(res.message||'error')+'</div>'; }
      }).catch(err=>{ target.innerHTML = '<div class="card" style="padding:12px;color:#b00020">❌ Network error</div>'; console.error(err); })
      .finally(()=>{ if(btn){ btn.disabled=false; btn.style.opacity=1; } });
  }
  // attach handler
  const btn = form.querySelector('button.submitBtn');
  if(btn) btn.addEventListener('click', submitHours);
}

// check page logic
function checkHours(inputId, resultTargetId){
  const input = document.getElementById(inputId);
  const target = document.getElementById(resultTargetId);
  const id = input.value.trim();
  if(!id){ target.innerHTML = '<div class="card" style="padding:12px;color:#d84315">⚠️ Enter your Student ID</div>'; return; }
  target.innerHTML = '<div class="card" style="padding:12px;color:#0277bd">⏳ Checking...</div>';
  fetch(`${scriptURL}?studentId=${encodeURIComponent(id)}`)
    .then(res=>res.text())
    .then(text=>{ try{ const data = JSON.parse(text); if(data.error) target.innerHTML = '<div class="card" style="padding:12px;color:#d84315">❌ '+data.error+'</div>'; else showResult(target,data); }catch(e){ target.innerHTML = '<div class="card" style="padding:12px;color:#d84315">❌ Invalid response</div>'; console.error(text); } })
    .catch(err=>{ target.innerHTML = '<div class="card" style="padding:12px;color:#d84315">❌ Network error</div>'; console.error(err); });
}

// community total fetch
function fetchCommunityTotal(targetId){
  const target = document.getElementById(targetId);
  fetch(`${scriptURL}?community=true`)
    .then(res=>res.text())
    .then(text=>{ try{ const d = JSON.parse(text); if(d.error) target.textContent = 'Community hours: ?'; else target.textContent = 'Community hours: '+(d.total||0)+' hrs'; }catch(e){ target.textContent = 'Community hours: ?'; } })
    .catch(()=>{ target.textContent = 'Community hours: ?'; });
}
