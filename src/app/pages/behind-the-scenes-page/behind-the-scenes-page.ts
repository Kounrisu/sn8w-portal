import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { ChangelogService, type ChangelogCommit } from '../../core/changelog.service';
import { environment } from '../../../environments/environment';

interface CommitDay {
  readonly date: string;
  readonly label: string;
  readonly commits: readonly ChangelogCommit[];
}

interface StackItem {
  readonly name: string;
  readonly note: string;
}

@Component({
  selector: 'sn8w-behind-the-scenes-page',
  imports: [RouterLink],
  templateUrl: './behind-the-scenes-page.html',
  styleUrl: './behind-the-scenes-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BehindTheScenesPage {
  protected readonly i18n = inject(I18nService);
  private readonly changelogService = inject(ChangelogService);

  protected readonly loaded = this.changelogService.loaded;
  protected readonly changelog = this.changelogService.changelog;

  protected readonly version = environment.version;

  /**
   * Deliberately not translated. These are product names and the one-liners
   * next to them are jokes about specific technical choices — a translated
   * pun about PHP on shared hosting is worse in six languages than it is in
   * one.
   */
  protected readonly stack: readonly StackItem[] = [
    { name: 'Angular 22', note: 'Standalone components, signals, zoneless. No NgModules were harmed.' },
    { name: 'TypeScript', note: 'Every UI string is typed, so a missing translation is a build error rather than a blank space on the page.' },
    { name: 'SCSS', note: 'Two themes, one set of custom properties, zero utility classes.' },
    { name: 'Angular Material', note: 'Used for the parts nobody should rewrite: menus, tooltips, the clipboard.' },
    { name: 'PHP + MySQL', note: 'Because the hosting plan offers PHP and not Node. We tried. It does not.' },
    { name: 'GitHub Actions', note: 'Builds, stamps the version, and uploads over SFTP. The whole pipeline is one YAML file.' },
    { name: 'OVH shared hosting', note: 'A folder called www. Sometimes that is genuinely all you need.' },
  ];

  protected readonly days = computed<readonly CommitDay[]>(() => {
    const commits = this.changelog()?.commits ?? [];
    const formatter = new Intl.DateTimeFormat(this.i18n.lang(), { dateStyle: 'full' });

    const byDay = new Map<string, ChangelogCommit[]>();
    for (const commit of commits) {
      // Group on the calendar date in the reader's timezone, not the raw ISO
      // prefix — a late-evening commit in Paris is the previous day in UTC.
      const key = new Date(commit.date).toLocaleDateString('en-CA');
      const bucket = byDay.get(key);
      if (bucket) bucket.push(commit);
      else byDay.set(key, [commit]);
    }

    return [...byDay.entries()].map(([date, dayCommits]) => ({
      date,
      label: formatter.format(new Date(dayCommits[0].date)),
      commits: dayCommits,
    }));
  });

  protected readonly commitCount = computed(() => this.changelog()?.totalCommits ?? 0);

  protected readonly languageCount = this.i18n.supportedLangs.length;

  protected time(iso: string): string {
    return new Intl.DateTimeFormat(this.i18n.lang(), { timeStyle: 'short' }).format(new Date(iso));
  }

  constructor() {
    void this.changelogService.load();
  }
}
