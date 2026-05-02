import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar'
import OverviewView from './views/OverviewView'
import PatientsView from './views/PatientsView'
import CopingPlansView from './views/CopingPlansView'
import AvailabilityView from './views/AvailabilityView'
import NotificationsView from './views/NotificationsView'
import DataPrivacyView from './views/DataPrivacyView'
import SecurityView from './views/SecurityView'
import AccountView from './views/AccountView'

const SECTION_VIEWS: Record<string, React.ComponentType> = {
  'overview':      OverviewView,
  'patients':      PatientsView,
  'coping-plans':  CopingPlansView,
  'availability':  AvailabilityView,
  'notifications': NotificationsView,
  'data-privacy':  DataPrivacyView,
  'security':      SecurityView,
  'account':       AccountView,
}

function App() {
  const { activeSection } = useStore()
  const ActiveView = SECTION_VIEWS[activeSection] ?? OverviewView

  return (
    <div className="flex h-screen w-full bg-background font-sans overflow-hidden">
      <Sidebar />
      <main className="flex flex-1 overflow-hidden" key={activeSection}>
        <ActiveView />
      </main>
    </div>
  )
}

export default App
