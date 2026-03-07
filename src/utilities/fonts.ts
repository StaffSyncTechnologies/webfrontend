/**
 * StaffSync Typography
 * Primary Font: Outfit
 * Style: Clean modern sans-serif
 */

export const fonts = {
  // Font families
  family: {
    primary: "'Outfit', sans-serif",
    fallback: "'Inter', 'Montserrat', sans-serif",
  },

  // Font weights
  weight: {
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },

  // Font sizes (rem-based for accessibility)
  size: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

// Typography presets for common use cases
export const typography = {
  h1: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size['4xl'],
    fontWeight: fonts.weight.bold,
    lineHeight: fonts.lineHeight.tight,
  },
  h2: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size['3xl'],
    fontWeight: fonts.weight.semiBold,
    lineHeight: fonts.lineHeight.tight,
  },
  h3: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size['2xl'],
    fontWeight: fonts.weight.semiBold,
    lineHeight: fonts.lineHeight.tight,
  },
  h4: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.medium,
    lineHeight: fonts.lineHeight.normal,
  },
  body: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.regular,
    lineHeight: fonts.lineHeight.normal,
  },
  bodySmall: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.regular,
    lineHeight: fonts.lineHeight.normal,
  },
  label: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.medium,
    lineHeight: fonts.lineHeight.normal,
  },
  caption: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.regular,
    lineHeight: fonts.lineHeight.normal,
  },
  button: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semiBold,
    lineHeight: fonts.lineHeight.tight,
  },
} as const;

export type Fonts = typeof fonts;
export type Typography = typeof typography;
