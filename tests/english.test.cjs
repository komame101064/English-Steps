const fs=require('fs'),vm=require('vm'),assert=require('assert');const store={};
const el=()=>({innerHTML:'',textContent:'',classList:{add(){},remove(){}}});const els={'#main':el(),'#tabs':el(),'#toast':el()};
const ctx={console,Math,Date,JSON,setTimeout:()=>0,clearTimeout(){},URL,Blob:function(){},window:{scrollTo(){},addEventListener(){}},location:{hash:''},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v}},document:{querySelector:s=>els[s]||el(),createElement:()=>({click(){}})},
 fetch:async u=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('site/'+String(u).split('?')[0],'utf8'))})};ctx.window.addEventListener=()=>{};ctx.addEventListener=()=>{};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('site/en.js','utf8').replace("window.addEventListener('hashchange'","(()=>{})('hashchange'"),ctx);
(async()=>{await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));
 const W=vm.runInContext('W',ctx),P=vm.runInContext('P',ctx);
 // Data: 5000 words ordered by level (lv 1-4) with Japanese meanings, IPA and an example; 120 phrases; unique, stable ids.
 assert.equal(W.length,5000);assert.equal(P.length,120);assert(W.every(w=>/^en-\d{3,4}$/.test(w.id)&&w.w&&w.ja&&w.ipa&&w.ex&&w.exJa&&w.pos&&[1,2,3,4].includes(w.lv)));assert.equal(new Set(W.map(w=>w.id)).size,W.length);assert(P.every(p=>/^ep-\d{3}$/.test(p.id)&&p.en&&p.ja));
 const lvOf=vm.runInContext('levelOf',ctx);assert(W.every((w,i)=>i===0||W[i-1].lv<=w.lv),'sorted by level');assert(W.every(w=>lvOf(w)===w.lv-1));
 // Grammar: 37 lessons with 5 checked questions; dictionary finds words by English forms, Japanese and hiragana.
 const G=vm.runInContext('G',ctx);assert.equal(G.length,37);assert(G.every(g=>g.quiz.length===5&&g.quiz.every(q=>q.q.split('___').length===2&&q.choices.length===4&&q.a>=0&&q.a<4)&&g.ex.length>=3));
 vm.runInContext("R="+fs.readFileSync('site/data/ja-readings.json','utf8'),ctx);const dr=q=>vm.runInContext(`dictResults(${JSON.stringify(q)}).w.map(w=>w.w)`,ctx);
 assert.equal(dr('went')[0],'go');assert.equal(dr('children')[0],'child');assert(dr('食べる').includes('eat'));assert(dr('たべる').includes('eat'));assert(dr('ほてる').includes('hotel'));
 vm.runInContext("startGram('g01');gramAnswer(sess.qs[0].a)",ctx);assert.equal(vm.runInContext('sess.ok',ctx),1);vm.runInContext('sess=null;render()',ctx);
 for(const x of ['cat','dog','water','house','school'])assert(W.findIndex(w=>w.w===x)<100,x);
 assert(els['#main'].innerHTML.includes('今日の学習'));
 // A step: 10 new words shown, recalled both ways; full marks schedule them a day later; progress saved under its own key.
 vm.runInContext('startStep()',ctx);const s=vm.runInContext('sess',ctx);assert.equal(s.tasks.filter(t=>t.type==='learn').length,10);
 vm.runInContext("while(sess&&sess.i<sess.tasks.length){const t=sess.tasks[sess.i];if(t.type!=='learn'){render();const x=item(t);answer(sess.choices.findIndex(c=>c.id===x.id))}nextTask()}",ctx);
 const st=JSON.parse(store['english-steps-v1']);assert.equal(Object.values(st.rec).filter(r=>r.seen>0).length,10);assert.equal(st.today.steps,1);
 assert(Object.values(st.rec).every(r=>r.stage===1&&r.due>Date.now()+20*3600000));
 // Backups: bad ids and values are dropped.
 const z=vm.runInContext("sanitize({rec:{'en-001':{seen:2,stage:9,fav:1},'en-1500':{seen:1},'x':{}},perDay:7,rate:3})",ctx);assert.deepEqual(Object.keys(z.rec),['en-001','en-1500']);assert.equal(z.rec['en-001'].stage,6);assert.equal(z.perDay,1);
 // App identity: own manifest, icon and worker.
 const m=JSON.parse(fs.readFileSync('site/site.webmanifest','utf8'));assert(m.name==='English Steps'&&m.start_url==='./'&&m.scope==='./');assert(fs.existsSync('site/sw.js')&&fs.existsSync('site/icon.svg'));
 console.log('PASS: English Steps — 5000 words, 120 phrases, 37 grammar lessons, dictionary, step learning with spaced follow-up, separate storage, safe import.')})().catch(e=>{console.error(e);process.exit(1)});
