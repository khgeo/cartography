/* Rich learning tools. No network, third-party libraries, or learner tracking. */
(function () {
  'use strict';
  const sims=window.EXTRA_SIMS=window.EXTRA_SIMS||{};
  const $=(el,s)=>el.querySelector(s), $$=(el,s)=>[...el.querySelectorAll(s)];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const f=(n,d=1)=>Number(n).toLocaleString('en-US',{maximumFractionDigits:d});
  const svg=(body,label,h=340)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 ${h}" role="img" aria-label="${esc(label)}">${body}</svg>`;
  const text=(x,y,s,size=17)=>`<text x="${x}" y="${y}" font-size="${size}">${esc(s)}</text>`;
  const box=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}"/>`;
  const circle=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" fill-opacity=".75" stroke="#164e63"/>`;
  const line=(x,y,x2,y2,c='#64748b',w=2)=>`<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  function shell(el,title,controls,note='គំរូសំយោគសម្រាប់សិក្សា · Synthetic teaching example') {
    el.classList.add('rich-sim');
    el.innerHTML=`<h3 class="sim-title">${title}</h3><p class="rich-note">${note}</p><div class="sim-controls">${controls}<button type="button" class="rich-reset">កំណត់ឡើងវិញ / Reset</button></div><div class="rich-stage"></div><div class="sim-out" role="status" aria-live="polite"></div>`;
    return {stage:$(el,'.rich-stage'),out:$(el,'.sim-out')};
  }
  function wire(el,draw,reset) {
    $$(el,'input,select').forEach(x=>x.addEventListener('input',draw));
    $(el,'.rich-reset').onclick=()=>{reset();draw();};draw();
  }
  sims['zoom-scale']=el=>{
    const {stage,out}=shell(el,'ពង្រីក មាត្រដ្ឋាន និងព័ត៌មាន / Zoom & scale',`<label>Zoom <input class="rz" type="range" min="1" max="4" step="1" value="1"></label>`);
    function draw(){const z=+$(el,'.rz').value,extent=12/z,scale=50000/z;
      let b=box(0,0,640,320,'#f1f5f9');
      b+=`<defs><clipPath id="zoom-clip"><rect x="15" y="15" width="610" height="285"/></clipPath></defs><g clip-path="url(#zoom-clip)"><g transform="translate(${320-320*z} ${160-160*z}) scale(${z})">`;
      b+=`<path d="M0 100 Q180 50 300 180T650 220" fill="none" stroke="#7dd3fc" stroke-width="18"/>`;
      for(let i=0;i<7;i++)b+=line(30+i*90,0,30+i*90,340,'#94a3b8',2/z);
      for(let i=0;i<5;i++)b+=line(0,30+i*70,640,30+i*70,'#cbd5e1',2/z);
      if(z>=2)for(let i=0;i<24;i++)b+=box(50+(i%8)*73,55+Math.floor(i/8)*87,8,6,'#eab308');
      [[120,90],[330,150],[520,240]].forEach(([x,y],i)=>{b+=circle(x,y,5/z,'#0e7490');if(z>=2)b+=text(x+8/z,y-6/z,['School','Market','Health'][i],15/z);});
      b+='</g></g>'+box(18,265,240,42,'#fff')+line(30,285,130,285,'#0f172a',5)+text(140,291,f(extent*100/610,2)+' km',15);
      stage.innerHTML=svg(b,'Zoomed schematic map',320);
      out.textContent=`Zoom ${z}× · 1:${f(scale,0)} (គំរូបោះពុម្ព) · ទទឹងមើលឃើញ ${f(extent)} km។ ការពង្រីកមិនបង្កើតទិន្នន័យថ្មីទេ។ RF លើអេក្រង់គ្រាន់តែជាគំរូ; ប្រើរបារមាត្រដ្ឋានសម្រាប់ទិដ្ឋភាពនេះ។`;
    }wire(el,draw,()=>$(el,'.rz').value=1);
  };
  sims['gps-quality']=el=>{
    const {stage,out}=shell(el,'គុណភាពទីតាំង GNSS / Position quality',`<label>មេឃមើលឃើញ <input class="sky" type="range" min="1" max="5" value="4"></label><label>ការឆ្លុះសញ្ញា <input class="multi" type="range" min="0" max="4" value="1"></label><label>រយៈពេល average <input class="avg" type="range" min="1" max="30" value="10"></label>`);
    function draw(){const sky=+$(el,'.sky').value,multi=+$(el,'.multi').value,avg=+$(el,'.avg').value;const err=clamp(18/sky+multi*2.2-0.22*Math.sqrt(avg),1.2,25);let b=box(0,0,640,300,'#e0f2fe');for(let i=0;i<sky+2;i++){const x=55+i*85;b+=circle(x,45,9,'#f59e0b')+line(x,55,320,225,'#60a5fa',2);}b+=box(40,185,130,115,'#94a3b8')+box(470,155,130,145,'#64748b')+circle(320,225,7,'#d32f2f')+`<circle cx="320" cy="225" r="${err*4}" fill="#ef4444" fill-opacity=".17" stroke="#d32f2f" stroke-dasharray="6 5"/>`+text(270,280,'Receiver',17);stage.innerHTML=svg(b,'Schematic GNSS sky visibility and uncertainty',300);out.textContent=`ភាពមិនប្រាកដប្រជាគំរូ ≈ ${f(err,1)} m។ មេឃបើកចំហ និង average ជួយបាន ប៉ុន្តែ multipath ពីជញ្ជាំងអាចបង្កលំអៀង។ នេះជាគំរូបង្រៀន មិនមែនការទស្សន៍ទាយឧបករណ៍។`;}
    wire(el,draw,()=>{$(el,'.sky').value=4;$(el,'.multi').value=1;$(el,'.avg').value=10;});
  };
  sims['total-station']=el=>{
    const {stage,out}=shell(el,'ពីមុំ និងចម្ងាយទៅកូអរដោនេ / Polar calculation',`<label>Azimuth ° <input class="az" type="range" min="0" max="359" value="40"></label><label>ចម្ងាយ m <input class="dist" type="range" min="10" max="200" value="100"></label><label>កំហុស orientation ″ <input class="sec" type="range" min="0" max="120" value="0"></label>`);
    function draw(){const az=+$(el,'.az').value,d=+$(el,'.dist').value,sec=+$(el,'.sec').value,a=az*Math.PI/180,ae=(az+sec/3600)*Math.PI/180;const e=500000+d*Math.sin(a),n=1280000+d*Math.cos(a),shift=2*d*Math.sin((sec/3600*Math.PI/180)/2);let b=box(0,0,640,310,'#f8fafc')+line(320,260,320,30,'#64748b',2)+text(327,45,'N',18)+circle(320,260,7,'#d32f2f');const x=320+180*Math.sin(a),y=260-180*Math.cos(a);b+=line(320,260,x,y,'#3949ab',5)+circle(x,y,10,'#f59e0b')+text(x+20,y,'P',20)+`<path d="M320 205 A55 55 0 0 1 ${320+55*Math.sin(a)} ${260-55*Math.cos(a)}" fill="none" stroke="#f59e0b" stroke-width="7"/>`;stage.innerHTML=svg(b,'Total station azimuth and distance diagram',310);out.textContent=`P ≈ E ${f(e,3)} m, N ${f(n,3)} m។ orientation error ${sec}″ នៅ ${d} m បង្ក side shift ប្រហែល ${f(shift*1000,1)} mm (គំរូ 2D)។`;}
    wire(el,draw,()=>{$(el,'.az').value=40;$(el,'.dist').value=100;$(el,'.sec').value=0;});
  };
  sims['symbol-editor']=el=>{
    const {stage,out}=shell(el,'ផ្ទៃរង្វង់ និងប្រជាជន / Proportional symbols',`<label>ប្រជាជន B <input class="pop" type="range" min="0" max="900000" step="25000" value="400000"></label><label><input class="wrong" type="checkbox"> សាកល្បងកំហុស r ∝ value</label>`);
    function draw(){const v=+$(el,'.pop').value,wrong=$(el,'.wrong').checked,ratio=v/100000,r=12*(wrong?ratio:Math.sqrt(ratio));
      stage.innerHTML=svg(circle(140,160,12,'#0891b2')+circle(440,160,r,'#f59e0b')+text(70,45,'A · 100,000')+text(360,45,'B · '+f(v,0))+text(70,290,'r = 4 mm')+text(350,290,'r = '+f(r/3,2)+' mm'),'Compare circle area and radius',320);
      out.textContent=`B/A៖ តម្លៃ ${f(ratio,2)}× · កាំ ${f(r/12,2)}× · ផ្ទៃ ${f((r/12)**2,2)}×។ ${wrong?'កំហុស៖ ផ្ទៃកើនតាមការ៉េនៃតម្លៃ។':'ត្រឹមត្រូវ៖ ផ្ទៃសមាមាត្រនឹងតម្លៃ។'} រង្វង់ A ជាយោង; mm ជាទំហំគំរូបោះពុម្ព។`;
    }wire(el,draw,()=>{$(el,'.pop').value=400000;$(el,'.wrong').checked=false;});
  };
  const palettes={sequential:['#eff6ff','#bfdbfe','#60a5fa','#2563eb','#1e3a8a'],diverging:['#2166ac','#92c5de','#f7f7f7','#f4a582','#b2182b'],qualitative:['#0072b2','#e69f00','#009e73','#cc79a7','#d55e00']};
  const luminance=hex=>{const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
  sims['palette-lab']=el=>{
    const {stage,out}=shell(el,'សិក្ខាសាលាពណ៌ / Palette lab',`<label>Palette <select class="palette">${Object.keys(palettes).map(k=>`<option>${k}</option>`).join('')}</select></label><label><input type="checkbox" class="gray"> Grayscale</label><label>ពណ៌អក្សរ <input type="color" class="ink" value="#172554"></label>`);
    function draw(){const p=$(el,'.palette').value,gray=$(el,'.gray').checked,ink=$(el,'.ink').value,li=luminance(ink),ratios=[];
      let b='';palettes[p].forEach((c,i)=>{const l=luminance(c),g=Math.round(255*(l<=.0031308?l*12.92:1.055*l**(1/2.4)-.055));ratios.push((Math.max(li,l)+.05)/(Math.min(li,l)+.05));b+=box(20+i*124,60,120,145,gray?`rgb(${g},${g},${g})`:c)+`<text x="${45+i*124}" y="140" fill="${ink}" style="fill:${ink}" font-size="24">${i+1}</text>`+text(25+i*124,240,gray?'gray':c,14)+text(25+i*124,273,f(ratios[i],2)+':1',16);});
      stage.innerHTML=svg(b,'Palette swatches, grayscale and text contrast',310);
      out.textContent=`Contrast អក្សរ/ផ្ទៃ៖ អប្បបរមា ${f(Math.min(...ratios),2)}:1។ ${p==='sequential'?'ពន្លឺត្រូវមានលំដាប់។':p==='diverging'?'កំណត់អត្ថន័យចំណុចកណ្តាលមុនប្រើ។':'ប្រើសម្រាប់ប្រភេទគ្មានលំដាប់។'} Contrast នេះវាស់តែអក្សរលើផ្ទៃ; មិនវាស់ភាពខុសគ្នារវាងថ្នាក់ទេ។`;
    }wire(el,draw,()=>{$(el,'.palette').value='sequential';$(el,'.gray').checked=false;$(el,'.ink').value='#172554';});
  };
  const values=[[20,40,65,10,80,0],[30,45,70,25,80,10],[40,60,75,null,85,15]];
  const areas=['ឃុំ ក','ឃុំ ខ','ឃុំ គ','ឃុំ ឃ','ឃុំ ង','ឃុំ ច'];
  const color=v=>v===null?'#e2e8f0':palettes.sequential[Math.min(4,Math.floor(v/20))];
  function gridMap(vals,selectable=false,zoom=1,pan=0){
    let b=`<defs><pattern id="missing-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="#64748b" stroke-width="2"/></pattern><clipPath id="grid-clip"><rect x="0" y="0" width="640" height="295"/></clipPath></defs><g clip-path="url(#grid-clip)"><g transform="translate(${320-320*zoom+pan} ${140-140*zoom}) scale(${zoom})">`;
    vals.forEach((v,i)=>{const x=35+(i%3)*190,y=20+Math.floor(i/3)*130;b+=`<g ${selectable?`class="map-feature" tabindex="0" role="button" data-area="${i}" aria-label="${areas[i]}: ${v===null?'ទិន្នន័យខ្វះ':v+'%'}"`:''}>${box(x,y,183,123,color(v))}${v===null?box(x,y,183,123,'url(#missing-hatch)'):''}${text(x+20,y+45,areas[i],20).replace('<text ',`<text style="fill:${v!==null&&v>=60?'#fff':'#0f172a'}" `)}${text(x+20,y+90,v===null?'Missing':v+'%',24).replace('<text ',`<text style="fill:${v!==null&&v>=60?'#fff':'#0f172a'}" `)}</g>`;});
    return b+'</g></g>'+text(30,325,'0–<20 · 20–<40 · 40–<60 · 60–<80 · 80–100%',16);
  }
  sims['time-player']=el=>{
    const {stage,out}=shell(el,'ពេលវេលា / Time player',`<label>ឆ្នាំ <select class="year"><option value="0">2020</option><option value="1">2022</option><option value="2">2025</option></select></label><button type="button" class="step">មួយជំហាន / Step</button><button type="button" class="play">លេង / Play</button>`);
    let timer=null;const stop=()=>{clearInterval(timer);timer=null;$(el,'.play').textContent='លេង / Play';};
    function draw(){const i=+$(el,'.year').value;stage.innerHTML=svg(gridMap(values[i]),'Synthetic water-service coverage by year');out.textContent=`ឆ្នាំ ${[2020,2022,2025][i]} · សេវាទឹក (%) · ព្រំថ្នាក់ថេរ · ${values[i].map((v,j)=>areas[j]+': '+(v===null?'missing':v+'%')).join(' · ')}`;}
    const step=()=>{$(el,'.year').value=(+$(el,'.year').value+1)%3;draw();};
    $(el,'.step').onclick=()=>{stop();step();};
    $(el,'.play').onclick=()=>{if(timer){stop();return;}$(el,'.play').textContent='ផ្អាក / Pause';timer=setInterval(()=>{if(!el.isConnected||document.hidden){stop();return;}step();},1800);};
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    wire(el,draw,()=>{stop();$(el,'.year').value=0;});
  };
  function dragStudio(el,layout){
    const {stage,out}=shell(el,layout?'សិក្ខាសាលាប្លង់ / Layout studio':'សិក្ខាសាលាស្លាក / Label studio',`<span>អូស ឬ Tab + ព្រួញ · Shift + ព្រួញ = 10 units</span>`);
    const original=layout?[
      {name:'ចំណងជើង · Title',x:175,y:150,w:280,h:35},
      {name:'Legend · 0–100%',x:200,y:245,w:180,h:55},
      {name:'ប្រភព · ឆ្នាំ · CRS',x:100,y:185,w:200,h:35}
    ]:[{name:'ភូមិ ក',x:200,y:130,w:125,h:45,ax:215,ay:150},{name:'ភូមិ ខ',x:275,y:158,w:130,h:45,ax:300,ay:185},{name:'សាលារៀន',x:250,y:175,w:180,h:45,ax:390,ay:150}];
    let items=original.map(x=>({...x})),drag=null;
    const intersects=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
    stage.innerHTML=svg('',layout?'Draggable map layout':'Draggable labels',420);
    const board=$(stage,'svg');board.setAttribute('role','group');
    function draw(focus=null){
      let b=box(0,0,640,420,'#f8fafc');
      if(layout){b+=box(20,20,600,52,'#e0f2fe')+box(20,90,600,230,'#bae6fd')+box(20,335,600,65,'#e0f2fe')+text(260,125,'MAP',22)+`<path d="M60 220Q220 150 390 245T600 230" stroke="#38bdf8" stroke-width="18" fill="none"/>`+text(450,382,'N ↑   ━ 2 km',16);}
      else{b+=`<path d="M0 260Q170 130 350 230T650 180" stroke="#7dd3fc" stroke-width="28" fill="none"/>`+line(60,70,570,300,'#94a3b8',5);items.forEach(it=>{b+=line(it.ax,it.ay,it.x+it.w/2,it.y+it.h/2,'#64748b',1)+circle(it.ax,it.ay,7,'#0f172a');});}
      items.forEach((it,i)=>{b+=`<g tabindex="0" role="button" aria-label="${esc(it.name)}; use arrow keys to move" data-item="${i}" class="drag-item" transform="translate(${it.x} ${it.y})">${box(0,0,it.w,it.h,'#fff')}<rect x="0" y="0" width="${it.w}" height="${it.h}" fill="none" stroke="#0e7490" stroke-width="2" rx="4"/>${text(8,layout?24:32,it.name,layout?20:25)}</g>`;});board.innerHTML=b;
      let collisions=0,obstacles=0;items.forEach((a,i)=>items.slice(i+1).forEach(b=>{if(intersects(a,b))collisions++;}));
      if(layout)obstacles=items.filter(a=>intersects(a,{x:20,y:90,w:600,h:230})).length;
      else items.forEach(a=>items.forEach(b=>{if(intersects(a,{x:b.ax-7,y:b.ay-7,w:14,h:14}))obstacles++;}));
      const far=layout?0:items.filter(a=>Math.hypot(a.x+a.w/2-a.ax,a.y+a.h/2-a.ay)>130).length;
      out.textContent=`ស្លាក/ធាតុជាន់គ្នា៖ ${collisions} · ${layout?'គ្របផែនទី':'គ្របចំណុច'}៖ ${obstacles}${layout?'':' · ឆ្ងាយពីចំណុច៖ '+far}។ ${collisions+obstacles+far===0?'ល្អ៖ ឥឡូវពិនិត្យការអាន និងការតម្រឹមដោយខ្លួនឯង។':'ផ្លាស់ទីដើម្បីកាត់បន្ថយការគ្របព័ត៌មាន។'} Feedback ពិនិត្យតែប្រអប់ និងចម្ងាយ; ការរចនានៅត្រូវការមនុស្សវាយតម្លៃ។`;
      if(focus!==null)$(board,`[data-item="${focus}"]`).focus({preventScroll:true});
    }
    const point=e=>{const r=board.getBoundingClientRect();return [(e.clientX-r.left)*640/r.width,(e.clientY-r.top)*420/r.height];};
    board.addEventListener('pointerdown',e=>{const target=e.target.closest('[data-item]');if(!target)return;e.preventDefault();const i=+target.dataset.item,[x,y]=point(e);drag={i,dx:x-items[i].x,dy:y-items[i].y};board.setPointerCapture(e.pointerId);});
    board.addEventListener('pointermove',e=>{if(!drag)return;const [x,y]=point(e),it=items[drag.i];it.x=clamp(x-drag.dx,8,632-it.w);it.y=clamp(y-drag.dy,8,412-it.h);draw();});
    board.addEventListener('pointerup',()=>{if(drag){const i=drag.i;drag=null;draw(i);}});
    board.addEventListener('pointercancel',()=>drag=null);
    board.addEventListener('keydown',e=>{const node=e.target.closest('[data-item]'),dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(!node||!dirs[e.key])return;e.preventDefault();const i=+node.dataset.item,it=items[i],d=dirs[e.key],step=e.shiftKey?10:2;it.x=clamp(it.x+d[0]*step,8,632-it.w);it.y=clamp(it.y+d[1]*step,8,412-it.h);draw(i);});
    $(el,'.rich-reset').onclick=()=>{items=original.map(x=>({...x}));draw();};draw();
  }
  sims['label-studio']=el=>dragStudio(el,false);
  sims['layout-studio']=el=>dragStudio(el,true);
  sims['web-map']=el=>{
    const {stage,out}=shell(el,'ផែនទីឌីជីថល offline / Web map',`<label>ស្រទាប់ <select class="layer"><option value="2">សេវាទឹក 2025 (%)</option><option value="0">សេវាទឹក 2020 (%)</option></select></label><label>Zoom <input class="zoom" type="range" min="1" max="2" step="0.25" value="1"></label><label>Pan <input class="pan" type="range" min="-220" max="220" value="0"></label>`);
    function draw(){const yr=+$(el,'.layer').value,vals=values[yr];stage.innerHTML=svg(gridMap(vals,true,+$(el,'.zoom').value,+$(el,'.pan').value),'Selectable synthetic commune map')+`<div class="rich-table-wrap"><table><caption>តារាងជំនួសផែនទី · Synthetic coverage (%)</caption><thead><tr><th>ឃុំ</th><th>2020</th><th>2025</th><th>ព័ត៌មាន</th></tr></thead><tbody>${areas.map((a,i)=>`<tr><td>${a}</td><td>${values[0][i]}</td><td>${values[2][i]===null?'Missing':values[2][i]}</td><td><button type="button" data-area="${i}">មើល ${a}</button></td></tr>`).join('')}</tbody></table></div>`;
      const choose=i=>{out.textContent=`${areas[i]} · ឆ្នាំ ${yr===0?2020:2025} · ${vals[i]===null?'ទិន្នន័យខ្វះ (មិនមែន 0%)':vals[i]+'% គ្រួសារមានសេវាទឹក'}។ ទិន្នន័យ និងព្រំឃុំសំយោគ; មិនមែនស្ថិតិពិតនៃកម្ពុជា។`;};
      $$(stage,'[data-area]').forEach(x=>{x.onclick=()=>choose(+x.dataset.area);x.onkeydown=e=>{if(x.tagName.toLowerCase()==='g'&&['Enter',' '].includes(e.key)){e.preventDefault();choose(+x.dataset.area);}};});
      out.textContent='ជ្រើសឃុំលើផែនទី ឬប្រើតារាង។ Tab → Enter ដើម្បីអានព័ត៌មាន។ ព្រំថ្នាក់ និងឯកតាត្រូវបានរក្សាទុកពេលប្តូរឆ្នាំ។';
    }wire(el,draw,()=>{$(el,'.layer').value=2;$(el,'.zoom').value=1;$(el,'.pan').value=0;});
  };
  function enhance(){
    $$(document,'.rich-quiz').forEach(quiz=>{if(quiz.dataset.ready)return;quiz.dataset.ready='1';const score=document.createElement('p');score.className='quiz-score';score.setAttribute('role','status');quiz.append(score);
      const fields=$$(quiz,'fieldset');const update=()=>score.textContent=`ចម្លើយត្រឹមត្រូវ / Correct: ${fields.filter(x=>$(x,'input:checked')?.value===x.dataset.answer).length} / ${fields.length}`;
      fields.forEach(field=>$$(field,'input').forEach(input=>input.addEventListener('change',()=>{const ok=input.value===field.dataset.answer,feedback=$(field,'.quiz-feedback');feedback.hidden=false;feedback.textContent=(ok?'✓ ត្រឹមត្រូវ។ ':'↺ សាកល្បងម្តងទៀត។ ')+$(field,'details p').textContent;field.classList.toggle('answered-correctly',ok);update();})));update();
      const reset=document.createElement('button');reset.type='button';reset.className='sim-btn';reset.textContent='សាកល្បងឡើងវិញ / Retry';reset.onclick=()=>{fields.forEach(x=>{$$(x,'input').forEach(i=>i.checked=false);$(x,'.quiz-feedback').hidden=true;x.classList.remove('answered-correctly');});update();};quiz.append(reset);
    });
    $$(document,'.rich-comparison').forEach(pair=>{if(pair.dataset.ready)return;pair.dataset.ready='1';const b=document.createElement('button');b.type='button';b.className='sim-btn compare-toggle';b.textContent='លាក់ការពន្យល់ ដើម្បីសាកល្បង / Hide explanations';b.setAttribute('aria-expanded','true');b.onclick=()=>{const hide=b.getAttribute('aria-expanded')==='true';$$(pair,'figcaption').forEach(x=>x.hidden=hide);b.setAttribute('aria-expanded',String(!hide));b.textContent=hide?'បង្ហាញការពន្យល់ / Show explanations':'លាក់ការពន្យល់ / Hide explanations';};pair.before(b);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
})();
