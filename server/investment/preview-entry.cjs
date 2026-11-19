function createPreview(env, load = () => import('./mount.mjs')) {
  let handler;
  return async function preview(req, res) {
    const reply = (status, body) => {
      res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
      res.end(JSON.stringify(body));
    };
    let origin;
    try { origin = new URL(env.INVESTMENT_SANDBOX_ORIGIN); } catch {}
    if (env.VERCEL_ENV !== 'preview' || env.INVESTMENT_MODE !== 'sandbox' ||
        !origin || origin.protocol !== 'https:' || origin.origin !== env.INVESTMENT_SANDBOX_ORIGIN ||
        origin.hostname === 'cr7botai.com' || origin.hostname.endsWith('.cr7botai.com') ||
        origin.hostname === 'cr7-kappa.vercel.app' || origin.host !== req.headers.host) {
      return reply(404, {error:'Preview unavailable'});
    }
    const path = (req.url || '').split('?')[0];
    if (path === '/') {
      res.writeHead(302, {Location:'/investment/', 'Cache-Control':'no-store'});
      return res.end();
    }
    if (path !== '/investment' && !path.startsWith('/investment/')) return reply(404, {error:'Not found'});
    if (!handler) handler = load().then(m => m.createInvestmentPreview(env)).catch(e => {handler = null; throw e;});
    let serve;
    try { serve = await handler; }
    catch { return reply(503, {error:'بيئة الاختبار مش مهيأة حاليًا'}); }
    return serve(req,res);
  };
}
module.exports = {createPreview};
