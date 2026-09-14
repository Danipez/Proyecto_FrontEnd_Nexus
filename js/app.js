"use strict";
const SEED = [{"id": 1, "code": "GPU-001", "name": "GeForce RTX 4070", "category": "Componentes", "price": 599990, "stock": 8, "image": "gpu", "description": "12 GB · GDDR6X", "active": true}, {"id": 2, "code": "CPU-001", "name": "Ryzen 7 7800X3D", "category": "Componentes", "price": 389990, "stock": 12, "image": "cpu", "description": "8 núcleos · Socket AM5", "active": true}, {"id": 3, "code": "KEY-001", "name": "Teclado mecánico RGB", "category": "Periféricos", "price": 59990, "stock": 20, "image": "keyboard", "description": "Formato TKL · Switch red", "active": true}, {"id": 4, "code": "PS5-001", "name": "PlayStation 5 Slim", "category": "Consolas", "price": 549990, "stock": 6, "image": "console", "description": "1 TB · Edición con lector", "active": true}, {"id": 5, "code": "MOU-001", "name": "Mouse gaming Pro", "category": "Periféricos", "price": 39990, "stock": 15, "image": "mouse", "description": "Inalámbrico · Sensor óptico", "active": true}, {"id": 6, "code": "RAM-001", "name": "Memoria DDR5 32 GB", "category": "Componentes", "price": 109990, "stock": 0, "image": "memory", "description": "2 × 16 GB · 6000 MT/s", "active": true}];
// Datos compartidos y almacenamiento defensivo. Nunca guardamos contraseñas del usuario.
const $ = id => document.getElementById(id);
$('toast').textContent = '';
const money = value => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(value);
const memory = {};
function read(key, fallback, storage=localStorage){try{return JSON.parse(storage.getItem(key)) ?? fallback;}catch{return fallback;}}
function save(key,value,storage=localStorage){try{storage.setItem(key,JSON.stringify(value));return true;}catch{notify('El navegador no permite guardar datos. Los cambios durarán solo en esta página.');return false;}}
function notify(message){$('toast').textContent=message;clearTimeout(memory.toast);memory.toast=setTimeout(()=>{$('toast').textContent='';},4500);}
function validProduct(p){return p && Number.isInteger(p.id) && typeof p.code==='string' && typeof p.name==='string' && ['Componentes','Periféricos','Consolas'].includes(p.category) && Number.isInteger(p.price) && p.price>0 && Number.isInteger(p.stock) && p.stock>=0 && typeof p.active==='boolean';}
let products=read('nexus_products',SEED);
if(!Array.isArray(products)||!products.every(validProduct)) products=structuredClone(SEED);
let cart=read('nexus_cart',[]);
if(!Array.isArray(cart))cart=[];
cart=cart.filter(i=>i&&Number.isInteger(i.id)&&Number.isInteger(i.qty)&&i.qty>0);
function reconcileCart(){cart=cart.filter(i=>products.some(p=>p.id===i.id&&p.active&&p.stock>0));cart.forEach(i=>i.qty=Math.min(i.qty,products.find(p=>p.id===i.id).stock));}
reconcileCart();
function session(){const s=read('nexus_session',null,sessionStorage);return s&&['admin','user'].includes(s.role)&&s.expires>Date.now()?s:null;}
function admin(){return session()?.role==='admin';}
function updateCount(){$('cart-count').textContent=cart.reduce((n,i)=>n+i.qty,0);}
function storeCart(){save('nexus_cart',cart);updateCount();}
function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
function button(text,action,className='secondary'){const b=element('button',text,className);b.type='button';b.addEventListener('click',action);return b;}
// Conserva los identificadores guardados: también actualiza catálogos ya existentes.
const PRODUCT_PHOTOS = {
  gpu: 'assets/photos/gpu.png',
  cpu: 'assets/photos/cpu.jpg',
  keyboard: 'assets/photos/keyboard.jpg',
  console: 'assets/photos/console.jpg',
  mouse: 'assets/photos/mouse.jpg',
  memory: 'assets/photos/memory.jpg'
};
function productImage(p) {
  return (isUploadedPhoto(p.image) ? p.image : null) || PRODUCT_PHOTOS[p.image] || 'assets/' + ({Componentes:'cpu',Periféricos:'keyboard',Consolas:'console'})[p.category] + '.svg';
}
function describeImage(p) {
  return (isUploadedPhoto(p.image) || PRODUCT_PHOTOS[p.image] ? 'Fotografía referencial de ' : 'Ilustración de categoría para ') + p.name;
}
function setProductImage(img, p) {
  img.src = productImage(p);
  img.alt = describeImage(p);
  img.addEventListener('error', () => {
    img.src = 'assets/' + ({Componentes:'cpu',Periféricos:'keyboard',Consolas:'console'})[p.category] + '.svg';
    img.alt = 'Imagen no disponible. Ilustración de categoría para ' + p.name;
  }, {once:true});
}
function add(id){const p=products.find(p=>p.id===id&&p.active);if(!p)return;const item=cart.find(i=>i.id===id);if((item?.qty||0)>=p.stock){notify('Ya agregaste todas las unidades disponibles.');return;}if(item)item.qty++;else cart.push({id,qty:1});storeCart();notify(p.name+' agregado al carrito.');}
function card(p){const article=element('article',undefined,'product-card');const visual=element('div',undefined,'product-image');const img=element('img');setProductImage(img,p);img.width=620;img.height=580;img.loading='lazy';visual.append(img,element('span',p.stock?'Disponible · '+p.stock:'Agotado','stock'));const info=element('div',undefined,'product-info');info.append(element('span',p.category,'eyebrow'),element($('catalog')?'h2':'h3',p.name),element('p',p.description||'Producto del catálogo NEXUS'),element('strong',money(p.price)));const b=button(p.stock?'Agregar al carrito +':'Sin stock',()=>add(p.id),'button');b.disabled=!p.stock;info.append(b);article.append(visual,info);return article;}
function displayCatalog(){const q=$('search').value.trim().toLocaleLowerCase('es');const cat=$('category').value;let visible=products.filter(p=>p.active&&(!cat||p.category===cat)&&(p.name+' '+p.code+' '+p.category).toLocaleLowerCase('es').includes(q));if($('sort').value==='asc')visible.sort((a,b)=>a.price-b.price);if($('sort').value==='desc')visible.sort((a,b)=>b.price-a.price);$('catalog').replaceChildren(...visible.map(card));if(!visible.length)$('catalog').append(element('p','No encontramos productos. Prueba otra búsqueda o limpia los filtros.','empty'));$('result-count').textContent=visible.length+' productos encontrados';}
const current=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('nav a').forEach(a=>{if(a.getAttribute('href')===current)a.setAttribute('aria-current','page');});
// Reconoce la sesión también al volver desde el historial del navegador.
function refreshSessionNavigation() {
  const currentSession = session();
  const destination = currentSession?.role === 'admin' ? 'admin.html' : 'productos.html';
  $('account-link').textContent = currentSession?.role === 'admin' ? 'Administrador' : 'Mi cuenta';
  $('account-link').href = currentSession ? destination : 'login.html';
  $('logout').hidden = !currentSession;
  $('admin-link').hidden = currentSession?.role !== 'admin';
  const loginForm = $('login-form');
  if (loginForm) {
    loginForm.hidden = Boolean(currentSession);
    if (currentSession) location.replace(destination);
  }
}
const activeSession = session();
refreshSessionNavigation();
window.addEventListener('pageshow', refreshSessionNavigation);
$('logout').addEventListener('click',()=>{sessionStorage.removeItem('nexus_session');location.href='index.html';});
updateCount();if($('featured'))$('featured').replaceChildren(...products.filter(p=>p.active).slice(0,4).map(card));
if($('catalog')){const category=new URLSearchParams(location.search).get('categoria');if(['Componentes','Periféricos','Consolas'].includes(category))$('category').value=category;['search','category','sort'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',displayCatalog));$('clear-filters').addEventListener('click',()=>{$('search').value='';$('category').value='';$('sort').value='default';displayCatalog();});displayCatalog();}
// Cada regla produce un error específico junto al control correspondiente.
function error(id,message){$(id+'-error').textContent=message;$(id).setAttribute('aria-invalid',message?'true':'false');return !message;}
function validate(rules){let first=null;Object.entries(rules).forEach(([id,rule])=>{if(!error(id,rule($(id)))&&!first)first=$(id);});if(first)first.focus();return !first;}
function bindValidation(rules){Object.entries(rules).forEach(([id,rule])=>{const el=$(id);el.addEventListener('blur',()=>error(id,rule(el)));el.addEventListener('input',()=>{if(el.getAttribute('aria-invalid')==='true')error(id,rule(el));});});}
const lengthRule=(min,max,label)=>el=>el.value.trim().length<min?label+' debe tener al menos '+min+' caracteres.':el.value.trim().length>max?label+' no puede superar '+max+' caracteres.':'';
if($('login-form') && !activeSession){const rules={username:lengthRule(1,30,'El usuario'),password:lengthRule(1,64,'La contraseña')};bindValidation(rules);$('show-password').addEventListener('change',e=>$('password').type=e.target.checked?'text':'password');$('login-form').addEventListener('submit',event=>{event.preventDefault();$('login-status').textContent='';if(!validate(rules))return;let attempts=read('nexus_attempts',{count:0,until:0});if(!attempts||!Number.isFinite(attempts.count)||!Number.isFinite(attempts.until))attempts={count:0,until:0};if(attempts.until>Date.now()){$('login-status').textContent='Espera '+Math.ceil((attempts.until-Date.now())/1000)+' segundos antes de intentarlo otra vez.';return;}if(attempts.until)attempts={count:0,until:0};const user=$('username').value.trim().toLowerCase(),password=$('password').value;const role=user==='admin'&&password==='Admin123'?'admin':user==='jperez'&&password==='User123'?'user':null;if(!role){attempts.count++;if(attempts.count>=5){attempts.until=Date.now()+60000;attempts.count=0;}save('nexus_attempts',attempts);$('login-status').textContent=attempts.until?'Demasiados intentos. Espera 60 segundos.':'Usuario o contraseña incorrectos. Revisa las cuentas de prueba.';$('password').value='';$('password').focus();return;}save('nexus_attempts',{count:0,until:0});if(save('nexus_session',{user,role,expires:Date.now()+30*60*1000},sessionStorage))location.href=role==='admin'?'admin.html':'productos.html';else $('login-status').textContent='Habilita el almacenamiento de sesión en el navegador para ingresar.';});}
if($('contact-form')){const rules={name:lengthRule(3,80,'El nombre'),email:el=>! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())||el.value.length>120?'Escribe un correo válido, por ejemplo nombre@ejemplo.cl.':'',topic:lengthRule(3,60,'El tema'),message:lengthRule(20,1000,'El mensaje'),consent:el=>el.checked?'':'Confirma que entiendes que esta consulta es una demostración.'};bindValidation(rules);$('contact-form').addEventListener('input',()=>{$('contact-status').textContent='';});$('contact-form').addEventListener('submit',event=>{event.preventDefault();$('contact-status').textContent='';if(validate(rules)){$('contact-status').textContent='Consulta validada correctamente. Esta demostración no envía ni almacena tus datos.';}});}
function drawCart(){const list=$('cart-items');list.replaceChildren();reconcileCart();for(const item of cart){const p=products.find(p=>p.id===item.id);const article=element('article',undefined,'cart-item');const img=element('img');setProductImage(img,p);const content=element('div');content.append(element('h2',p.name),element('p',money(p.price)+' por unidad'));const quantity=element('div',undefined,'quantity');const minus=button('−',()=>changeQty(item.id,-1));minus.setAttribute('aria-label','Restar una unidad de '+p.name);minus.disabled=item.qty===1;const plus=button('+',()=>changeQty(item.id,1));plus.setAttribute('aria-label','Sumar una unidad de '+p.name);plus.disabled=item.qty>=p.stock;quantity.append(minus,element('span',item.qty),plus,element('strong',money(item.qty*p.price)));content.append(quantity,button('Eliminar',()=>{cart=cart.filter(i=>i.id!==item.id);storeCart();drawCart();},'remove'));article.append(img,content);list.append(article);}if(!cart.length){const empty=element('div',undefined,'empty');empty.append(element('h2','Tu carrito está esperando un upgrade'),element('p','Explora el catálogo y encuentra tu próximo componente.'));const link=element('a','Explorar catálogo','button');link.href='productos.html';empty.append(link);list.append(empty);}$('summary-count').textContent=cart.reduce((n,i)=>n+i.qty,0);$('total').textContent=money(cart.reduce((n,i)=>n+i.qty*products.find(p=>p.id===i.id).price,0));$('checkout').disabled=!cart.length;updateCount();}
function changeQty(id,delta){const item=cart.find(i=>i.id===id),p=products.find(p=>p.id===id);item.qty=Math.max(1,Math.min(p.stock,item.qty+delta));storeCart();drawCart();}
if($('cart-items')){drawCart();$('checkout').addEventListener('click',()=>{if(!cart.length)return;cart=[];storeCart();drawCart();$('checkout-status').textContent='¡Compra de demostración completada! No se realizó ningún cobro ni se generó un pedido real.';});}
function ensureAdmin(){if(admin())return true;location.href='login.html';return false;}
function drawInventory(){const body=$('inventory');body.replaceChildren();products.forEach(p=>{const row=element('tr');const name=element('td');name.append(element('small',p.code),element('strong',p.name));row.append(name,...[p.category,money(p.price),p.stock,p.active?'Visible':'Oculto'].map(v=>element('td',v)));const actions=element('td');actions.append(button('Editar',()=>editProduct(p)),button('Eliminar',()=>{if(!ensureAdmin())return;if(!confirm('¿Eliminar «'+p.name+'» del catálogo?'))return;products=products.filter(x=>x.id!==p.id);save('nexus_products',products);reconcileCart();storeCart();drawInventory();if($('product-id').value===String(p.id))$('product-form').hidden=true;notify('Producto eliminado.');}));row.append(actions);body.append(row);});if(!products.length){const row=element('tr'),cell=element('td','No hay productos. Crea el primero.');cell.colSpan=6;row.append(cell);body.append(row);}}
function editProduct(p){if(!ensureAdmin())return;const form=$('product-form');form.reset();form.querySelectorAll('.error').forEach(e=>e.textContent='');form.querySelectorAll('[aria-invalid]').forEach(e=>e.removeAttribute('aria-invalid'));$('product-id').value=p?.id||'';$('product-form-title').textContent=p?'Editar producto':'Nuevo producto';if(p){$('code').value=p.code;$('product-name').value=p.name;$('product-category').value=p.category;$('price').value=p.price;$('stock').value=p.stock;$('active').checked=p.active;}resetProductPhoto(p);form.hidden=false;$('code').focus();}
if($('admin-panel')){if(!admin()){$('admin-notice').textContent='Necesitas una cuenta de administrador para gestionar el inventario. ';const a=element('a','Iniciar sesión');a.href='login.html';$('admin-notice').append(a);}else{$('admin-notice').textContent='Sesión de administrador de demostración. Los cambios se guardan en este navegador.';$('admin-panel').hidden=false;drawInventory();$('new-product').addEventListener('click',()=>editProduct(null));$('cancel-product').addEventListener('click',()=>{$('product-form').hidden=true;});const integerRule=(min,max,label)=>el=>el.value.trim()===''||!Number.isInteger(Number(el.value))||Number(el.value)<min||Number(el.value)>max?label+' debe ser un entero entre '+min+' y '+max+'.':'';const rules={code:el=>! /^[A-Za-z0-9-]{3,20}$/.test(el.value.trim())?'Usa entre 3 y 20 letras, números o guiones.':products.some(p=>p.code.toLowerCase()===el.value.trim().toLowerCase()&&String(p.id)!==$('product-id').value)?'Este código ya existe. Usa uno diferente.':'','product-name':lengthRule(3,80,'El nombre'),price:integerRule(1,99999999,'El precio'),stock:integerRule(0,9999,'El stock')};bindValidation(rules);$('product-form').addEventListener('submit',event=>{event.preventDefault();if(!ensureAdmin()||!validate(rules))return;if(photoLoading||photoInvalid){error('product-photo',photoLoading?'Espera a que termine de cargar la imagen.':'Selecciona una imagen válida o pulsa Quitar imagen.');$('product-photo').focus();return;}const id=Number($('product-id').value),old=products.find(p=>p.id===id);const product={id:id||Math.max(0,...products.map(p=>p.id))+1,code:$('code').value.trim().toUpperCase(),name:$('product-name').value.trim(),category:$('product-category').value,price:Number($('price').value),stock:Number($('stock').value),active:$('active').checked,image:draftProductPhoto,description:old?.description||'Producto del catálogo NEXUS'};const updated=old?products.map(p=>p.id===id?product:p):[...products,product];try{localStorage.setItem('nexus_products',JSON.stringify(updated));}catch{$('product-save-error').textContent='No se pudo guardar: el almacenamiento está lleno o bloqueado. Prueba una imagen más pequeña. Tus cambios anteriores siguen intactos.';return;}products=updated;reconcileCart();storeCart();drawInventory();$('product-form').hidden=true;notify(old?'Producto actualizado.':'Producto creado.');});}}
// Sincroniza catálogo y carrito cuando cambian desde otra pestaña del mismo origen.
window.addEventListener('storage',event=>{if(['nexus_products','nexus_cart'].includes(event.key))location.reload();});

// Informa errores de carga sin dejar un reproductor vacío.
if ($('component-video')) {
  const player = $('component-video');
  const showVideoError = () => { $('video-error').hidden = false; };
  player.addEventListener('error', showVideoError);
  player.querySelector('source').addEventListener('error', showVideoError);
  const playButton = $('video-play');
  const videoStatus = $('video-status');
  playButton.addEventListener('click', async () => {
    if (!player.paused) { player.pause(); return; }
    try { await player.play(); }
    catch { videoStatus.textContent = 'No se pudo iniciar. Intenta con los controles del video.'; }
  });
  player.addEventListener('play', () => {
    playButton.textContent = 'Ⅱ Pausar video';
    videoStatus.textContent = 'Reproduciendo presentación';
  });
  player.addEventListener('pause', () => {
    playButton.textContent = '▶ Continuar video';
    videoStatus.textContent = 'Video en pausa';
  });
  player.addEventListener('ended', () => {
    // load() restaura el poster: el fundido final no queda como una pantalla negra.
    player.load();
    playButton.textContent = '↻ Ver de nuevo';
    videoStatus.textContent = 'Video finalizado · Puedes volver a reproducirlo';
  });
}

// Las imágenes se guardan junto al producto; nunca se inserta HTML del archivo.
function isUploadedPhoto(value) {
  return typeof value === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
}
let draftProductPhoto = '', photoLoading = false, photoInvalid = false, photoRequest = 0;
function showProductPhoto() {
  const preview = $('product-photo-preview');
  preview.hidden = !draftProductPhoto;
  if (draftProductPhoto) preview.src = productImage({image:draftProductPhoto, category:$('product-category').value});
  else preview.removeAttribute('src');
  $('remove-product-photo').hidden = !draftProductPhoto && !$('product-photo').value;
}
function resetProductPhoto(product) {
  photoRequest++;
  draftProductPhoto = product?.image || '';
  photoLoading = false;
  photoInvalid = false;
  $('product-photo').value = '';
  error('product-photo', '');
  $('product-save-error').textContent = '';
  showProductPhoto();
}
if ($('product-photo')) {
  $('remove-product-photo').addEventListener('click', () => resetProductPhoto(null));
  $('cancel-product').addEventListener('click', () => { photoRequest++; photoLoading=false; });
  $('product-photo').addEventListener('change', async event => {
    const request = ++photoRequest;
    const file = event.target.files[0];
    photoLoading = false;
    photoInvalid = false;
    error('product-photo', '');
    if (!file) { showProductPhoto(); return; }
    $('remove-product-photo').hidden = false;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 1024 * 1024) {
      photoInvalid = true;
      error('product-photo', 'Usa una imagen JPG, PNG o WebP de hasta 1 MB.');
      return;
    }
    photoLoading = true;
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const picture = new Image();
      picture.src = data;
      await picture.decode();
      if (request !== photoRequest) return;
      if (!isUploadedPhoto(data) || !picture.naturalWidth) throw new Error('Invalid image');
      draftProductPhoto = data;
      showProductPhoto();
    } catch {
      if (request !== photoRequest) return;
      photoInvalid = true;
      error('product-photo', 'No se pudo leer la imagen. Elige otro archivo JPG, PNG o WebP.');
    } finally {
      if (request === photoRequest) photoLoading = false;
    }
  });
}
