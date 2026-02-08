
import React, { useState } from 'react';
import { View, Pressable, ScrollView, Image, FlatList, NativeSyntheticEvent, NativeScrollEvent, Animated, ViewStyle, StyleProp, Text } from 'react-native';

const CustomGrid = ({columns, style, children} : {columns: number, style: StyleProp<ViewStyle>, children: React.ReactNode}) => {
    
    const colNumBasisMap: any = {
        1 : 80,
        2 : 40,
        3 : 30,
        4 : 20
    }
    const basis = colNumBasisMap[columns]
    
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