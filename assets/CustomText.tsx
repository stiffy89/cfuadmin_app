import React from 'react';
import { customText } from 'react-native-paper';

const Text = customText<
'bold' | 
'italic' | 
'displayLargeBold' | 
'displayMediumBold' | 
'displaySmallBold' | 
'headlineLargeBold' | 
'headlineMediumBold' | 
'headlineSmallBold' | 
'titleLargeBold' | 
'titleMediumBold' | 
'titleSmallBold' | 
'labelLargeBold' | 
'labelMediumBold' | 
'labelSmallBold' | 
'bodySmallBold' | 
'bodyMediumBold' | 
'bodyLargeBold' | 
'displayLargeItalic' | 
'displayMediumItalic' | 
'displaySmallItalic' | 
'headlineLargeItalic' | 
'headlineMediumItalic' | 
'headlineSmallItalic' | 
'titleLargeItalic' | 
'titleMediumItalic' | 
'titleSmallItalic' | 
'labelLargeItalic' | 
'labelMediumItalic' | 
'labelSmallItalic' | 
'bodySmallItalic' | 
'bodyMediumItalic' | 
'bodyLargeItalic'
>();

//export default Text;

const CustomText = (props : React.ComponentProps<typeof Text>) => {

    const smallVariants = [
        'titleMediumItalic',
        'titleSmallItalic',
        'labelLargeItalic', 
        'labelMediumItalic',
        'labelSmallItalic',
        'bodySmallItalic',
        'bodyMediumItalic',
        'bodyLargeItalic',
        'titleMediumBold',
        'titleSmallBold',
        'labelLargeBold',
        'labelMediumBold',
        'labelSmallBold', 
        'bodySmallBold',
        'bodyMediumBold',
        'bodyLargeBold',
        'titleMedium',
        'titleSmall',
        'labelLarge',
        'labelMedium',
        'labelSmall', 
        'bodySmall',
        'bodyMedium',
        'bodyLarge'
    ]

    const isSmallVariant = props.variant && smallVariants.includes(props.variant);

    //if they are using a custom val, then use it, otherwise check if we are using one of the smaller variant, set the maxFontSizeMultiplier property to 1.5 otherwise its 1 because it should be big enough
    const maxMultiplierVal = props.maxFontSizeMultiplier ?? (isSmallVariant ? 1.5 : 1);

    return (
        <Text
            // Spread all incoming props (including children, variant, style, etc.)
            {...props}
            // on a single component, it will use that; otherwise, it defaults to 1.5.
            maxFontSizeMultiplier={maxMultiplierVal}
        />
    )
}

export default CustomText;
