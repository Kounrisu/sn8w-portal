import type { Project, ProjectTheme } from './models';

export const PROJECT_THEMES: readonly ProjectTheme[] = ['finance', 'health', 'learning', 'games', 'utilities', 'developer-tools', 'sandbox'];
export const PROJECT_BATCH_SIZE = 6;

export const CATALOG_COPY = {
  en: {
    title: 'All projects', viewAll: 'View all projects', home: 'Back to the homepage',
    lede: 'Explore my applications, experiments and learning projects. Filter by theme to find what interests you.',
    all: 'All themes', filter: 'Filter by theme', more: 'Show more projects', shown: 'projects shown', of: 'of',
    empty: 'No projects in this theme yet.', emptyCatalog: 'No projects are currently visible.',
    retry: 'Try again', error: 'The projects could not be loaded.', loading: 'Loading projects…',
    visible: 'Visible on the site', featured: 'Featured on the homepage', theme: 'Theme',
    hint: 'Visible projects appear on the Projects page. The homepage shows up to six featured projects, in display order. Hidden projects never appear on either page.',
    themes: { finance: 'Finance & business', health: 'Health & well-being', learning: 'Languages & education', games: 'Games & leisure', utilities: 'Organization & everyday life', 'developer-tools': 'Developer tools & accessibility', sandbox: 'Sandbox & learning' },
  },
  fr: {
    title: 'Tous les projets', viewAll: 'Voir tous les projets', home: 'Retour à l’accueil',
    lede: 'Explorez mes applications, expérimentations et projets d’apprentissage. Filtrez par thème pour découvrir ce qui vous intéresse.',
    all: 'Tous les thèmes', filter: 'Filtrer par thème', more: 'Afficher davantage de projets', shown: 'projets affichés', of: 'sur',
    empty: 'Aucun projet dans ce thème pour le moment.', emptyCatalog: 'Aucun projet n’est actuellement visible.',
    retry: 'Réessayer', error: 'Impossible de charger les projets.', loading: 'Chargement des projets…',
    visible: 'Visible sur le site', featured: 'Mis en avant sur l’accueil', theme: 'Thème',
    hint: 'Les projets visibles figurent sur la page Projets. L’accueil présente au maximum six projets mis en avant, selon leur ordre d’affichage. Les projets masqués n’apparaissent sur aucune des deux pages.',
    themes: { finance: 'Finance & entreprises', health: 'Santé & bien-être', learning: 'Langues & pédagogie', games: 'Jeux & loisirs', utilities: 'Organisation & quotidien', 'developer-tools': 'Outils développeur & accessibilité', sandbox: 'Sandbox & apprentissage' },
  },
};

const legacyThemes: Record<string, ProjectTheme> = {
  Healthcorp: 'finance', 'StockTracker Personal': 'finance', 'Passive Income Tracker': 'finance', 'Legio Portfolio': 'finance', 'Executive KPI Dashboard': 'finance',
  Fighto: 'health', 'Brain Sakura': 'health',
  Kanji: 'learning', 'Angular Fundamentals Lessons': 'sandbox', 'Prompt Hub — Angular course': 'sandbox', 'Bastion Angular': 'sandbox', 'Frontend Masters — learning workspace': 'sandbox', 'Access42 — accessibility training': 'sandbox', 'Ultimate Courses — workspace': 'sandbox',
  lotoKarma: 'games', Lenormand: 'games', 'WoW Character Viewer': 'games', 'WoW Progress Companion': 'games', 'Monster Dex — practice': 'games', 'Kawaii Pet Companion': 'games', 'K-Pop Affinity': 'games', 'K-Pop Universe': 'games',
  'Photo Book Scanner': 'developer-tools', 'Repo to Text — local workspace': 'developer-tools', 'RGAA Dev Assistant': 'developer-tools', 'VS Code Accessibility Helper': 'developer-tools', 'CI/CD Accessibility Pipeline': 'developer-tools', 'Tanaguru — accessibility reference': 'developer-tools', 'AI Project Planning Template': 'developer-tools', 'Development sandbox': 'sandbox', 'sn8w Portal': 'developer-tools', 'CV redesign study': 'sandbox',
};
export const projectTheme = (project: Project): ProjectTheme => project.projectTheme ?? legacyThemes[project.name] ?? 'utilities';
export const isProjectVisible = (project: Project): boolean => project.showInShowcase ?? (project.tier === 'flagship' && !!project.tagline.trim());
export const visibleProjects = (projects: readonly Project[]): Project[] => projects.filter(isProjectVisible).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
export const homepageProjects = (projects: readonly Project[]): Project[] => visibleProjects(projects).filter(p => p.featuredOnHome ?? true).slice(0, PROJECT_BATCH_SIZE);
