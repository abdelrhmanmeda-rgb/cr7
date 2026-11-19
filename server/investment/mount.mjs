import { investmentHandler } from './lib/api.mjs';
import { firebaseSandbox } from './lib/firebase.mjs';
// Mount before express.json(). A disabled preview does not intercept any legacy routes.
export async function createInvestmentPreview(env=process.env) {
  if (env.INVESTMENT_MODE!=='sandbox') throw Error('Sandbox mode is required');
  if(!/^https:\/\/[a-z0-9.-]+$/i.test(env.INVESTMENT_SANDBOX_ORIGIN||'')) throw Error('Independent HTTPS sandbox origin required');
  if (/^https:\/\/(www\.)?cr7botai\.com$/i.test(env.INVESTMENT_SANDBOX_ORIGIN)||env.INVESTMENT_SANDBOX_ORIGIN==='https://cr7-kappa.vercel.app') throw Error('Legacy domains cannot serve the investment sandbox');
  return investmentHandler({...await firebaseSandbox(env),origin:env.INVESTMENT_SANDBOX_ORIGIN});
}
export async function mountInvestment(app,env=process.env) {
  if(env.INVESTMENT_MODE!=='sandbox') return;
  const handler=await createInvestmentPreview(env);
  app.use((req,res,next)=>{
    if(req.headers.host!==new URL(env.INVESTMENT_SANDBOX_ORIGIN).host)return next();
    return handler(req,res,next);
  });
}
