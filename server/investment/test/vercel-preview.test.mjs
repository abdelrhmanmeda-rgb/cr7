import {test} from 'node:test';
import assert from 'node:assert/strict';
import entry from '../preview-entry.cjs';
const {createPreview} = entry;

test('Vercel preview only routes investment with matching HTTPS host, never legacy API',async()=>{
  const env={VERCEL_ENV:'preview',INVESTMENT_MODE:'sandbox',INVESTMENT_SANDBOX_ORIGIN:'https://cr7-preview.example'};
  let loads=0;
  const load=async()=>{
    ++loads;
    return {createInvestmentPreview:async()=> (req,res)=>{res.end('isolated');}};
  };
  const preview=createPreview(env,load);
  const invoke=async (url,host='cr7-preview.example',run=preview)=>{
    let response;
    await run({url,headers:{host}},{writeHead(status,headers){response={status,headers};},end(body){response={...(response||{status:200}),body};}});
    return response;
  };
  assert.equal((await invoke('/investment/','cr7-kappa.vercel.app')).status,404);
  assert.equal((await invoke('/api/orders')).status,404);
  assert.equal((await invoke('/')).headers.Location,'/investment/');
  assert.equal(loads,0);
  assert.equal((await invoke('/investment/api/public')).body,'isolated');
  assert.equal((await invoke('/investment/style.css')).body,'isolated');
  assert.equal(loads,1);
  const failClosed=createPreview({...env,INVESTMENT_SANDBOX_ORIGIN:'https://admin.cr7botai.com'},load);
  assert.equal((await invoke('/investment/','admin.cr7botai.com',failClosed)).status,404);
  const broken=createPreview(env,async()=>{throw Error('secret credentials')});
  const error=await invoke('/investment/',undefined,broken);
  assert.equal(error.status,503); assert.doesNotMatch(error.body,/secret/);
});

test('investment branch never falls through to legacy when sandbox settings are missing',async()=>{
  const {readFile}=await import('node:fs/promises');
  const {runInNewContext}=await import('node:vm');
  const source=await readFile(new URL('../../src/app.js',import.meta.url),'utf8');
  const cases=[
    [{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feat/investment-preview'},'preview'],
    [{VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'feat/unrelated'},'legacy'],
    [{VERCEL_ENV:'production',INVESTMENT_MODE:'sandbox'},'legacy']
  ];
  for(const [env,expected] of cases){
    const module={};
    runInNewContext(source,{
      module,process:{env},
      require(path){
        if(path==='dotenv')return {config(){}};
        if(path==='./legacyApp')return 'legacy';
        if(path==='../investment/preview-entry.cjs')return {createPreview:()=> 'preview'};
        assert.fail('Unexpected module: '+path);
      }
    });
    assert.equal(module.exports,expected);
  }
});
