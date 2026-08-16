(async function(){
  const widgetBox=document.getElementById('mb-comentarios-widget');
  if(!widgetBox)return;
  const loadScript=(src)=>new Promise(r=>{const s=document.createElement('script');s.src=src;s.onload=r;document.head.appendChild(s);});
  if(typeof firebase==='undefined'){
    await loadScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
    await loadScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js");
    await loadScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js");
  }
  let mBox=document.getElementById('mentionsDropdown');
  if(!mBox){
      mBox=document.createElement('div');
      mBox.id='mentionsDropdown';
      mBox.className='mentions-dropdown';
      document.body.appendChild(mBox);
  }
  widgetBox.innerHTML=`
<style>:root{--c-bg-hover:rgba(255,255,255,0.1);--c-border:rgba(255,255,255,0.15);--accent-blue:#58a6ff;--text-muted:#8b949e;--font-stack:'Droid Sans',system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}.main-wrap p{margin:0 auto 8px !important;}#caja-comentarios *{font-family:var(--font-stack)!important;box-sizing:border-box;}#caja-comentarios{max-width:700px;margin:10px auto 8px 10px !important;color:#fff;background:0 0;position:relative;}.cabecera-principal{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(255,255,255,.3);padding-bottom:8px;margin-bottom:20px;flex-wrap:wrap;gap:10px;}.titulo-comentarios{margin:0;color:#fff;}#btnGoogle{background:#fff;color:#333;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-weight:700;font-size:13px;display:flex;align-items:center;gap:5px;}#btnGoogle::before{content:'G';color:#ea4335;font-weight:900;}#btnSalir{background:var(--c-bg-hover);color:#fff;border:1px solid rgba(255,255,255,.3);padding:4px 8px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:10px;}.formulario-comentarios{display:flex;flex-direction:column;gap:6px;padding:15px 15px 0;border-radius:6px;}.fila-usuario{display:flex;align-items:flex-start;gap:10px;}#nombreUsuario{padding:10px;border:0 solid rgba(255,255,255,.3);border-radius:4px;font-size:14px;background:rgba(0,0,0,.2);color:#fff;width:100%;max-width:225px;outline:none;}#nombreUsuarioLogueado{font-weight:700;font-size:14px;}.input-contenedor{position:relative;width:100%;flex-grow:1;background:rgba(0,0,0,.2);border-radius:4px;min-height:42px;}.input-backdrop{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden;z-index:1;color:#fff;}.textarea-transparente{position:relative;z-index:2;background:transparent!important;color:transparent!important;caret-color:#fff;width:100%;outline:none;resize:none;overflow:hidden;min-height:42px;display:block;}.input-backdrop,.textarea-transparente{margin:0;border:none;padding:10px;font-size:14px;font-family:var(--font-stack)!important;line-height:1.5;white-space:pre-wrap;word-break:break-word;box-sizing:border-box;letter-spacing:normal;font-weight:normal;}.textarea-transparente::placeholder{color:transparent;}.backdrop-placeholder{color:var(--text-muted);}.controles-formulario{display:flex;justify-content:flex-end;align-items:center;gap:8px;}.btn-send-whatsapp,.btn-send-whatsapp-small{background:#0073e6;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s;flex-shrink:0;}.btn-send-whatsapp{width:44px;height:44px;}.btn-send-whatsapp-small{width:34px;height:34px;}.btn-send-whatsapp:hover,.btn-send-whatsapp-small:hover{background:#005bb5;}.btn-attach{background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:20px;transition:transform 0.2s,color 0.2s;padding:5px;display:flex;align-items:center;justify-content:center;}.btn-attach:hover{transform:scale(1.1);color:#fff;}.comentario-individual{padding:0 15px !important;margin-bottom:5px;display:flex;gap:6px;position:relative;z-index:1;animation:fadeIn 0.3s ease;}@keyframes fadeIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}.comentario-individual.es-anclado{background:rgba(218,165,32,0.1);border:1px solid rgba(218,165,32,0.4);padding-top:15px !important;border-radius:6px;}.badge-anclado{background:#daa520;color:#000;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;margin-left:8px;display:inline-block;vertical-align:middle;}.avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;background:rgba(0,0,0,.1);z-index:2;position:relative;}.avatar img{width:100%;height:100%;object-fit:cover;}.avatar-upload-btn{cursor:pointer;position:relative;}.avatar-overlay{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(255,255,255,.4);opacity:0;transition:0.2s;z-index:10;color:#000;}.avatar-upload-btn:hover .avatar-overlay{opacity:1;}.comentario-contenido{flex-grow:1;min-width:0;}.cabecera-comentario{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;}.comentario-nombre{font-weight:700;font-size:14px;display:inline-flex;align-items:center;}.comentario-fecha{font-size:11px;color:gray;}#caja-comentarios div p.comentario-texto{margin:0 0 10px 0 !important;font-size:14px !important;line-height:1.5 !important;white-space:pre-wrap !important;word-break:break-word !important;color:#fff;}.comentario-texto a{color:var(--accent-blue);font-weight:bold;text-decoration:none;}.comentario-texto a:hover{filter:brightness(1.2);text-decoration:none;}.mention-text{color:var(--accent-blue);cursor:pointer;background:rgba(88,166,255,0.1);border-radius:2px;}.mention-text:hover{filter:brightness(1.2);}.img-adjunta{max-height:256px;width:auto;max-width:100%;border-radius:6px;margin-bottom:10px;display:block;image-rendering:auto !important;}.acciones-comentario{display:flex;gap:15px;margin-bottom:10px;}.btn-accion{background:0 0;border:none;color:gray;cursor:pointer;font-size:13px;padding:4px 8px;border-radius:20px;display:flex;align-items:center;gap:4px;transition:all .2s;margin-left:-8px;}.btn-accion:hover{color:#fff;background:var(--c-bg-hover);}.btn-responder{font-weight:bold;}.caja-respuestas{margin-top:10px;padding-left:0;position:relative;}.caja-respuestas.con-hilo::before{content:'';position:absolute;top:-56px;bottom:98px;left:-26px;width:2px;background:var(--c-border);border-radius:2px;z-index:0;}.respuesta-individual{display:flex;gap:6px;margin-top:15px;position:relative;margin-left:10px;}.respuesta-individual::before{content:'';position:absolute;top:15px;left:-36px;width:36px;height:2px;background:var(--c-border);border-bottom-left-radius:4px;z-index:0;}.respuesta-individual .avatar{width:30px;height:30px;}.formulario-respuesta{display:flex;gap:8px;margin-top:10px;align-items:flex-start;position:relative;}.corazon-icono{width:16px;height:16px;display:inline-block;background-image:url('https://mineblocksstuffs.weebly.com/uploads/1/2/7/3/127300461/like-comment1_orig.png');background-size:cover;transition:transform .1s;pointer-events:none;}.btn-corazon.likeado .corazon-icono{background-image:url('https://mineblocksstuffs.weebly.com/uploads/1/2/7/3/127300461/like-comment2_orig.png')!important;}.btn-corazon:active .corazon-icono{transform:scale(.7) translateY(2px);}.badge-img{width:12px;height:12px;margin-left:5px;}.preview-adjunto{display:none;position:relative;margin-top:5px;width:fit-content;}.preview-adjunto img{max-height:120px;width:auto;max-width:100%;border-radius:6px;border:1px solid rgba(255,255,255,.2);image-rendering:auto !important;}.btn-quitar-adjunto{position:absolute;top:-8px;right:-8px;background:#dc3545;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,.5);font-size:12px;}@keyframes shimmer{0%{background-position:-400px 0;}100%{background-position:400px 0;}}.skeleton-avatar{background:#e6f2ff;background-image:linear-gradient(90deg,#e6f2ff 0px,#ffffff 40px,#e6f2ff 80px);background-size:800px 100%;animation:shimmer 2s infinite linear;}.skeleton-line{height:12px;background:#e6f2ff;margin-bottom:10px;border-radius:4px;background-image:linear-gradient(90deg,#e6f2ff 0px,#ffffff 40px,#e6f2ff 80px);background-size:800px 100%;animation:shimmer 2s infinite linear;}.skeleton-title{width:30%;height:14px;margin-bottom:15px;}.skeleton-line.short{width:60%;}.btn-cargar-mas{background:rgba(0,0,0,0.2);color:var(--accent-blue);border:1px solid rgba(255,255,255,0.2);width:100%;padding:12px;border-radius:6px;cursor:pointer;font-weight:bold;margin-top:15px;transition:all 0.2s;font-size:14px;}.btn-cargar-mas:hover{background:rgba(255,255,255,0.1);color:#fff;}
.mentions-dropdown{position:fixed;z-index:2147483647;background:#00163e;border:1px solid var(--c-border);border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.6);max-height:150px;overflow-y:auto;display:none;flex-direction:column;width:220px;font-family:var(--font-stack)!important;}
.mention-item{display:flex;align-items:center;padding:8px 10px;cursor:pointer;gap:8px;}
.mention-item:hover{background:var(--c-bg-hover);}
.mention-avatar{width:20px;height:20px;border-radius:50%;object-fit:cover;flex-shrink:0;}
.mention-name{font-size:13px;font-weight:bold;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
</style>
<div id="caja-comentarios">
  <div class="cabecera-principal">
    <h3 class="titulo-comentarios" id="txtTitulo">Cargando...</h3>
    <div id="auth-container"><button id="btnGoogle"></button><div id="infoUsuario" style="display:none;"><span id="textoUsuario"></span><button id="btnSalir"></button></div></div>
  </div>
  <div class="formulario-comentarios">
    <div class="fila-usuario">
      <div class="avatar avatar-upload-btn" id="avatarUsuarioActual" title="Cambiar foto"><img src="/uploads/1/2/7/3/127300461/default-pfp_596.png"><div class="avatar-overlay">&#x270F;&#xFE0F;</div></div>
      <div style="flex-grow:1;display:flex;flex-direction:column;gap:8px;width:100%;min-width:0;">
        <input type="file" id="inputAvatarFile" accept="image/*" style="display:none">
        <input type="text" id="nombreUsuario" required>
        <span id="nombreUsuarioLogueado" style="display:none;"></span>
        <div class="input-contenedor">
            <div class="input-backdrop" id="backdrop-main"></div>
            <textarea id="textoComentario" required class="textarea-transparente" data-target="main"></textarea>
        </div>
      </div>
    </div>
    <div class="preview-adjunto" id="cajaPreviewAdjunto"><img id="imgPreviewAdjunto" src=""><button class="btn-quitar-adjunto" id="btnQuitarAdjunto">X</button></div>
    <div class="controles-formulario"><button class="btn-attach" id="btnImgMain" title="Adjuntar Imagen">&#x1F5BC;&#xFE0F;</button><button id="btnEnviar" class="btn-send-whatsapp"><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>
  </div>
  <div id="msgExito" style="display:none;background:#f0ffdb;color:#2b5e0c;border:1px solid #cddc39;padding:10px;border-radius:6px;margin-bottom:15px;text-align:center;font-weight:bold;font-size:14px;"></div>
  <div id="listaComentarios">
    <div class="comentario-individual" style="opacity:0.8; padding-top: 15px !important;"><div class="avatar skeleton-avatar"></div><div class="comentario-contenido"><div class="skeleton-line skeleton-title"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>
  </div>
  <div id="btnCargarMasContainer" style="display:none;width:100%;"></div>
</div>`;
  let rutaActual=window.location.pathname,idDePagina=rutaActual.replace(/^\/|\.html$/g,'');if(idDePagina===""||idDePagina==="/")idDePagina="inicio";idDePagina=idDePagina.replace(/[\.\$\#\[\]\/]/g,"_");
  const firebaseConfig={apiKey:"AIzaSyDawixERthu8gHpy-ckb8PMNVOMhlBEQMs",authDomain:"mbwe-multiplayer.firebaseapp.com",databaseURL:"https://mbwe-multiplayer-default-rtdb.firebaseio.com",projectId:"mbwe-multiplayer"};
  if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);
  const db=firebase.database(),auth=firebase.auth();
  db.ref("titulos_paginas/"+idDePagina).set(document.title);
  let imgCover="";document.querySelectorAll("meta").forEach(x=>{if((x.getAttribute("property")||"").replace(/\s/g,"")==="og:image")imgCover=x.getAttribute("content")});
  if(imgCover)db.ref("imagenes_paginas/"+idDePagina).set(imgCover);
  const DOM={txtTit:document.getElementById('txtTitulo'),lista:document.getElementById('listaComentarios'),nom:document.getElementById('nombreUsuario'),txt:document.getElementById('textoComentario'),btnEnv:document.getElementById('btnEnviar'),prevBox:document.getElementById('cajaPreviewAdjunto'),prevImg:document.getElementById('imgPreviewAdjunto'),avaAct:document.querySelector('#avatarUsuarioActual img'),inpFile:document.getElementById('inputAvatarFile')};
  let appState={usr:null,pfpL:null,imgAdjMain:null,imgAdjResp:{},limite:10,coms:[],insig:{},shadow:{}};
  let targetActivoAdjunto=null;let uniqueUsers=[];let activeTextarea=null;let mentionStartIndex=-1;
  const inImg=document.createElement('input');inImg.type='file';inImg.accept='image/png, image/jpeg, image/webp';
  const localeDict={en:{t:"comments",t1:"comment",g:"Sign in with Google",o:"Sign out",l:"Signed in with Google",u:"Username",c:"Write a comment...",r:"Write a reply...",b:"Reply",m:"Load more comments...",a:"ago",j:"Just now",p:"Pinned",s:"Comment sent!",y:"Year",mo:"Month",d:"Day",h:"Hour",mi:"Minute"},pt:{t:"coment\u00E1rios",t1:"coment\u00E1rio",g:"Entrar com o Google",o:"Sair",l:"Conectado com o Google",u:"Nome de usu\u00E1rio",c:"Escreva um coment\u00E1rio...",r:"Escreva uma resposta...",b:"Responder",m:"Carregar mais coment\u00E1rios...",a:"atr\u00E1s",j:"Agora mesmo",p:"Fixado",s:"Coment\u00E1rio enviado!",y:"Ano",mo:"M\u00EAs",d:"Dia",h:"Hora",mi:"Minuto"},es:{t:"comentarios",t1:"comentario",g:"Iniciar sesi\u00F3n con Google",o:"Cerrar sesi\u00F3n",l:"Conectado con Google",u:"Usuario",c:"Escribe un comentario...",r:"Escribe una respuesta...",b:"Responder",m:"Cargar m\u00E1s comentarios...",a:"hace",j:"Justo ahora",p:"Fijado",s:"Comentario enviado!",y:"A\u00F1o",mo:"Mes",d:"D\u00EDa",h:"Hora",mi:"Minuto"}};
  const nL=navigator.language.substring(0,2);const L=localeDict[nL]?nL:'es';const T=localeDict[L];
  document.getElementById('btnGoogle').textContent=T.g;document.getElementById('btnSalir').textContent=T.o;DOM.nom.placeholder=T.u;document.getElementById('backdrop-main').innerHTML=`<span class="backdrop-placeholder">${T.c}</span>`;DOM.nom.value=localStorage.getItem('savedName')||'';appState.pfpL=localStorage.getItem('savedAvatar');DOM.avaAct.src=appState.pfpL||"/uploads/1/2/7/3/127300461/default-pfp_596.png";DOM.nom.oninput=e=>localStorage.setItem('savedName',e.target.value);
  auth.onAuthStateChanged(u=>{appState.usr=u;DOM.nom.style.display=u?'none':'block';document.getElementById('nombreUsuarioLogueado').style.display='none';document.getElementById('btnGoogle').style.display=u?'none':'flex';document.getElementById('infoUsuario').style.display=u?'flex':'none';if(u){document.getElementById('textoUsuario').textContent=T.l;DOM.avaAct.src=u.photoURL||"/uploads/1/2/7/3/127300461/default-pfp_596.png";}else{DOM.avaAct.src=appState.pfpL||"/uploads/1/2/7/3/127300461/default-pfp_596.png";}});
  document.getElementById('btnGoogle').onclick=()=>auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(e=>alert("Error: "+e.message));document.getElementById('btnSalir').onclick=()=>auth.signOut();
  document.getElementById('avatarUsuarioActual').onclick=()=>!appState.usr&&DOM.inpFile.click();
  DOM.inpFile.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');let s=Math.min(i.width,i.height),x=(i.width-s)/2,y=(i.height-s)/2;let h=i.height>80?80:i.height;let w=i.width>80?80:i.width;c.width=80;c.height=80;c.getContext('2d').drawImage(i,x,y,s,s,0,0,80,80);appState.pfpL=c.toDataURL('image/jpeg',0.95);DOM.avaAct.src=appState.pfpL;localStorage.setItem('savedAvatar',appState.pfpL);};i.src=ev.target.result;};r.readAsDataURL(f);};
  document.getElementById('btnImgMain').onclick=()=>{targetActivoAdjunto='main';inImg.click();};
  inImg.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');let h=i.height>256?256:i.height;let w=Math.round((i.width/i.height)*h);c.width=w;c.height=h;c.getContext('2d').drawImage(i,0,0,w,h);let mime=f.type==='image/png'?'image/png':'image/jpeg';let q=mime==='image/jpeg'?0.85:undefined;setPreview(targetActivoAdjunto,c.toDataURL(mime,q));};i.src=ev.target.result;};r.readAsDataURL(f);inImg.value="";};
  function setPreview(target,src){if(target==='main'){appState.imgAdjMain=src;DOM.prevImg.src=src;DOM.prevBox.style.display='block';}else{appState.imgAdjResp[target]=src;const box=document.getElementById('prev-resp-'+target);if(box){box.querySelector('img').src=src;box.style.display='block';}}}
  document.getElementById('btnQuitarAdjunto').onclick=()=>{appState.imgAdjMain=null;DOM.prevBox.style.display='none';};
  function updateBackdrop(ta){
    const tg=ta.dataset.target;const bd=document.getElementById('backdrop-'+tg);if(!bd)return;
    let v=ta.value;if(!v){bd.innerHTML=`<span class="backdrop-placeholder">${tg==='main'?T.c:T.r}</span>`;return;}
    let safe=v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    uniqueUsers.forEach(u=>{const eN=u.nombre.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&');const reg=new RegExp(`(^|\\s)@${eN}(?=\\s|$)`,'g');safe=safe.replace(reg,`$1<span class="mention-text">@${u.nombre}</span>`);});
    if(safe.endsWith('\n'))safe+='<br>';
    bd.innerHTML=safe;
  }
  function publicarMsj(t,pId=null,rInput=null){
    const cd=localStorage.getItem('floodT');if(cd&&(Date.now()-cd)<30000){alert(`\u23F3 Spam.`);return;}
    let n=appState.usr?appState.usr.displayName:(DOM.nom.value.trim()||"Invitado");
    const imgData=pId?appState.imgAdjResp[pId]:appState.imgAdjMain;
    if(t.trim()===""&&!imgData)return;
    const data={nombre:n,texto:t,fecha:firebase.database.ServerValue.TIMESTAMP,foto:appState.usr?appState.usr.photoURL:appState.pfpL,likes:0,shadowbanned:!!appState.shadow[n.replace(/[\.\$\#\[\]\/]/g,'_')],aprobado:false};
    if(imgData)data.imagenAdjunta=imgData;
    db.ref(pId?`comentarios/${idDePagina}/${pId}/respuestas`:`comentarios/${idDePagina}`).push(data).then(()=>{
      localStorage.setItem('floodT',Date.now());
      const mE=document.getElementById('msgExito');mE.textContent="\u2705 "+T.s;mE.style.display='block';setTimeout(()=>mE.style.display='none',5000);
      if(!pId){DOM.txt.value="";DOM.txt.style.height='42px';updateBackdrop(DOM.txt);appState.imgAdjMain=null;DOM.prevBox.style.display='none';}
      else{if(rInput){rInput.value="";rInput.style.height='42px';updateBackdrop(rInput);}appState.imgAdjResp[pId]=null;const box=document.getElementById('prev-resp-'+pId);if(box)box.style.display='none';}
    });
  }
  DOM.btnEnv.onclick=()=>publicarMsj(DOM.txt.value);
  function updateUniqueUsers(){const map={};appState.coms.forEach(c=>{if(c.nombre&&c.foto)map[c.nombre]=c.foto;if(c.respuestas){Object.values(c.respuestas).forEach(r=>{if(r.nombre&&r.foto)map[r.nombre]=r.foto;});}});uniqueUsers=Object.keys(map).map(k=>({nombre:k,foto:map[k]}));}
  db.ref('insignias').on('value',s=>{appState.insig=s.val()||{};if(appState.coms.length)render();});
  db.ref('shadowbans').on('value',s=>{appState.shadow=s.val()||{};if(appState.coms.length)render();});
  const syD=(c,a,pref,iF,cF,hF,t='div')=>{if(!a.length)return 0;let I=new Set();a.forEach(x=>{let id=pref+iF(x);let el=document.getElementById(id);let ht=hF(x);let cl=cF(x);I.add(id);if(!el){el=document.createElement(t);el.id=id;if(cl)el.className=cl;el.innerHTML=ht;el.dataset.h=ht;c.appendChild(el);}else{if(cl&&el.className!==cl){el.className=cl;}if(el.dataset.h!==ht){el.innerHTML=ht;el.dataset.h=ht;}}});[...c.children].forEach(n=>{if(!I.has(n.id))n.remove();});let dN=[...c.children];a.forEach((x,j)=>{let id=pref+iF(x);if(dN[j]&&dN[j].id!==id){c.insertBefore(document.getElementById(id),c.children[j]);dN=[...c.children];}});return 1;};
  const genHash=(arr)=>arr.map(c=>c.id+(c.nombre||'')+(c.foto||'')+c.aprobado+(c.anclado||false)+(c.respuestas?Object.keys(c.respuestas).map(k=>k+c.respuestas[k].aprobado).join(''):'')).join('|');
  db.ref('comentarios/'+idDePagina).on('value',s=>{
      let nC=[];s.forEach(c=>{const d=c.val();if(typeof d==='object'&&d!==null)nC.push({id:c.key,...d});});
      let soloLikes = (appState.coms.length>0&&genHash(appState.coms)===genHash(nC));
      appState.coms=nC;updateUniqueUsers();
      if(soloLikes){
          nC.forEach(c=>{
              let lBtn=document.querySelector(`.btn-corazon[data-id="${c.id}"]:not([data-pid]) .contador-likes`);
              if(lBtn&&c.likes!==undefined)lBtn.textContent=c.likes;
              if(c.respuestas){Object.keys(c.respuestas).forEach(k=>{let rBtn=document.querySelector(`.btn-corazon[data-id="${k}"][data-pid="${c.id}"] .contador-likes`);if(rBtn&&c.respuestas[k].likes!==undefined)rBtn.textContent=c.respuestas[k].likes;});}
          });
      }else{render();}
  });
  document.addEventListener('input',e=>{
    if(e.target.tagName==='TEXTAREA'&&(e.target.id==='textoComentario'||e.target.classList.contains('input-respuesta'))){
        e.target.style.height='auto';e.target.style.height=(e.target.scrollHeight)+'px';updateBackdrop(e.target);
        activeTextarea=e.target;const val=activeTextarea.value;const cursor=activeTextarea.selectionStart;
        const textBeforeCursor=val.substring(0,cursor);const match=textBeforeCursor.match(/(?:^|\s)@([^@\n]*)$/);
        if(match&&match[1].length<30){
            const searchStr=match[1].toLowerCase();mentionStartIndex=cursor-searchStr.length-1;
            const filtered=uniqueUsers.filter(u=>u.nombre.toLowerCase().includes(searchStr));
            if(filtered.length>0){
                mBox.innerHTML=filtered.map(u=>`<div class="mention-item" data-name="${u.nombre}"><img src="${u.foto}" class="mention-avatar"><span class="mention-name">${u.nombre}</span></div>`).join('');
                const rect=activeTextarea.getBoundingClientRect();
                mBox.style.display='flex';
                mBox.style.top=(rect.top-mBox.offsetHeight-5>0?rect.top-mBox.offsetHeight-5:rect.bottom+5)+'px';
                mBox.style.left=rect.left+'px';
            }else{mBox.style.display='none';}
        }else{mBox.style.display='none';}
    }
  });
  document.addEventListener('click',e=>{
    if(!mBox)return;
    const item=e.target.closest('.mention-item');
    if(item&&activeTextarea){
        const name=item.dataset.name;const val=activeTextarea.value;
        const before=val.substring(0,mentionStartIndex);const after=val.substring(activeTextarea.selectionStart);
        const insertText=`@${name} `;activeTextarea.value=before+insertText+after;
        mBox.style.display='none';activeTextarea.focus();
        const newPos=mentionStartIndex+insertText.length;activeTextarea.setSelectionRange(newPos,newPos);
        activeTextarea.style.height='auto';activeTextarea.style.height=(activeTextarea.scrollHeight)+'px';updateBackdrop(activeTextarea);
    }else if(!e.target.closest('#mentionsDropdown')&&e.target.tagName!=='TEXTAREA'){mBox.style.display='none';}
  });
  DOM.lista.addEventListener('click',e=>{
    const btn=e.target.closest('button');if(!btn)return;const id=btn.dataset.id;
    if(btn.classList.contains('btn-corazon')){
      const pId=btn.dataset.pid;const path=pId?`comentarios/${idDePagina}/${pId}/respuestas/${id}/likes`:`comentarios/${idDePagina}/${id}/likes`;const sKey=pId?`liked_${pId}_${id}`:`liked_${id}`;
      const spanV=btn.querySelector('.contador-likes');
      const h=localStorage.getItem(sKey),r=db.ref(path);
      if(h){btn.classList.remove('likeado');spanV.textContent=Math.max(0,parseInt(spanV.textContent||0)-1);localStorage.removeItem(sKey);r.transaction(c=>(c||0)>0?c-1:0);}
      else{btn.classList.add('likeado');spanV.textContent=parseInt(spanV.textContent||0)+1;localStorage.setItem(sKey,'true');r.transaction(c=>(c||0)+1);}
    }else if(btn.classList.contains('btn-responder')){
      const z=document.getElementById('form-resp-'+id);const ta=z.querySelector('.input-respuesta');const rU=btn.dataset.replyuser;
      if(z.style.display==='none'||ta.dataset.lastu!==rU){
        z.style.display='block';ta.dataset.lastu=rU;
        if(rU){const m=`@${rU} `;if(!ta.value.startsWith(m)){ta.value=m;updateBackdrop(ta);}}
        ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';
      }else{z.style.display='none';ta.dataset.lastu='';}
    }else if(btn.classList.contains('btn-enviar-respuesta')){
      const inp=btn.parentElement.querySelector('.input-respuesta');publicarMsj(inp.value,id,inp);document.getElementById('form-resp-'+id).style.display='none';
    }else if(btn.dataset.action==='img'){
      targetActivoAdjunto=id;inImg.click();
    }else if(btn.dataset.action==='quitar-adj'){
      appState.imgAdjResp[id]=null;document.getElementById('prev-resp-'+id).style.display='none';
    }else if(btn.classList.contains('btn-cargar-mas')){
      appState.limite+=10;render();
    }else if(btn.classList.contains('btn-toggle-resp')){
      const st=btn.dataset.state;const tot=parseInt(btn.dataset.total);const allR=document.querySelectorAll(`.resp-item-${id}`);
      if(st==='partial'||st==='none'){allR.forEach(el=>el.style.display='flex');btn.dataset.state='all';btn.innerHTML=`&#x21B3; Ocultar respuestas`;}
      else{allR.forEach(el=>el.style.display='none');btn.dataset.state='none';btn.innerHTML=`&#x21B3; Ver ${tot} respuesta${tot>1?'s':''}`;}
    }
  });
  function procT(t){
    let safe=t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    uniqueUsers.forEach(u=>{const eN=u.nombre.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&');const reg=new RegExp(`(^|\\s)@${eN}(?=\\s|$)`,'g');safe=safe.replace(reg,`$1<span class="mention-text">@${u.nombre}</span>`);});
    return safe.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,'<div style="margin:10px 0; max-width:378px;"><div style="border-radius:8px;overflow:hidden;position:relative;padding-bottom:56.25%;"><iframe src="https://www.youtube.com/embed/$1" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe></div></div>').replace(/(https?:\/\/[^\s<"']+)/g,url=>url.includes('/embed/')?url:`<a href="${url}" target="_blank">${url}</a>`);
  }
  function calculaT(f){
    const s=Math.floor((Date.now()-f)/1000);
    const d=new Date(f);
    let mE=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    let dia=d.getDate(),mes=mE[d.getMonth()],anio=d.getFullYear();let tF=`${dia} de ${mes} de ${anio}`;
    if(L==='es'){const ft=(v,u)=>`hace ${v} ${u}${v>1?(u==='mes'?'es':'s'):''}`;return s>=31536000?`<span title="${tF}">${ft(Math.floor(s/31536000),"a\u00F1o")}</span>`:s>=2592000?`<span title="${tF}">${ft(Math.floor(s/2592000),"mes")}</span>`:s>=86400?`<span title="${tF}">${ft(Math.floor(s/86400),"d\u00EDa")}</span>`:s>=3600?`<span title="${tF}">${ft(Math.floor(s/3600),"hora")}</span>`:s>=60?`<span title="${tF}">${ft(Math.floor(s/60),"minuto")}</span>`:`<span title="${tF}">Justo ahora</span>`;}
    else if(L==='en'){const ft=(v,u)=>`${v} ${u}${v>1?'s':''} ago`;return s>=31536000?`<span title="${tF}">${ft(Math.floor(s/31536000),"year")}</span>`:s>=2592000?`<span title="${tF}">${ft(Math.floor(s/2592000),"month")}</span>`:s>=86400?`<span title="${tF}">${ft(Math.floor(s/86400),"day")}</span>`:s>=3600?`<span title="${tF}">${ft(Math.floor(s/3600),"hour")}</span>`:s>=60?`<span title="${tF}">${ft(Math.floor(s/60),"minuto")}</span>`:`<span title="${tF}">Just now</span>`;}
    else{const ft=(v,u)=>`${v} ${u}${v>1?'s':''} atr\u00E1s`;return s>=31536000?`<span title="${tF}">${ft(Math.floor(s/31536000),"ano")}</span>`:s>=2592000?`<span title="${tF}">${ft(Math.floor(s/2592000),"m\u00EAs")}</span>`:s>=86400?`<span title="${tF}">${ft(Math.floor(s/86400),"dia")}</span>`:s>=3600?`<span title="${tF}">${ft(Math.floor(s/3600),"hora")}</span>`:s>=60?`<span title="${tF}">${ft(Math.floor(s/60),"minuto")}</span>`:`<span title="${tF}">Agora mesmo</span>`;}
  }
  function render(){
    let cTotal=0;const miNom=appState.usr?appState.usr.displayName:(DOM.nom.value.trim()||"Invitado");
    appState.coms.forEach(c=>{if(c.aprobado!==false){cTotal++;if(c.respuestas){Object.values(c.respuestas).forEach(r=>{if(r.aprobado!==false)cTotal++;});}}});
    DOM.txtTit.textContent=`${cTotal} ${cTotal===1?T.t1:T.t}`;
    appState.coms.sort((x,y)=>(x.anclado&&!y.anclado)?-1:(!x.anclado&&y.anclado)?1:(y.fecha||0)-(x.fecha||0));
    const arr=appState.coms.slice(0,appState.limite);const ahora=Date.now();
    if(!syD(DOM.lista,arr,'com_',c=>c.id,c=>`comentario-individual ${c.anclado?'es-anclado':''}`,d=>{
      if((d.shadowbanned&&d.nombre!==miNom)||d.aprobado===false)return '';
      const nom=d.nombre||'Usuario',nL=nom.replace(/[\.\$\#\[\]\/]/g,'_');
      const bI=appState.insig[nL]?`<img src="/uploads/1/2/7/3/127300461/featured-user-icon_orig.png" class="badge-img">`:'';
      const l=localStorage.getItem('liked_'+d.id);
      let html=`<div class="avatar"><img src="${d.foto||'/uploads/1/2/7/3/127300461/default-pfp_596.png'}"></div><div class="comentario-contenido"><div class="cabecera-comentario"><span class="comentario-nombre">${nom}${bI} ${d.anclado?`<span class="badge-anclado">&#x1F4CC; ${T.p}</span>`:''}</span><span class="comentario-fecha">${calculaT(d.fecha||ahora)}</span></div><p class="comentario-texto">${procT(d.texto||'')}</p>${d.imagenAdjunta?`<img src="${d.imagenAdjunta}" class="img-adjunta">`:''}<div class="acciones-comentario"><button class="btn-accion btn-corazon ${l?'likeado':''}" data-id="${d.id}"><span class="corazon-icono"></span><span class="contador-likes">${d.likes||0}</span></button><button class="btn-accion btn-responder" data-id="${d.id}" data-replyuser="${nom}">${T.b}</button></div><div class="caja-respuestas ${d.respuestas&&Object.keys(d.respuestas).length>0?'con-hilo':''}">`;
      if(d.respuestas){
        const vK=Object.keys(d.respuestas).filter(k=>{const r=d.respuestas[k];return typeof r==='object'&&r&&!(r.shadowbanned&&r.nombre!==miNom)&&r.aprobado!==false;});
        html+=vK.map((k,idx)=>{
          const r=d.respuestas[k];const rn=r.nombre||'Usuario',rnL=rn.replace(/[\.\$\#\[\]\/]/g,'_');const rl=localStorage.getItem(`liked_${d.id}_${k}`);
          let eS=idx>0?`style="display:none;"`:'';
          return `<div class="respuesta-individual resp-item-${d.id}" ${eS}><div class="avatar"><img src="${r.foto||'/uploads/1/2/7/3/127300461/default-pfp_596.png'}"></div><div><div class="cabecera-comentario"><span class="comentario-nombre">${rn}${appState.insig[rnL]?`<img src="/uploads/1/2/7/3/127300461/featured-user-icon_orig.png" class="badge-img">`:''}</span><span class="comentario-fecha">${calculaT(r.fecha||ahora)}</span></div><p class="comentario-texto">${procT(r.texto||'')}</p>${r.imagenAdjunta?`<img src="${r.imagenAdjunta}" class="img-adjunta">`:''}<div class="acciones-comentario" style="margin-top: 5px; margin-bottom: 0px;"><button class="btn-accion btn-corazon ${rl?'likeado':''}" data-id="${k}" data-pid="${d.id}"><span class="corazon-icono"></span><span class="contador-likes">${r.likes||0}</span></button><button class="btn-accion btn-responder" data-id="${d.id}" data-replyuser="${rn}">${T.b}</button></div></div></div>`;
        }).join('');
        if(vK.length>1){
            const extC=vK.length-1;
            html+=`<div style="margin-left:46px; margin-top:10px;"><button class="btn-accion btn-toggle-resp" data-id="${d.id}" data-state="partial" data-total="${vK.length}" style="color:#f1f1f1; font-weight:bold;">&#x21B3; Ver ${extC} respuesta${extC>1?'s':''} m\u00E1s</button></div>`;
        }
      }
      return html+`</div><div class="zona-formulario-respuesta" id="form-resp-${d.id}" style="display:none;"><div class="formulario-respuesta"><div class="avatar" style="width:30px;height:30px;flex-shrink:0;"><img src="${DOM.avaAct.src}"></div><div class="input-contenedor"><div class="input-backdrop" id="backdrop-${d.id}"><span class="backdrop-placeholder">${T.r}</span></div><textarea id="input-resp-${d.id}" class="input-respuesta textarea-transparente" data-target="${d.id}" rows="1"></textarea></div><button class="btn-attach" data-action="img" data-id="${d.id}" title="Adjuntar Foto">&#x1F5BC;&#xFE0F;</button><button class="btn-enviar-respuesta btn-send-whatsapp-small" data-id="${d.id}"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div><div class="preview-adjunto" id="prev-resp-${d.id}" style="margin-left:46px;"><img src=""><button class="btn-quitar-adjunto" data-action="quitar-adj" data-id="${d.id}">X</button></div></div></div>`;
    })){DOM.lista.innerHTML='';}
    const btnC=document.getElementById('btnCargarMasContainer');
    if(appState.limite<appState.coms.length){btnC.style.display='block';btnC.innerHTML=`<button class="btn-cargar-mas" data-action="more">${T.m}</button>`;}
    else{btnC.style.display='none';}
  }
})();