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
});
