import { useEffect, useState } from 'react';
import { AppShell, type PageId } from '@/components/AppShell';
import { useAppStore } from '@/hooks/useAppStore';
import { HomePage } from '@/pages/HomePage';
import { TutorPage } from '@/pages/TutorPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { PracticePage } from '@/pages/PracticePage';
import { ProgressPage } from '@/pages/ProgressPage';

function pageFromHash(): PageId {
  const h = window.location.hash.replace('#/', '').replace('#', '') as PageId;
  const valid: PageId[] = ['home', 'tutor', 'library', 'practice', 'progress'];
  return valid.includes(h) ? h : 'home';
}

export default function App() {
  const store = useAppStore();
  const [page, setPage] = useState<PageId>(() => pageFromHash());

  useEffect(() => {
    store.ensureStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (p: PageId) => {
    window.location.hash = `/${p}`;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell current={page} onNavigate={navigate} streak={store.state.streak}>
      {page === 'home' && <HomePage store={store} onNavigate={navigate} />}
      {page === 'tutor' && <TutorPage store={store} />}
      {page === 'library' && <LibraryPage store={store} />}
      {page === 'practice' && <PracticePage store={store} />}
      {page === 'progress' && <ProgressPage store={store} />}
    </AppShell>
  );
}
