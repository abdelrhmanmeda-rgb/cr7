import {useEffect,useRef,useState} from "react";
import type {FormEvent} from "react";

type Kind="deposit"|"withdrawal"|"gain"|"loss";
type Entry={id:string;kind:Kind;amountMinor:number;balanceMinor:number;at:string};
type Account={uid:string;email:string;currency:"USD";balanceMinor:number;capitalMinor:number;resultMinor:number;entries:Entry[]};
type Submission={uid:string;kind:Kind;amount:string;reference:string;requestId:string};
const titles:Record<Kind,string>={deposit:"إيداع معتمد",withdrawal:"سحب موثّق",gain:"نتيجة ربح",loss:"نتيجة خسارة"};
const api=(import.meta.env.VITE_SGF_LEDGER_API || "https://cr7-kappa.vercel.app").replace(/\/+$/,"")+"/api/universe/admin";
const dollars=(minor:number)=>new Intl.NumberFormat("ar",{style:"currency",currency:"USD",currencyDisplay:"code"}).format(minor/100);
function readAccount(d:unknown):Account{
  if(!d||typeof d!=="object")throw Error("تعذّرت قراءة سجل المستثمر.");
  const a=d as Partial<Account>;
  if(typeof a.uid!=="string"||!a.uid||typeof a.email!=="string"||a.currency!=="USD"||![a.balanceMinor,a.resultMinor,a.capitalMinor].every(Number.isSafeInteger)||!Array.isArray(a.entries)||
      !a.entries.every(e=>e&&Object.hasOwn(titles,e.kind)&&typeof e.id==="string"&&Number.isSafeInteger(e.amountMinor)&&Number.isSafeInteger(e.balanceMinor)&&typeof e.at==="string"&&Number.isFinite(Date.parse(e.at))))throw Error("رد الخادم لا يتضمن سجلًا صالحًا.");
  return d as Account;
}
function msg(e:unknown){return e instanceof Error?e.message:"تعذّر الاتصال بالخادم.";}
function statusMessage(code:number){return code===401||code===403?"حساب الإدارة ما عنده صلاحية لهذا الإجراء.":code===404?"الحساب غير موجود أو غير مؤهل للتسجيل المالي.":code===409?"فيه تعارض في السجل أو قيد مكرّر. راجع القيود قبل أي تسجيل جديد.":code===400||code===422?"الخادم ما اعتمد القيد. راجع المبلغ ونوعه والمرجع.":"الخدمة غير متاحة حاليًا.";}
export default function UniverseLedger({getToken}:{getToken:()=>Promise<string>}){
  const [query,setQuery]=useState(""),[key,setKey]=useState<"email"|"uid">("email"),[account,setAccount]=useState<Account|null>(null),[busy,setBusy]=useState(false);
  const [kind,setKind]=useState<Kind>("deposit"),[amount,setAmount]=useState(""),[reference,setReference]=useState(""),[confirmed,setConfirmed]=useState(false),[notice,setNotice]=useState(""),[retry,setRetry]=useState<Submission|null>(null);
  const lock=useRef(false),alive=useRef(true);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  async function request(path:string,init:RequestInit={}){
    const token=await getToken();if(!token)throw Error("سجّل دخولك بحساب الإدارة.");
    let res:Response;
    try {res=await fetch(api+path,{...init,headers:{Authorization:"Bearer "+token,...init.headers},redirect:"error",cache:"no-store",signal:AbortSignal.timeout(15000)});}
    catch {throw Error("تعذّر تأكيد رد الخادم. تأكد من اتصالك.");}
    if(!res.ok){const body=await res.json().catch(()=>null);const detail=res.status>=400&&res.status<500&&typeof body?.message==="string"&&body.message.length<=180?body.message:statusMessage(res.status);throw Object.assign(Error(detail),{http:res.status});}
    return res;
  }
  function clearDraft(){setAmount("");setReference("");setConfirmed(false);setRetry(null);}
  function reset(){setAccount(null);clearDraft();setNotice("");}
  async function lookup(e:FormEvent){
    e.preventDefault();if(lock.current)return;const q=query.trim();reset();if(!q)return;
    lock.current=true;setBusy(true);
    try{const data=readAccount(await(await request("/account?"+new URLSearchParams({[key]:q}))).json());if(alive.current)setAccount(data);}
    catch(err){if(alive.current)setNotice(msg(err));}finally{lock.current=false;if(alive.current)setBusy(false);}
  }
  async function post(e:FormEvent){
    e.preventDefault();if(!account||lock.current||!confirmed)return;
    const a=amount.trim(),r=reference.trim();
    if(!/^(?:0|[1-9]\d{0,10})(?:\.\d{1,2})?$/.test(a)||!(Number(a)>0)||r.length<4){setNotice("اكتب مبلغًا موجبًا بالدولار بدقة منزلتين كحد أقصى ومرجعًا مستنديًا.");return;}
    const payload=retry||{uid:account.uid,kind,amount:a,reference:r,requestId:crypto.randomUUID()};
    if(payload.uid!==account.uid)return;
    lock.current=true;setBusy(true);setNotice("");setRetry(payload);
    try{
      const receipt=await(await request("/entries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})).json().catch(()=>null);
      if(receipt?.success!==true || receipt.id!==payload.requestId)throw Error("ما وصل تأكيد صالح للقيد.");
      if(!alive.current)return;clearDraft();setNotice("تم اعتماد القيد. نحدّث السجل…");
      try{const current=readAccount(await(await request("/account?"+new URLSearchParams({uid:payload.uid}))).json());if(alive.current){setAccount(current);setNotice("تم اعتماد القيد وتحديث السجل.");}}
      catch{if(alive.current){setAccount(null);setNotice("تم اعتماد القيد، وتعذّر تحديث العرض. ابحث عن الحساب مجددًا؛ لا تكرّر القيد.");}}
    }catch(err){
      if(!alive.current)return;
      const http=(err as {http?:number})?.http;
      if(http&&http>=400&&http<500){setRetry(null);setConfirmed(false);setNotice(msg(err));}
      else setNotice(msg(err)+" أعد المحاولة بنفس الطلب حتى ما يتكرر القيد.");
    }finally{lock.current=false;if(alive.current)setBusy(false);}
  }
  const locked=busy||!!retry;
  return <section className="un-editor" dir="rtl" aria-busy={busy}>
    <span>محافظ المستثمرين</span><h2>دفتر القيود المعتمدة</h2><p>سجّل حركة موثّقة على الحساب بعد التحقق من مستندها. التسجيل هنا ما ينفّذ تحويل أو دفع.</p>
    <form className="un-grid" onSubmit={lookup}>
      <label className="un-field"><span>البحث بواسطة</span><select disabled={locked} value={key} onChange={e=>{setKey(e.target.value as typeof key);setQuery("");reset();}}><option value="email">البريد الإلكتروني</option><option value="uid">معرّف المستثمر</option></select></label>
      <label className="un-field"><span>{key==="email"?"بريد المستثمر":"معرّف الحساب"}</span><input required dir="ltr" type={key==="email"?"email":"text"} maxLength={254} disabled={locked} value={query} onChange={e=>{setQuery(e.target.value);reset()}}/></label>
      <button type="submit" disabled={locked}>اعرض الحساب</button>
    </form>
    {notice&&<p role="status">{notice}</p>}
    {account&&<><article className="un-card"><h3>سجل <bdi>{account.email}</bdi></h3><p>معرّف المستثمر: <bdi>{account.uid}</bdi></p><p>الرصيد: <bdi>{dollars(account.balanceMinor)}</bdi> · صافي رأس المال: <bdi>{dollars(account.capitalMinor)}</bdi> · صافي النتائج: <bdi>{dollars(account.resultMinor)}</bdi></p></article>
    <form onSubmit={post} className="un-card"><h3>إضافة قيد موثّق</h3><p>التصحيح يتم بقيد مقابل مع الإشارة للمرجع الأصلي. قيود السجل لا تُعدل ولا تُحذف.</p>
      <label className="un-field"><span>نوع القيد</span><select value={kind} disabled={locked} onChange={e=>{setKind(e.target.value as Kind);setConfirmed(false)}}>{Object.entries(titles).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <label className="un-field"><span>المبلغ (USD)</span><input required disabled={locked} dir="ltr" inputMode="decimal" placeholder="12.34" maxLength={14} value={amount} onChange={e=>{setAmount(e.target.value);setConfirmed(false)}}/></label>
      <label className="un-field"><span>مرجع المستند أو القيد الأصلي</span><input required minLength={4} maxLength={180} disabled={locked} value={reference} onChange={e=>{setReference(e.target.value);setConfirmed(false)}}/></label>
      <label className="un-check"><input required disabled={locked} type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>راجعت الحساب والمبلغ ومصدر العملية</label>
      <button type="submit" disabled={busy||!confirmed}>{busy?"جارٍ المعالجة…":retry?"تأكيد نفس الطلب":"اعتماد القيد"}</button>
    </form><details className="un-card"><summary>آخر القيود المعتمدة</summary>{account.entries.length?<ul>{account.entries.slice(-25).reverse().map(e=><li key={e.id}>{new Date(e.at).toLocaleDateString("ar")} · {titles[e.kind]} · <bdi>{dollars(e.amountMinor)}</bdi> · الرصيد <bdi>{dollars(e.balanceMinor)}</bdi></li>)}</ul>:<p>ما فيه قيود مسجّلة.</p>}</details></>}
  </section>;
}
