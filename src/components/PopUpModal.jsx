import React, { useState } from 'react';
import PopUpAbout from './buttons/About';

const PopUpModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('WhatIs'); // Manage the active tab

  if (!isOpen) return null; // Render nothing if modal is not open

  const renderTabContent = () => {
    switch (activeTab) {
      case 'WhatIs':
        return (
          <div>
            <h2 className="text-xl font-fc text-green-200">What Is Bring?</h2>
            <p className="mt-4 font-fc text-neutral-300">Billions bringer thingy in the internet</p>
          </div>
        );
      case 'HowWorks':
        return (
          <div>
            <h2 className="text-xl font-fc text-green-200">How It Works</h2>
            <p className="mt-4 font-fc text-neutral-300">Pretty simple</p>
          </div>
        );
      case 'Team':
        return (
          <div>
            <h2 className="text-xl font-fc text-green-200">Team</h2>
            <p className="mt-4 font-fc text-neutral-300">Mike Dobbs and rest</p>
          </div>
        );
      case 'WhyNow':
        return (
          <div>
            <h2 className="text-xl font-fc text-green-200">Why Now?</h2>
            <p className="mt-4 font-fc text-neutral-300">To bring billions onchain</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-wrapper">
      <div className="modal bg-slate-950/60 p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 max-w-2xl mx-auto">
        <div className="tabs flex justify-around border-b border-neutral-700 pb-2">
          <button
            onClick={() => setActiveTab('WhatIs')}
            className={`font-fc px-4 py-2 ${
              activeTab === 'WhatIs'
                ? 'text-green-200 border-b-2 border-green-500'
                : 'text-neutral-400'
            }`}>
            What Is
          </button>
          <button
            onClick={() => setActiveTab('HowWorks')}
            className={`font-fc px-4 py-2 ${
              activeTab === 'HowWorks'
                ? 'text-green-200 border-b-2 border-green-500'
                : 'text-neutral-400'
            }`}>
            How It Works
          </button>
          <button
            onClick={() => setActiveTab('Team')}
            className={`font-fc px-4 py-2 ${
              activeTab === 'Team'
                ? 'text-green-200 border-b-2 border-green-500'
                : 'text-neutral-400'
            }`}>
            Team
          </button>
          <button
            onClick={() => setActiveTab('WhyNow')}
            className={`font-fc px-4 py-2 ${
              activeTab === 'WhyNow'
                ? 'text-green-200 border-b-2 border-green-500'
                : 'text-neutral-400'
            }`}>
            Why Now
          </button>
        </div>

        <div className="content mt-6">{renderTabContent()}</div>

        <div className="pt-6">
          <PopUpAbout name="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default PopUpModal;
