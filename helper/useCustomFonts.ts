// assets/fonts/useCustomFonts.ts
import { useFonts } from 'expo-font';
import { configureFonts} from 'react-native-paper';

// Define the base font families
const baseFont = {
  fontFamily: 'regular',
} as const;

// Create the base variants (Paper's typography system)
const baseVariants = configureFonts({ config: baseFont });

// Define your custom variants
const customVariants = {
  displayLargeBold: { ...baseVariants.displayLarge, fontFamily: 'bold' },
  displayMediumBold: { ...baseVariants.displayMedium, fontFamily: 'bold' },
  displaySmallBold: { ...baseVariants.displaySmall, fontFamily: 'bold' },
  headlineLargeBold: { ...baseVariants.headlineLarge, fontFamily: 'bold' },
  headlineMediumBold: { ...baseVariants.headlineMedium, fontFamily: 'bold' },
  headlineSmallBold: { ...baseVariants.headlineSmall, fontFamily: 'bold' },
  titleLargeBold: { ...baseVariants.titleLarge, fontFamily: 'bold' },
  titleMediumBold: { ...baseVariants.titleMedium, fontFamily: 'bold' },
  titleSmallBold: { ...baseVariants.titleSmall, fontFamily: 'bold' },
  labelLargeBold: { ...baseVariants.labelLarge, fontFamily: 'bold' },
  labelMediumBold: { ...baseVariants.labelMedium, fontFamily: 'bold' },
  labelSmallBold: { ...baseVariants.labelSmall, fontFamily: 'bold' },
  bodySmallBold: { ...baseVariants.bodySmall, fontFamily: 'bold' },
  bodyMediumBold: { ...baseVariants.bodyMedium, fontFamily: 'bold' },
  bodyLargeBold: { ...baseVariants.bodyLarge, fontFamily: 'bold' },

  // Italic variants
  displayLargeItalic: { ...baseVariants.displayLarge, fontFamily: 'italic' },
  displayMediumItalic: { ...baseVariants.displayMedium, fontFamily: 'italic' },
  displaySmallItalic: { ...baseVariants.displaySmall, fontFamily: 'italic' },
  headlineLargeItalic: { ...baseVariants.headlineLarge, fontFamily: 'italic' },
  headlineMediumItalic: { ...baseVariants.headlineMedium, fontFamily: 'italic' },
  headlineSmallItalic: { ...baseVariants.headlineSmall, fontFamily: 'italic' },
  titleLargeItalic: { ...baseVariants.titleLarge, fontFamily: 'italic' },
  titleMediumItalic: { ...baseVariants.titleMedium, fontFamily: 'italic' },
  titleSmallItalic: { ...baseVariants.titleSmall, fontFamily: 'italic' },
  labelLargeItalic: { ...baseVariants.labelLarge, fontFamily: 'italic' },
  labelMediumItalic: { ...baseVariants.labelMedium, fontFamily: 'italic' },
  labelSmallItalic: { ...baseVariants.labelSmall, fontFamily: 'italic' },
  bodySmallItalic: { ...baseVariants.bodySmall, fontFamily: 'italic' },
  bodyMediumItalic: { ...baseVariants.bodyMedium, fontFamily: 'italic' },
  bodyLargeItalic: { ...baseVariants.bodyLarge, fontFamily: 'italic' },

  // Direct overrides
  bold: { ...baseVariants.bodyMedium, fontFamily: 'bold' },
  italic: { ...baseVariants.bodyMedium, fontFamily: 'italic' },
};

// Combine base + custom
const fonts = configureFonts({
  config: {
    ...baseVariants,
    ...customVariants,
  },
});

// Custom hook to load fonts and return configuration
export const useCustomFonts = () => {
  const [loaded] = useFonts({
    regular: require('../assets/SAP_72_Font/TrueType/72-Regular.ttf'),
    bold: require('../assets/SAP_72_Font/TrueType/72-Bold.ttf'),
    italic: require('../assets/SAP_72_Font/TrueType/72-Italic.ttf'),
  });

/*  const [loaded] = useFonts({
    regular: require('../assets/static/Montserrat-Regular.ttf'),
    bold: require('../assets/static/Montserrat-Bold.ttf'),
    italic: require('../assets/static/Montserrat-Italic.ttf'),
  });
*/
  return { loaded, fonts };
};
