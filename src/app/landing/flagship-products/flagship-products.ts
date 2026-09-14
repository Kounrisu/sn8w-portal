import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProjectCard } from '../project-card/project-card';
import { ProjectCount } from '../project-count/project-count';
import { CATALOG_COPY } from '../../core/project-catalog';
import { ProjectsService } from '../../core/projects.service';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'sn8w-flagship-products',
  imports: [ProjectCard, ProjectCount, RouterLink, MatIconModule],
  templateUrl: './flagship-products.html',
  styleUrl: './flagship-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagshipProducts {
  protected readonly i18n = inject(I18nService);
  protected readonly projects = inject(ProjectsService);
  protected copy() { return CATALOG_COPY[this.i18n.lang()]; }
}
