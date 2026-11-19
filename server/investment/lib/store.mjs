import { DatabaseSync } from 'node:sqlite';
export function sqlite(path) {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS data (kind TEXT NOT NULL, id TEXT NOT NULL, owner TEXT, value TEXT NOT NULL, PRIMARY KEY(kind,id)); CREATE INDEX IF NOT EXISTS data_owner ON data(kind,owner); CREATE TRIGGER IF NOT EXISTS immutable_update BEFORE UPDATE ON data WHEN OLD.kind IN (\'ledger\',\'audit\',\'refs\',\'keys\') BEGIN SELECT RAISE(ABORT,\'immutable\'); END; CREATE TRIGGER IF NOT EXISTS immutable_delete BEFORE DELETE ON data WHEN OLD.kind IN (\'ledger\',\'audit\',\'refs\',\'keys\') BEGIN SELECT RAISE(ABORT,\'immutable\'); END;');
  const one=db.prepare('SELECT value FROM data WHERE kind=? AND id=?'), all=db.prepare('SELECT value FROM data WHERE kind=?'), own=db.prepare('SELECT value FROM data WHERE kind=? AND owner=?');
  function tx() {
    const ops=[];
    return {
      get:async(k,id)=>JSON.parse(one.get(k,id)?.value ?? 'null'),
      list:async(k,uid)=> (uid ? own.all(k,uid) : all.all(k)).map(r=>JSON.parse(r.value)),
      put:(k,id,v)=>ops.push(()=>db.prepare('INSERT INTO data(kind,id,owner,value) VALUES(?,?,?,?) ON CONFLICT(kind,id) DO UPDATE SET owner=excluded.owner,value=excluded.value').run(k,id,v.uid??null,JSON.stringify(v))),
      add:(k,id,v)=>ops.push(()=>db.prepare('INSERT INTO data(kind,id,owner,value) VALUES(?,?,?,?)').run(k,id,v.uid??null,JSON.stringify(v))),
      del:(k,id)=>ops.push(()=>db.prepare('DELETE FROM data WHERE kind=? AND id=?').run(k,id)),
      flush:()=>ops.forEach(f=>f())
    };
  }
  let queue=Promise.resolve();
  return {run(fn){
    const work=queue.then(async()=>{ db.exec('BEGIN IMMEDIATE'); const t=tx(); try { const r=await fn(t); t.flush(); db.exec('COMMIT'); return r; } catch(e){db.exec('ROLLBACK');throw e;} });
    queue=work.catch(()=>{});
    return work;
  },close:()=>db.close()};
}
