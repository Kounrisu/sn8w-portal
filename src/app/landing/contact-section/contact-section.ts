import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { PROFILES } from '../../core/profiles';
import { ExternalLinkDirective } from '../../shared/external-link.directive';
import { CONTACT_COPY } from '../../core/i18n/contact-copy';
import { ContactForm } from '../contact-form/contact-form';

@Component({
  selector: 'sn8w-contact-section',
  imports: [ExternalLinkDirective, ContactForm],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactSection {
  protected readonly i18n = inject(I18nService);
  protected readonly profiles = PROFILES;
  protected readonly altLabel = computed(() => CONTACT_COPY[this.i18n.lang()].form.orEmail);
}
