import { cache } from "react";
import { unstable_cache } from "next/cache";

export const sectorNames = { property:"العقارات", gold:"الذهب والمعادن", market:"الأسواق المالية", energy:"الطاقة والمشروعات", funds:"الصناديق", income:"أدوات الدخل", stocks:"الأسهم", portfolio:"المحافظ", compare:"فرص متنوعة" } as const;
export type Sector = keyof typeof sectorNames;
export type Metric = { id:string; label:string; value:number; unit:string; source:string; asOf:string };
export type Opportunity = { id:string; name:string; sector:Sector; location:string; intro:string; strategy:string; risks:string; liquidity:string; source:string; asOf:string; featured:boolean };
type Catalog = {metrics:Metric[]; opportunities:Opportunity[]; available:boolean};
const obj = (x:unknown):Record<string,unknown> => x && typeof x==="object" && !Array.isArray(x) ? x as Record<string,unknown> : {};
const str = (x:unknown,n:number) => typeof x==="string" && x.trim().length<=n ? x.trim() : "";
const rows = (x:unknown) => Array.isArray(x) ? x.slice(0,60).map(obj) : [];
const idOf = (x:unknown) => typeof x==="string" && /^[a-z0-9][a-z0-9-]{1,64}$/.test(x) ? x : "";
const dateOf = (x:unknown) => { if(typeof x!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(x))return ""; const d=new Date(x+"T00:00:00Z"); return !Number.isNaN(+d) && d.toISOString().slice(0,10)===x && +d <= Date.now()?x:""; };
/** Only explicit public fields may leave the server. Ignore internal fields even if returned by a future adapter. */
export function readPublication(input:unknown):Catalog {
  const data=obj(input), metrics:Metric[]=[], opportunities:Opportunity[]=[];
  if(data.version!==1) return {metrics,opportunities,available:true};
  for (const v of rows(data.metrics)) {
    const id=idOf(v.id),label=str(v.label,80),unit=str(v.unit,28),source=str(v.source,140),asOf=dateOf(v.asOf);
    if(v.published!==true || v.verified!==true || !id || !label || !source || !asOf || typeof v.value!=="number" || !Number.isFinite(v.value) || Math.abs(v.value)>Number.MAX_SAFE_INTEGER || metrics.some(x=>x.id===id))continue;
    metrics.push({id,label,unit,source,asOf,value:v.value}); if(metrics.length===4)break;
  }
  for (const v of rows(data.opportunities)) {
    const id=idOf(v.id), name=str(v.name,100),sec=str(v.sector,24), location=str(v.location,90),intro=str(v.intro,380),strategy=str(v.strategy,2000),risks=str(v.risks,1500),liquidity=str(v.liquidity,1000),source=str(v.source,140),asOf=dateOf(v.asOf);
    if(v.published!==true || v.verified!==true || !id || !name || !Object.hasOwn(sectorNames,sec) || !intro || !strategy || !risks || !liquidity || !source || !asOf || opportunities.some(o=>o.id===id))continue;
    opportunities.push({id,name,sector:sec as Sector,location,intro,strategy,risks,liquidity,source,asOf,featured:v.featured===true});
  }
  return {metrics,opportunities,available:true};
}
const loadProjection = unstable_cache(async ():Promise<Catalog> => {
  try {
    const r=await fetch((process.env.SGF_UNIVERSE_API?.replace(/\/+$/,"") || "https://cr7-kappa.vercel.app")+"/api/universe/public",{cache:"no-store",signal:AbortSignal.timeout(2400),redirect:"error"});
    if(!r.ok)throw Error("public information unavailable");
    const body=await r.json();
    if(body?.success!==true)throw Error("public information unavailable");
    return readPublication(body.data);
  } catch { return {available:false,metrics:[],opportunities:[]}; }
},["smart-gulf-public-universe-v1"],{revalidate:60});
export const getPublication=cache(loadProjection);

// The explorer only needs an index; long descriptions and disclosures stay on the detail page.
export async function getUniverseData(){
  const data=await getPublication();
  return {available:data.available,opportunities:data.opportunities.map(({id,name,sector,intro})=>({id,title:name,sector,summary:intro}))};
}
