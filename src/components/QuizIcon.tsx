import React from 'react';
import {
  Atom,
  Clock,
  Compass,
  Cpu,
  Crown,
  Film,
  Flag,
  Gift,
  Globe,
  Landmark,
  MapPin,
  Microscope,
  Mountain,
  Music,
  Newspaper,
  Orbit,
  Palette,
  Scroll,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface QuizIconProps {
  name: string;
  size?: number;
}

export const QuizIcon: React.FC<QuizIconProps> = ({ name, size = 18 }) => {
  switch (name) {
    case 'flag':
      return <Flag size={size} />;
    case 'landmark':
      return <Landmark size={size} />;
    case 'compass':
      return <Compass size={size} />;
    case 'mountain':
      return <Mountain size={size} />;
    case 'map-pin':
      return <MapPin size={size} />;
    case 'globe':
      return <Globe size={size} />;
    case 'atom':
      return <Atom size={size} />;
    case 'orbit':
      return <Orbit size={size} />;
    case 'microscope':
      return <Microscope size={size} />;
    case 'scroll':
      return <Scroll size={size} />;
    case 'clock':
      return <Clock size={size} />;
    case 'film':
      return <Film size={size} />;
    case 'music':
      return <Music size={size} />;
    case 'newspaper':
      return <Newspaper size={size} />;
    case 'trophy':
      return <Trophy size={size} />;
    case 'cpu':
      return <Cpu size={size} />;
    case 'crown':
      return <Crown size={size} />;
    case 'gift':
      return <Gift size={size} />;
    case 'palette':
      return <Palette size={size} />;
    default:
      return <Sparkles size={size} />;
  }
};
