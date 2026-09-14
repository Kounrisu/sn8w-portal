import type { ScreenshotCaption } from './models';

// Initial copy for existing captures. An explicitly saved empty caption stays empty.
// Keys are image paths, so changing the slide order never changes their meaning.
const captions: Record<string, ScreenshotCaption> = {
  'healthcorp/healthcorp-portfolio': {
    fr: 'Une vue du portefeuille d’entreprises et de leurs indicateurs, à partir de données simulées.',
    en: 'An overview of the company portfolio and its indicators, using simulated data.',
  },
  'healthcorp/healthcorp-companies': {
    fr: 'Parcourez les entreprises de démonstration et leurs informations financières.',
    en: 'Browse demonstration companies and their financial information.',
  },
  'stocks/stocks-dashboard': {
    fr: 'Une vue d’ensemble des comptes et de leur évolution dans un portefeuille de démonstration.',
    en: 'An overview of accounts and their performance in a demonstration portfolio.',
  },
  'stocks/stocks-holdings': {
    fr: 'Consultez le détail des positions du portefeuille de démonstration.',
    en: 'Explore individual holdings in the demonstration portfolio.',
  },
  'lotokarma/lotokarma-home': {
    fr: 'Et si votre date de naissance vous avait porté chance ? Explorez les jeux et les tirages passés.',
    en: 'Could your birthday have brought you luck? Explore the games and past draws.',
  },
  'lotokarma/lotokarma-euromillions': {
    fr: 'Composez une grille EuroMillions pour explorer ce qu’elle aurait donné dans les archives.',
    en: 'Build a EuroMillions combination to explore how it would have performed in past draws.',
  },
  'kanji/kanji-home': {
    fr: 'Observez un kanji se dessiner trait par trait, à votre rythme.',
    en: 'Watch a kanji being drawn stroke by stroke, at your own pace.',
  },
  'kanji/kanji-list': {
    fr: 'Explorez les caractères pour rendre les kanjis plus familiers, un à un.',
    en: 'Explore the characters and become familiar with kanji, one at a time.',
  },
  'books/books-library': {
    fr: 'Parcourez les couvertures et retrouvez les livres de votre bibliothèque.',
    en: 'Browse covers and find books in your library.',
  },
  'books/books-locations': {
    fr: 'Organisez les emplacements pour savoir où retrouver chaque livre.',
    en: 'Organize locations so you know where to find each book.',
  },
  'lenormand/lenormand-deck': {
    fr: 'Découvrez le jeu de cartes Lenormand dans une interface visuelle.',
    en: 'Discover the Lenormand deck in a visual interface.',
  },
  'lenormand/lenormand-cards': {
    fr: 'Parcourez les cartes et leurs illustrations.',
    en: 'Browse the cards and their illustrations.',
  },
  'sn8w-portal/portal-home': {
    fr: 'Mon parcours, mes compétences et mes projets réunis dans un même espace.',
    en: 'My experience, skills and projects brought together in one place.',
  },
  'sn8w-portal/portal-projects': {
    fr: 'Une sélection d’applications personnelles et d’expérimentations en cours.',
    en: 'A selection of personal applications and ongoing experiments.',
  },
  'weather/weather-gallery': {
    fr: 'Des variations visuelles autour de l’heure et de la météo.',
    en: 'Visual variations on time and weather.',
  },
  'weather/weather-mobile': {
    fr: 'Le composant heure et météo adapté à un petit écran.',
    en: 'The clock and weather component adapted to a small screen.',
  },
  'repo-to-text/repo-to-text-github': {
    fr: 'Préparez le contenu d’un dépôt GitHub sous forme de texte.',
    en: 'Prepare the contents of a GitHub repository as text.',
  },
  'repo-to-text/repo-to-text-local': {
    fr: 'Sélectionnez un projet local pour en préparer le contenu textuel.',
    en: 'Select a local project to prepare its text content.',
  },
  'devfest/devfest-events': {
    fr: 'Consultez les événements dans une interface de gestion en développement.',
    en: 'Browse events in an event management interface under development.',
  },
  'devfest/devfest-admin': {
    fr: 'L’espace d’administration pour organiser les événements.',
    en: 'The administration area for organizing events.',
  },
  'angular-lessons/angular-forms': {
    fr: 'Un exercice pratique pour apprendre à construire des formulaires Angular.',
    en: 'A practical exercise in building Angular forms.',
  },
  'prompt-hub/prompt-hub-home': {
    fr: 'Un projet d’apprentissage Angular autour d’une bibliothèque de prompts.',
    en: 'An Angular learning project built around a prompt library.',
  },
  'bastion/bastion-starter': {
    fr: 'Le point de départ d’un projet d’expérimentation Angular.',
    en: 'The starting point for an Angular experiment.',
  },
  'monster-dex/monster-dex-list': {
    fr: 'Un catalogue de créatures pour pratiquer les interfaces de liste.',
    en: 'A creature catalog for practicing list interfaces.',
  },
  'wow/wow-login': {
    fr: 'L’écran de connexion d’un projet autour des personnages de World of Warcraft.',
    en: 'The sign-in screen of a project about World of Warcraft characters.',
  },
  'cv-redesign/cv-redesign-home': {
    fr: 'Une piste de conception pour présenter un parcours professionnel.',
    en: 'A design exploration for presenting professional experience.',
  },
  'cv-redesign/cv-redesign-light': {
    fr: 'Une variation claire de cette exploration de portfolio.',
    en: 'A light variation of this portfolio exploration.',
  },
};

export function defaultCaption(path: string): ScreenshotCaption {
  return captions[path.replace(/^\/images\/projects\//, '').replace(/\.webp$/, '')] ?? {};
}
