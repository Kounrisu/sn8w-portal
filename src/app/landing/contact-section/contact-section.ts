import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../core/i18n/i18n.service';
import { PROFILES } from '../../core/profiles';
import { ExternalLinkDirective } from '../../shared/external-link.directive';

@Component({
  selector: 'sn8w-contact-section',
  imports: [MatIconModule, ExternalLinkDirective],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSection {
  protected readonly i18n = inject(I18nService);
  protected readonly profiles = PROFILES;
}
