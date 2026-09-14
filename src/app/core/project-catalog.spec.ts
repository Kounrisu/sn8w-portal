import { homepageProjects, visibleProjects, projectTheme } from './project-catalog';
import type { Project } from './models';

describe('Public project selection', () => {
  const rows = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1, name: `Project ${i}`, tier: 'lab', tagline: 'Description', sortOrder: 15 - i,
    showInShowcase: i < 13, featuredOnHome: i !== 12,
  } as Project));
  it('counts only visible entries and limits the homepage to six featured entries in order', () => {
    expect(visibleProjects(rows)).toHaveLength(13);
    expect(homepageProjects(rows).map(p => p.id)).toEqual([12, 11, 10, 9, 8, 7]);
    expect(homepageProjects(rows).some(p => !p.showInShowcase)).toBe(false);
  });
  it('supports legacy data while respecting explicit visibility and theme choices', () => {
    const legacy = { ...rows[0], name: 'Kanji', tier: 'flagship', showInShowcase: undefined, featuredOnHome: undefined } as Project;
    expect(homepageProjects([legacy])).toHaveLength(1);
    expect(visibleProjects([{ ...legacy, showInShowcase: false }])).toHaveLength(0);
    expect(projectTheme(legacy)).toBe('learning');
    expect(projectTheme({ ...legacy, projectTheme: 'sandbox' })).toBe('sandbox');
  });
});
