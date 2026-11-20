"use client";
import {useRef} from "react";
import {LuxuryPhoto} from "./luxury-photo";
export default function Visual({art,title}:{art:string;title:string}){const ref=useRef<HTMLDialogElement>(null);return <><button className="u-gallery" onClick={()=>ref.current?.showModal()} aria-label={"كبّر الصورة: "+title}><LuxuryPhoto asset={art} leading/><span>تكبير المشهد ⤢</span></button><dialog ref={ref} className="u-lightbox" aria-label={title} onClick={e=>{if(e.target===e.currentTarget)ref.current?.close()}}><div><LuxuryPhoto asset={art}/></div><button className="u-btn" onClick={()=>ref.current?.close()}>إغلاق الصورة</button></dialog></>}
