import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from './utils';
import { PERSONAS, Q1_OPTIONS, Q2_OPTIONS, TRAIT_MAP, STANCE_MAP, type Persona } from './personas';

const Q1_KEY = 'hr-ai-game-q1';
const Q2_KEY = 'hr-ai-game-q2';
const MUTE_KEY = 'hr-ai-game-mute';
const DONE_KEY = 'hr-ai-game-completions';

function zeroVotes(opts: { id: string }[]): Record<string, number> {
  const out: Record<string, number> = {};
  opts.forEach((o) => (out[o.id] = 0));
  return out;
}
function loadVotes(key: string, opts: { id: string }[]): Record<string, number> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const p = JSON.parse(raw);
      opts.forEach((o) => { if (typeof p[o.id] !== 'number') p[o.id] = 0; });
      return p;
    }
  } catch {}
  return zeroVotes(opts);
}
function loadCompletions(): number {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    if (raw) return parseInt(raw, 10) || 0;
  } catch {}
  return 0;
}

type Screen = 'welcome' | 'q1' | 'q2' | 'result';

function useSounds(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensure = useCallback(() => {
    if (!ctxRef.current) {
      try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AC) ctxRef.current = new AC();
      } catch {}
    }
    return ctxRef.current;
  }, []);
  const beep = useCallback((freq: number, dur: number, delay = 0, type: OscillatorType = 'sine', gain = 0.15) => {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }, [muted, ensure]);
  const tick = useCallback(() => beep(600, 0.08, 0, 'sine', 0.12), [beep]);
  const chime = useCallback(() => { beep(660, 0.12, 0); beep(880, 0.18, 0.1); }, [beep]);
  const fanfare = useCallback(() => {
    beep(523, 0.15, 0);
    beep(659, 0.15, 0.12);
    beep(784, 0.15, 0.24);
    beep(1047, 0.4, 0.36, 'triangle', 0.18);
  }, [beep]);
  return { tick, chime, fanfare };
}

function computePersona(q1: string[], q2: string | null): Persona {
  const traitOrder = ['理性', '共情', '创造', '平衡', '好奇', '不羁'];
  const traitScores: Record<string, number> = {};
  traitOrder.forEach((t) => (traitScores[t] = 0));
  q1.forEach((id) => { const t = TRAIT_MAP[id]; if (t) traitScores[t] += 2; });
  let topTrait = traitOrder[0];
  let topScore = -1;
  for (const t of traitOrder) {
    if (traitScores[t] > topScore) { topScore = traitScores[t]; topTrait = t; }
  }
  const sortedTraits = [...traitOrder].sort((a, b) => traitScores[b] - traitScores[a]);
  const top2 = sortedTraits.slice(0, 2).filter((t) => traitScores[t] > 0);
  if (top2.length < 2) {
    const rest = sortedTraits.filter((t) => !top2.includes(t)).slice(0, 2 - top2.length);
    top2.push(...rest);
  }
  const stance = (q2 && STANCE_MAP[q2]) || '观察派';
  const key = `${topTrait}+${stance}`;
  const persona = PERSONAS[key] || PERSONAS['平衡+观察派'];
  return { ...persona, top2, stance };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [q1Sel, setQ1Sel] = useState<string[]>([]);
  const [q2Sel, setQ2Sel] = useState<string | null>(null);
  const [q1Votes, setQ1Votes] = useState<Record<string, number>>({});
  const [q2Votes, setQ2Votes] = useState<Record<string, number>>({});
  const [completions, setCompletions] = useState(0);
  const [muted, setMuted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [showAggregates, setShowAggregates] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQ1Votes(loadVotes(Q1_KEY, Q1_OPTIONS));
    setQ2Votes(loadVotes(Q2_KEY, Q2_OPTIONS));
    setCompletions(loadCompletions());
    try { setMuted(localStorage.getItem(MUTE_KEY) === 'true'); } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem(MUTE_KEY, String(muted)); } catch {} }, [muted]);

  const sounds = useSounds(muted);

  useEffect(() => {
    if (screen !== 'q1' && screen !== 'q2') return;
    setSecondsLeft(30);
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setSecondsLeft(Math.max(0, 30 - elapsed));
    }, 250);
    return () => clearInterval(id);
  }, [screen]);

  const persona = useMemo(() => computePersona(q1Sel, q2Sel), [q1Sel, q2Sel]);

  const start = () => { setScreen('q1'); };
  const toggleQ1 = (id: string) => {
    sounds.tick();
    setQ1Sel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  const pickQ2 = (id: string) => { sounds.tick(); setQ2Sel(id); };
  const submitQ1 = () => { sounds.chime(); setScreen('q2'); };
  const submitQ2 = () => {
    if (!q2Sel) return;
    const u1 = { ...q1Votes };
    q1Sel.forEach((id) => (u1[id] = (u1[id] || 0) + 1));
    const u2 = { ...q2Votes };
    u2[q2Sel] = (u2[q2Sel] || 0) + 1;
    setQ1Votes(u1); setQ2Votes(u2);
    try {
      localStorage.setItem(Q1_KEY, JSON.stringify(u1));
      localStorage.setItem(Q2_KEY, JSON.stringify(u2));
      const c = completions + 1;
      localStorage.setItem(DONE_KEY, String(c));
      setCompletions(c);
    } catch {}
    sounds.fanfare();
    setScreen('result');
  };
  const retry = () => { setQ1Sel([]); setQ2Sel(null); setShowAggregates(false); setScreen('welcome'); };

  const saveCard = async () => {
    if (!cardRef.current) return;
    try {
      // @ts-ignore - dynamic CDN import
      const mod: any = await import(/* @vite-ignore */ 'https://esm.sh/html-to-image@1.11.13');
      const dataUrl = await mod.toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `HR-AI人格_${persona.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('请长按屏幕截图保存哦～');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
      <BackgroundBlobs />
      <FloatingEmojis />
      <button
        onClick={() => setMuted((m) => !m)}
        className="fixed top-4 right-4 z-40 h-10 w-10 rounded-full bg-white/80 backdrop-blur shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        aria-label="mute toggle"
      >
        {muted ? <VolumeX className="h-5 w-5 text-slate-500" /> : <Volume2 className="h-5 w-5 text-purple-600" />}
      </button>

      <div className="relative z-10 max-w-md md:max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {screen === 'welcome' && <Welcome onStart={start} completions={completions} />}
        {(screen === 'q1' || screen === 'q2') && (
          <QuestionScreen
            step={screen === 'q1' ? 1 : 2}
            secondsLeft={secondsLeft}
            title={screen === 'q1' ? '你认为，HR 和 AI 最理想的协作方式是什么？' : '在 DSO 和 VACC 的背景下，你认为 AI 是否能帮助你更好地完成转型？'}
            hint={screen === 'q1' ? '（可多选）' : ''}
            options={screen === 'q1' ? Q1_OPTIONS : Q2_OPTIONS}
            multi={screen === 'q1'}
            selected={screen === 'q1' ? q1Sel : q2Sel ? [q2Sel] : []}
            onToggle={screen === 'q1' ? toggleQ1 : pickQ2}
            onNext={screen === 'q1' ? submitQ1 : submitQ2}
            canNext={screen === 'q1' ? q1Sel.length > 0 : !!q2Sel}
            nextLabel={screen === 'q1' ? '下一题 →' : '揭晓我的人格 ✨'}
          />
        )}
        {screen === 'result' && (
          <ResultScreen
            persona={persona}
            cardRef={cardRef}
            onSave={saveCard}
            onRetry={retry}
            showAggregates={showAggregates}
            toggleAggregates={() => setShowAggregates((v) => !v)}
            q1Votes={q1Votes}
            q2Votes={q2Votes}
          />
        )}
      </div>
    </div>
  );
}

function BackgroundBlobs() {
  return (
    <>
      <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-pink-300/50 blur-3xl animate-blob1" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-purple-300/50 blur-3xl animate-blob2" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-cyan-300/50 blur-3xl animate-blob3" />
      <div className="pointer-events-none absolute top-10 right-1/3 h-64 w-64 rounded-full bg-yellow-200/60 blur-3xl animate-blob4" />
      <style>{`
        @keyframes blob1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.1); } }
        @keyframes blob2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,40px) scale(0.95); } }
        @keyframes blob3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-30px) scale(1.05); } }
        @keyframes blob4 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,-20px) scale(1.08); } }
        .animate-blob1 { animation: blob1 14s ease-in-out infinite; }
        .animate-blob2 { animation: blob2 16s ease-in-out infinite; }
        .animate-blob3 { animation: blob3 18s ease-in-out infinite; }
        .animate-blob4 { animation: blob4 20s ease-in-out infinite; }
        @keyframes drift { 0% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-20px) rotate(8deg); } 100% { transform: translateY(0) rotate(0); } }
        .animate-drift { animation: drift 6s ease-in-out infinite; }
        @keyframes shakeX { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
        .animate-shake { animation: shakeX 0.4s ease-in-out infinite; }
        @keyframes confettiFall { 0% { transform: translateY(-20px) rotate(0); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        @keyframes bounceIn { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
        .animate-bounce-in { animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </>
  );
}

function FloatingEmojis() {
  const items = [
    { e: '🤖', left: '5%', top: '15%', delay: '0s' },
    { e: '🧠', left: '88%', top: '20%', delay: '1s' },
    { e: '✨', left: '12%', top: '70%', delay: '2s' },
    { e: '💡', left: '85%', top: '75%', delay: '0.5s' },
    { e: '🤝', left: '50%', top: '8%', delay: '1.5s' },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {items.map((it, i) => (
        <div
          key={i}
          className="absolute text-4xl sm:text-5xl opacity-60 animate-drift"
          style={{ left: it.left, top: it.top, animationDelay: it.delay }}
        >
          {it.e}
        </div>
      ))}
    </div>
  );
}

function Welcome({ onStart, completions }: { onStart: () => void; completions: number }) {
  return (
    <div className="text-center pt-8">
      <h1 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4 leading-tight">
        🎭 HR × AI<br />协作人格测试
      </h1>
      <p className="text-base sm:text-lg text-slate-600 mb-10">30 秒，测出你和 AI 的相处姿势</p>
      <button
        onClick={onStart}
        className="inline-flex items-center gap-2 px-10 py-5 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-bold text-xl shadow-2xl hover:scale-105 active:scale-95 transition-transform"
      >
        开始测试 →
      </button>
      <p className="text-sm text-slate-500 mt-8">已有 {completions} 位 HR 完成测试</p>
    </div>
  );
}

function QuestionScreen({
  step, secondsLeft, title, hint, options, multi, selected, onToggle, onNext, canNext, nextLabel,
}: {
  step: number; secondsLeft: number; title: string; hint?: string;
  options: { id: string; label: string }[]; multi?: boolean;
  selected: string[]; onToggle: (id: string) => void; onNext: () => void; canNext: boolean; nextLabel: string;
}) {
  const urgent = secondsLeft <= 5 && secondsLeft > 0;
  const pct = (secondsLeft / 30) * 100;
  const headerEmoji = step === 1 ? '🌱' : '🚀';
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-base sm:text-lg font-bold text-slate-700">第 {step} 关 {headerEmoji}</div>
        <div className={cn('text-sm font-mono tabular-nums', urgent ? 'text-red-500 font-bold' : 'text-slate-500')}>{secondsLeft}s</div>
      </div>
      <div className={cn('h-2 rounded-full bg-white/60 overflow-hidden mb-6 border border-white', urgent && 'animate-shake')}>
        <div
          className={cn('h-full transition-all duration-300', urgent ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="rounded-3xl bg-white/80 backdrop-blur shadow-xl p-6 sm:p-8 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug mb-1">{title}</h2>
        {hint && <p className="text-sm text-slate-500 mb-4">{hint}</p>}
        <div className="space-y-3 mt-5">
          {options.map((opt) => {
            const isSel = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => onToggle(opt.id)}
                className={cn(
                  'w-full text-left p-4 sm:p-5 rounded-3xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                  isSel
                    ? 'border-purple-500 ring-4 ring-purple-200 bg-gradient-to-r from-pink-50 to-purple-50 scale-105 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-purple-300'
                )}
              >
                <span className={cn('text-base sm:text-lg', isSel ? 'font-semibold text-slate-900' : 'text-slate-700')}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={onNext}
        disabled={!canNext}
        className={cn(
          'w-full py-5 rounded-3xl font-bold text-lg transition-all',
          canNext
            ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white shadow-xl hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        )}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function ResultScreen({
  persona, cardRef, onSave, onRetry, showAggregates, toggleAggregates, q1Votes, q2Votes,
}: {
  persona: Persona; cardRef: React.RefObject<HTMLDivElement>;
  onSave: () => void; onRetry: () => void; showAggregates: boolean; toggleAggregates: () => void;
  q1Votes: Record<string, number>; q2Votes: Record<string, number>;
}) {
  return (
    <div>
      <div className="text-center mb-4 text-base sm:text-lg font-bold text-slate-700">结果 🎉</div>
      <Confetti />
      <div
        ref={cardRef}
        className={cn('relative rounded-3xl p-8 shadow-2xl text-white overflow-hidden bg-gradient-to-br animate-bounce-in', persona.gradient)}
      >
        <div className="text-center">
          <div className="text-7xl mb-3">{persona.emoji}</div>
          <div className="text-3xl font-black mb-3 drop-shadow">{persona.name}</div>
          <div className="text-lg text-white/90 mb-5">{persona.desc}</div>
          <div className="flex flex-wrap gap-2 justify-center items-center mb-3">
            <span className="text-xs font-semibold text-white/80">你的特质 TOP 2：</span>
            {persona.top2?.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-white/25 backdrop-blur text-xs font-bold">{t}</span>
            ))}
          </div>
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/25 backdrop-blur text-sm font-bold mb-5">
            你的姿态：{persona.stance}
          </div>
          <div className="rounded-2xl bg-white/20 backdrop-blur p-4 text-left">
            <div className="text-xs font-bold text-white/80 mb-1">🎁 给你的小建议</div>
            <div className="text-sm leading-relaxed">{persona.tip}</div>
          </div>
          <div className="mt-5 text-xs text-white/70 tracking-widest">HR × AI 协作人格测试</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={onSave}
          className="py-4 rounded-3xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          📸 保存我的人格卡
        </button>
        <button
          onClick={onRetry}
          className="py-4 rounded-3xl bg-white text-slate-700 font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform border-2 border-slate-200"
        >
          🔄 再测一次
        </button>
      </div>

      <div className="mt-4">
        <button
          onClick={toggleAggregates}
          className="w-full py-3 rounded-2xl bg-white/70 backdrop-blur text-slate-700 font-semibold hover:bg-white transition-colors"
        >
          📊 看大家都选了什么 {showAggregates ? '▲' : '▼'}
        </button>
        {showAggregates && (
          <div className="mt-3 space-y-4">
            <AggregateBlock title="Q1：理想协作方式" options={Q1_OPTIONS} votes={q1Votes} />
            <AggregateBlock title="Q2：AI 对转型的帮助" options={Q2_OPTIONS} votes={q2Votes} />
          </div>
        )}
      </div>
    </div>
  );
}

function AggregateBlock({ title, options, votes }: { title: string; options: { id: string; label: string }[]; votes: Record<string, number> }) {
  const total = Math.max(1, options.reduce((a, o) => a + (votes[o.id] || 0), 0));
  const max = Math.max(1, ...options.map((o) => votes[o.id] || 0));
  const sorted = [...options].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));
  return (
    <div className="rounded-3xl bg-white/85 backdrop-blur shadow-lg p-5">
      <div className="font-bold text-slate-800 mb-3">{title}</div>
      <div className="space-y-3">
        {sorted.map((opt, idx) => {
          const v = votes[opt.id] || 0;
          const pct = Math.round((v / total) * 100);
          const w = Math.round((v / max) * 100);
          return (
            <div key={opt.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 truncate pr-2">{opt.label}</span>
                <span className="text-slate-500 tabular-nums">{v} · {pct}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${w}%`, transitionDelay: `${idx * 80}ms` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ['#f472b6', '#a78bfa', '#22d3ee', '#fde047', '#fb923c', '#34d399'];
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {pieces.map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 8) * 0.18;
        const dur = 2.5 + (i % 4) * 0.5;
        const c = colors[i % colors.length];
        const size = 6 + (i % 6) + 2;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${left}%`,
              top: '-5%',
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: c,
              animation: `confettiFall ${dur}s linear ${delay}s forwards`,
              transform: `rotate(${(i * 47) % 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
