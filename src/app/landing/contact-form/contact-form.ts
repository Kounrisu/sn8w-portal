import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { I18nService } from '../../core/i18n/i18n.service';
import { CONTACT_COPY } from '../../core/i18n/contact-copy';
import { ContactService } from '../../core/contact.service';

type FieldName = 'name' | 'email' | 'message' | 'consent';
const FIELD_ORDER: readonly FieldName[] = ['name', 'email', 'message', 'consent'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public contact form. Validation is mirrored on the server (api/contact.php,
 * which is the one that counts); here it only gives fast, accessible feedback:
 * every error is a text tied to its field (aria-describedby / aria-invalid),
 * an error summary with links to each field takes focus, and the outcome is announced in a
 * role="status" region.
 */
@Component({
  selector: 'sn8w-contact-form',
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm {
  private readonly i18n = inject(I18nService);
  private readonly contact = inject(ContactService);
  private readonly injector = inject(Injector);

  protected readonly copy = computed(() => CONTACT_COPY[this.i18n.lang()].form);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly message = signal('');
  protected readonly consent = signal(false);
  protected readonly website = signal(''); // honeypot

  /** field -> error code (e.g. "required"); the text comes from the copy. */
  protected readonly errors = signal<Partial<Record<FieldName, string>>>({});
  protected readonly state = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  protected readonly serverError = signal('');
  protected readonly hasErrors = computed(() => Object.keys(this.errors()).length > 0);

  /** Fields checked on blur and found valid: they get the green state (border, check mark and text). */
  protected readonly validated = signal<Partial<Record<FieldName, true>>>({});

  protected readonly invalidFields = computed(() => FIELD_ORDER.filter((f) => this.errors()[f]));

  private openedAt = Date.now();

  protected errorText(field: FieldName): string {
    const code = this.errors()[field];
    return code ? (this.copy().errors[`${field}.${code}`] ?? '') : '';
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  protected isValid(field: FieldName): boolean {
    return !!this.validated()[field] && !this.errors()[field];
  }

  /** Validate one field when the person leaves it (skipped while empty, so tabbing through shows nothing). */
  protected check(field: FieldName): void {
    const filled = { name: this.name(), email: this.email(), message: this.message() }[field as 'name' | 'email' | 'message'];
    if (!filled?.trim()) return;
    const code = this.validate()[field];
    if (code) {
      this.errors.update((e) => ({ ...e, [field]: code }));
      this.validated.update(({ [field]: _v, ...rest }) => rest);
    } else {
      this.validated.update((v) => ({ ...v, [field]: true }));
    }
  }

  protected clear(field: FieldName): void {
    this.validated.update(({ [field]: _v, ...rest }) => rest);
    if (this.errors()[field]) {
      this.errors.update(({ [field]: _removed, ...rest }) => rest);
    }
  }

  private validate(): Partial<Record<FieldName, string>> {
    const errors: Partial<Record<FieldName, string>> = {};
    const name = this.name().trim();
    const email = this.email().trim();
    const message = this.message().trim();
    if (!name) errors.name = 'required';
    else if (name.length > 100) errors.name = 'too_long';
    if (!email) errors.email = 'required';
    else if (email.length > 254 || !EMAIL_PATTERN.test(email)) errors.email = 'invalid';
    if (!message) errors.message = 'required';
    else if (message.length < 10) errors.message = 'too_short';
    else if (message.length > 5000) errors.message = 'too_long';
    if (!this.consent()) errors.consent = 'required';
    return errors;
  }

  /** The error summary (rendered after the errors signal changes) takes focus, as in the French State design system. */
  private focusFirstInvalid(errors: Partial<Record<FieldName, string>>): void {
    if (FIELD_ORDER.some((f) => errors[f])) {
      afterNextRender(() => document.getElementById('cf-summary')?.focus(), { injector: this.injector });
    }
  }

  /** Summary links move focus to the field itself (a plain #hash would not reach a form control reliably). */
  protected goToField(event: Event, field: FieldName): void {
    event.preventDefault();
    document.getElementById(`cf-${field}`)?.focus();
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.state() === 'sending') return;

    this.serverError.set('');
    const errors = this.validate();
    this.errors.set(errors);
    if (Object.keys(errors).length > 0) {
      this.state.set('error');
      this.focusFirstInvalid(errors);
      return;
    }

    this.state.set('sending');
    try {
      await this.contact.send({
        name: this.name().trim(),
        email: this.email().trim(),
        message: this.message().trim(),
        consent: this.consent(),
        lang: this.i18n.lang(),
        website: this.website(),
        elapsedMs: Date.now() - this.openedAt,
      });
      this.name.set('');
      this.email.set('');
      this.message.set('');
      this.consent.set(false);
      this.errors.set({});
      this.validated.set({});
      this.openedAt = Date.now();
      this.state.set('sent');
      // The status region is empty (display: none) until Angular renders the message.
      afterNextRender(() => document.getElementById('cf-status')?.focus(), { injector: this.injector });
    } catch (e) {
      this.state.set('error');
      const copy = this.copy();
      if (e instanceof HttpErrorResponse && e.status === 422 && e.error?.error === 'validation') {
        const fields = (e.error.fields ?? {}) as Partial<Record<FieldName, string>>;
        this.errors.set(fields);
        this.focusFirstInvalid(fields);
      } else if (e instanceof HttpErrorResponse && e.status === 422 && e.error?.error === 'too_fast') {
        this.serverError.set(copy.server['too_fast']);
      } else if (e instanceof HttpErrorResponse && e.status === 429) {
        this.serverError.set(copy.server['rate_limited']);
      } else {
        this.serverError.set(copy.server['generic']);
      }
    }
  }
}
