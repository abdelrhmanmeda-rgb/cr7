import { getPublication } from "./universe-data";
import { MetricBand, OpportunityBrowser } from "./opportunities/widgets";

export async function TrustNumbers(){
  const {metrics}=await getPublication();
  return <MetricBand metrics={metrics}/>;
}
export async function OpportunityList({featured=false,sector}:{featured?:boolean;sector?:string}={}){
  const {opportunities,available}=await getPublication();
  const records=opportunities.filter(o=>(!featured || o.featured) && (!sector || o.sector===sector));
  return <OpportunityBrowser records={records} featured={featured} sector={sector} available={available}/>;
}
