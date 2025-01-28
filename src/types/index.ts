export interface Settings {
  text: string;
  backgroundColor: string;
  mainTextColor: string;
  theme: 'light' | 'dark' | 'random';
  decimalDigits: number;
  tabName: string;
}

export const themes = {
  light: {
    backgroundColor: '#FFFFFF',
    mainTextColor: '#000000'
  },
  dark: {
    backgroundColor: '#1F1F1F',
    mainTextColor: '#DFDFDF'
  }
};
