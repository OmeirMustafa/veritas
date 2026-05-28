export const colors = {
  background: '#FAF8F5',
  primary: '#2D6A4F',
  accent: '#E07A5F',
  textPrimary: '#2C2C2A',
  textSecondary: '#6B705C',
  border: 'rgba(44, 44, 42, 0.1)', // 10% opacity of textPrimary
  error: '#D32F2F',
  white: '#FFFFFF',
};

export const radius = {
  small: 8,
  card: 16,
  round: 100,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // We will use standard React Native system fonts (sans for UI, serif for post content)
  ui: {
    fontFamily: 'System',
  },
  post: {
    fontFamily: 'Georgia', // A serif font widely available on mobile
  }
};
