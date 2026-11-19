import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {sqlite} from '../lib/store.mjs';
import {investmentHandler} from '../lib/api.mjs';
import {firebaseSandbox} from '../lib/firebase.mjs';
import {mountInvestment} from '../mount.mjs';

test('test platform: sessions, ownership, admin catalog, ledger, holds, audit and durable storage',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'cr7-invest-')),path=join(dir,'test.db');
 const store=sqlite(path), adminLogin={email:'admin@example.test',password:'fixture-password-342'};
 const handler=investmentHandler({store,secure:false,previewAdmin:adminLogin});
 const server=createServer(handler);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const root='http://127.0.0.1:'+server.address().port+'/investment';
 const api=async(path,method='GET',data,session,headers={})=>{
  const r=await fetch(root+'/api'+path,{method,headers:{...headers,...(session?{Cookie:session}:{}),...(data?{'Content-Type':'application/json'}:{})},body:data?JSON.stringify(data):undefined});
  return {code:r.status,data:await r.json(),cookie:r.headers.get('Set-Cookie')?.split(';')[0]};
 };
 try {
  const publicSite=await api('/public');assert.equal(publicSite.data.sectors.length,8);assert.equal(publicSite.data.mode,'sandbox');
  assert.equal((await fetch(root+'/')).status,200);assert.equal((await fetch(root+'/app.js')).status,200);
  assert.equal((await api('/me')).code,401);
  assert.equal((await api('/register','POST',{},null,{Origin:'https://another.example'})).code,403);
  const reg={name:'مستثمر أول',email:'first@example.test',password:'test-account-358'};
  const a=await api('/register','POST',reg);assert.equal(a.code,201);
  assert.equal((await api('/register','POST',reg)).code,409);
  assert.equal((await api('/login','POST',{email:reg.email,password:'incorrect-password'})).code,401);
  const b=await api('/register','POST',{...reg,name:'مستثمر ثاني',email:'second@example.test'});
  const admin=await api('/login','POST',adminLogin);assert.equal(admin.code,200);
  assert.equal((await api('/admin/overview','GET',null,a.cookie)).code,403);
  const update={id:'suite',title:'خطة الاختبار',visible:true,order:0,min:100000,max:500000,bps:123,basis:'annual',days:90,terms:'شروط اختبار',features:''};
  assert.equal((await api('/admin/plans/suite','PUT',update,admin.cookie)).code,200);
  assert.ok((await api('/public')).data.plans.some(x=>x.id==='suite'));
  assert.equal((await api('/admin/settings','PUT',{...publicSite.data.settings,telegram:'https://t.me/example_support'},admin.cookie)).code,200);
  assert.equal((await api('/public')).data.settings.telegram,'https://t.me/example_support');
  assert.equal((await api('/orders','POST',{planId:'suite',amount:40,key:'range'},a.cookie)).code,400);
  const input={planId:'suite',amount:250000,key:'idem-check'};
  const placed=await Promise.all([api('/orders','POST',input,a.cookie),api('/orders','POST',input,a.cookie)]);
  const record=placed[0].data.record; assert.equal(record.id,placed[1].data.record.id);
  assert.equal((await api('/orders','POST',{...input,amount:260000},a.cookie)).code,409);
  let me=(await api('/me','GET',null,a.cookie)).data;
  assert.equal(me.balance.capital,0);assert.equal(me.orders.length,1);
  assert.equal((await api('/me','GET',null,b.cookie)).data.orders.length,0);
  const review='/admin/orders/'+record.id,ack={status:'confirmed',verified:true,reference:'TEST-DEPOSIT-ONE'};
  assert.equal((await api(review,'PUT',{...ack,verified:false},admin.cookie)).code,400);
  assert.equal((await api(review,'PUT',{...ack,reference:'REAL-01'},admin.cookie)).code,400);
  const confirmed=await Promise.all([api(review,'PUT',ack,admin.cookie),api(review,'PUT',ack,admin.cookie)]);
  assert.deepEqual(confirmed.map(x=>x.code).sort(),[200,409]);
  const rejected=(await api('/orders','POST',{...input,key:'different'},a.cookie)).data.record;
  assert.equal((await api('/admin/orders/'+rejected.id,'PUT',ack,admin.cookie)).code,409);
  assert.equal((await api('/admin/orders/'+rejected.id,'PUT',{status:'rejected'},admin.cookie)).code,200);
  const pnl={uid:a.data.user.uid,amount:1200,note:'نتيجة موثقة على بيانات وهمية',reference:'TEST-PNL-ONE',verified:true};
  assert.equal((await api('/admin/performance','POST',pnl,admin.cookie)).code,201);
  assert.equal((await api('/admin/performance','POST',pnl,admin.cookie)).code,409);
  const w=(await api('/withdrawals','POST',{amount:220000,key:'w1'},a.cookie)).data.record;
  assert.equal((await api('/withdrawals','POST',{amount:32000,key:'w2'},a.cookie)).code,409);
  me=(await api('/me','GET',null,a.cookie)).data;
  assert.equal(me.balance.held,220000);assert.equal(me.balance.available,31200);
  assert.equal((await api('/admin/withdrawals/'+w.id,'PUT',{...ack,reference:'TEST-WITHDRAWAL-ONE'},admin.cookie)).code,200);
  me=(await api('/me','GET',null,a.cookie)).data;
  assert.equal(me.balance.total,31200);assert.equal(me.balance.held,0);assert.equal(me.balance.performance,1200);assert.equal(me.ledger.length,3);assert.equal(me.balance.chart.length,3);
  assert.equal((await api('/admin/plans/suite','DELETE',{},admin.cookie)).code,200);
  assert.equal((await api('/me','GET',null,a.cookie)).data.orders[0].plan.title,update.title);
  const proof=(await api('/admin/overview','GET',null,admin.cookie)).data;
  assert.ok(proof.audit.find(x=>x.action==='ledger.performance'));
  await assert.rejects(store.run(async t=>t.del('ledger',proof.ledger[0].id)),/immutable/);
  assert.equal((await api('/admin/users/'+a.data.user.uid,'PUT',{disabled:true},admin.cookie)).code,200);
  assert.equal((await api('/me','GET',null,a.cookie)).code,401);
  assert.equal((await api('/admin/users/'+a.data.user.uid,'PUT',{disabled:false},admin.cookie)).code,200);
  assert.equal((await api('/me','GET',null,a.cookie)).code,401);
  const logged=await api('/login','POST',reg);assert.equal(logged.code,200);
  assert.equal((await api('/logout','POST',{},logged.cookie)).code,200);
  assert.equal((await api('/me','GET',null,logged.cookie)).code,401);
  const reopened=sqlite(path);
  try{assert.equal((await reopened.run(async t=>t.list('ledger',a.data.user.uid))).length,3);}finally{reopened.close();}
 }finally{await new Promise(r=>server.close(r));store.close();rmSync(dir,{recursive:true,force:true});}
});

test('adapter refuses missing and legacy Firebase targets without connecting',async()=>{
 await assert.rejects(firebaseSandbox({}),/Independent/);
 await assert.rejects(firebaseSandbox({INVESTMENT_MODE:'sandbox',INVESTMENT_FIREBASE_CREDENTIALS:'{}',INVESTMENT_FIREBASE_WEB_KEY:'dummy',INVESTMENT_LEGACY_FIREBASE_PROJECT:'legacy',INVESTMENT_SANDBOX_PROJECT:'cr7bot-85133'}),/Independent/);
 await assert.rejects(firebaseSandbox({INVESTMENT_MODE:'sandbox',INVESTMENT_FIREBASE_CREDENTIALS:'{"project_id":"wrong"}',INVESTMENT_FIREBASE_WEB_KEY:'dummy',INVESTMENT_LEGACY_FIREBASE_PROJECT:'legacy',INVESTMENT_SANDBOX_PROJECT:'safe-test'}),/mismatch/);
});

test('legacy app remains untouched until sandbox configured',async()=>{
 const app={use(){assert.fail('registered middleware unexpectedly');}};
 await mountInvestment(app,{});
 await assert.rejects(mountInvestment(app,{INVESTMENT_MODE:'sandbox',INVESTMENT_SANDBOX_ORIGIN:'https://www.cr7botai.com'}),/Legacy domains/);
});
