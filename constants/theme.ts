/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    base100: '#f8f8f8',
    base200: '#f5f5f5',
    base300: '#e4e4e4',
    base400: '#c7c7c7',
    base500: '#a9a9a9',
    base600: '#8c8c8c',
    base700: '#6e6e6e',
    base800: '#515151',
    base900: '#333333',
    baseContent: '#161616',
    primary: '#006a20',
    primaryContent: '#f8f8f8',
    secondary: '#000000',
    secondaryContent: '#ffffff',
    accent: '#0069a8',
    accentContent: '#effcf9',
    neutral: '#090909',
    neutralContent: '#f8f8f8',
    info: '#0082ce',
    infoContent: '#dff2fe',
    success: '#008033',
    successContent: '#d0fae5',
    warning: '#fcb700',
    warningContent: '#182d02',
    error: '#c5005a',
    errorContent: '#ffe3e6',
  },
  dark: {
    base100: '#1d232a',
    base200: '#191e24',
    base300: '#15191e',
    base400: '#323539',
    base500: '#4e5155',
    base600: '#6b6d70',
    base700: '#888a8c',
    base800: '#a5a6a7',
    base900: '#c1c2c3',
    baseContent: '#dedede',
    primary: '#f55158',
    primaryContent: '#150203',
    secondary: '#6061e9',
    secondaryContent: '#030313',
    accent: '#0077c2',
    accentContent: '#eefaff',
    neutral: '#060c13',
    neutralContent: '#d5dfeb',
    info: '#0082ce',
    infoContent: '#dff2fe',
    success: '#308639',
    successContent: '#f1fcf0',
    warning: '#a06200',
    warningContent: '#fff7ea',
    error: '#ba293b',
    errorContent: '#fff3f3',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
