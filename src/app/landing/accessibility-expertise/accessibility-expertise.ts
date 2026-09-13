import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../core/i18n/i18n.service';
import { StackRevealDirective } from '../../core/stack-reveal.directive';
import { ExternalLinkDirective } from '../../shared/external-link.directive';

@Component({
  selector: 'sn8w-accessibility-expertise',
  imports: [MatIconModule, ExternalLinkDirective],
  hostDirectives: [StackRevealDirective],
  templateUrl: './accessibility-expertise.html',
  styleUrl: './accessibility-expertise.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessibilityExpertise {
  protected readonly i18n = inject(I18nService);
  protected readonly criteria = Array.from({ length: 106 }, (_, index) => index);
  protected readonly icons = ['fact_check', 'code', 'groups'];
}
