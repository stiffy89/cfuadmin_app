import { View, Pressable, ScrollView, Image, FlatList, NativeSyntheticEvent, NativeScrollEvent, Animated } from 'react-native';
import React, { useState } from 'react';
import { GridLayoutRow } from '../types/AppTypes';
import GlobalStyles from '../style/GlobalStyles';

const Grid = (components: React.ReactElement[], itemsPerRow: number, containerWidth?: number, backgroundColor?: string, includeBorderRadius?: boolean, marginEnd?: number, containerMargin?: number) => {
    const [parentWidth, setParentWidth] = useState(0);
    const _containerMargin = containerMargin ? containerMargin : 30;
    const _marginEnd = marginEnd ? marginEnd : 10;

    // Split components into rows - the resultant format should like this
    //rows = [
    // [
    //   {grid component}, {grid component}
    // ]
    //]
    const rows: React.ReactElement[][] = [];
    for (let i = 0; i < components.length; i += itemsPerRow) {
        rows.push(components.slice(i, i + itemsPerRow));
    }

    return (
        <View
            onLayout={(event: any) => {

                if (containerWidth) {
                    setParentWidth(containerWidth);
                }
                else if (containerWidth == undefined) {
                    setParentWidth(event.nativeEvent.layout.width);
                }
                else {
                    setParentWidth(event.nativeEvent.layout.width);
                }
            }}
            style={{ marginVertical: 20 }}
        >
            {rows.map((row, rowIndex) => (
                <View
                    key={rowIndex}
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                        marginVertical: 10,
                        justifyContent: 'center',
                    }}
                >
                    {row.map((component, index) => {
                        const width = (parentWidth - _containerMargin) / itemsPerRow;
                        const marginRight = index < row.length - 1 ? _marginEnd : 0;
                        
                        return (
                            <View
                                key={index}
                                style={{
                                    width,
                                    backgroundColor,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 100,
                                    marginEnd: marginRight,
                                    ...(includeBorderRadius && GlobalStyles.globalBorderRadius) //spread operator if we incl global border radius
                                }}
                            >
                                {component}
                            </View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

export default Grid;