const app=document.querySelector('#app'), header=document.querySelector('#header'), footer=document.querySelector('#footer'), message=document.querySelector('#message');
let catalog,account=null,admin=null,tab='overview',generation=0,timer;
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const usd=v=>new Intl.NumberFormat('ar-EG',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(v/100);
const pct=v=>new Intl.NumberFormat('ar-EG',{style:'percent',maximumFractionDigits:2}).format(v/10000);
const date=v=>v?new Date(v).toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'}):'';
const route=()=>location.hash.slice(1).split('/').filter(Boolean);
const go=value=>{if(location.hash==='#'+value)render();else location.hash=value;};
const status=(s,kind)=>s==='confirmed'?(kind==='withdrawals'?'مدفوع (تجريبي)':'مؤكد'):s==='rejected'?'مرفوض':'قيد المراجعة';
const kindName=k=>({deposit:'إيداع مؤكد',performance:'نتيجة محققة مسجلة',withdrawal:'سحب مدفوع'}[k]||k);
const keys=['plans','sectors','articles','faqs'];
const titles={plans:'الخطط',sectors:'مجالات الاستثمار',articles:'مركز المعرفة',faqs:'الأسئلة الشائعة',orders:'الاشتراكات والإيداعات',withdrawals:'السحوبات',users:'المستثمرون',ledger:'دفتر العمليات',audit:'سجل التدقيق',settings:'الموقع والهوية',overview:'نظرة عامة'};
const glyph='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 25L16 5l12 20H4zm6 0 6-10 6 10M16 5v10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
const button=(label,path,cls='')=>'<a class="btn '+cls+'" href="#'+h(path)+'">'+h(label)+'</a>';
const empty=s=>'<p class="muted">'+h(s)+'</p>';
const title=(label,body='',tag='آفاق الاستثمار')=>'<div class="page-title"><span class="eyebrow">'+h(tag)+'</span><h1>'+h(label)+'</h1>'+(body?'<p class="lead">'+h(body)+'</p>':'')+'</div>';
const section=(label,body='')=>'<div class="section-head"><h2>'+h(label)+'</h2>'+(body?'<p class="lead">'+h(body)+'</p>':'')+'</div>';
const card=(label,body)=>'<article class="card"><h3>'+h(label)+'</h3><p class="prose">'+h(body)+'</p></article>';
const telegram=label=>catalog.settings.telegram?'<a class="btn primary" href="'+h(catalog.settings.telegram)+'" target="_blank" rel="noopener noreferrer">'+h(label)+'</a>':empty('رابط تليجرام هيتاح بعد ما يضيفه المدير.');
function notify(text){clearTimeout(timer);message.textContent=text;message.hidden=false;timer=setTimeout(()=>{message.hidden=true;},5500);}
async function api(path,method='GET',data){
 const r=await fetch('/investment/api'+path,{method,headers:method==='GET'?{}:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data),cache:'no-store'});
 const payload=await r.json().catch(()=>({error:'تعذّر الاتصال بالخادم'}));
 if(!r.ok)throw Object.assign(Error(payload.error||'تعذّر إتمام الطلب'),{code:r.status});return payload;
}
async function refresh(me=true){
 const [p,u]=await Promise.all([api('/public'),me?api('/me').catch(e=>{if(e.code===401)return null;throw e;}):Promise.resolve(account)]);
 catalog=p;account=u;
 const s=catalog.settings;
 document.documentElement.style.setProperty('--gold',s.gold);
 document.documentElement.style.setProperty('--bg',s.background);
 document.title=s.title+' | منصة استثمار · اختبار';
}
function chrome(page){
 const s=catalog.settings;
 const menu=[['home','الرئيسية'],['about','من نحن'],['sectors','المجالات'],['plans','الخطط'],['articles','المعرفة'],['faq','الأسئلة'],['contact','التواصل']];
 header.innerHTML='<nav class="nav wrap" aria-label="القائمة الرئيسية"><a href="#home" class="brand">'+(s.logo?'<img alt="" src="'+h(s.logo)+'">':'<span class="mark">'+glyph+'</span>')+h(s.title)+'</a><button class="btn mobile" data-action="menu" aria-controls="links" aria-expanded="false">القائمة</button><div class="links" id="links">'+menu.map(([k,l])=>'<a href="#'+k+'" '+(k===page?'aria-current="page"':'')+'>'+l+'</a>').join('')+'</div><div class="actions">'+(account?(account.user.role==='admin'?button('الإدارة','admin','primary'):button('حسابي','account','primary'))+'<button class="btn" data-action="logout">خروج</button>':button('دخول','login','primary'))+'</div></nav>';
 footer.innerHTML='<div class="wrap foot"><strong>'+h(s.title)+'</strong><div class="actions"><a href="#about">عن المنصة</a><a href="#contact">التواصل</a><a href="#terms">شروط الاستخدام</a><a href="#privacy">الخصوصية</a></div><span>نسخة اختبار</span></div>';
}
const artPaths={
 gold:'M65 120l34-55h82l35 55zm24 0 26-40h51l25 40M50 127h182',
 markets:'M41 110l43-27 34 11 38-51 31 14 49-36M41 133h201',
 stocks:'M52 134V84h31v50m24 0V64h31v70m24 0V40h31v94m24 0V22h31v112',
 funds:'M58 106h160v25H58zm22-34h115v25H80zm23-34h70v25h-70z',
 property:'M45 134h194M57 134V77l43-28 43 28v57m18 0V55h60v79M185 67h15m-15 17h15m-15 17h15M85 134v-24h29v24',
 income:'M72 36h135v91H72zM92 60h94M92 80h94M92 101h55m15 2 8 8 14-18',
 portfolio:'M140 29a56 56 0 1 0 56 56h-56zm12-5v49h49a50 50 0 0 0-49-49z',
 opportunities:'M46 111l56-51 40 24 48-47 49 22M46 132h193M102 55v10m40 14v10m48-57v10',
};
function art(item){
 if(item?.image)return '<img loading="lazy" src="'+h(item.image)+'" alt="">';
 const d=artPaths[item?.id]||artPaths.markets;
 return '<svg viewBox="0 0 280 150" aria-hidden="true"><rect width="280" height="150" fill="#15212b"/><path d="M0 35H280M0 75H280M0 115H280M40 0v150M90 0v150M140 0v150M190 0v150M240 0v150" stroke="#ffffff10"/><path d="'+d+'" stroke="#d9b877" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
function planCard(p){
 return '<article class="card"><span class="pill">خطة تجريبية</span><h3 class="gap">'+h(p.title)+'</h3><div class="rate">'+h(pct(p.bps))+'</div><p>'+h(p.returnType)+'</p><p><strong>'+h(usd(p.min))+'</strong> إلى <strong>'+h(usd(p.max))+'</strong> · '+h(p.days)+' يوم</p><div class="actions">'+button('عرض التفاصيل','plan/'+p.id)+button('طلب الاشتراك','subscribe/'+p.id,'primary')+'</div></article>';
}
function items(list,path){
 return list.map(x=>'<article class="card sector">'+art(x)+'<div class="body"><h3><a href="#'+path+'/'+h(x.id)+'">'+h(x.title)+'</a></h3><p class="muted">'+h(x.summary)+'</p></div></article>').join('')||empty('مفيش محتوى منشور حاليًا.');
}
const faq=()=>'<div class="faq">'+catalog.faqs.map(x=>'<details><summary>'+h(x.title)+'</summary><p class="prose">'+h(x.body)+'</p></details>').join('')+'</div>';
function home(){
 const s=catalog.settings;
 const picture=s.heroImage?'<img src="'+h(s.heroImage)+'" alt="">':'<svg viewBox="0 0 540 410" aria-hidden="true"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#182735"/><stop offset="1" stop-color="#0a1118"/></linearGradient><linearGradient id="line"><stop stop-color="#765c3a"/><stop offset=".9" stop-color="#f1d394"/></linearGradient></defs><rect fill="url(#sky)" width="540" height="410"/><circle cx="360" cy="125" r="67" fill="#cfaa6a29"/><circle cx="360" cy="125" r="92" fill="none" stroke="#cfaa6a32"/><path d="M0 100H540M0 155H540M0 210H540M0 265H540M0 320H540M65 0v410M160 0v410M255 0v410M350 0v410M445 0v410" stroke="#ffffff0e"/><path d="M0 337l64-44 48 9 66-82 38 33 71-75 44 15 67-87 65 20 77-45V410H0z" fill="#c0a06b22"/><path d="M0 337l64-44 48 9 66-82 38 33 71-75 44 15 67-87 65 20 77-45" fill="none" stroke="url(#line)" stroke-width="3"/><circle cx="398" cy="106" r="6" fill="#eacb8d"/><path d="M20 365l62-30 54 12 47-29 41 8 68-40 70 12 80-58 98-24" fill="none" stroke="#869da66b" stroke-width="1.5"/></svg>';
 return '<section class="hero"><div class="wrap heroGrid pad"><div><span class="eyebrow">معرفة · خيارات · متابعة</span><h1>'+h(s.headline)+'</h1><p class="lead">'+h(s.intro)+'</p><div class="actions">'+button('استكشف الخطط','plans','primary')+button(account?'حساب المستثمر':'إنشاء حساب',account?'account':'register')+'</div></div><div class="visual">'+picture+'<div class="visual-caption"><span>نظرة على عالم الاستثمار</span><span>رسم توضيحي</span></div></div></div></section>'+
 '<section class="wrap pad-small">'+section(s.homeTitle,s.homeText)+button('تعرّف على المنصة','about','quiet')+'</section>'+
 '<section class="band"><div class="wrap pad-small">'+section('مجالات الاستثمار','محتوى معرفي يوضح الأدوات المتاحة في الأسواق وكيف تختلف عن بعضها.')+'<div class="grid four">'+items(catalog.sectors.slice(0,4),'sector')+'</div><div class="spaced">'+button('كل مجالات الاستثمار','sectors')+'</div></div></section>'+
 '<section class="wrap pad-small">'+section('الخطط الاستثمارية','شوف شروط كل خطة، وقارن بين الحدود والمدد والعوائد المستهدفة للتجربة.')+'<div class="grid">'+(catalog.plans.slice(0,3).map(planCard).join('')||empty('لا توجد خطط منشورة.'))+'</div></section>'+
 '<section class="band"><div class="wrap pad-small">'+section('كيف تبدأ الاستثمار معنا؟')+'<div class="grid">'+card('أنشئ حسابك','سجّل باسمك وبريدك عشان تتابع طلباتك من حساب واحد.')+card('اطّلع على الخطط','اقرأ حدود المبلغ والشروط، وقدّم طلب اشتراك تجريبي.')+card('تابع طلبك','راجع حالة الطلب والعمليات المسجلة من لوحة المستثمر.')+'</div></div></section>'+
 '<section class="wrap pad-small split"><div>'+section('أسئلة شائعة')+faq()+'</div><div class="card">'+section('تواصل معنا',s.contact)+button('صفحة التواصل','contact','primary')+'</div></section>';
}
const form=(which,inner)=>'<form class="spaced" data-form="'+which+'">'+inner+'</form>';
const field=(label,name,type='text',value='',extra='')=>'<label>'+h(label)+'<input name="'+name+'" type="'+type+'" value="'+h(value)+'" '+extra+'></label>';
const area=(label,name,value='')=>'<label>'+h(label)+'<textarea name="'+name+'">'+h(value)+'</textarea></label>';
const submit=label=>'<button type="submit" class="btn primary">'+h(label)+'</button>';
const opt=(value,label,selected)=>'<option value="'+h(value)+'" '+(value===selected?'selected':'')+'>'+h(label)+'</option>';
const check=(label,name,on=false)=>'<label class="check"><input type="checkbox" name="'+name+'" '+(on?'checked':'')+'> '+h(label)+'</label>';
const hidden=(k,v)=>'<input type="hidden" name="'+k+'" value="'+h(v)+'">';
const cashInput=(label,name,value='',extra='')=>field(label,name,'number',value,'required step="0.01" '+extra);
function login(page){return title(page==='register'?'إنشاء حساب':'تسجيل الدخول','استخدم بريدًا تجريبيًا في هذه النسخة.','حساب المستثمر')+'<div class="card formbox">'+form(page,(page==='register'?field('الاسم','name','text','','required maxlength="100" autocomplete="name"'):'')+field('البريد الإلكتروني','email','email','','required autocomplete="email"')+field('كلمة المرور','password','password','','required minlength="12" maxlength="128" autocomplete="'+(page==='register'?'new-password':'current-password')+'"')+submit(page==='register'?'إنشاء حساب':'دخول'))+'<div class="gap">'+button(page==='register'?'عندي حساب':'إنشاء حساب',page==='register'?'login':'register')+'</div></div>';}
function table(headers,rows){return rows.length?'<div class="table-wrap"><table><thead><tr>'+headers.map(x=>'<th scope="col">'+h(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':empty('مفيش بيانات لعرضها.');}
const statusLabel=(s,k)=>'<span class="status '+h(s)+'">'+h(status(s,k))+'</span>';
const metric=(label,v)=>'<article class="card"><p>'+h(label)+'</p><div class="metric">'+h(v)+'</div></article>';
function chart(points){
 if(!points.length)return empty('الرسم هيظهر بعد تأكيد أول عملية.');
 const nums=[0,...points.map(p=>p.total)],min=Math.min(...nums),max=Math.max(...nums),range=max-min||1;
 const pts=nums.map((n,i)=>[20+460*i/(nums.length-1),150-130*(n-min)/range].join(',')).join(' ');
 return '<div class="chart"><svg viewBox="0 0 500 170" role="img" aria-label="رسم لتغير رصيد المحفظة"><path d="M20 20H480M20 85H480M20 150H480" stroke="#ffffff26"/><polyline points="'+pts+'" stroke="#d9b877" stroke-width="3" fill="none"/></svg></div>';
}
function investor(){
 if(!account)return login('login');
 const {user,balance:b,orders,withdrawals,ledger}=account;
 return title('أهلًا، '+user.name,'أرقام المحفظة أدناه مبنية على دفتر عمليات الاختبار.','حساب المستثمر')+
 '<div class="actions gap"><button class="btn" data-action="refresh">تحديث الحساب</button></div><div class="grid four">'+metric('رأس المال المودع والمعتمد',usd(b.capital))+metric('النتيجة المحققة والمسجلة',usd(b.performance))+metric('قيمة المحفظة',usd(b.total))+metric('المتاح للسحب',usd(b.available))+'</div>'+
 '<div class="split spaced"><div class="card"><h3>أداء المحفظة</h3>'+chart(b.chart)+'</div><div class="card"><h3>طلب سحب تجريبي</h3><p>محجوز للمراجعة: '+h(usd(b.held))+' · المدفوع: '+h(usd(b.paid))+'</p>'+form('withdrawal',cashInput('المبلغ بالدولار','amount','','min="0.01"')+submit('إرسال طلب السحب'))+'</div></div>'+
 '<div class="stack spaced"><article class="card"><h3>طلبات الاشتراك</h3>'+table(['الخطة','المبلغ','الحالة','التاريخ','المتابعة'],orders.map(x=>[h(x.plan.title),h(usd(x.amount)),statusLabel(x.status,'orders'),h(date(x.at)),button('عرض', 'order/'+x.id)]))+'</article>'+
 '<article class="card"><h3>طلبات السحب</h3>'+table(['المبلغ','الحالة','التاريخ'],withdrawals.map(x=>[h(usd(x.amount)),statusLabel(x.status,'withdrawals'),h(date(x.at))]))+'</article>'+
 '<article class="card"><h3>سجل العمليات</h3>'+table(['العملية','المبلغ','المرجع','التاريخ'],ledger.map(x=>[h(kindName(x.kind)),h(usd(x.amount)),h(x.reference),h(date(x.at))]))+'</article></div>';
}
function publicPage(page,id){
 const s=catalog.settings;
 if(page==='about')return title('من نحن',s.about)+ '<div class="grid">'+[['رؤيتنا','vision'],['رسالتنا','mission'],['أهدافنا','goals'],['منهجية العمل','approach'],['القيم الأساسية','values']].map(([label,k])=>card(label,s[k])).join('')+'</div>';
 if(page==='faq')return title('الأسئلة الشائعة')+faq();
 if(page==='contact')return title('تواصل معنا',s.contact)+telegram('فتح تليجرام');
 if(['terms','privacy'].includes(page))return title(page==='terms'?'شروط الاستخدام':'الخصوصية')+'<p class="page-copy prose">'+h(s[page])+'</p>';
 if(page==='sectors'||page==='articles')return title(titles[page],page==='sectors'?'محتوى تعريفي عن المجالات والأدوات.':'مقالات لمساعدتك في قراءة المعلومات الاستثمارية.')+'<div class="grid">'+items(catalog[page],page==='sectors'?'sector':'article')+'</div>';
 if(page==='sector'||page==='article'){
   const entry=catalog[page==='sector'?'sectors':'articles'].find(x=>x.id===id);
   return entry?title(entry.title,entry.summary,page==='sector'?'دليل المجالات':'مركز المعرفة')+'<div class="detail-art">'+art(entry)+'</div><p class="page-copy prose">'+h(entry.body)+'</p>':title('المحتوى غير متاح');
 }
 if(page==='plans')return title('الخطط الاستثمارية','النسب المعروضة أمثلة اختبار. النتائج المحققة تظهر منفصلة في دفتر العمليات.')+'<div class="grid">'+(catalog.plans.map(planCard).join('')||empty('لا توجد خطط منشورة.'))+'</div>';
 if(['plan','subscribe'].includes(page)){
   const p=catalog.plans.find(x=>x.id===id);
   if(!p)return title('الخطة غير متاحة')+button('عرض الخطط','plans');
   if(page==='subscribe'&&!account)return login('login')+button('إنشاء حساب','register');
   return title(p.title,p.returnType,'خطة تجريبية')+'<div class="split">'+planCard(p)+'<article class="card"><h3>شروط الاشتراك</h3><p class="prose">'+h(p.terms)+'</p><ul class="list">'+p.features.split('\n').filter(Boolean).map(x=>'<li>'+h(x)+'</li>').join('')+'</ul></article></div>'+
    (page==='subscribe'?'<div class="card formbox spaced"><h3>طلب اشتراك تجريبي</h3>'+form('order',hidden('planId',p.id)+cashInput('المبلغ بالدولار','amount',p.min/100,'min="'+p.min/100+'" max="'+p.max/100+'"')+submit('إرسال الطلب'))+'</div>':'');
 }
 if(page==='order'){
   if(!account)return login('login');
   const order=account.orders.find(x=>x.id===id);
   if(!order)return title('الطلب غير متاح');
   return title('طلب '+order.plan.title,'رقم الطلب: '+order.id,'حساب المستثمر')+
   '<div class="card"><p>'+h(usd(order.amount))+' · '+statusLabel(order.status,'orders')+'</p><p>يمكنك استخدام رقم الطلب للاستفسار عن مراجعته. لا ترسل أي أموال أثناء الاختبار.</p>'+telegram('تواصل مع الدعم على تليجرام')+'</div><div class="spaced">'+button('رجوع إلى حسابي','account')+'</div>';
 }
 return title('الصفحة غير موجودة')+button('الرئيسية','home');
}
function editSettings(){
 const s=admin.settings;
 const names={title:'اسم المنصة',logo:'رابط اللوجو من Cloudinary',heroImage:'رابط صورة الصفحة الرئيسية من Cloudinary',gold:'اللون الأساسي',background:'لون الخلفية',telegram:'رابط تليجرام',headline:'عنوان البانر',intro:'وصف البانر',homeTitle:'عنوان القسم التعريفي',homeText:'وصف القسم التعريفي',about:'من نحن',vision:'الرؤية',mission:'الرسالة',goals:'الأهداف',approach:'منهجية العمل',values:'القيم',contact:'نص صفحة التواصل',terms:'الشروط',privacy:'الخصوصية'};
 return '<div class="card">'+form('settings',Object.keys(names).map(k=>['intro','homeText','about','vision','mission','goals','approach','values','contact','terms','privacy'].includes(k)?area(names[k],k,s[k]):field(names[k],k,['gold','background'].includes(k)?'color':['logo','heroImage','telegram'].includes(k)?'url':'text',s[k])).join('')+submit('حفظ إعدادات الموقع'))+'</div>';
}
function entityEditor(k,p={}){
 const id=p.id||'';
 return form('catalog',hidden('kind',k)+hidden('id',id)+field(k==='faqs'?'السؤال':'العنوان','title','text',p.title,'required maxlength="140"')+
 '<div class="fields">'+field('الترتيب','order','number',p.order??0,'required min="0" max="5000"')+check('منشور', 'visible',p.visible??true)+'</div>'+
 (k==='plans'?'<div class="fields">'+cashInput('الحد الأدنى بالدولار','min',p.min===undefined?'':p.min/100,'min="0.01"')+cashInput('الحد الأقصى بالدولار','max',p.max===undefined?'':p.max/100,'min="0.01"')+cashInput('العائد المستهدف %','bps',p.bps===undefined?'':p.bps/100)+field('المدة بالأيام','days','number',p.days??365,'required min="1" max="3650"')+'</div><label>أساس النسبة<select name="basis">'+opt('annual','سنوي',p.basis??(p.returnType?.includes('لكامل')?'period':'annual'))+opt('period','لكامل المدة',p.basis??(p.returnType?.includes('لكامل')?'period':'annual'))+'</select></label>'+area('الشروط','terms',p.terms)+area('المزايا (ميزة لكل سطر)','features',p.features):
 (k==='faqs'?'':field('ملخص','summary','text',p.summary,'required maxlength="320"')+field('رابط صورة من Cloudinary','image','url',p.image))+area(k==='faqs'?'الإجابة':'المحتوى','body',p.body))+
 '<div class="actions">'+submit(id?'حفظ التعديلات':'إضافة')+(id?'<button type="button" class="btn danger" data-action="delete" data-kind="'+k+'" data-id="'+h(id)+'">حذف</button>':'')+'</div>');
}
function reviews(k){
 return '<div class="stack">'+(admin[k].map(o=>{
   const u=admin.users.find(x=>x.uid===o.uid);
   return '<article class="card"><h3>'+h(o.plan?.title??'طلب سحب')+' · '+h(usd(o.amount))+'</h3><p>'+h(u?.name??o.uid)+' · '+h(u?.email??'')+' · '+statusLabel(o.status,k)+'</p><p class="muted">رقم الطلب: '+h(o.id)+(o.reference?' · مرجع: '+h(o.reference):'')+'</p>'+
    (o.status==='pending'?form('review',hidden('kind',k)+hidden('id',o.id)+field('مرجع تسوية الاختبار','reference','text','','placeholder="TEST-00001"')+check('راجعت العملية التجريبية','verified')+'<div class="actions"><button class="btn primary" name="status" value="confirmed">'+(k==='withdrawals'?'تسجيل سحب مدفوع':'تأكيد الإيداع')+'</button><button class="btn danger" name="status" value="rejected">رفض الطلب</button></div>'):'')+'</article>';
 }).join('')||empty('مفيش طلبات لعرضها.'))+'</div>';
}
function investors(){
 const users=admin.users.filter(u=>u.role==='investor');
 return '<div class="stack">'+(users.map(u=>{
   const orders=admin.orders.filter(o=>o.uid===u.uid),capital=admin.ledger.filter(l=>l.uid===u.uid&&l.kind==='deposit').reduce((n,l)=>n+l.amount,0);
   return '<article class="card"><h3>'+h(u.name)+'</h3><p>'+h(u.email)+' · '+(u.disabled?'موقوف':'نشط')+' · الإيداعات المؤكدة '+h(usd(capital))+'</p><p>'+h(orders.filter(o=>o.status==='confirmed').map(o=>o.plan.title).join('، ')||'لا توجد خطط مؤكدة')+'</p>'+
   (u.disabled?'':form('performance',hidden('uid',u.uid)+cashInput('الربح أو الخسارة المسجلة بالدولار','amount')+field('مرجع الاختبار','reference','text','','required placeholder="TEST-00001"')+area('وصف العملية الموثقة','note')+check('راجعت المرجع التجريبي','verified')+submit('إضافة قيد أداء')))+
   '<div class="gap"><button class="btn" data-action="disable" data-id="'+h(u.uid)+'" data-disabled="'+String(!u.disabled)+'">'+(u.disabled?'إعادة تفعيل الحساب':'إيقاف الحساب')+'</button></div></article>';
 }).join('')||empty('مفيش مستثمرين مسجلين.'))+'</div>';
}
function overview(){
 const count=admin.users.filter(u=>u.role==='investor').length;
 const total=kind=>admin.ledger.filter(l=>l.kind===kind).reduce((n,l)=>n+l.amount,0);
 return '<div class="grid">'+metric('مستثمرون',count)+metric('طلبات الاشتراك',admin.orders.length)+metric('الإيداعات المؤكدة',usd(total('deposit')))+metric('عمليات معلقة',[...admin.orders,...admin.withdrawals].filter(x=>x.status==='pending').length)+metric('السحوبات المدفوعة',usd(-total('withdrawal')))+metric('الربح / الخسارة المسجلة',usd(total('performance')))+'</div><div class="actions spaced"><button class="btn" data-action="csv" data-kind="ledger">تصدير دفتر العمليات CSV</button><button class="btn" data-action="csv" data-kind="orders">تصدير الاشتراكات CSV</button><button class="btn" data-action="csv" data-kind="withdrawals">تصدير السحوبات CSV</button><button class="btn" data-action="csv" data-kind="audit">تصدير التدقيق CSV</button></div>';
}
function dashboard(){
  let content='';
  if(tab==='settings')content=editSettings();
  else if(keys.includes(tab))content='<div class="stack"><details class="card"><summary>إضافة عنصر</summary>'+entityEditor(tab)+'</details>'+admin[tab].map(p=>'<details class="card"><summary>'+h(p.title)+' · '+(p.visible?'منشور':'مخفي')+'</summary>'+entityEditor(tab,p)+'</details>').join('')+'</div>';
  else if(['orders','withdrawals'].includes(tab))content=reviews(tab);
  else if(tab==='users')content=investors();
  else if(tab==='audit')content=table(['التغيير','الهدف','المنفذ','التاريخ'],admin.audit.map(l=>[h(l.action),h(l.target),h(l.uid),h(date(l.at))]));
  else if(tab==='ledger')content=table(['العملية','المستثمر','المبلغ','المرجع','التاريخ'],admin.ledger.map(l=>[h(kindName(l.kind)),h(l.uid),h(usd(l.amount)),h(l.reference),h(date(l.at))]));
  else content=overview();
  return title('لوحة الإدارة','إدارة المحتوى ومراجعة العمليات التجريبية.','صلاحيات المدير')+'<nav class="tools" aria-label="أقسام الإدارة">'+['overview','settings','plans','sectors','articles','faqs','orders','withdrawals','users','ledger','audit'].map(k=>'<button class="btn '+(tab===k?'active':'')+'" data-action="tab" data-kind="'+k+'">'+titles[k]+'</button>').join('')+'</nav>'+section(titles[tab])+content;
}
async function render(focus=false){
 const turn=++generation;
 const [page='home',id]=route();
 if(!catalog)return;
 chrome(page);
 const shell=x=>'<div class="wrap pad-small">'+x+'</div>';
 if(page==='home')app.innerHTML=home();
 else if(page==='admin'){
   if(!account)app.innerHTML=shell(login('login'));
   else if(account.user.role!=='admin')app.innerHTML=shell(title('صلاحية الإدارة مطلوبة'));
   else{
     try {admin=await api('/admin/overview');if(turn===generation)app.innerHTML=shell(dashboard());}
     catch(e){if(turn===generation)app.innerHTML=shell(title('تعذر فتح لوحة الإدارة',e.message));}
   }
 }else if(page==='account')app.innerHTML=shell(investor());
 else if(page==='login'||page==='register')app.innerHTML=shell(account?investor():login(page));
 else app.innerHTML=shell(publicPage(page,id));
 if(focus&&turn===generation){window.scrollTo(0,0);app.focus({preventScroll:true});}
}
const cents=v=>Math.round(Number(v)*100);
document.addEventListener('submit',async e=>{
 const form=e.target;if(!form.matches('[data-form]'))return;
 e.preventDefault();
 const b=Object.fromEntries(new FormData(form)),type=form.dataset.form,buttons=[...form.querySelectorAll('button')];
 buttons.forEach(x=>x.disabled=true);
 try {
   if(['login','register'].includes(type)){
     const result=await api('/'+type,'POST',b);await refresh();
     const [page,id]=route();go(page==='subscribe'&&id?'subscribe/'+id:page==='order'&&id?'order/'+id:result.user.role==='admin'?'admin':'account');return;
   }
   if(['order','withdrawal'].includes(type)){
     form.dataset.nonce||=crypto.randomUUID();b.key=form.dataset.nonce;b.amount=cents(b.amount);
     const {record}=await api(type==='order'?'/orders':'/withdrawals','POST',b);
     await refresh();notify('تم تسجيل الطلب للمراجعة');
     if(type==='order')go('order/'+record.id);else await render();
     return;
   }
   if(type==='settings')await api('/admin/settings','PUT',b);
   else if(type==='catalog'){
     b.visible=Boolean(b.visible);b.order=Number(b.order);if(b.kind==='plans'){for(const k of ['min','max','bps'])b[k]=cents(b[k]);b.days=Number(b.days);}
     await api('/admin/'+b.kind+'/'+(b.id||crypto.randomUUID()),'PUT',b);
   }else if(type==='review')await api('/admin/'+b.kind+'/'+b.id,'PUT',{...b,status:e.submitter?.value,verified:Boolean(b.verified)});
   else if(type==='performance')await api('/admin/performance','POST',{...b,amount:cents(b.amount),verified:Boolean(b.verified)});
   await refresh();await render();notify('تم الحفظ');
 }catch(err){notify(err.message);}
 finally{buttons.forEach(x=>x.disabled=false);}
});
function csv(kind){
 const cols={ledger:['id','uid','kind','amount','reference','at','actor'],orders:['id','uid','amount','status','reference','at','plan'],withdrawals:['id','uid','amount','status','reference','at'],audit:['id','uid','action','target','detail','at']}[kind];
 const esc=v=>{let s=v&&typeof v==='object'?JSON.stringify(v):String(v??'');if(typeof v!=='number'&&/^\s*[=+@-]|^[\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const data=[cols.join(','),...admin[kind].map(r=>cols.map(k=>esc(k==='amount'?r[k]/100:r[k])).join(','))].join('\r\n');
 const url=URL.createObjectURL(new Blob(['\ufeff',data],{type:'text/csv;charset=UTF-8'})),a=document.createElement('a');
 a.href=url;a.download='sandbox-'+kind+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener('click',async e=>{
 const el=e.target.closest('[data-action]');if(!el)return;
 const {action,kind,id,disabled}=el.dataset;
 try{
   if(action==='menu'){const open=document.querySelector('#links').classList.toggle('open');el.setAttribute('aria-expanded',String(open));}
   if(action==='tab'){tab=kind;await render();}
   if(action==='logout'){await api('/logout','POST',{});account=null;admin=null;go('home');}
   if(action==='delete'&&confirm('حذف العنصر من العرض؟')){await api('/admin/'+kind+'/'+id,'DELETE',{});await refresh();await render();notify('تم الحذف');}
   if(action==='disable'&&confirm('تأكيد تغيير حالة الحساب؟')){await api('/admin/users/'+id,'PUT',{disabled:disabled==='true'});await render();notify('تم تحديث الحساب');}
   if(action==='csv')csv(kind);
   if(action==='refresh'){await refresh();await render();notify('تم تحديث بيانات الحساب');}
 }catch(err){notify(err.message);}
});
window.addEventListener('hashchange',()=>render(true));
(async()=>{try{await refresh();await render();}catch(e){app.innerHTML='<div class="wrap pad-small">'+title('تعذر فتح المنصة',e.message)+'</div>';}})();
