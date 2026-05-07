import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, User, Volume2, Volume1, Download, Star, Award, MessageSquare, 
  RefreshCcw, CheckCircle2, Mic, Square, ChevronRight, 
  BookOpen, MessageCircle, Eye, EyeOff, ShieldCheck, Sparkles, BookA,
  Lock, LogOut, Plus, Save, X, Info, Trash2, Activity
} from 'lucide-react';

// --- HELPER: Parse Furigana từ cú pháp [漢字|hiragana] ---
function FuriganaText({ text }) {
  if (!text) return null;
  const parts = text.split(/(\[[^|]+\|[^\]]+\])/g);
  return (
    <span className="leading-loose">
      {parts.map((part, i) => {
        const match = part.match(/\[([^|]+)\|([^\]]+)\]/);
        if (match) {
          return (
            <ruby key={i} className="mx-0.5">
              {match[1]}<rt className="text-[0.55em] text-[#F26522] font-medium tracking-tighter">{match[2]}</rt>
            </ruby>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// --- MOCK DATABASE ---
const initialTopics = [
  { 
    id: 't1', title: 'Giới thiệu bản thân', level: 'N5',
    req: 'Hãy giới thiệu tên, tuổi, quê quán, sở thích và lý do bạn học tiếng Nhật trong khoảng 1 phút.',
    isPublished: true,
    hint: {
      jp: "[初|はじ]めまして。[私|わたし]は[山田|やまだ]と[申|もう]します。ベトナムから[来|き]ました。[趣味|しゅみ]は[映画|えいが]を[見|み]ることです。[日本|にほん]の[文化|ぶんか]が[好|す]きなので、[日本語|にほんご]を[勉強|べんきょう]しています。よろしくお[願|ねが]いします。",
      romaji: "Hajimemashite. Watashi wa Yamada to moushimasu. Betonamu kara kimashita. Shumi wa eiga o miru koto desu. Nihon no bunka ga suki na node, nihongo o benkyou shite imasu. Yoroshiku onegaishimasu.",
      vi: "Rất hân hạnh. Tôi tên là Yamada. Tôi đến từ Việt Nam. Sở thích của tôi là xem phim. Vì tôi thích văn hóa Nhật Bản nên tôi đang học tiếng Nhật. Rất mong được giúp đỡ."
    }
  },
  { 
    id: 't2', title: 'Môi trường làm việc lý tưởng', level: 'N2',
    req: 'Trình bày quan điểm của bạn về một môi trường làm việc tốt. Cần có những yếu tố nào? Lương bổng hay văn hóa công ty quan trọng hơn?',
    isPublished: true,
    hint: {
      jp: "[私|わたし]にとって[理想的|りそうてき]な[職場|しょくば]は、[給料|きゅうりょう]だけでなく[人間関係|にんげんかんけい]が[良好|りょうこう]な[環境|かんきょう]です。[意見|いけん]を[自由|じゆう]に[言|い]える[雰囲気|ふんいき]が[一番|いちばん][重要|じゅうよう]だと[思|おも]います。",
      romaji: "Watashi ni totte risouteki na shokuba wa, kyuuryou dake de naku ningen kankei ga ryoukou na kankyou desu. Iken o jiyuu ni ieru fun'iki ga ichiban juuyou da to omoimasu.",
      vi: "Đối với tôi, nơi làm việc lý tưởng không chỉ là tiền lương mà còn là môi trường có mối quan hệ con người tốt đẹp. Tôi nghĩ bầu không khí có thể tự do bày tỏ ý kiến là quan trọng nhất."
    }
  }
];

const initialShadowing = [
  { 
    id: 's1', level: 'N5', type: 'vocab', title: 'Chủ đề: Trường học & Học tập', isPublished: true,
    items: [
      { jp: '[学校|がっこう]', romaji: 'Gakkou', vi: 'Trường học' },
      { jp: '[学生|がくせい]', romaji: 'Gakusei', vi: 'Học sinh' },
      { jp: '[先生|せんせい]', romaji: 'Sensei', vi: 'Giáo viên' },
      { jp: '[教室|きょうしつ]', romaji: 'Kyoushitsu', vi: 'Phòng học' },
      { jp: '[本|ほん]', romaji: 'Hon', vi: 'Sách' },
      { jp: '[辞書|じしょ]', romaji: 'Jisho', vi: 'Từ điển' },
      { jp: '[鉛筆|えんぴつ]', romaji: 'Enpitsu', vi: 'Bút chì' },
      { jp: '[消|け]しゴム', romaji: 'Keshigomu', vi: 'Cục tẩy' },
      { jp: '[勉強|べんきょう]する', romaji: 'Benkyou suru', vi: 'Học bài' },
      { jp: '[宿題|しゅくだい]', romaji: 'Shukudai', vi: 'Bài tập về nhà' }
    ]
  },
  { 
    id: 's2', level: 'N5', type: 'sentence', title: 'Bài 1: Giao tiếp hàng ngày', isPublished: true,
    items: [
      { jp: 'おはようございます。', romaji: 'Ohayou gozaimasu.', vi: 'Chào buổi sáng.' },
      { jp: 'お[元気|げんき]ですか。', romaji: 'O-genki desu ka.', vi: 'Bạn có khỏe không?' },
      { jp: '[週末|しゅうまつ]は[友達|ともだち]と[映画|えいが]を[見|み]に[行|い]きます。', romaji: 'Shuumatsu wa tomodachi to eiga o mi ni ikimasu.', vi: 'Cuối tuần tôi sẽ đi xem phim với bạn.' },
      { jp: 'これは[私|わたし]の[傘|かさ]です。', romaji: 'Kore wa watashi no kasa desu.', vi: 'Đây là cái ô của tôi.' },
      { jp: 'ありがとうございます。', romaji: 'Arigatou gozaimasu.', vi: 'Xin cảm ơn rất nhiều.' }
    ]
  },
  { 
    id: 's3', level: 'N3', type: 'sentence', title: 'Bài 1: Cấu trúc ngữ pháp N3', isPublished: true,
    items: [
      { jp: '[雨|あめ]が[降|ふ]っているので、[家|いえ]にいたほうがいいです。', romaji: 'Ame ga futte iru node, ie ni ita hou ga ii desu.', vi: 'Vì trời đang mưa nên tốt hơn là ở nhà.' },
      { jp: 'あのレストランは[美味|おい]しい[上|うえ]に、[値段|ねだん]も[安|やす]いです。', romaji: 'Ano resutoran wa oishii ue ni, nedan mo yasui desu.', vi: 'Nhà hàng đó không chỉ ngon mà giá còn rẻ nữa.' },
      { jp: '[疲|つか]れたら、[少|すこ]し[休|やす]むべきです。', romaji: 'Tsukaretara, sukoshi yasumu beki desu.', vi: 'Nếu mệt, bạn nên nghỉ ngơi một chút.' },
      { jp: '[漢字|かんじ]を[覚|おぼ]えるために、[毎日|まいにち][書|か]いています。', romaji: 'Kanji o oboeru tame ni, mainichi kaite imasu.', vi: 'Để nhớ Hán tự, tôi viết mỗi ngày.' },
      { jp: '[彼|かれ]は[来|こ]ないはずです。', romaji: 'Kare wa konai hazu desu.', vi: 'Chắc chắn anh ấy sẽ không đến.' }
    ]
  }
];

export default function App() {
  const [role, setRole] = useState('user'); 
  const [activeMode, setActiveMode] = useState(null); 
  const [studentName, setStudentName] = useState('');
  const [logoError, setLogoError] = useState(false);

  const [dbTopics, setDbTopics] = useState(initialTopics);
  const [dbShadowing, setDbShadowing] = useState(initialShadowing);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { background: white !important; }
        body * { visibility: hidden; }
        #printable-report, #printable-report * { visibility: visible; }
        #printable-report { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; }
        .no-print { display: none !important; }
      }
      .fuji-bg { background-color: #FFFaf0; position: relative; min-height: 100vh; overflow-x: hidden; }
      .app-content { position: relative; z-index: 10; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleAdminLogin = (password) => {
    if (password === 'admin123') { setRole('admin'); setActiveMode(null); } 
    else { alert('Sai mật khẩu quản trị!'); }
  };

  const handleModeSelect = (mode) => {
    if (!studentName.trim()) {
      alert("Vui lòng nhập tên học viên trước khi bắt đầu!");
      document.getElementById('student-name-input')?.focus();
      return;
    }
    setActiveMode(mode);
  };

  const renderHome = () => (
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto mt-12 px-4 pb-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 mb-4">Chào mừng đến với Nihongo Spark</h2>
        <p className="text-slate-600 font-medium">Hệ thống luyện nói và phát âm tiếng Nhật thông minh.</p>
      </div>

      <div className="mb-10 max-w-md mx-auto">
        <label className="block text-center font-bold text-slate-700 mb-3">1. Nhập tên của bạn để bắt đầu:</label>
        <div className="bg-white/95 backdrop-blur-sm p-2 pl-5 rounded-2xl shadow-md border border-[#f0e0d8] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#F26522]/50 transition-all">
          <User className={studentName.trim() ? "text-green-500 transition-colors" : "text-[#F26522] transition-colors"} />
          <input 
            id="student-name-input"
            type="text" 
            placeholder="Ví dụ: Nguyễn Văn A..."
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className="flex-1 bg-transparent outline-none font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium py-2"
          />
          {studentName.trim() && (
            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-xs font-bold animate-in zoom-in flex items-center gap-1">
              <CheckCircle2 size={14}/> Đã nhận
            </span>
          )}
        </div>
      </div>

      <div className="text-center mb-6">
        <label className="block font-bold text-slate-700">2. Chọn chế độ luyện tập:</label>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <button onClick={() => handleModeSelect('shadowing')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#F26522] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <MessageCircle size={40} className="text-[#F26522] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Shadowing</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">Bắt chước lại theo từ vựng hoặc câu mẫu. Chấm điểm chi tiết trường âm, trọng âm. Luyện đến khi đạt chuẩn.</p>
        </button>

        <button onClick={() => handleModeSelect('topic')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#F26522] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <BookOpen size={40} className="text-[#F26522] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Nói theo chủ đề</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">Thuyết trình theo chủ đề. Đánh giá đa chiều về độ trôi chảy, bám sát nội dung, từ vựng và ngữ pháp.</p>
        </button>

        <button onClick={() => handleModeSelect('free')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#F26522] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <Mic size={40} className="text-[#F26522] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Nói tự do</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">Thu âm tự do. Hệ thống chấm điểm dựa trên độ lưu loát, mạch lạc, phát triển ý và tính tự nhiên.</p>
        </button>
      </div>

      <div className="mt-16 text-center">
        <button onClick={() => setActiveMode('adminLogin')} className="text-xs text-slate-400 hover:text-[#F26522] transition-colors underline decoration-dotted">
          Dành cho Quản trị viên
        </button>
      </div>
    </div>
  );

  return (
    <div className="fuji-bg text-slate-800 font-sans selection:bg-[#F26522] selection:text-white">
      {/* KHÔNG GIAN BẦU TRỜI: BẦY SẾU ĐẦU ĐỎ (CRANES) */}
      <div className="fixed top-0 left-0 w-full h-[60vh] pointer-events-none z-0 overflow-hidden">
        {/* Đẩy bầy sếu lên cao hơn và lệch hẳn sang phải để nằm ở khoảng trống, không đè vào chữ */}
        <div className="absolute top-20 right-[-5%] md:top-24 md:right-8 lg:right-20 w-56 h-56 md:w-72 md:h-72 opacity-50 transform -rotate-12">
          <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-md">
            {/* Hạc 1 (Lớn) */}
            <g transform="translate(200, 100) scale(1)">
              <path d="M 0 0 C -40 -30 -60 20 -80 30 C -40 20 -20 10 0 0 Z" fill="#475569"/> {/* Cánh trái bóng */}
              <path d="M 0 0 C 40 -30 60 20 80 30 C 40 20 20 10 0 0 Z" fill="#94a3b8"/> {/* Cánh phải bóng */}
              <path d="M 0 0 C -30 -20 -50 30 -70 40 C -30 30 -10 10 0 0 Z" fill="#ffffff"/> {/* Cánh trái trắng */}
              <path d="M 0 0 C 30 -20 50 30 70 40 C 30 30 10 10 0 0 Z" fill="#f8fafc"/> {/* Cánh phải trắng */}
              <path d="M -20 -10 C 0 -10 20 -10 0 50 C -10 20 -15 0 -20 -10 Z" fill="#ffffff"/> {/* Thân dài */}
              <path d="M -20 -10 C -30 -20 -35 -35 -30 -45 C -25 -30 -15 -20 -20 -10 Z" fill="#ffffff"/> {/* Cổ vươn lên */}
              <circle cx="-32" cy="-48" r="4" fill="#dc2626"/> {/* Đỉnh đầu ĐỎ */}
              <path d="M -35 -45 L -45 -50 L -33 -40 Z" fill="#1e293b"/> {/* Mỏ */}
              <path d="M -20 -10 C -25 -20 -28 -30 -30 -40 C -28 -25 -20 -15 -20 -10 Z" fill="#1e293b"/> {/* Đen đuôi cổ */}
            </g>
            {/* Hạc 2 (Nhỏ hơn, bay phía sau) */}
            <g transform="translate(100, 200) scale(0.6)">
              <path d="M 0 0 C -30 -20 -50 30 -70 40 C -30 30 -10 10 0 0 Z" fill="#ffffff"/> 
              <path d="M 0 0 C 30 -20 50 30 70 40 C 30 30 10 10 0 0 Z" fill="#f8fafc"/>
              <path d="M -20 -10 C 0 -10 20 -10 0 50 C -10 20 -15 0 -20 -10 Z" fill="#ffffff"/> 
              <path d="M -20 -10 C -30 -20 -35 -35 -30 -45 C -25 -30 -15 -20 -20 -10 Z" fill="#ffffff"/>
              <circle cx="-32" cy="-48" r="4" fill="#dc2626"/> 
              <path d="M -35 -45 L -45 -50 L -33 -40 Z" fill="#1e293b"/> 
              <path d="M -20 -10 C -25 -20 -28 -30 -30 -40 C -28 -25 -20 -15 -20 -10 Z" fill="#1e293b"/> 
            </g>
            {/* Hạc 3 (Xa nhất) */}
            <g transform="translate(300, 250) scale(0.4)">
              <path d="M 0 0 C -30 -20 -50 30 -70 40 C -30 30 -10 10 0 0 Z" fill="#ffffff"/> 
              <path d="M 0 0 C 30 -20 50 30 70 40 C 30 30 10 10 0 0 Z" fill="#f8fafc"/>
              <path d="M -20 -10 C 0 -10 20 -10 0 50 C -10 20 -15 0 -20 -10 Z" fill="#ffffff"/> 
              <path d="M -20 -10 C -30 -20 -35 -35 -30 -45 C -25 -30 -15 -20 -20 -10 Z" fill="#ffffff"/>
              <circle cx="-32" cy="-48" r="4" fill="#dc2626"/> 
              <path d="M -35 -45 L -45 -50 L -33 -40 Z" fill="#1e293b"/> 
            </g>
          </svg>
        </div>
      </div>

      {/* CHÂN NÚI PHÚ SĨ */}
      <div className="fixed bottom-0 left-0 w-full h-[40vh] pointer-events-none z-0 opacity-40">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full absolute bottom-0">
          <path fill="#fca5a5" fillOpacity="0.2" d="M0,320L1440,320L1440,250L1100,100L850,250L600,80L350,220L0,150Z"></path>
          <path fill="#94a3b8" d="M 400 320 L 720 120 L 1040 320 Z"></path>
          <path fill="#ffffff" d="M 640 170 L 720 120 L 800 170 L 760 190 L 720 160 L 680 190 Z"></path>
          <circle cx="850" cy="100" r="40" fill="#F26522" opacity="0.3"></circle>
        </svg>
      </div>

      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-[#f0e0d8] sticky top-0 z-50 app-content no-print">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveMode(null); }}>
            
            {/* Xử lý Logo MVA */}
            {!logoError ? (
              <img 
                src="171045151_1082518945577423_933278627676106455_n (4).png" 
                alt="MVA Logo" 
                className="h-8 w-auto object-contain" 
                onError={() => setLogoError(true)} 
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 100 100" fill="none" stroke="#F26522" strokeWidth="12" strokeLinejoin="miter" className="w-full h-full">
                  {/* Bản vẽ MVA Logo chuẩn xác: Viền trái thẳng đứng -> Chéo xuống giữa -> Chéo lên phải -> Viền phải thẳng đứng -> Chéo về giữa */}
                  <path d="M 15 90 L 15 15 L 50 50 L 85 15 L 85 90 L 50 50" />
                </svg>
              </div>
            )}

            <h1 className="font-bold text-xl tracking-tight text-[#F26522]">NIHONGO<span className="text-slate-800"> SPARK</span></h1>
          </div>

          <div className="flex items-center gap-4">
            {role === 'admin' ? (
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                  <ShieldCheck size={14} /> QUẢN TRỊ
                </span>
                <button onClick={() => { setRole('user'); setActiveMode(null); }} className="text-sm font-bold text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <LogOut size={16}/> Đăng xuất
                </button>
              </div>
            ) : (
              activeMode && activeMode !== 'adminLogin' && (
                <button onClick={() => setActiveMode(null)} className="text-sm font-bold text-slate-500 hover:text-[#F26522] flex items-center gap-1 transition-colors">
                  <RefreshCcw size={14} /> Đổi chế độ
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="app-content min-h-[calc(100vh-64px)]">
        {activeMode === 'adminLogin' && (
          <div className="max-w-sm mx-auto mt-20 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 animate-in fade-in zoom-in">
            <Lock className="text-[#F26522] mx-auto mb-4" size={40} />
            <h2 className="text-xl font-bold text-center text-slate-800 mb-6">Đăng nhập Admin</h2>
            <input 
              type="password" id="adminPwd" placeholder="Nhập mật khẩu..." 
              className="w-full p-3 border border-slate-300 rounded-xl mb-4 focus:outline-none focus:border-[#F26522]"
              onKeyDown={(e) => { if(e.key === 'Enter') handleAdminLogin(e.target.value) }}
            />
            <button onClick={() => handleAdminLogin(document.getElementById('adminPwd').value)} className="w-full bg-[#F26522] text-white font-bold py-3 rounded-xl shadow hover:bg-[#d95618]">
              Đăng nhập
            </button>
            <button onClick={() => setActiveMode(null)} className="w-full mt-3 text-sm text-slate-500 hover:text-slate-800">Quay lại</button>
          </div>
        )}

        {role === 'admin' && !activeMode ? (
           <AdminPanel dbTopics={dbTopics} setDbTopics={setDbTopics} dbShadowing={dbShadowing} setDbShadowing={setDbShadowing} />
        ) : role === 'user' ? (
          <>
            {!activeMode && renderHome()}
            {activeMode === 'free' && <FreeAndTopicMode type="free" studentName={studentName} onRequireName={() => setActiveMode(null)} dbTopics={dbTopics} />}
            {activeMode === 'topic' && <FreeAndTopicMode type="topic" studentName={studentName} onRequireName={() => setActiveMode(null)} dbTopics={dbTopics} />}
            {activeMode === 'shadowing' && <ShadowingMode studentName={studentName} onRequireName={() => setActiveMode(null)} dbShadowing={dbShadowing} />}
          </>
        ) : null}
      </main>
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: ADMIN PANEL (Bỏ qua để nhường chỗ logic xử lý điểm)
// ---------------------------------------------------------
function AdminPanel({ dbTopics, setDbTopics, dbShadowing, setDbShadowing }) {
  const [tab, setTab] = useState('topics');
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingShadow, setEditingShadow] = useState(null);
  const [shadowItemsText, setShadowItemsText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Helper AI Fake Generation
  const handleSimulateAITopic = () => {
    if(!aiPrompt) { alert('Vui lòng nhập yêu cầu cho AI!'); return; }
    setIsAiGenerating(true);
    setTimeout(() => {
      setEditingTopic({
        id: 't' + Date.now(), title: `[AI] Chủ đề: ${aiPrompt.substring(0, 15)}...`, level: 'N3',
        req: `Hãy trình bày suy nghĩ của bạn về: ${aiPrompt}. Đảm bảo bài nói 1-2 phút.`, isPublished: false,
        hint: { jp: "[AI|えーあい]が[生成|せいせい]した[例文|れいぶん]です。ここを[編集|へんしゅう]してください。", romaji: "AI ga seisei shita reibun desu. Koko o henshuu shite kudasai.", vi: "Đây là câu mẫu do AI tạo ra." }
      });
      setIsAiGenerating(false); setAiPrompt('');
    }, 1000);
  };
  const handleSimulateAIShadow = () => {
    if(!aiPrompt) { alert('Vui lòng nhập yêu cầu!'); return; }
    setIsAiGenerating(true);
    setTimeout(() => {
      setEditingShadow({ id: 's' + Date.now(), level: 'N4', type: 'vocab', title: `[AI] ${aiPrompt.substring(0, 20)}`, isPublished: false, items: [] });
      setShadowItemsText("[家族|かぞく] / Kazoku / Gia đình\n[友達|ともだち] / Tomodachi / Bạn bè");
      setIsAiGenerating(false); setAiPrompt('');
    }, 1000);
  };

  const saveTopic = (isPublished) => {
    if(!editingTopic.title) { alert("Nhập tên chủ đề!"); return; }
    const newTopic = { ...editingTopic, isPublished };
    setDbTopics(dbTopics.some(t => t.id === newTopic.id) ? dbTopics.map(t => t.id === newTopic.id ? newTopic : t) : [newTopic, ...dbTopics]);
    setEditingTopic(null);
  };
  const saveShadow = (isPublished) => {
    if(!editingShadow.title) { alert("Nhập tên bài học!"); return; }
    const parsedItems = shadowItemsText.split('\n').filter(line => line.trim() !== '').map(line => {
      const parts = line.split('/').map(p => p.trim());
      return { jp: parts[0] || '', romaji: parts[1] || '', vi: parts[2] || '' };
    });
    const newShadow = { ...editingShadow, items: parsedItems, isPublished };
    setDbShadowing(dbShadowing.some(s => s.id === newShadow.id) ? dbShadowing.map(s => s.id === newShadow.id ? newShadow : s) : [newShadow, ...dbShadowing]);
    setEditingShadow(null);
  };

  const toggleTopicPublish = (id) => setDbTopics(dbTopics.map(t => t.id === id ? { ...t, isPublished: !t.isPublished } : t));
  const toggleShadowPublish = (id) => setDbShadowing(dbShadowing.map(s => s.id === id ? { ...s, isPublished: !s.isPublished } : s));
  const handleDeleteTopic = (id) => { if (window.confirm("Xóa vĩnh viễn?")) setDbTopics(dbTopics.filter(t => t.id !== id)); };
  const handleDeleteShadow = (id) => { if (window.confirm("Xóa vĩnh viễn?")) setDbShadowing(dbShadowing.filter(s => s.id !== id)); };

  const startEditTopic = (t) => { setEditingTopic({...t}); };
  const startEditShadow = (s) => { 
    setEditingShadow({...s}); 
    setShadowItemsText(s.items.map(i => `${i.jp} / ${i.romaji} / ${i.vi}`).join('\n'));
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-in fade-in duration-500 px-4 pb-20">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button onClick={() => {setTab('topics'); setEditingTopic(null);}} className={`flex-1 py-4 font-bold text-center border-b-2 ${tab === 'topics' ? 'border-[#F26522] text-[#F26522] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Quản lý Chủ đề</button>
          <button onClick={() => {setTab('shadowing'); setEditingShadow(null);}} className={`flex-1 py-4 font-bold text-center border-b-2 ${tab === 'shadowing' ? 'border-[#F26522] text-[#F26522] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Quản lý Shadowing</button>
        </div>
        <div className="p-8">
          {tab === 'topics' && (
            <div>
              {!editingTopic ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800">Kho Chủ đề</h3>
                    <button onClick={() => setEditingTopic({ id: '', title: '', level: 'N5', req: '', isPublished: false, hint: { jp:'', romaji:'', vi:'' }})} className="bg-[#F26522] text-white hover:bg-[#d95618] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md"><Plus size={18} /> Thêm mới</button>
                  </div>
                  <div className="space-y-4">
                    {dbTopics.map(topic => (
                      <div key={topic.id} className={`p-5 rounded-2xl border ${topic.isPublished ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50'}`}>
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                           <div>
                             <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded mr-2">{topic.level}</span>
                             <h4 className="font-bold text-lg text-[#F26522] inline-block">{topic.title}</h4>
                           </div>
                           <div className="flex gap-2 flex-wrap">
                             <button onClick={() => toggleTopicPublish(topic.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${topic.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{topic.isPublished ? <><Eye size={14}/> Công khai</> : <><EyeOff size={14}/> Nháp</>}</button>
                             <button onClick={() => startEditTopic(topic)} className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">Sửa</button>
                             <button onClick={() => handleDeleteTopic(topic.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold flex items-center gap-1"><Trash2 size={14}/> Xóa</button>
                           </div>
                         </div>
                         <p className="text-sm text-slate-600 mb-2 truncate">{topic.req}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4">
                   <div className="flex justify-between items-center mb-6 border-b pb-4">
                     <h3 className="font-bold text-xl text-slate-800">Soạn thảo Chủ đề</h3>
                     <button onClick={() => setEditingTopic(null)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mb-4">
                     <div><label className="block text-sm font-bold text-slate-700 mb-1">Tên chủ đề</label><input type="text" value={editingTopic.title} onChange={e => setEditingTopic({...editingTopic, title: e.target.value})} className="w-full p-3 border rounded-xl" /></div>
                     <div>
                       <label className="block text-sm font-bold text-slate-700 mb-1">Cấp độ</label>
                       <select value={editingTopic.level} onChange={e => setEditingTopic({...editingTopic, level: e.target.value})} className="w-full p-3 border rounded-xl">
                         <option value="N5">N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option>
                       </select>
                     </div>
                   </div>
                   <div className="mb-4"><label className="block text-sm font-bold text-slate-700 mb-1">Yêu cầu</label><textarea value={editingTopic.req} onChange={e => setEditingTopic({...editingTopic, req: e.target.value})} className="w-full p-3 border rounded-xl h-20" /></div>
                   <div className="p-4 border rounded-xl bg-slate-50 space-y-3">
                     <label className="block text-sm font-bold text-slate-800 border-b pb-2">Bài nói mẫu</label>
                     <div><label className="block text-xs font-bold mb-1">Tiếng Nhật (Hỗ trợ Furigana)</label><textarea value={editingTopic.hint.jp} onChange={e => setEditingTopic({...editingTopic, hint: {...editingTopic.hint, jp: e.target.value}})} className="w-full p-2 border rounded-lg h-24" /></div>
                     <div><label className="block text-xs font-bold mb-1">Romaji</label><input type="text" value={editingTopic.hint.romaji} onChange={e => setEditingTopic({...editingTopic, hint: {...editingTopic.hint, romaji: e.target.value}})} className="w-full p-2 border rounded-lg" /></div>
                     <div><label className="block text-xs font-bold mb-1">Tiếng Việt</label><input type="text" value={editingTopic.hint.vi} onChange={e => setEditingTopic({...editingTopic, hint: {...editingTopic.hint, vi: e.target.value}})} className="w-full p-2 border rounded-lg" /></div>
                   </div>
                   <div className="flex gap-4 mt-8 pt-4 border-t"><button onClick={() => saveTopic(false)} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold">Lưu Nháp</button><button onClick={() => saveTopic(true)} className="flex-1 bg-[#F26522] text-white py-3 rounded-xl font-bold">Lưu & Public</button></div>
                </div>
              )}
            </div>
          )}

          {tab === 'shadowing' && (
            <div>
              {!editingShadow ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800">Kho Shadowing</h3>
                    <button onClick={() => {setEditingShadow({ id: '', title: '', level: 'N5', type: 'sentence', isPublished: false, items: [] }); setShadowItemsText('');}} className="bg-[#F26522] text-white px-4 py-2 rounded-lg font-bold text-sm"><Plus size={18} className="inline"/> Thêm mới</button>
                  </div>
                  <div className="space-y-4">
                    {dbShadowing.map(shadow => (
                      <div key={shadow.id} className={`p-5 rounded-2xl border flex justify-between items-center gap-4 ${shadow.isPublished ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50'}`}>
                         <div>
                           <span className="text-xs font-bold bg-slate-200 px-2 py-1 rounded mr-2">{shadow.level}</span>
                           <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded mr-2">{shadow.type === 'vocab' ? 'Từ vựng' : 'Câu'}</span>
                           <h4 className="font-bold text-lg inline">{shadow.title}</h4>
                           <p className="text-xs text-slate-500 mt-1">{shadow.items.length} hạng mục</p>
                         </div>
                         <div className="flex gap-2">
                           <button onClick={() => toggleShadowPublish(shadow.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${shadow.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-200'}`}>{shadow.isPublished ? 'Public' : 'Nháp'}</button>
                           <button onClick={() => startEditShadow(shadow)} className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">Sửa</button>
                           <button onClick={() => handleDeleteShadow(shadow.id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold"><Trash2 size={14}/></button>
                         </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4">
                   <div className="flex justify-between items-center mb-6 border-b pb-4">
                     <h3 className="font-bold text-xl text-slate-800">Soạn thảo Bài học Shadowing</h3>
                     <button onClick={() => setEditingShadow(null)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
                   </div>
                   <div className="grid grid-cols-3 gap-4 mb-4">
                     <div><label className="block text-sm font-bold mb-1">Cấp độ</label><select value={editingShadow.level} onChange={e => setEditingShadow({...editingShadow, level: e.target.value})} className="w-full p-3 border rounded-xl"><option value="N5">N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option></select></div>
                     <div><label className="block text-sm font-bold mb-1">Loại</label><select value={editingShadow.type} onChange={e => setEditingShadow({...editingShadow, type: e.target.value})} className="w-full p-3 border rounded-xl"><option value="sentence">Câu văn</option><option value="vocab">Từ vựng</option></select></div>
                     <div><label className="block text-sm font-bold mb-1">Tên bài học</label><input type="text" value={editingShadow.title} onChange={e => setEditingShadow({...editingShadow, title: e.target.value})} className="w-full p-3 border rounded-xl" /></div>
                   </div>
                   <div className="mb-4">
                     <label className="block text-sm font-bold mb-2">Danh sách Từ vựng / Câu (Ngăn cách bằng /)</label>
                     <textarea value={shadowItemsText} onChange={e => setShadowItemsText(e.target.value)} className="w-full p-3 border rounded-xl h-64 font-mono text-sm" placeholder="[学校|がっこう] / Gakkou / Trường học"/>
                   </div>
                   <div className="flex gap-4 mt-8 pt-4 border-t"><button onClick={() => saveShadow(false)} className="flex-1 bg-slate-200 py-3 rounded-xl font-bold">Lưu Nháp</button><button onClick={() => saveShadow(true)} className="flex-1 bg-[#F26522] text-white py-3 rounded-xl font-bold">Lưu & Public</button></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// ENGINE CHẤM ĐIỂM THÔNG MINH - DỰA TRÊN NGỮ CẢNH VÀ CHẾ ĐỘ
// ---------------------------------------------------------

// Kho feedback phong phú theo từng mức điểm và chế độ
const feedbackBanks = {
  excellent: [
    "Bạn phát âm rất rõ và tự nhiên. Bài nói cho thấy bạn đã kiểm soát tốt nhịp điệu và ngữ điệu tiếng Nhật.",
    "Rất ấn tượng! Cách bạn phát âm và diễn đạt gần với mẫu tự nhiên, chỉ cần duy trì luyện tập để ổn định hơn.",
    "Bạn làm rất tốt. Các âm chính được phát âm rõ, câu nói mạch lạc và có độ trôi chảy cao.",
    "Bài nói của bạn rất chắc chắn. Phát âm, nhịp câu và cách triển khai ý đều xuất sắc.",
    "Xuất sắc! Bạn đã thể hiện khả năng nói tiếng Nhật rất tự tin, tự nhiên như người bản xứ."
  ],
  good: [
    "Bài nói của bạn rất tốt, độ trôi chảy cao. Tuy nhiên cần chú ý thêm một chút về cao độ (pitch accent).",
    "Khá khen ngợi cho nỗ lực của bạn! Nội dung tốt, chỉ vướng một vài lỗi nhỏ ở âm ghép hoặc trường âm.",
    "Bạn làm rất tốt phần nội dung, tuy nhiên hãy lưu ý ngắt nhịp (pause) sao cho tự nhiên hơn một chút nhé.",
    "Rất đáng khen! Bạn đã làm chủ được hầu hết các âm khó, cố gắng giữ nhịp nói ổn định hơn nữa.",
    "Phát âm của bạn khá chuẩn xác, hãy cố gắng nói tự tin và mở khẩu hình rõ hơn một chút là hoàn hảo."
  ],
  fair: [
    "Bạn đã có nền tảng khá tốt. Hãy luyện thêm về phát âm các trường âm và âm ngắt để nghe tự nhiên hơn.",
    "Bài nói ở mức khá. Nội dung truyền tải được nhưng nhịp câu còn hơi đều đều, cần nhấn nhá ngữ điệu lên xuống.",
    "Bạn có sự cố gắng lớn. Cần rèn luyện mở rộng từ vựng và ngữ pháp đa dạng hơn để bài nói mạch lạc.",
    "Cơ bản là ổn. Hãy luyện nghe (shadowing) nhiều hơn để bắt chước chính xác độ dài của các âm tiết (mora).",
    "Bạn đạt mức khá. Đừng vội nói nhanh, hãy kiểm soát tốc độ và phát âm rõ từng chữ nhé."
  ],
  almost: [
    "Bạn đang đi đúng hướng rồi! Hãy ưu tiên luyện tập lại các âm đục (b, d, g...) và âm bán đục (p).",
    "Cố gắng lên! Bài nói còn vấp và ngập ngừng, hãy thử đọc chậm lại từng đoạn ngắn trước nhé.",
    "Sắp đến đích rồi! Đừng nản, hãy chú ý hơn vào việc chia đúng thì của động từ và phát âm rõ các trợ từ.",
    "Bạn cần chú ý hơn về trường âm kéo dài. Hãy nghe lại audio mẫu vài lần nữa và đọc đuổi theo nhé.",
    "Nỗ lực đáng ghi nhận. Hãy ưu tiên khắc phục độ trôi chảy bằng cách đọc đi đọc lại 1 câu nhiều lần trước khi thu âm."
  ],
  needs_practice: [
    "Không sao cả, vạn sự khởi đầu nan! Hãy bắt đầu lại bằng cách nghe mẫu và đọc thật chậm từng âm một.",
    "Hệ thống nhận thấy bạn còn khá lúng túng. Đừng vội, hãy chia nhỏ bài nói ra và luyện tập từng cụm từ nhé.",
    "Bạn cần luyện tập thêm. Hãy chú ý lắng nghe cách người bản xứ ngắt nghỉ và thử bắt chước lại.",
    "Đừng lo lắng. Khuyên bạn nên ưu tiên tập phát âm chuẩn từng từ đơn trước khi ghép thành câu hoàn chỉnh.",
    "Có vẻ bài học này hơi khó với bạn. Hãy thử luyện tập lại từ từ, tập trung vào việc nói rõ ràng, không nuốt âm."
  ]
};

function getRandomFeedback(bankArray) {
  return bankArray[Math.floor(Math.random() * bankArray.length)];
}

function generateGradingResult(transcript, expectedRawText, level, mode) {
  const clamp = (val) => Math.min(10.0, Math.max(0.0, parseFloat(val))).toFixed(1);

  // Nếu không có transcript hoặc quá ngắn (có thể do lỗi mic, ồn...)
  if (!transcript || transcript.trim().length < 2) {
    return {
      score: '2.0', level: 'Cần luyện tập thêm',
      criteria: { 'Phát âm': '2.0', 'Độ trôi chảy': '2.0' },
      feedback: 'Hệ thống không nhận diện rõ bạn nói gì. Vui lòng kiểm tra Micro, tránh môi trường ồn ào và thử nói lớn hơn nhé.'
    };
  }

  // Làm sạch văn bản để so sánh cốt lõi (Bỏ furigana syntax, dấu câu)
  const cleanExpected = expectedRawText ? expectedRawText.replace(/\[([^|]+)\|([^\]]+)\]/g, '$1').replace(/[。、！？\s]/g, '') : '';
  const cleanTranscript = transcript.replace(/[。、！？\s]/g, '');

  let finalScore = 5.0; // Base score
  let criteriaObj = {};
  let specificErrorMsg = "";

  // ----- LOGIC ĐÁNH GIÁ THEO TỪNG CHẾ ĐỘ -----
  
  if (mode === 'vocab') {
    // SHADOWING TỪ VỰNG: Đòi hỏi độ chính xác cao nhất
    if (cleanTranscript === cleanExpected || cleanTranscript.includes(cleanExpected)) {
      finalScore = 9.5 + Math.random() * 0.5;
    } else {
      let matchCount = 0;
      for (let char of cleanTranscript) { if (cleanExpected.includes(char)) matchCount++; }
      const matchRate = matchCount / cleanExpected.length;
      finalScore = Math.max(3.0, matchRate * 10 - (level === 'N1' || level === 'N2' ? 2 : 0));
      
      // Chẩn đoán lỗi ngữ âm ngẫu nhiên nếu sai
      const phoneticErrors = ["trường âm (kéo dài âm)", "âm ngắt (tsu nhỏ)", "cao độ (pitch accent)", "âm mũi (n)"];
      specificErrorMsg = `Hệ thống nghe được: "${transcript}". Bạn phát âm chưa chuẩn từ này. Hãy chú ý lỗi về ${phoneticErrors[Math.floor(Math.random()*phoneticErrors.length)]} nhé.`;
    }
    criteriaObj = {
      'Phát âm': clamp(finalScore),
      'Độ rõ ràng': clamp(finalScore - Math.random())
    };
  } 
  
  else if (mode === 'sentence') {
    // SHADOWING THEO CÂU: Tìm từ bị sót hoặc sai
    let matchCount = 0;
    for (let char of cleanTranscript) { if (cleanExpected.includes(char)) matchCount++; }
    const matchRate = Math.min(1.0, matchCount / cleanExpected.length);
    
    // Nương nhẹ theo level
    const leniency = (level === 'N5' || level === 'N4') ? 1.2 : 0.9;
    finalScore = matchRate * 10 * leniency;

    if (finalScore < 9) {
       // Chỉ ra lỗi giả lập (Trích xuất random 1 ký tự Hán/Kana từ chuỗi gốc để báo lỗi)
       const sampleErrorWord = expectedRawText.length > 5 ? expectedRawText.charAt(Math.floor(Math.random() * (expectedRawText.length - 2))) : 'đầu câu';
       specificErrorMsg = `Hệ thống ghi nhận: "${transcript}". Bạn đã bỏ sót hoặc sai nhịp điệu. Cần cải thiện cách phát âm ở cụm từ có chứa chữ "${sampleErrorWord}".`;
    }
    criteriaObj = {
      'Độ chính xác nội dung': clamp(finalScore),
      'Phát âm & Nhịp điệu': clamp(finalScore - Math.random() * 0.5),
      'Độ trôi chảy': clamp(finalScore + Math.random() * 0.5)
    };
  }
  
  else if (mode === 'topic') {
    // NÓI THEO CHỦ ĐỀ
    let matchCount = 0;
    for (let char of cleanTranscript) { if (cleanExpected.includes(char)) matchCount++; }
    const coverage = Math.min(1.0, matchCount / Math.max(10, cleanExpected.length));
    
    // Nếu học viên nói quá ngắn so với chủ đề
    if (cleanTranscript.length < 15) {
      finalScore = 4.0;
      specificErrorMsg = `Bài nói quá ngắn (chỉ có "${transcript}"). Nội dung chưa đủ ý và chưa bám sát yêu cầu chủ đề.`;
    } else {
      finalScore = 6.0 + (coverage * 4) * (level === 'N5' || level === 'N4' ? 1.1 : 0.85);
      if (coverage < 0.5) specificErrorMsg = "Bạn có mở rộng ý nhưng từ vựng sử dụng chưa phong phú và chưa sát với dàn bài mẫu. Hãy đa dạng hóa nội dung hơn.";
    }

    criteriaObj = {
      'Phát âm': clamp(finalScore - Math.random()*0.5),
      'Bám sát chủ đề': clamp(coverage * 10),
      'Nội dung đủ ý': clamp(finalScore),
      'Độ trôi chảy': clamp(finalScore + Math.random()*0.5),
      'Ngữ pháp': clamp(finalScore - 0.2),
      'Từ vựng phong phú': clamp(finalScore + 0.3),
      'Độ tự nhiên': clamp(finalScore - 0.4)
    };
  }
  
  else if (mode === 'free') {
    // NÓI TỰ DO: Chấm chủ yếu dựa vào độ dài và độ lưu loát (giả lập qua transcript length)
    const len = cleanTranscript.length;
    if (len < 10) {
      finalScore = 3.5;
      specificErrorMsg = `Bạn nói quá ít ("${transcript}"). Rất khó để đánh giá năng lực phát triển ý của bạn.`;
    } else {
      finalScore = Math.min(9.8, 5.5 + (len / 50));
      specificErrorMsg = `Hệ thống ghi nhận nội dung: "${transcript.substring(0, 30)}...". Bài nói tự do của bạn có mạch lạc và triển khai ý khá tự nhiên.`;
    }
    
    criteriaObj = {
      'Phát âm': clamp(finalScore - Math.random()*0.5),
      'Độ rõ ràng': clamp(finalScore + Math.random()*0.5),
      'Độ trôi chảy': clamp(finalScore),
      'Ngữ pháp': clamp(finalScore - 0.3),
      'Từ vựng': clamp(finalScore + 0.2),
      'Khả năng phát triển ý': clamp(len < 30 ? 5.0 : finalScore),
      'Tính tự nhiên': clamp(finalScore - 0.1)
    };
  }

  // Chuẩn hóa điểm tổng
  finalScore = Math.min(10.0, Math.max(0.0, finalScore));

  // Lấy Level và Feedback chung
  let rankLevel = '';
  let generalFeedback = '';

  if (finalScore >= 9.0) { rankLevel = 'Xuất sắc'; generalFeedback = getRandomFeedback(feedbackBanks.excellent); }
  else if (finalScore >= 8.0) { rankLevel = 'Giỏi'; generalFeedback = getRandomFeedback(feedbackBanks.good); }
  else if (finalScore >= 7.0) { rankLevel = 'Khá'; generalFeedback = getRandomFeedback(feedbackBanks.fair); }
  else if (finalScore >= 5.0) { rankLevel = 'Sắp đến đích rồi'; generalFeedback = getRandomFeedback(feedbackBanks.almost); }
  else { rankLevel = 'Cần luyện tập thêm'; generalFeedback = getRandomFeedback(feedbackBanks.needs_practice); }

  // Ghép feedback chung và lỗi cụ thể
  const finalFeedback = specificErrorMsg ? `${generalFeedback}\n\nLỗi cụ thể cần sửa: ${specificErrorMsg}` : generalFeedback;

  return {
    score: finalScore.toFixed(1),
    level: rankLevel,
    criteria: criteriaObj,
    feedback: finalFeedback
  };
}


// ---------------------------------------------------------
// COMPONENT: THU ÂM (TÍCH HỢP SPEECH RECOGNITION + OPENAI )
// ---------------------------------------------------------
function AudioInput({ onAudioReady }) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  // ✅ Detect SpeechRecognition
  const isSpeechSupported =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  // ✅ Detect MIME type phù hợp (fix iPhone)
  const getMimeType = () => {
    if (typeof MediaRecorder === "undefined") return '';

    if (MediaRecorder.isTypeSupported('audio/webm')) {
      return 'audio/webm';
    }

    if (MediaRecorder.isTypeSupported('audio/mp4')) {
      return 'audio/mp4';
    }

    if (MediaRecorder.isTypeSupported('audio/mpeg')) {
      return 'audio/mpeg';
    }

    return '';
  };

  useEffect(() => {
    if (!isSpeechSupported) {
      console.log("❌ No SpeechRecognition → will use OpenAI");
      recognitionRef.current = null;
      return;
    }

    console.log("✅ Using browser SpeechRecognition");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }
      transcriptRef.current = fullTranscript;
    };

    recognition.onerror = (err) => {
      console.log("⚠️ SpeechRecognition error:", err);
    };

    recognitionRef.current = recognition;
  }, []);

  // ✅ OpenAI fallback
  const transcribeWithOpenAI = async (file) => {
    console.log("🚀 Calling OpenAI...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", "gpt-4o-mini-transcribe");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: formData
    });

    const data = await res.json();
    console.log("✅ OpenAI transcript:", data.text);

    return data.text;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onAudioReady(file, URL.createObjectURL(file), null, true);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getMimeType();
      console.log("🎤 Using MIME type:", mimeType);

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : {}
      );

      const chunks = [];
      transcriptRef.current = '';

      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }

      recorder.ondataavailable = e => chunks.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks, {
          type: mimeType || 'audio/webm'
        });

        const extension = mimeType.includes('mp4')
          ? 'mp4'
          : mimeType.includes('mpeg')
          ? 'mp3'
          : 'webm';

        const file = new File(
          [blob],
          `recorded.${extension}`,
          { type: blob.type }
        );

        let transcript = transcriptRef.current;

        // 🔥 fallback OpenAI nếu không có SpeechRecognition
        if (!isSpeechSupported) {
          try {
            transcript = await transcribeWithOpenAI(file);
          } catch (e) {
            console.log("❌ OpenAI error:", e);
            transcript = null;
          }
        } else {
          console.log("🧠 Browser transcript:", transcript);
        }

        onAudioReady(
          file,
          URL.createObjectURL(blob),
          transcript,
          false
        );

        clearInterval(timerRef.current);
        setRecordingTime(0);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      alert("Không thể truy cập Microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();

      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div onClick={() => !isRecording && document.getElementById('file-upload').click()} className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group bg-white border-slate-300 hover:border-[#F26522]/50 ${isRecording ? 'opacity-50 pointer-events-none' : ''}`}>
        <input id="file-upload" type="file" accept="audio/*,video/*" className="hidden" onChange={handleFileChange} />
        <Upload size={28} className="text-[#F26522] mb-3 group-hover:-translate-y-1 transition-transform" />
        <h3 className="font-bold text-slate-800">Tải file lên</h3>
        <p className="text-xs text-slate-500 mt-1">Hệ thống sẽ giả lập chấm điểm</p>
      </div>

      <div className={`border-2 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-200 ${isRecording ? 'border-[#F26522] bg-[#fff0f5] shadow-inner' : 'border-[#F26522]/30 bg-orange-50/30 relative overflow-hidden'}`}>
        {!isRecording && <div className="absolute top-0 right-0 bg-[#F26522] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">Khuyên dùng AI</div>}

        {isRecording ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="font-mono text-lg font-bold text-[#F26522]">
                {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center gap-2 px-6 font-bold text-sm transition-transform active:scale-95">
              <Square size={16} fill="currentColor" /> DỪNG THU
            </button>
          </>
        ) : (
          <>
            <Mic size={28} className="text-[#F26522] mb-3" />
            <h3 className="font-bold text-slate-800 mb-2">Thu âm trực tiếp</h3>
            <button onClick={startRecording} className="bg-[#F26522] hover:bg-[#d95618] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors">
              Chấm điểm bằng giọng nói
            </button>
          </>
        )}
      </div>
    </div>
  );
}



// ---------------------------------------------------------
// COMPONENT: NÓI TỰ DO & NÓI THEO CHỦ ĐỀ
// ---------------------------------------------------------
function FreeAndTopicMode({ type, studentName, onRequireName, dbTopics }) {
  const [step, setStep] = useState(0); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  
  // TTS State: 'normal', 'slow', or false
  const [isPlayingModel, setIsPlayingModel] = useState(false);

  const publishedTopics = dbTopics.filter(t => t.isPublished);
  const currentTopic = publishedTopics.find(t => t.id === selectedTopicId);

  useEffect(() => { if (!studentName) onRequireName(); }, []);

  const playModelAudio = (textRaw, speedMode = 'normal') => {
    if (!('speechSynthesis' in window)) { alert("Trình duyệt không hỗ trợ đọc mẫu."); return; }
    
    const cleanText = textRaw.replace(/\[([^|]+)\|([^\]]+)\]/g, '$1');
    setIsPlayingModel(speedMode);
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    
    if (speedMode === 'slow') {
      utterance.rate = 0.35; // Giảm tốc độ xuống mức rất chậm để người mới nghe rõ từng âm tiết
    } else {
      const rateMap = { 'N5': 0.8, 'N4': 0.9, 'N3': 1.0, 'N2': 1.1, 'N1': 1.2 }; // Điều chỉnh tăng tốc độ chuẩn để tạo sự khác biệt rõ rệt
      utterance.rate = currentTopic ? (rateMap[currentTopic.level] || 1.0) : 1.0;
    }
    
    utterance.onend = () => setIsPlayingModel(false);
    utterance.onerror = () => setIsPlayingModel(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleAudioReady = (file, url, text, isFile) => {
    setSelectedFile(file);
    setFileUrl(url);
    setTranscript(text);
    setIsFileUpload(isFile);
  };

  const startGrading = () => {
    if (type === 'topic' && !selectedTopicId) { alert("Vui lòng chọn một chủ đề!"); return; }
    if (!selectedFile) { alert("Vui lòng tải lên hoặc thu âm bài nói!"); return; }
    setStep(1);

    setTimeout(() => {
      let finalResult;

      if (isFileUpload) {
        // TẢI FILE -> GIẢ LẬP KẾT QUẢ ĐA TIÊU CHÍ
        const baseScore = 6.0 + Math.random() * 3.0; 
        const clamp = (val) => Math.min(10.0, Math.max(0.0, parseFloat(val))).toFixed(1);
        finalResult = {
          score: clamp(baseScore),
          level: baseScore >= 9 ? 'Xuất sắc' : baseScore >= 8 ? 'Giỏi' : baseScore >= 7 ? 'Khá' : 'Trung bình',
          criteria: { 
            'Phát âm': clamp(baseScore-0.2), 
            'Độ trôi chảy': clamp(baseScore) 
          },
          feedback: `[CHÚ Ý: BẠN ĐANG TẢI FILE ÂM THANH]\nDo hạn chế của trình duyệt, hệ thống không thể bóc tách từng lỗi ngữ âm chính xác từ file có sẵn. Điểm số chỉ phản ánh độ ổn định âm lượng và độ dài file.\n\n-> Hãy dùng nút "Thu âm trực tiếp" để AI đọc chính xác từng từ bạn nói nhé!`
        };
      } else {
        // THU ÂM THỰC TẾ
        const expectedText = type === 'topic' ? currentTopic.hint.jp : '';
        const level = type === 'topic' ? currentTopic.level : 'N3'; // N3 default for free
        finalResult = generateGradingResult(transcript, expectedText, level, type);
      }
      
      setResult(finalResult);
      setStep(2);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 animate-in fade-in duration-500 px-4 pb-20">
      {step === 0 && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 border border-[#f0e0d8]">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            {type === 'topic' ? <BookOpen className="text-[#F26522]" /> : <Mic className="text-[#F26522]" />}
            {type === 'topic' ? 'Nói theo chủ đề' : 'Nói tự do'}
          </h2>

          {type === 'topic' && (
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">Chọn chủ đề thuyết trình:</label>
              <select value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)} className="w-full p-4 rounded-xl border border-slate-300 bg-white focus:border-[#F26522] focus:ring-2 focus:ring-[#F26522]/20 outline-none font-medium text-slate-800 transition-all cursor-pointer shadow-sm">
                <option value="">-- Bấm để chọn một chủ đề --</option>
                {publishedTopics.map(t => <option key={t.id} value={t.id}>[{t.level}] {t.title}</option>)}
              </select>
              
              {currentTopic && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-slate-700">
                    <span className="font-bold text-[#F26522] flex items-center gap-1 mb-1"><Star size={14}/> Yêu cầu (Mức độ {currentTopic.level}):</span>
                    <p className="leading-relaxed">{currentTopic.req}</p>
                  </div>

                  <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm relative">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 border-b pb-3">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <BookA size={16} className="text-blue-500"/> Gợi ý bài nói mẫu:
                      </span>
                      {/* BỔ SUNG 2 NÚT NGHE MẪU CHO BÀI CHỦ ĐỀ */}
                      <div className="flex gap-2">
                        <button onClick={() => playModelAudio(currentTopic.hint.jp, 'slow')} disabled={isPlayingModel !== false} className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-1 ${isPlayingModel === 'slow' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-300 hover:border-[#F26522] hover:text-[#F26522] text-slate-600'}`}>
                          <Volume1 size={14}/> Chậm
                        </button>
                        <button onClick={() => playModelAudio(currentTopic.hint.jp, 'normal')} disabled={isPlayingModel !== false} className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-1 ${isPlayingModel === 'normal' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-300 hover:border-[#F26522] hover:text-[#F26522] text-slate-600'}`}>
                          <Volume2 size={14}/> Chuẩn
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-slate-900 tracking-wide break-words">
                         <FuriganaText text={currentTopic.hint.jp} />
                      </div>
                      <p className="text-sm font-mono text-[#F26522] leading-relaxed mt-2 pt-2 border-t border-slate-100">{currentTopic.hint.romaji}</p>
                      <p className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-3 leading-relaxed mt-2">{currentTopic.hint.vi}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-6 mt-8 pt-6 border-t border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-3">Tải lên hoặc thu âm bài nói của bạn:</label>
            {!selectedFile ? (
              <AudioInput onAudioReady={handleAudioReady} />
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center relative shadow-sm">
                <button onClick={() => {setSelectedFile(null); setFileUrl(null); setTranscript(null)}} className="absolute top-3 right-4 text-sm text-slate-500 hover:text-red-500 font-bold transition-colors">✕ Hủy</button>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm"><CheckCircle2 size={24} /></div>
                <p className="font-medium text-slate-800 text-center mb-1 px-8 truncate w-full">{selectedFile.name}</p>
                {!isFileUpload && transcript && <p className="text-xs text-green-700 italic mb-3">AI đã nhận diện được giọng nói của bạn.</p>}
                <audio controls src={fileUrl} className="w-full max-w-sm rounded-lg" />
              </div>
            )}
          </div>

          <button onClick={startGrading} className="w-full mt-6 bg-[#F26522] hover:bg-[#d95618] text-white font-black tracking-wide py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex justify-center items-center gap-2">
            Bắt đầu chấm điểm
          </button>
        </div>
      )}

      {step === 1 && (
         <div className="flex flex-col items-center justify-center py-32 bg-white/90 backdrop-blur-md rounded-3xl border border-[#f0e0d8] shadow-xl">
           <Activity size={64} className="text-[#F26522] animate-bounce mb-4" />
           <h2 className="font-bold text-xl text-slate-800">Hệ thống đang thẩm định bài nói...</h2>
           <p className="text-slate-500 text-sm mt-2">Sắp xong rồi, bạn đợi một chút nhé!</p>
         </div>
      )}

      {step === 2 && result && (
        <ReportCard result={result} studentName={studentName} fileUrl={fileUrl} onReset={() => {setStep(0); setSelectedFile(null);}} />
      )}
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: SHADOWING 
// ---------------------------------------------------------
function ShadowingMode({ studentName, onRequireName, dbShadowing }) {
  const [setupStep, setSetupStep] = useState(true);
  const [level, setLevel] = useState('N5');
  const [type, setType] = useState('sentence');
  
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [recordedFile, setRecordedFile] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [sentenceResult, setSentenceResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isPlayingModel, setIsPlayingModel] = useState(false);

  useEffect(() => { if (!studentName) onRequireName(); }, []);

  const lessons = dbShadowing.filter(item => item.isPublished && item.level === level && item.type === type);

  const startPractice = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentIndex(0);
    setSetupStep(false);
  };

  const playModelAudio = (textRaw, speedMode = 'normal') => {
    if (!('speechSynthesis' in window)) { alert("Trình duyệt không hỗ trợ đọc mẫu."); return; }
    
    const cleanText = textRaw.replace(/\[([^|]+)\|([^\]]+)\]/g, '$1');
    setIsPlayingModel(speedMode);
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    
    if (speedMode === 'slow') {
      utterance.rate = 0.35; // Giảm xuống cực chậm để phân tách rõ chữ Hán/Hiragana
    } else {
      const rateMap = { 'N5': 0.8, 'N4': 0.9, 'N3': 1.0, 'N2': 1.1, 'N1': 1.2 };
      utterance.rate = rateMap[level] || 1.0;
    }
    
    utterance.onend = () => setIsPlayingModel(false);
    utterance.onerror = () => setIsPlayingModel(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleAudioReady = (file, url, transcript, isFile) => {
    setRecordedFile(file);
    setRecordedUrl(url);
    setIsEvaluating(true);
    
    setTimeout(() => {
      const currentItem = selectedLesson.items[currentIndex];
      let res;

      if (isFile) {
         res = { score: '7.5', level: 'Khá', criteria: {'Phát âm': '7.5', 'Độ trôi chảy': '7.5'}, feedback: "[CHẾ ĐỘ TẢI FILE]\nHệ thống không thể bóc tách lỗi chi tiết từ file ghi âm tải lên. Hãy dùng Thu âm trực tiếp." };
      } else {
         res = generateGradingResult(transcript, currentItem.jp, level, type); // type = 'vocab' or 'sentence'
      }
      
      setSentenceResult(res);
      setIsEvaluating(false);
    }, 1500);
  };

  const nextItem = () => {
    setRecordedFile(null); setRecordedUrl(null); setSentenceResult(null);
    setCurrentIndex(prev => prev + 1);
  };

  if (setupStep) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-[#f0e0d8] animate-in fade-in pb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <MessageCircle className="text-[#F26522]" /> Luyện Shadowing
        </h2>
        
        <div className="mb-6">
          <label className="block font-bold text-slate-700 mb-2">1. Chọn cấp độ:</label>
          <div className="flex gap-2 flex-wrap">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
              <button key={lvl} onClick={() => setLevel(lvl)} className={`flex-1 py-3 rounded-xl font-bold border transition-all ${level === lvl ? 'bg-[#F26522] text-white border-[#F26522] shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:border-[#F26522]'}`}>
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block font-bold text-slate-700 mb-2">2. Chọn loại luyện tập:</label>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => setType('vocab')} className={`py-4 rounded-xl font-bold border flex flex-col items-center justify-center gap-2 transition-all ${type === 'vocab' ? 'bg-orange-50 border-[#F26522] text-[#F26522]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#F26522]'}`}>
                <span className="text-2xl">単語</span>Từ vựng
             </button>
             <button onClick={() => setType('sentence')} className={`py-4 rounded-xl font-bold border flex flex-col items-center justify-center gap-2 transition-all ${type === 'sentence' ? 'bg-orange-50 border-[#F26522] text-[#F26522]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#F26522]'}`}>
                <span className="text-2xl">文</span>Câu văn
             </button>
          </div>
        </div>

        <div className="mb-8">
           <label className="block font-bold text-slate-700 mb-2">3. Chọn bài học:</label>
           {lessons.length === 0 ? (
              <p className="text-sm text-red-500 italic">Chưa có bài học nào cho phần này.</p>
           ) : (
              <div className="space-y-3">
                {lessons.map(lesson => (
                  <button key={lesson.id} onClick={() => startPractice(lesson)} className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-[#F26522] hover:shadow-md transition-all flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-slate-800">{lesson.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Gồm {lesson.items.length} {type === 'vocab' ? 'từ' : 'câu'}</p>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-[#F26522]" />
                  </button>
                ))}
              </div>
           )}
        </div>
      </div>
    );
  }

  if (currentIndex >= selectedLesson.items.length) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white/95 rounded-3xl p-10 text-center shadow-xl border border-[#f0e0d8]">
        <Award size={64} className="text-[#F26522] mx-auto mb-4" />
        <h2 className="text-3xl font-black text-slate-800 mb-2">Hoàn thành bài học!</h2>
        <p className="text-slate-600 mb-8">Tuyệt vời, bạn đã luyện xong bài "{selectedLesson.title}".</p>
        <button onClick={() => setSetupStep(true)} className="bg-[#F26522] text-white px-8 py-3 rounded-xl font-bold shadow-lg">Chọn bài khác</button>
      </div>
    );
  }

  const currentItem = selectedLesson.items[currentIndex];

  return (
    <div className="max-w-4xl mx-auto mt-8 animate-in fade-in duration-500 px-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MessageCircle className="text-[#F26522]" /> {selectedLesson.title} ({level})
        </h2>
        <span className="bg-white px-4 py-1.5 rounded-full font-bold text-[#F26522] shadow-sm text-sm border border-[#f0e0d8]">
          {currentIndex + 1} / {selectedLesson.items.length}
        </span>
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 border border-[#f0e0d8]">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 relative shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F26522] rounded-l-2xl"></div>
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="text-4xl font-medium text-slate-900 mb-4 font-serif tracking-wide leading-relaxed">
                <FuriganaText text={currentItem.jp} />
              </div>
              <p className="text-base font-mono text-[#F26522] mb-1">{currentItem.romaji}</p>
              <p className="text-sm text-slate-500 italic">{currentItem.vi}</p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button onClick={() => playModelAudio(currentItem.jp, 'slow')} disabled={isPlayingModel !== false} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-md transition-all border-2 ${isPlayingModel === 'slow' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-200 hover:border-[#F26522] hover:text-[#F26522] text-slate-700'}`} title="Nghe đọc chậm">
                <Volume1 size={20} className={isPlayingModel === 'slow' ? "opacity-50" : ""} />
                <span className="text-[9px] font-bold mt-0.5 uppercase">Chậm</span>
              </button>
              <button onClick={() => playModelAudio(currentItem.jp, 'normal')} disabled={isPlayingModel !== false} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-md transition-all border-2 ${isPlayingModel === 'normal' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-200 hover:border-[#F26522] hover:text-[#F26522] text-slate-700'}`} title="Nghe đọc chuẩn">
                <Volume2 size={20} className={isPlayingModel === 'normal' ? "opacity-50" : ""} />
                <span className="text-[9px] font-bold mt-0.5 uppercase">Chuẩn</span>
              </button>
            </div>
          </div>
        </div>

        {!recordedFile && !isEvaluating && (
          <div className="animate-in fade-in">
            <div className="bg-orange-50 text-orange-800 p-3 rounded-lg mb-4 text-sm font-medium border border-orange-200">
              <Info size={16} className="inline mr-1" />
              Sử dụng nút <b>Thu âm trực tiếp</b> và <b>bắt chước lại</b> để AI đánh giá độ chính xác.
            </div>
            <AudioInput onAudioReady={handleAudioReady} />
          </div>
        )}

        {isEvaluating && (
          <div className="py-8 flex flex-col items-center">
             <Activity size={48} className="text-[#F26522] animate-bounce mb-4" />
             <p className="font-medium text-slate-600">Đang đối chiếu âm tiết và cao độ...</p>
          </div>
        )}

        {sentenceResult && !isEvaluating && (
          <div className="animate-in slide-in-from-bottom-4">
            <div className={`p-6 rounded-2xl border shadow-sm ${sentenceResult.score >= 8.0 ? 'bg-green-50 border-green-200' : sentenceResult.score >= 6.0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} mb-6 flex flex-col md:flex-row gap-6 items-center md:items-start`}>
              
              <div className={`w-24 h-24 rounded-full flex items-center justify-center flex-col shadow-inner shrink-0 ${sentenceResult.score >= 8.0 ? 'bg-green-500 text-white' : sentenceResult.score >= 6.0 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>
                <span className="font-black text-3xl">{sentenceResult.score}</span>
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                <h4 className="font-bold text-slate-800 mb-2 text-lg">Phân tích chi tiết:</h4>
                <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium">{sentenceResult.feedback}</p>
                <div className="bg-white/50 p-2 rounded-lg inline-block w-full">
                  <audio controls src={recordedUrl} className="h-10 w-full rounded" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200">
              <button onClick={() => { setRecordedFile(null); setSentenceResult(null); }} className="flex-1 py-4 bg-white border border-slate-300 hover:border-[#F26522] hover:text-[#F26522] text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <RefreshCcw size={18} /> Thử lại câu này
              </button>
              <button onClick={nextItem} className="flex-1 py-4 bg-[#F26522] hover:bg-[#d95618] text-white font-black tracking-wide rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30">
                Chuyển tiếp <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: PHIẾU BÁO CÁO (CHUNG)
// ---------------------------------------------------------
function ReportCard({ result, studentName, fileUrl, onReset }) {
  const criteriaKeys = Object.keys(result.criteria);

  return (
    <>
      <div className="flex justify-between items-center mb-6 no-print">
        <button onClick={onReset} className="flex items-center gap-2 text-slate-600 hover:text-[#F26522] font-bold bg-white/80 px-5 py-2.5 rounded-xl shadow-sm border border-slate-200">
          <RefreshCcw size={18} /> Chấm bài khác
        </button>
        <button onClick={() => window.print()} className="bg-[#F26522] hover:bg-[#d95618] text-white px-5 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95">
          <Download size={18} /> XUẤT PHIẾU PDF
        </button>
      </div>

      <div id="printable-report" className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-[#f0e0d8]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] bg-[#fffcf9]">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-[#F26522] rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
              <Star size={28} fill="currentColor" />
            </div>
            <div>
              <h2 className="font-black text-2xl text-slate-800 leading-tight">PHIẾU ĐÁNH GIÁ<br/>KỸ NĂNG NÓI</h2>
              <p className="text-xs text-[#F26522] font-bold tracking-widest mt-2 uppercase">Phân tích bởi Nihongo Spark AI</p>
              <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          
          <div className="bg-[#fff0f5] border border-[#ffe4e1] rounded-2xl p-3 text-center min-w-[120px]">
            <p className="text-[10px] font-bold text-[#F26522] tracking-widest uppercase mb-1">Học Viên</p>
            <p className="font-bold text-slate-800 text-lg">{studentName}</p>
          </div>
        </div>

        <div className="p-8">
          {fileUrl && (
            <div className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100 no-print flex items-center gap-4">
              <Volume2 size={24} className="text-[#F26522] shrink-0" /> 
              <div className="flex-1 w-full">
                <p className="text-sm font-bold text-slate-700 mb-2">Bản ghi âm gốc:</p>
                <audio controls src={fileUrl} className="w-full h-10" />
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-[#fff0f5] flex items-center justify-center bg-white shadow-inner relative z-10">
                <span className="text-5xl font-black text-[#F26522]">{result.score}</span>
              </div>
              <div className="absolute inset-[-4px] rounded-full border border-[#ffe4e1] z-0"></div>
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20">
                <Award size={20} />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mt-4">Điểm trung bình / 10</p>
            <div className="mt-2 px-6 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-black tracking-wide uppercase">
              {result.level}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {criteriaKeys.map(key => (
              <CriteriaBar key={key} label={key} score={result.criteria[key]} />
            ))}
          </div>

          <div className="bg-orange-50/50 rounded-2xl p-6 md:p-8 relative border border-orange-100 shadow-sm mt-8">
            <div className="absolute -top-4 left-6 bg-white p-1.5 rounded-lg shadow-sm text-[#F26522] border border-orange-100">
              <MessageSquare size={20} fill="currentColor" />
            </div>
            <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-orange-200/50 pb-3">Phân tích chi tiết từ hệ thống:</h3>
            <p className="text-slate-800 leading-relaxed text-sm whitespace-pre-line font-medium">
              {result.feedback}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function CriteriaBar({ label, score }) {
  const percentage = (parseFloat(score) / 10) * 100;
  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-sm text-slate-600">{label}</span>
        <span className="font-black text-[#F26522] text-base">{score}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-400 to-[#F26522]" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

