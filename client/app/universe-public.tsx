import { getPublication } from "./universe-data";
import { OpportunityBrowser } from "./opportunities/widgets";
import { HomeMetrics } from "./home-metrics";
import { SectorCatalog,SectorTerms } from "./sector-catalog";
import { readFundSettings } from "./fund-publication";
import { fieldOf,type FieldId } from "./four-sectors";

export async function TrustNumbers(_props?:{cinematic?:boolean}){
  const {metrics,available}=await getPublication();
  return <HomeMetrics metrics={metrics} available={available}/>;
}

export async function FundCatalog({search,heading,compact}:{search?:boolean;heading?:string;compact?:boolean}){
  const {opportunities}=await getPublication();
  return <SectorCatalog search={search} heading={heading} compact={compact} settings={readFundSettings(opportunities)}/>;
}

export async function FundTerms({id}:{id:FieldId}){
  const {opportunities}=await getPublication();
  return <SectorTerms id={id} settings={readFundSettings(opportunities)}/>;
}

export async function OpportunityList({featured=false,sector}:{featured?:boolean;sector?:string}={}){
  const {opportunities,available}=await getPublication();
  const records=opportunities.filter(o=>!!fieldOf(o.sector) && (!featured || o.featured) && (!sector || o.sector===sector));
  return <OpportunityBrowser records={records} featured={featured} sector={sector} available={available}/>;
}
