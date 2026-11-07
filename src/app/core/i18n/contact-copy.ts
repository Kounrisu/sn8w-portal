import type { Lang } from './dictionary';

/**
 * Copy for the contact form (public) and the Messages page (admin). Kept out
 * of the main dictionary, like the design-system copy, but still typed: `fr`
 * must satisfy the shape of `en`.
 */
const en = {
  form: {
    title: 'Send me a message',
    lede: 'I usually answer within a few days.',
    name: 'Name',
    email: 'Email address',
    emailHint: 'So that I can answer you.',
    message: 'Message',
    messageHint: '10 to 5,000 characters.',
    consent:
      'I agree that my name, email address and message are used to answer me. They are kept for 6 months at most; write to me to have them deleted earlier.',
    send: 'Send the message',
    sending: 'Sending…',
    sent: 'Thank you, your message has been sent. I will answer as soon as possible.',
    errorsTitle: 'The message was not sent. Please correct the highlighted fields.',
    orEmail: 'Or write directly:',
    errors: {
      'name.required': 'Enter your name.',
      'name.too_long': 'The name is too long (100 characters maximum).',
      'email.required': 'Enter your email address.',
      'email.invalid': 'Enter a valid email address, like name@domain.com.',
      'message.required': 'Write a message.',
      'message.too_short': 'The message is too short (10 characters minimum).',
      'message.too_long': 'The message is too long (5,000 characters maximum).',
      'consent.required': 'Tick the box to agree before sending.',
    } as Record<string, string>,
    server: {
      too_fast: 'That was very quick. Please try again in a moment.',
      rate_limited: 'Too many messages from your connection. Please try again later, or write by email.',
      generic: 'The message could not be sent. Please try again, or write by email.',
    } as Record<string, string>,
  },
  admin: {
    title: 'Messages',
    lede: 'Messages received through the contact form. They are deleted automatically after 6 months.',
    refresh: 'Refresh',
    empty: 'No message yet.',
    unread: 'New',
    unreadCount: 'unread',
    markRead: 'Mark as read',
    markUnread: 'Mark as unread',
    remove: 'Delete',
    confirmRemove: 'Delete this message? This cannot be undone.',
    reply: 'Reply by email',
    mailFailed: 'The email notification failed: this message is only stored here.',
    loadError: 'The messages could not be loaded.',
    from: 'From',
    received: 'Received',
    back: 'Back to the site',
  },
};

export type ContactCopy = typeof en;

const fr: ContactCopy = {
  form: {
    title: 'M’envoyer un message',
    lede: 'Je réponds en général sous quelques jours.',
    name: 'Nom',
    email: 'Adresse e-mail',
    emailHint: 'Pour pouvoir vous répondre.',
    message: 'Message',
    messageHint: 'De 10 à 5 000 caractères.',
    consent:
      'J’accepte que mon nom, mon adresse e-mail et mon message soient utilisés pour me répondre. Ils sont conservés 6 mois au maximum ; écrivez-moi pour les faire supprimer plus tôt.',
    send: 'Envoyer le message',
    sending: 'Envoi en cours…',
    sent: 'Merci, votre message a bien été envoyé. Je vous répondrai dès que possible.',
    errorsTitle: 'Le message n’a pas été envoyé. Corrigez les champs signalés.',
    orEmail: 'Ou écrivez directement :',
    errors: {
      'name.required': 'Indiquez votre nom.',
      'name.too_long': 'Le nom est trop long (100 caractères maximum).',
      'email.required': 'Indiquez votre adresse e-mail.',
      'email.invalid': 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.',
      'message.required': 'Écrivez un message.',
      'message.too_short': 'Le message est trop court (10 caractères minimum).',
      'message.too_long': 'Le message est trop long (5 000 caractères maximum).',
      'consent.required': 'Cochez la case pour accepter avant d’envoyer.',
    },
    server: {
      too_fast: 'C’était très rapide. Réessayez dans un instant.',
      rate_limited: 'Trop de messages depuis votre connexion. Réessayez plus tard, ou écrivez par e-mail.',
      generic: 'Le message n’a pas pu être envoyé. Réessayez, ou écrivez par e-mail.',
    },
  },
  admin: {
    title: 'Messages',
    lede: 'Messages reçus par le formulaire de contact. Ils sont supprimés automatiquement après 6 mois.',
    refresh: 'Actualiser',
    empty: 'Aucun message pour l’instant.',
    unread: 'Nouveau',
    unreadCount: 'non lus',
    markRead: 'Marquer comme lu',
    markUnread: 'Marquer comme non lu',
    remove: 'Supprimer',
    confirmRemove: 'Supprimer ce message ? Cette action est définitive.',
    reply: 'Répondre par e-mail',
    mailFailed: 'La notification par e-mail a échoué : ce message n’est conservé qu’ici.',
    loadError: 'Les messages n’ont pas pu être chargés.',
    from: 'De',
    received: 'Reçu le',
    back: 'Retour au site',
  },
};

export const CONTACT_COPY: Record<Lang, ContactCopy> = { en, fr };
