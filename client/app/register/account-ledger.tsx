"use client";
import {useState} from "react";
export type Entry = {id:string;kind:"deposit"|"withdrawal"|"gain"|"loss";amountMinor:number;at:string;balanceMinor:number};
export type Ledger = {currency:"USD";balanceMinor:number;capitalMinor:number;resultMinor:number;historyTruncated?:boolean;entries:Entry[]};
export type LedgerState={status:"loading"|"failed"}|{status:"ready";data:Ledger};
const labels={deposit:"إيداع معتمد",withdrawal:"سحب مسجّل",gain:"نتيجة ربح",loss:"نتيجة خسارة"};
const currency=new Intl.NumberFormat("ar",{style:"currency",currency:"USD",currencyDisplay:"code",minimumFractionDigits:2});
const date=new Intl.DateTimeFormat("ar",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
const money=(v:number)=>currency.format(v/100);
export function parseLedger(value:unknown):Ledger{
  if(!value||typeof value!=="object")throw Error();
  const x=value as Partial<Ledger>;
  if(x.currency!=="USD"||![x.balanceMinor,x.capitalMinor,x.resultMinor].every(Number.isSafeInteger)||!Array.isArray(x.entries))throw Error();
  if(!x.entries.every(e=>e&&typeof e.id==="string"&&Object.hasOwn(labels,e.kind)&&Number.isSafeInteger(e.amountMinor)&&e.amountMinor>0&&Number.isSafeInteger(e.balanceMinor)&&typeof e.at==="string"&&Number.isFinite(Date.parse(e.at))))throw Error();
  return {...x,entries:[...x.entries].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))} as Ledger;
}
const windows=[["all","الكل"],["30","٣٠ يوم"],["90","٩٠ يوم"]] as const;
export function windowRows(entries:Entry[],days:string,now:number){return days==="all"?entries:entries.filter(e=>Date.parse(e.at)>=now-Number(days)*86400000);}
function Chart({data}:{data:Ledger}){
  const [days,selectDays]=useState("all"),[cursor,setCursor]=useState<number|null>(null);
  const rows=windowRows(data.entries,days,Date.now()),idx=Math.min(Math.max(cursor??rows.length-1,0),rows.length-1),active=rows[idx];
  const W=660,H=168;
  let low=Infinity,high=-Infinity;for(const row of rows){low=Math.min(low,row.balanceMinor);high=Math.max(high,row.balanceMinor);}
  const min=rows.length?Date.parse(rows[0].at):0,max=rows.length?Date.parse(rows[rows.length-1].at):0;
  const X=(e:Entry,i:number)=>8+(W-16)*(max===min?(rows.length>1?i/(rows.length-1):.5):(Date.parse(e.at)-min)/(max-min));
  const Y=(v:number)=>high===low?H/2:H-12-(H-24)*(v-low)/(high-low);
  const points=rows.map((e,i)=>[X(e,i),Y(e.balanceMinor)]),path=points.map(([x,y],i)=>i===0?`M ${x} ${y}`:`H ${x} V ${y}`).join(" ");
  return <article id="sa-portfolio" className="sa-panel sa-history-chart"><span className="sa-caption">أداء الحساب</span><h2>تطوّر الرصيد</h2>
    <p>تغيّر الرصيد بعد كل قيد معتمد، ويشمل الإيداعات والسحوبات. الرسم ما يمثّل نسبة عائد.</p>
    <div className="sa-actions" aria-label="فترة الرسم">{windows.map(([n,label])=><button type="button" className="sa-outline" key={n} aria-pressed={days===n} onClick={()=>{selectDays(n);setCursor(null)}}>{label}</button>)}</div>
    {active?<><div className="sa-chart-drawing" dir="ltr"><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`تطوّر الرصيد في ${rows.length} قيد`} preserveAspectRatio="none">
      {[.2,.5,.8].map(y=><line key={y} x1="0" x2={W} y1={y*H} y2={y*H} stroke="#6a8a993a" strokeDasharray="4 6"/>)}
      <path d={path} fill="none" stroke="#118796" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/><circle cx={points[idx][0]} cy={points[idx][1]} r="4" fill="#f2ce8b"/></svg></div>
      <div role="status" className="sa-readout"><strong><bdi>{money(active.balanceMinor)}</bdi></strong><span>{labels[active.kind]} · {date.format(Date.parse(active.at))}</span></div>
      {rows.length>1&&<label className="sa-cursor">تنقّل بين القيود<input aria-label="اختيار نقطة الرصيد" dir="ltr" type="range" min={0} max={rows.length-1} value={idx} onChange={e=>setCursor(Number(e.currentTarget.value))}/></label>}
    </>:<p className="sa-note">ما فيه قيود مسجّلة في هالفترة.</p>}
  </article>;
}
function Composition({data}:{data:Ledger}){
  const capital=data.capitalMinor, result=data.resultMinor, total=data.balanceMinor;
  const comparable=total>0 && capital>=0 && result>=0;
  const percent=comparable?Math.max(0,Math.min(100,result/total*100)):0;
  const pct=new Intl.NumberFormat("ar",{maximumFractionDigits:1}).format(percent);
  return <article className="sa-panel sa-composition"><span className="sa-caption">تركيبة الرصيد</span><h2>رأس المال والنتيجة</h2>
    {comparable?<div className="sa-donut" role="img" aria-label={`النتيجة المسجّلة تمثّل ${pct}٪ من الرصيد`} style={{background:`conic-gradient(#e7c685 0 ${percent}%, #66bdbc ${percent}% 100%)`}}><span dir="rtl">{pct}٪</span></div>:
      <p className="sa-note">{total===0?"ما فيه رصيد موجب نعرض له توزيع.":"القيم تشمل نتائج أو تدفّقات سالبة؛ نعرضها بالمبلغ الفعلي."}</p>}
    <dl><div><dt>صافي رأس المال</dt><dd><bdi>{money(capital)}</bdi></dd></div><div><dt>صافي النتائج</dt><dd><bdi>{money(result)}</bdi></dd></div></dl>
    <small>هالتقسيم بحسب القيود، مو توزيع على فئات الأصول.</small>
  </article>;
}
function Activity({data}:{data:Ledger}){
  const [page,change]=useState(0),n=8,index=Math.min(page,Math.max(0,Math.ceil(data.entries.length/n)-1));
  const entries=data.entries.slice(Math.max(0,data.entries.length-(index+1)*n),Math.max(0,data.entries.length-index*n)).reverse();
  return <section id="sa-activity" className="sa-panel"><span className="sa-caption">سجل العمليات</span><h2>آخر القيود المعتمدة</h2>
    {data.historyTruncated===true && <p>تشوف هنا آخر ٣٦٦ قيد معتمد. الرصيد الإجمالي يشمل السجل كامل.</p>}{entries.length?<><div className="sa-scroll-table"><table><caption className="sa-sr">تاريخ ونوع وقيمة كل قيد، والرصيد الناتج عنه بالدولار الأمريكي</caption><thead><tr><th>التاريخ</th><th>العملية</th><th>المبلغ</th><th>الرصيد بعدها</th></tr></thead><tbody>{entries.map(e=><tr key={e.id}><td>{date.format(Date.parse(e.at))}</td><td>{labels[e.kind]}</td><td><bdi>{money((e.kind==="loss"||e.kind==="withdrawal"?-1:1)*e.amountMinor)}</bdi></td><td><bdi>{money(e.balanceMinor)}</bdi></td></tr>)}</tbody></table></div>
    {data.entries.length>n&&<div className="sa-actions"><button type="button" className="sa-outline" disabled={!index} onClick={()=>change(index-1)}>الأحدث</button><span>صفحة {index+1}</span><button type="button" className="sa-outline" disabled={(index+1)*n>=data.entries.length} onClick={()=>change(index+1)}>الأقدم</button></div>}</>:<p>ما فيه عمليات معتمدة في الحساب للحين.</p>}</section>;
}
export default function AccountLedger({state,refresh}:{state:LedgerState;refresh:()=>void}){
  if(state.status!=="ready")return <section className="sa-panel" id="sa-portfolio" aria-live="polite"><span className="sa-caption">بيانات المحفظة</span><h2>{state.status==="loading"?"نحمّل سجل حسابك":"تعذّر تحميل سجل الحساب"}</h2><p>{state.status==="loading"?"نجلب القيود المعتمدة من السجل.":"ما عرضنا أي مبلغ. جرّب تحدّث السجل بعد شوي."}</p>{state.status==="failed"&&<button type="button" className="sa-outline" onClick={refresh}>إعادة المحاولة</button>}</section>;
  const d=state.data;
  return <><div className="sa-metrics">{[["الرصيد المعتمد",d.balanceMinor],["صافي رأس المال",d.capitalMinor],["صافي النتائج المسجّلة",d.resultMinor]].map(([name,amount])=><article className="sa-panel" key={name}><span>{name}</span><strong><bdi>{money(Number(amount))}</bdi></strong></article>)}</div>
    <div className="sa-breakdown sa-ledger-breakdown"><Chart data={d}/><Composition data={d}/></div><Activity data={d}/><button className="sa-outline" onClick={refresh} type="button">تحديث سجل الحساب</button></>;
}
