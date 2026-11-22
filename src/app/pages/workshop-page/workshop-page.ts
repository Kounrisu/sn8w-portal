import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { posts, type Category } from './workshop-posts';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { DESIGN_SYSTEM_COPY } from '../../core/i18n/design-system-copy';
import { ExternalLinkDirective } from '../../shared/external-link.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';

@Component({
  selector: 'sn8w-workshop-page',
  imports: [NgTemplateOutlet, RouterLink, ExternalLinkDirective, SpotlightDirective],
  templateUrl: './workshop-page.html',
  styleUrl: './workshop-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopPage {
  protected readonly i18n = inject(I18nService);
  protected readonly ds = computed(() => DESIGN_SYSTEM_COPY[this.i18n.lang()]);

  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly lang = this.i18n.lang;
  protected readonly slug = computed(() => this.params().get('slug'));
  protected readonly post = computed(() => posts.find(entry => entry.slug === this.slug()));
  protected readonly categories = ['all', 'project', 'webapp', 'component', 'tool', 'article'] as const;
  protected readonly filter = computed(() => this.categories.find(key => key === this.query().get('type')) ?? 'all');
  private readonly filtered = computed(() => posts.filter(entry => this.filter() === 'all' || entry.categories.includes(this.filter() as Category)));
  protected readonly systems = computed(() => ['design-system-sn8w', 'premiers-composants']
    .flatMap(slug => this.filtered().filter(entry => entry.slug === slug)));
  protected readonly feed = computed(() => this.filtered().filter(entry => !this.systems().includes(entry)));
  protected readonly labels = computed(() => this.lang() === 'fr'
    ? { all: 'Tout', article: 'Articles', webapp: 'Applications web', read: 'Lire l’article', empty: 'Aucun article publié pour le moment.', project: 'Projets', tool: 'Outils', component: 'Composants', filter: 'Filtrer les billets', visit: 'Voir le projet', favorite: 'Coup de cœur', topFavorite: 'Grand coup de cœur · deux cœurs', back: 'Retour au journal', private: 'Aperçu privé', missing: 'Billet introuvable' }
    : { all: 'All', article: 'Articles', webapp: 'Web apps', read: 'Read article', empty: 'No articles published yet.', project: 'Projects', tool: 'Tools', component: 'Components', filter: 'Filter posts', visit: 'View project', favorite: 'Personal favourite', topFavorite: 'Top favourite · two hearts', back: 'Back to the journal', private: 'Private preview', missing: 'Post not found' });
  protected tagLabel(category: Category) {
    const names = this.lang() === 'fr'
      ? { project: 'Projet', webapp: 'Application web', tool: 'Outil', article: 'Article', component: 'Composant' }
      : { project: 'Project', webapp: 'Web app', tool: 'Tool', article: 'Article', component: 'Component' };
    return names[category];
  }

  protected formatDate(value: string) {
    return new Intl.DateTimeFormat(this.lang(), { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(value));
  }

  /** The design system's pages, in order: [route, label key]. */
  protected readonly dsPages = [
    { path: ['/design-system'], key: 'intro' },
    { path: ['/design-system', 'foundations'], key: 'foundations' },
    { path: ['/design-system', 'components'], key: 'components' },
    { path: ['/design-system', 'patterns'], key: 'patterns' },
    { path: ['/design-system', 'accessibility'], key: 'accessibility' },
    { path: ['/design-system', 'governance'], key: 'governance' },
  ] as const;
}
