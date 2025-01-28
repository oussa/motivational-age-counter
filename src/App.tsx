import React, { useEffect, useState } from 'react';
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"

interface AppProps {}

interface Settings {
  text: string;
  backgroundColor: string;
  mainTextColor: string;
  theme: 'light' | 'dark' | 'random';
  decimalDigits: number;
  tabName: string;
}

const themes = {
  light: {
    backgroundColor: '#FFFFFF',
    mainTextColor: '#000000'
  },
  dark: {
    backgroundColor: '#1F1F1F',
    mainTextColor: '#DFDFDF'
  }
};

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

const SettingsPopup: React.FC<{
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
  onChangeBirthday: () => void;
}> = ({ settings, onSave, onClose, onChangeBirthday }) => {
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

  const inputStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    padding: '0.3rem',
    marginBottom: '0.6rem',
    width: '100%',
    textAlign: 'left',
    boxSizing: 'border-box',
    background: '#FFFFFF',
    color: '#000000',
    border: '1px solid #CCCCCC',
  };

  const settingsPopupStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '80px',
    left: '20px',
    background: '#FAF7F5',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    zIndex: 1000,
    color: '#000000',
    width: '250px',
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
    fontSize: '0.85rem',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  };

  return (
    <>
      <style>
        {`
          .hover-underline:hover {
            text-decoration: underline !important;
          }
          .save-button:hover {
            opacity: 0.85;
            transform: translateY(-1px);
            transition: all 0.2s ease;
          }
        `}
      </style>
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
          <div className="flex gap-2">
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
          <div className="flex gap-2">
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
              max="10"
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
    </>
  );
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
    console.log('Saving date:', date);
    chrome.storage.local.set({ 
      birthday: date,
      showBirthdayInput: false 
    }, () => {
      console.log('Birthday saved:', date);
      setBirthday(date);
      setShowBirthdayInput(false);
    });
  };

  const handleSettingsSave = (newSettings: Settings) => {
    chrome.storage.local.set({ settings: newSettings }, () => {
      setSettings(newSettings);
    });
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    background: 'transparent',
    width: '100%',
    maxWidth: '1100px',
    fontFamily: '-apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  };

  const inputStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    padding: '0.5rem',
    marginBottom: '1rem',
    width: '200px',
    textAlign: 'center',
    display: 'block',
  };

  const settingsButtonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    fontSize: '1rem',
    padding: '0.5rem',
    backgroundColor: 'transparent',
    color: settings.mainTextColor,
    border: 'none',
    cursor: 'pointer',
    zIndex: 100,
    textDecoration: 'none',
  };

  const ageStyle: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginTop: '1rem',
    color: settings.mainTextColor,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    width: '400px',
    textAlign: 'center',
    letterSpacing: '2px',
  };

  const saveButtonStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    padding: '0.5rem 2rem',
    backgroundColor: '#007AFF',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'block',
    width: '200px',
    margin: '1rem auto 0',
  };

  if (!birthday || showBirthdayInput) {
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-screen p-8 w-full max-w-7xl mx-auto"
        style={{ 
          backgroundColor: settings.backgroundColor,
          color: settings.mainTextColor 
        }}
      >
        <h1 className="text-4xl font-bold mb-8" style={{ color: settings.mainTextColor }}>
          Welcome to Age Counter
        </h1>
        <div className="text-lg mb-6 text-center" style={{ color: settings.mainTextColor }}>
          Please enter your birthday to get started
        </div>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
            const date = input?.value;
            if (date) {
              handleSave(date);
            }
          }}
          className="flex flex-col items-center gap-6 max-w-xs"
        >
          <div className="w-40">
            <input
              type="date"
              defaultValue={birthday || undefined}
              className="flex h-11 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: settings.backgroundColor,
                color: settings.mainTextColor,
                borderColor: settings.mainTextColor + '40'
              }}
            />
          </div>
          <Button
            type="submit"
            className="w-40 h-11 text-base font-medium"
            style={{
              backgroundColor: settings.mainTextColor,
              color: settings.backgroundColor
            }}
          >
            Continue
          </Button>
        </form>
      </div>
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
      <div className="text-5xl mb-2 tracking-wide text-center font-bold" style={{ color: settings.mainTextColor }}>
        {settings.text}
      </div>
      <div className="text-5xl font-bold mt-4 font-mono w-[400px] text-center tracking-wider" style={{ color: settings.mainTextColor }}>
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
