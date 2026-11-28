'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {entryInput,post,statement,publication}=require('../src/universe/book');
// Contract double: atomic all-or-nothing writes; real Firestore provides serialization/retries.
function store(){let docs=new Map(),queue=Promise.resolve();
 const col=(path)=>({path,doc(id){return{path:path+'/'+id,id,async get(){const key=path+'/'+id;return {exists:docs.has(key),data:()=>docs.get(key)}},collection(n){return col(path+'/'+id+'/'+n)}}},orderBy(){return{limit(n){return{prefix:path+'/',n}}}}});
 const run=async cb=>{const next=new Map(docs),tx={async get(r){if(r.prefix){const rows=[...docs].filter(([k])=>k.startsWith(r.prefix)).sort((a,b)=>b[1].sequence-a[1].sequence).slice(0,r.n);return {docs:rows.map(([k,v])=>({id:k.split('/').pop(),data:()=>v}))}}return{exists:docs.has(r.path),data:()=>docs.get(r.path)}},set(r,v){next.set(r.path,v)},create(r,v){assert(!next.has(r.path));next.set(r.path,v)}};const res=await cb(tx);docs=next;return res};
 return {collection:col,runTransaction(cb){const turn=queue.then(()=>run(cb));queue=turn.catch(()=>{});return turn},audit(){return [...docs.keys()].filter(k=>k.startsWith('audit/')).length}}}
const make=(kind,amount,extras={})=>entryInput({uid:'person-A',kind,amount,reference:'DOC-'+randomUUID(),requestId:randomUUID(),...extras});
test('amounts use integer cents only; malformed or zero amounts rejected',()=>{assert.equal(make('gain','10.01').amountMinor,1001);for(const v of ['0','-1','2.001','1e3','1,700',1,null])assert.throws(()=>make('gain',v),{status:400})});
test('parallel duplicate creates one ledger record and one audit record',async()=>{const db=store(),e=make('deposit','100');const r=await Promise.all([post(db,e,'admin'),post(db,e,'admin')]);assert.deepEqual(r.map(x=>x.duplicate),[false,true]);assert.equal(db.audit(),1);assert.equal((await statement(db,e.uid)).balanceMinor,10000)});
test('re-used evidence and conflicting idempotency keys never double post',async()=>{const db=store(),e=make('deposit','50');await post(db,e,'admin');await assert.rejects(post(db,{...e,requestId:randomUUID()},'admin'),{status:409});await assert.rejects(post(db,{...e,amountMinor:100},'admin'),{status:409});assert.equal(db.audit(),1)});
test('four entry types reconcile, negative balances rejected, statements owner scoped and private fields omitted',async()=>{const db=store();for(const [kind,amount] of [['deposit','100'],['gain','5.25'],['withdrawal','20'],['loss','1.50']])await post(db,make(kind,amount),'admin');await assert.rejects(post(db,make('withdrawal','1000'),'admin'),{status:409});const mine=await statement(db,'person-A');assert.equal(mine.capitalMinor,8000);assert.equal(mine.resultMinor,375);assert.equal(mine.balanceMinor,8375);assert.deepEqual(mine.entries.map(x=>x.balanceMinor),[10000,10525,8525,8375]);assert.equal(db.audit(),4);assert.equal((await statement(db,'person-B')).entries.length,0);assert(!('reference' in mine.entries[0]||'actor' in mine.entries[0]))});
test('only reviewed, dated, bounded public records are accepted; unknown/private fields removed',()=>{const m={id:'metric-test',label:'عدد تقارير',value:0,unit:'تقرير',source:'التقرير المنشور',asOf:'2025-01-01',published:true,verified:true,privateNote:'omit'};const b={version:1,revision:0,metrics:[m],opportunities:[]};assert(!('privateNote'in publication(b).metrics[0]));for(const patch of [{verified:false},{asOf:'2025-02-31'},{source:''},{value:NaN}])assert.throws(()=>publication({...b,metrics:[{...m,...patch}]}),{status:400})});
test('HTTP contract: owner identity, admin allowlist, publication revision, posted balance and public isolation',async()=>{
 const {createServer}=require('node:http'),express=require('express'),{makeRouter}=require('../src/universe/routes');
 const prev=[process.env.SGF_UNIVERSE_ENABLED,process.env.SGF_UNIVERSE_ADMIN_UIDS];process.env.SGF_UNIVERSE_ENABLED='1';process.env.SGF_UNIVERSE_ADMIN_UIDS='allowed';
 const db=store(),users={alice:{uid:'person-A',emailVerified:true,email:'alice@example.test'},bob:{uid:'person-B',emailVerified:true,email:'bob@example.test'}};
 const ownerAuth={verifyIdToken:async(t,check)=>{assert.equal(check,true);if(!users[t])throw Error();return {uid:users[t].uid,email_verified:users[t].emailVerified}},getUser:async u=>Object.values(users).find(v=>v.uid===u),getUserByEmail:async em=>Object.values(users).find(v=>v.email===em)};
 const adminAuth={verifyIdToken:async(t,check)=>{assert.equal(check,true);if(!['operator','visitor'].includes(t))throw Error();return {uid:t==='operator'?'allowed':'ordinary'}}};
 const app=express();app.use(express.json());app.use(makeRouter(()=>({db,ownerAuth}),()=>adminAuth));const server=createServer(app);await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const req=(p,t,method='GET',b)=>fetch('http://127.0.0.1:'+server.address().port+p,{method,headers:{...(t?{authorization:'Bearer '+t}:{}),'content-type':'application/json'},body:b?JSON.stringify(b):undefined});
 try{assert.equal((await req('/me')).status,401);assert.equal((await req('/admin/publication','alice')).status,401);assert.equal((await req('/admin/publication','visitor')).status,403);
 const entry=make('deposit','245.79');let res=await req('/admin/entries','operator','POST',{...entry,amount:'245.79'});assert.equal(res.status,201);
 assert.equal((await(await req('/me','alice')).json()).balanceMinor,24579);assert.equal((await(await req('/me?uid=person-A','bob')).json()).balanceMinor,0);assert.equal((await(await req('/admin/account?email=alice@example.test','operator')).json()).uid,'person-A');
 const b={version:1,revision:0,metrics:[],opportunities:[]};res=await req('/admin/publication','operator','PUT',b);assert.equal((await res.json()).data.revision,1);assert.equal((await req('/admin/publication','operator','PUT',b)).status,409);
 const pub=await(await req('/public')).json();assert.deepEqual(Object.keys(pub.data).sort(),['metrics','opportunities','revision','version']);assert(!JSON.stringify(pub).includes('person-A'));
 }finally{await new Promise(r=>server.close(r));for(const [i,k] of ['SGF_UNIVERSE_ENABLED','SGF_UNIVERSE_ADMIN_UIDS'].entries()){if(prev[i]===undefined)delete process.env[k];else process.env[k]=prev[i];}}
});

test('content saves without the ledger and only a signed reviewed snapshot goes public',async()=>{
 const express=require('express'),{createServer}=require('node:http'),{makeRouter}=require('../src/universe/routes');
 const {open}=require('../src/universe/publication-seal');
 const db=store(),signingKey='publication-test-key-for-local-fixtures-only';
 const old=process.env.SGF_UNIVERSE_ADMIN_UIDS;
 const auth={verifyIdToken:async token=>({uid:token==='admin'?'owner':'visitor'})};
 const app=express();app.use(express.json());app.use(makeRouter(()=>{throw new Error('ledger is disabled');},()=>auth,()=>({db,signingKey}),null));
 const server=createServer(app);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const req=(path,token,body)=>fetch('http://127.0.0.1:'+server.address().port+path,{method:body?'PUT':'GET',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 const draft={version:1,revision:0,metrics:[],opportunities:[],content:{
  funds:{gold:{name:'صندوق الذهب',intro:'تنويع الأصول',photo:'gold',keywords:'سبائك',inExplorer:false,rate:5.25,minimum:300,publishTerms:true,source:'وثيقة معلنة',asOf:'2025-01-01',actor:'never publish'}},
  home:{headline:'صناديق الخليج'},
  contact:{telegramChat:'@ExampleSupport',telegramChannel:'https://t.me/+ExampleGroup42',message:'تواصل معنا',privateEmail:'never publish'},
  explorer:{quickSearch:'ذهب،معادن',byRate:false},
  disclosure:{entity:{name:'Fixture entity',jurisdiction:'Fixture jurisdiction',license:'REG-42',regulator:'Fixture regulator',published:true,source:'Fixture register',asOf:'2025-01-01'},offer:{status:'scheduled',start:'2040-01-01',end:'2040-01-28',unitPrice:22,published:true,source:'Fixture notice',asOf:'2025-01-01'},documents:{gold:{factsheet:{published:true,body:'Fixture factsheet',source:'Fixture copy',asOf:'2025-01-01'},terms:{published:false,body:'never publish'}},unrecognized:{factsheet:{published:true,body:'never publish'}}}},
 }};
 try{
  delete process.env.SGF_UNIVERSE_ADMIN_UIDS;assert.equal((await req('/admin/publication','admin')).status,503);
  process.env.SGF_UNIVERSE_ADMIN_UIDS='owner';
  assert.equal((await req('/admin/publication')).status,401);
  assert.equal((await req('/admin/publication','visitor',draft)).status,403);
  assert.equal((await req('/admin/publication','admin',{...draft,content:{...draft.content,contact:{telegramChat:'https://t.me.example.test/Support'}}})).status,400);
  assert.equal((await req('/admin/publication','admin',{...draft,content:{...draft.content,funds:{gold:{rate:8,publishTerms:true}}}})).status,400);
  const updatedDisclosure=patch=>({...draft,content:{...draft.content,disclosure:{...draft.content.disclosure,...patch}}});
  assert.equal((await req('/admin/publication','admin',updatedDisclosure({entity:{...draft.content.disclosure.entity,license:'DEMO-LIC-001'}}))).status,400);
  assert.equal((await req('/admin/publication','admin',updatedDisclosure({offer:{...draft.content.disclosure.offer,start:'2040-02-31'}}))).status,400);
  assert.equal((await req('/admin/publication','admin',updatedDisclosure({offer:{...draft.content.disclosure.offer,end:'2039-01-01'}}))).status,400);
  assert.equal((await req('/admin/publication','admin',updatedDisclosure({documents:{gold:{terms:{published:true,body:'Draft'}}}}))).status,400);
  assert.equal((await req('/admin/publication','admin',draft)).status,200);
  assert.equal((await req('/admin/publication','admin',draft)).status,409);
  assert.equal((await req('/admin/publication','admin',{version:1,revision:1,metrics:[],opportunities:[]})).status,200);
  const {disclosure,...oldDashboard}=draft.content;
  assert.equal((await req('/admin/publication','admin',{...draft,revision:2,content:oldDashboard})).status,200);
  const {data}=await(await req('/public')).json();
  assert.equal(data.content.disclosure.entity.license,'REG-42');
  assert.equal(data.content.disclosure.offer.end,'2040-01-28');
  assert.equal(data.content.disclosure.documents.gold.factsheet.body,'Fixture factsheet');
  assert.equal(data.content.disclosure.documents.gold.terms,undefined);
  assert.equal(data.content.disclosure.documents.unrecognized,undefined);

  assert.equal(data.content.funds.gold.rate,5.25);assert.equal(data.content.funds.gold.inExplorer,false);
  assert.equal(data.content.explorer.quickSearch,'ذهب،معادن');assert.equal(data.content.explorer.byRate,false);
  assert.equal(data.content.contact.telegramChat,'https://t.me/ExampleSupport');assert.equal(data.content.contact.telegramChannel,'https://t.me/+ExampleGroup42');
  assert(!JSON.stringify(data).includes('never publish'));
  const ref=db.collection('sgf_publication').doc('approved'), envelope=(await ref.get()).data();
  assert.deepEqual(open(envelope,signingKey),data);
  assert.equal((await req('/admin/publication','admin',{...draft,revision:3,content:{...oldDashboard,disclosure:{}}})).status,200);
  const {data:cleared}=await(await req('/public')).json();
  assert.deepEqual(cleared.content.disclosure,{});

  await db.runTransaction(tx=>tx.set(ref,{...envelope,data:{...envelope.data,revision:100}}));
  assert.equal((await req('/public')).status,503);
  assert.equal((await req('/admin/publication','admin',{...draft,revision:100})).status,503);
 }finally{await new Promise(resolve=>server.close(resolve));if(old===undefined)delete process.env.SGF_UNIVERSE_ADMIN_UIDS;else process.env.SGF_UNIVERSE_ADMIN_UIDS=old;}
});

test('configured fallback grants publication only to the exact authenticated account',async()=>{
 const {createServer}=require('node:http'),express=require('express'),{createHash}=require('node:crypto');
 const {makeRouter}=require('../src/universe/routes');
 const key='SGF_UNIVERSE_ADMIN_UIDS',prior=process.env[key];delete process.env[key];
 const db=store();
 const auth={verifyIdToken:async(token,check)=>{assert.equal(check,true);if(token==='invalid')throw Error();return {uid:token};}};
 const expected=createHash('sha256').update('fixtureOwner').digest('hex');
 const app=express();app.use(express.json());
 app.use(makeRouter(()=>{throw Error('ledger should not be reached');},()=>auth,()=>({db}),expected));
 const server=createServer(app);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const request=(path,token,method='GET')=>fetch('http://127.0.0.1:'+server.address().port+path,{
  method,headers:{...(token?{authorization:'Bearer '+token}:{}),'content-type':'application/json'},
  ...(method==='PUT'?{body:JSON.stringify({version:1,revision:0,metrics:[],opportunities:[]})}:{})
 });
 try{
  assert.equal((await request('/admin/publication')).status,401);
  assert.equal((await request('/admin/publication','invalid')).status,401);
  assert.equal((await request('/admin/publication','fixtureOwneR','PUT')).status,403);
  assert.equal((await request('/admin/account','fixtureOwner')).status,503);
  assert.equal((await request('/admin/entries','fixtureOwner','POST')).status,503);
  assert.equal((await request('/admin/publication','fixtureOwner')).status,200);
  assert.equal((await request('/admin/publication','fixtureOwner','PUT')).status,200);
  process.env[key]='configuredAdmin';
  assert.equal((await request('/admin/publication','fixtureOwner')).status,403);
  assert.equal((await request('/admin/publication','configuredAdmin')).status,200);
 }finally{
  await new Promise(resolve=>server.close(resolve));
  if(prior===undefined)delete process.env[key];else process.env[key]=prior;
 }
});
