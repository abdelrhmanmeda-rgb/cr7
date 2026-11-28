import type { Metadata } from "next";
import { UFooter,UHeader } from "../universe-shell";
import { DisclosureLibrary } from "../capital-disclosures";
import { FullDisclosures } from "../disclosure-views";
import { getPublication } from "../universe-data";

export const revalidate = 60;
export const metadata:Metadata={title:"مركز الإفصاحات",description:"حالة الطرح وبيانات الكيان والترخيص ومستندات الصناديق المنشورة."};

export default async function DisclosuresPage(){
  const {available,content}=await getPublication();
  const names=Object.fromEntries(Object.entries(content.funds).map(([id,f])=>[id,f.name]));
  return <div className="uv sgf-universe"><UHeader/><main className="u-container">
    <nav className="u-crumb" aria-label="مسار الصفحة"><a href="/">الرئيسية</a><span aria-hidden="true">/</span><span aria-current="page">مركز الإفصاحات</span></nav>
    <header className="cc-pagehead"><span className="u-kicker">وثائق المنصة</span><h1>مركز الإفصاحات</h1><p>اطّلع على حالة الطرح، وبيانات الكيان، ومكتبة مستندات الصناديق.</p></header>
    {!available&&<p className="cc-disclosure-proof" role="status">ما قدرنا نحمّل البيانات المنشورة الحين.</p>}
    <FullDisclosures data={content.disclosure} names={names}/>
    <DisclosureLibrary/>
  </main><UFooter/></div>;
}
