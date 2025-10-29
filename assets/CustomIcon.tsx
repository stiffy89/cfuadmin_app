import {StyleProp, ViewStyle } from "react-native";
import * as LucideIcons from "lucide-react-native";
const Icon = ({ name, color, size, style } : { name:string, color: string, size: number, style: StyleProp<ViewStyle> }) => {
  const iconName = name as keyof typeof LucideIcons.icons
  const LucideIcon = LucideIcons.icons[iconName];

  return <LucideIcon color={color} size={size} style={[style]}/>;
};
export default Icon