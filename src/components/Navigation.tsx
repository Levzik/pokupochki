import React from 'react';

export const TabSwitch: React.FC<{
  currentSection: 'main' | 'daily';
  onChange: (section: 'main' | 'daily') => void;
}> = ({ currentSection, onChange }) => {
  const isMain = currentSection === 'main';

  return (
    <div className="relative inline-flex p-1 rounded-full bg-[#EDE6DC]/85 border border-stone-200/60 shadow-inner w-full sm:w-[320px] select-none">
      {/* 
        Smooth Sliding Spring Capsule Background 
        Moves seamlessly between "Главные" and "Каждоднев"
      */}
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-b from-[#FED766] to-[#FDBF3B] shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
        style={{
          transform: isMain ? 'translateX(0px)' : 'translateX(calc(100%))'
        }}
      />

      <button
        type="button"
        onClick={() => onChange('main')}
        className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-full text-sm font-bold transition-colors duration-200 text-center ${
          isMain ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        Главные
      </button>

      <button
        type="button"
        onClick={() => onChange('daily')}
        className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-full text-sm font-bold transition-colors duration-200 text-center ${
          !isMain ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        Каждоднев
      </button>
    </div>
  );
};

/**
 * Mobile Bottom Switcher: replaces legacy 3-tab bottom bar with
 * thumb-friendly "Главные" and "Каждоднев" floating capsule pill.
 */
export const MobileBottomSectionNav: React.FC<{
  currentSection: 'main' | 'daily';
  onChange: (section: 'main' | 'daily') => void;
}> = ({ currentSection, onChange }) => {
  const isMain = currentSection === 'main';

  return (
    <div className="sm:hidden fixed bottom-4 inset-x-4 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-stone-200/90 shadow-xl flex items-center w-full max-w-xs transition-all">
        <button
          type="button"
          onClick={() => onChange('main')}
          className={`flex-1 py-2.5 rounded-full text-xs font-black transition-all text-center ${
            isMain
              ? 'bg-[#FED766] text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Главные
        </button>
        <button
          type="button"
          onClick={() => onChange('daily')}
          className={`flex-1 py-2.5 rounded-full text-xs font-black transition-all text-center ${
            !isMain
              ? 'bg-[#FED766] text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Каждоднев
        </button>
      </div>
    </div>
  );
};
