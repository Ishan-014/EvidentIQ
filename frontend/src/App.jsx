import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import FeatureGrid from './components/FeatureGrid';
import SplineShowcaseSection from './components/SplineShowcaseSection';
import OrbitalIntegrations from './components/OrbitalIntegrations';
import UseCases from './components/UseCases';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import WorkspaceModal from './components/WorkspaceModal';
import MagneticCursor from './components/MagneticCursor';

export default function App() {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [workspaceTarget, setWorkspaceTarget] = useState('EMP001');
  const [workspaceTab, setWorkspaceTab] = useState('overview');

  const handleOpenWorkspace = (target = 'EMP001', tab = 'overview') => {
    if (target === 'what-if' || target === 'ai-coach' || target === 'overview') {
      setWorkspaceTab(target);
      setWorkspaceTarget('EMP001');
    } else {
      setWorkspaceTarget(target);
      setWorkspaceTab(tab);
    }
    setIsWorkspaceOpen(true);
  };

  const handleCloseWorkspace = () => {
    setIsWorkspaceOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Premium Magnetic Cursor — site-wide 3D hover effect */}
      <MagneticCursor />
      <Navbar onOpenWorkspace={() => handleOpenWorkspace('EMP001')} />

      {/* Main Page Flow Matching Screenshots */}
      <main>
        {/* 1. Hero with Interactive Showcase & Spline 3D Area */}
        <Hero 
          onOpenWorkspace={(target) => handleOpenWorkspace(target)} 
          onSelectEmployee={(empId) => setWorkspaceTarget(empId)}
        />

        {/* 2. 4-Step Interactive Pipeline ("It doesn't just answer. It does the work.") */}
        <HowItWorks onOpenWorkspace={() => handleOpenWorkspace('EMP001')} />

        {/* 3. Feature Highlights ("Ask. Automate. Build.") & What-If Simulation */}
        <FeatureGrid onOpenWorkspace={(target) => handleOpenWorkspace(target)} />

        {/* 4. Dedicated Spline 3D Polyhedra Engine Showcase */}
        <SplineShowcaseSection onOpenWorkspace={(target) => handleOpenWorkspace(target)} />

        {/* 5. Orbital Integrations Dark Section with Central 3D Core */}
        <OrbitalIntegrations />

        {/* 6. Team Use Cases ("Make your company 10x faster") */}
        <UseCases onOpenWorkspace={() => handleOpenWorkspace('EMP001')} />

        {/* 7. Testimonials ("Users love us. But don't take it from us.") */}
        <Testimonials />
      </main>

      {/* Footer */}
      <Footer onOpenWorkspace={() => handleOpenWorkspace('EMP001')} />

      {/* Interactive EvidentIQ Live Talent Intelligence Workspace Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={handleCloseWorkspace}
        initialEmployeeId={workspaceTarget}
        initialTab={workspaceTab}
      />
    </div>
  );
}
