import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UFooter,UHeader } from "../../../universe-shell";
import { DisclosureProof,DocumentLinks } from "../../../disclosure-views";
import { disclosureDocument } from "../../../disclosure-data";
import { getPublication } from "../../../universe-data";

type Props = {params:Promise<{slug:string}>};
export const dynamic = "force-dynamic";
async function lookup(params:Props["params"]){
  const [{slug},{content}]=await Promise.all([params,getPublication()]);
  const result=disclosureDocument(content.disclosure,slug);
  if(!result)notFound();
  return {...result,data:content.disclosure,name:content.funds[result.fund.id]?.name||result.fund.name};
}
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {kind,name}=await lookup(params);
  return {title:`${kind.title} | ${name}`};
}
export default async function DocumentPage({params}:Props) {
  const {fund,kind,doc,data,name}=await lookup(params);
  return <div className="uv sgf-universe"><UHeader/><main className="u-container">
    <nav className="u-crumb" aria-label="مسار الصفحة"><a href="/">الرئيسية</a><span aria-hidden="true">/</span><a href="/disclosures/#documents">مستندات الصناديق</a><span aria-hidden="true">/</span><span aria-current="page">{kind.title}</span></nav>
    <header className="cc-pagehead"><span className="cc-capital-tag">وثيقة منشورة</span><h1>{kind.title}</h1><p>{name}</p></header>
    <article className="cc-capital-detail cc-capital-document-body"><DisclosureProof source={doc.source} asOf={doc.asOf}/><div className="cc-document-text">{doc.body}</div><a className="cc-inline" href="/disclosures/#documents">ارجع لمكتبة المستندات</a></article>
    <section className="cc-capital-detail cc-capital-more-docs" aria-labelledby="more-docs-title"><h2 id="more-docs-title">وثائق هالصندوق</h2><DocumentLinks id={fund.id} data={data} current={kind.id}/></section>
  </main><UFooter/></div>;
}
