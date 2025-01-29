import React, { useEffect, useState } from 'react';
import { Button } from "./components/ui/button"
import { Settings, themes } from './types';
import { SettingsPopup } from './components/SettingsPopup';
import { BirthdayInput } from './components/BirthdayInput';

interface AppProps {}

const getRandomTheme = () => {
  // Convert HSL to RGB
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Generate a random color in HSL then convert to hex
  const getRandomColor = (isBackground: boolean) => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 30) + 70; // 70-100% saturation for vibrant colors
    // Different lightness ranges for background and text to ensure contrast
    const l = isBackground 
      ? Math.floor(Math.random() * 30) + 15  // 15-45% lightness for darker backgrounds
      : Math.floor(Math.random() * 20) + 80; // 80-100% lightness for lighter text
    return hslToHex(h, s, l);
  };

  const bg = getRandomColor(true);   // Generate dark background
  const main = getRandomColor(false); // Generate light text color

  return { bg, main };
};

const defaultSettings: Settings = {
  text: 'Make every moment count!',
  backgroundColor: themes.dark.backgroundColor,
  mainTextColor: themes.dark.mainTextColor,
  theme: 'dark',
  decimalDigits: 10,
  tabName: 'Motivational Age Counter'
};

export const App: React.FC<AppProps> = () => {
  const [birthday, setBirthday] = useState<string | null>(null);
  const [age, setAge] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showBirthdayInput, setShowBirthdayInput] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    // Load birthday and settings from storage
    chrome.storage.local.get(['birthday', 'settings', 'showBirthdayInput'], (result) => {
      if (result.birthday) {
        setBirthday(result.birthday);
      }
      if (result.settings) {
        setSettings(result.settings);
      }
      if (result.showBirthdayInput) {
        setShowBirthdayInput(true);
      }
    });

    // Update body background color and tab title
    document.body.style.backgroundColor = settings.backgroundColor;
    if (settings.tabName) {
      document.title = settings.tabName;
    }
  }, [settings]);

  useEffect(() => {
    if (birthday) {
      const updateAge = () => {
        const birthDate = new Date(birthday);
        const now = new Date();
        const ageInYears = (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        setAge(ageInYears.toFixed(settings.decimalDigits));
      };

      updateAge();
      const interval = setInterval(updateAge, 50);

      return () => clearInterval(interval);
    }
  }, [birthday, settings.decimalDigits]);

  const handleSave = (date: string) => {
    chrome.storage.local.set({ 
      birthday: date,
      showBirthdayInput: false 
    }, () => {
      setBirthday(date);
      setShowBirthdayInput(false);
    });
  };

  const handleSettingsSave = (newSettings: Settings) => {
    chrome.storage.local.set({ settings: newSettings }, () => {
      setSettings(newSettings);
    });
  };

  if (!birthday || showBirthdayInput) {
    return (
      <BirthdayInput
        birthday={birthday}
        settings={settings}
        onSave={handleSave}
      />
    );
  }

  return (
    <div 
      className="flex flex-col items-center p-8 w-full max-w-7xl font-sans"
      style={{ 
        backgroundColor: settings.backgroundColor,
        color: settings.mainTextColor 
      }}
    >
      <div className="text-[4em] mb-2 text-center font-bold tracking-[3px] leading-normal" style={{ color: settings.mainTextColor }}>
        {settings.text}
      </div>
      <div className="text-[4em] font-bold mt-4 font-mono text-center tracking-wider" style={{ color: settings.mainTextColor }}>
        {age}
      </div>
      <Button
        id="settings-button"
        variant="link"
        className="fixed bottom-5 left-5 p-0"
        style={{ color: settings.mainTextColor }}
        onClick={() => setShowSettings(!showSettings)}
      >
        Settings
      </Button>
      {showSettings && (
        <SettingsPopup
          settings={settings}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
          onChangeBirthday={() => {
            chrome.storage.local.set({ showBirthdayInput: true }, () => {
              setShowBirthdayInput(true);
              setShowSettings(false);
            });
          }}
        />
      )}
    </div>
  );
};
