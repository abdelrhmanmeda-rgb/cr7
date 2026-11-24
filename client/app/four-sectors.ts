export const fields = [
  {id:"property", name:"صندوق الاستثمارات العقارية", category:"أصول عقارية", icon:"building", rate:3, minimum:1000, aliases:"الاستثمار العقاري استثمارات عقارية العقار العقارات عقار عقاري تأجير التطوير السكني التجاري", intro:"من الأصول السكنية والتجارية إلى المشاريع المدرة للدخل؛ شوف وش يفرّق بين ملكية العقار وتطويره وتشغيله."},
  {id:"gold", name:"صندوق الذهب والمعادن الثمينة", category:"معادن ثمينة", icon:"coins", rate:5, minimum:500, aliases:"ذهب ذهبي سبائك سبيكة معدن معادن فضة بلاتين", intro:"تعرّف على الذهب والمعادن، والفرق بين امتلاك السبائك والاستثمار بأداة مرتبطة بسعر المعدن."},
  {id:"market", name:"صندوق الأسواق المالية والتداول", category:"أسواق مالية", icon:"growth", rate:4, minimum:750, aliases:"سوق أسواق تداول متاجرة الأسهم سهم بورصة فوركس", intro:"خذ فكرة عن التداول والأسواق المالية، وكيف تختلف الأدوات في السيولة والتكاليف وطريقة التنفيذ."},
  {id:"energy", name:"صندوق الطاقة والمشروعات", category:"بنية تحتية", icon:"energy", rate:2, minimum:1500, aliases:"طاقة مشاريع مشروع مشروعات شمس رياح متجددة موارد", intro:"استكشف مشاريع الطاقة، من إنشاء محطات الشمس والرياح إلى تشغيلها وبيع إنتاجها."},
] as const;
export type Field = (typeof fields)[number];
export type FieldId = Field["id"];
export type FieldValues = {rate:number; minimum:number};
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

export function findFields(query:string, settings:FieldSettings, mode:"all"|"atLeast", sample=true) {
  const q=query.trim();
  if(!q) return [...fields];
  const piece=q.match(/[٠-٩۰-۹0-9]+(?:[.٫][٠-٩۰-۹0-9]{1,2})?/);
  if(piece){
    const rate=numberInput(piece[0]);
    const above=mode==="atLeast" || /(?:على الأقل|فوق|أعلى من|>=|≥)/.test(q);
    const tail=fieldQuery(q.replace(piece[0]," ").replace(/[%٪≥>=]/g," ").replace(/في المية|في المئة|بالمئة|أعلى من|على الأقل|فوق|(?:ال)?عائد|(?:ال)?أسبوعي(?:ًا|ا)?/g," "));
    return fields.filter(f=>{
      const value=settings[f.id]?.rate??(sample?f.rate:undefined);
      if(value===undefined)return false;
      return (above?value>=rate:Math.abs(value-rate)<0.00001) && (!tail||tail.split(" ").every(token=>fieldQuery(f.name+" "+f.aliases).includes(token)));
    });
  }
  const term=fieldQuery(q);
  return fields.filter(f=>term.split(" ").every(token=>fieldQuery(f.name+" "+f.aliases).includes(token)));
}
