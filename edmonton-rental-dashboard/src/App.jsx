import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Map from './components/Map';
import FilterControls from './components/FilterControls';
import RightPanel from './components/RightPanel';

function App() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 relative">
          <Map />
          <FilterControls />
          <RightPanel />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
