/**
 * PIRA Simple Translate - Content Script
 * Developed by Pira Code
 * Instant, automatic text selection translation directly in-page.
 * Shadow DOM encapsulated for zero CSS collisions.
 */
(function () {
  if (window.__piraSimpleTranslateInitialized) return;
  window.__piraSimpleTranslateInitialized = true;
  let currentSettings = {targetLang:'en',sourceLang:'auto',provider:'google-free',autoTranslateEnabled:true,debounceMs:250,minLength:2,theme:'system',requireModifierKey:'none',showListenButton:true,showCopyButton:true,showOriginalText:true,excludedDomains:[]};
  if (chrome?.storage?.sync) {
    chrome.storage.sync.get(currentSettings, stored => { currentSettings={...currentSettings,...stored}; });
    chrome.storage.onChanged.addListener(changes => { for(const key in changes) currentSettings[key]=changes[key].newValue; });
  }
  let hostEl=null,shadowRoot=null,activePopup=null,selectionDebounceTimer=null,activeRequestId=0,lastSelectedText='';
  function getShadowRoot(){if(!hostEl){hostEl=document.createElement('div');hostEl.id='pira-simple-translate-host';hostEl.style.cssText='position:absolute;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';document.body.appendChild(hostEl);shadowRoot=hostEl.attachShadow({mode:'open'});injectStyles();}return shadowRoot;}
  function injectStyles(){const style=document.createElement('style');style.textContent=`
    :host{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:13px;line-height:1.45}
    *{box-sizing:border-box;margin:0;padding:0}
    .pira-popup{position:absolute;pointer-events:auto;width:320px;max-width:calc(100vw - 24px);background:#0f172a;color:#f8fafc;border:1px solid rgba(255,255,255,.12);border-radius:12px;box-shadow:0 16px 36px -4px rgba(0,0,0,.45);padding:12px;z-index:2147483647;opacity:0;transform:translateY(4px);transition:all .16s ease}
    .pira-popup.pira-visible{opacity:1;transform:translateY(0)}
    .pira-popup.light{background:#fff;color:#0f172a;border-color:rgba(0,0,0,.1)}
    .pira-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.08)}
    .pira-badge{background:rgba(37,99,235,.2);color:#60a5fa;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:600}
    .pira-close-btn{background:none;border:0;color:#94a3b8;cursor:pointer;padding:4px}
    .pira-original{font-size:11px;color:#94a3b8;background:rgba(255,255,255,.04);padding:4px 6px;border-radius:6px;margin-bottom:6px;word-break:break-word}
    .pira-translated{font-size:14px;font-weight:500;color:inherit;margin-bottom:8px;word-break:break-word;white-space:pre-wrap}
    .pira-actions{display:flex;align-items:center;justify-content:space-between;padding-top:6px;border-top:1px solid rgba(255,255,255,.08)}
    .pira-action-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#cbd5e1;font-size:11px;padding:4px 8px;border-radius:6px;cursor:pointer}
    .pira-spinner{width:14px;height:14px;border:2px solid rgba(96,165,250,.3);border-top-color:#60a5fa;border-radius:50%;animation:spin .6s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
  `;shadowRoot.appendChild(style);}
  function removePopup(){if(activePopup?.parentNode)activePopup.parentNode.removeChild(activePopup);activePopup=null;}
  function onSelectionChange(e){
    if(!currentSettings.autoTranslateEnabled)return;
    const modifier=currentSettings.requireModifierKey||'none';
    if(modifier==='alt'&&!e.altKey||modifier==='ctrl'&&!e.ctrlKey||modifier==='shift'&&!e.shiftKey||modifier==='ctrl-shift'&&!(e.ctrlKey&&e.shiftKey))return;
    const domain=location.hostname.toLowerCase();
    if((currentSettings.excludedDomains||[]).some(item=>item&&(domain===item||domain.endsWith('.'+item))))return;
    const active=document.activeElement;
    if(active&&(active.matches('input,textarea,select,[contenteditable="true"]')||active.closest('[contenteditable="true"]')))return;
    if(selectionDebounceTimer)clearTimeout(selectionDebounceTimer);
    selectionDebounceTimer=setTimeout(()=>{const selection=window.getSelection();if(!selection||selection.isCollapsed)return;const text=selection.toString().trim();if(text.length<(currentSettings.minLength||2))return;if(text===lastSelectedText&&activePopup)return;lastSelectedText=text;const range=selection.getRangeAt(0),rect=range.getBoundingClientRect();if(!rect.width&&!rect.height)return;renderAndTranslate(text,rect);},currentSettings.debounceMs||250);
  }
  function renderAndTranslate(text,rect){
    const root=getShadowRoot();removePopup();const popup=document.createElement('div');popup.className='pira-popup pira-visible';popup.innerHTML='<div class="pira-header"><span class="pira-badge">Translating…</span><button class="pira-close-btn">✕</button></div><div class="pira-original"></div><div style="display:flex;align-items:center;gap:8px;padding:6px 0;color:#94a3b8;font-size:12px"><div class="pira-spinner"></div>Translating…</div>';popup.querySelector('.pira-original').textContent=text;root.appendChild(popup);activePopup=popup;positionPopup(popup,rect);popup.querySelector('.pira-close-btn').addEventListener('click',removePopup);
    const requestId=++activeRequestId;
    chrome.runtime.sendMessage({action:'translate',text,targetLang:currentSettings.targetLang,sourceLang:currentSettings.sourceLang,provider:currentSettings.provider},res=>{
      if(requestId!==activeRequestId||!activePopup)return;
      if(chrome.runtime.lastError){popup.textContent=chrome.runtime.lastError.message;return;}
      if(!res?.success){popup.innerHTML='<div class="pira-header"><span class="pira-badge">Translation unavailable</span><button class="pira-close-btn">✕</button></div><div class="pira-translated"></div>';popup.querySelector('.pira-translated').textContent=res?.error||'Translation failed.';popup.querySelector('.pira-close-btn').addEventListener('click',removePopup);positionPopup(popup,rect);return;}
      const d=res.data,isRtl=['ar','he','fa','ur','ps','sd','yi','dv','ckb','ug'].includes(d.targetLang);
      popup.innerHTML='<div class="pira-header"><span class="pira-badge"></span><button class="pira-close-btn" title="Close">✕</button></div><div class="pira-original"></div><div class="pira-translated"></div><div class="pira-actions"><div class="pira-buttons"></div><span style="font-size:10px;color:#94a3b8">Pira Code</span></div>';
      popup.querySelector('.pira-badge').textContent=(d.detectedSourceLang||'AUTO').toUpperCase()+' → '+d.targetLang.toUpperCase();
      if(currentSettings.showOriginalText)popup.querySelector('.pira-original').textContent=d.originalText;else popup.querySelector('.pira-original').remove();
      const translated=popup.querySelector('.pira-translated');translated.textContent=d.translatedText;if(isRtl){translated.dir='rtl';translated.style.textAlign='right';}
      popup.querySelector('.pira-close-btn').addEventListener('click',removePopup);
      const buttons=popup.querySelector('.pira-buttons');
      if(currentSettings.showCopyButton){const b=document.createElement('button');b.className='pira-action-btn';b.textContent='📋 Copy';b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(d.translatedText);b.textContent='✓ Copied';}catch{b.textContent='Copy unavailable';}});buttons.appendChild(b);}
      if(currentSettings.showListenButton){const b=document.createElement('button');b.className='pira-action-btn';b.textContent='🔊 Listen';b.addEventListener('click',()=>{if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(d.translatedText);u.lang=d.targetLang||'en';window.speechSynthesis.speak(u);});buttons.appendChild(b);}
      if(currentSettings.theme==='light')popup.classList.add('light');positionPopup(popup,rect);
    });
  }
  function positionPopup(popup,rect){const sx=window.scrollX||0,sy=window.scrollY||0;const x=Math.max(12,Math.min(rect.left+rect.width/2-160,window.innerWidth-332));let y=rect.bottom+8;if(window.innerHeight-rect.bottom<160&&rect.top>160)y=rect.top-168;popup.style.left=Math.round(x+sx)+'px';popup.style.top=Math.round(y+sy)+'px';}
  document.addEventListener('mouseup',onSelectionChange);document.addEventListener('keyup',e=>{if(e.key==='Escape')removePopup();});document.addEventListener('mousedown',e=>{if(activePopup&&!activePopup.contains(e.target)&&!hostEl?.contains(e.target))removePopup();});
})();