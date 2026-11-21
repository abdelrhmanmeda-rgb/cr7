"use client";
import {useState} from "react";
import {LuxuryPhoto} from "./luxury-photo";
export type Tile={slug:string;title:string;label:string;intro:string;art:string;family:string};
export function Catalog({tiles,search=false,compact=false}:{tiles:Tile[];search?:boolean;compact?:boolean}){
 const [q,setQ]=useState(""),[family,setFamily]=useState("الكل");
 const norm=(s:string)=>s.replace(/[أإآ]/g,"ا").replace(/[ًٌٍَُِّْـ]/g,"").trim();
 const filtered=tiles.filter(x=>(family==="الكل"||family===x.family)&&norm(x.title+" "+x.intro+" "+x.label).includes(norm(q)));
 return <div className="u-catalog">{search&&<div className="u-tools"><label>ابحث في الدليل<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="اكتب اسم المجال أو الموضوع"/></label><div className="u-chips" aria-label="تصفية المواضيع">{["الكل",...new Set(tiles.map(x=>x.family))].map(x=><button key={x} onClick={()=>setFamily(x)} aria-pressed={x===family}>{x}</button>)}</div></div>}
 {search&&<p role="status" className="u-found">{filtered.length?new Intl.NumberFormat("ar").format(filtered.length)+" نتائج":"ما لقينا نتيجة تطابق بحثك."}</p>}
 <div className={"u-tiles"+(compact?" u-compact":"")}>{filtered.map(x=><a className="u-tile" key={x.slug} href={"/guide/"+x.slug}><div className="u-thumb"><LuxuryPhoto asset={x.art}/><span className="u-open" aria-hidden="true">↗</span></div><div className="u-tile-copy"><small>{x.label}</small><h3>{x.title}</h3>{!compact&&<p>{x.intro}</p>}</div></a>)}</div>{!filtered.length&&<button className="u-btn" onClick={()=>{setQ("");setFamily("الكل")}}>امسح الفلاتر</button>}</div>
}
