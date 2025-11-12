
import React, { useState } from 'react';
import { View, Pressable, ScrollView, Image, FlatList, NativeSyntheticEvent, NativeScrollEvent, Animated, ViewStyle, StyleProp, Text } from 'react-native';

const CustomGrid = ({columns, style, children} : {columns: number, style: StyleProp<ViewStyle>, children: React.ReactNode}) => {
    
    const basis = Math.min(Math.floor((100 / columns) / 10) * 10, 40)
    
    return (
        <View style={[style, {flexDirection: "row", flexWrap: "wrap", justifyContent:"center"}]}>
            {React.Children.map(children, (child: any) => {
                return (
                     React.cloneElement(child, { style: [child.props.style, {flexBasis: `${basis}%`}] })
                )
            })}
        </View>
    )
}

export default CustomGrid