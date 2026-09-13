import type { Dict, Lang } from './dictionary';
import { en } from './dictionary';
import { fr } from './fr';

export const TRANSLATIONS: Record<Lang, Dict> = { en, fr };
