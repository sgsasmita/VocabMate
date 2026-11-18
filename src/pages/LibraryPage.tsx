import { useMemo, useState } from 'react';
import { Search, Bookmark, BookmarkCheck, CheckCircle2, X, BookOpen } from 'lucide-react';
import { VOCABULARY, type Category, type VocabWord } from '@/data/vocabulary';
import type { AppStore } from '@/hooks/useAppStore';
import { Card, Badge, Button } from '@/components/ui';
import { PronounceButton } from '@/components/PronounceButton';
import { cn } from '@/lib/utils';

const CATEGORIES: Array<'All' | Category> = ['All', 'Everyday', 'Professional', 'Emotions', 'Advanced'];

interface LibraryPageProps {
  store: AppStore;
}

export function LibraryPage({ store }: LibraryPageProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | Category>('All');
  const [filter, setFilter] = useState<'all' | 'saved' | 'learned'>('all');
  const [selected, setSelected] = useState<VocabWord | null>(null);

  const words = useMemo(() => {
    return VOCABULARY.filter((w) => {
      if (category !== 'All' && w.category !== category) return false;
      if (filter === 'saved' && !store.wordProgress[w.id]?.saved) return false;
      if (filter === 'learned' && !store.wordProgress[w.id]?.learned) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          w.word.toLowerCase().includes(q) ||
          w.meaning.toLowerCase().includes(q) ||
          w.example.toLowerCase().includes(q) ||
          w.synonyms.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [category, filter, query, store.wordProgress]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Vocabulary Library</h1>
          <p className="mt-1 text-plum-500">
            {VOCABULARY.length} curated words · {store.totalLearned} learned · {store.totalSaved} saved
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words, meanings, examples…"
            className="w-full rounded-2xl border border-lavender-200 bg-white py-3 pl-11 pr-4 text-sm text-plum-800 placeholder:text-plum-300 shadow-soft focus:border-plum-400 focus:outline-none focus:ring-2 focus:ring-plum-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-all',
                category === c ? 'bg-plum-700 text-ivory shadow-soft' : 'bg-white text-plum-600 border border-lavender-200 hover:bg-lavender-100'
              )}
            >
              {c}
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-lavender-200" />
          {([
            ['all', 'All'],
            ['saved', 'Saved'],
            ['learned', 'Learned'],
          ] as const).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-all',
                filter === f ? 'bg-lavender-300 text-plum-800' : 'text-plum-500 hover:bg-lavender-100'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {words.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-plum-300" />
          <p className="mt-3 text-plum-500">No words match your search. Try a different term or filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((w) => {
            const prog = store.wordProgress[w.id];
            const saved = prog?.saved ?? false;
            const learned = prog?.learned ?? false;
            return (
              <Card key={w.id} className="group p-5" onClick={() => setSelected(w)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-plum-800">{w.word}</h3>
                    <div className="mt-0.5 text-xs text-plum-400">
                      {w.phonetic} · <span className="italic">{w.partOfSpeech}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        store.toggleSaved(w.id);
                      }}
                      title={saved ? 'Remove from saved' : 'Save word'}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                        saved ? 'bg-butter-300 text-plum-800' : 'text-plum-300 hover:bg-lavender-100 hover:text-plum-500'
                      )}
                    >
                      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-plum-700 line-clamp-2">{w.meaning}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge className="bg-lavender-100 text-plum-600">{w.category}</Badge>
                  {learned && (
                    <Badge className="bg-plum-700 text-ivory">
                      <CheckCircle2 className="h-3 w-3" /> Learned
                    </Badge>
                  )}
                  <PronounceButton text={w.word} label="Hear" className="ml-auto" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <WordDetailModal
          word={selected}
          learned={store.wordProgress[selected.id]?.learned ?? false}
          saved={store.wordProgress[selected.id]?.saved ?? false}
          onClose={() => setSelected(null)}
          onToggleSave={() => store.toggleSaved(selected.id)}
          onMarkLearned={() => store.markLearned(selected.id)}
        />
      )}
    </div>
  );
}

function WordDetailModal({
  word,
  learned,
  saved,
  onClose,
  onToggleSave,
  onMarkLearned,
}: {
  word: VocabWord;
  learned: boolean;
  saved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
  onMarkLearned: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-plum-900/40 p-0 backdrop-blur-sm animate-fadeIn sm:items-center sm:p-6" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-4xl bg-ivory p-6 shadow-lift animate-fadeInScale sm:rounded-4xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="font-serif text-3xl font-semibold text-plum-800">{word.word}</h2>
              <span className="text-sm text-plum-400">{word.phonetic}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge className="bg-lavender-200 text-plum-700">{word.category}</Badge>
              <span className="text-xs italic text-plum-400">{word.partOfSpeech}</span>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-plum-400 hover:bg-lavender-100 hover:text-plum-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-plum-400">Meaning</h3>
            <p className="mt-1 text-plum-700 leading-relaxed">{word.meaning}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-plum-400">Example</h3>
            <p className="mt-1 rounded-2xl bg-lavender-100/70 px-4 py-3 text-sm italic text-plum-700">"{word.example}"</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-plum-400">Synonyms</h3>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {word.synonyms.map((s) => (
                <span key={s} className="rounded-full bg-butter-300/50 px-3 py-1 text-xs font-semibold text-plum-700">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PronounceButton text={word.word} label="Pronounce" />
          <Button variant={saved ? 'accent' : 'secondary'} size="sm" onClick={onToggleSave}>
            {saved ? <><BookmarkCheck className="h-4 w-4" /> Saved</> : <><Bookmark className="h-4 w-4" /> Save</>}
          </Button>
          <Button
            variant={learned ? 'ghost' : 'primary'}
            size="sm"
            onClick={onMarkLearned}
            disabled={learned}
            className="ml-auto"
          >
            {learned ? <><CheckCircle2 className="h-4 w-4" /> Learned</> : 'Mark as learned'}
          </Button>
        </div>
      </div>
    </div>
  );
}
