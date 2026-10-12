import type { ReactElement } from 'react';
import ParkIcon from '@mui/icons-material/Park';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import PaletteIcon from '@mui/icons-material/Palette';
import ScienceIcon from '@mui/icons-material/Science';

interface DirectionMeta {
  bg: string;
  fg: string;
  icon: ReactElement;
}

const META: Record<string, DirectionMeta> = {
  'Экология': { bg: '#E3F2E9', fg: '#2E7D4F', icon: <ParkIcon /> },
  'Образование': { bg: '#E5EBFA', fg: '#26408B', icon: <SchoolIcon /> },
  'Молодёжные инициативы': { bg: '#FCEBDD', fg: '#B45F1B', icon: <GroupsIcon /> },
  'Социальная поддержка': { bg: '#F8E4EC', fg: '#A93A64', icon: <VolunteerActivismIcon /> },
  'Культура и искусство': { bg: '#EFE6F7', fg: '#6B3FA0', icon: <PaletteIcon /> },
  'Наука и технологии': { bg: '#E0F2F4', fg: '#1C7480', icon: <ScienceIcon /> },
};

const FALLBACK: DirectionMeta = { bg: '#ECEEF5', fg: '#5A6280', icon: <SchoolIcon /> };

export function getDirectionMeta(direction: string): DirectionMeta {
  return META[direction] ?? FALLBACK;
}
