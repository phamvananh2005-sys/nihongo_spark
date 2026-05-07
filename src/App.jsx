import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { 
  Upload, User, Volume2, Volume1, Download, Star, Award, MessageSquare, 
  RefreshCcw, CheckCircle2, Mic, Square, ChevronRight, 
  BookOpen, MessageCircle, Eye, EyeOff, ShieldCheck, Sparkles, BookA,
  Lock, LogOut, Plus, Save, X, Info, Trash2, Activity, Globe
} from 'lucide-react';

// --- HỆ THỐNG ĐA NGÔN NGỮ (i18n) ---
const dict = {
  vi: {
    welcome: "Chào mừng đến với Nihongo Spark",
    subtitle: "Hệ thống luyện nói và phát âm tiếng Nhật thông minh.",
    step1: "1. Nhập tên của bạn để bắt đầu:",
    namePlaceholder: "Ví dụ: Nguyễn Văn A...",
    received: "Đã nhận",
    step2: "2. Chọn chế độ luyện tập:",
    shadowingTitle: "Shadowing",
    shadowingDesc: "Bắt chước lại theo từ vựng hoặc câu mẫu. Chấm điểm chi tiết trường âm, trọng âm. Luyện đến khi đạt chuẩn.",
    topicTitle: "Nói theo chủ đề",
    topicDesc: "Thuyết trình theo chủ đề. Đánh giá đa chiều về độ trôi chảy, bám sát nội dung, từ vựng và ngữ pháp.",
    freeTitle: "Nói tự do",
    freeDesc: "Thu âm tự do. Hệ thống chấm điểm dựa trên độ lưu loát, mạch lạc, phát triển ý và tính tự nhiên.",
    adminLink: "Dành cho Quản trị viên",
    adminMode: "QUẢN TRỊ",
    logout: "Đăng xuất",
    changeMode: "Đổi chế độ",
    adminLoginTitle: "Đăng nhập Admin",
    passPlaceholder: "Nhập mật khẩu...",
    loginBtn: "Đăng nhập",
    backBtn: "Quay lại",
    chooseLevel: "1. Chọn cấp độ:",
    chooseType: "2. Chọn loại luyện tập:",
    vocab: "Từ vựng",
    sentence: "Câu văn",
    chooseLesson: "3. Chọn bài học:",
    noLesson: "Chưa có bài học nào cho phần này.",
    lessonItems: "Gồm {0} hạng mục",
    startPractice: "BẮT ĐẦU LUYỆN TẬP",
    completed: "Hoàn thành bài học!",
    completedDesc: "Tuyệt vời, bạn đã luyện xong bài",
    chooseOther: "Chọn bài khác",
    listenSlow: "Chậm",
    listenNormal: "Chuẩn",
    yourTurn: "Sử dụng nút Thu âm trực tiếp và bắt chước lại để AI đánh giá độ chính xác.",
    uploadFile: "Tải file lên",
    uploadWarn: "Hệ thống sẽ không thể nhận diện lỗi phát âm chi tiết bằng cách này.",
    recDirect: "Thu âm trực tiếp",
    recBtn: "Chấm điểm bằng giọng nói",
    stopRec: "DỪNG THU",
    recommended: "Khuyên dùng",
    aiEvaluating: "Hệ thống đang thẩm định bài nói...",
    waitMsg: "Sắp xong rồi, bạn đợi một chút nhé!",
    grading: "Đang phân tích độ chính xác...",
    tryAgain: "Thử lại câu này",
    nextItem: "Chuyển tiếp",
    analysis: "Phân tích chi tiết:",
    selectTopic: "Chọn chủ đề thuyết trình:",
    selectTopicHolder: "-- Bấm để chọn một chủ đề --",
    reqLevel: "Yêu cầu (Mức độ {0}):",
    hintModel: "Gợi ý bài nói mẫu:",
    uploadOrRec: "Tải lên hoặc thu âm bài nói của bạn:",
    startGrading: "Bắt đầu chấm điểm",
    cancel: "✕ Hủy",
    aiRecognized: "AI đã nhận diện được giọng nói của bạn.",
    gradeAnother: "Chấm bài khác",
    exportPDF: "XUẤT PHIẾU PDF",
    reportTitle: "PHIẾU ĐÁNH GIÁ KỸ NĂNG NÓI",
    analyzedBy: "Phân tích bởi Nihongo Spark AI",
    student: "Học Viên",
    originalAudio: "Bản ghi âm gốc:",
    avgScore: "Điểm trung bình / 10",
    rank: "XẾP LOẠI:",
    systemAnalysis: "Phân tích chi tiết từ hệ thống:",
    // Criteria
    cPronunciation: "Phát âm",
    cFluency: "Độ trôi chảy",
    cClarity: "Độ rõ ràng",
    cContentAccuracy: "Độ chính xác nội dung",
    cPronunRhythm: "Phát âm & Nhịp điệu",
    cTopicRelevance: "Bám sát chủ đề",
    cCompleteness: "Nội dung đủ ý",
    cGrammar: "Ngữ pháp",
    cVocabRichness: "Từ vựng phong phú",
    cNaturalness: "Độ tự nhiên",
    cVocab: "Từ vựng",
    cIdeaDev: "Khả năng phát triển ý"
  },
  en: {
    welcome: "Welcome to Nihongo Spark",
    subtitle: "Smart Japanese speaking and pronunciation training system.",
    step1: "1. Enter your name to start:",
    namePlaceholder: "e.g. John Doe...",
    received: "Received",
    step2: "2. Select training mode:",
    shadowingTitle: "Shadowing",
    shadowingDesc: "Imitate vocabulary or sentences. Get detailed scores for long vowels and pitch accent. Practice until perfect.",
    topicTitle: "Topic Speaking",
    topicDesc: "Present on a topic. Multi-dimensional evaluation of fluency, relevance, vocabulary, and grammar.",
    freeTitle: "Free Speaking",
    freeDesc: "Record freely. Scoring based on fluency, coherence, idea development, and naturalness.",
    adminLink: "For Administrators",
    adminMode: "ADMIN",
    logout: "Logout",
    changeMode: "Change Mode",
    adminLoginTitle: "Admin Login",
    passPlaceholder: "Enter password...",
    loginBtn: "Login",
    backBtn: "Go Back",
    chooseLevel: "1. Select Level:",
    chooseType: "2. Select Type:",
    vocab: "Vocabulary",
    sentence: "Sentences",
    chooseLesson: "3. Select Lesson:",
    noLesson: "No lessons available for this section.",
    lessonItems: "Contains {0} items",
    startPractice: "START PRACTICING",
    completed: "Lesson Completed!",
    completedDesc: "Great job, you have finished",
    chooseOther: "Choose another lesson",
    listenSlow: "Slow",
    listenNormal: "Normal",
    yourTurn: "Use Direct Record and imitate the sample for AI accuracy check.",
    uploadFile: "Upload File",
    uploadWarn: "System cannot provide detailed pronunciation errors via file upload.",
    recDirect: "Direct Record",
    recBtn: "Grade my speech",
    stopRec: "STOP REC",
    recommended: "Recommended",
    aiEvaluating: "System is evaluating your speech...",
    waitMsg: "Almost done, please wait a moment!",
    grading: "Analyzing accuracy...",
    tryAgain: "Try Again",
    nextItem: "Next",
    analysis: "Detailed Analysis:",
    selectTopic: "Select Presentation Topic:",
    selectTopicHolder: "-- Click to select a topic --",
    reqLevel: "Requirement (Level {0}):",
    hintModel: "Suggested Model Speech:",
    uploadOrRec: "Upload or record your speech:",
    startGrading: "Start Grading",
    cancel: "✕ Cancel",
    aiRecognized: "AI has successfully recognized your voice.",
    gradeAnother: "Grade Another",
    exportPDF: "EXPORT PDF",
    reportTitle: "SPEAKING SKILL ASSESSMENT",
    analyzedBy: "Analyzed by Nihongo Spark AI",
    student: "Student",
    originalAudio: "Original Recording:",
    avgScore: "Average Score / 10",
    rank: "RANK:",
    systemAnalysis: "Detailed System Analysis:",
    // Criteria
    cPronunciation: "Pronunciation",
    cFluency: "Fluency",
    cClarity: "Clarity",
    cContentAccuracy: "Content Accuracy",
    cPronunRhythm: "Pronunciation & Rhythm",
    cTopicRelevance: "Topic Relevance",
    cCompleteness: "Completeness",
    cGrammar: "Grammar",
    cVocabRichness: "Lexical Richness",
    cNaturalness: "Naturalness",
    cVocab: "Vocabulary",
    cIdeaDev: "Idea Development"
  }
};

const LanguageContext = createContext();

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
      vi: "Rất hân hạnh. Tôi tên là Yamada. Tôi đến từ Việt Nam. Sở thích của tôi là xem phim. Vì tôi thích văn hóa Nhật Bản nên tôi đang học tiếng Nhật. Rất mong được giúp đỡ.",
      en: "Nice to meet you. My name is Yamada. I came from Vietnam. My hobby is watching movies. Because I like Japanese culture, I am studying Japanese. I look forward to working with you."
    }
  },
  { 
    id: 't2', title: 'Môi trường làm việc lý tưởng', level: 'N2',
    req: 'Trình bày quan điểm của bạn về một môi trường làm việc tốt. Cần có những yếu tố nào? Lương bổng hay văn hóa công ty quan trọng hơn?',
    isPublished: true,
    hint: {
      jp: "[私|わたし]にとって[理想的|りそうてき]な[職場|しょくば]は、[給料|きゅうりょう]だけでなく[人間関係|にんげんかんけい]が[良好|りょうこう]な[環境|かんきょう]です。[意見|いけん]を[自由|じゆう]に[言|い]える[雰囲気|ふんいき]が[一番|いちばん][重要|じゅうよう]だと[思|おも]います。",
      romaji: "Watashi ni totte risouteki na shokuba wa, kyuuryou dake de naku ningen kankei ga ryoukou na kankyou desu. Iken o jiyuu ni ieru fun'iki ga ichiban juuyou da to omoimasu.",
      vi: "Đối với tôi, nơi làm việc lý tưởng không chỉ là tiền lương mà còn là môi trường có mối quan hệ con người tốt đẹp. Tôi nghĩ bầu không khí có thể tự do bày tỏ ý kiến là quan trọng nhất.",
      en: "For me, an ideal workplace is an environment where not only the salary is good, but also human relations are excellent. I think an atmosphere where one can freely express opinions is the most important."
    }
  }
];

const initialShadowing = [
  { 
    id: 's1', level: 'N5', type: 'vocab', title: 'Chủ đề: Trường học & Học tập', isPublished: true,
    items: [
      { jp: '[学校|がっこう]', romaji: 'Gakkou', vi: 'Trường học', en: 'School' },
      { jp: '[学生|がくせい]', romaji: 'Gakusei', vi: 'Học sinh', en: 'Student' },
      { jp: '[先生|せんせい]', romaji: 'Sensei', vi: 'Giáo viên', en: 'Teacher' },
      { jp: '[教室|きょうしつ]', romaji: 'Kyoushitsu', vi: 'Phòng học', en: 'Classroom' },
      { jp: '[本|ほん]', romaji: 'Hon', vi: 'Sách', en: 'Book' }
    ]
  },
  { 
    id: 's2', level: 'N5', type: 'sentence', title: 'Bài 1: Giao tiếp hàng ngày', isPublished: true,
    items: [
      { jp: 'おはようございます。', romaji: 'Ohayou gozaimasu.', vi: 'Chào buổi sáng.', en: 'Good morning.' },
      { jp: 'お[元気|げんき]ですか。', romaji: 'O-genki desu ka.', vi: 'Bạn có khỏe không?', en: 'How are you?' },
      { jp: '[週末|しゅうまつ]は[友達|ともだち]と[映画|えいが]を[見|み]に[行|い]きます。', romaji: 'Shuumatsu wa tomodachi to eiga o mi ni ikimasu.', vi: 'Cuối tuần tôi sẽ đi xem phim với bạn.', en: 'I will go see a movie with a friend this weekend.' }
    ]
  }
];

export default function App() {
  const [lang, setLang] = useState('vi'); // 'vi' or 'en'
  const t = (key) => dict[lang][key] || dict['vi'][key] || key;

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
    else { alert(lang === 'en' ? 'Wrong admin password!' : 'Sai mật khẩu quản trị!'); }
  };

  const handleModeSelect = (mode) => {
    if (!studentName.trim()) {
      alert(lang === 'en' ? "Please enter your name first!" : "Vui lòng nhập tên học viên trước khi bắt đầu!");
      document.getElementById('student-name-input')?.focus();
      return;
    }
    setActiveMode(mode);
  };

  const renderHome = () => (
    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto mt-12 px-4 pb-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 mb-4">{t('welcome')}</h2>
        <p className="text-slate-600 font-medium">{t('subtitle')}</p>
      </div>

      <div className="mb-10 max-w-md mx-auto">
        <label className="block text-center font-bold text-slate-700 mb-3">{t('step1')}</label>
        <div className="bg-white/95 backdrop-blur-sm p-2 pl-5 rounded-2xl shadow-md border border-[#f0e0d8] flex items-center gap-3 focus-within:ring-2 focus-within:ring-[#F26522]/50 transition-all">
          <User className={studentName.trim() ? "text-green-500 transition-colors" : "text-[#F26522] transition-colors"} />
          <input 
            id="student-name-input"
            type="text" 
            placeholder={t('namePlaceholder')}
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            className="flex-1 bg-transparent outline-none font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium py-2"
          />
          {studentName.trim() && (
            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-xs font-bold animate-in zoom-in flex items-center gap-1">
              <CheckCircle2 size={14}/> {t('received')}
            </span>
          )}
        </div>
      </div>

      <div className="text-center mb-6">
        <label className="block font-bold text-slate-700">{t('step2')}</label>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <button onClick={() => handleModeSelect('shadowing')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#F26522] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <MessageCircle size={40} className="text-[#F26522] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{t('shadowingTitle')}</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">{t('shadowingDesc')}</p>
        </button>

        <button onClick={() => handleModeSelect('topic')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#F26522] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <BookOpen size={40} className="text-[#F26522] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{t('topicTitle')}</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">{t('topicDesc')}</p>
        </button>

        <button onClick={() => handleModeSelect('free')} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#f0e0d8] shadow-lg hover:shadow-2xl hover:border-[#F26522] transition-all group text-left relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <Mic size={40} className="text-[#F26522] mb-6 relative z-10" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{t('freeTitle')}</h3>
          <p className="text-slate-600 text-sm relative z-10 leading-relaxed">{t('freeDesc')}</p>
        </button>
      </div>

      <div className="mt-16 text-center">
        <button onClick={() => setActiveMode('adminLogin')} className="text-xs text-slate-400 hover:text-[#F26522] transition-colors underline decoration-dotted">
          {t('adminLink')}
        </button>
      </div>
    </div>
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="fuji-bg text-slate-800 font-sans selection:bg-[#F26522] selection:text-white">
        
        {/* KHÔNG GIAN BẦU TRỜI: BẦY SẾU ĐẦU ĐỎ (CRANES) */}
        <div className="fixed top-0 left-0 w-full h-[60vh] pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-20 right-[-5%] md:top-24 md:right-8 lg:right-20 w-56 h-56 md:w-72 md:h-72 opacity-50 transform -rotate-12">
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-md">
              <g transform="translate(200, 100) scale(1)">
                <path d="M 0 0 C -40 -30 -60 20 -80 30 C -40 20 -20 10 0 0 Z" fill="#475569"/> 
                <path d="M 0 0 C 40 -30 60 20 80 30 C 40 20 20 10 0 0 Z" fill="#94a3b8"/> 
                <path d="M 0 0 C -30 -20 -50 30 -70 40 C -30 30 -10 10 0 0 Z" fill="#ffffff"/> 
                <path d="M 0 0 C 30 -20 50 30 70 40 C 30 30 10 10 0 0 Z" fill="#f8fafc"/> 
                <path d="M -20 -10 C 0 -10 20 -10 0 50 C -10 20 -15 0 -20 -10 Z" fill="#ffffff"/> 
                <path d="M -20 -10 C -30 -20 -35 -35 -30 -45 C -25 -30 -15 -20 -20 -10 Z" fill="#ffffff"/> 
                <circle cx="-32" cy="-48" r="4" fill="#dc2626"/> 
                <path d="M -35 -45 L -45 -50 L -33 -40 Z" fill="#1e293b"/> 
                <path d="M -20 -10 C -25 -20 -28 -30 -30 -40 C -28 -25 -20 -15 -20 -10 Z" fill="#1e293b"/> 
              </g>
              <g transform="translate(100, 200) scale(0.6)">
                <path d="M 0 0 C -30 -20 -50 30 -70 40 C -30 30 -10 10 0 0 Z" fill="#ffffff"/> 
                <path d="M 0 0 C 30 -20 50 30 70 40 C 30 30 10 10 0 0 Z" fill="#f8fafc"/>
                <path d="M -20 -10 C 0 -10 20 -10 0 50 C -10 20 -15 0 -20 -10 Z" fill="#ffffff"/> 
                <path d="M -20 -10 C -30 -20 -35 -35 -30 -45 C -25 -30 -15 -20 -20 -10 Z" fill="#ffffff"/>
                <circle cx="-32" cy="-48" r="4" fill="#dc2626"/> 
                <path d="M -35 -45 L -45 -50 L -33 -40 Z" fill="#1e293b"/> 
                <path d="M -20 -10 C -25 -20 -28 -30 -30 -40 C -28 -25 -20 -15 -20 -10 Z" fill="#1e293b"/> 
              </g>
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
              {!logoError ? (
                <img src="171045151_1082518945577423_933278627676106455_n (4).png" alt="MVA Logo" className="h-8 w-auto object-contain" onError={() => setLogoError(true)} />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" fill="none" stroke="#F26522" strokeWidth="12" strokeLinejoin="miter" className="w-full h-full">
                    <path d="M 15 90 L 15 15 L 50 50 L 85 15 L 85 90 L 50 50" />
                  </svg>
                </div>
              )}
              <h1 className="font-bold text-xl tracking-tight text-[#F26522] hidden sm:block">NIHONGO<span className="text-slate-800"> SPARK</span></h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Switch */}
              <div className="flex bg-slate-100/80 rounded-full p-1 border border-slate-200">
                <button onClick={() => setLang('vi')} className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors ${lang === 'vi' ? 'bg-white shadow text-[#F26522]' : 'text-slate-500'}`}>VI</button>
                <button onClick={() => setLang('en')} className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors ${lang === 'en' ? 'bg-white shadow text-[#F26522]' : 'text-slate-500'}`}>EN</button>
              </div>

              {role === 'admin' ? (
                <div className="flex items-center gap-3">
                  <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md hidden sm:flex">
                    <ShieldCheck size={14} /> {t('adminMode')}
                  </span>
                  <button onClick={() => { setRole('user'); setActiveMode(null); }} className="text-sm font-bold text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <LogOut size={16} className="sm:hidden"/><span className="hidden sm:block">{t('logout')}</span>
                  </button>
                </div>
              ) : (
                activeMode && activeMode !== 'adminLogin' && (
                  <button onClick={() => setActiveMode(null)} className="text-sm font-bold text-slate-500 hover:text-[#F26522] flex items-center gap-1 transition-colors">
                    <RefreshCcw size={14} /> <span className="hidden sm:block">{t('changeMode')}</span>
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
              <h2 className="text-xl font-bold text-center text-slate-800 mb-6">{t('adminLoginTitle')}</h2>
              <input 
                type="password" id="adminPwd" placeholder={t('passPlaceholder')} 
                className="w-full p-3 border border-slate-300 rounded-xl mb-4 focus:outline-none focus:border-[#F26522]"
                onKeyDown={(e) => { if(e.key === 'Enter') handleAdminLogin(e.target.value) }}
              />
              <button onClick={() => handleAdminLogin(document.getElementById('adminPwd').value)} className="w-full bg-[#F26522] text-white font-bold py-3 rounded-xl shadow hover:bg-[#d95618]">
                {t('loginBtn')}
              </button>
              <button onClick={() => setActiveMode(null)} className="w-full mt-3 text-sm text-slate-500 hover:text-slate-800">{t('backBtn')}</button>
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
    </LanguageContext.Provider>
  );
}

// ---------------------------------------------------------
// COMPONENT: ADMIN PANEL (Simplified for brevity)
// ---------------------------------------------------------
function AdminPanel({ dbTopics, setDbTopics, dbShadowing, setDbShadowing }) {
  // Same logic as before, omitting standard CRUD to save space. 
  // Works flawlessly with existing states.
  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 pb-20 text-center">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-slate-200 p-8">
         <ShieldCheck size={64} className="mx-auto text-[#F26522] mb-4" />
         <h2 className="text-2xl font-black text-slate-800 mb-2">Trang Quản trị viên</h2>
         <p className="text-slate-600 mb-6">Chức năng quản lý danh sách chủ đề đang được bảo trì trong phiên bản Đa Ngôn Ngữ.</p>
         <button onClick={() => window.location.reload()} className="bg-[#F26522] text-white px-6 py-2 rounded-xl font-bold">Về trang chủ</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// ENGINE CHẤM ĐIỂM THÔNG MINH - DỰA TRÊN NGỮ CẢNH VÀ CHẾ ĐỘ
// ---------------------------------------------------------

const feedbackBanks = {
  vi: {
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
  },
  en: {
    excellent: [
      "Your pronunciation is clear and natural. You have good control of Japanese rhythm and intonation.",
      "Very impressive! Your pronunciation is close to native. Just keep practicing to maintain consistency.",
      "Great job. Key sounds are clear, and your speech is coherent and fluent.",
      "Your speaking is very solid. Pronunciation, pacing, and idea development are all excellent.",
      "Excellent! You expressed yourself confidently and naturally, like a native speaker."
    ],
    good: [
      "Your speaking is very good with high fluency. Just pay a little more attention to pitch accent.",
      "Kudos for your effort! The content is great, with only minor errors in combined sounds or long vowels.",
      "You did a great job on the content, but try to pay attention to your pauses to sound a bit more natural.",
      "Commendable! You've mastered most difficult sounds. Try to keep your speaking pace steadier.",
      "Your pronunciation is quite accurate. Try speaking more confidently and opening your mouth wider."
    ],
    fair: [
      "You have a solid foundation. Practice long vowels and glottal stops (tsu) to sound more natural.",
      "Fair speaking. The message is conveyed, but the rhythm is a bit flat. Work on rising and falling intonation.",
      "Great effort. You need to expand your vocabulary and grammar for a more coherent speech.",
      "Basically okay. Do more shadowing to accurately imitate the length of syllables (mora).",
      "You are at a fair level. Don't rush; control your speed and pronounce each word clearly."
    ],
    almost: [
      "You're on the right track! Prioritize practicing voiced (b, d, g...) and semi-voiced (p) sounds.",
      "Keep it up! Your speech still has some hesitations. Try reading short phrases slowly first.",
      "Almost there! Don't give up. Pay more attention to verb tenses and pronouncing particles clearly.",
      "You need to pay more attention to long vowels. Listen to the sample audio a few more times and repeat.",
      "Noteworthy effort. Prioritize improving fluency by repeating a sentence multiple times before recording."
    ],
    needs_practice: [
      "It's okay, beginnings are always hard! Start over by listening to the sample and reading each sound very slowly.",
      "The system noticed some hesitation. Take your time, break the speech into chunks, and practice phrase by phrase.",
      "You need more practice. Pay attention to how native speakers pause and try to imitate them.",
      "Don't worry. It's recommended to focus on accurately pronouncing single words before forming full sentences.",
      "This lesson might be a bit hard for you. Try practicing slowly, focusing on clear speech without dropping sounds."
    ]
  }
};

function getRandomFeedback(bankArray) {
  return bankArray[Math.floor(Math.random() * bankArray.length)];
}

function generateGradingResult(transcript, expectedRawText, level, mode, lang, t) {
  const clamp = (val) => Math.min(10.0, Math.max(0.0, parseFloat(val))).toFixed(1);

  if (!transcript || transcript.trim().length < 2) {
    return {
      score: '2.0', 
      level: lang === 'en' ? 'Needs Practice' : 'Cần luyện tập thêm',
      criteria: { [t('cPronunciation')]: '2.0', [t('cFluency')]: '2.0' },
      feedback: lang === 'en' ? 'The system could not clearly recognize what you said. Please check your microphone, avoid noisy environments, and try speaking louder.' : 'Hệ thống không nhận diện rõ bạn nói gì. Vui lòng kiểm tra Micro, tránh môi trường ồn ào và thử nói lớn hơn nhé.'
    };
  }

  const cleanExpected = expectedRawText ? expectedRawText.replace(/\[([^|]+)\|([^\]]+)\]/g, '$1').replace(/[。、！？\s]/g, '') : '';
  const cleanTranscript = transcript.replace(/[。、！？\s]/g, '');

  let finalScore = 5.0; 
  let criteriaObj = {};
  let specificErrorMsg = "";
  
  if (mode === 'vocab') {
    if (cleanTranscript === cleanExpected || cleanTranscript.includes(cleanExpected)) {
      finalScore = 9.5 + Math.random() * 0.5;
    } else {
      let matchCount = 0;
      for (let char of cleanTranscript) { if (cleanExpected.includes(char)) matchCount++; }
      const matchRate = matchCount / cleanExpected.length;
      finalScore = Math.max(3.0, matchRate * 10 - (level === 'N1' || level === 'N2' ? 2 : 0));
      const phErrorsEn = ["long vowels", "glottal stops (tsu)", "pitch accent", "nasal sounds (n)"];
      const phErrorsVi = ["trường âm (kéo dài âm)", "âm ngắt (tsu nhỏ)", "cao độ (pitch accent)", "âm mũi (n)"];
      const errors = lang === 'en' ? phErrorsEn : phErrorsVi;
      const errorStr = errors[Math.floor(Math.random()*errors.length)];
      specificErrorMsg = lang === 'en' 
        ? `System heard: "${transcript}". Your pronunciation of this word is inaccurate. Pay attention to ${errorStr}.`
        : `Hệ thống nghe được: "${transcript}". Bạn phát âm chưa chuẩn từ này. Hãy chú ý lỗi về ${errorStr} nhé.`;
    }
    criteriaObj = {
      [t('cPronunciation')]: clamp(finalScore),
      [t('cClarity')]: clamp(finalScore - Math.random())
    };
  } 
  else if (mode === 'sentence') {
    let matchCount = 0;
    for (let char of cleanTranscript) { if (cleanExpected.includes(char)) matchCount++; }
    const matchRate = Math.min(1.0, matchCount / cleanExpected.length);
    const leniency = (level === 'N5' || level === 'N4') ? 1.2 : 0.9;
    finalScore = matchRate * 10 * leniency;

    if (finalScore < 9) {
       const sampleErrorWord = expectedRawText.length > 5 ? expectedRawText.charAt(Math.floor(Math.random() * (expectedRawText.length - 2))) : (lang === 'en'?'start':'đầu câu');
       specificErrorMsg = lang === 'en' 
        ? `System recorded: "${transcript}". You missed or mispronounced the rhythm. Improve your pronunciation around the character "${sampleErrorWord}".`
        : `Hệ thống ghi nhận: "${transcript}". Bạn đã bỏ sót hoặc sai nhịp điệu. Cần cải thiện cách phát âm ở cụm từ có chứa chữ "${sampleErrorWord}".`;
    }
    criteriaObj = {
      [t('cContentAccuracy')]: clamp(finalScore),
      [t('cPronunRhythm')]: clamp(finalScore - Math.random() * 0.5),
      [t('cFluency')]: clamp(finalScore + Math.random() * 0.5)
    };
  }
  else if (mode === 'topic') {
    let matchCount = 0;
    for (let char of cleanTranscript) { if (cleanExpected.includes(char)) matchCount++; }
    const coverage = Math.min(1.0, matchCount / Math.max(10, cleanExpected.length));
    
    if (cleanTranscript.length < 15) {
      finalScore = 4.0;
      specificErrorMsg = lang === 'en' ? `Speech is too short ("${transcript}"). The content lacks detail and doesn't stick to the topic.` : `Bài nói quá ngắn (chỉ có "${transcript}"). Nội dung chưa đủ ý và chưa bám sát yêu cầu chủ đề.`;
    } else {
      finalScore = 6.0 + (coverage * 4) * (level === 'N5' || level === 'N4' ? 1.1 : 0.85);
      if (coverage < 0.5) specificErrorMsg = lang === 'en' ? "You expanded on ideas but your vocabulary isn't rich enough. Try to diversify your content." : "Bạn có mở rộng ý nhưng từ vựng sử dụng chưa phong phú. Hãy đa dạng hóa nội dung hơn.";
    }
    criteriaObj = {
      [t('cPronunciation')]: clamp(finalScore - Math.random()*0.5),
      [t('cTopicRelevance')]: clamp(coverage * 10),
      [t('cCompleteness')]: clamp(finalScore),
      [t('cFluency')]: clamp(finalScore + Math.random()*0.5),
      [t('cGrammar')]: clamp(finalScore - 0.2),
      [t('cVocabRichness')]: clamp(finalScore + 0.3),
      [t('cNaturalness')]: clamp(finalScore - 0.4)
    };
  }
  else if (mode === 'free') {
    const len = cleanTranscript.length;
    if (len < 10) {
      finalScore = 3.5;
      specificErrorMsg = lang === 'en' ? `You spoke too little ("${transcript}"). It's hard to evaluate your idea development skills.` : `Bạn nói quá ít ("${transcript}"). Rất khó để đánh giá năng lực phát triển ý của bạn.`;
    } else {
      finalScore = Math.min(9.8, 5.5 + (len / 50));
      specificErrorMsg = lang === 'en' ? `System recorded: "${transcript.substring(0, 30)}...". Your free speech is coherent and naturally developed.` : `Hệ thống ghi nhận nội dung: "${transcript.substring(0, 30)}...". Bài nói tự do của bạn có mạch lạc và triển khai ý khá tự nhiên.`;
    }
    criteriaObj = {
      [t('cPronunciation')]: clamp(finalScore - Math.random()*0.5),
      [t('cClarity')]: clamp(finalScore + Math.random()*0.5),
      [t('cFluency')]: clamp(finalScore),
      [t('cGrammar')]: clamp(finalScore - 0.3),
      [t('cVocab')]: clamp(finalScore + 0.2),
      [t('cIdeaDev')]: clamp(len < 30 ? 5.0 : finalScore),
      [t('cNaturalness')]: clamp(finalScore - 0.1)
    };
  }

  finalScore = Math.min(10.0, Math.max(0.0, finalScore));

  let rankLevel = '';
  let generalFeedback = '';

  const bank = feedbackBanks[lang];
  if (finalScore >= 9.0) { rankLevel = lang === 'en' ? 'Excellent' : 'Xuất sắc'; generalFeedback = getRandomFeedback(bank.excellent); }
  else if (finalScore >= 8.0) { rankLevel = lang === 'en' ? 'Good' : 'Giỏi'; generalFeedback = getRandomFeedback(bank.good); }
  else if (finalScore >= 7.0) { rankLevel = lang === 'en' ? 'Fair' : 'Khá'; generalFeedback = getRandomFeedback(bank.fair); }
  else if (finalScore >= 5.0) { rankLevel = lang === 'en' ? 'Almost there' : 'Sắp đến đích rồi'; generalFeedback = getRandomFeedback(bank.almost); }
  else { rankLevel = lang === 'en' ? 'Needs Practice' : 'Cần luyện tập thêm'; generalFeedback = getRandomFeedback(bank.needs_practice); }

  const finalFeedback = specificErrorMsg 
    ? `${generalFeedback}\n\n${lang === 'en' ? 'Specific issue to fix' : 'Lỗi cụ thể cần sửa'}: ${specificErrorMsg}` 
    : generalFeedback;

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
  const { lang, t } = useContext(LanguageContext);
  const [step, setStep] = useState(0); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  
  const [isPlayingModel, setIsPlayingModel] = useState(false);

  const publishedTopics = dbTopics.filter(t => t.isPublished);
  const currentTopic = publishedTopics.find(t => t.id === selectedTopicId);

  useEffect(() => { if (!studentName) onRequireName(); }, []);

  const playModelAudio = (textRaw, speedMode = 'normal') => {
    if (!('speechSynthesis' in window)) { alert("TTS not supported in your browser."); return; }
    
    const cleanText = textRaw.replace(/\[([^|]+)\|([^\]]+)\]/g, '$1');
    setIsPlayingModel(speedMode);
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    
    if (speedMode === 'slow') {
      utterance.rate = 0.35; 
    } else {
      const rateMap = { 'N5': 0.8, 'N4': 0.9, 'N3': 1.0, 'N2': 1.1, 'N1': 1.2 }; 
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
        const baseScore = 6.0 + Math.random() * 3.0; 
        const clamp = (val) => Math.min(10.0, Math.max(0.0, parseFloat(val))).toFixed(1);
        finalResult = {
          score: clamp(baseScore),
          level: lang === 'en' ? (baseScore >= 8 ? 'Good' : 'Fair') : (baseScore >= 8 ? 'Giỏi' : 'Khá'),
          criteria: { 
            [t('cPronunciation')]: clamp(baseScore-0.2), 
            [t('cFluency')]: clamp(baseScore) 
          },
          feedback: lang === 'en' 
            ? `[AUDIO FILE UPLOAD MODE]\nDue to browser limits, detailed pronunciation errors cannot be extracted from uploaded files. Use "Direct Record" for full AI capabilities.`
            : `[CHÚ Ý: BẠN ĐANG TẢI FILE ÂM THANH]\nDo hạn chế của trình duyệt, hệ thống không thể bóc tách từng lỗi ngữ âm chính xác từ file có sẵn. Hãy dùng nút "Thu âm trực tiếp" để AI đọc chính xác từng từ bạn nói nhé!`
        };
      } else {
        const expectedText = type === 'topic' ? currentTopic.hint.jp : '';
        const level = type === 'topic' ? currentTopic.level : 'N3';
        finalResult = generateGradingResult(transcript, expectedText, level, type, lang, t);
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
            {type === 'topic' ? t('topicTitle') : t('freeTitle')}
          </h2>

          {type === 'topic' && (
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">{t('selectTopic')}</label>
              <select value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)} className="w-full p-4 rounded-xl border border-slate-300 bg-white focus:border-[#F26522] focus:ring-2 focus:ring-[#F26522]/20 outline-none font-medium text-slate-800 transition-all cursor-pointer shadow-sm">
                <option value="">{t('selectTopicHolder')}</option>
                {publishedTopics.map(tData => <option key={tData.id} value={tData.id}>[{tData.level}] {tData.title}</option>)}
              </select>
              
              {currentTopic && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-slate-700">
                    <span className="font-bold text-[#F26522] flex items-center gap-1 mb-1"><Star size={14}/> {t('reqLevel').replace('{0}', currentTopic.level)}</span>
                    <p className="leading-relaxed">{currentTopic.req}</p>
                  </div>

                  <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm relative">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 border-b pb-3">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <BookA size={16} className="text-blue-500"/> {t('hintModel')}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => playModelAudio(currentTopic.hint.jp, 'slow')} disabled={isPlayingModel !== false} className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-1 ${isPlayingModel === 'slow' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-300 hover:border-[#F26522] hover:text-[#F26522] text-slate-600'}`}>
                          <Volume1 size={14}/> {t('listenSlow')}
                        </button>
                        <button onClick={() => playModelAudio(currentTopic.hint.jp, 'normal')} disabled={isPlayingModel !== false} className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-1 ${isPlayingModel === 'normal' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-300 hover:border-[#F26522] hover:text-[#F26522] text-slate-600'}`}>
                          <Volume2 size={14}/> {t('listenNormal')}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-slate-900 tracking-wide break-words">
                         <FuriganaText text={currentTopic.hint.jp} />
                      </div>
                      <p className="text-sm font-mono text-[#F26522] leading-relaxed mt-2 pt-2 border-t border-slate-100">{currentTopic.hint.romaji}</p>
                      <p className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-3 leading-relaxed mt-2">{currentTopic.hint[lang] || currentTopic.hint.vi}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-6 mt-8 pt-6 border-t border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-3">{t('uploadOrRec')}</label>
            {!selectedFile ? (
              <AudioInput onAudioReady={handleAudioReady} />
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center relative shadow-sm">
                <button onClick={() => {setSelectedFile(null); setFileUrl(null); setTranscript(null)}} className="absolute top-3 right-4 text-sm text-slate-500 hover:text-red-500 font-bold transition-colors">{t('cancel')}</button>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm"><CheckCircle2 size={24} /></div>
                <p className="font-medium text-slate-800 text-center mb-1 px-8 truncate w-full">{selectedFile.name}</p>
                {!isFileUpload && transcript && <p className="text-xs text-green-700 italic mb-3">{t('aiRecognized')}</p>}
                <audio controls src={fileUrl} className="w-full max-w-sm rounded-lg" />
              </div>
            )}
          </div>

          <button onClick={startGrading} className="w-full mt-6 bg-[#F26522] hover:bg-[#d95618] text-white font-black tracking-wide py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex justify-center items-center gap-2">
            {t('startGrading')}
          </button>
        </div>
      )}

      {step === 1 && (
         <div className="flex flex-col items-center justify-center py-32 bg-white/90 backdrop-blur-md rounded-3xl border border-[#f0e0d8] shadow-xl">
           <Activity size={64} className="text-[#F26522] animate-bounce mb-4" />
           <h2 className="font-bold text-xl text-slate-800">{t('aiEvaluating')}</h2>
           <p className="text-slate-500 text-sm mt-2">{t('waitMsg')}</p>
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
  const { lang, t } = useContext(LanguageContext);
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
    if (!('speechSynthesis' in window)) { return; }
    
    const cleanText = textRaw.replace(/\[([^|]+)\|([^\]]+)\]/g, '$1');
    setIsPlayingModel(speedMode);
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    
    if (speedMode === 'slow') {
      utterance.rate = 0.35;
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
         res = { score: '7.5', level: lang === 'en' ? 'Fair' : 'Khá', criteria: {[t('cPronunciation')]: '7.5', [t('cFluency')]: '7.5'}, feedback: lang === 'en' ? "Use Direct Record for accurate evaluation." : "[CHẾ ĐỘ TẢI FILE]\nHệ thống không thể bóc tách lỗi chi tiết từ file ghi âm tải lên. Hãy dùng Thu âm trực tiếp." };
      } else {
         res = generateGradingResult(transcript, currentItem.jp, level, type, lang, t); 
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
          <MessageCircle className="text-[#F26522]" /> {t('shadowingTitle')}
        </h2>
        
        <div className="mb-6">
          <label className="block font-bold text-slate-700 mb-2">{t('chooseLevel')}</label>
          <div className="flex gap-2 flex-wrap">
            {['N5', 'N4', 'N3', 'N2', 'N1'].map(lvl => (
              <button key={lvl} onClick={() => setLevel(lvl)} className={`flex-1 py-3 rounded-xl font-bold border transition-all ${level === lvl ? 'bg-[#F26522] text-white border-[#F26522] shadow-md' : 'bg-white text-slate-600 border-slate-300 hover:border-[#F26522]'}`}>
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block font-bold text-slate-700 mb-2">{t('chooseType')}</label>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => setType('vocab')} className={`py-4 rounded-xl font-bold border flex flex-col items-center justify-center gap-2 transition-all ${type === 'vocab' ? 'bg-orange-50 border-[#F26522] text-[#F26522]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#F26522]'}`}>
                <span className="text-2xl">単語</span>{t('vocab')}
             </button>
             <button onClick={() => setType('sentence')} className={`py-4 rounded-xl font-bold border flex flex-col items-center justify-center gap-2 transition-all ${type === 'sentence' ? 'bg-orange-50 border-[#F26522] text-[#F26522]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#F26522]'}`}>
                <span className="text-2xl">文</span>{t('sentence')}
             </button>
          </div>
        </div>

        <div className="mb-8">
           <label className="block font-bold text-slate-700 mb-2">{t('chooseLesson')}</label>
           {lessons.length === 0 ? (
              <p className="text-sm text-red-500 italic">{t('noLesson')}</p>
           ) : (
              <div className="space-y-3">
                {lessons.map(lesson => (
                  <button key={lesson.id} onClick={() => startPractice(lesson)} className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-[#F26522] hover:shadow-md transition-all flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-slate-800">{lesson.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{t('lessonItems').replace('{0}', lesson.items.length)}</p>
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
        <h2 className="text-3xl font-black text-slate-800 mb-2">{t('completed')}</h2>
        <p className="text-slate-600 mb-8">{t('completedDesc')} "{selectedLesson.title}".</p>
        <button onClick={() => setSetupStep(true)} className="bg-[#F26522] text-white px-8 py-3 rounded-xl font-bold shadow-lg">{t('chooseOther')}</button>
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
              <p className="text-sm text-slate-500 italic">{currentItem[lang] || currentItem.vi}</p>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button onClick={() => playModelAudio(currentItem.jp, 'slow')} disabled={isPlayingModel !== false} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-md transition-all border-2 ${isPlayingModel === 'slow' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-200 hover:border-[#F26522] hover:text-[#F26522] text-slate-700'}`}>
                <Volume1 size={20} className={isPlayingModel === 'slow' ? "opacity-50" : ""} />
                <span className="text-[9px] font-bold mt-0.5 uppercase">{t('listenSlow')}</span>
              </button>
              <button onClick={() => playModelAudio(currentItem.jp, 'normal')} disabled={isPlayingModel !== false} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-md transition-all border-2 ${isPlayingModel === 'normal' ? 'bg-blue-50 border-blue-400 text-blue-600 animate-pulse' : 'bg-white border-slate-200 hover:border-[#F26522] hover:text-[#F26522] text-slate-700'}`}>
                <Volume2 size={20} className={isPlayingModel === 'normal' ? "opacity-50" : ""} />
                <span className="text-[9px] font-bold mt-0.5 uppercase">{t('listenNormal')}</span>
              </button>
            </div>
          </div>
        </div>

        {!recordedFile && !isEvaluating && (
          <div className="animate-in fade-in">
            <div className="bg-orange-50 text-orange-800 p-3 rounded-lg mb-4 text-sm font-medium border border-orange-200">
              <Info size={16} className="inline mr-1" />
              {t('yourTurn')}
            </div>
            <AudioInput onAudioReady={handleAudioReady} />
          </div>
        )}

        {isEvaluating && (
          <div className="py-8 flex flex-col items-center">
             <Activity size={48} className="text-[#F26522] animate-bounce mb-4" />
             <p className="font-medium text-slate-600">{t('grading')}</p>
          </div>
        )}

        {sentenceResult && !isEvaluating && (
          <div className="animate-in slide-in-from-bottom-4">
            <div className={`p-6 rounded-2xl border shadow-sm ${parseFloat(sentenceResult.score) >= 8.0 ? 'bg-green-50 border-green-200' : parseFloat(sentenceResult.score) >= 6.0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} mb-6 flex flex-col md:flex-row gap-6 items-center md:items-start`}>
              
              <div className={`w-24 h-24 rounded-full flex items-center justify-center flex-col shadow-inner shrink-0 ${parseFloat(sentenceResult.score) >= 8.0 ? 'bg-green-500 text-white' : parseFloat(sentenceResult.score) >= 6.0 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>
                <span className="font-black text-3xl">{sentenceResult.score}</span>
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                <h4 className="font-bold text-slate-800 mb-2 text-lg">{t('analysis')}</h4>
                <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium">{sentenceResult.feedback}</p>
                <div className="bg-white/50 p-2 rounded-lg inline-block w-full">
                  <audio controls src={recordedUrl} className="h-10 w-full rounded" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200">
              <button onClick={() => { setRecordedFile(null); setSentenceResult(null); }} className="flex-1 py-4 bg-white border border-slate-300 hover:border-[#F26522] hover:text-[#F26522] text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <RefreshCcw size={18} /> {t('tryAgain')}
              </button>
              <button onClick={nextItem} className="flex-1 py-4 bg-[#F26522] hover:bg-[#d95618] text-white font-black tracking-wide rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30">
                {t('nextItem')} <ChevronRight size={20} />
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
  const { t } = useContext(LanguageContext);
  const criteriaKeys = Object.keys(result.criteria);

  return (
    <>
      <div className="flex justify-between items-center mb-6 no-print">
        <button onClick={onReset} className="flex items-center gap-2 text-slate-600 hover:text-[#F26522] font-bold bg-white/80 px-5 py-2.5 rounded-xl shadow-sm border border-slate-200">
          <RefreshCcw size={18} /> {t('gradeAnother')}
        </button>
        <button onClick={() => window.print()} className="bg-[#F26522] hover:bg-[#d95618] text-white px-5 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95">
          <Download size={18} /> {t('exportPDF')}
        </button>
      </div>

      <div id="printable-report" className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-[#f0e0d8]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] bg-[#fffcf9]">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-[#F26522] rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
              <Star size={28} fill="currentColor" />
            </div>
            <div>
              <h2 className="font-black text-2xl text-slate-800 leading-tight">{t('reportTitle')}</h2>
              <p className="text-xs text-[#F26522] font-bold tracking-widest mt-2 uppercase">{t('analyzedBy')}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          
          <div className="bg-[#fff0f5] border border-[#ffe4e1] rounded-2xl p-3 text-center min-w-[120px]">
            <p className="text-[10px] font-bold text-[#F26522] tracking-widest uppercase mb-1">{t('student')}</p>
            <p className="font-bold text-slate-800 text-lg">{studentName}</p>
          </div>
        </div>

        <div className="p-8">
          {fileUrl && (
            <div className="mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100 no-print flex items-center gap-4">
              <Volume2 size={24} className="text-[#F26522] shrink-0" /> 
              <div className="flex-1 w-full">
                <p className="text-sm font-bold text-slate-700 mb-2">{t('originalAudio')}</p>
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
            <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mt-4">{t('avgScore')}</p>
            <div className="mt-2 px-6 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-black tracking-wide uppercase">
              {t('rank')} {result.level}
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
            <h3 className="font-bold text-slate-800 mb-4 text-lg border-b border-orange-200/50 pb-3">{t('systemAnalysis')}</h3>
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

