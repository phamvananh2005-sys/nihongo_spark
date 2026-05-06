import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, User, Volume2, Download, Star, Award, MessageSquare,
  RefreshCcw, CheckCircle2, Mic, Square, ChevronRight,
  BookOpen, MessageCircle, Eye, EyeOff, ShieldCheck, Sparkles, BookA,
  Lock, LogOut, Plus, Save, X, Info, Trash2
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

// Shadowing được cấu trúc lại: Mỗi bài có nhiều items (10 từ vựng hoặc 5 câu)
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

      {/* BƯỚC 1: ĐƯA Ô NHẬP TÊN LÊN ĐẦU */}
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
            onKeyDown={(e) => {
              // Xác nhận khi ấn Enter
              if (e.key === 'Enter') {
                e.target.blur();
              }
            }}
            className="flex-1 bg-transparent outline-none font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium py-2"
          />
          {/* Huy hiệu báo "Đã nhận" tên thành công */}
          {studentName.trim() && (
            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-xs font-bold animate-in zoom-in flex items-center gap-1">
              <CheckCircle2 size={14} /> Đã nhận
            </span>
          )}
        </div>
      </div>

      <div className="text-center mb-6">
        <label className="block font-bold text-slate-700">2. Chọn chế độ luyện tập:</label>
      </div>

      {/* BƯỚC 2: CHỌN CHẾ ĐỘ */}
      <div className="grid md:grid-cols-3 gap-6">
        <button onClick={() => handleModeSelect('shadowing')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#F26522] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <MessageCircle size={40} className="text-[#F26522] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Shadowing</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">Bắt chước lại theo từ vựng hoặc câu mẫu. Chấm điểm và sửa lỗi ngay sau mỗi lượt. Có thể luyện tập đến khi đạt chuẩn.</p>
        </button>

        <button onClick={() => handleModeSelect('topic')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#F26522] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <BookOpen size={40} className="text-[#F26522] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Nói theo chủ đề</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">Thuyết trình theo các chủ đề cho trước. Hệ thống phân tích nội dung có bám sát chủ đề hay không dựa trên giọng nói thật.</p>
        </button>

        <button onClick={() => handleModeSelect('free')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#F26522] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <Mic size={40} className="text-[#F26522] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Nói tự do</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">Thu âm trực tiếp bất kỳ nội dung nào. Đánh giá tổng quan mức độ trôi chảy và phát âm.</p>
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
      {/* NÚT PHÚ SĨ BACKGROUND */}
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
            <img
              src="171045151_1082518945577423_933278627676106455_n (4).png"
              alt="MVA Logo"
              className="h-8 w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-8 h-8 bg-[#F26522] rounded flex-col items-center justify-center text-white font-black text-[10px] leading-none">
              <span>MVA</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight text-[#F26522]">NIHONGO<span className="text-slate-800"> SPARK</span></h1>
          </div>

          <div className="flex items-center gap-4">
            {role === 'admin' ? (
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                  <ShieldCheck size={14} /> QUẢN TRỊ
                </span>
                <button onClick={() => { setRole('user'); setActiveMode(null); }} className="text-sm font-bold text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <LogOut size={16} /> Đăng xuất
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
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin(e.target.value) }}
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
// COMPONENT: ADMIN PANEL 
// ---------------------------------------------------------
function AdminPanel({ dbTopics, setDbTopics, dbShadowing, setDbShadowing }) {
  const [tab, setTab] = useState('topics');

  const [editingTopic, setEditingTopic] = useState(null);
  const [editingShadow, setEditingShadow] = useState(null);
  const [shadowItemsText, setShadowItemsText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleSimulateAITopic = () => {
    if (!aiPrompt) { alert('Vui lòng nhập yêu cầu cho AI!'); return; }
    setIsAiGenerating(true);
    setTimeout(() => {
      setEditingTopic({
        id: 't' + Date.now(),
        title: `[AI] Chủ đề: ${aiPrompt.substring(0, 15)}...`,
        level: 'N3',
        req: `Hãy trình bày suy nghĩ của bạn về: ${aiPrompt}. Đảm bảo bài nói 1-2 phút.`,
        isPublished: false,
        hint: {
          jp: "[AI|えーあい]が[生成|せいせい]した[例文|れいぶん]です。ここを[編集|へんしゅう]してください。",
          romaji: "AI ga seisei shita reibun desu. Koko o henshuu shite kudasai.",
          vi: "Đây là câu mẫu do AI tạo ra. Vui lòng chỉnh sửa tại đây."
        }
      });
      setIsAiGenerating(false);
      setAiPrompt('');
    }, 1500);
  };

  const saveTopic = (isPublished) => {
    if (!editingTopic.title) { alert("Vui lòng nhập tên chủ đề!"); return; }
    const newTopic = { ...editingTopic, isPublished };
    if (dbTopics.some(t => t.id === newTopic.id)) {
      setDbTopics(dbTopics.map(t => t.id === newTopic.id ? newTopic : t));
    } else {
      newTopic.id = 't' + Date.now();
      setDbTopics([newTopic, ...dbTopics]);
    }
    setEditingTopic(null);
  };

  const handleDeleteTopic = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn chủ đề này không?")) {
      setDbTopics(dbTopics.filter(t => t.id !== id));
    }
  };

  const handleSimulateAIShadow = () => {
    if (!aiPrompt) { alert('Vui lòng nhập yêu cầu (VD: Từ vựng N4)'); return; }
    setIsAiGenerating(true);
    setTimeout(() => {
      setEditingShadow({
        id: 's' + Date.now(),
        level: 'N4',
        type: 'vocab',
        title: `[AI] ${aiPrompt.substring(0, 20)}`,
        isPublished: false,
        items: []
      });
      // SỬ DỤNG DẤU GẠCH CHÉO / ĐỂ KHÔNG BỊ LỖI FURIGANA
      setShadowItemsText("[家族|かぞく] / Kazoku / Gia đình\n[友達|ともだち] / Tomodachi / Bạn bè\n[約束|やくそく] / Yakusoku / Cuộc hẹn");
      setIsAiGenerating(false);
      setAiPrompt('');
    }, 1500);
  };

  const saveShadow = (isPublished) => {
    if (!editingShadow.title) { alert("Vui lòng nhập tên bài học!"); return; }
    // SPLIT BẰNG DẤU GẠCH CHÉO (/)
    const parsedItems = shadowItemsText.split('\n').filter(line => line.trim() !== '').map(line => {
      const parts = line.split('/').map(p => p.trim());
      return { jp: parts[0] || '', romaji: parts[1] || '', vi: parts[2] || '' };
    });

    const newShadow = { ...editingShadow, items: parsedItems, isPublished };
    if (dbShadowing.some(s => s.id === newShadow.id)) {
      setDbShadowing(dbShadowing.map(s => s.id === newShadow.id ? newShadow : s));
    } else {
      newShadow.id = 's' + Date.now();
      setDbShadowing([newShadow, ...dbShadowing]);
    }
    setEditingShadow(null);
  };

  const handleDeleteShadow = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bài học này không?")) {
      setDbShadowing(dbShadowing.filter(s => s.id !== id));
    }
  };

  const toggleTopicPublish = (id) => setDbTopics(dbTopics.map(t => t.id === id ? { ...t, isPublished: !t.isPublished } : t));
  const toggleShadowPublish = (id) => setDbShadowing(dbShadowing.map(s => s.id === id ? { ...s, isPublished: !s.isPublished } : s));

  const startEditTopic = (t) => { setEditingTopic({ ...t }); };
  const startEditShadow = (s) => {
    setEditingShadow({ ...s });
    // Ghép lại bằng dấu gạch chéo
    setShadowItemsText(s.items.map(i => `${i.jp} / ${i.romaji} / ${i.vi}`).join('\n'));
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-in fade-in duration-500 px-4 pb-20">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button onClick={() => { setTab('topics'); setEditingTopic(null); }} className={`flex-1 py-4 font-bold text-center border-b-2 ${tab === 'topics' ? 'border-[#F26522] text-[#F26522] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Quản lý Chủ đề</button>
          <button onClick={() => { setTab('shadowing'); setEditingShadow(null); }} className={`flex-1 py-4 font-bold text-center border-b-2 ${tab === 'shadowing' ? 'border-[#F26522] text-[#F26522] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Quản lý Shadowing</button>
        </div>

        <div className="p-8">
          {tab === 'topics' && (
            <div>
              {!editingTopic ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800">Kho Chủ đề giao tiếp</h3>
                    <button onClick={() => setEditingTopic({ id: '', title: '', level: 'N5', req: '', isPublished: false, hint: { jp: '', romaji: '', vi: '' } })} className="bg-[#F26522] text-white hover:bg-[#d95618] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md">
                      <Plus size={18} /> Thêm mới
                    </button>
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
                            <button onClick={() => toggleTopicPublish(topic.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${topic.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                              {topic.isPublished ? <><Eye size={14} /> Công khai (Bấm để Ẩn)</> : <><EyeOff size={14} /> Đang ẩn (Bấm để Public)</>}
                            </button>
                            <button onClick={() => startEditTopic(topic)} className="px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full text-xs font-bold">Sửa</button>
                            <button onClick={() => handleDeleteTopic(topic.id)} className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-full text-xs font-bold flex items-center gap-1">
                              <Trash2 size={14} /> Xóa
                            </button>
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
                    <button onClick={() => setEditingTopic(null)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl mb-6">
                    <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-2"><Sparkles size={18} /> Nhờ AI soạn thảo tự động</h4>
                    <div className="flex gap-2">
                      <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Ví dụ: Tạo chủ đề về giới thiệu quê hương N4..." className="flex-1 p-2 rounded-lg border border-purple-200 outline-none focus:ring-2 focus:ring-purple-300" disabled={isAiGenerating} />
                      <button onClick={handleSimulateAITopic} disabled={isAiGenerating} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                        {isAiGenerating ? 'Đang viết...' : 'Tạo'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Tên chủ đề</label>
                      <input type="text" value={editingTopic.title} onChange={e => setEditingTopic({ ...editingTopic, title: e.target.value })} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-[#F26522]" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Cấp độ</label>
                      <select value={editingTopic.level} onChange={e => setEditingTopic({ ...editingTopic, level: e.target.value })} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-[#F26522]">
                        <option value="N5">N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Yêu cầu nội dung</label>
                    <textarea value={editingTopic.req} onChange={e => setEditingTopic({ ...editingTopic, req: e.target.value })} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-[#F26522] h-20" />
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                    <label className="block text-sm font-bold text-slate-800 border-b pb-2">Bài nói mẫu (Gợi ý)</label>
                    <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-xs font-medium mb-2 border border-orange-200">
                      Cú pháp Furigana: <code>[漢字|hiragana]</code> (Ví dụ: <code>[私|わたし]</code>)
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tiếng Nhật (Hỗ trợ Furigana)</label>
                      <textarea value={editingTopic.hint.jp} onChange={e => setEditingTopic({ ...editingTopic, hint: { ...editingTopic.hint, jp: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-[#F26522] h-24" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Romaji</label>
                      <input type="text" value={editingTopic.hint.romaji} onChange={e => setEditingTopic({ ...editingTopic, hint: { ...editingTopic.hint, romaji: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-[#F26522]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tiếng Việt</label>
                      <input type="text" value={editingTopic.hint.vi} onChange={e => setEditingTopic({ ...editingTopic, hint: { ...editingTopic.hint, vi: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-[#F26522]" />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-4 border-t border-slate-200">
                    <button onClick={() => saveTopic(false)} className="flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300 py-3 rounded-xl font-bold flex justify-center items-center gap-2"><Save size={18} /> Lưu Nháp (Ẩn)</button>
                    <button onClick={() => saveTopic(true)} className="flex-1 bg-[#F26522] text-white hover:bg-[#d95618] py-3 rounded-xl font-bold flex justify-center items-center gap-2"><CheckCircle2 size={18} /> Lưu & Public</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'shadowing' && (
            <div>
              {!editingShadow ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800">Kho Bài học Shadowing</h3>
                    <button onClick={() => { setEditingShadow({ id: '', title: '', level: 'N5', type: 'sentence', isPublished: false, items: [] }); setShadowItemsText(''); }} className="bg-[#F26522] text-white hover:bg-[#d95618] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md">
                      <Plus size={18} /> Thêm mới
                    </button>
                  </div>
                  <div className="space-y-4">
                    {dbShadowing.map(shadow => (
                      <div key={shadow.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${shadow.isPublished ? 'border-slate-200 bg-white' : 'border-orange-200 bg-orange-50'}`}>
                        <div>
                          <div className="flex gap-2 items-center mb-1">
                            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded">{shadow.level}</span>
                            <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">{shadow.type === 'vocab' ? 'Từ vựng' : 'Câu'}</span>
                          </div>
                          <h4 className="font-bold text-lg text-slate-800">{shadow.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{shadow.items.length} hạng mục</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => toggleShadowPublish(shadow.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${shadow.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                            {shadow.isPublished ? <><Eye size={14} /> Công khai (Bấm để Ẩn)</> : <><EyeOff size={14} /> Đang ẩn (Bấm để Public)</>}
                          </button>
                          <button onClick={() => startEditShadow(shadow)} className="px-3 py-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full text-xs font-bold">Sửa</button>
                          <button onClick={() => handleDeleteShadow(shadow.id)} className="px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-full text-xs font-bold flex items-center gap-1">
                            <Trash2 size={14} /> Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-bold text-xl text-slate-800">Soạn thảo Bài học Shadowing</h3>
                    <button onClick={() => setEditingShadow(null)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl mb-6">
                    <h4 className="font-bold text-purple-800 flex items-center gap-2 mb-2"><Sparkles size={18} /> Nhờ AI soạn thảo</h4>
                    <div className="flex gap-2">
                      <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Ví dụ: Tạo 5 câu về chủ đề mua sắm N4..." className="flex-1 p-2 rounded-lg border border-purple-200 outline-none" disabled={isAiGenerating} />
                      <button onClick={handleSimulateAIShadow} disabled={isAiGenerating} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                        {isAiGenerating ? 'Đang sinh...' : 'Tạo'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="col-span-3 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Cấp độ</label>
                      <select value={editingShadow.level} onChange={e => setEditingShadow({ ...editingShadow, level: e.target.value })} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-[#F26522]">
                        <option value="N5">N5</option><option value="N4">N4</option><option value="N3">N3</option><option value="N2">N2</option><option value="N1">N1</option>
                      </select>
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Loại</label>
                      <select value={editingShadow.type} onChange={e => setEditingShadow({ ...editingShadow, type: e.target.value })} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-[#F26522]">
                        <option value="sentence">Câu văn</option><option value="vocab">Từ vựng</option>
                      </select>
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Tên bài học</label>
                      <input type="text" value={editingShadow.title} onChange={e => setEditingShadow({ ...editingShadow, title: e.target.value })} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-[#F26522]" placeholder="VD: Chủ đề Động từ" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Danh sách Từ vựng / Câu</label>
                    <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-xs font-medium mb-3 border border-orange-200">
                      Mỗi dòng là một mục. Ngăn cách Tiếng Nhật, Romaji, Tiếng Việt bằng dấu gạch chéo <code>/</code>.<br />
                      Ví dụ: <code>[学校|がっこう] / Gakkou / Trường học</code>
                    </div>
                    <textarea
                      value={shadowItemsText}
                      onChange={e => setShadowItemsText(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-[#F26522] font-mono text-sm h-64 whitespace-pre-wrap leading-relaxed"
                      placeholder="[学校|がっこう] / Gakkou / Trường học&#10;[先生|せんせい] / Sensei / Giáo viên"
                    />
                  </div>

                  <div className="flex gap-4 mt-8 pt-4 border-t border-slate-200">
                    <button onClick={() => saveShadow(false)} className="flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300 py-3 rounded-xl font-bold flex justify-center items-center gap-2"><Save size={18} /> Lưu Nháp (Ẩn)</button>
                    <button onClick={() => saveShadow(true)} className="flex-1 bg-[#F26522] text-white hover:bg-[#d95618] py-3 rounded-xl font-bold flex justify-center items-center gap-2"><CheckCircle2 size={18} /> Lưu & Public</button>
                  </div>
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
// ENGINE CHẤM ĐIỂM (KIỂM TRA BẰNG SPEECH TO TEXT)
// ---------------------------------------------------------
function gradeSpeech(transcript, expectedRawText, level) {
  if (!transcript || transcript.trim() === '') {
    return { score: 2.0, level: 'Yếu', feedback: 'Hệ thống không nghe thấy bạn nói gì, hoặc bạn phát âm quá nhỏ.' };
  }

  // Loại bỏ các ký tự đặc biệt, furigana syntax để so sánh chuỗi thuần
  const cleanExpected = expectedRawText.replace(/\[([^|]+)\|([^\]]+)\]/g, '$1').replace(/[。、！？\s]/g, '');
  const cleanTranscript = transcript.replace(/[。、！？\s]/g, '');

  let matchCount = 0;
  for (let i = 0; i < cleanTranscript.length; i++) {
    if (cleanExpected.includes(cleanTranscript[i])) matchCount++;
  }

  const matchRate = Math.min(100, (matchCount / cleanExpected.length) * 100);

  // N1/N2 chấm khắt khe hơn N4/N5
  let strictnessMultiplier = 1.0;
  if (level === 'N1' || level === 'N2') strictnessMultiplier = 0.8;
  if (level === 'N5' || level === 'N4') strictnessMultiplier = 1.2;

  let finalScore = (matchRate / 10) * strictnessMultiplier;

  // Random thêm độ tự nhiên cho Pronunciation, Fluency
  if (finalScore > 9.5) finalScore = 9.5;
  if (finalScore < 2.0) finalScore = 2.0;

  let feedback = "";
  if (finalScore >= 8.5) feedback = "Phát âm của bạn rất chuẩn xác và rõ ràng. Tuyệt vời!";
  else if (finalScore >= 6.5) feedback = "Bạn nói khá tốt, nhưng còn một vài âm bị mờ hoặc hệ thống chưa nghe rõ.";
  else feedback = `Bạn cần luyện tập thêm. Hệ thống nghe được bạn nói là: "${transcript}", nội dung này chưa khớp với bài mẫu.`;

  return {
    score: finalScore.toFixed(1),
    level: finalScore >= 9 ? 'Xuất sắc' : finalScore >= 8 ? 'Giỏi' : finalScore >= 6.5 ? 'Khá' : finalScore >= 5 ? 'Trung bình' : 'Cần cố gắng',
    criteria: {
      pronunciation: (finalScore - (Math.random() * 0.5)).toFixed(1),
      fluency: (finalScore + (Math.random() * 0.5)).toFixed(1),
      vocabulary: (finalScore).toFixed(1),
      grammar: (finalScore).toFixed(1)
    },
    feedback
  };
}

// ---------------------------------------------------------
// COMPONENT: THU ÂM (TÍCH HỢP SPEECH RECOGNITION)
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

  const publishedTopics = dbTopics.filter(t => t.isPublished);
  const currentTopic = publishedTopics.find(t => t.id === selectedTopicId);

  useEffect(() => { if (!studentName) onRequireName(); }, []);

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
        // TẢI FILE -> GIẢ LẬP KẾT QUẢ
        const baseScore = 6.0 + Math.random() * 3.0;
        finalResult = {
          overallScore: baseScore.toFixed(1),
          level: baseScore >= 9 ? 'Xuất sắc' : baseScore >= 8 ? 'Giỏi' : baseScore >= 7 ? 'Khá' : 'Trung bình',
          criteria: { pronunciation: (baseScore - 0.2).toFixed(1), fluency: (baseScore).toFixed(1), vocabulary: (baseScore + 0.2).toFixed(1), grammar: (baseScore - 0.1).toFixed(1) },
          feedback: `[CHẾ ĐỘ TẢI FILE - GIẢ LẬP AI]\nDo bạn tải file thu sẵn, hệ thống phân tích ước lượng dựa trên trường độ âm thanh. Hãy dùng chức năng "Thu âm trực tiếp" để AI đọc chính xác từng từ bạn nói nhé.\n\nNhận xét chung: Bài nói khá ổn định, nhịp độ mượt mà.`
        };
      } else {
        // THU ÂM THỰC TẾ TRÌNH DUYỆT -> CHẤM CHUẨN
        if (type === 'topic') {
          finalResult = gradeSpeech(transcript, currentTopic.hint.jp, currentTopic.level);
        } else {
          // Nói tự do
          if (!transcript || transcript.length < 5) {
            finalResult = { overallScore: '3.0', level: 'Yếu', criteria: { pronunciation: '3.0', fluency: '3.0', vocabulary: '3.0', grammar: '3.0' }, feedback: `Hệ thống chỉ nghe thấy: "${transcript}". Nội dung quá ngắn để đánh giá.` };
          } else {
            const len = transcript.length;
            const score = Math.min(9.5, 6.0 + (len / 100));
            finalResult = { overallScore: score.toFixed(1), level: score >= 8 ? 'Giỏi' : 'Khá', criteria: { pronunciation: score.toFixed(1), fluency: score.toFixed(1), vocabulary: score.toFixed(1), grammar: score.toFixed(1) }, feedback: `Hệ thống ghi nhận bạn nói: "${transcript}". Độ trôi chảy rất ấn tượng đối với một bài nói tự do.` };
          }
        }
      }
      setResult(finalResult);
      setStep(2);
    }, 2500);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 animate-in fade-in duration-500 px-4 pb-20">
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
                    <span className="font-bold text-[#F26522] flex items-center gap-1 mb-1"><Star size={14} /> Yêu cầu (Mức độ {currentTopic.level}):</span>
                    <p className="leading-relaxed">{currentTopic.req}</p>
                  </div>

                  <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <span className="font-bold text-slate-800 flex items-center gap-2 mb-3 border-b pb-2">
                      <BookA size={16} className="text-blue-500" /> Gợi ý bài nói mẫu:
                    </span>
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
                <button onClick={() => { setSelectedFile(null); setFileUrl(null); setTranscript(null) }} className="absolute top-3 right-4 text-sm text-slate-500 hover:text-red-500 font-bold transition-colors">✕ Hủy</button>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm"><CheckCircle2 size={24} /></div>
                <p className="font-medium text-slate-800 text-center mb-1 px-8 truncate w-full">{selectedFile.name}</p>
                {!isFileUpload && transcript && <p className="text-xs text-green-700 italic mb-3">AI đã nhận diện được giọng nói của bạn.</p>}
                <audio controls src={fileUrl} className="w-full max-w-sm rounded-lg" />
              </div>
            )}
          </div>

          <button onClick={startGrading} className="w-full mt-6 bg-[#F26522] hover:bg-[#d95618] text-white font-black tracking-wide py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex justify-center items-center gap-2">
            BẮT ĐẦU CHẤM BÀI
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col items-center justify-center py-32 bg-white/90 backdrop-blur-md rounded-3xl border border-[#f0e0d8] shadow-xl">
          <div className="w-16 h-16 border-4 border-[#F26522] border-t-transparent rounded-full animate-spin"></div>
          <h2 className="mt-6 font-bold text-xl text-slate-800">AI đang phân tích độ chính xác...</h2>
        </div>
      )}

      {step === 2 && result && (
        <ReportCard result={result} studentName={studentName} fileUrl={fileUrl} onReset={() => { setStep(0); setSelectedFile(null); }} />
      )}
    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT: SHADOWING (THEO BÀI & CÓ ĐÁNH GIÁ THỰC TẾ)
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

  const playModelAudio = (textRaw) => {
    if (!('speechSynthesis' in window)) { alert("Trình duyệt không hỗ trợ đọc mẫu."); return; }

    // Bỏ Furigana brackets đi để Speech Engine đọc chữ Hán
    const cleanText = textRaw.replace(/\[([^|]+)\|([^\]]+)\]/g, '$1');

    setIsPlayingModel(true);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    const rateMap = { 'N5': 0.6, 'N4': 0.8, 'N3': 1.0, 'N2': 1.1, 'N1': 1.2 };
    utterance.rate = rateMap[level] || 1.0;
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
        // Fake
        const score = 7.5;
        res = { score, feedback: "(Tải file: Chấm điểm giả lập). Tốc độ nói khá tốt." };
      } else {
        // Real evaluation
        const evaluated = gradeSpeech(transcript, currentItem.jp, level);
        // Quy đổi scale 10 -> 100
        const score100 = Math.round(parseFloat(evaluated.score) * 10);
        res = { score: score100, feedback: evaluated.feedback };
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
    <div className="max-w-3xl mx-auto mt-8 animate-in fade-in duration-500 px-4 pb-20">
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
            <button onClick={() => playModelAudio(currentItem.jp)} disabled={isPlayingModel} className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-md transition-all border-2 ${isPlayingModel ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-200 hover:border-[#F26522] hover:text-[#F26522] text-slate-700'}`} title="Nghe máy đọc mẫu">
              <Volume2 size={24} className={isPlayingModel ? "opacity-50" : ""} />
              <span className="text-[10px] font-bold mt-1 uppercase">Nghe</span>
            </button>
          </div>
        </div>

        {!recordedFile && !isEvaluating && (
          <div className="animate-in fade-in">
            <div className="bg-orange-50 text-orange-800 p-3 rounded-lg mb-4 text-sm font-medium border border-orange-200">
              <Info size={16} className="inline mr-1" />
              Sử dụng nút <b>Thu âm trực tiếp</b> và bắt chước lại để AI nhận diện phát âm của bạn.
            </div>
            <AudioInput onAudioReady={handleAudioReady} />
          </div>
        )}

        {isEvaluating && (
          <div className="py-8 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-[#F26522] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-medium text-slate-600">Đang phân tích độ chính xác...</p>
          </div>
        )}

        {sentenceResult && !isEvaluating && (
          <div className="animate-in slide-in-from-bottom-4">
            <div className={`p-5 rounded-2xl border ${sentenceResult.score >= 80 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} mb-6 flex gap-4 items-start`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shrink-0 shadow-inner ${sentenceResult.score >= 80 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {sentenceResult.score}
              </div>
              <div className="flex-1 w-full overflow-hidden">
                <h4 className="font-bold text-slate-800 mb-1">Kết quả phân tích:</h4>
                <p className="text-sm text-slate-700 mb-3 leading-relaxed">{sentenceResult.feedback}</p>
                <audio controls src={recordedUrl} className="h-8 w-full max-w-sm rounded" />
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
// COMPONENT: PHIẾU BÁO CÁO (DÙNG CHO IN ẤN PDF)
// ---------------------------------------------------------
function ReportCard({ result, studentName, fileUrl, onReset }) {
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
              <h2 className="font-black text-2xl text-slate-800 leading-tight">PHIẾU ĐÁNH GIÁ<br />KỸ NĂNG NÓI</h2>
              <p className="text-xs text-[#F26522] font-bold tracking-widest mt-2 uppercase">Phân tích bởi Nihongo Spark</p>
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
                <span className="text-5xl font-black text-[#F26522]">{result.overallScore}</span>
              </div>
              <div className="absolute inset-[-4px] rounded-full border border-[#ffe4e1] z-0"></div>
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20">
                <Award size={20} />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mt-4">Điểm trung bình / 10</p>
            <div className="mt-2 px-6 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-black tracking-wide">
              XẾP LOẠI: {result.level.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 my-8">
            <CriteriaBar label="Phát âm (Hatsuon)" score={result.criteria.pronunciation} />
            <CriteriaBar label="Trôi chảy (Ryucho)" score={result.criteria.fluency} />
            <CriteriaBar label="Từ vựng (Goi)" score={result.criteria.vocabulary} />
            <CriteriaBar label="Ngữ pháp (Bunpou)" score={result.criteria.grammar} />
          </div>

          <div className="bg-orange-50/50 rounded-2xl p-6 md:p-8 relative border border-orange-100 shadow-sm mt-8">
            <div className="absolute -top-4 left-6 bg-white p-1.5 rounded-lg shadow-sm text-[#F26522] border border-orange-100">
              <MessageSquare size={20} fill="currentColor" />
            </div>
            <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-orange-200/50 pb-3">Phân tích chi tiết từ hệ thống:</h3>
            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line font-medium">
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
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-sm text-slate-600">{label}</span>
        <span className="font-black text-[#F26522] text-base">{score}</span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-400 to-[#F26522]" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}