import React from 'react';
import { Button } from "./ui/button";
import { Settings } from '../types';

interface BirthdayInputProps {
  birthday: string | null;
  settings: Settings;
  onSave: (date: string) => void;
}

export const BirthdayInput: React.FC<BirthdayInputProps> = ({ 
  birthday, 
  settings, 
  onSave 
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen p-8 w-full max-w-7xl mx-auto"
      style={{ 
        backgroundColor: settings.backgroundColor,
        color: settings.mainTextColor 
      }}
    >
      <h1 className="text-4xl font-bold mb-8" style={{ color: settings.mainTextColor }}>
        Motivational Age Counter
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
            onSave(date);
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
};
