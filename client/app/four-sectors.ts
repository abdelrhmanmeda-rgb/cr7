export const fields = [
  {id:"property", name:"صندوق الاستثمارات العقارية", category:"أصول عقارية", icon:"building", aliases:"الاستثمار العقاري استثمارات عقارية العقار العقارات عقار عقاري تأجير التطوير السكني التجاري", intro:"يركّز الصندوق على العقارات السكنية والتجارية، ويستهدف فرص الدخل من التأجير وتنمية قيمة العقار مع الوقت."},
  {id:"gold", name:"صندوق الذهب والمعادن الثمينة", category:"معادن ثمينة", icon:"coins", aliases:"ذهب ذهبي سبائك سبيكة معدن معادن فضة بلاتين", intro:"يركّز الصندوق على الذهب والمعادن الثمينة لتنويع المحفظة. يرتبط أداؤه بتحرّك أسعار المعادن في الأسواق."},
  {id:"market", name:"صندوق الأسواق المالية والتداول", category:"أسواق مالية", icon:"growth", aliases:"سوق أسواق تداول متاجرة الأسهم سهم بورصة فوركس", intro:"يركّز الصندوق على الأصول المتداولة في الأسواق المالية، ويبحث عن فرص النمو مع مراعاة السيولة وحدود المخاطر."},
  {id:"energy", name:"صندوق الطاقة والمشروعات", category:"بنية تحتية", icon:"energy", aliases:"طاقة مشاريع مشروع مشروعات شمس رياح متجددة موارد", intro:"يركّز الصندوق على مشاريع الطاقة والبنية التحتية، ويستهدف فرص الدخل على مدى أطول من تشغيل المشاريع وبيع إنتاجها."},
] as const;
export type Field = (typeof fields)[number];
export type FieldId = Field["id"];
export type FieldValues = {rate?:number; minimum?:number; source:string; asOf:string};
export type FieldSettings = Partial<Record<FieldId,FieldValues>>;
export const fieldOf = (id:string) => fields.find(item=>item.id===id);

export function numberInput(text:string) {
  const raw=text.trim().replace(/[٠-٩۰-۹]/g,c=>String(c.charCodeAt(0)&15)).replace(/٫/g,".").replace(/[٬,\s]/g,"");
  return /^\d+(?:\.\d{1,2})?$/.test(raw) ? Number(raw) : NaN;
}

export function fieldQuery(text:string) {
  const normalized=text.toLowerCase().normalize("NFKC").replace(/[\u064B-\u065Fـ]/g,"").replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه");
  return normalized.replace(/(?:^|\s)ال(?=\S)/g," ").trim().replace(/\s+/g," ");
}

export function findFields(query:string, settings:FieldSettings, mode:"all"|"atLeast") {
  const q=query.trim();
  if(!q) return [...fields];
  const piece=q.match(/[٠-٩۰-۹0-9]+(?:[.٫][٠-٩۰-۹0-9]{1,2})?/);
  if(piece){
    const rate=numberInput(piece[0]);
    const above=mode==="atLeast" || /(?:على الأقل|فوق|أعلى من|>=|≥)/.test(q);
    const tail=fieldQuery(q.replace(piece[0]," ").replace(/[%٪≥>=]/g," ").replace(/في المية|في المئة|بالمئة|أعلى من|على الأقل|فوق|(?:ال)?عائد|(?:ال)?مستهدف|(?:ال)?أسبوعي(?:ًا|ا)?/g," "));
    return fields.filter(f=>{
      const value=settings[f.id]?.rate;
      if(value===undefined)return false;
      return (above?value>=rate:Math.abs(value-rate)<0.00001) && (!tail||tail.split(" ").every(token=>fieldQuery(f.name+" "+f.aliases).includes(token)));
    });
  }
  const term=fieldQuery(q);
  return fields.filter(f=>term.split(" ").every(token=>fieldQuery(f.name+" "+f.aliases).includes(token)));
}
