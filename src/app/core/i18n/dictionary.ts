export interface Dict {
  common: {
    loading: string;
    error: string;
    language: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    theme: string;
    themeFrost: string;
    themeSquirrel: string;
  };
  nav: {
    products: string;
    developerTools: string;
    about: string;
    github: string;
    explore: string;
    openMenu: string;
    closeMenu: string;
    logout: string;
    admin: string;
    todo: string;
    diary: string;
  };
  hero: {
    kicker: string;
    headlineMain: string;
    headlineAccent: string;
    lede: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  flagshipSection: {
    kicker: string;
    title: string;
    lede: string;
    followBuild: string;
  };
  status: {
    live: string;
    inDevelopment: string;
    concept: string;
    prototype: string;
  };
  ecosystemSection: {
    kicker: string;
    title: string;
    lede: string;
    groups: {
      developerTools: string;
      finance: string;
      consumer: string;
      other: string;
    };
  };
  principlesSection: {
    kicker: string;
    title: string;
    lede: string;
    items: {
      accessibility: { title: string; description: string };
      architecture: { title: string; description: string };
      responsive: { title: string; description: string };
      performance: { title: string; description: string };
      designSystems: { title: string; description: string };
      testing: { title: string; description: string };
      ux: { title: string; description: string };
    };
  };
  labSection: {
    kicker: string;
    title: string;
    lede: string;
    tag: string;
  };
  ctaSection: {
    title: string;
    lede: string;
  };
  footer: {
    github: string;
    copyEmail: string;
    copied: string;
    copyFailed: string;
    deployedCommit: string;
  };
  auth: {
    title: string;
    lede: string;
    username: string;
    password: string;
    submit: string;
    error: string;
    loggedInAs: string;
  };
  admin: {
    title: string;
    lede: string;
    newProject: string;
    name: string;
    category: string;
    tagline: string;
    tier: string;
    group: string;
    mockup: string;
    none: string;
    status: string;
    url: string;
    confirmDelete: string;
    empty: string;
    tierFlagship: string;
    tierEcosystem: string;
    tierLab: string;
  };
  todoPage: {
    title: string;
    lede: string;
    searchPlaceholder: string;
    filterAll: string;
    newTodo: string;
    columns: { todo: string; inProgress: string; done: string };
    priority: { low: string; medium: string; high: string };
    completedPrefix: string;
    empty: string;
    noResults: string;
  };
  todoDetailPage: {
    newHeading: string;
    editHeading: string;
    titleLabel: string;
    titlePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    priorityLabel: string;
    progressLabel: string;
    back: string;
    create: string;
    deleteConfirm: string;
    titleRequired: string;
  };
  diaryPage: {
    title: string;
    lede: string;
    notesPlaceholder: string;
    save: string;
    saved: string;
    todosForDay: string;
    addTodoPlaceholder: string;
    add: string;
    noDays: string;
    today: string;
  };
}

export type Lang = 'en' | 'fr' | 'de' | 'ko' | 'ja' | 'es';

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  ko: '한국어',
  ja: '日本語',
  es: 'Español',
};

export const en: Dict = {
  common: {
    loading: 'Loading…',
    error: 'Something went wrong.',
    language: 'Language',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    theme: 'Theme',
    themeFrost: 'Night Sky',
    themeSquirrel: 'Lucky Squirrel',
  },
  nav: {
    products: 'Products',
    developerTools: 'Developer Tools',
    about: 'About',
    github: 'GitHub',
    explore: 'Explore products',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    logout: 'Log out',
    admin: 'Admin',
    todo: 'Todo',
    diary: 'Diary',
  },
  hero: {
    kicker: 'Software studio',
    headlineMain: 'Focused software, built with care',
    headlineAccent: '— not shipped by default.',
    lede: "sn8w is a small studio building developer tools, finance dashboards and a few stranger things — each one designed for real use, tested for accessibility, and engineered like it has to last.",
    ctaPrimary: 'Explore products',
    ctaSecondary: 'View on GitHub',
  },
  flagshipSection: {
    kicker: 'Flagship',
    title: "Three products we're building deliberately",
    lede: "The rest of the catalog moves fast. These three get the most attention — because they're the ones we'd stake the studio's name on.",
    followBuild: 'Follow the build on GitHub',
  },
  status: {
    live: 'Live',
    inDevelopment: 'In development',
    concept: 'Concept',
    prototype: 'Prototype',
  },
  ecosystemSection: {
    kicker: 'Ecosystem',
    title: 'The rest of the catalog',
    lede: "Smaller in scope, not in care. Grouped by what they're actually for.",
    groups: {
      developerTools: 'Developer Tools',
      finance: 'Finance',
      consumer: 'Consumer',
      other: 'Other',
    },
  },
  principlesSection: {
    kicker: 'How we build',
    title: 'Engineering that stays out of the way',
    lede: 'The same handful of standards apply to every product, whether it ships next month or stays a prototype.',
    items: {
      accessibility: {
        title: 'Accessibility by design',
        description: 'RGAA and WCAG checked before launch, not bolted on after.',
      },
      architecture: {
        title: 'Modern Angular architecture',
        description: 'Standalone components, signals, zoneless — no legacy patterns.',
      },
      responsive: {
        title: 'Responsive interfaces',
        description: 'Designed for the smallest screen first, not stretched from desktop.',
      },
      performance: {
        title: 'Performance',
        description: 'Small bundles, fast interactions, no framework bloat.',
      },
      designSystems: {
        title: 'Reusable design systems',
        description: 'Typed components and tokens, shared across every product.',
      },
      testing: {
        title: 'Testing',
        description: 'Unit tests and accessibility audits as part of the build, not an afterthought.',
      },
      ux: {
        title: 'Thoughtful UX',
        description: 'Every screen earns its place — nothing ships just to fill space.',
      },
    },
  },
  labSection: {
    kicker: 'Product Lab',
    title: 'Where the stranger ideas live',
    lede: 'Not every product needs a business case. These are experiments — built to learn something, played with in the open, and shipped only if they earn it.',
    tag: '[prototype]',
  },
  ctaSection: {
    title: "Curious what we're building next?",
    lede: 'Every product on this page starts as a repository. Come watch.',
  },
  footer: {
    github: 'GitHub',
    copyEmail: 'Copy email',
    copied: 'Email address copied',
    copyFailed: 'Could not copy email address',
    deployedCommit: 'Deployed commit',
  },
  auth: {
    title: 'Sign in',
    lede: 'Private area — admin, todo board and diary.',
    username: 'Username',
    password: 'Password',
    submit: 'Sign in',
    error: 'Invalid username or password.',
    loggedInAs: 'Signed in as',
  },
  admin: {
    title: 'Administer products',
    lede: 'Add, edit and remove the products shown on the landing page.',
    newProject: 'New project',
    name: 'Name',
    category: 'Category',
    tagline: 'Tagline',
    tier: 'Tier',
    group: 'Ecosystem group',
    mockup: 'Flagship mockup',
    none: 'None',
    status: 'Status',
    url: 'URL',
    confirmDelete: 'Delete this project?',
    empty: 'No projects yet.',
    tierFlagship: 'Flagship',
    tierEcosystem: 'Ecosystem',
    tierLab: 'Lab',
  },
  todoPage: {
    title: 'Todo board',
    lede: 'Every task, one list — drag to reorder, open one to update it.',
    searchPlaceholder: 'Search todos',
    filterAll: 'All statuses',
    newTodo: 'New',
    columns: { todo: 'Todo', inProgress: 'In progress', done: 'Done' },
    priority: { low: 'Low', medium: 'Medium', high: 'High' },
    completedPrefix: 'Completed',
    empty: 'Nothing here yet.',
    noResults: 'No todos match.',
  },
  todoDetailPage: {
    newHeading: 'New todo',
    editHeading: 'Edit todo',
    titleLabel: 'Title',
    titlePlaceholder: 'What needs doing?',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Add more detail (optional)',
    priorityLabel: 'Priority',
    progressLabel: 'Progress',
    back: 'Back to board',
    create: 'Create',
    deleteConfirm: 'Delete this todo?',
    titleRequired: 'Enter a title first.',
  },
  diaryPage: {
    title: 'Diary',
    lede: 'A daily log with its own todo list.',
    notesPlaceholder: 'What happened today?',
    save: 'Save',
    saved: 'Saved',
    todosForDay: "Today's todos",
    addTodoPlaceholder: 'Add a todo for this day',
    add: 'Add',
    noDays: 'No entries yet.',
    today: 'Today',
  },
};
