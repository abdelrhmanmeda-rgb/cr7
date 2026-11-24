import { isDesignPreview } from "./design-config";
import { getPublication } from "./universe-data";
import { OpportunityBrowser } from "./opportunities/widgets";

import { HomeMetrics, PreviewHomeMetric } from "./home-metrics";

export async function TrustNumbers({cinematic = false}: {cinematic?: boolean}){
  if (isDesignPreview) return <PreviewHomeMetric cinematic={cinematic}/>;
  const {metrics}=await getPublication();
  return <HomeMetrics metrics={metrics} cinematic={cinematic}/>;
}
export async function OpportunityList({featured=false,sector}:{featured?:boolean;sector?:string}={}){
  const {opportunities,available}=await getPublication();
  const records=opportunities.filter(o=>(!featured || o.featured) && (!sector || o.sector===sector));
  return <OpportunityBrowser records={records} featured={featured} sector={sector} available={available}/>;
}
