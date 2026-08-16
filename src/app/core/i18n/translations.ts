import type { Dict, Lang } from './dictionary';
import { en } from './dictionary';
import { fr } from './fr';
import { de } from './de';
import { es } from './es';
import { ko } from './ko';
import { ja } from './ja';

export const TRANSLATIONS: Record<Lang, Dict> = { en, fr, de, ko, ja, es };
