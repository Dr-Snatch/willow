import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useUserStore } from './store/useUser';
import { useCheckInStore } from './store/useCheckIn';
import { useStreakStore } from './store/useStreak';
import ChatView from './views/ChatView';
import CheckInView from './views/CheckInView';
import CrisisView from './views/CrisisView';
import OnboardingView from './views/OnboardingView';
import TrendsView from './views/TrendsView';
import ToolkitView from './views/ToolkitView';
import ProfileView from './views/ProfileView';
import RemindersView from './views/RemindersView';
import Nav from './components/Nav';

const RequireCheckIn = () => {
  const { hasCheckedInToday } = useCheckInStore();
  const { pathname } = useLocation();
  if (!hasCheckedInToday() && pathname !== '/check-in') {
    return <Navigate to="/check-in" replace />;
  }
  return <Outlet />;
};

function AppShell() {
  const { hasOnboarded } = useUserStore();
  const { hasCheckedInToday } = useCheckInStore();
  const { checkDecay } = useStreakStore();

  useEffect(() => { checkDecay(); }, [checkDecay]);

  if (!hasOnboarded) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingView />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background font-sans">
      <Nav />
      <main className="flex flex-1 overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={<Navigate to={hasCheckedInToday() ? '/chat' : '/check-in'} replace />}
          />
          <Route path="/check-in" element={<CheckInView />} />
          <Route path="/crisis" element={<CrisisView />} />
          <Route element={<RequireCheckIn />}>
            <Route path="/chat" element={<ChatView />} />
            <Route path="/trends" element={<TrendsView />} />
            <Route path="/toolkit" element={<ToolkitView />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/reminders" element={<RemindersView />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
