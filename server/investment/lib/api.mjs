import {createHash,randomBytes,randomUUID,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {readFile} from 'node:fs/promises';
import {seed} from './content.mjs';

const derive=promisify(scrypt), hash=s=>createHash('sha256').update(s).digest('hex'), now=()=>new Date().toISOString();
const failure=(status,message)=>{throw Object.assign(Error(message),{status});};
const must=(c,s,m)=>{if(!c)failure(s,m);};
const txt=(v,max=200,required=true)=>{must(typeof v==='string'&&v.length<=max&&(!required||v.trim()),400,'راجع النصوص المطلوبة');return v.trim();};
const size=(v,min,max)=>{must(Number.isSafeInteger(v)&&v>=min&&v<=max,400,'القيمة الرقمية خارج الحدود');return v;};
const ids=v=>{must(typeof v==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(v),400,'معرّف غير صحيح');return v;};
const money=v=>size(v,1,1e10);
const sort=(a,b)=>a.order-b.order||a.id.localeCompare(b.id);
const recent=(a,b)=>b.at.localeCompare(a.at);
const image=v=>{v=txt(v,1000,false);if(v){let u;try{u=new URL(v);}catch{} must(u?.protocol==='https:'&&!u.username&&!u.password&&u.hostname==='res.cloudinary.com',400,'استخدم رابط HTTPS من Cloudinary للصورة');}return v;};
const contact=v=>{v=txt(v,200,false);must(!v||/^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}\/?$/.test(v),400,'رابط تليجرام غير صحيح');return v;};
const csrf=(req,allowed)=>{const origin=req.headers.origin;if(origin){let u;try{u=new URL(origin);}catch{} must(u&&(allowed?u.origin===allowed:u.host===req.headers.host),403,'مصدر الطلب غير مصرح');}must(req.headers['sec-fetch-site']!=='cross-site',403,'مصدر الطلب غير مصرح');};
const files=new Map([
  ['/', [new URL('../public/index.html',import.meta.url),'text/html; charset=utf-8']],
  ['/style.css', [new URL('../public/style.css',import.meta.url),'text/css; charset=utf-8']],
  ['/app.js', [new URL('../public/app.js',import.meta.url),'text/javascript; charset=utf-8']]
]);

async function readBody(req){
  const chunks=[]; let n=0;
  for await(const c of req){n+=c.length;must(n<=32768,413,'الطلب كبير');chunks.push(c);}
  try {const x=JSON.parse(Buffer.concat(chunks).toString()); if(!x||typeof x!=='object'||Array.isArray(x))throw Error();return x;}catch{failure(400,'طلب غير صحيح');}
}
function summary(ledger,withdrawals){
  const sums={capital:0,performance:0,paid:0,held:0};
  for(const l of ledger){if(l.kind==='deposit') sums.capital+=l.amount;if(l.kind==='performance') sums.performance+=l.amount;if(l.kind==='withdrawal') sums.paid-=l.amount;}
  for(const w of withdrawals) if(w.status==='pending') sums.held+=w.amount;
  const total=sums.capital+sums.performance-sums.paid;
  let running=0;
  return {...sums,total,available:Math.max(0,total-sums.held),chart:[...ledger].sort((a,b)=>a.at.localeCompare(b.at)).map(l=>({at:l.at,total:running+=l.amount}))};
}
function settings(b){
  const s={...seed.settings};
  for(const k of Object.keys(s)){
    if(k==='logo'||k==='heroImage')s[k]=image(b[k]);
    else if(k==='telegram')s[k]=contact(b[k]);
    else if(k==='gold'||k==='background'){must(/^#[0-9a-f]{6}$/i.test(b[k]),400,'اختر لونًا صحيحًا');s[k]=b[k];}
    else s[k]=txt(b[k],['title','headline','homeTitle'].includes(k)?120:8000);
  }
  return s;
}
function editEntity(k,id,b){
  const common={id,title:txt(b.title,140),visible:b.visible===true,order:size(b.order,0,5000)};
  if(k==='plans'){
    const min=money(b.min),max=money(b.max);must(max>=min,400,'الحد الأقصى أقل من الأدنى');
    must(['annual','period'].includes(b.basis),400,'اختر أساس النسبة المستهدفة');
    return {...common,min,max,bps:size(b.bps,-10000,100000),basis:b.basis,returnType:b.basis==='annual'?'مستهدف سنوي غير مضمون':'مستهدف لكامل المدة غير مضمون',days:size(b.days,1,3650),terms:txt(b.terms,6000),features:txt(b.features,3000,false)};
  }
  if(k==='faqs')return {...common,body:txt(b.body,6000)};
  return {...common,summary:txt(b.summary,320),body:txt(b.body,12000),image:image(b.image)};
}

export function investmentHandler({store,external=null,base='/investment',origin='',secure=true,previewAdmin=null}){
  const ready=store.run(async t=>{
    if(await t.get('meta','seed'))return;
    t.add('meta','seed',{id:'seed'});
    t.add('settings','main',seed.settings);
    for(const k of ['plans','sectors','articles','faqs']) for(const record of seed[k])t.add(k,record.id,record);
  });
  ready.catch(()=>{});
  const audit=(t,uid,action,target,detail={})=>{const id=randomUUID();t.add('audit',id,{id,uid,action,target,detail,at:now(),mode:'sandbox'});};
  const financial=(t,uid,kind,amount,reference,actor,target)=>{const id=randomUUID();t.add('ledger',id,{id,uid,kind,amount,reference,actor,target,at:now(),mode:'sandbox'});};
  const evidence=async(t,b)=>{
    must(b.verified===true,400,'أقرّ بمراجعة العملية التجريبية أولًا');
    const reference=txt(b.reference,100);
    must(/^TEST-[A-Z0-9][A-Z0-9_-]{3,94}$/i.test(reference),400,'استخدم مرجع اختبار يبدأ بـ TEST-');
    const key=hash(reference.toLowerCase());
    must(!(await t.get('refs',key)),409,'مرجع العملية مستخدم بالفعل');
    t.add('refs',key,{id:key,reference,at:now()});
    return reference;
  };
  const authenticate=async req=>{
    const token=/(?:^|;\s*)cr7_invest=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1];
    must(token,401,'سجّل الدخول أولًا');
    const session=hash(token);
    const profile=await store.run(async t=>{
      const record=await t.get('sessions',session);
      if(!record||record.expires<Date.now())return null;
      return t.get('users',record.uid);
    });
    must(profile&&!profile.disabled&&(!external||await external.active(profile.uid)),401,'الجلسة غير متاحة');
    return {...profile,session};
  };
  const cookie=(token,age)=>'cr7_invest='+token+'; Path='+base+'; Max-Age='+age+'; HttpOnly; SameSite=Lax'+(secure?'; Secure':'');
  return async(req,res,next)=>{
    const send=(st,data)=>{res.writeHead(st,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
    try {
      const path=new URL(req.originalUrl||req.url,'http://localhost').pathname;
      if(path!==base && !path.startsWith(base+'/')){if(next)return next(); return send(404,{error:'الصفحة غير موجودة'});}
      await ready;
      const route=path.slice(base.length)||'/';
      if(req.method==='GET'&&files.has(route)){
        const [url,mime]=files.get(route);
        const html=await readFile(url);
        res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"});
        return res.end(html);
      }
      const method=req.method;
      if(!['GET','POST','PUT','DELETE'].includes(method))return send(405,{error:'طريقة طلب غير مدعومة'});
      if(method!=='GET'){csrf(req,origin);must(/^application\/json(?:;|$)/i.test(req.headers['content-type']||''),415,'صيغة الطلب غير مدعومة');}
      const b=method==='GET'?{}:await readBody(req);
      if(route==='/api/public'&&method==='GET'){
        return send(200,await store.run(async t=>{
          const p={settings:await t.get('settings','main'),mode:'sandbox'};
          for(const k of ['plans','sectors','articles','faqs'])p[k]=(await t.list(k)).filter(x=>x.visible).sort(sort);
          return p;
        }));
      }
      if(['/api/register','/api/login'].includes(route)&&method==='POST'){
        const email=txt(b.email,200).toLowerCase(),password=b.password;
        must(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&typeof password==='string'&&password.length>=12&&password.length<=128,400,'استخدم بريدًا صحيحًا وكلمة مرور من 12 حرفًا على الأقل');
        const registering=route==='/api/register';
        const ip=req.socket?.remoteAddress||'unknown';
        await store.run(async t=>{
          for(const [scope,limit] of [[registering?'register:'+ip:'login:'+ip,registering?15:60],['email:'+email,12]]){
            const id=hash(scope),old=await t.get('limits',id),at=Date.now();
            const count=old&&old.until>at?old.count:0;must(count<limit,429,'محاولات كثيرة، جرّب لاحقًا');
            t.put('limits',id,{id,count:count+1,until:count?old.until:at+600000});
          }
        });
        let u;
        if(external){
          try{u=registering?await external.register(email,password,txt(b.name,100)):await external.login(email,password);}
          catch{failure(registering?409:401,registering?'تعذر إنشاء الحساب':'بيانات الدخول غير صحيحة');}
          must(u,401,'بيانات الدخول غير صحيحة');
          u={uid:u.uid,email,name:u.name||'مستثمر',role:u.admin?'admin':'investor',at:now()};
        }else if(registering){
          const uid=randomUUID(),salt=randomBytes(16).toString('hex'), name=txt(b.name,100);
          const digest=(await derive(password,salt,64)).toString('hex');
          u={uid,email,name,role:'investor',at:now()};
          await store.run(async t=>{const id=hash(email);must(!(await t.get('emails',id)),409,'تعذر إنشاء الحساب بهذا البريد');t.add('emails',id,{id,uid});t.add('credentials',uid,{uid,salt,digest});t.add('users',uid,u);});
        }else{
          const found=await store.run(async t=>{const e=await t.get('emails',hash(email));return e?{u:await t.get('users',e.uid),c:await t.get('credentials',e.uid)}:null;});
          const configuredAdmin=previewAdmin&&email===previewAdmin.email;
          if(configuredAdmin){
            must(timingSafeEqual(Buffer.from(hash(password),'hex'),Buffer.from(hash(previewAdmin.password),'hex')),401,'بيانات الدخول غير صحيحة');
            u={uid:'preview-admin',email,name:'مدير الاختبار',role:'admin',at:now()};
          }else{
            const digest=await derive(password,found?.c.salt||'0000000000000000',64);
            must(found&&timingSafeEqual(digest,Buffer.from(found.c.digest,'hex')),401,'بيانات الدخول غير صحيحة');u=found.u;
          }
        }
        const token=randomBytes(32).toString('hex'),sid=hash(token);
        await store.run(async t=>{
          const old=await t.get('users',u.uid);
          must(!old?.disabled,403,'الحساب موقوف');
          t.put('users',u.uid,{...(old||u),role:u.role});
          t.add('sessions',sid,{id:sid,uid:u.uid,expires:Date.now()+8*3600000});
        });
        res.setHeader('Set-Cookie',cookie(token,28800));
        return send(registering?201:200,{user:u});
      }
      const user=await authenticate(req), {uid}=user;
      if(route==='/api/logout'&&method==='POST'){await store.run(async t=>t.del('sessions',user.session));res.setHeader('Set-Cookie',cookie('',0));return send(200,{ok:true});}
      if(route==='/api/me'&&method==='GET'){
        return send(200,await store.run(async t=>{
          const ledger=(await t.list('ledger',uid)).sort(recent), withdrawals=(await t.list('withdrawals',uid)).sort(recent);
          return {user:{uid,name:user.name,email:user.email,role:user.role},ledger:ledger.map(({actor,...entry})=>entry),orders:(await t.list('orders',uid)).sort(recent),withdrawals,balance:summary(ledger,withdrawals)};
        }));
      }
      if(['/api/orders','/api/withdrawals'].includes(route)&&method==='POST'){
        const submitting=route.endsWith('orders'), amount=money(b.amount), nonce=ids(b.key);
        const bucket=submitting?'orders':'withdrawals', planId=submitting?ids(b.planId):'';
        const result=await store.run(async t=>{
          const profile=await t.get('users',uid);must(profile&&!profile.disabled,403,'الحساب موقوف');
          const key=hash(uid+bucket+nonce), previous=await t.get('keys',key);
          if(previous){must(previous.amount===amount&&previous.planId===planId,409,'معرّف الطلب مستخدم لقيم مختلفة');return t.get(bucket,previous.target);}
          const id=randomUUID(), record={id,uid,amount,status:'pending',at:now(),mode:'sandbox'};
          if(submitting){
            const plan=await t.get('plans',planId);
            must(plan?.visible,404,'الخطة غير متاحة');
            must(amount>=plan.min&&amount<=plan.max,400,'المبلغ خارج حدود الخطة');
            record.plan={id:plan.id,title:plan.title,days:plan.days,bps:plan.bps,returnType:plan.returnType,min:plan.min,max:plan.max,terms:plan.terms};
          }else{
            const balance=summary(await t.list('ledger',uid),await t.list('withdrawals',uid));
            must(amount<=balance.available,409,'المبلغ أكبر من الرصيد المتاح للسحب');
          }
          t.add(bucket,id,record);t.add('keys',key,{id:key,uid,target:id,amount,planId});audit(t,uid,bucket+'.request',id,{amount,planId});return record;
        });
        return send(201,{record:result});
      }
      if(route.startsWith('/api/admin/')){
        must(user.role==='admin'&&(!external||await external.isAdmin(uid)),403,'صلاحية الإدارة مطلوبة');
        if(route==='/api/admin/overview'&&method==='GET'){
          return send(200,await store.run(async t=>{
            const out={settings:await t.get('settings','main')};
            for(const k of ['plans','sectors','articles','faqs'])out[k]=(await t.list(k)).sort(sort);
            for(const k of ['users','ledger','audit','orders','withdrawals'])out[k]=(await t.list(k)).sort(recent);
            return out;
          }));
        }
        if(route==='/api/admin/settings'&&method==='PUT'){
          const s=settings(b);
          await store.run(async t=>{t.put('settings','main',s);audit(t,uid,'content.settings','main');});
          return send(200,{ok:true});
        }
        const catalog=/^\/api\/admin\/(plans|sectors|articles|faqs)\/([A-Za-z0-9_-]+)$/.exec(route);
        if(catalog&&['PUT','DELETE'].includes(method)){
          const [,k,id]=catalog;ids(id);
          const record=method==='PUT'?editEntity(k,id,b):null;
          await store.run(async t=>{if(record)t.put(k,id,record);else t.del(k,id);audit(t,uid,'content.'+method,k+':'+id);});
          return send(200,{ok:true});
        }
        const review=/^\/api\/admin\/(orders|withdrawals)\/([A-Za-z0-9_-]+)$/.exec(route);
        if(review&&method==='PUT'){
          const [,bucket,id]=review, accept=b.status==='confirmed';
          must(['confirmed','rejected'].includes(b.status),400,'حالة غير صحيحة');
          await store.run(async t=>{
            const r=await t.get(bucket,id);
            must(r,404,'الطلب غير موجود');must(r.status==='pending',409,'تمت مراجعة الطلب بالفعل');
            let reference='';
            if(accept){
              if(bucket==='withdrawals'){
                const balance=summary(await t.list('ledger',r.uid),await t.list('withdrawals',r.uid));
                must(balance.total>=balance.held,409,'الرصيد الحالي لا يغطي المبالغ المحجوزة');
              }
              reference=await evidence(t,b);
              financial(t,r.uid,bucket==='orders'?'deposit':'withdrawal',bucket==='orders'?r.amount:-r.amount,reference,uid,id);
            }
            t.put(bucket,id,{...r,status:b.status,reference,reviewedAt:now()});audit(t,uid,bucket+'.'+b.status,id,{investor:r.uid,amount:r.amount,reference});
          });
          return send(200,{ok:true});
        }
        if(route==='/api/admin/performance'&&method==='POST'){
          const investor=ids(b.uid),amount=size(b.amount,-1e10,1e10),note=txt(b.note,500);
          must(amount!==0,400,'أدخل الربح أو الخسارة الفعلية');
          await store.run(async t=>{
            const profile=await t.get('users',investor);must(profile?.role==='investor',404,'الحساب غير موجود');
            const ledger=await t.list('ledger',investor);must(ledger.some(l=>l.kind==='deposit'),409,'لا يوجد إيداع مؤكد للحساب');
            const ref=await evidence(t,b);
            financial(t,investor,'performance',amount,ref,uid,investor);audit(t,uid,'ledger.performance',investor,{amount,ref,note});
          });
          return send(201,{ok:true});
        }
        const profile=/^\/api\/admin\/users\/([A-Za-z0-9_-]+)$/.exec(route);
        if(profile&&method==='PUT'){
          must(typeof b.disabled==='boolean',400,'حالة غير صحيحة');
          await store.run(async t=>{const u=await t.get('users',profile[1]);must(u?.role==='investor',404,'الحساب غير موجود');t.put('users',u.uid,{...u,disabled:b.disabled});for(const session of await t.list('sessions',u.uid))if(session.id)t.del('sessions',session.id);audit(t,uid,'account.status',u.uid,{disabled:b.disabled});});
          return send(200,{ok:true});
        }
      }
      return send(404,{error:'المسار غير موجود'});
    }catch(e){if(!e.status)console.error('Investment module:',e.name,e.code||'');return send(e.status||500,{error:e.status?e.message:'تعذر إتمام العملية'});}
  };
}
