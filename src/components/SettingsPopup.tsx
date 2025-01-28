import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Settings, themes } from '../types';
import { getRandomTheme } from '../lib/utils';

interface SettingsPopupProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
  onChangeBirthday: () => void;
}

export const SettingsPopup: React.FC<SettingsPopupProps> = ({ 
  settings, 
  onSave, 
  onClose, 
  onChangeBirthday 
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const popup = document.getElementById('settings-popup');
      const settingsButton = document.getElementById('settings-button');
      if (popup && !popup.contains(event.target as Node) && 
          settingsButton && !settingsButton.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleChange = (key: keyof Settings, value: string) => {
    let newSettings = { ...localSettings, [key]: value };

    if (key === 'theme') {
      if (value === 'light') {
        newSettings = {
          ...newSettings,
          backgroundColor: themes.light.backgroundColor,
          mainTextColor: themes.light.mainTextColor,
        };
      } else if (value === 'dark') {
        newSettings = {
          ...newSettings,
          backgroundColor: themes.dark.backgroundColor,
          mainTextColor: themes.dark.mainTextColor,
        };
      } else if (value === 'random') {
        const randomTheme = getRandomTheme();
        newSettings = {
          ...newSettings,
          backgroundColor: randomTheme.bg,
          mainTextColor: randomTheme.main,
        };
      }
      // Immediately save theme changes
      onSave(newSettings);
    }

    setLocalSettings(newSettings);
  };

  return (
    <div id="settings-popup" className="fixed bottom-20 left-5 bg-white p-4 rounded-lg shadow-lg z-50 w-64 max-h-[calc(100vh-120px)] overflow-y-auto text-sm">
      <h2 className="m-0 mb-3 text-base font-medium text-neutral-900">Customize Text</h2>
      
      <div className="mb-3">
        <label className="block mb-1 text-sm text-neutral-800">Tab Name</label>
        <Input
          type="text"
          value={localSettings.tabName}
          onChange={(e) => handleChange('tabName', e.target.value)}
          className="bg-white text-neutral-900"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm text-neutral-800">Text</label>
        <Input
          type="text"
          value={localSettings.text}
          onChange={(e) => handleChange('text', e.target.value)}
          className="bg-white text-neutral-900"
        />
      </div>

      <h2 className="my-3 text-base font-medium text-neutral-900">Customize Colors</h2>
      
      <div className="mb-3">
        <label className="block mb-1 text-sm text-neutral-800">Theme</label>
        <div className="flex gap-2 mb-3">
          {['light', 'dark', 'random'].map((theme) => (
            <Button
              key={theme}
              variant={localSettings.theme === theme ? "default" : "outline"}
              onClick={() => handleChange('theme', theme)}
              className={
                theme === 'light' ? 'bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-100' :
                theme === 'dark' ? 'bg-neutral-900 text-white border-neutral-700 hover:bg-neutral-800' :
                'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:opacity-90'
              }
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm text-neutral-800">Background color</label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={localSettings.backgroundColor}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
            className="bg-white text-neutral-900"
          />
          <input
            type="color"
            value={localSettings.backgroundColor}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
            className="w-10 p-0 cursor-pointer"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm text-neutral-800">Main text color</label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={localSettings.mainTextColor}
            onChange={(e) => handleChange('mainTextColor', e.target.value)}
            className="bg-white text-neutral-900"
          />
          <input
            type="color"
            value={localSettings.mainTextColor}
            onChange={(e) => handleChange('mainTextColor', e.target.value)}
            className="w-10 p-0 cursor-pointer"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm text-neutral-800">Decimal Digits</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="8"
            max="12"
            value={localSettings.decimalDigits}
            onChange={(e) => handleChange('decimalDigits', e.target.value)}
            className="flex-1"
          />
          <span className="text-sm text-neutral-900 min-w-[24px]">
            {localSettings.decimalDigits}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={() => {
            onSave(localSettings);
            onClose();
          }}
        >
          Save Preferences
        </Button>

        <Button
          variant="ghost"
          onClick={onChangeBirthday}
          className="text-blue-500 hover:text-blue-600"
        >
          Change Birthday
        </Button>
      </div>

      <div className="text-center mt-5 text-sm text-neutral-500">
        <a 
          href="https://oussama.io" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-neutral-500 hover:underline"
        >
          Created by Oussama.io
        </a>
      </div>
    </div>
  );
};
