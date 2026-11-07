import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { CONTACT_COPY } from '../../core/i18n/contact-copy';
import { ContactService, type ContactMessage } from '../../core/contact.service';
import { SpotlightDirective } from '../../shared/spotlight.directive';

/** Admin: messages received through the contact form (api/contact-messages.php). */
@Component({
  selector: 'sn8w-messages-page',
  imports: [RouterLink, SpotlightDirective],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesPage implements OnInit {
  private readonly i18n = inject(I18nService);
  private readonly contact = inject(ContactService);

  protected readonly copy = computed(() => CONTACT_COPY[this.i18n.lang()].admin);
  protected readonly messages = signal<readonly ContactMessage[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly unread = computed(() => this.messages().filter((m) => !m.read).length);

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.contact.list();
      this.messages.set(data.messages);
      this.failed.set(false);
    } catch {
      this.failed.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected async toggleRead(message: ContactMessage): Promise<void> {
    const updated = await this.contact.setRead(message.id, !message.read);
    this.messages.update((list) => list.map((m) => (m.id === updated.id ? updated : m)));
  }

  protected async remove(message: ContactMessage): Promise<void> {
    if (!confirm(this.copy().confirmRemove)) return;
    await this.contact.remove(message.id);
    this.messages.update((list) => list.filter((m) => m.id !== message.id));
    // Keep keyboard users in place: the deleted item's buttons are gone.
    queueMicrotask(() => document.getElementById('messages-title')?.focus());
  }

  /** MySQL gives UTC as "YYYY-MM-DD HH:MM:SS". */
  protected formatDate(value: string): string {
    const date = new Date(value.replace(' ', 'T') + 'Z');
    return new Intl.DateTimeFormat(this.i18n.lang(), { dateStyle: 'long', timeStyle: 'short' }).format(date);
  }
}
