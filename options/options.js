document.addEventListener('DOMContentLoaded', async () => {
  const $=id=>document.getElementById(id);
  const ids=['autoTranslateEnabled','targetLang','debounceMs','debounceMsVal','minLength','minLengthVal','requireModifierKey','theme','showListenButton','showCopyButton','showOriginalText','provider','googleCloudApiKey','deeplApiKey','deeplApiType','libreTranslateUrl','libreTranslateApiKey','excludedDomains','saveBtn','saveToast','googleCloudBox','deeplBox','libreBox'];
  const el=Object.fromEntries(ids.map(id=>[id,$(id)]));
  const defaults={autoTranslateEnabled:true,targetLang:'en',debounceMs:250,minLength:2,requireModifierKey:'none',theme:'system',showListenButton:true,showCopyButton:true,showOriginalText:true,provider:'google-free',deeplApiType:'free',libreTranslateUrl:'https://libretranslate.com',excludedDomains:[]};
  const [saved,secrets]=await Promise.all([chrome.storage.sync.get(defaults),chrome.storage.local.get(['googleCloudApiKey','deeplApiKey','libreTranslateApiKey'])]);
  const values={...defaults,...saved,...secrets};
  for(const k of ['autoTranslateEnabled','showListenButton','showCopyButton','showOriginalText'])el[k].checked=values[k]!==false;
  for(const k of ['targetLang','debounceMs','minLength','requireModifierKey','theme','provider','deeplApiType','libreTranslateUrl'])if(el[k])el[k].value=values[k]??defaults[k];
  for(const k of ['googleCloudApiKey','deeplApiKey','libreTranslateApiKey'])el[k].value=values[k]||'';
  el.excludedDomains.value=(values.excludedDomains||[]).join('\n');
  el.debounceMsVal.textContent=el.debounceMs.value+' ms';el.minLengthVal.textContent=el.minLength.value+' chars';
  function providerVisibility(){const v=el.provider.value;el.googleCloudBox.style.display=v==='google-cloud'?'block':'none';el.deeplBox.style.display=v==='deepl'?'block':'none';el.libreBox.style.display=v==='libretranslate'?'block':'none';}
  function theme(){document.body.classList.toggle('light',el.theme.value==='light');}
  el.debounceMs.addEventListener('input',()=>el.debounceMsVal.textContent=el.debounceMs.value+' ms');el.minLength.addEventListener('input',()=>el.minLengthVal.textContent=el.minLength.value+' chars');el.provider.addEventListener('change',providerVisibility);el.theme.addEventListener('change',theme);providerVisibility();theme();
  el.saveBtn.addEventListener('click',async()=>{
    const synced={autoTranslateEnabled:el.autoTranslateEnabled.checked,targetLang:el.targetLang.value,debounceMs:Number(el.debounceMs.value),minLength:Number(el.minLength.value),requireModifierKey:el.requireModifierKey.value,theme:el.theme.value,showListenButton:el.showListenButton.checked,showCopyButton:el.showCopyButton.checked,showOriginalText:el.showOriginalText.checked,provider:el.provider.value,deeplApiType:el.deeplApiType.value,libreTranslateUrl:el.libreTranslateUrl.value.trim(),excludedDomains:el.excludedDomains.value.split('\n').map(x=>x.trim().toLowerCase().replace(/^https?:\/\//,'').split('/')[0]).filter(Boolean)};
    const local={googleCloudApiKey:el.googleCloudApiKey.value.trim(),deeplApiKey:el.deeplApiKey.value.trim(),libreTranslateApiKey:el.libreTranslateApiKey.value.trim()};
    try{
      if(synced.provider==='libretranslate'){const endpoint=new URL(synced.libreTranslateUrl);const granted=await chrome.permissions.request({origins:[endpoint.origin+'/*']});if(!granted)throw Error('Grant access to the configured LibreTranslate server or choose another provider.');}
      await Promise.all([chrome.storage.sync.set(synced),chrome.storage.local.set(local)]);
      el.saveToast.textContent='Settings saved';el.saveToast.classList.add('show');setTimeout(()=>el.saveToast.classList.remove('show'),2200);
    }catch(error){el.saveToast.textContent='Could not save settings: '+error.message;el.saveToast.classList.add('show');}
  });
});