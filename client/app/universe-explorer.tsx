"use client";
import { useState } from "react";
import {Catalog,type Tile} from "./universe-catalog";
type Listing={id:string;title:string;sector:string;summary:string};
export default function Explorer({tiles,listings=[]}:{tiles:Tile[],listings?:Listing[]}){
 const [scope,setScope]=useState("guides"),[key,setKey]=useState("all"),[q,setQ]=useState("");
 const selectScope=(s:string)=>{setScope(s);setKey("all");setQ("")};
 const sectorName=(s:string)=>tiles.find(t=>t.slug===s)?.title||s;
 const noun=scope==="guides"?"المجالات":"الفرص";
 const norm=(s:string)=>s.replace(/[أإآ]/g,"ا").replace(/[ًٌٍَُِّْـ]/g,"").trim();
 const options=scope==="guides"?tiles.map(t=>[t.slug,t.title]):Array.from(new Set(listings.map(t=>t.sector))).map(s=>[s,sectorName(s)]);
 const guides=tiles.filter(t=>(key==="all"||key===t.slug)&&norm(t.title+" "+t.intro).includes(norm(q)));
 const funds=listings.filter(t=>(key==="all"||key===t.sector)&&norm(t.title+" "+t.summary).includes(norm(q)));
 const count=scope==="guides"?guides.length:funds.length;
 return <div className="u-explorer"><aside className="u-panel"><span className="u-kicker">أدوات البحث</span><h2>خصّص بحثك</h2><div className="u-chips">{[["guides","دليل المجالات"],["offers","الفرص المنشورة"]].map(([s,t])=><button key={s} aria-pressed={s===scope} onClick={()=>selectScope(s)}>{t}</button>)}</div><label>المجال<select value={key} onChange={e=>setKey(e.target.value)}><option value="all">كل المجالات</option>{options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label><label>كلمة البحث<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="مثلاً: الذهب"/></label><button className="u-btn" onClick={()=>{setKey("all");setQ("")}}>إعادة ضبط البحث</button></aside>
 <section><div className="u-heading"><div><span className="u-kicker">نتيجة اختيارك</span><h2>{noun}</h2></div><span role="status">{count.toLocaleString("ar")} نتائج</span></div>{count?(scope==="guides"?<Catalog tiles={guides} compact/>:<div className="u-values">{funds.map(f=><a key={f.id} href={"/opportunities/"+encodeURIComponent(f.id)}><small>{sectorName(f.sector)}</small><h3>{f.title}</h3><p>{f.summary}</p></a>)}</div>):<div className="u-empty"><span aria-hidden="true">◇</span><h3>{listings.length||scope==="guides"?"ما لقينا نتيجة تطابق اختيارك":"ما فيه فرص منشورة الحين"}</h3><p>تقدر تغيّر اختيارك أو ترجع لدليل المجالات.</p><button className="u-btn" onClick={()=>selectScope("guides")}>اعرض المجالات</button></div>}</section></div>
}
