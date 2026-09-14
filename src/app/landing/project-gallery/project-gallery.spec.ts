import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ProjectGallery } from './project-gallery';
import { I18nService } from '../../core/i18n/i18n.service';
import type { Project } from '../../core/models';

describe('Project screenshot gallery', () => {
  const project = {
    id: 1,
    name: 'Books',
    screenshot: '/images/projects/books/library.webp',
    screenshots: ['/images/projects/books/library.webp', '/images/projects/books/locations.webp'],
  } as unknown as Project;
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ProjectGallery],
      providers: [{ provide: I18nService, useValue: { lang: signal('en') } }],
    }),
  );

  it('keeps legacy cover images, deduplicates the gallery and does not link pictures to the app', () => {
    const fixture = TestBed.createComponent(ProjectGallery);
    fixture.componentRef.setInput('project', { ...project, url: 'https://example.com' });
    fixture.detectChanges();
    expect(fixture.componentInstance.images()).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.querySelector('.expanded')).toBeNull();
    fixture.componentRef.setInput('project', { ...project, screenshots: undefined });
    fixture.detectChanges();
    expect(fixture.componentInstance.images()).toEqual([project.screenshot]);
  });

  it('wraps navigation in both directions and opens at the requested image', () => {
    const fixture = TestBed.createComponent(ProjectGallery);
    fixture.componentRef.setInput('project', project);
    const gallery = fixture.componentInstance;
    const dialog = { showModal: () => {} } as HTMLDialogElement;
    gallery.open(dialog, 1);
    expect(gallery.opened()).toBe(true);
    gallery.move(1);
    expect(gallery.selected()).toBe(0);
    gallery.move(-1);
    expect(gallery.selected()).toBe(1);
  });

  it('changes the inline image with controls and clamps selection when images are removed', () => {
    const fixture = TestBed.createComponent(ProjectGallery);
    fixture.componentRef.setInput('project', project);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.inline-controls button:last-child').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.cover img').getAttribute('src')).toContain(
      'locations.preview.webp',
    );
    expect(fixture.nativeElement.querySelector('dialog').open).toBe(false);
    expect(fixture.nativeElement.querySelector('.thumbnails')).toBeNull();
    fixture.componentRef.setInput('project', { ...project, screenshots: [] });
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    expect(fixture.nativeElement.querySelector('.inline-controls button')).toBeNull();
    fixture.componentInstance.move(1);
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it('keeps translated captions attached to image paths after reordering and renders them as text', () => {
    const fixture = TestBed.createComponent(ProjectGallery);
    const path = project.screenshots![1];
    fixture.componentRef.setInput('project', {
      ...project,
      screenshotCaptions: { [path]: { en: '<b>Locations</b>', fr: 'Emplacements' } },
    });
    const gallery = fixture.componentInstance;
    gallery.open({ showModal: () => {} } as HTMLDialogElement, 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('figcaption').textContent).toBe('<b>Locations</b>');
    expect(fixture.nativeElement.querySelector('figcaption b')).toBeNull();
    TestBed.inject(I18nService).lang.set('fr');
    fixture.detectChanges();
    expect(gallery.caption()).toBe('Emplacements');
    fixture.componentRef.setInput('project', {
      ...project,
      screenshot: path,
      screenshots: [project.screenshot],
      screenshotCaptions: { [path]: { fr: 'Emplacements' } },
    });
    gallery.selected.set(0);
    fixture.detectChanges();
    expect(gallery.caption()).toBe('Emplacements');
  });

  it('uses initial captions for known screenshots but respects explicitly blank saved captions', () => {
    const fixture = TestBed.createComponent(ProjectGallery);
    const path = '/images/projects/books/books-library.webp';
    fixture.componentRef.setInput('project', { ...project, screenshot: path, screenshots: [] });
    expect(fixture.componentInstance.caption()).toContain('Browse covers');
    fixture.componentRef.setInput('project', {
      ...project,
      screenshot: path,
      screenshots: [],
      screenshotCaptions: { [path]: { en: '' } },
    });
    expect(fixture.componentInstance.caption()).toBe('');
    fixture.componentRef.setInput('project', { ...project, screenshot: null, screenshots: [] });
    fixture.detectChanges();
    fixture.componentInstance.move(1);
    expect(fixture.nativeElement.querySelector('.gallery')).toBeNull();
  });
});
