import { fields,type FieldSettings } from "./four-sectors";

const pattern = /^العائد الأسبوعي المستهدف: ([0-9]{1,3}(?:\.[0-9]{1,2})?)%$/u;
const minimumPattern = /^الحد الأدنى للاشتراك: ([0-9]{1,10}(?:\.[0-9]{1,2})?) دولار أمريكي$/u;

function readAmount(text:string, syntax:RegExp, cap:number){
  const values=text.split(/\r?\n/u).map(line=>syntax.exec(line.trim())).filter(result=>result!==null);
  if(values.length!==1)return undefined;
  const n=Number(values[0][1]);
  return Number.isFinite(n)&&n>=0&&n<=cap?n:undefined;
}

type Record = {
  sector:string;strategy:string;liquidity:string;source:string;asOf:string;
};

export function readFundSettings(opportunities:readonly Record[]):FieldSettings{
  // The caller supplies the existing verified and published public projection.
  // The amounts are optional lines in the strategy and liquidity, so there is no database migration.
  const result:FieldSettings={};
  for(const field of fields){
    const published=opportunities.filter(record=>record.sector===field.id).flatMap(record=>{
      const rate=readAmount(record.strategy,pattern,100);
      const minimum=readAmount(record.liquidity,minimumPattern,1e9);
      return rate===undefined&&minimum===undefined?[]:[{rate,minimum,source:record.source,asOf:record.asOf}];
    });
    if(published.length===1)result[field.id]=published[0];
  }
  return result;
}
