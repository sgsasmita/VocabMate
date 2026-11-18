import { useMemo, useState } from 'react';
import { Check, X, RotateCcw, Target, Trophy, ArrowRight } from 'lucide-react';
import { VOCABULARY, type VocabWord } from '@/data/vocabulary';
import type { AppStore } from '@/hooks/useAppStore';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { PronounceButton } from '@/components/PronounceButton';
import { pickRandom, cn } from '@/lib/utils';

interface PracticePageProps {
  store: AppStore;
}

interface Question {
  word: VocabWord;
  choices: string[];
  answerIndex: number;
}

const QUIZ_LENGTH = 8;

function buildQuiz(): Question[] {
  const pool = pickRandom(VOCABULARY, QUIZ_LENGTH);
  return pool.map((word) => {
    const distractors = pickRandom(
      VOCABULARY.filter((w) => w.id !== word.id),
      3
    ).map((w) => w.meaning);
    const choices = [...distractors, word.meaning];
    // shuffle
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return { word, choices, answerIndex: choices.indexOf(word.meaning) };
  });
}

type Stage = 'intro' | 'playing' | 'done';

export function PracticePage({ store }: PracticePageProps) {
  const [stage, setStage] = useState<Stage>('intro');
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const correctCount = answers.filter(Boolean).length;
  const accuracy = answers.length ? Math.round((correctCount / answers.length) * 100) : 0;

  const start = () => {
    setQuiz(buildQuiz());
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setStage('playing');
  };

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === quiz[index].answerIndex;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);
    if (correct) store.markLearned(quiz[index].word.id);
  };

  const next = () => {
    if (index + 1 >= quiz.length) {
      store.recordQuiz({ total: quiz.length, correct: answers.filter(Boolean).length });
      setStage('done');
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  if (stage === 'intro') {
    return (
      <Intro onStart={start} bestAccuracy={store.quizAccuracy} quizCount={store.state.quizzes.length} />
    );
  }

  if (stage === 'done') {
    return (
      <Result
        total={quiz.length}
        correct={correctCount}
        accuracy={accuracy}
        onRetry={start}
        onBack={() => setStage('intro')}
      />
    );
  }

  const q = quiz[index];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Practice Quiz</h1>
          <p className="text-sm text-plum-500">Question {index + 1} of {quiz.length}</p>
        </div>
        <Badge className="bg-butter-300/50 text-plum-700">Score: {correctCount}/{answers.length}</Badge>
      </div>

      <ProgressBar value={(index + (selected !== null ? 1 : 0)) / quiz.length * 100} colorClass="bg-plum-600" />

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <Badge className="bg-lavender-200 text-plum-700">{q.word.category}</Badge>
          <PronounceButton text={q.word.word} label="Hear" />
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-plum-400">What does this word mean?</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-plum-800">{q.word.word}</h2>
          <p className="mt-1 text-sm text-plum-400">{q.word.phonetic} · <span className="italic">{q.word.partOfSpeech}</span></p>
        </div>

        <div className="mt-6 space-y-2.5">
          {q.choices.map((choice, i) => {
            const isAnswer = i === q.answerIndex;
            const isChosen = selected === i;
            const reveal = selected !== null;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={reveal}
                className={cn(
                  'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all',
                  !reveal && 'border-lavender-200 bg-white text-plum-700 hover:border-plum-400 hover:bg-lavender-100/50',
                  reveal && isAnswer && 'border-plum-600 bg-plum-700 text-ivory',
                  reveal && isChosen && !isAnswer && 'border-peach-300 bg-peach-100 text-plum-800',
                  reveal && !isAnswer && !isChosen && 'border-lavender-100 bg-ivory text-plum-400 opacity-70'
                )}
              >
                <span>{choice}</span>
                {reveal && isAnswer && <Check className="h-4 w-4" />}
                {reveal && isChosen && !isAnswer && <X className="h-4 w-4" />}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-5 animate-fadeIn">
            <div className={cn(
              'rounded-2xl px-4 py-3 text-sm',
              selected === q.answerIndex ? 'bg-lavender-100 text-plum-700' : 'bg-peach-100 text-plum-700'
            )}>
              <p className="font-semibold">{selected === q.answerIndex ? 'Correct!' : 'Not quite.'}</p>
              <p className="mt-1 italic">"{q.word.example}"</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>
                {index + 1 >= quiz.length ? 'See results' : 'Next'} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Intro({ onStart, bestAccuracy, quizCount }: { onStart: () => void; bestAccuracy: number; quizCount: number }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-plum-700 text-butter-300 shadow-card">
        <Target className="h-7 w-7" />
      </div>
      <h1 className="mt-5 font-serif text-3xl font-semibold sm:text-4xl">Practice Quiz</h1>
      <p className="mt-2 text-plum-500">Test your vocabulary with {QUIZ_LENGTH} multiple-choice questions. Get instant feedback and track your accuracy over time.</p>

      {quizCount > 0 && (
        <Card className="mt-6 inline-flex items-center gap-4 px-6 py-4">
          <Trophy className="h-5 w-5 text-butter-400" />
          <div className="text-left">
            <div className="text-xs uppercase tracking-widest text-plum-400">Best accuracy</div>
            <div className="font-serif text-2xl font-semibold text-plum-800">{bestAccuracy}%</div>
          </div>
          <div className="h-8 w-px bg-lavender-200" />
          <div className="text-left">
            <div className="text-xs uppercase tracking-widest text-plum-400">Quizzes taken</div>
            <div className="font-serif text-2xl font-semibold text-plum-800">{quizCount}</div>
          </div>
        </Card>
      )}

      <div className="mt-8">
        <Button size="lg" onClick={onStart}><Target className="h-4 w-4" /> Start quiz</Button>
      </div>
    </div>
  );
}

function Result({ total, correct, accuracy, onRetry, onBack }: { total: number; correct: number; accuracy: number; onRetry: () => void; onBack: () => void }) {
  const message = accuracy >= 80 ? 'Excellent work!' : accuracy >= 50 ? 'Good effort — keep going!' : 'Practice makes progress. Try again!';
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-butter-300 text-plum-800 shadow-card animate-fadeInScale">
        <Trophy className="h-7 w-7" />
      </div>
      <h1 className="mt-5 font-serif text-3xl font-semibold sm:text-4xl">{message}</h1>
      <Card className="mt-6 p-8">
        <div className="font-serif text-6xl font-semibold text-plum-800">{accuracy}%</div>
        <p className="mt-2 text-plum-500">You answered {correct} of {total} correctly.</p>
        <ProgressBar value={accuracy} className="mt-5" colorClass="bg-butter-400" />
      </Card>
      <div className="mt-8 flex justify-center gap-3">
        <Button size="lg" onClick={onRetry}><RotateCcw className="h-4 w-4" /> Retry</Button>
        <Button size="lg" variant="secondary" onClick={onBack}>Back to intro</Button>
      </div>
    </div>
  );
}
