export type Category = 'project' | 'tool' | 'component' | 'webapp' | 'article';
type Story = [title: string, summary: string, ...paragraphs: string[]];

// Paris hourly reanalysis, Open-Meteo Historical Weather API (48.8566, 2.3522).
// Match the local Git timestamp to the start of its hour in Europe/Paris.
const cloudy = { fr: 'Couvert', en: 'Overcast' };
const mostlyClear = { fr: 'Peu nuageux', en: 'Mainly clear' };
const clear = { fr: 'Ciel dégagé', en: 'Clear sky' };

interface Post {
  slug: string;
  date: string;
  location: string;
  localTime?: string;
  weather?: { fr: string; en: string };
  temperatureC?: number;
  hearts?: 1 | 2;
  publicUrl?: string;
  categories: Category[];
  preview?: boolean;
  fr: Story;
  en: Story;
}

const entries: Post[] = [
  {
    slug: 'identite-de-service', localTime: '07:33', temperatureC: 7.9, weather: cloudy, date: '2026-11-21', location: 'Paris', categories: ['project', 'component'], preview: true,
    fr: ['Une identité pour un service fictif', 'Une étude privée sur la façon de donner une voix et une identité visuelle à un service.', 'Je travaille sur le lien entre les mots d’une interface et ses composants. Le terrain de cette étude est un service entièrement fictif.'],
    en: ['An identity for a fictional service', 'A private study of how a service finds its voice and visual identity.', 'I’m exploring how the words in an interface relate to its components. The setting for this study is an entirely fictional service.'],
  },
  {
    slug: 'cartographie', localTime: '10:44', temperatureC: 11.6, weather: mostlyClear, date: '2026-11-18', location: 'Paris', categories: ['project', 'webapp'],
    fr: ['Changer de carte dans un parcours de rendez-vous', 'Une démo Angular pour explorer le passage de Google Maps à OpenStreetMap.', 'Le point de départ est une tâche ordinaire : trouver le bureau le plus proche. La carte sert à choisir un lieu avant de sélectionner un créneau et de confirmer le rendez-vous.', 'Ce petit parcours donne un cadre concret à la migration. On peut examiner ce qui change dans la carte tout en gardant le même objectif pour la personne qui réserve.'],
    en: ['Changing maps in an appointment journey', 'An Angular demo exploring a move from Google Maps to OpenStreetMap.', 'The starting point is an everyday task: finding the nearest office. The map helps visitors choose a location before picking a time and confirming the appointment.', 'The booking journey gives the migration a concrete scope. It lets me examine what changes on the map while keeping the visitor’s goal consistent.'],
  },
  {
    slug: 'premiers-composants', localTime: '13:17', temperatureC: 7.5, weather: cloudy, hearts: 2, date: '2026-11-07', location: 'Paris', categories: ['component'],
    fr: ['Les premiers composants du portail', 'La première implémentation générée du design system SN8W, conservée comme archive.', 'Cette version rassemble les fondations visuelles du portail et les premières démonstrations de composants. On peut y parcourir les états des champs, les boutons et les messages de validation.', 'Les six rubriques restent disponibles pour retrouver les choix de cette première implémentation.'],
    en: ['The portal’s first components', 'The first generated implementation of the SN8W design system, preserved as an archive.', 'This version brings together the portal’s visual foundations and its first component examples, including field states, buttons and validation messages.', 'The six original sections remain available for anyone revisiting those early decisions.'],
  },
  {
    slug: 'mes-liens', localTime: '10:21', temperatureC: 4.4, weather: mostlyClear, publicUrl: 'https://links.sn8w.com', date: '2026-11-05', location: 'Paris', categories: ['tool', 'webapp'],
    fr: ['Mes liens', 'Un outil personnel pour retrouver une page grâce à ses étiquettes ou à sa capture d’écran.', 'Quand je garde un lien pour plus tard, son titre ne suffit pas toujours à me rappeler pourquoi il m’intéressait. Mes liens associe l’adresse, des étiquettes et un repère visuel.', 'L’application permet de synchroniser les liens enregistrés pour retrouver la collection depuis plusieurs appareils.'],
    en: ['Mes liens', 'A personal tool for finding a saved page by its tags or screenshot.', 'When I save a link for later, its title doesn’t always remind me why I wanted it. Mes liens keeps the address, tags and a visual cue together.', 'Saved links can be synchronised so the collection is available across devices.'],
  },
  {
    slug: 'suivi-de-dossiers', localTime: '09:39', temperatureC: 4.2, weather: cloudy, date: '2026-11-05', location: 'Paris', categories: ['project', 'webapp'], preview: true,
    fr: ['Suivre un dossier fictif', 'Un laboratoire personnel autour du suivi de dossiers et du développement fullstack.', 'J’explore le passage entre une interface Angular, un service Java et une base SQL à travers un exercice de suivi de dossiers. Tous les dossiers de cet exercice sont fictifs.'],
    en: ['Following a fictional case', 'A personal lab exploring case tracking and full-stack development.', 'I’m exploring how an Angular interface, a Java service and a SQL database fit together through a case-tracking exercise. Every case in the exercise is fictional.'],
  },
  {
    slug: 'self-insight', localTime: '13:06', temperatureC: 9.1, weather: cloudy, date: '2026-11-04', location: 'Paris', categories: ['project', 'webapp'],
    fr: ['SelfInsight', 'Un carnet d’exploration qui rapproche plusieurs traditions symboliques.', 'SelfInsight réunit notamment les zodiaques occidental et chinois, la numérologie et le Yi King. Le projet les aborde comme des supports de réflexion personnelle.', 'Le fil conducteur est la lecture : comment présenter plusieurs grilles symboliques et laisser chacun parcourir celle qui l’intéresse ?'],
    en: ['SelfInsight', 'An exploration of several symbolic traditions in one place.', 'SelfInsight brings together the Western and Chinese zodiacs, numerology and the I Ching as prompts for personal reflection.', 'The design question is about reading: how can several symbolic frameworks sit together while letting readers follow the one that interests them?'],
  },
  {
    slug: 'rgaa-testbed', localTime: '22:12', temperatureC: 15, weather: mostlyClear, publicUrl: 'https://rgaa-test.sn8w.com', date: '2026-10-13', location: 'Paris', categories: ['tool', 'component'],
    fr: ['Deux versions pour tester un composant', 'RGAA Testbed permet de comparer un exemple accessible avec une version qui comporte un défaut.', 'Pour travailler sur un outil d’audit, il faut des pages dont on connaît déjà les différences. Le banc d’essai propose des exemples par paires dans une petite application Angular.', 'En passant d’une version à l’autre, on peut observer ce que relève l’assistant et ce qui demande encore une vérification manuelle.'],
    en: ['Two versions for testing a component', 'RGAA Testbed pairs an accessible example with a version containing a defect.', 'Developing an audit tool calls for pages with known differences. This small Angular test site presents examples in pairs.', 'Switching between versions makes it possible to see what the assistant detects and what still needs a manual check.'],
  },
  {
    slug: 'rgaa-assistant', hearts: 1, localTime: '18:06', temperatureC: 21.8, weather: cloudy, publicUrl: 'https://github.com/Kounrisu/rgaa-assistant', date: '2026-09-20', location: 'Paris', categories: ['tool'],
    fr: ['Un assistant RGAA dans les DevTools', 'Une extension pour repérer et numéroter les éléments à examiner pendant un audit.', 'L’assistant travaille sur la page ouverte dans le navigateur. Les repères visuels aident à retrouver chaque élément pendant les vérifications manuelles.', 'Les contrôles automatiques et les observations de l’auditeur peuvent ainsi porter sur le même échantillon de pages.'],
    en: ['An RGAA assistant in DevTools', 'A browser extension for locating and numbering the elements to inspect during an audit.', 'The assistant works on the open browser page. Visual markers make individual elements easier to find during manual checks.', 'Automated checks and the auditor’s observations can then refer to the same sample of pages.'],
  },
  {
    slug: 'design-system-sn8w', hearts: 2, localTime: '00:55', temperatureC: 22.4, weather: clear, date: '2026-09-15', location: 'Paris', categories: ['component', 'project'],
    fr: ['Le design system SN8W', 'Des fondations communes pour les composants SN8W et leurs différentes implémentations.', 'Le système rassemble les couleurs, les règles d’accessibilité et les primitives CSS utilisées dans plusieurs environnements. Chaque implémentation peut puiser dans le même vocabulaire.', 'La documentation publique est le point d’entrée pour consulter les composants et leurs usages.'],
    en: ['The SN8W design system', 'Shared foundations for SN8W components and their implementations.', 'The system brings together colour tokens, accessibility rules and CSS primitives used across frameworks. Each implementation can draw on the same vocabulary.', 'The public documentation is the starting point for exploring the components and their uses.'],
  },
];

export const posts = entries.sort((a, b) => b.date.localeCompare(a.date));
