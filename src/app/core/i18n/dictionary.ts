export interface AboutTimelineEntry {
  readonly period: string;
  readonly role: string;
  readonly org: string;
  readonly description: string;
}

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
    themeContrast: string;
    opensInNewTab: string;
    off: string;
  };
  nav: {
    products: string;
    developerTools: string;
    about: string;
    contact: string;
    github: string;
    explore: string;
    openMenu: string;
    closeMenu: string;
    login: string;
    logout: string;
    admin: string;
    todo: string;
    diary: string;
    analytics: string;
    preferences: string;
  };
  hero: {
    kicker: string;
    headlineMain: string;
    headlineAccent: string;
    lede: string;
    stats: readonly { value: string; unit: string; label: string; context: string; score?: number }[];
    ctaPrimary: string;
    ctaSecondary: string;
  };
  aboutSection: {
    kicker: string;
    title: string;
    lede: string;
    timelineLabel: string;
    timeline: readonly AboutTimelineEntry[];
    skillsLabel: string;
    skillsGroups: {
      languages: { label: string; value: string };
      frameworks: { label: string; value: string };
      accessibility: { label: string; value: string };
      training: { label: string; value: string };
      tools: { label: string; value: string };
    };
    interestsLabel: string;
    interestsGroups: {
      languages: { label: string; value: string };
      sport: { label: string; value: string };
      sea: { label: string; value: string };
      watching: { label: string; value: string };
      garage: { label: string; value: string };
      history: { label: string; value: string };
      music: { label: string; value: string };
    };
    certificationsLabel: string;
    certifications: readonly string[];
  };
  flagshipSection: {
    kicker: string;
    title: string;
    lede: string;
    learningNote?: string;
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
  accessibilityExpertise: {
    kicker: string;
    title: string;
    lede: string;
    training: string;
    referenceLabel: string;
    criteria: string;
    topics: string;
    referenceNote: string;
    source: string;
    practices: readonly { title: string; description: string }[];
  };
  ctaSection: {
    title: string;
    lede: string;
  };
  behindTheScenes: {
    kicker: string;
    title: string;
    lede: string;
    stackTitle: string;
    stackLede: string;
    changelogTitle: string;
    changelogLede: string;
    statCommits: string;
    statStack: string;
    statCoffee: string;
    empty: string;
    backHome: string;
    navLabel: string;
  };
  analytics: {
    kicker: string;
    title: string;
    lede: string;
    statViews: string;
    statVisitors: string;
    statAvgTime: string;
    topPagesTitle: string;
    topReferrersTitle: string;
    topProjectsTitle: string;
    dailyTitle: string;
    directReferrer: string;
    noData: string;
    backHome: string;
  };
  sitemap: {
    kicker: string;
    title: string;
    lede: string;
    home: string;
    publicSection: string;
    adminSection: string;
    loginPrompt: string;
  };
  workshop: {
    kicker: string;
    title: string;
    lede: string;
    navLabel: string;
  };
  preferences: {
    kicker: string;
    title: string;
    lede: string;
    fontSizeLabel: string;
    fontSizeHint: string;
    decrease: string;
    increase: string;
    boldTextLabel: string;
    boldTextHint: string;
    dyslexicFontLabel: string;
    dyslexicFontHint: string;
    dyslexicFontLexend: string;
    dyslexicFontAtkinson: string;
    lineHeightLabel: string;
    lineHeightHint: string;
    charSpacingLabel: string;
    charSpacingHint: string;
    themeLabel: string;
    motionLabel: string;
    motionHint: string;
    motionSystem: string;
    motionReduced: string;
    resetButton: string;
    navLabel: string;
    customizedBadge: string;
    previewKicker: string;
    previewHeading: string;
    previewParagraph: string;
    previewParagraph2: string;
  };
  footer: {
    github: string;
    copyEmail: string;
    copied: string;
    copyFailed: string;
    deployedCommit: string;
    deployedAt: string;
    localBuild: string;
    accessibility: string;
    sitemap: string;
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
    renumberButton: string;
    renumbered: string;
    exportButton: string;
    translationHelpTitle: string;
    translationHelpIntro: string;
    translationHelpSteps: readonly string[];
    translationHelpNote: string;
    name: string;
    category: string;
    tagline: string;
    tier: string;
    group: string;
    mockup: string;
    none: string;
    status: string;
    url: string;
    repoUrl: string;
    repoPrivateLabel: string;
    sortOrder: string;
    sortOrderHint: string;
    availability: string;
    availabilityActive: string;
    availabilityInactive: string;
    screenshotLabel: string;
    uploadScreenshot: string;
    removeScreenshot: string;
    activationRequestedPrefix: string;
    markActive: string;
    dismissRequest: string;
    requestBadge: string;
    saved: string;
    created: string;
    deleted: string;
    saving: string;
    confirmDelete: string;
    empty: string;
    tierFlagship: string;
    tierEcosystem: string;
    tierLab: string;
    reorderColumn: string;
    moveUp: string;
    moveDown: string;
  };
  projectCard: {
    visit: string;
    viewSource: string;
    viewProfile: string;
    onlineLabel: string;
    inactiveLabel: string;
    requestAccess: string;
    requestSent: string;
    requestRepoAccess: string;
    repoAccessSubject: string;
    repoAccessBody: string;
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
    diaryBadge: string;
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
    diaryDateLabel: string;
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

export type Lang = 'en' | 'fr';

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  fr: 'Français',
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
    themeFrost: 'Dark',
    themeSquirrel: 'Light',
    themeContrast: 'High contrast',
    opensInNewTab: 'opens in a new tab',
    off: 'Off',
  },
  nav: {
    products: 'Projects',
    developerTools: 'Developer Tools',
    about: 'About',
    contact: 'Contact',
    github: 'GitHub',
    explore: 'Explore projects',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    login: 'Sign in',
    logout: 'Log out',
    admin: 'Admin',
    todo: 'Todo',
    diary: 'Diary',
    analytics: 'Analytics',
    preferences: 'Accessibility settings',
  },
  hero: {
    kicker: 'Open to roles in France and Switzerland',
    headlineMain: 'Philippe Parmentier',
    headlineAccent: "Senior Angular front-end developer",
    lede: "I build shared components and accessible business applications. My work brings together Angular, RGAA accessibility and the day-to-day needs of teams in banking.",
    stats: [
      {
        value: "10+",
        unit: "",
        label: "Years in front-end development",
        context: "Banking environments since 2015",
      },
      {
        value: "JS → 22",
        unit: "",
        label: "Angular migrations",
        context: "Shared component libraries",
      },
      {
        value: "750",
        unit: "/1000",
        label: "Opquast certification",
        context: "Digital quality · 2026",
        score: 750,
      }
    ],
    ctaPrimary: 'See my experience',
    ctaSecondary: 'View on GitHub',
  },
  aboutSection: {
    kicker: 'About',
    title: "Experience & expertise",
    lede: "Since 2015, I have built banking interfaces and supported teams working with Angular and accessibility. My earlier career in industrial process improvement shaped how I document decisions, verify results and work across disciplines.",
    timelineLabel: 'Experience',
    timeline: [
      {
        period: '2015 — Present',
        role: 'Front-End Angular Developer',
        org: 'Banking sector, Paris',
        description:
          "Building and maintaining a shared Angular component library used across a dozen internal applications. Leading migrations from AngularJS to Angular 22, running RGAA accessibility audits, and designing and delivering the accessibility training developers take — building the materials myself and checking the ideas actually land, not just handing off a slide deck. Supporting project teams end to end — from UX workshops and Figma handoff through estimation, integration and CI/CD (Jenkins, SonarQube).",
      },
      {
        period: '2014 — 2015',
        role: 'Freelance Front-End Integrator',
        org: 'Wizzmedia · 3W Agency',
        description:
          'A dozen short freelance missions: PSD/Illustrator-to-responsive integration for e-commerce (PrestaShop), several WordPress builds, and an AngularJS game — across hospitality, industry and e-commerce clients.',
      },
      {
        period: '2012 — 2014',
        role: 'Career switch into web development',
        org: '3WA Web Academy · IESA Multimedia',
        description:
          'Retrained in web development and multimedia — HTML5/CSS3/JavaScript foundations through to a full front-end portfolio, after a decade in industrial process improvement.',
      },
      {
        period: "Six years — United States",
        role: "Continuous Improvement Project Manager",
        org: "Ophthalmic polycarbonate lenses",
        description:
          "Ran cross-functional improvement projects on a polycarbonate spectacle-lens production line: performance indicators (KPIs), and coordination across the production, quality and engineering teams.",
      },
      {
        period: "Three years — United Kingdom",
        role: "Continuous improvement, industrial sites",
        org: "Automotive, then cosmetics",
        description:
          "First roles abroad, on automotive and later cosmetics production lines — workstation analysis, scrap reduction and hands-on support for shop-floor teams, before six years in the United States.",
      },
    ],
    skillsLabel: 'Skills',
    skillsGroups: {
      languages: { label: 'Languages', value: 'HTML5, CSS3, SCSS, JavaScript, TypeScript, SQL, Java, Node.js, PHP' },
      frameworks: { label: 'Frameworks', value: 'Angular (AngularJS – v22), React' },
      accessibility: { label: 'Accessibility & UX', value: 'RGAA, WCAG, digital sobriety audits' },
      training: {
        label: 'Training & mentoring',
        value: 'Designing training materials, running workshops, checking understanding rather than just presenting',
      },
      tools: { label: 'Tools', value: 'Git, GitLab, Jenkins, SonarQube, Jira, Figma, CI/CD' },
    },
    interestsLabel: 'Outside the code',
    interestsGroups: {
      languages: { label: 'Working languages', value: 'French and fluent English' },
      sport: { label: 'Sport', value: "Karate, krav maga, and a lot of walking — Paris daily by Vélib'" },
      sea: { label: 'At sea', value: 'Kitesurfing and coastal sailing, usually at Le Grau-du-Roi near Montpellier' },
      watching: { label: 'Watching', value: "Korean and Japanese series, which is where this site's mood comes from" },
      garage: { label: 'Garage', value: 'A Buell brought back from the United States' },
      history: { label: 'History', value: 'Second World War reenactment, done in England — and the itch to pick it up again in France, on the US Army side' },
      music: { label: 'Music', value: 'Learning the guitar. On the listening side: country, some international rap, and Manau' },
    },
    certificationsLabel: 'Certifications & training',
    certifications: [
      "Ongoing intensive learning: Claude Code, ChatGPT and Frontend Masters",
      'Plastics engineering degree — ESP, now part of INSA Lyon',
      'Opquast — Digital Quality Reference Framework, 750/1000 (2026)',
      'Access42 — Web Accessibility Training (2020)',
      'TOEFL iBT 105/120 — fluent English (2010)',
      'Coastal boating licence · driving licence (category B)',
      'CAP Pâtissier and CAP Chocolatier — sat as an independent candidate, for the pleasure of learning',
    ],
  },
  flagshipSection: {
    kicker: 'Selected projects',
    title: "Selected projects",
    lede: "Managing my books, exploring economics, learning a language or creating a game: these applications grow out of my needs and curiosity. All are works in progress, with a shared aim: simple, accessible interfaces that work across screen sizes.",
    learningNote: "I build them to learn, from frontend and backend development to data processing and deployment. I am expanding my practice beyond Angular into React, Python, Java, SQL and DevOps, while working on code quality and security. I also experiment with AI and local tools to improve how I design, test and refine my applications, taking cost and privacy into account. The pleasure stays the same: working through the challenges of an idea, however simple, and seeing it become useful.",
    followBuild: 'Follow along on GitHub',
  },
  status: {
    live: 'Live',
    inDevelopment: 'In development',
    concept: 'Concept',
    prototype: 'Prototype',
  },
  ecosystemSection: {
    kicker: 'More projects',
    title: 'Learning by building, discovering by trying',
    lede: 'Every one of these starts from curiosity — a technology I want to try, an idea I want to see running. It is how I learn best, and mostly it is what makes the whole thing fun.',
    groups: {
      developerTools: 'Developer Tools',
      finance: 'Finance',
      consumer: 'Consumer',
      other: 'Other',
    },
  },
  principlesSection: {
    kicker: 'Delivery standards',
    title: "How I work",
    lede: "Shared components, accessibility checks and documented decisions: the practices I bring to a development team.",
    items: {
      accessibility: {
        title: 'Accessibility by design',
        description: 'RGAA and WCAG considered from structure to interaction, then checked before release.',
      },
      architecture: {
        title: 'Modern Angular architecture',
        description: 'Standalone components, signals and zoneless patterns where they simplify long-lived code.',
      },
      responsive: {
        title: 'Responsive operations',
        description: 'Dense interfaces that remain usable on small screens without hiding the important work.',
      },
      performance: {
        title: 'Performance',
        description: 'Small bundles, predictable interactions and no unnecessary framework weight.',
      },
      designSystems: {
        title: 'Reusable systems',
        description: 'Typed components, tokens and documentation so teams reuse instead of reimplementing.',
      },
      testing: {
        title: 'Quality gates',
        description: 'Unit tests, accessibility audits, SonarQube and CI/CD treated as delivery tools.',
      },
      ux: {
        title: 'Useful UX',
        description: 'Workflows designed for people who return to the same screens every day.',
      },
    },
  },
  labSection: {
    kicker: 'Experiments',
    title: 'Just for fun',
    lede: 'Ideas explored out of curiosity, to learn new technologies and approaches.',
    tag: '[prototype]',
  },
  accessibilityExpertise: {
    kicker: 'Angular & accessibility',
    title: 'Accessibility is part of development.',
    lede: 'I help teams build accessible business applications: shared Angular components, RGAA/WCAG checks and support for developers.',
    training: 'Access42 accessibility training · 2020',
    referenceLabel: 'The French accessibility reference',
    criteria: 'Assessment criteria',
    topics: 'Topics',
    referenceNote:
      'Scope of the RGAA 4.1.2 reference. These figures are not an audit result or a compliance score for this site.',
    source: 'Explore the official RGAA reference',
    practices: [
      {
        title: 'Assess the interface',
        description:
          'Review semantic structure, keyboard navigation, focus, forms and contrast. Combine automated checks with the manual verification each criterion requires.',
      },
      {
        title: 'Improve shared components',
        description:
          'Resolve issues in Angular components and check the user journeys that depend on them. Document behavior and watch for regressions.',
      },
      {
        title: 'Support the team',
        description:
          'Create training materials, run accessibility sessions and help developers apply the principles in their everyday work.',
      },
    ],
  },
  ctaSection: {
    title: 'Get in touch.',
    lede: 'A question, an idea, or just want to chat?',
  },
  behindTheScenes: {
    kicker: 'Behind the scenes',
    title: 'How this site is actually held together',
    lede: 'Every push to main builds the app, stamps it with a version and a timestamp, and drops it onto a small shared host. No staging, no ceremony. If you are reading this, it worked.',
    stackTitle: 'What it runs on',
    stackLede: 'Nothing exotic. Boring technology, chosen so the interesting part can be the interface.',
    changelogTitle: 'Everything that has happened here',
    changelogLede: 'Straight from the git log — no editing, no tidying up. The awkward commits stay in.',
    statCommits: 'commits',
    statStack: 'website languages',
    statCoffee: 'undocumented coffees',
    empty: 'The changelog has not been generated for this build. Run npm run changelog.',
    backHome: 'Back to the site',
    navLabel: 'Behind the scenes',
  },
  analytics: {
    kicker: 'Site analytics',
    title: 'Who is visiting',
    lede: 'Self-hosted, cookie-free visit logging — no third party, no tracking beyond what is shown here.',
    statViews: 'Page views',
    statVisitors: 'Unique visitors',
    statAvgTime: 'Avg. time on page',
    topPagesTitle: 'Top pages',
    topReferrersTitle: 'Top referrers',
    topProjectsTitle: 'Project clicks',
    dailyTitle: 'Last 30 days',
    directReferrer: '(direct)',
    noData: 'No visits recorded yet.',
    backHome: 'Back to the site',
  },
  sitemap: {
    kicker: 'Sitemap',
    title: 'Every page on this site',
    lede: 'A plain list of every page, for readers who prefer it to clicking around.',
    home: 'Home',
    publicSection: 'Public pages',
    adminSection: 'Admin pages',
    loginPrompt: 'Sign in to see the admin pages.',
  },
  workshop: {
    kicker: 'Workshop',
    title: 'Welcome to the Workshop',
    lede: "Work in progress. This is where accessible components get tested and refined, and where I'll keep notes as it comes together.",
    navLabel: 'Workshop',
  },
  preferences: {
    kicker: 'Accessibility',
    title: 'Make this site easier to read',
    lede: 'These settings are saved on this device and apply everywhere on the site, not just here.',
    fontSizeLabel: 'Text size',
    fontSizeHint: 'Scales every heading and paragraph on the site, not just this page.',
    decrease: 'Smaller text',
    increase: 'Larger text',
    boldTextLabel: 'Bolder text',
    boldTextHint: 'Increases the weight of body text for easier reading. Headings are unaffected — they are already bold by design.',
    dyslexicFontLabel: 'Dyslexia-friendly font',
    dyslexicFontHint: 'Lexend improves reading speed; Atkinson Hyperlegible (from the Braille Institute) is designed to make similar-looking characters easier to tell apart.',
    dyslexicFontLexend: 'Lexend',
    dyslexicFontAtkinson: 'Atkinson Hyperlegible',
    lineHeightLabel: 'Line height',
    lineHeightHint: 'Increases the spacing between lines, up to the WCAG 1.4.12 minimum and beyond — independent of letter/word spacing.',
    charSpacingLabel: 'Letter & word spacing',
    charSpacingHint: 'Widens the spacing between letters and words, up to the WCAG 1.4.12 minimum and beyond.',
    themeLabel: 'Colour theme',
    motionLabel: 'Motion',
    motionHint: "Turns off animations and transitions site-wide, beyond what your device's own reduce-motion setting already covers.",
    motionSystem: 'Match my device',
    motionReduced: 'Reduce motion',
    resetButton: 'Reset to defaults',
    navLabel: 'Accessibility settings',
    customizedBadge: 'customized',
    previewKicker: 'Preview',
    previewHeading: 'A sample heading',
    previewParagraph: 'This paragraph updates live as you change the settings above, so you can see exactly how text size, weight, spacing and typeface affect real content before leaving this page.',
    previewParagraph2: 'A second paragraph, so you can compare how consistent the effect looks across more than one block of text — spacing, weight and typeface all apply the same way here as everywhere else on the site.',
  },
  footer: {
    github: 'GitHub',
    copyEmail: 'Copy email',
    copied: 'Email address copied',
    copyFailed: 'Could not copy email address',
    deployedCommit: 'Deployed commit',
    deployedAt: 'deployed',
    localBuild: 'local build',
    accessibility: 'Accessibility',
    sitemap: 'Sitemap',
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
    title: 'Administer projects',
    lede: 'Add, edit and remove the projects shown on the landing page.',
    newProject: 'New project',
    renumberButton: 'Renumber all',
    renumbered: 'Sort order cleaned up',
    exportButton: 'Export for translation',
    translationHelpTitle: 'Translating project content',
    translationHelpIntro:
      'Project names, categories and taglines are stored in the database in English and translated into French. To add or update the French translation for a project:',
    translationHelpSteps: [
      'Add or edit the project below in English — it is fine to leave the category or tagline empty and ask Claude to write it.',
      'Click "Export for translation" to download a JSON file of the current project list.',
      'Give the file to Claude and ask it to translate the new or changed projects.',
      'Claude will generate a numbered SQL file under api/migrations/ with the translations.',
      'Open phpMyAdmin, go to the Import tab, select "utf-8" as the character set, and import that SQL file.',
    ],
    translationHelpNote:
      'The character set matters: phpMyAdmin does not default to UTF-8, and importing without it will corrupt accented and non-Latin text.',
    name: 'Name',
    category: 'Category',
    tagline: 'Tagline',
    tier: 'Tier',
    group: 'Ecosystem group',
    mockup: 'Flagship mockup',
    none: 'None',
    status: 'Status',
    url: 'URL',
    repoUrl: 'Git repository',
    repoPrivateLabel: 'Private repository',
    sortOrder: 'Sort order',
    sortOrderHint: 'Lower numbers show first, among projects in the same tier/group.',
    availability: 'Availability',
    availabilityActive: 'Online',
    availabilityInactive: 'Offline',
    screenshotLabel: 'Screenshot',
    uploadScreenshot: 'Upload screenshot',
    removeScreenshot: 'Remove screenshot',
    activationRequestedPrefix: 'A visitor asked for this project to be activated.',
    markActive: 'Mark active',
    dismissRequest: 'Dismiss',
    requestBadge: 'Requested',
    saved: 'Saved',
    created: 'Project created',
    deleted: 'Project deleted',
    saving: 'Saving…',
    confirmDelete: 'Delete this project?',
    empty: 'No projects yet.',
    tierFlagship: 'Flagship',
    tierEcosystem: 'Ecosystem',
    tierLab: 'Lab',
    reorderColumn: 'Reorder',
    moveUp: 'Move up',
    moveDown: 'Move down',
  },
  projectCard: {
    visit: 'Visit',
    viewSource: 'View source',
    viewProfile: 'View GitHub profile',
    onlineLabel: 'Online',
    inactiveLabel: 'Offline',
    requestAccess: 'Request access',
    requestSent: 'Request sent',
    requestRepoAccess: 'Request access',
    repoAccessSubject: 'Repo access request: {name}',
    repoAccessBody: "Hi, I'd like to see the source for {name}.",
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
    diaryBadge: 'Diary',
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
    diaryDateLabel: 'Diary day (optional)',
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
