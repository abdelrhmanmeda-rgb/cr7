import { notFound } from "next/navigation";
import { UHeader, UFooter } from "../../universe-shell";
import type { Metadata } from "next";
import { getPublication } from "../../universe-data";
import { OpportunityProfile } from "../widgets";
type Props = {params:Promise<{id:string}>};
async function item(params:Props["params"]){
  const {id}=await params;
  if(!/^[a-z0-9][a-z0-9-]{1,64}$/.test(id))notFound();
  const feed=await getPublication();
  if(!feed.available)return null;
  const result=feed.opportunities.find(o=>o.id===id);
  if(!result)notFound();
  return result;
}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const o=await item(params);return o?{title:o.name,description:o.intro}:{title:"تفاصيل الفرصة غير متاحة",robots:{index:false}};
}
export default async function OpportunityPage({params}:Props){
  const o=await item(params);
  return <div className="uv sgf-universe"><UHeader/>{o?<OpportunityProfile opportunity={o}/>:<main className="u-container u-block"><div className="u-panel"><span className="u-kicker">دليل الفرص</span><h1>تفاصيل الفرصة مو متاحة الحين</h1><p>ما قدرنا نحدّث الدليل. جرّب بعد شوي أو ارجع لقائمة الفرص.</p><a className="u-btn" href="/opportunities">الرجوع للدليل</a></div></main>}<UFooter/></div>;
}
