(async function(){
  const widgetBox=document.getElementById('mb-comentarios-widget');
  if(!widgetBox)return;

  // ===== EMOTES: edita esta lista para agregar los tuyos =====
  // Cada emote es   nombre:'URL de la imagen'   (PNG, GIF, WebP o SVG; mejor cuadrada y de ~64x64 px).
  //   Ejemplos:   creeper:'/uploads/1/2/7/3/127300461/creeper.png',   zombi:'https://tusitio.com/zombi.gif',
  // En el comentario se escriben como :nombre:  (nombre en minusculas; letras, numeros o _ ; maximo 24 caracteres; hasta 256 emotes).
  // Los 5 de abajo son de PRUEBA (dibujos SVG metidos en el propio codigo): borralos y pon los tuyos.
  const svg=s=>'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'+s+'</svg>');
  const EMOTES={
      hearth:'/uploads/1/2/7/3/127300461/like-comment2_orig.png',
      minifrank:'/uploads/1/2/7/3/127300461/creeper.png',
      discord:'/uploads/1/2/7/3/127300461/discord-icon.png',
      trophy:'/uploads/1/2/7/3/127300461/xdestacado_orig.gif',
      featured:'/uploads/1/2/7/3/127300461/featured-user-icon_orig.png',
      frank:'/uploads/1/2/7/3/127300461/default-pfp_596.png',
    };
  // --- No hace falta tocar nada de aqui para abajo ---
  const esImg=v=>/^(https?:)?\/|^data:image\//.test(v);
  const EMO_KEYS=Object.keys(EMOTES).filter(n=>/^[a-z0-9_]{1,24}$/.test(n)&&esImg(EMOTES[n])).slice(0,256);
  const EMO_IDX=Object.create(null);EMO_KEYS.forEach((n,i)=>{EMO_IDX[n]=i;});
  // En la caja de escribir cada emote es 1 caracter "reservado" (U+E000+n) que se dibuja como su imagen; al publicar vuelve a ser :nombre:
  const EMO_CSS=EMO_KEYS.map((n,i)=>'#caja-comentarios .em[data-e="'+i+'"]{background-image:url("'+EMOTES[n].replace(/["\\\n\r]/g,c=>'\\'+c.charCodeAt(0).toString(16)+' ')+'")}').join('\n');

  // ===== CODIGOS DE ENLACE: pon aqui tu uid de admin (el mismo que usas en las reglas de Firebase) =====
  // Al abrir una pagina con tu sesion de Google, se numeran solos los comentarios que aun no tengan codigo.
  const ADMIN_UID='9wvlf1TIdsMlVw7ACtRqWyAUddE3';
  // ===== SEGURIDAD: todo lo que viene de la base de datos (nombres, fotos, imagenes, codigos) se "limpia" antes de dibujarlo =====
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const DEF_PFP='/uploads/1/2/7/3/127300461/default-pfp_596.png';
  const urlOk=(u,fb)=>{u=String(u==null?'':u).trim();return /^(https?:)?\/\/|^\/(?!\/)|^data:image\//i.test(u)?u:(fb===undefined?DEF_PFP:fb);};   // solo http(s), rutas del sitio o data:image
  // Identidad de cada persona: su cuenta de Google (uid) si comento con una; si no, su nombre. (El mismo calculo se usa en el Studio.)
  const nameKey=n=>{const k=String(n==null||n===''?'Usuario':n).replace(/[\.\$\#\[\]\/]/g,'_');return k.indexOf('uid:')===0?'_'+k:k;};
  const uidKey=u=>'uid:'+String(u).replace(/[\.\$\#\[\]\/]/g,'_');
  const tiene=(o,k)=>Object.prototype.hasOwnProperty.call(o,k)&&!!o[k];   // (un nombre como "constructor" no puede colarse como si tuviera insignia)
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
<style>:root{--c-bg-hover:rgba(255,255,255,0.1);--c-border:rgba(255,255,255,0.15);--accent-blue:#58a6ff;--text-muted:#8b949e;--font-stack:'Droid Sans',system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}.main-wrap p{margin:0 auto 8px !important;}#caja-comentarios *{font-family:var(--font-stack)!important;box-sizing:border-box;}#caja-comentarios{max-width:700px;margin:10px auto 8px 10px !important;color:#fff;background:0 0;position:relative;}.cabecera-principal{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid rgba(255,255,255,.3);padding-bottom:8px;margin-bottom:20px;flex-wrap:wrap;gap:10px;}.titulo-comentarios{margin:0;color:#fff;}#btnGoogle{background:#fff;color:#333;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-weight:700;font-size:13px;display:flex;align-items:center;gap:5px;}#btnGoogle::before{content:'G';color:#ea4335;font-weight:900;}#btnSalir{background:var(--c-bg-hover);color:#fff;border:1px solid rgba(255,255,255,.3);padding:4px 8px;border-radius:4px;cursor:pointer;font-size:12px;margin-left:10px;}.formulario-comentarios{display:flex;flex-direction:column;gap:6px;padding:15px 15px 0;border-radius:6px;}.fila-usuario{display:flex;align-items:flex-start;gap:10px;}#nombreUsuario{padding:10px;border:0 solid rgba(255,255,255,.3);border-radius:4px;font-size:14px;background:rgba(0,0,0,.2);color:#fff;width:100%;max-width:225px;outline:none;}#nombreUsuarioLogueado{font-weight:700;font-size:14px;}.input-contenedor{position:relative;width:100%;flex-grow:1;background:rgba(0,0,0,.2);border-radius:4px;min-height:42px;}.input-backdrop{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden;z-index:1;color:#fff;}.textarea-transparente{position:relative;z-index:2;background:transparent!important;color:transparent!important;caret-color:#fff;width:100%;outline:none;resize:none;overflow:hidden;min-height:42px;display:block;}.input-backdrop,.textarea-transparente{margin:0;border:none;padding:10px;font-size:14px;font-family:var(--font-stack)!important;line-height:1.5;white-space:pre-wrap;word-break:break-word;box-sizing:border-box;letter-spacing:normal;font-weight:normal;}.textarea-transparente::placeholder{color:transparent;}.backdrop-placeholder{color:var(--text-muted);}.controles-formulario{display:flex;justify-content:flex-end;align-items:center;gap:8px;}.btn-send-whatsapp,.btn-send-whatsapp-small{background:#0073e6;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s;flex-shrink:0;}.btn-send-whatsapp{width:44px;height:44px;}.btn-send-whatsapp-small{width:34px;height:34px;}.btn-send-whatsapp:hover,.btn-send-whatsapp-small:hover{background:#005bb5;}.btn-attach{background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:20px;transition:transform 0.2s,color 0.2s;padding:5px;display:flex;align-items:center;justify-content:center;}.btn-attach:hover{transform:scale(1.1);color:#fff;}.comentario-individual{padding:0 15px !important;margin-bottom:5px;display:flex;gap:6px;position:relative;z-index:1;animation:fadeIn 0.3s ease;}@keyframes fadeIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}@keyframes fadeInResp{from{opacity:0;transform:translateY(-5px);}to{opacity:1;transform:translateY(0);}}.anim-resp{animation:fadeInResp 0.3s ease forwards;}.comentario-individual.es-anclado{background:rgba(218,165,32,0.1);border:1px solid rgba(218,165,32,0.4);padding-top:15px !important;border-radius:6px;}.badge-anclado{background:#daa520;color:#000;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;margin-left:8px;display:inline-block;vertical-align:middle;}.avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;background:rgba(0,0,0,.1);z-index:2;position:relative;}.avatar img{width:100%;height:100%;object-fit:cover;}.avatar-upload-btn{cursor:pointer;position:relative;}.avatar-overlay{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(255,255,255,.4);opacity:0;transition:0.2s;z-index:10;color:#000;}.avatar-upload-btn:hover .avatar-overlay{opacity:1;}.comentario-contenido{flex-grow:1;min-width:0;}.cabecera-comentario{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;}.comentario-nombre{font-weight:700;font-size:14px;display:inline-flex;align-items:center;}.comentario-fecha{font-size:11px;color:gray;cursor:default;}#caja-comentarios div p.comentario-texto{margin:0 0 2px 0 !important;font-size:14px !important;line-height:1.5 !important;white-space:pre-wrap !important;word-break:break-word !important;color:#fff;}.comentario-texto a{color:var(--accent-blue);font-weight:bold;text-decoration:none;}.comentario-texto a:hover{filter:brightness(1.2);text-decoration:none;}.mention-text{color:var(--accent-blue);cursor:pointer;background:rgba(88,166,255,0.1);border-radius:2px;}.mention-text:hover{filter:brightness(1.2);}.img-adjunta{max-height:256px;width:auto;max-width:100%;border-radius:6px;margin-bottom:10px;display:block;image-rendering:auto !important;}.acciones-comentario{display:flex;gap:8px;margin-bottom:10px;}.btn-accion{background:0 0;border:none;color:gray;cursor:pointer;font-size:13px;padding:4px 8px;border-radius:20px;display:flex;align-items:center;gap:4px;transition:all .2s;margin-left:-8px;}.btn-accion:hover{color:#fff;background:var(--c-bg-hover);}.btn-responder{font-weight:bold;}.caja-respuestas{margin-top:10px;padding-left:0;position:relative;}.caja-respuestas.con-hilo::before{content:'';position:absolute;top:-25px;bottom:15px;left:-26px;width:2px;background:var(--c-border);border-radius:2px;z-index:0;}.respuesta-individual{display:flex;gap:6px;margin-top:15px;position:relative;margin-left:10px;}.respuesta-individual::before{content:'';position:absolute;top:15px;left:-36px;width:36px;height:2px;background:var(--c-border);border-bottom-left-radius:4px;z-index:0;}.respuesta-individual .avatar{width:30px;height:30px;}.formulario-respuesta{display:flex;gap:8px;margin-top:10px;align-items:flex-start;position:relative;}.corazon-icono{width:17px;height:16px;display:inline-block;background-image:url('https://mineblocksstuffs.weebly.com/uploads/1/2/7/3/127300461/like-comment1_orig.png');background-size:cover;transition:transform .1s;pointer-events:none;}.btn-corazon.likeado .corazon-icono{background-image:url('https://mineblocksstuffs.weebly.com/uploads/1/2/7/3/127300461/like-comment2_orig.png')!important;}.btn-corazon:active .corazon-icono{transform:scale(.7) translateY(2px);}.badge-img{width:12px;height:12px;margin-left:5px;}.preview-adjunto{display:none;position:relative;margin-top:5px;width:fit-content;}.preview-adjunto img{max-height:120px;width:auto;max-width:100%;border-radius:6px;border:1px solid rgba(255,255,255,.2);image-rendering:auto !important;}.btn-quitar-adjunto{position:absolute;top:-8px;right:-8px;background:#dc3545;color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,.5);font-size:12px;}@keyframes shimmer{0%{background-position:-400px 0;}100%{background-position:400px 0;}}.skeleton-avatar{background:#e6f2ff;background-image:linear-gradient(90deg,#e6f2ff 0px,#ffffff 40px,#e6f2ff 80px);background-size:800px 100%;animation:shimmer 2s infinite linear;}.skeleton-line{height:12px;background:#e6f2ff;margin-bottom:10px;border-radius:4px;background-image:linear-gradient(90deg,#e6f2ff 0px,#ffffff 40px,#e6f2ff 80px);background-size:800px 100%;animation:shimmer 2s infinite linear;}.skeleton-title{width:30%;height:14px;margin-bottom:15px;}.skeleton-line.short{width:60%;}.btn-cargar-mas{background:rgba(0,0,0,0.2);color:var(--accent-blue);border:1px solid rgba(255,255,255,0.2);width:100%;padding:12px;border-radius:6px;cursor:pointer;font-weight:bold;margin-top:15px;transition:all 0.2s;font-size:14px;}.btn-cargar-mas:hover{background:rgba(255,255,255,0.1);color:#fff;}
.mentions-dropdown{position:absolute;z-index:2147483647;background:#00163e;border:1px solid var(--c-border);border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.6);max-height:150px;overflow-y:auto;display:none;flex-direction:column;width:220px;font-family:var(--font-stack)!important;}
.mention-item{display:flex;align-items:center;padding:8px 10px;cursor:pointer;gap:8px;}
.mention-item:hover{background:var(--c-bg-hover);}
.mention-avatar{width:20px;height:20px;border-radius:50%;object-fit:cover;flex-shrink:0;}
.mention-name{font-size:13px;font-weight:bold;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.mention-item.activo{background:var(--c-bg-hover);}
.barra-orden{margin:0 15px 15px;}
.orden-wrap{position:relative;display:inline-block;}
.btn-orden-menu{background:transparent;border:none;color:#fff;cursor:pointer;display:flex;align-items:center;gap:10px;padding:6px 10px 6px 4px;border-radius:20px;font-size:14px;font-weight:700;}
.btn-orden-menu:hover{background:var(--c-bg-hover);}
.orden-menu{position:absolute;top:100%;left:0;margin-top:6px;width:320px;max-width:calc(100vw - 30px);background:#0a1d47;border:1px solid var(--c-border);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.6);padding:8px 0;z-index:50;}
.orden-opcion{display:block;width:100%;text-align:left;background:transparent;border:none;color:#fff;cursor:pointer;padding:12px 20px;}
.orden-opcion:hover{background:var(--c-bg-hover);}
.orden-opcion.activo{background:rgba(255,255,255,.14);}
.orden-opcion-t{display:block;font-size:15px;}
.orden-opcion-d{display:block;font-size:12px;color:var(--text-muted);margin-top:3px;}
.emote{width:1.6em;height:1.6em;object-fit:contain;vertical-align:middle;margin:0 1px;}
.emote-txt{font-size:1.2em;vertical-align:middle;}
.emote-picker{position:absolute;z-index:2147483647;display:none;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:4px;width:280px;max-height:210px;overflow-y:auto;padding:8px;background:#00163e;border:1px solid var(--c-border);border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.6);font-family:var(--font-stack);}
.emote-item{background:transparent;border:none;border-radius:6px;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;font-size:22px;}
.emote-item:hover{background:var(--c-bg-hover);}
.emote-item .emote{width:28px;height:28px;margin:0;}
.comentario-texto strong{font-weight:700;}
.comentario-texto em{font-style:italic;}
.comentario-texto del{text-decoration:line-through;opacity:.8;}
#caja-comentarios code{font-family:ui-monospace,Consolas,Menlo,monospace!important;font-size:13px;background:rgba(255,255,255,.12);padding:1px 5px;border-radius:4px;}
.spoiler{background:#000;color:transparent;border-radius:3px;cursor:pointer;padding:0 2px;}
.spoiler:not(.visto) *{visibility:hidden;}
.spoiler.visto{background:rgba(255,255,255,.12);color:inherit;}
.grupo-titulo{position:relative;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.grupo-titulo .orden-wrap{position:static;}
@font-face{font-family:'MBEmo';src:url(data:font/woff;base64,d09GRgABAAAAAAI0AAoAAAAABFgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABXAAAADAAAABgJXY5DWNtYXAAAAGUAAAAMAAAAjTgj+PSZ2x5ZgAAAcwAAAABAAAAAQAAAABoZWFkAAAA9AAAADYAAAA2LQF93GhoZWEAAAEsAAAAGwAAACQDhgVIaG10eAAAAYwAAAAGAAAABgZAAABsb2NhAAABxAAAAAYAAAAGAAAAAG1heHAAAAFIAAAAEwAAACAAAwACbmFtZQAAAdAAAABPAAAAWg7yPH5wb3N0AAACIAAAABQAAAAqbnUDZQABAAAAAQAAMSjTWF8PPPUAAwPoAAAAAOb1nn4AAAAA5vWefgAAAAAAAAAAAAAAAwACAAAAAAAAeJxjYGRgYG75z8bAwObAAAGMDKiAEQA2IQHWAHicY2BkYGBgYoABBAsKAACXAAYAeJxjYGZzYJzAwMrAwkAEEEBi2wMBA8MDhgf/mVv+szEwMLcw/EJTrsDAAAASlgfcBkAAAAAAAAB4nGNgYGBiYGBgBmIRIMkIplmYFIA0CxAC+Q/+//8PJBlAJJDPAiZH4QiGAKybCCEAAAAAAAAAAAAAAAB4nC2IQQqAIBQF55sRRbTsKB1AcOnGG7gQN4ogeP80msVj3gCaB2EirN9OFNt4C6L3UQ7O3xUXtzO2VB9Tz6HhMFgKFU8k0ckE2gvj9wm0AHicY2BiwA+A8oxMzKm5+QADIgFM) format('woff');unicode-range:U+E000-E0FF;}
#caja-comentarios .input-backdrop,#caja-comentarios .input-backdrop *,#caja-comentarios .textarea-transparente{font-family:'MBEmo',var(--font-stack)!important;}
.input-backdrop .em{background-repeat:no-repeat;background-position:center;background-size:contain;padding:.25em 0;}
${EMO_CSS}
.input-backdrop .mk{color:rgba(255,255,255,.4);}
.input-backdrop .f-b{-webkit-text-stroke:.6px currentColor;}
.input-backdrop .f-i{color:#cfe3ff;}
#mb-comentarios-widget.italic-ok .input-backdrop .f-i{font-style:italic;color:inherit;}
.input-backdrop .f-u{text-decoration:underline;}
.input-backdrop .f-s{text-decoration:line-through;}
.input-backdrop .f-code{background:rgba(255,255,255,.16);border-radius:3px;color:#ffd9a0;}
.input-backdrop .f-sp{background:rgba(255,255,255,.2);border-radius:3px;}
.input-backdrop .f-q{color:#c9d1d9;}
.input-backdrop .f-url{color:var(--accent-blue);}
.comentario-texto .cita{display:block;border-left:3px solid rgba(255,255,255,.35);padding-left:10px;margin:2px 0;color:#d0d7de;}
.barra-fmt{position:absolute;z-index:2147483647;display:none;align-items:center;gap:2px;padding:4px;background:#00163e;border:1px solid var(--c-border);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.6);font-family:var(--font-stack);}
.barra-fmt button{background:transparent;border:none;color:#fff;width:30px;height:28px;border-radius:5px;cursor:pointer;font-size:15px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0;font-family:inherit;}
.barra-fmt button:hover{background:rgba(255,255,255,.16);}
.barra-fmt svg{width:18px;height:18px;fill:currentColor;}
.fmt-sep{width:1px;height:18px;background:var(--c-border);margin:0 4px;}
#caja-comentarios a.comentario-fecha{color:gray;text-decoration:none;cursor:pointer;}
#caja-comentarios a.comentario-fecha:hover{text-decoration:underline;}
/* corazon del creador */
.cor-creador{display:inline-flex;align-items:center;align-self:center;flex-shrink:0;margin:0 4px 0 -2px;cursor:default;}
.cor-av{position:relative;display:inline-block;width:22px;height:22px;}
.cor-av img{width:22px;height:22px;border-radius:50%;object-fit:cover;display:block;background:rgba(0,0,0,.2);}
.cor-av i{position:absolute;right:-5px;bottom:-5px;width:14px;height:13px;background:url('https://mineblocksstuffs.weebly.com/uploads/1/2/7/3/127300461/like-comment2_orig.png') center/cover no-repeat;filter:drop-shadow(0 0 2px rgba(0,0,0,.8));pointer-events:none;}
/* en pantallas angostas, si ya no caben los botones, el ultimo baja a la siguiente linea completo (antes se partia el texto "Enlace" en dos) */
.acciones-comentario{flex-wrap:wrap;}
.acciones-comentario .btn-accion{white-space:nowrap;}
</style>
<div id="caja-comentarios">
  <div class="cabecera-principal">
    <div class="grupo-titulo"><h3 class="titulo-comentarios" id="txtTitulo">Cargando...</h3><div class="orden-wrap"><button type="button" class="btn-orden-menu" id="btnOrdenMenu" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg><span id="txtOrdenar"></span></button><div class="orden-menu" id="ordenMenu" style="display:none;" role="menu"></div></div></div>
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
    <div class="controles-formulario"><button class="btn-attach btn-emote" data-action="emote" data-target="main" title="Emotes">&#x1F600;</button><button class="btn-attach" id="btnImgMain" title="Adjuntar Imagen">&#x1F5BC;&#xFE0F;</button><button id="btnEnviar" class="btn-send-whatsapp"><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div>
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
  let appState={usr:null,pfpL:null,imgAdjMain:null,imgAdjResp:{},limite:10,coms:[],insig:{},shadow:{},orden:'populares',rank:Object.create(null)};
  const estrella=x=>!!((x.uid&&tiene(appState.insig,uidKey(x.uid)))||tiene(appState.insig,nameKey(x.nombre)));               // insignia: por cuenta Google, o por nombre (antiguo)
  const silenciado=(uid,n)=>!!((uid&&tiene(appState.shadow,uidKey(uid)))||tiene(appState.shadow,nameKey(n)));
  const esMio=x=>{const u=appState.usr;if(u)return x.uid?x.uid===u.uid:x.nombre===u.displayName;return !x.uid&&x.nombre===(DOM.nom.value.trim()||'Invitado');};
  const visible=x=>!!x&&typeof x==='object'&&x.aprobado!==false&&!(x.shadowbanned&&!esMio(x));                   // lo mismo que ve cualquier visitante
  let targetActivoAdjunto=null;let uniqueUsers=[];let activeTextarea=null;let mentionStartIndex=-1;let mentionIdx=0;
  const inImg=document.createElement('input');inImg.type='file';inImg.accept='image/png, image/jpeg, image/webp';
  const localeDict={en:{t:"comments",t1:"comment",g:"Sign in with Google",o:"Sign out",l:"Signed in with Google",u:"Username",c:"Write a comment...",r:"Write a reply...",b:"Reply",m:"Load more comments...",a:"ago",j:"Just now",p:"Pinned",s:"Comment sent!",y:"Year",mo:"Month",d:"Day",h:"Hour",mi:"Minute",ord:"Sort by",rec:"Newest",pop:"Top",lnk:"Link",cpl:"Copy link",cpd:"Link copied!"},pt:{t:"coment\u00E1rios",t1:"coment\u00E1rio",g:"Entrar com o Google",o:"Sair",l:"Conectado com o Google",u:"Nome de usu\u00E1rio",c:"Escreva um coment\u00E1rio...",r:"Escreva uma resposta...",b:"Responder",m:"Carregar mais coment\u00E1rios...",a:"atr\u00E1s",j:"Agora mesmo",p:"Fixado",s:"Coment\u00E1rio enviado!",y:"Ano",mo:"M\u00EAs",d:"Dia",h:"Hora",mi:"Minuto",ord:"Ordenar por",rec:"Mais recentes",pop:"Mais populares",lnk:"Link",cpl:"Copiar link",cpd:"Link copiado!"},es:{t:"comentarios",t1:"comentario",g:"Iniciar sesi\u00F3n con Google",o:"Cerrar sesi\u00F3n",l:"Conectado con Google",u:"Usuario",c:"Escribe un comentario...",r:"Escribe una respuesta...",b:"Responder",m:"Cargar m\u00E1s comentarios...",a:"hace",j:"Justo ahora",p:"Fijado",s:"Comentario enviado!",y:"A\u00F1o",mo:"Mes",d:"D\u00EDa",h:"Hora",mi:"Minuto",ord:"Ordenar por",rec:"M\u00E1s recientes",pop:"M\u00E1s populares",lnk:"Enlace",cpl:"Copiar enlace",cpd:"\u00A1Enlace copiado!"}};
  const nL=navigator.language.substring(0,2);const L=localeDict[nL]?nL:'es';const T=localeDict[L];
  document.getElementById('btnGoogle').textContent=T.g;document.getElementById('btnSalir').textContent=T.o;DOM.nom.placeholder=T.u;document.getElementById('backdrop-main').innerHTML=`<span class="backdrop-placeholder">${T.c}</span>`;DOM.nom.value=localStorage.getItem('savedName')||'';appState.pfpL=localStorage.getItem('savedAvatar');DOM.avaAct.src=appState.pfpL||"/uploads/1/2/7/3/127300461/default-pfp_596.png";DOM.nom.oninput=e=>localStorage.setItem('savedName',e.target.value);
  Object.assign(localeDict.en,{ant:"Oldest",popD:"Comments with the most likes first",antD:"Oldest comments first",recD:"Newest comments first",vp:"Preview"});
  Object.assign(localeDict.pt,{ant:"Mais antigos",popD:"Coment\u00E1rios com mais curtidas primeiro",antD:"Coment\u00E1rios mais antigos primeiro",recD:"Coment\u00E1rios mais recentes primeiro",vp:"Pr\u00E9-visualiza\u00E7\u00E3o"});
  Object.assign(localeDict.es,{ant:"M\u00E1s antiguos",popD:"Los comentarios con m\u00E1s likes primero",antD:"Los comentarios m\u00E1s viejos primero",recD:"Los comentarios m\u00E1s nuevos primero",vp:"Vista previa"});
  Object.assign(localeDict.en,{cor:"Loved by"});Object.assign(localeDict.pt,{cor:"Cora\u00E7\u00E3o de"});Object.assign(localeDict.es,{cor:"Coraz\u00F3n de"});
  document.getElementById('txtOrdenar').textContent=T.ord;
  document.getElementById('ordenMenu').innerHTML=[['populares','pop','popD'],['antiguos','ant','antD'],['recientes','rec','recD']].map(([k,t,d])=>`<button type="button" class="orden-opcion${k===appState.orden?' activo':''}" data-orden="${k}" role="menuitemradio" aria-checked="${k===appState.orden}"><span class="orden-opcion-t">${T[t]}</span><span class="orden-opcion-d">${T[d]}</span></button>`).join('');

  /* ===== ORDEN: M\u00E1s recientes / M\u00E1s populares ===== */
  // El ranking de likes se "congela" al elegir el orden, para que los comentarios no salten al dar like.
  // Volver a pulsar el bot\u00F3n activo refresca el ranking.
  const rankLikes=c=>{if(appState.rank[c.id]===undefined)appState.rank[c.id]=c.likes||0;return appState.rank[c.id];};
  const cmpComs=(x,y)=>{
    if(x.anclado&&!y.anclado)return -1;
    if(!x.anclado&&y.anclado)return 1;
    if(appState.orden==='populares'){const dl=rankLikes(y)-rankLikes(x);if(dl)return dl;}
    if(appState.orden==='antiguos')return (x.fecha||0)-(y.fecha||0);
    return (y.fecha||0)-(x.fecha||0);
  };
  function syncOrden(){document.querySelectorAll('.orden-opcion').forEach(b=>{const on=b.dataset.orden===appState.orden;b.classList.toggle('activo',on);b.setAttribute('aria-checked',on);});}
  function cerrarMenuOrden(){document.getElementById('ordenMenu').style.display='none';document.getElementById('btnOrdenMenu').setAttribute('aria-expanded','false');}
  function toggleMenuOrden(){const m=document.getElementById('ordenMenu');const abrir=m.style.display==='none';m.style.display=abrir?'block':'none';document.getElementById('btnOrdenMenu').setAttribute('aria-expanded',abrir);}
  // Cierra los menus (orden / emotes) al hacer clic fuera o pulsar Esc
  document.addEventListener('click',e=>{
    if(!e.target.closest('.orden-wrap'))cerrarMenuOrden();
    if(!e.target.closest('.emote-picker')&&!e.target.closest('.btn-emote'))cerrarEmotes();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){cerrarMenuOrden();cerrarEmotes();}});

  /* ===== ENLACE PERMANENTE (#com_ID / #resp_ID) ===== */
  const permaUrl=frag=>location.origin+location.pathname+location.search+'#'+frag;
  const parseHash=()=>{try{const m=location.hash.match(/^#(?:c-|com_|resp_)(.+)$/);return m?{cod:decodeURIComponent(m[1])}:null;}catch(e){return null;}};
  let hashObj=parseHash();

  /* ===== CODIGOS DE ENLACE (#c-xK7p2): 3 numeros + 1 minuscula + 1 mayuscula, sin caracteres confusos ===== */
  const CODE_DIG='23456789',CODE_MIN='abcdefghijkmnpqrstuvwxyz',CODE_MAY='ABCDEFGHJKLMNPQRSTUVWXYZ';
  function codigosUsados(){
    const s=new Set();
    appState.coms.forEach(c=>{if(c.num)s.add(c.num);if(c.respuestas)Object.values(c.respuestas).forEach(r=>{if(r&&r.num)s.add(r.num);});});
    return s;
  }
  function nuevoCodigo(usados){
    const pick=s=>s[Math.floor(Math.random()*s.length)];
    for(let i=0;i<50;i++){
      const a=[pick(CODE_DIG),pick(CODE_DIG),pick(CODE_DIG),pick(CODE_MIN),pick(CODE_MAY)];
      for(let j=a.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[a[j],a[k]]=[a[k],a[j]];}
      const cod=a.join('');
      if(!usados.has(cod)){usados.add(cod);return cod;}
    }
    return null;
  }
  // Numera los comentarios y respuestas que aun no tienen codigo. Solo lo hace tu cuenta admin (ADMIN_UID), una vez por carga de pagina.
  let codigosAsignados=false;
  function asignarCodigosFaltantes(u){
    const usr=u||appState.usr;
    if(codigosAsignados||!usr||usr.uid!==ADMIN_UID||!appState.coms.length)return;
    const usados=codigosUsados(),upd={};let n=0;
    appState.coms.forEach(c=>{
      if(!c.num){const cod=nuevoCodigo(usados);if(cod){upd[c.id+'/num']=cod;n++;}}
      if(c.respuestas)Object.keys(c.respuestas).forEach(k=>{const r=c.respuestas[k];if(r&&typeof r==='object'&&!r.num){const cod=nuevoCodigo(usados);if(cod){upd[c.id+'/respuestas/'+k+'/num']=cod;n++;}}});
    });
    if(!n)return;
    codigosAsignados=true;
    db.ref('comentarios/'+idDePagina).update(upd).then(()=>console.log('[comentarios] codigos asignados: '+n)).catch(e=>console.warn('[comentarios] no se pudieron asignar codigos:',e.message));
  }
  auth.onAuthStateChanged(u=>{if(u)asignarCodigosFaltantes(u);});
  function destacar(el){
    el.style.transition='background-color .4s,box-shadow .4s';
    el.style.borderRadius='6px';
    el.style.backgroundColor='rgba(88,166,255,.18)';
    el.style.boxShadow='0 0 0 2px rgba(88,166,255,.55)';
    setTimeout(()=>{el.style.backgroundColor='';el.style.boxShadow='';},2800);
  }
  function irAlPermalink(){
    if(!hashObj||!appState.coms.length)return;
    const oculto=x=>!visible(x);
    let padre=null,respId=null;
    for(const c of appState.coms){
      if(c.num===hashObj.cod||c.id===hashObj.cod){padre=c;break;}
      if(c.respuestas){const k=Object.keys(c.respuestas).find(k=>{const r=c.respuestas[k];return r&&(r.num===hashObj.cod||k===hashObj.cod);});if(k){padre=c;respId=k;break;}}
    }
    if(!padre||oculto(padre)||(respId&&oculto(padre.respuestas[respId]))){hashObj=null;return;}
    const idx=appState.coms.indexOf(padre);
    if(idx>=appState.limite){appState.limite=Math.ceil((idx+1)/10)*10;render();return;}
    const card=document.getElementById('com_'+padre.id);
    if(!card)return;
    let target=card;
    if(respId){
      const rEl=document.getElementById('resp_'+respId);
      if(rEl&&rEl.style.display==='none'){const tgl=card.querySelector('.btn-toggle-resp');if(tgl)tgl.click();}
      if(rEl)target=rEl;
    }
    hashObj=null;
    target.scrollIntoView({behavior:'smooth',block:'center'});
    destacar(target);
  }
  function copiarTexto(t){
    const fb=()=>{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;top:0;left:0;opacity:0;';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy');}catch(e){}ta.remove();if(!ok)window.prompt(T.cpl,t);return ok;};
    return (navigator.clipboard&&window.isSecureContext)?navigator.clipboard.writeText(t).then(()=>true,()=>fb()):Promise.resolve(fb());
  }
  window.addEventListener('hashchange',()=>{hashObj=parseHash();irAlPermalink();});

  auth.onAuthStateChanged(u=>{appState.usr=u;DOM.nom.style.display=u?'none':'block';document.getElementById('nombreUsuarioLogueado').style.display='none';document.getElementById('btnGoogle').style.display=u?'none':'flex';document.getElementById('infoUsuario').style.display=u?'flex':'none';if(u){document.getElementById('textoUsuario').textContent=T.l;DOM.avaAct.src=u.photoURL||"/uploads/1/2/7/3/127300461/default-pfp_596.png";}else{DOM.avaAct.src=appState.pfpL||"/uploads/1/2/7/3/127300461/default-pfp_596.png";}});
  document.getElementById('btnGoogle').onclick=()=>auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(e=>alert("Error: "+e.message));document.getElementById('btnSalir').onclick=()=>auth.signOut();
  document.getElementById('avatarUsuarioActual').onclick=()=>!appState.usr&&DOM.inpFile.click();
  DOM.inpFile.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');let s=Math.min(i.width,i.height),x=(i.width-s)/2,y=(i.height-s)/2;let h=i.height>80?80:i.height;let w=i.width>80?80:i.width;c.width=80;c.height=80;c.getContext('2d').drawImage(i,x,y,s,s,0,0,80,80);appState.pfpL=c.toDataURL('image/jpeg',0.95);DOM.avaAct.src=appState.pfpL;localStorage.setItem('savedAvatar',appState.pfpL);};i.src=ev.target.result;};r.readAsDataURL(f);};
  document.getElementById('btnImgMain').onclick=()=>{targetActivoAdjunto='main';inImg.click();};

  /* ===== IM\u00C1GENES ADJUNTAS (selector de archivo y pegar con Ctrl+V) ===== */
  function procesarImagen(f,target){
    if(!f||!/^image\//.test(f.type))return;
    const r=new FileReader();
    r.onload=ev=>{const i=new Image();i.onload=()=>{if(!i.width||!i.height)return;const c=document.createElement('canvas');let h=i.height>256?256:i.height;let w=Math.round((i.width/i.height)*h);c.width=w;c.height=h;c.getContext('2d').drawImage(i,0,0,w,h);let mime=f.type==='image/png'?'image/png':'image/jpeg';let q=mime==='image/jpeg'?0.85:undefined;setPreview(target,c.toDataURL(mime,q));};i.src=ev.target.result;};
    r.readAsDataURL(f);
  }
  inImg.onchange=e=>{const f=e.target.files[0];if(!f)return;procesarImagen(f,targetActivoAdjunto);inImg.value="";};
  function setPreview(target,src){if(target==='main'){appState.imgAdjMain=src;DOM.prevImg.src=src;DOM.prevBox.style.display='block';}else{appState.imgAdjResp[target]=src;const box=document.getElementById('prev-resp-'+target);if(box){box.querySelector('img').src=src;box.style.display='block';}}}
  document.getElementById('btnQuitarAdjunto').onclick=()=>{appState.imgAdjMain=null;DOM.prevBox.style.display='none';};
  // Pegar imagen desde el portapapeles (capturas, "copiar imagen", etc.) en el comentario principal o en una respuesta.
  // Si el portapapeles trae texto, se pega el texto normal (p. ej. al copiar desde Word/Excel).
  document.addEventListener('paste',e=>{
    const ta=e.target;
    if(!ta||ta.tagName!=='TEXTAREA'||!(ta.id==='textoComentario'||ta.classList.contains('input-respuesta')))return;
    const cd=e.clipboardData;if(!cd||!cd.items)return;
    if(cd.getData('text/plain'))return;
    const it=Array.from(cd.items).find(x=>x.kind==='file'&&x.type.indexOf('image/')===0);
    if(!it)return;
    const f=it.getAsFile();if(!f)return;
    e.preventDefault();
    procesarImagen(f,ta.dataset.target);
  });
  function updateBackdrop(ta){
    const tg=ta.dataset.target;const bd=document.getElementById('backdrop-'+tg);if(!bd)return;
    const v=ta.value;if(!v){bd.innerHTML=`<span class="backdrop-placeholder">${tg==='main'?T.c:T.r}</span>`;return;}
    let h=procT(v,true);if(h.endsWith('\n'))h+='<br>';
    bd.innerHTML=h;
  }
  function publicarMsj(t,pId=null,rInput=null){
    t=aTokens(t);
    const cd=localStorage.getItem('floodT');if(cd&&(Date.now()-cd)<30000){alert(`\u23F3 Spam.`);return;}
    let n=appState.usr?(appState.usr.displayName||'Usuario'):(DOM.nom.value.trim()||"Invitado");const uid=appState.usr?appState.usr.uid:null;
    const imgData=pId?appState.imgAdjResp[pId]:appState.imgAdjMain;
    if(t.trim()===""&&!imgData)return;
    const data={nombre:n,texto:t,fecha:firebase.database.ServerValue.TIMESTAMP,foto:appState.usr?appState.usr.photoURL:appState.pfpL,likes:0,shadowbanned:silenciado(uid,n),aprobado:false};
    if(uid)data.uid=uid;
    if(imgData)data.imagenAdjunta=imgData;const num=nuevoCodigo(codigosUsados());if(num)data.num=num;
    db.ref(pId?`comentarios/${idDePagina}/${pId}/respuestas`:`comentarios/${idDePagina}`).push(data).then(()=>{
      localStorage.setItem('floodT',Date.now());
      const mE=document.getElementById('msgExito');mE.textContent="\u2705 "+T.s;mE.style.display='block';setTimeout(()=>mE.style.display='none',5000);
      if(!pId){DOM.txt.value="";DOM.txt.style.height='42px';updateBackdrop(DOM.txt);appState.imgAdjMain=null;DOM.prevBox.style.display='none';}
      else{if(rInput){rInput.value="";rInput.style.height='42px';updateBackdrop(rInput);}appState.imgAdjResp[pId]=null;const box=document.getElementById('prev-resp-'+pId);if(box)box.style.display='none';}
    });
  }
  DOM.btnEnv.onclick=()=>publicarMsj(DOM.txt.value);
  function updateUniqueUsers(){
    const map={};
    appState.coms.forEach(c=>{
        if(c.nombre)map[c.nombre]=c.foto||'/uploads/1/2/7/3/127300461/default-pfp_596.png';
        if(c.respuestas){
            Object.values(c.respuestas).forEach(r=>{
                if(r.nombre)map[r.nombre]=r.foto||'/uploads/1/2/7/3/127300461/default-pfp_596.png';
            });
        }
    });
    uniqueUsers=Object.keys(map).map(k=>({nombre:k,foto:map[k]}));
  }
  db.ref('insignias').on('value',s=>{appState.insig=s.val()||{};if(appState.coms.length)render();});
  db.ref('shadowbans').on('value',s=>{appState.shadow=s.val()||{};if(appState.coms.length)render();});
  const syD=(c,a,pref,iF,cF,hF,t='div')=>{if(!a.length)return 0;let I=new Set();a.forEach(x=>{let id=pref+iF(x);let el=document.getElementById(id);let ht=hF(x);let cl=cF(x);I.add(id);if(!el){el=document.createElement(t);el.id=id;if(cl)el.className=cl;el.innerHTML=ht;el.dataset.h=ht;c.appendChild(el);}else{if(cl&&el.className!==cl){el.className=cl;}if(el.dataset.h!==ht){el.innerHTML=ht;el.dataset.h=ht;}}});[...c.children].forEach(n=>{if(!I.has(n.id))n.remove();});let dN=[...c.children];a.forEach((x,j)=>{let id=pref+iF(x);if(dN[j]&&dN[j].id!==id){c.insertBefore(document.getElementById(id),c.children[j]);dN=[...c.children];}});return 1;};
  const czH=o=>o&&o.corazon?'h'+(typeof o.corazon==='object'?(o.corazon.nombre||'')+'|'+(o.corazon.foto||''):'1'):'';
  const genHash=(arr)=>arr.map(c=>c.id+(c.num||'')+(c.nombre||'')+(c.foto||'')+c.aprobado+(c.anclado||false)+czH(c)+(c.respuestas?Object.keys(c.respuestas).map(k=>k+(c.respuestas[k].num||'')+c.respuestas[k].aprobado+czH(c.respuestas[k])).join(''):'')).join('|');
  db.ref('comentarios/'+idDePagina).on('value',s=>{
      let nC=[];s.forEach(c=>{const d=c.val();if(typeof d==='object'&&d!==null)nC.push({...d,id:c.key});});
      nC.sort(cmpComs);
      let soloLikes = (appState.coms.length>0&&genHash(appState.coms)===genHash(nC));
      appState.coms=nC;updateUniqueUsers();setTimeout(asignarCodigosFaltantes,0);
      if(soloLikes){
          nC.forEach(c=>{
              let lBtn=document.querySelector(`.btn-corazon[data-id="${CSS.escape(String(c.id))}"]:not([data-pid]) .contador-likes`);
              if(lBtn&&c.likes!==undefined)lBtn.textContent=c.likes;
              if(c.respuestas){Object.keys(c.respuestas).forEach(k=>{let rBtn=document.querySelector(`.btn-corazon[data-id="${CSS.escape(String(k))}"][data-pid="${CSS.escape(String(c.id))}"] .contador-likes`);if(rBtn&&c.respuestas[k].likes!==undefined)rBtn.textContent=c.respuestas[k].likes;});}
          });
      }else{render();}
  });

  /* ===== MENCIONES: dropdown con teclado (\u2191 \u2193 Enter/Tab/Esc) ===== */
  function marcarMencion(scroll=true){
    const items=mBox.querySelectorAll('.mention-item');
    items.forEach((el,i)=>el.classList.toggle('activo',i===mentionIdx));
    const el=items[mentionIdx];
    if(scroll&&el){const t=el.offsetTop,b=t+el.offsetHeight;if(t<mBox.scrollTop)mBox.scrollTop=t;else if(b>mBox.scrollTop+mBox.clientHeight)mBox.scrollTop=b-mBox.clientHeight;}
  }
  function elegirMencion(name){
    if(!activeTextarea)return;
    const val=activeTextarea.value;
    const before=val.substring(0,mentionStartIndex);const after=val.substring(activeTextarea.selectionStart);
    const insertText=`@${name} `;activeTextarea.value=before+insertText+after;
    mBox.style.display='none';activeTextarea.focus();
    const newPos=mentionStartIndex+insertText.length;activeTextarea.setSelectionRange(newPos,newPos);
    activeTextarea.style.height='auto';activeTextarea.style.height=(activeTextarea.scrollHeight)+'px';updateBackdrop(activeTextarea);
  }
  mBox.addEventListener('mouseover',e=>{const it=e.target.closest('.mention-item');if(!it)return;const i=Array.prototype.indexOf.call(mBox.children,it);if(i>-1&&i!==mentionIdx){mentionIdx=i;marcarMencion(false);}});
  document.addEventListener('keydown',e=>{
    if(!mBox||mBox.style.display!=='flex'||e.target!==activeTextarea||e.isComposing)return;
    const n=mBox.querySelectorAll('.mention-item').length;if(!n)return;
    if(e.key==='ArrowDown'){e.preventDefault();mentionIdx=(mentionIdx+1)%n;marcarMencion();}
    else if(e.key==='ArrowUp'){e.preventDefault();mentionIdx=(mentionIdx-1+n)%n;marcarMencion();}
    else if((e.key==='Enter'||e.key==='Tab')&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();const it=mBox.querySelectorAll('.mention-item')[mentionIdx];if(it)elegirMencion(it.dataset.name);}
    else if(e.key==='Escape'){e.preventDefault();mBox.style.display='none';}
    else if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='Home'||e.key==='End'){mBox.style.display='none';}
  });
  document.addEventListener('input',e=>{
    if(e.target.tagName==='TEXTAREA'&&(e.target.id==='textoComentario'||e.target.classList.contains('input-respuesta'))){
        autoEmotes(e);e.target.style.height='auto';e.target.style.height=(e.target.scrollHeight)+'px';updateBackdrop(e.target);
        activeTextarea=e.target;const val=activeTextarea.value;const cursor=activeTextarea.selectionStart;
        const textBeforeCursor=val.substring(0,cursor);const match=textBeforeCursor.match(/(?:^|\s)@([^@\n]*)$/);
        if(match&&match[1].length<30){
            const searchStr=match[1].toLowerCase();mentionStartIndex=cursor-searchStr.length-1;
            const filtered=uniqueUsers.filter(u=>u.nombre.toLowerCase().includes(searchStr));
            if(filtered.length>0){
                mBox.innerHTML=filtered.map(u=>`<div class="mention-item" data-name="${esc(u.nombre)}"><img src="${esc(urlOk(u.foto))}" class="mention-avatar" loading="lazy" decoding="async"><span class="mention-name">${esc(u.nombre)}</span></div>`).join('');
                const rect=activeTextarea.getBoundingClientRect();
mBox.style.display='flex';
mBox.style.top=(rect.top-mBox.offsetHeight-5>0 ? rect.top+window.scrollY-mBox.offsetHeight-5 : rect.bottom+window.scrollY+5)+'px';
mBox.style.left=(rect.left+window.scrollX)+'px';
mBox.scrollTop=0;mentionIdx=0;marcarMencion(false);
            }else{mBox.style.display='none';}
        }else{mBox.style.display='none';}
    }
  });
  document.addEventListener('click',e=>{
    if(!mBox)return;
    const item=e.target.closest('.mention-item');
    if(item&&activeTextarea){
        elegirMencion(item.dataset.name);
    }else if(!e.target.closest('#mentionsDropdown')&&e.target.tagName!=='TEXTAREA'){mBox.style.display='none';}
  });
  document.getElementById('caja-comentarios').addEventListener('click',e=>{
    const sp=e.target.closest('.spoiler');if(sp){sp.classList.toggle('visto');return;}
    // Clic en la fecha = enlace permanente (sin salto brusco del navegador)
    const lnk=e.target.closest('a.enlace-permanente');
    if(lnk){
      if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
      e.preventDefault();
      try{history.replaceState(null,'',lnk.getAttribute('href'));}catch(err){}
      hashObj=parseHash();irAlPermalink();return;
    }
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
    }else if(btn.classList.contains('btn-enlace')){
      const url=permaUrl('c-'+btn.dataset.cod);
      copiarTexto(url).then(ok=>{if(!ok)return;const o=btn.innerHTML;btn.innerHTML='&#x2705; '+T.cpd;setTimeout(()=>{if(btn.isConnected)btn.innerHTML=o;},1800);});
    }else if(btn.id==='btnOrdenMenu'){
      toggleMenuOrden();
    }else if(btn.classList.contains('orden-opcion')){
      appState.orden=btn.dataset.orden;appState.rank=Object.create(null);appState.limite=10;syncOrden();cerrarMenuOrden();render();
    }else if(btn.dataset.action==='emote'){
      abrirEmotes(btn);
    }else if(btn.dataset.action==='img'){
      targetActivoAdjunto=id;inImg.click();
    }else if(btn.dataset.action==='quitar-adj'){
      appState.imgAdjResp[id]=null;document.getElementById('prev-resp-'+id).style.display='none';
    }else if(btn.classList.contains('btn-cargar-mas')){
      appState.limite+=10;render();
    }else if(btn.classList.contains('btn-toggle-resp')){
      const st=btn.dataset.state;const tot=parseInt(btn.dataset.total);const allR=document.querySelectorAll(`.resp-item-${CSS.escape(String(id))}`);
      if(st==='partial'||st==='none'){allR.forEach(el=>{el.style.display='flex';el.classList.add('anim-resp');});btn.dataset.state='all';btn.innerHTML=`&#x21B3; Ocultar respuestas`;}
      else{allR.forEach(el=>{el.style.display='none';el.classList.remove('anim-resp');});btn.dataset.state='none';btn.innerHTML=`&#x21B3; Ver ${tot} respuesta${tot>1?'s':''}`;}
    }
  });
  /* ===== EMOTES + FORMATO EN VIVO (estilo Discord) ===== */
  const esCaja=el=>!!el&&el.tagName==='TEXTAREA'&&(el.id==='textoComentario'||el.classList.contains('input-respuesta'));
  function hasEmote(n){return Object.prototype.hasOwnProperty.call(EMOTES,n);}
  function emoteHTML(n){const v=EMOTES[n];return esImg(v)?`<img class="emote" src="${v}" alt=":${n}:" title=":${n}:" loading="lazy" decoding="async">`:`<span class="emote-txt" title=":${n}:">${v}</span>`;}
  const EMO_CHR=n=>String.fromCharCode(0xE000+EMO_IDX[n]);
  try{if(document.fonts&&document.fonts.load)document.fonts.load('14px MBEmo','\uE000').catch(()=>{});}catch(err){}   // precarga la fuente que da su ancho a los emotes
  // :nombre: <-> caracter reservado (el comentario se guarda siempre con :nombre:)
  function aTokens(s){return s.replace(/[-]/g,c=>{const n=EMO_KEYS[c.charCodeAt(0)-0xE000];return n?':'+n+':':'';});}
  function convertirEmotes(s){return EMO_KEYS.length?s.replace(/:([a-zA-Z0-9_]{1,24}):/g,(m,n)=>{n=n.toLowerCase();return EMO_IDX[n]!==undefined?EMO_CHR(n):m;}):s;}
  // Reemplaza un trozo del textarea conservando el historial de deshacer (Ctrl+Z)
  function reemplazar(ta,ini,fin,txt){
    ta.focus();ta.setSelectionRange(ini,fin);
    const esperado=ta.value.slice(0,ini)+txt+ta.value.slice(fin);
    let ok=false;try{ok=document.execCommand('insertText',false,txt);}catch(err){}
    if(!ok||ta.value!==esperado){ta.value=esperado;ta.dispatchEvent(new Event('input',{bubbles:true}));}
    const p=ini+txt.length;ta.setSelectionRange(p,p);
  }
  function insertarEnTextarea(ta,txt){reemplazar(ta,ta.selectionStart,ta.selectionEnd,txt);}
  let emoteBox=null,emoteTA=null,emoteKey='';
  function cerrarEmotes(){if(emoteBox)emoteBox.style.display='none';}
  function abrirEmotes(btn){
    const key=(btn.dataset.target||'')+(btn.dataset.id||'');
    if(emoteBox&&emoteBox.style.display==='grid'&&emoteKey===key){cerrarEmotes();return;}
    if(!emoteBox){
      emoteBox=document.createElement('div');emoteBox.className='emote-picker';document.body.appendChild(emoteBox);
      emoteBox.addEventListener('click',e=>{const it=e.target.closest('.emote-item');if(it&&emoteTA){const n=it.dataset.n;insertarEnTextarea(emoteTA,(EMO_IDX[n]!==undefined?EMO_CHR(n):':'+n+':')+' ');cerrarEmotes();}});
    }
    const ks=Object.keys(EMOTES);
    emoteBox.innerHTML=ks.length?ks.map(n=>`<button type="button" class="emote-item" data-n="${n}" title=":${n}:">${emoteHTML(n)}</button>`).join(''):'<span style="grid-column:1/-1;color:#8b949e;font-size:13px;">Sin emotes</span>';
    emoteKey=key;emoteTA=btn.dataset.target==='main'?DOM.txt:document.getElementById('input-resp-'+btn.dataset.id);
    emoteBox.style.display='grid';
    const r=btn.getBoundingClientRect(),h=emoteBox.offsetHeight,abajo=window.innerHeight-r.bottom>h+12;
    emoteBox.style.top=(abajo?r.bottom+window.scrollY+6:r.top+window.scrollY-h-6)+'px';
    emoteBox.style.left=Math.max(8,Math.min(r.right+window.scrollX-280,window.scrollX+document.documentElement.clientWidth-288))+'px';
  }
  // Si escribes :nombre: (o pegas texto con :nombre:) se convierte solo en el emote
  let convirtiendo=false;
  function autoEmotes(e){
    const ta=e.target;
    if(convirtiendo||e.isComposing||!EMO_KEYS.length||ta.value.indexOf(':')<0)return;
    const it=e.inputType||'';
    if(it==='insertFromPaste'||it==='insertFromDrop'||it==='insertReplacementText'){
      const v=ta.value,n=convertirEmotes(v);
      if(n!==v){const p=ta.selectionStart;ta.value=n;const q=convertirEmotes(v.slice(0,p)).length;ta.setSelectionRange(q,q);}
    }else if(!/^(delete|history)/.test(it)&&ta.value.charAt(ta.selectionStart-1)===':'){   // (al deshacer/borrar no se vuelve a convertir)
      const p=ta.selectionStart,m=ta.value.slice(Math.max(0,p-26),p).match(/:([a-zA-Z0-9_]{1,24}):$/);
      if(m&&EMO_IDX[m[1].toLowerCase()]!==undefined){convirtiendo=true;try{reemplazar(ta,p-m[0].length,p,EMO_CHR(m[1].toLowerCase()));}finally{convirtiendo=false;}}
    }
  }
  // Al copiar o cortar, los emotes salen como :nombre: (no como el caracter reservado)
  function copiarCaja(e){
    const ta=e.target;if(!esCaja(ta)||!e.clipboardData)return;
    const sel=ta.value.slice(ta.selectionStart,ta.selectionEnd);
    if(!/[-]/.test(sel))return;
    e.clipboardData.setData('text/plain',aTokens(sel));e.preventDefault();
    if(e.type==='cut'){try{document.execCommand('delete');}catch(err){}}
  }
  document.addEventListener('copy',copiarCaja);document.addEventListener('cut',copiarCaja);

  // Formato:  **negrita**  *cursiva* o _cursiva_  __subrayado__  ~~tachado~~  `codigo`  ||spoiler||  > cita  y emotes :nombre:
  //   procT(texto)       -> HTML del comentario publicado
  //   procT(texto,true)  -> HTML de la caja de escribir: el texto queda IDENTICO (los marcadores solo se ven mas oscuros) y cambia unicamente el estilo
  function procT(t,live){
    t=String(t==null?'':t);
    let safe=t.replace(/[\u0001\u0002]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const guard=[],keep=h=>'\u0001'+(guard.push(h)-1)+'\u0002';
    const mk=s=>'<span class="mk">'+s+'</span>';
    const W=(m,c,tag,cls)=>live?keep(mk(m)+'<span class="'+cls+'">')+c+keep('</span>'+mk(m)):keep('<'+tag+'>')+c+keep('</'+tag.split(' ')[0]+'>');
    safe=safe.split('\n').map((ln,i,a)=>{
      const q=ln.match(/^&gt; (.*)$/),fin=i<a.length-1?'\n':'';
      if(!q)return ln+fin;
      return live?keep(mk('&gt; ')+'<span class="f-q">')+q[1]+keep('</span>')+fin:keep('<span class="cita">')+q[1]+keep('</span>');
    }).join('');
    safe=safe.replace(/`([^`\n\u0001\u0002]+)`/g,(m,c)=>keep(live?mk('`')+'<span class="f-code">'+c+'</span>'+mk('`'):'<code>'+c+'</code>'));
    if(!live)safe=safe.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,(m,id)=>keep('<div style="margin:10px 0; max-width:378px;"><div style="border-radius:8px;overflow:hidden;position:relative;padding-bottom:56.25%;"><iframe src="https://www.youtube.com/embed/'+id+'" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe></div></div>'));
    safe=safe.replace(/(https?:\/\/[^\s<"'\u0001\u0002]+)/g,url=>keep(live?'<span class="f-url">'+url+'</span>':'<a href="'+url+'" target="_blank">'+url+'</a>'));
    uniqueUsers.forEach(u=>{const nE=String(u.nombre).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');const eN=nE.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&');const reg=new RegExp(`(^|\\s)@${eN}(?=\\s|$)`,'g');safe=safe.replace(reg,(m,pre)=>pre+keep('<span class="mention-text">@'+nE+'</span>'));});
    if(live)safe=safe.replace(/[-]/g,c=>{const i=c.charCodeAt(0)-0xE000;return EMO_KEYS[i]?keep('<span class="em" data-e="'+i+'">'+c+'</span>'):c;});
    else safe=safe.replace(/:([a-zA-Z0-9_]{1,24}):/g,(m,n)=>hasEmote(n.toLowerCase())?keep(emoteHTML(n.toLowerCase())):m);
    safe=safe
      .replace(/\*\*([^\s*](?:.*?[^\s*])?)\*\*/g,(m,c)=>W('**',c,'strong','f-b'))
      .replace(/(^|[\s(\u0002|~*])__(\S(?:.*?\S)?)__(?=[\s.,;:!?)\u0001|~*]|$)/g,(m,p,c)=>p+W('__',c,'u','f-u'))
      .replace(/(^|[\s(\u0002|~])\*(\S(?:.*?\S)?)\*(?=[\s.,;:!?)\u0001|~]|$)/g,(m,p,c)=>p+W('*',c,'em','f-i'))
      .replace(/(^|[\s(\u0002|~])_(\S(?:.*?\S)?)_(?=[\s.,;:!?)\u0001|~]|$)/g,(m,p,c)=>p+W('_',c,'em','f-i'))
      .replace(/~~(\S(?:.*?\S)?)~~/g,(m,c)=>W('~~',c,'del','f-s'))
      .replace(/\|\|(\S(?:.*?\S)?)\|\|/g,(m,c)=>W('||',c,'span class="spoiler"','f-sp'));
    return safe.replace(/\u0001(\d+)\u0002/g,(m,i)=>guard[i]);
  }

  // La cursiva real solo se usa si en este navegador no cambia el ancho de las letras (si cambia, el cursor se desalinea): si no, la cursiva se ve como un color
  try{
    const bd=document.getElementById('backdrop-main'),sp=document.createElement('span');
    sp.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;';sp.textContent='abcdefghijklmn\u00F1opqrstuvwxyz \u00E1\u00E9\u00ED\u00F3\u00FA ABCDEFGHIJKLMN\u00D1OPQRSTUVWXYZ 0123456789 .,;:!?()';bd.appendChild(sp);
    const a=sp.getBoundingClientRect().width;sp.style.fontStyle='italic';const b=sp.getBoundingClientRect().width;sp.remove();
    if(a&&Math.abs(a-b)/a<0.0005)widgetBox.classList.add('italic-ok');
  }catch(err){}

  /* --- Botones de formato: aplicar / quitar marcadores sobre la seleccion --- */
  const FMT={b:'**',i:'*',u:'__',s:'~~',c:'`',e:'||'};
  const runIzq=(s,ch)=>{let n=0;while(n<s.length&&s[n]===ch)n++;return n;};
  const runDer=(s,ch)=>{let n=0;while(n<s.length&&s[s.length-1-n]===ch)n++;return n;};
  const yaTiene=(k,l,r)=>k==='i'?(l%2===1&&r%2===1):(l>=FMT[k].length&&r>=FMT[k].length);
  function aplicarFmt(ta,k){
    if(!esCaja(ta))return;
    const v=ta.value,a=ta.selectionStart,b=ta.selectionEnd;
    if(k==='q')return alternarCita(ta,v,a,b);
    const m=FMT[k],ch=m[0],n=m.length,sel=v.slice(a,b);
    if(a===b){reemplazar(ta,a,a,m+m);ta.setSelectionRange(a+n,a+n);progBarra();return;}
    let ini=a,fin=b,nuevo,s0,s1;
    if(sel.length>=2*n&&yaTiene(k,runIzq(sel,ch),runDer(sel,ch))){          // la seleccion ya incluye los marcadores: quitarlos
      nuevo=sel.slice(n,sel.length-n);s0=ini;s1=ini+nuevo.length;
    }else if(yaTiene(k,runDer(v.slice(0,a),ch),runIzq(v.slice(b),ch))){     // los marcadores estan justo afuera: quitarlos
      ini=a-n;fin=b+n;nuevo=sel;s0=ini;s1=ini+nuevo.length;
    }else{                                                                  // ponerlos (los espacios de los bordes quedan fuera)
      const m1=sel.match(/^\s*/)[0].length,m2=sel.match(/\s*$/)[0].length,core=sel.slice(m1,sel.length-m2);
      if(!core)return;
      nuevo=sel.slice(0,m1)+m+core+m+sel.slice(sel.length-m2);s0=ini+m1+n;s1=s0+core.length;
    }
    reemplazar(ta,ini,fin,nuevo);ta.setSelectionRange(s0,s1);progBarra();
  }
  function alternarCita(ta,v,a,b){
    if(b>a&&v[b-1]==='\n')b--;
    const ls=a===0?0:v.lastIndexOf('\n',a-1)+1;
    let le=v.indexOf('\n',b);if(le<0)le=v.length;
    const lineas=v.slice(ls,le).split('\n'),todas=lineas.every(l=>l.startsWith('> '));
    const nuevo=lineas.map(l=>todas?l.slice(2):'> '+l).join('\n');
    reemplazar(ta,ls,le,nuevo);ta.setSelectionRange(ls,ls+nuevo.length);progBarra();
  }
  document.addEventListener('keydown',e=>{
    if(!esCaja(e.target)||e.isComposing||!(e.ctrlKey||e.metaKey)||e.altKey||e.shiftKey)return;
    const k=(e.key||'').toLowerCase();
    if(k==='b'||k==='i'||k==='u'){e.preventDefault();aplicarFmt(e.target,k);}
  });

  /* --- Barra flotante al seleccionar texto (como Discord) --- */
  const TT=L==='en'?{b:'Bold (Ctrl+B)',i:'Italic (Ctrl+I)',u:'Underline (Ctrl+U)',s:'Strikethrough',q:'Quote',c:'Code',e:'Spoiler'}:L==='pt'?{b:'Negrito (Ctrl+B)',i:'Itálico (Ctrl+I)',u:'Sublinhado (Ctrl+U)',s:'Tachado',q:'Citação',c:'Código',e:'Spoiler'}:{b:'Negrita (Ctrl+B)',i:'Cursiva (Ctrl+I)',u:'Subrayado (Ctrl+U)',s:'Tachado',q:'Cita',c:'Código',e:'Spoiler'};
  const ico=d=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+d+'"/></svg>';
  const BTNS_FMT=[['b','<b>B</b>'],['i','<i>I</i>'],['u','<u>U</u>'],['s','<s>S</s>'],0,
    ['q',ico('M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z')],
    ['c',ico('M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z')],
    ['e',ico('M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z')]];
  let barra=null,barraTA=null,barraRaf=0;
  function crearBarra(){
    barra=document.createElement('div');barra.className='barra-fmt';barra.setAttribute('role','toolbar');
    barra.innerHTML=BTNS_FMT.map(x=>x?`<button type="button" data-f="${x[0]}" title="${TT[x[0]]}" aria-label="${TT[x[0]]}">${x[1]}</button>`:'<span class="fmt-sep"></span>').join('');
    barra.addEventListener('mousedown',e=>e.preventDefault());   // no le quita el foco (ni la seleccion) al textarea
    barra.addEventListener('click',e=>{const bt=e.target.closest('button');if(bt&&barraTA)aplicarFmt(barraTA,bt.dataset.f);});
    document.body.appendChild(barra);
  }
  function ocultarBarra(){if(barra)barra.style.display='none';barraTA=null;}
  // Posicion de la seleccion: el backdrop tiene exactamente el mismo texto y las mismas medidas que el textarea
  function rectSeleccion(ta){
    const bd=document.getElementById('backdrop-'+ta.dataset.target);if(!bd)return null;
    const a=ta.selectionStart,b=ta.selectionEnd,w=document.createTreeWalker(bd,NodeFilter.SHOW_TEXT);
    let nd,acc=0,sN=null,sO=0,eN=null,eO=0;
    while((nd=w.nextNode())){
      const len=nd.nodeValue.length;
      if(!sN&&a<acc+len){sN=nd;sO=a-acc;}
      if(sN&&b<=acc+len){eN=nd;eO=b-acc;break;}
      acc+=len;
    }
    if(!sN||!eN)return null;
    const r=document.createRange();r.setStart(sN,sO);r.setEnd(eN,eO);
    const rs=r.getClientRects();const x=rs.length?rs[0]:r.getBoundingClientRect();
    return x&&(x.width||x.height)?x:null;
  }
  function actualizarBarra(){
    const ta=document.activeElement;
    if(!esCaja(ta)||ta.selectionStart===ta.selectionEnd){ocultarBarra();return;}
    const r=rectSeleccion(ta);if(!r){ocultarBarra();return;}
    if(!barra)crearBarra();
    barraTA=ta;barra.style.display='flex';
    const w=barra.offsetWidth,h=barra.offsetHeight,vw=document.documentElement.clientWidth;
    let top=r.top-h-8;if(top<4)top=r.bottom+8;
    const left=Math.max(4,Math.min(r.left+r.width/2-w/2,vw-w-4));
    barra.style.top=(top+window.scrollY)+'px';barra.style.left=(left+window.scrollX)+'px';
  }
  function progBarra(){cancelAnimationFrame(barraRaf);barraRaf=requestAnimationFrame(actualizarBarra);}
  ['mouseup','keyup','select','input','focusout','selectionchange'].forEach(ev=>document.addEventListener(ev,progBarra));
  window.addEventListener('resize',ocultarBarra);
  function calculaT(f){
    const s=Math.floor((Date.now()-f)/1000);
    const d=new Date(f);
    let mE=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    let dia=d.getDate(),mes=mE[d.getMonth()],anio=d.getFullYear();let tF=`${dia} de ${mes} de ${anio}`;
    if(L==='es'){const ft=(v,u)=>`hace ${v} ${u}${v>1?(u==='mes'?'es':'s'):''}`;return s>=31536000?`<span title="${tF}">${ft(Math.floor(s/31536000),"a\u00F1o")}</span>`:s>=2592000?`<span title="${tF}">${ft(Math.floor(s/2592000),"mes")}</span>`:s>=86400?`<span title="${tF}">${ft(Math.floor(s/86400),"d\u00EDa")}</span>`:s>=3600?`<span title="${tF}">${ft(Math.floor(s/3600),"hora")}</span>`:s>=60?`<span title="${tF}">${ft(Math.floor(s/60),"minuto")}</span>`:`<span title="${tF}">Justo ahora</span>`;}
    else if(L==='en'){const ft=(v,u)=>`${v} ${u}${v>1?'s':''} ago`;return s>=31536000?`<span title="${tF}">${ft(Math.floor(s/31536000),"year")}</span>`:s>=2592000?`<span title="${tF}">${ft(Math.floor(s/2592000),"month")}</span>`:s>=86400?`<span title="${tF}">${ft(Math.floor(s/86400),"day")}</span>`:s>=3600?`<span title="${tF}">${ft(Math.floor(s/3600),"hour")}</span>`:s>=60?`<span title="${tF}">${ft(Math.floor(s/60),"minuto")}</span>`:`<span title="${tF}">Just now</span>`;}
    else{const ft=(v,u)=>`${v} ${u}${v>1?'s':''} atr\u00E1s`;return s>=31536000?`<span title="${tF}">${ft(Math.floor(s/31536000),"ano")}</span>`:s>=2592000?`<span title="${tF}">${ft(Math.floor(s/2592000),"m\u00EAs")}</span>`:s>=86400?`<span title="${tF}">${ft(Math.floor(s/86400),"dia")}</span>`:s>=3600?`<span title="${tF}">${ft(Math.floor(s/3600),"hora")}</span>`:s>=60?`<span title="${tF}">${ft(Math.floor(s/60),"minuto")}</span>`:`<span title="${tF}">Agora mesmo</span>`;}
  }
  /* ===== CORAZON DEL CREADOR ===== */
  // Lo da un creador desde el Studio y se guarda en  comentarios/<pagina>/<comentario>[/respuestas/<respuesta>]/corazon  como {nombre,foto,fecha}.
  // Se ve como un avatar chiquito con un corazon rojo, junto al boton de like. Al pasar el mouse dice "Corazon de <creador>".
  const corChip=x=>{const h=x&&x.corazon;if(!h)return '';const o=typeof h==='object'?h:{};const nm=String(o.nombre||'Creador');return `<span class="cor-creador" title="${esc(T.cor)} ${esc(nm)}" aria-label="${esc(T.cor)} ${esc(nm)}"><span class="cor-av"><img src="${esc(urlOk(o.foto))}" alt="" loading="lazy" decoding="async"><i></i></span></span>`;};
  function render(){
    let cTotal=0;
    appState.coms.forEach(c=>{if(visible(c)){cTotal++;if(c.respuestas){Object.values(c.respuestas).forEach(r=>{if(visible(r))cTotal++;});}}});
    DOM.txtTit.textContent=`${cTotal} ${cTotal===1?T.t1:T.t}`;
    appState.coms.sort(cmpComs);
    const arr=appState.coms.slice(0,appState.limite);const ahora=Date.now();
    const badge=`<img src="/uploads/1/2/7/3/127300461/featured-user-icon_orig.png" class="badge-img" loading="lazy" decoding="async">`;
    if(!syD(DOM.lista,arr,'com_',c=>c.id,c=>`comentario-individual ${c.anclado?'es-anclado':''}`,d=>{
      if(!visible(d))return '';
      const ID=esc(d.id),nom=d.nombre||'Usuario';
      const bI=estrella(d)?badge:'';
      const l=localStorage.getItem('liked_'+d.id);
      let isExp=false;let tBtn=document.querySelector(`.btn-toggle-resp[data-id="${CSS.escape(String(d.id))}"]`);if(tBtn&&tBtn.dataset.state==='all')isExp=true;
      const imgP=urlOk(d.imagenAdjunta,'');
      let html=`<div class="avatar"><img src="${esc(urlOk(d.foto))}" loading="lazy" decoding="async"></div><div class="comentario-contenido"><div class="cabecera-comentario"><span class="comentario-nombre">${esc(nom)}${bI} ${d.anclado?`<span class="badge-anclado">&#x1F4CC; ${T.p}</span>`:''}</span><a class="comentario-fecha enlace-permanente" href="${esc(permaUrl('c-'+(d.num||d.id)))}">${calculaT(Number(d.fecha)||ahora)}</a></div><p class="comentario-texto">${procT(d.texto)}</p>${imgP?`<img src="${esc(imgP)}" class="img-adjunta" loading="lazy" decoding="async">`:''}<div class="acciones-comentario"><button class="btn-accion btn-corazon ${l?'likeado':''}" data-id="${ID}"><span class="corazon-icono"></span><span class="contador-likes">${Number(d.likes)||0}</span></button>${corChip(d)}<button class="btn-accion btn-responder" data-id="${ID}" data-replyuser="${esc(nom)}">${T.b}</button><button class="btn-accion btn-enlace" data-cod="${esc(d.num||d.id)}" title="${T.cpl}">&#x1F517; ${T.lnk}</button></div><div class="caja-respuestas ${d.respuestas&&Object.keys(d.respuestas).length>0?'con-hilo':''}">`;
      if(d.respuestas){
        const vK=Object.keys(d.respuestas).filter(k=>visible(d.respuestas[k]));
        html+=vK.map((k,idx)=>{
          const r=d.respuestas[k];const rn=r.nombre||'Usuario';const rl=localStorage.getItem(`liked_${d.id}_${k}`);const K=esc(k);
          let eS=(idx>0&&!isExp)?`style="display:none;"`:(idx>0&&isExp)?`style="display:flex;"`:'';
          const imgR=urlOk(r.imagenAdjunta,'');
          return `<div class="respuesta-individual resp-item-${ID}" id="resp_${K}" ${eS}><div class="avatar"><img src="${esc(urlOk(r.foto))}" loading="lazy" decoding="async"></div><div><div class="cabecera-comentario"><span class="comentario-nombre">${esc(rn)}${estrella(r)?badge:''}</span><a class="comentario-fecha enlace-permanente" href="${esc(permaUrl('c-'+(r.num||k)))}">${calculaT(Number(r.fecha)||ahora)}</a></div><p class="comentario-texto">${procT(r.texto)}</p>${imgR?`<img src="${esc(imgR)}" class="img-adjunta" loading="lazy" decoding="async">`:''}<div class="acciones-comentario" style="margin-top: 5px; margin-bottom: 0px;"><button class="btn-accion btn-corazon ${rl?'likeado':''}" data-id="${K}" data-pid="${ID}"><span class="corazon-icono"></span><span class="contador-likes">${Number(r.likes)||0}</span></button>${corChip(r)}<button class="btn-accion btn-responder" data-id="${ID}" data-replyuser="${esc(rn)}">${T.b}</button><button class="btn-accion btn-enlace" data-cod="${esc(r.num||k)}" title="${T.cpl}">&#x1F517; ${T.lnk}</button></div></div></div>`;
        }).join('');
        if(vK.length>1){
            const extC=vK.length-1;
            let txt=isExp?`&#x21B3; Ocultar respuestas`:`&#x21B3; Ver ${extC} respuesta${extC>1?'s':''} más`;
            let st=isExp?'all':'partial';
            html+=`<div style="margin-left:46px; margin-top:10px;"><button class="btn-accion btn-toggle-resp" data-id="${ID}" data-state="${st}" data-total="${vK.length}" style="color:#f1f1f1; font-weight:bold;">${txt}</button></div>`;
        }
      }
      return html+`</div><div class="zona-formulario-respuesta" id="form-resp-${ID}" style="display:none;"><div class="formulario-respuesta"><div class="avatar" style="width:30px;height:30px;flex-shrink:0;"><img src="${esc(DOM.avaAct.src)}" loading="lazy" decoding="async"></div><div class="input-contenedor"><div class="input-backdrop" id="backdrop-${ID}"><span class="backdrop-placeholder">${T.r}</span></div><textarea id="input-resp-${ID}" class="input-respuesta textarea-transparente" data-target="${ID}" rows="1"></textarea></div><button class="btn-attach btn-emote" data-action="emote" data-id="${ID}" title="Emotes">&#x1F600;</button><button class="btn-attach" data-action="img" data-id="${ID}" title="Adjuntar Foto">&#x1F5BC;&#xFE0F;</button><button class="btn-enviar-respuesta btn-send-whatsapp-small" data-id="${ID}"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button></div><div class="preview-adjunto" id="prev-resp-${ID}" style="margin-left:46px;"><img src=""><button class="btn-quitar-adjunto" data-action="quitar-adj" data-id="${ID}">X</button></div></div></div>`;
    })){DOM.lista.innerHTML='';}
    const btnC=document.getElementById('btnCargarMasContainer');
    if(appState.limite<appState.coms.length){btnC.style.display='block';btnC.innerHTML=`<button class="btn-cargar-mas" data-action="more">${T.m}</button>`;}
    else{btnC.style.display='none';}
    irAlPermalink();
  }
})();