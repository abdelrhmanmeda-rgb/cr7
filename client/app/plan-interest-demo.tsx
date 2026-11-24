"use client";

import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";

export function PlanInterestDemo({ name }: { name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [done, setDone] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDone(true);
  }

  return (
    <>
      <button type="button" className="u-btn gold" ref={opener} onClick={() => {
        setDone(false);
        dialog.current?.showModal();
      }}>جرّب تسجيل الاهتمام</button>
      <dialog ref={dialog} className="u-interest-dialog" aria-labelledby={titleId} onClose={() => opener.current?.focus()}>
        <button type="button" className="u-btn u-interest-close" onClick={() => dialog.current?.close()}>إغلاق</button>
        <span className="u-kicker">نموذج معاينة</span>
        <h2 id={titleId}>الاهتمام بـ{ name }</h2>
        {done ? (
          <p role="status" className="u-interest-result">تمت تجربة تسجيل الاهتمام. ما انرسل أي طلب أو بيانات، وما تم إنشاء اشتراك.</p>
        ) : (
          <form onSubmit={submit}>
            <p>جرّب الخطوة على النسخة التجريبية. ما تحتاج بريد أو بيانات شخصية.</p>
            <label className="u-interest-consent"><input type="checkbox" required /> فاهم إن هذي تجربة، وما فيها دفع أو اشتراك فعلي.</label>
            <button type="submit" className="u-btn gold">تأكيد التجربة</button>
          </form>
        )}
      </dialog>
    </>
  );
}
