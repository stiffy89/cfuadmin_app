import {View, Pressable, ScrollView, Image, FlatList, NativeSyntheticEvent, NativeScrollEvent, Animated} from 'react-native';
import React, { useState } from 'react';

const Grid = (components : React.ReactElement[], containerWidth? : number, marginEnd? : number, containerMargin? : number) => {
    const [parentWidth, setParentWidth] = useState(0);
    const _containerMargin = containerMargin ? containerMargin : 30;
    const _marginEnd = marginEnd ? marginEnd : 10;

    return (
        <View
            onLayout={(event : any) => {
                if (containerWidth){
                    setParentWidth(containerWidth);
                }
                else {   
                    const { width } = event.nativeEvent.layout;
                    setParentWidth(width);
                }
            }}
            style={{marginVertical: 20}}  
        >
            <View style={{flexDirection: 'row', width: '100%', marginVertical: 10, justifyContent: 'center'}}>
                {
                    components.map((component, index) => {
                        
                        let width = (parentWidth - _containerMargin) / components.length
                        let marginEnd = 0;

                        if (index < (components.length - 1)){
                            marginEnd = _marginEnd;
                        }

                        return (
                            <View key={index} style={{width: width, alignItems: 'center', justifyContent: 'center', height: 100, marginEnd: marginEnd}}>
                                {component}
                            </View>
                        )
                    })
                }
            </View>
        </View>
    )
}

export default Grid;