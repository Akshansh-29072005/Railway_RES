import React, { useState } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategoryFilter from './components/CategoryFilter';
import ApiExplorer from './components/ApiExplorer';
import RouteMatrix from './components/RouteMatrix';
import ArchitectureShowcase from './components/ArchitectureShowcase';
import SecurityNotice from './components/SecurityNotice';
import VisualizeMap from './components/VisualizeMap';
import StationDisplay from './components/StationDisplay';
import ControlRoomView from './components/ControlRoomView';
import PassengerAppView from './components/PassengerAppView';
import B2BWebhookView from './components/B2BWebhookView';
import Footer from './components/Footer';

export default function App() {
  const [activeNav, setActiveNav] = useState('api-console');
  const [activeCategory, setActiveCategory] = useState('all');
  const [trainNo, setTrainNo] = useState('22436');

  const handleOpenAuth = () => {
    alert('CRIS Enterprise OAuth2 & mTLS Portal:\n\nPlease present client certificate signed by CRIS Root CA.\nEndpoint: https://auth.telemetry.cris.org.in/oauth/v2/token');
  };

  const handleDownloadDocs = () => {
    const docData = {
      openapi: "3.1.0",
      info: {
        title: "Indian Railways RES Telemetry API",
        version: "2.4.0",
        description: "Official CRIS & IRCTC Enterprise Gateway"
      }
    };
    const blob = new Blob([JSON.stringify(docData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi-cris-res-v2.4.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Full-screen views (no footer, no hero)
  const fullScreenViews = ['visualize', 'station-ntes', 'control-room', 'passenger-app', 'b2b-webhooks'];
  const isFullScreen = fullScreenViews.includes(activeNav);

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
      <Header activeNav={activeNav} setActiveNav={setActiveNav} />

      <main className="w-full pt-[144px] bg-surface min-h-[calc(100vh-140px)] flex-1">
        {activeNav === 'visualize' && <VisualizeMap />}
        {activeNav === 'station-ntes' && <StationDisplay />}
        {activeNav === 'control-room' && <ControlRoomView />}
        {activeNav === 'passenger-app' && <PassengerAppView />}
        {activeNav === 'b2b-webhooks' && <B2BWebhookView />}
        
        {!isFullScreen && (
          <div className="flex flex-col w-full">
            <HeroBanner onOpenAuth={handleOpenAuth} onDownloadDocs={handleDownloadDocs} />
            
            <CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

            <ApiExplorer trainNo={trainNo} setTrainNo={setTrainNo} />

            <div className="w-full px-margin-edge">
              <div className="max-w-7xl mx-auto flex flex-col">
                <RouteMatrix trainNo={trainNo} />
                <ArchitectureShowcase />
                <SecurityNotice />
              </div>
            </div>
          </div>
        )}
      </main>

      {!isFullScreen && <Footer />}
    </div>
  );
}
