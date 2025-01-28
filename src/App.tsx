import React, { useEffect, useState } from 'react';

interface AppProps {}

interface Settings {
  text: string;
  backgroundColor: string;
  mainTextColor: string;
  theme: 'light' | 'dark' | 'random';
  decimalDigits: number;
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
  text: '',
  backgroundColor: themes.dark.backgroundColor,
  mainTextColor: themes.dark.mainTextColor,
  theme: 'dark',
  decimalDigits: 10
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
        `}
      </style>
      <div id="settings-popup" style={settingsPopupStyle}>
        <h2 style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', color: '#000000' }}>Customize Text</h2>
        <div style={{ marginBottom: '0.8rem' }}>
          <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem', color: '#000000' }}>Text</label>
          <input
            type="text"
            value={localSettings.text}
            onChange={(e) => handleChange('text', e.target.value)}
            style={inputStyle}
          />
        </div>

        <h2 style={{ margin: '0.8rem 0', fontSize: '1rem', color: '#000000' }}>Customize Colors</h2>
        <div style={{ marginBottom: '0.8rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem', color: '#000000' }}>Theme</label>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem' }}>
              {['light', 'dark', 'random'].map((theme) => {
                let buttonStyle: React.CSSProperties = {
                  padding: '0.4rem 0.8rem',
                  border: '1px solid #000000',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  flex: 1,
                };

                if (theme === 'light') {
                  buttonStyle = {
                    ...buttonStyle,
                    background: '#FAF7F5',
                    color: '#000000',
                  };
                } else if (theme === 'dark') {
                  buttonStyle = {
                    ...buttonStyle,
                    background: '#000000',
                    color: '#FAF7F5',
                  };
                } else if (theme === 'random') {
                  buttonStyle = {
                    ...buttonStyle,
                    background: 'linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(187,165,45,1) 25%, rgba(212,39,80,1) 50%, rgba(54,120,253,1) 75%, rgba(252,69,200,1) 100%)',
                    color: '#FAF7F5',
                  };
                }

                if (localSettings.theme === theme) {
                  buttonStyle.border = '2px solid #007AFF';
                }

                return (
                  <button
                    key={theme}
                    onClick={() => handleChange('theme', theme)}
                    style={buttonStyle}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem', color: '#000000' }}>Background color</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={localSettings.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type="color"
                value={localSettings.backgroundColor}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                style={{ width: '40px', padding: 0, cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.6rem' }}>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem', color: '#000000' }}>Main text color</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={localSettings.mainTextColor}
                onChange={(e) => handleChange('mainTextColor', e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <input
                type="color"
                value={localSettings.mainTextColor}
                onChange={(e) => handleChange('mainTextColor', e.target.value)}
                style={{ width: '40px', padding: 0, cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem', color: '#000000' }}>Decimal Digits</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <input
                type="range"
                min="8"
                max="12"
                value={localSettings.decimalDigits}
                onChange={(e) => handleChange('decimalDigits', e.target.value)}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '0.85rem', color: '#000000', minWidth: '24px' }}>
                {localSettings.decimalDigits}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button
            onClick={() => {
              onSave(localSettings);
              onClose();
            }}
            style={{
              padding: '0.3rem',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Save Preferences
          </button>

          <button
            onClick={onChangeBirthday}
            className="hover-underline"
            style={{
              padding: '0.3rem',
              backgroundColor: 'transparent',
              color: '#ff4444',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              textDecoration: 'none',
            }}
          >
            Change Birthday
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.85rem', color: '#666' }}>
          <a 
            href="https://oussama.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover-underline"
            style={{
              color: '#666',
              textDecoration: 'none',
            }}
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
  const [tempBirthday, setTempBirthday] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    // Load birthday and settings from storage
    chrome.storage.local.get(['birthday', 'settings'], (result) => {
      if (result.birthday) {
        setBirthday(result.birthday);
      }
      if (result.settings) {
        setSettings(result.settings);
      }
    });

    // Update body background color
    document.body.style.backgroundColor = settings.backgroundColor;
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
    chrome.storage.local.set({ birthday: date }, () => {
      setBirthday(date);
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
    marginTop: '1rem',
  };

  if (!birthday) {
    return (
      <div style={containerStyle}>
        <h1 style={{ color: settings.mainTextColor }}>Hi. Set here your birthday</h1>
        <input
          type="date"
          style={inputStyle}
          value={tempBirthday}
          onChange={(e) => setTempBirthday(e.target.value)}
        />
        <button
          style={saveButtonStyle}
          onClick={() => tempBirthday && handleSave(tempBirthday)}
          disabled={!tempBirthday}
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .hover-underline:hover {
            text-decoration: underline !important;
          }
        `}
      </style>
      <div style={containerStyle}>
        <div style={{ 
          fontSize: '3rem', 
          marginBottom: '0.5rem',
          color: settings.mainTextColor,
          letterSpacing: '3px',
          textAlign: 'center',
          fontWeight: 'bold',
        }}>
          {settings.text}
        </div>
        <div style={ageStyle}>{age}</div>
      </div>
      <button
        id="settings-button"
        className="hover-underline"
        style={settingsButtonStyle}
        onClick={() => setShowSettings(true)}
      >
        Settings
      </button>
      {showSettings && (
        <SettingsPopup
          settings={settings}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
          onChangeBirthday={() => handleSave('')}
        />
      )}
    </>
  );
};
