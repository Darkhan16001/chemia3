
// ===============================================
// CHEMISTRY 4.1–4.2 — BY DARKHAN
// 17 (7A) ТОП ЭЛЕМЕНТТЕРІ · 80 МИНУТ
// ===============================================

const $ = id => document.getElementById(id);

function esc(value) {
  return String(value).replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",
    '"':"&quot;","'":"&#39;"
  }[c]));
}

function rnd(max) {
  return Math.floor(Math.random()*max);
}

function shuffle(items) {
  const a=[...items];
  for(let i=a.length-1;i>0;i--){
    const j=rnd(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// ===============================================
// ОҚУШЫЛАР ЖӘНЕ ЖЕКЕ САҚТАУ
// ===============================================

const names=[
  "Рамазан","Тұрғанжан","Нұрай","Әлқуат",
  "Шырай","Гүлсезім","Маржан","Мариям",
  "Жансая","Азиза","Ақсезім","Нұрболсын",
  "Ақнұр","Іңкәр","Асхат","Аяжан",
  "Мирас","Санжар","Ерасыл","Нұрасыл",
  "Расул","Айнұр","Дархан","Айкерім"
];

const STORAGE="darkhan_chem_41_42_photo_v1";
const TIMER_STORAGE=STORAGE+"_timer";

function initialState() {
  return {
    students:names.map((name,i)=>({
      id:i+1,name,present:true
    })),
    teams:[[],[],[]],
    scores:[0,0,0],
    gameIndex:0,
    gameAnswer:false,
    notebookAnswers:{},
    homeworkAnswers:false,
    selectedId:null,
    selectedTask:null,
    individualAnswer:false,
    usedTasks:[],
    marks:[]
  };
}

let state=initialState();

try {
  const old=JSON.parse(localStorage.getItem(STORAGE));
  if(
    old &&
    Array.isArray(old.students) &&
    Array.isArray(old.teams) &&
    Array.isArray(old.marks)
  ){
    state={...initialState(),...old};
  }
}catch(error){
  console.warn("Сақтау қатесі:",error);
}

function save() {
  try{
    localStorage.setItem(STORAGE,JSON.stringify(state));
  }catch(error){
    console.warn("Деректер сақталмады:",error);
  }
}

const present=()=>state.students.filter(s=>s.present);
const student=id=>state.students.find(s=>s.id===id);

// ===============================================
// 80 МИНУТТЫҚ ТАЙМЕР
// ===============================================

const DURATION=80*60*1000;
let deadline=null;

const oldDeadline=Number(localStorage.getItem(TIMER_STORAGE));

if(Number.isFinite(oldDeadline) && oldDeadline>0){
  deadline=oldDeadline;
}

function secondsLeft() {
  if(deadline===null)return 80*60;
  return Math.max(0,Math.ceil((deadline-Date.now())/1000));
}

function updateTimer() {
  const seconds=secondsLeft();
  const m=Math.floor(seconds/60);
  const s=seconds%60;

  $("lessonTimer").textContent=
    String(m).padStart(2,"0")+":"+
    String(s).padStart(2,"0");

  $("lessonTimer").style.color=
    seconds===0?"#ffa5aa":"";
}

function startTimer() {
  if(deadline!==null && secondsLeft()>0)return;

  deadline=Date.now()+DURATION;
  localStorage.setItem(TIMER_STORAGE,String(deadline));

  updateTimer();
  show();
}

function resetTimer() {
  if(!confirm("80 минуттық таймерді қайта бастайсыз ба?")){
    return;
  }
  deadline=null;
  localStorage.removeItem(TIMER_STORAGE);
  updateTimer();
  show();
}

function updateClock() {
  $("realClock").textContent=
    new Intl.DateTimeFormat("en-GB",{
      timeZone:"Asia/Almaty",
      hour:"2-digit",
      minute:"2-digit",
      second:"2-digit",
      hourCycle:"h23"
    }).format(new Date());
}

setInterval(()=>{
  updateTimer();
  updateClock();
},1000);

// ===============================================
// СЛАЙД ЖҮЙЕСІ
// ===============================================

const slides=[];
let page=0;

function add(title,section,html) {
  slides.push({title,section,html});
}

function dynamic(title,section,render) {
  slides.push({title,section,render});
}

function show() {
  const s=slides[page];
  if(!s)return;

  $("slide").innerHTML=s.render?s.render():s.html;
  $("sectionName").textContent=s.section;
  $("slideTitle").textContent=s.title;
  $("pageCount").textContent=(page+1)+" / "+slides.length;

  $("prevBtn").disabled=page===0;
  $("nextBtn").disabled=page===slides.length-1;
  $("main").scrollTop=0;

  // Фото ашылмаса, оның орнына анық жазу шығады
  $("slide").querySelectorAll("img[data-fallback]")
    .forEach(img=>{
      img.onerror=()=>{
        const fallback=document.createElement("div");
        fallback.className="photo-fallback";
        fallback.textContent=img.dataset.fallback;
        img.replaceWith(fallback);
      };
    });
}

function goTo(title) {
  const i=slides.findIndex(s=>s.title===title);
  if(i>=0){page=i;show();}
}

$("prevBtn").onclick=()=>{
  if(page>0){page--;show();}
};

$("nextBtn").onclick=()=>{
  if(page<slides.length-1){page++;show();}
};

// ===============================================
// ФОТОЛАР
// ===============================================

// Wikimedia Commons: файл атауы арқылы ашылады.
// Бұл суреттер интернет қосылғанда жүктеледі.

const photos={
  halogens:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Halogens.jpg",
  chlorine:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Chlorine-sample.jpg",
  bromine:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Bromine.jpg",
  iodine:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Sample_of_Iodine.JPG"
};

function photo(key,caption,source) {
  return `
    <figure class="photo-card">
      <img
        src="${photos[key]}"
        alt="${esc(caption)}"
        data-fallback="${esc(caption)}"
        loading="lazy">

      <figcaption>
        ${esc(caption)}
        <div class="photo-source">
          Фото: Wikimedia Commons · ${esc(source)}
        </div>
      </figcaption>
    </figure>
  `;
}

function elementStrip(items) {
  return `
    <div class="element-strip">
      ${items.map(([symbol,name])=>`
        <div class="element-tile">
          <b>${esc(symbol)}</b>
          <small>${esc(name)}</small>
        </div>
      `).join("")}
    </div>
  `;
}

// ===============================================
// КІРІСПЕ
// ===============================================

dynamic("17 (7A) топ элементтері","Кіріспе • 5 минут",()=>`
  <div class="hero">
    <div>
      <div class="subtitle">
        4.1–4.2 · ХИМИЯ · 1-КУРС
      </div>

      <h1>
        17 (7A) топ
        <span class="blue">элементтері</span>
      </h1>

      <h2 class="green-text">
        Галогендер: құрылысы,
        қасиеттері және реакциялары
      </h2>

      <p>
        Фтор, хлор, бром және йодтың
        ерекшеліктерін суреттер, формулалар
        және есептер арқылы зерттейміз.
      </p>

      ${elementStrip([
        ["F","Фтор"],["Cl","Хлор"],
        ["Br","Бром"],["I","Йод"]
      ])}

      <button class="btn success" onclick="startTimer()">
        ▶ 80 минутты бастау
      </button>

      <button class="btn" onclick="resetTimer()">
        ↺ Таймерді жаңарту
      </button>
    </div>

    ${photo(
      "halogens",
      "Хлор, бром және йод үлгілері",
      "W. Oelen"
    )}
  </div>
`);

add("Сабақ мақсаты","Кіріспе",`
  <h2>Сабақтың мақсаты</h2>
  <div class="grid2">
    <div class="card">
      <h3>Теория</h3>
      <ul>
        <li>17-топтың периодтық жүйедегі орнын түсіну.</li>
        <li>Электрондық құрылысын салыстыру.</li>
        <li>Физикалық және химиялық қасиеттерін білу.</li>
        <li>Галогендердің қосылыстарын ажырату.</li>
      </ul>
    </div>

    <div class="card green-card">
      <h3>Практика</h3>
      <ul>
        <li>Дәптерге конспект жазу.</li>
        <li>Реакция теңдеулерін теңестіру.</li>
        <li>3 командалық ойынға қатысу.</li>
        <li>Жеке есеп шығару және бағалану.</li>
      </ul>
    </div>
  </div>
  <div class="note">
    Жұмыс реті: түсіндірме → конспект →
    есептер → командалар → жеке бағалау → үй жұмысы.
  </div>
`);

// ===============================================
// ТҮСІНДІРМЕ МАЗМҰНЫ
// ===============================================

// Әр түсіндірмеде екі мәтін.
// Кейбір бетте фото/сызба оң жақта беріледі.

const theory=[
  {
    title:"Галогендер дегеніміз не?",
    a:"Галогендер — периодтық жүйенің 17-тобында орналасқан элементтер. Оларға фтор, хлор, бром, йод, астат және теннессин жатады. Негізгі төрт элементтің қасиеттері мектеп және колледж химиясында кең қарастырылады. Олардың сыртқы электрондық қабатында жеті электрон орналасады.",
    b:"Галогендер бейметалдық қасиеттер көрсетеді. Көптеген қосылыстарында бір электрон қабылдап, −1 зарядты галогенид иондарын түзеді. Алайда хлор, бром және йод кейбір қосылыстарында оң тотығу дәрежелерін де көрсетуі мүмкін. Бұл — топ ішіндегі маңызды ерекшелік.",
    note:"17-топ → сыртқы қабатта 7 электрон.",
    image:"halogens",
    caption:"Галогендердің салыстырмалы үлгілері",
    source:"W. Oelen"
  },
  {
    title:"Периодтық жүйедегі орны",
    a:"Галогендер периодтық жүйенің оң бөлігінде, 18-топтағы инертті газдардың дәл алдында орналасады. Фтор екінші периодта, хлор үшінші, бром төртінші, йод бесінші периодта. Период электрондық қабаттар санымен байланысты.",
    b:"Топ бойынша жоғарыдан төмен қарай электрондық қабат саны көбейеді. Соның нәтижесінде атом радиусы жалпы ұлғаяды. Бірақ сыртқы қабаттағы электрон саны өзгермейді — барлығында жеті электрон бар.",
    note:"Топ — тік баған; период — көлденең қатар."
  },
  {
    title:"Электрондық құрылыс",
    a:"Галогендердің валенттік электрондық конфигурациясы ns²np⁵ түрінде болады. Мұндағы s-деңгейшеде екі, p-деңгейшеде бес электрон орналасады. Барлығы жеті валенттік электрон болады. Хлор үшін электрондардың қабаттарға таралуы 2,8,7 деп жазылады.",
    b:"Бейтарап хлор атомында 17 электрон бар. Ол бір электрон қабылдағанда Cl⁻ ионына айналып, 18 электронға ие болады. Протон саны өзгермейді. Атом мен ионның химиялық қасиеттерін шатастырмау қажет.",
    note:"Cl: 17 электрон; Cl⁻: 18 электрон.",
    diagram:"shells"
  },
  {
    title:"Молекулалық құрылыс",
    a:"Фтор, хлор, бром және йодтың қарапайым заттары екі атомнан тұратын молекулалар түзеді. Формулалары: F₂, Cl₂, Br₂, I₂. Екі бірдей атом арасында полюссіз ковалентті байланыс пайда болады.",
    b:"Cl белгісі бір хлор атомын көрсетеді. Cl₂ — бір хлор молекуласы. 3Cl₂ жазуы үш молекуланы көрсетеді, олардың құрамында алты хлор атомы бар. Коэффициент пен индекстің айырмашылығын міндетті түрде білу керек.",
    note:"Индекс — бір молекуладағы атом саны; коэффициент — молекулалар саны.",
    diagram:"molecules"
  },
  {
    title:"Физикалық қасиеттері",
    a:"Фтор мен хлор қалыпты жағдайда газ болады. Бром сұйық, йод қатты күйде кездеседі. Физикалық күйлердің бұлай өзгеруі молекулалардың өлшемімен, полярланғыштығымен және олардың арасындағы тартылыспен байланысты.",
    b:"Топ бойынша төмендеген сайын молекулааралық дисперсиялық тартылыс күшейеді. Сондықтан балқу мен қайнау температуралары жалпы өседі. Мысалы, йод қатты кристалдар түрінде, ал хлор газ түрінде кездеседі.",
    note:"F₂, Cl₂ — газ; Br₂ — сұйық; I₂ — қатты.",
    image:"halogens",
    caption:"Хлор, бром және йодтың физикалық күйлері",
    source:"W. Oelen"
  },
  {
    title:"Хлордың ерекшеліктері",
    a:"Хлордың реттік нөмірі 17. Оның электрондық құрылысы 2,8,7 болады. Қарапайым затының формуласы Cl₂. Хлор көптеген металдармен реакцияға түсіп, хлорид қосылыстарын түзеді.",
    b:"Натрий хлориді NaCl құрамында хлорид ионы Cl⁻ бар. Бұл ионның қасиеттері қарапайым хлор молекуласынан өзгеше. Сондықтан элементтің әртүрлі химиялық күйін ажыратқан дұрыс.",
    note:"Cl₂ — молекула, Cl⁻ — хлорид ионы.",
    image:"chlorine",
    caption:"Жабық ыдыстағы хлор үлгісі",
    source:"Wikimedia Commons"
  },
  {
    title:"Бромның ерекшеліктері",
    a:"Бромның реттік нөмірі 35. Оның қарапайым заты Br₂ қалыпты жағдайда сұйық күйде кездеседі. Бром атомында төрт электрондық қабат бар және сыртқы қабатында жеті электрон орналасады.",
    b:"Бром хлордан төмен орналасатындықтан, атом радиусы үлкенірек. Оның қарапайым затының тотықтырғыштық қабілеті хлорға қарағанда төмен. Бромид ионы Br⁻ әртүрлі тұздардың құрамында кездеседі.",
    note:"Br₂ — сұйық зат; Br⁻ — бромид ионы.",
    image:"bromine",
    caption:"Жабық ыдыстағы бром үлгісі",
    source:"Greenhorn1"
  },
  {
    title:"Йодтың ерекшеліктері",
    a:"Йодтың реттік нөмірі 53. Ол бесінші периодтың 17-тобында орналасады. Қарапайым йод I₂ қалыпты жағдайда қатты зат болады. Оның молекулалық құрылымы галогендерге ортақ екі атомды ерекшелікті сақтайды.",
    b:"Йод қосылыстары биологиялық жүйелерде маңызды. Алайда таза йодтың химиялық қасиеттері мен йодид тұздарының қасиеттері бірдей емес. Йодтың атом радиусы хлор мен бромнан үлкенірек.",
    note:"I₂ — молекулалық йод; I⁻ — йодид ионы.",
    image:"iodine",
    caption:"Йодтың қатты кристалдық үлгісі",
    source:"Leiem"
  },
  {
    title:"Атом радиусының өзгеруі",
    a:"Галогендер тобында жоғарыдан төмен қарай электрондық қабаттар саны артады. Сыртқы электрондар ядродан алысырақ орналасады, сондықтан атом радиусы жалпы өседі. Қарапайым салыстыруда F < Cl < Br < I деп көрсетіледі.",
    b:"Атом радиусының өзгеруі химиялық байланысқа және электрондарды тарту қабілетіне әсер етеді. Электртерістілік F-тен I-ге қарай жалпы төмендейді. Бұл заңдылық периодтық жүйемен байланысты.",
    note:"Радиус: F < Cl < Br < I.",
    diagram:"trend"
  },
  {
    title:"Тотықтырғыштық қасиет",
    a:"Галогендердің қарапайым заттары химиялық реакция кезінде электрон қабылдай алады. Электрон қабылдайтын бөлшек тотықтырғыш деп аталады. Фтор күшті тотықтырғыштардың бірі.",
    b:"F₂, Cl₂, Br₂, I₂ қатарында тотықтырғыштық қабілет жалпы төмендейді. Мысалы, хлор бромид иондарын тотықтыра алады. Мұны орынбасу реакцияларының теңдеулері арқылы түсіндіруге болады.",
    note:"Тотықтырғыш электрон қабылдайды.",
    diagram:"oxidation"
  },
  {
    title:"Галогендер және металдар",
    a:"Галогендер металдармен әрекеттескенде галогенид тұздары түзілетін реакциялар жүруі мүмкін. Мысалы, натрий мен хлордан натрий хлориді түзіледі. Химиялық теңдеуде әр элемент атомдарының саны екі жақта бірдей болуы шарт.",
    b:"2Na + Cl₂ → 2NaCl. Бұл теңдеуде екі натрий атомы және екі хлор атомы сақталады. Натрий электрон береді, ал хлор электрон қабылдайды. Реакция тотығу-тотықсыздану түріне жатады.",
    note:"2Na + Cl₂ → 2NaCl.",
    diagram:"reaction"
  },
  {
    title:"Сутек галогенидтері",
    a:"Галогендер сутекпен HF, HCl, HBr, HI сияқты қосылыстар түзеді. Бұл заттар сутек галогенидтері деп аталады. Олардың молекулаларында полюсті ковалентті байланыс болады.",
    b:"HCl — хлорсутек. Оның сулы ерітіндісі тұз қышқылы деп аталады. HCl мен NaCl бірдей зат емес, сондықтан олардың физикалық және химиялық қасиеттері де әртүрлі.",
    note:"HF, HCl, HBr, HI — сутек галогенидтері."
  },
  {
    title:"Галогенид тұздары",
    a:"Галогенидтерге NaCl, KBr, KI, CaF₂ және MgCl₂ сияқты қосылыстар жатады. Бұл қосылыстардың формулаларын ион зарядтарын ескеріп жазамыз. Мысалы, Na⁺ пен Cl⁻ зарядтары бір-бірін теңгереді.",
    b:"Ca²⁺ ионына екі F⁻ ионы қажет. Сондықтан кальций фторидінің формуласы CaF₂ болады. Сол сияқты Mg²⁺ ионына екі Cl⁻ сәйкес келеді, нәтижесінде MgCl₂ формуласы түзіледі.",
    note:"Формуладағы ион зарядтарының қосындысы нөлге тең."
  },
  {
    title:"Орынбасу реакциялары",
    a:"Белсендірек галоген кейбір жағдайларда белсенділігі төменірек галогенді оның тұзынан ығыстыра алады. Бұл реакциялар галогендердің тотықтырғыштық қабілетін салыстыру үшін қолданылады.",
    b:"Cl₂ + 2KBr → 2KCl + Br₂ теңдеуінде хлор электрон қабылдайды, ал бромид иондары электрон береді. Хлор тотықтырғыш, бромид иондары тотықсыздандырғыш болады.",
    note:"Cl₂ + 2KBr → 2KCl + Br₂.",
    diagram:"replacement"
  },
  {
    title:"Тотығу дәрежесі және қорытынды",
    a:"Қарапайым заттағы галогеннің тотығу дәрежесі 0 болады. Мысалы, Cl₂ ішіндегі хлор — 0. Хлорид ионында Cl⁻ оның тотығу дәрежесі −1. Тотығу дәрежелерінің өзгеруі электрондардың ауысуын талдауға көмектеседі.",
    b:"Cl₂ + 2KI → 2KCl + I₂ реакциясында хлор тотықтырғыш рөл атқарады. Йодид иондары электрон беріп, йод молекулаларын түзеді. Бұл тақырыптың негізгі қорытындысы — атом құрылысы мен химиялық қасиеттің байланысы.",
    note:"Құрылыс → қасиет → реакция → есеп."
  }
];

function diagram(type) {
  if(type==="shells") {
    return `
      <div class="card">
        <h3>Электрондық қабаттар</h3>
        <div class="shell-grid">
          <div class="shell">
            <strong>F</strong><span>2, 7</span>
          </div>
          <div class="shell">
            <strong>Cl</strong><span>2, 8, 7</span>
          </div>
          <div class="shell">
            <strong>Br</strong><span>2, 8, 18, 7</span>
          </div>
          <div class="shell">
            <strong>I</strong><span>2, 8, 18, 18, 7</span>
          </div>
        </div>
        <div class="note">
          Барлығының сыртқы қабатында 7 электрон бар.
        </div>
      </div>
    `;
  }

  if(type==="molecules") {
    return `
      <div class="card">
        <h3>Қарапайым зат формулалары</h3>
        ${elementStrip([
          ["F₂","Фтор"],
          ["Cl₂","Хлор"],
          ["Br₂","Бром"],
          ["I₂","Йод"]
        ])}
        <div class="formula">Cl — Cl</div>
        <p>Бір молекула — екі атом.</p>
      </div>
    `;
  }

  if(type==="trend") {
    return `
      <div class="card">
        <h3>Радиустың салыстырмалы өзгеруі</h3>
        <div class="trend">
          ${[["F",55],["Cl",90],["Br",125],["I",165]]
            .map(([label,height])=>`
              <div class="trend-part">
                <div class="trend-bar"
                  style="height:${height}px"></div>
                <strong>${label}</strong>
              </div>
            `).join("")}
        </div>
        <p class="small center">
          Көрнекі диаграмма, нақты радиус өлшемі емес.
        </p>
      </div>
    `;
  }

  const formulas={
    oxidation:["F₂ → Cl₂ → Br₂ → I₂",
      "Тотықтырғыштық қабілет төмендейді"],
    reaction:["2Na + Cl₂ → 2NaCl",
      "Металл + галоген → галогенид"],
    replacement:["Cl₂ + 2KBr → 2KCl + Br₂",
      "Орынбасу және электрон алмасу"]
  };

  const item=formulas[type];

  return `
    <div class="card green-card">
      <h3>Химиялық сызба</h3>
      <div class="formula">${item[0]}</div>
      <p class="center">${item[1]}</p>
    </div>
  `;
}

// Әр түсіндірме жеке слайд
theory.forEach((t,i)=>{
  add(t.title,`Түсіндірме ${i+1}/15`,`
    <div class="subtitle">
      ТОЛЫҚ ТҮСІНДІРМЕ · ${i+1}/15
    </div>

    <h2>${esc(t.title)}</h2>

    ${t.image?`
      <div class="grid2">
        <div class="card">
          <h3>Негізгі түсінік</h3>
          <p>${esc(t.a)}</p>
        </div>
        ${photo(t.image,t.caption,t.source)}
      </div>

      <div class="note blue-note">
        <b>Қосымша түсіндірме:</b>
        ${esc(t.b)}
      </div>
    `:`
      <div class="grid2">
        <div class="card">
          <h3>Негізгі түсінік</h3>
          <p>${esc(t.a)}</p>
        </div>
        <div class="card green-card">
          <h3>Түсіндіру және мысал</h3>
          <p>${esc(t.b)}</p>
        </div>
      </div>

      ${t.diagram?`
        <div style="margin-top:15px">
          ${diagram(t.diagram)}
        </div>
      `:""}
    `}

    <div class="note">
      <b class="gold">Есте сақта:</b>
      ${esc(t.note)}
    </div>
  `);
});

// ===============================================
// КОНСПЕКТ — 3 БЕТ
// ===============================================

const notes=[
  {
    title:"Галогендердің құрылысы",
    lines:[
      "Галогендер — 17-топ элементтері: F, Cl, Br, I.",
      "Сыртқы электрондық қабатында 7 электрон бар.",
      "Валенттік конфигурациясы ns²np⁵.",
      "Галогенид иондары: F⁻, Cl⁻, Br⁻, I⁻.",
      "Cl атомы: 2,8,7. Cl⁻ ионында 18 электрон."
    ]
  },
  {
    title:"Физикалық қасиеттер",
    lines:[
      "Қарапайым заттар: F₂, Cl₂, Br₂, I₂.",
      "Фтор мен хлор — газ, бром — сұйық, йод — қатты.",
      "Топ бойынша атом радиусы жоғарыдан төмен өседі.",
      "Электртерістілік жалпы төмендейді.",
      "Қарапайым заттардың тотықтырғыштық қабілеті жалпы төмендейді."
    ]
  },
  {
    title:"Химиялық реакциялар",
    lines:[
      "2Na + Cl₂ → 2NaCl.",
      "Mg + Cl₂ → MgCl₂.",
      "Cl₂ + 2KBr → 2KCl + Br₂.",
      "Cl₂ + 2KI → 2KCl + I₂.",
      "Тотықтырғыш электрон қабылдайды, тотықсыздандырғыш электрон береді."
    ]
  }
];

notes.forEach((n,i)=>{
  add(`Конспект №${i+1}`,"Конспект · 10 минут",`
    <div class="subtitle">ДӘПТЕРГЕ ЖАЗЫП АЛ</div>
    <h2>Конспект №${i+1}</h2>
    <h3>${esc(n.title)}</h3>

    <div class="card">
      <ol>
        ${n.lines.map(line=>`
          <li>${esc(line)}</li>
        `).join("")}
      </ol>
    </div>

    <div class="note blue-note">
      Анықтамаларды және химиялық формулаларды
      толық дәптерге көшіріп жаз.
    </div>
  `);
});

// ===============================================
// ДӘПТЕР ЕСЕПТЕРІ
// ===============================================

const notebook=[
  {
    title:"Атомдар мен иондар",
    tasks:[
      ["Cl атомындағы электрон саны қанша?",
       "17 электрон."],
      ["Cl⁻ ионында қанша электрон бар?",
       "17+1=18 электрон."],
      ["Br⁻ ионында қанша электрон бар?",
       "35+1=36 электрон."],
      ["5Cl₂ молекуласында неше атом бар?",
       "5×2=10 атом."]
    ]
  },
  {
    title:"Молекулалық және салыстырмалы масса",
    tasks:[
      ["F₂ салыстырмалы молекулалық массасын есепте.",
       "2×19=38."],
      ["Cl₂ салыстырмалы молекулалық массасын есепте.",
       "2×35,5=71."],
      ["Br₂ салыстырмалы молекулалық массасын есепте.",
       "2×80=160."],
      ["I₂ салыстырмалы молекулалық массасын есепте.",
       "2×127=254."]
    ]
  },
  {
    title:"Реакция теңдеулері",
    tasks:[
      ["Na + Cl₂ → NaCl теңдеуін теңестір.",
       "2Na + Cl₂ → 2NaCl."],
      ["Mg + Cl₂ → MgCl₂ теңдеуін тексер.",
       "Теңдеу теңестірілген."],
      ["Al + Br₂ → AlBr₃ теңдеуін теңестір.",
       "2Al + 3Br₂ → 2AlBr₃."],
      ["Cl₂ + KI → KCl + I₂ теңдеуін теңестір.",
       "Cl₂ + 2KI → 2KCl + I₂."]
    ]
  },
  {
    title:"Тотығу дәрежесін анықтау",
    tasks:[
      ["Cl₂ құрамындағы Cl тотығу дәрежесін тап.",
       "0."],
      ["NaCl құрамындағы Cl тотығу дәрежесін тап.",
       "−1."],
      ["HClO құрамындағы Cl тотығу дәрежесін тап.",
       "+1."],
      ["Cl₂ + 2KBr реакциясының тотықтырғышын тап.",
       "Cl₂ — тотықтырғыш."]
    ]
  }
];

notebook.forEach((set,i)=>{
  dynamic(
    `Дәптер есептері №${i+1}`,
    "Дәптер жұмысы · 15 минут",
    ()=>renderNotebook(i)
  );
});

function renderNotebook(i) {
  const set=notebook[i];
  const open=!!state.notebookAnswers[i];

  return `
    <div class="subtitle">ДӘПТЕРГЕ ЕСЕП ШЫҒАРУ</div>
    <h2>${esc(set.title)}</h2>

    ${set.tasks.map((task,j)=>`
      <div class="task">
        <p>
          <b class="gold">${j+1}.</b>
          ${esc(task[0])}
        </p>
      </div>
    `).join("")}

    <div class="note blue-note">
      Есептің шешімін жазып,
      жауабын соңынан тексер.
    </div>

    <p>
      <button class="btn warning"
        onclick="toggleNotebook(${i})">
        ${open?"Жауапты жасыру":"Жауаптарды көру"}
      </button>
    </p>

    ${open?`
      <div class="answer">
        ${set.tasks.map((task,j)=>`
          <p><b>${j+1}.</b> ${esc(task[1])}</p>
        `).join("")}
      </div>
    `:""}
  `;
}

function toggleNotebook(i) {
  state.notebookAnswers[i]=!state.notebookAnswers[i];
  save();
  show();
}

// ===============================================
// ҚАТЫСУШЫЛАРДЫ БЕЛГІЛЕУ
// ===============================================

dynamic("Қатысушылар","Топтық жұмыс",renderAttendance);

function renderAttendance() {
  const count=present().length;

  return `
    <h2>Сабаққа қатысушылар</h2>
    <p>
      Келмеген оқушыны ✕ арқылы белгіле.
      Қайта қосу үшін ↺ батырмасын бас.
    </p>

    <div class="grid3">
      <div class="card center">
        <h3>Барлығы</h3>
        <div class="big blue">${state.students.length}</div>
      </div>
      <div class="card center">
        <h3>Қатысушылар</h3>
        <div class="big green-text">${count}</div>
      </div>
      <div class="card center">
        <h3>Келмегендер</h3>
        <div class="big red">
          ${state.students.length-count}
        </div>
      </div>
    </div>

    <div class="student-grid">
      ${state.students.map(s=>`
        <div class="student-item ${s.present?"":"absent"}">
          <span>${esc(s.name)}</span>

          <button
            class="x-btn ${s.present?"":"restore"}"
            onclick="toggleStudent(${s.id})">
            ${s.present?"✕":"↺"}
          </button>
        </div>
      `).join("")}
    </div>
  `;
}

function toggleStudent(id) {
  const s=student(id);
  if(!s)return;

  if(s.present && state.marks.some(m=>m.id===id)){
    alert("Бағаланған оқушының бағасы журналда сақталған.");
    return;
  }

  s.present=!s.present;
  state.teams=[[],[],[]];
  state.scores=[0,0,0];
  state.gameIndex=0;
  state.gameAnswer=false;

  if(!s.present && state.selectedId===id){
    state.selectedId=null;
    state.selectedTask=null;
    state.individualAnswer=false;
  }

  save();
  show();
}

// ===============================================
// 3 ТОПҚА РАНДОМ БӨЛУ
// ===============================================

dynamic("3 топқа бөлу","Топтар",renderTeams);

function divideTeams() {
  const ids=shuffle(present().map(s=>s.id));

  if(!ids.length){
    alert("Қатысушыларды белгіле.");
    return;
  }

  state.teams=[[],[],[]];

  ids.forEach((id,i)=>{
    state.teams[i%3].push(id);
  });

  state.scores=[0,0,0];
  state.gameIndex=0;
  state.gameAnswer=false;

  save();
  show();
}

function renderTeams() {
  return `
    <h2>Оқушыларды 3 топқа бөлу</h2>

    <button class="btn success"
      onclick="divideTeams()">
      🎲 Рандом бөлу
    </button>

    <div class="grid3" style="margin-top:18px">
      ${state.teams.map((team,i)=>`
        <div class="team-card">
          <h3>${["🔵","🟢","🟡"][i]} ${i+1}-топ</h3>

          <div class="team-members">
            ${team.map((id,j)=>`
              <div>
                ${j+1}. ${esc(student(id)?.name||"")}
              </div>
            `).join("")||"Топ әлі құрылмаған"}
          </div>
        </div>
      `).join("")}
    </div>

    <div class="note">
      Ойындар: «Элементті тап»,
      «Химиялық детектив»,
      «Реакцияны талда».
    </div>
  `;
}

// ===============================================
// ТОПТЫҚ ОЙЫН — 3 КЕЗЕҢ, 12 СҰРАҚ
// ===============================================

const gameQuestions=[
  {
    round:"1-кезең: Элементті тап",
    q:"17-топтың 3-периодында қай элемент орналасқан?",
    a:"Хлор — Cl."
  },
  {
    round:"1-кезең: Элементті тап",
    q:"Қай галоген қалыпты жағдайда сұйық күйде болады?",
    a:"Бром — Br₂."
  },
  {
    round:"1-кезең: Элементті тап",
    q:"Электртерістілігі ең жоғары элементті ата.",
    a:"Фтор — F."
  },
  {
    round:"1-кезең: Элементті тап",
    q:"Йод атомының реттік нөмірі қанша?",
    a:"53."
  },

  {
    round:"2-кезең: Химиялық детектив",
    q:"Белгісіз ионда 17 протон және 18 электрон бар. Ол қандай ион?",
    a:"Cl⁻ — хлорид ионы."
  },
  {
    round:"2-кезең: Химиялық детектив",
    q:"Белгісіз зат екі атомды, қалыпты жағдайда қатты. Ол қандай галоген?",
    a:"Йод — I₂."
  },
  {
    round:"2-кезең: Химиялық детектив",
    q:"Молекула массасы шамамен 160. Бұл қай галогеннің қарапайым заты?",
    a:"Br₂, себебі 2×80=160."
  },
  {
    round:"2-кезең: Химиялық детектив",
    q:"Құрамында Ca²⁺ және F⁻ иондары бар тұздың формуласы қандай?",
    a:"CaF₂."
  },

  {
    round:"3-кезең: Реакцияны талда",
    q:"Na + Cl₂ → NaCl теңдеуін теңестір.",
    a:"2Na + Cl₂ → 2NaCl."
  },
  {
    round:"3-кезең: Реакцияны талда",
    q:"Al + Br₂ → AlBr₃ теңдеуін теңестір.",
    a:"2Al + 3Br₂ → 2AlBr₃."
  },
  {
    round:"3-кезең: Реакцияны талда",
    q:"Cl₂ + KBr → KCl + Br₂ теңдеуін теңестір.",
    a:"Cl₂ + 2KBr → 2KCl + Br₂."
  },
  {
    round:"3-кезең: Реакцияны талда",
    q:"H₂ + Cl₂ → HCl теңдеуін теңестір.",
    a:"H₂ + Cl₂ → 2HCl."
  }
];

dynamic("Командалық ойын","3 топ · 15 минут",renderGame);

function renderGame() {
  if(!state.teams.some(team=>team.length)){
    return `
      <h2>Алдымен 3 топқа бөліну керек</h2>
      <button class="btn primary"
        onclick="goTo('3 топқа бөлу')">
        Топтарға өту →
      </button>
    `;
  }

  if(state.gameIndex>=gameQuestions.length){
    const max=Math.max(...state.scores);
    const winners=state.scores
      .map((score,i)=>score===max?i+1:null)
      .filter(Boolean);

    return `
      <div class="center">
        <h1>Командалық ойын аяқталды!</h1>

        <div class="grid3">
          ${state.scores.map((score,i)=>`
            <div class="card">
              <h3>${i+1}-топ</h3>
              <div class="big gold">${score}</div>
              <p>ұпай</p>
            </div>
          `).join("")}
        </div>

        <div class="note">
          Ең жоғары нәтиже:
          <b class="green-text">
            ${winners.map(x=>x+"-топ").join(", ")}
          </b>
        </div>

        <button class="btn primary"
          onclick="goTo('Жеке бағалау')">
          Жеке есептерге өту →
        </button>
      </div>
    `;
  }

  const i=state.gameIndex;
  const question=gameQuestions[i];
  const team=i%3;

  return `
    <div class="subtitle">${esc(question.round)}</div>
    <h2>${team+1}-топтың тапсырмасы</h2>

    <div class="grid2">
      <div class="card">
        <span class="pill">
          ${i+1}/${gameQuestions.length} сұрақ
        </span>

        <p class="question">${esc(question.q)}</p>

        <div class="note blue-note">
          Топ ақылдасып, жауабын ауызша айтады.
        </div>
      </div>

      <div class="card green-card">
        <h3>Жауапты тексеру</h3>

        ${state.gameAnswer?`
          <div class="answer">${esc(question.a)}</div>

          <p>
            <button class="btn success"
              onclick="finishGame(true)">
              Дұрыс (+10)
            </button>
          </p>

          <p>
            <button class="btn"
              onclick="finishGame(false)">
              Қате (0)
            </button>
          </p>
        `:`
          <p>Топ жауап берген соң тексер.</p>

          <button class="btn warning"
            onclick="revealGame()">
            Жауапты көру
          </button>
        `}
      </div>
    </div>

    <div class="note">
      ${state.scores.map((score,j)=>
        `${j+1}-топ: ${score} ұпай`
      ).join(" · ")}
    </div>
  `;
}

function revealGame() {
  state.gameAnswer=true;
  save();
  show();
}

function finishGame(correct) {
  if(!state.gameAnswer)return;

  if(correct)state.scores[state.gameIndex%3]+=10;

  state.gameIndex++;
  state.gameAnswer=false;

  save();
  show();
}

// ===============================================
// ЖЕКЕ ЕСЕПТЕР ЖӘНЕ БАҒАЛАУ
// ===============================================

const problems=[
  ["Cl атомында қанша электрон бар?","17."],
  ["Cl⁻ ионында қанша электрон бар?","18."],
  ["F⁻ ионында қанша электрон бар?","10."],
  ["Br⁻ ионында қанша электрон бар?","36."],
  ["I⁻ ионында қанша электрон бар?","54."],
  ["4Cl₂ молекуласында неше атом бар?","8."],
  ["6Br₂ молекуласында неше атом бар?","12."],
  ["3I₂ молекуласында неше атом бар?","6."],
  ["F₂ салыстырмалы молекулалық массасын тап.","38."],
  ["Cl₂ салыстырмалы молекулалық массасын тап.","71."],
  ["Br₂ салыстырмалы молекулалық массасын тап.","160."],
  ["I₂ салыстырмалы молекулалық массасын тап.","254."],
  ["Na + Cl₂ → NaCl теңдеуін теңестір.","2Na + Cl₂ → 2NaCl."],
  ["K + Br₂ → KBr теңдеуін теңестір.","2K + Br₂ → 2KBr."],
  ["Mg + Cl₂ → MgCl₂ теңдеуін тексер.","Теңестірілген."],
  ["Al + Cl₂ → AlCl₃ теңдеуін теңестір.","2Al + 3Cl₂ → 2AlCl₃."],
  ["H₂ + Cl₂ → HCl теңдеуін теңестір.","H₂ + Cl₂ → 2HCl."],
  ["Al + Br₂ → AlBr₃ теңдеуін теңестір.","2Al + 3Br₂ → 2AlBr₃."],
  ["Cl₂ + KI → KCl + I₂ теңдеуін теңестір.","Cl₂ + 2KI → 2KCl + I₂."],
  ["Cl₂ + KBr → KCl + Br₂ теңдеуін теңестір.","Cl₂ + 2KBr → 2KCl + Br₂."],
  ["NaCl құрамындағы Cl тотығу дәрежесі қандай?","−1."],
  ["Cl₂ құрамындағы Cl тотығу дәрежесі қандай?","0."],
  ["HClO құрамындағы Cl тотығу дәрежесі қандай?","+1."],
  ["CaF₂ формуласында қанша F бар?","2."],
  ["3MgCl₂ құрамында қанша Cl бар?","3×2=6."],
  ["2AlBr₃ құрамында қанша Br бар?","2×3=6."],
  ["5NaCl құрамында қанша Cl бар?","5."],
  ["3CaF₂ құрамында қанша F бар?","3×2=6."]
];

const grades=[55,60,65,70,75,80,85,90,95,100];

dynamic("Жеке бағалау","Жеке жұмыс",renderIndividual);

function chooseStudent() {
  if(state.selectedId!==null)return;

  const candidates=present().filter(s=>
    !state.marks.some(m=>m.id===s.id)
  );

  if(!candidates.length){
    alert("Барлық қатысушы бағаланды.");
    return;
  }

  let available=problems.map((_,i)=>i)
    .filter(i=>!state.usedTasks.includes(i));

  if(!available.length){
    state.usedTasks=[];
    available=problems.map((_,i)=>i);
  }

  state.selectedId=candidates[rnd(candidates.length)].id;
  state.selectedTask=available[rnd(available.length)];
  state.usedTasks.push(state.selectedTask);
  state.individualAnswer=false;

  save();
  show();
}

function revealIndividual() {
  state.individualAnswer=true;
  save();
  show();
}

function gradeStudent(grade) {
  if(
    state.selectedId===null ||
    !state.individualAnswer ||
    !grades.includes(grade)
  )return;

  const s=student(state.selectedId);
  const task=problems[state.selectedTask];

  if(!s||!task)return;

  state.marks.push({
    id:s.id,name:s.name,
    question:task[0],answer:task[1],grade
  });

  state.selectedId=null;
  state.selectedTask=null;
  state.individualAnswer=false;

  save();
  show();
}

function renderIndividual() {
  if(state.selectedId===null){
    return `
      <div class="center">
        <div class="subtitle">ЖЕКЕ ЕСЕП</div>
        <h2>Тақтаға кім шығады?</h2>

        <div class="big blue">
          ${state.marks.length}/${present().length}
        </div>

        <p>Бағаланған оқушылар</p>

        <button class="btn primary"
          onclick="chooseStudent()"
          ${state.marks.length>=present().length?"disabled":""}>
          🎲 Кездейсоқ оқушы таңдау
        </button>

        <div class="note">
          Есеп шығарылғаннан кейін ғана
          дұрыс жауап пен бағалау ашылады.
        </div>
      </div>
    `;
  }

  const s=student(state.selectedId);
  const task=problems[state.selectedTask];

  if(!s||!task)return `<h2>Тапсырма табылмады.</h2>`;

  return `
    <div class="grid2">
      <div class="card">
        <h3>Таңдалған оқушы</h3>

        <div class="student-name">
          ${esc(s.name)}
        </div>

        <p class="question">
          ${esc(task[0])}
        </p>

        ${state.individualAnswer?`
          <div class="answer">
            <b>Дұрыс жауап:</b>
            <p>${esc(task[1])}</p>
          </div>
        `:`
          <button class="btn warning"
            onclick="revealIndividual()">
            Жауапты көру
          </button>
        `}
      </div>

      <div class="card green-card">
        <h3>55–100 бағалау</h3>

        <p>Есепті тексеріп, баға таңда.</p>

        ${state.individualAnswer?`
          <div class="grade-grid">
            ${grades.map(g=>`
              <button class="grade-btn"
                onclick="gradeStudent(${g})">
                ${g}
              </button>
            `).join("")}
          </div>
        `:`
          <div class="note">
            Алдымен дұрыс жауапты аш.
          </div>
        `}
      </div>
    </div>
  `;
}

// ===============================================
// ЭЛЕКТРОНДЫ ЖУРНАЛ
// ===============================================

dynamic("Бағалау журналы","Журнал",renderJournal);

function renderJournal() {
  const avg=state.marks.length
    ? (state.marks.reduce((sum,m)=>sum+m.grade,0)/
       state.marks.length).toFixed(1)
    : "—";

  return `
    <h2>Электрондық бағалау журналы</h2>

    <div class="grid3">
      <div class="card center">
        <h3>Қатысушылар</h3>
        <div class="big blue">${present().length}</div>
      </div>

      <div class="card center">
        <h3>Бағаланған</h3>
        <div class="big green-text">
          ${state.marks.length}
        </div>
      </div>

      <div class="card center">
        <h3>Орташа балл</h3>
        <div class="big gold">${avg}</div>
      </div>
    </div>

    <div class="card table-scroll" style="margin-top:18px">
      <table>
        <thead>
          <tr>
            <th>№</th><th>Оқушы</th>
            <th>Есеп</th><th>Балл</th>
          </tr>
        </thead>

        <tbody>
          ${state.marks.map((m,i)=>`
            <tr>
              <td>${i+1}</td>
              <td>${esc(m.name)}</td>
              <td>${esc(m.question)}</td>
              <td class="green-text"><b>${m.grade}</b></td>
            </tr>
          `).join("")||`
            <tr>
              <td colspan="4">Баға қойылмаған.</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>

    <p style="text-align:right">
      <button class="btn success"
        onclick="exportJournal()">
        CSV журналын сақтау
      </button>
    </p>
  `;
}

function exportJournal() {
  const rows=[
    ["№","Оқушы","Есеп","Жауап","Балл"],
    ...state.marks.map((m,i)=>[
      i+1,m.name,m.question,m.answer,m.grade
    ])
  ];

  const csv="\uFEFF"+rows.map(row=>
    row.map(value=>
      '"'+String(value).replace(/"/g,'""')+'"'
    ).join(";")
  ).join("\r\n");

  const blob=new Blob([csv],{
    type:"text/csv;charset=utf-8"
  });

  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="himiya_4_1_4_2_bagalar.csv";
  a.click();

  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// ===============================================
// ҮЙ ЖҰМЫСЫ — ТЕК ЕСЕПТЕР
// ===============================================

const homework=[
  ["Cl₂ мольдік массасын тап.","71 г/моль."],
  ["Br₂ мольдік массасын тап.","160 г/моль."],
  ["NaCl мольдік массасын тап.","23+35,5=58,5 г/моль."],
  ["CaF₂ мольдік массасын тап.","40+2×19=78 г/моль."],
  ["142 г Cl₂ зат мөлшерін тап.","142/71=2 моль."],
  ["80 г Br₂ зат мөлшерін тап.","80/160=0,5 моль."],
  ["2 моль NaCl массасын тап.","2×58,5=117 г."],
  ["0,5 моль CaF₂ массасын тап.","0,5×78=39 г."],
  ["Na + Cl₂ → NaCl теңдеуін теңестір.",
   "2Na + Cl₂ → 2NaCl."],
  ["Al + Br₂ → AlBr₃ теңдеуін теңестір.",
   "2Al + 3Br₂ → 2AlBr₃."],
  ["Cl₂ + KI → KCl + I₂ теңдеуін теңестір.",
   "Cl₂ + 2KI → 2KCl + I₂."],
  ["Mg + Cl₂ → MgCl₂ теңдеуін тексер.",
   "Теңестірілген."]
];

dynamic("Үй тапсырмасы","Үй жұмысы",renderHomework);

function renderHomework() {
  return `
    <div class="subtitle">
      ҮЙ ТАПСЫРМАСЫ · ТЕК ЕСЕПТЕР
    </div>

    <h2>12 химиялық есеп</h2>

    <div class="grid2">
      <div class="card">
        <h3>1–6 есеп</h3>
        ${homework.slice(0,6).map((p,i)=>`
          <div class="task">
            <p><b class="gold">${i+1}.</b>
            ${esc(p[0])}</p>
          </div>
        `).join("")}
      </div>

      <div class="card green-card">
        <h3>7–12 есеп</h3>
        ${homework.slice(6).map((p,i)=>`
          <div class="task">
            <p><b class="gold">${i+7}.</b>
            ${esc(p[0])}</p>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="note">
      Есептердің бәрін дәптерге шығар.
      Формула, шешуі, өлшем бірлігі және
      соңғы жауабы көрсетілсін.
    </div>

    <p>
      <button class="btn warning"
        onclick="toggleHomework()">
        ${state.homeworkAnswers
          ?"Жауаптарды жасыру"
          :"Жауаптарды көру"}
      </button>
    </p>

    ${state.homeworkAnswers?`
      <div class="answer">
        ${homework.map((p,i)=>`
          <p><b>${i+1}.</b> ${esc(p[1])}</p>
        `).join("")}
      </div>
    `:""}
  `;
}

function toggleHomework() {
  state.homeworkAnswers=!state.homeworkAnswers;
  save();
  show();
}

// ===============================================
// ҚОРЫТЫНДЫ
// ===============================================

add("Сабақ қорытындысы","Аяқталуы",`
  <div class="center">
    <div class="subtitle">ХИМИЯ · 4.1–4.2</div>
    <h1>Сабақ аяқталды!</h1>

    <h2 class="green-text">
      17 (7A) топ элементтері
    </h2>

    <div class="grid3">
      <div class="card">
        <h3>Білдік</h3>
        <p>Галогендердің электрондық құрылысын.</p>
      </div>

      <div class="card">
        <h3>Үйрендік</h3>
        <p>Физикалық және химиялық қасиеттерін.</p>
      </div>

      <div class="card">
        <h3>Орындадық</h3>
        <p>Конспект, есептер және командалық ойындар.</p>
      </div>
    </div>

    <h2 style="margin-top:27px">
      Назарларыңызға рақмет!
    </h2>
    <div class="big gold">BY DARKHAN</div>
  </div>
`);

// ===============================================
// КАЛЬКУЛЯТОР
// ===============================================

const calculator=$("calculator");

$("calcOpen").onclick=()=>{
  calculator.classList.toggle("hidden");

  if(!calculator.classList.contains("hidden")){
    keepCalculatorInside();
  }
};

$("calcClose").onclick=()=>{
  calculator.classList.add("hidden");
};

let expressionText="";

const calcButtons=[
  "7","8","9","÷",
  "4","5","6","×",
  "1","2","3","−",
  "C","0",".","+",
  "(",")","⌫","="
];

$("calcKeys").innerHTML=calcButtons.map(key=>`
  <button type="button" data-key="${key}">
    ${key}
  </button>
`).join("");

$("calcKeys").addEventListener("click",event=>{
  const button=event.target.closest("button");
  if(!button)return;

  const key=button.dataset.key;

  if(key==="C"){
    expressionText="";
  }else if(key==="⌫"){
    expressionText=expressionText.slice(0,-1);
  }else if(key==="="){
    try{
      const source=expressionText
        .replaceAll("×","*")
        .replaceAll("÷","/")
        .replaceAll("−","-");

      expressionText=String(calculate(source));
    }catch(error){
      expressionText="Қате";
    }
  }else{
    if(expressionText==="Қате")expressionText="";
    expressionText+=key;
  }

  $("calcDisplay").value=expressionText;
});

// ҚАУІПСІЗ МАТЕМАТИКАЛЫҚ ЕСЕПТЕУ
// eval() қолданылмайды

function calculate(source){
  if(!/^[0-9+\-*/(). ]+$/.test(source)){
    throw Error("Қате өрнек");
  }

  let pos=0;

  function spaces(){
    while(source[pos]===" ")pos++;
  }

  function factor(){
    spaces();

    if(source[pos]==="+"){
      pos++;
      return factor();
    }

    if(source[pos]==="-"){
      pos++;
      return -factor();
    }

    if(source[pos]==="("){
      pos++;
      const value=expression();
      spaces();

      if(source[pos]!==")")throw Error();
      pos++;
      return value;
    }

    const match=/^(?:\d+(?:\.\d*)?|\.\d+)/
      .exec(source.slice(pos));

    if(!match)throw Error();

    pos+=match[0].length;
    return Number(match[0]);
  }

  function term(){
    let value=factor();

    while(true){
      spaces();
      const op=source[pos];
      if(op!=="*" && op!=="/")break;

      pos++;
      const next=factor();

      value=op==="*"?value*next:value/next;
    }

    return value;
  }

  function expression(){
    let value=term();

    while(true){
      spaces();
      const op=source[pos];
      if(op!=="+" && op!=="-")break;

      pos++;
      const next=term();

      value=op==="+"?value+next:value-next;
    }

    return value;
  }

  const result=expression();
  spaces();

  if(pos!==source.length || !Number.isFinite(result)){
    throw Error();
  }

  return Number(result.toPrecision(12));
}

// ===============================================
// КЕЗ КЕЛГЕН ЖЕРІНЕН ҚОЗҒАЛТУ
// ===============================================

function clamp(value,min,max){
  return Math.max(min,Math.min(value,max));
}

function keepCalculatorInside(){
  if(calculator.classList.contains("hidden"))return;

  const r=calculator.getBoundingClientRect();

  const maxX=Math.max(0,innerWidth-r.width);
  const maxY=Math.max(0,innerHeight-r.height);

  calculator.style.left=clamp(r.left,0,maxX)+"px";
  calculator.style.top=clamp(r.top,0,maxY)+"px";

  calculator.style.right="auto";
  calculator.style.bottom="auto";
}

let pointerStart=null;
let suppressNextClick=false;

// Қай жерінен басталса да pointerdown ұсталады.
calculator.addEventListener("pointerdown",event=>{
  if(event.pointerType==="mouse" && event.button!==0){
    return;
  }

  const r=calculator.getBoundingClientRect();

  pointerStart={
    id:event.pointerId,
    startX:event.clientX,
    startY:event.clientY,
    left:r.left,
    top:r.top,
    dragging:false
  };
});

// Қозғалысты терезе деңгейінде бақылаймыз.
// Сол себепті калькулятор шегінен шығып кетсе де
// сүйреу жалғаса береді.
window.addEventListener("pointermove",event=>{
  const d=pointerStart;

  if(!d || d.id!==event.pointerId)return;

  const dx=event.clientX-d.startX;
  const dy=event.clientY-d.startY;

  // 7 пиксельден аз қозғалыс жай басу деп есептеледі.
  if(!d.dragging && Math.hypot(dx,dy)>7){
    d.dragging=true;
    suppressNextClick=true;

    calculator.classList.add("dragging");

    calculator.style.left=d.left+"px";
    calculator.style.top=d.top+"px";
    calculator.style.right="auto";
    calculator.style.bottom="auto";
  }

  if(!d.dragging)return;

  // Сүйрегенде мәтін таңдалмайды.
  if(event.cancelable)event.preventDefault();

  const maxX=Math.max(
    0,innerWidth-calculator.offsetWidth
  );

  const maxY=Math.max(
    0,innerHeight-calculator.offsetHeight
  );

  calculator.style.left=clamp(
    d.left+dx,0,maxX
  )+"px";

  calculator.style.top=clamp(
    d.top+dy,0,maxY
  )+"px";
},{passive:false});

function stopCalculatorDrag(event){
  if(
    !pointerStart ||
    pointerStart.id!==event.pointerId
  )return;

  const wasDragging=pointerStart.dragging;

  pointerStart=null;
  calculator.classList.remove("dragging");

  if(wasDragging){
    // Сүйрегеннен соң кездейсоқ сан басылып кетпесін.
    setTimeout(()=>{
      suppressNextClick=false;
    },0);
  }
}

window.addEventListener("pointerup",stopCalculatorDrag);
window.addEventListener("pointercancel",stopCalculatorDrag);

calculator.addEventListener("click",event=>{
  if(!suppressNextClick)return;

  event.preventDefault();
  event.stopImmediatePropagation();
},true);

window.addEventListener("resize",keepCalculatorInside);

// ===============================================
// МЕНДЕЛЕЕВ КЕСТЕСІ — 118 ЭЛЕМЕНТ
// ===============================================

const elementText=`
H|Сутек|1.008
He|Гелий|4.003
Li|Литий|6.94
Be|Бериллий|9.012
B|Бор|10.81
C|Көміртек|12.011
N|Азот|14.007
O|Оттек|15.999
F|Фтор|18.998
Ne|Неон|20.180
Na|Натрий|22.990
Mg|Магний|24.305
Al|Алюминий|26.982
Si|Кремний|28.085
P|Фосфор|30.974
S|Күкірт|32.06
Cl|Хлор|35.45
Ar|Аргон|39.948
K|Калий|39.098
Ca|Кальций|40.078
Sc|Скандий|44.956
Ti|Титан|47.867
V|Ванадий|50.942
Cr|Хром|51.996
Mn|Марганец|54.938
Fe|Темір|55.845
Co|Кобальт|58.933
Ni|Никель|58.693
Cu|Мыс|63.546
Zn|Мырыш|65.38
Ga|Галлий|69.723
Ge|Германий|72.630
As|Мышьяк|74.922
Se|Селен|78.971
Br|Бром|79.904
Kr|Криптон|83.798
Rb|Рубидий|85.468
Sr|Стронций|87.62
Y|Иттрий|88.906
Zr|Цирконий|91.224
Nb|Ниобий|92.906
Mo|Молибден|95.95
Tc|Технеций|[98]
Ru|Рутений|101.07
Rh|Родий|102.906
Pd|Палладий|106.42
Ag|Күміс|107.868
Cd|Кадмий|112.414
In|Индий|114.818
Sn|Қалайы|118.710
Sb|Сурьма|121.760
Te|Теллур|127.60
I|Йод|126.904
Xe|Ксенон|131.293
Cs|Цезий|132.905
Ba|Барий|137.327
La|Лантан|138.905
Ce|Церий|140.116
Pr|Празеодим|140.908
Nd|Неодим|144.242
Pm|Прометий|[145]
Sm|Самарий|150.36
Eu|Еуропий|151.964
Gd|Гадолиний|157.25
Tb|Тербий|158.925
Dy|Диспрозий|162.500
Ho|Гольмий|164.930
Er|Эрбий|167.259
Tm|Тулий|168.934
Yb|Иттербий|173.045
Lu|Лютеций|174.967
Hf|Гафний|178.49
Ta|Тантал|180.948
W|Вольфрам|183.84
Re|Рений|186.207
Os|Осмий|190.23
Ir|Иридий|192.217
Pt|Платина|195.084
Au|Алтын|196.967
Hg|Сынап|200.592
Tl|Таллий|204.38
Pb|Қорғасын|207.2
Bi|Висмут|208.980
Po|Полоний|[209]
At|Астат|[210]
Rn|Радон|[222]
Fr|Франций|[223]
Ra|Радий|[226]
Ac|Актиний|[227]
Th|Торий|232.038
Pa|Протактиний|231.036
U|Уран|238.029
Np|Нептуний|[237]
Pu|Плутоний|[244]
Am|Америций|[243]
Cm|Кюрий|[247]
Bk|Берклий|[247]
Cf|Калифорний|[251]
Es|Эйнштейний|[252]
Fm|Фермий|[257]
Md|Менделевий|[258]
No|Нобелий|[259]
Lr|Лоуренсий|[266]
Rf|Резерфордий|[267]
Db|Дубний|[268]
Sg|Сиборгий|[269]
Bh|Борий|[270]
Hs|Хассий|[277]
Mt|Мейтнерий|[278]
Ds|Дармштадтий|[281]
Rg|Рентгений|[282]
Cn|Коперниций|[285]
Nh|Нихоний|[286]
Fl|Флеровий|[289]
Mc|Московий|[290]
Lv|Ливерморий|[293]
Ts|Теннессин|[294]
Og|Оганесон|[294]
`;

const elements=elementText.trim().split("\n")
  .map((line,i)=>{
    const [symbol,name,mass]=line.trim().split("|");
    return {number:i+1,symbol,name,mass};
  });

// ===============================================
// ЭЛЕМЕНТТЕРДІҢ ТОРДАҒЫ ОРЫНДАРЫ
// ===============================================

const firstPeriods=[
  [1,18],
  [1,2,13,14,15,16,17,18],
  [1,2,13,14,15,16,17,18],
  Array.from({length:18},(_,i)=>i+1),
  Array.from({length:18},(_,i)=>i+1)
];

function elementPosition(z){
  if(z<=54){
    let index=z-1;

    for(let period=0;period<5;period++){
      const cols=firstPeriods[period];

      if(index<cols.length){
        return {row:period+1,col:cols[index]};
      }

      index-=cols.length;
    }
  }

  if(z>=55 && z<=57)
    return {row:6,col:z-54};

  if(z>=58 && z<=71)
    return {row:9,col:z-54};

  if(z>=72 && z<=86)
    return {row:6,col:z-68};

  if(z>=87 && z<=89)
    return {row:7,col:z-86};

  if(z>=90 && z<=103)
    return {row:10,col:z-86};

  if(z>=104 && z<=118)
    return {row:7,col:z-100};

  return {row:10,col:18};
}

const halogens=new Set(["F","Cl","Br","I","At","Ts"]);
const nobles=new Set(["He","Ne","Ar","Kr","Xe","Rn","Og"]);
const group2=new Set(["Be","Mg","Ca","Sr","Ba","Ra"]);
const nonmetals=new Set(["H","C","N","O","P","S","Se"]);
const metalloids=new Set(["B","Si","Ge","As","Sb","Te"]);

function category(z,symbol){
  if(z>=57&&z<=71)return "lanth";
  if(z>=89&&z<=103)return "act";

  if(halogens.has(symbol))return "halogen";
  if(nobles.has(symbol))return "noble";
  if(group2.has(symbol))return "group2";
  if(nonmetals.has(symbol))return "nonmetal";
  if(metalloids.has(symbol))return "metalloid";

  return "metal";
}

// ===============================================
// ТОПТАР МЕН ПЕРИОДТАРДЫ САЛУ
// ===============================================

function buildPeriodic(){
  let html=`
    <div class="period-corner"
      style="grid-row:1;grid-column:1">
      Топ / Период
    </div>
  `;

  // 18 ТОП
  for(let group=1;group<=18;group++){
    html+=`
      <div class="group-num ${group===17?"highlight":""}"
        style="
          grid-row:1;
          grid-column:${group+1}
        ">
        ${group}
      </div>
    `;
  }

  // 7 ПЕРИОД
  for(let period=1;period<=7;period++){
    html+=`
      <div class="period-num"
        style="
          grid-row:${period+1};
          grid-column:1
        ">
        ${period}
      </div>
    `;
  }

  html+=`
    <div class="period-num series"
      style="grid-row:10;grid-column:1">
      Лантаноидтар
    </div>

    <div class="period-num series"
      style="grid-row:11;grid-column:1">
      Актиноидтар
    </div>
  `;

  // ЭЛЕМЕНТТЕР
  html+=elements.map((e,i)=>{
    const p=elementPosition(e.number);

    return `
      <button
        class="element ${category(e.number,e.symbol)}"
        style="
          grid-row:${p.row+1};
          grid-column:${p.col+1}
        "
        onclick="showElement(${i})">

        <span class="num">${e.number}</span>
        <span class="symbol">${e.symbol}</span>
        <span class="ename">${esc(e.name)}</span>
        <span class="mass">${e.mass}</span>
      </button>
    `;
  }).join("");

  $("periodicGrid").innerHTML=html;
}

function showElement(index){
  const e=elements[index];
  if(!e)return;

  const p=elementPosition(e.number);

  const period=
    p.row===9?6:
    p.row===10?7:
    p.row;

  const group=
    p.row>7?"f-блок":
    p.col+"-топ";

  $("elementInfo").innerHTML=`
    <b class="blue">
      ${e.number}. ${esc(e.name)} (${e.symbol})
    </b>

    <div>
      ${period}-период ·
      <b class="green-text">${group}</b>
    </div>

    <div>
      Атомдық масса немесе изотоптың массалық саны:
      <b class="gold">${e.mass}</b>
    </div>
  `;
}

// ===============================================
// МЕНДЕЛЕЕВ КЕСТЕСІН АШУ ЖӘНЕ ЖАБУ
// ===============================================

$("tableOpen").onclick=()=>{
  $("periodicModal").classList.remove("hidden");
};

$("tableClose").onclick=()=>{
  $("periodicModal").classList.add("hidden");
};

$("periodicModal").addEventListener("click",event=>{
  if(event.target===$("periodicModal")){
    $("periodicModal").classList.add("hidden");
  }
});

document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){
    $("periodicModal").classList.add("hidden");
    calculator.classList.add("hidden");
  }
});

// ===============================================
// БАСТАПҚЫ ІСКЕ ҚОСУ
// ===============================================

buildPeriodic();
updateTimer();
updateClock();
show();
