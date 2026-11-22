import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';
import { ICON_NAMES, ICONS } from './icons.generated';

@Component({
  imports: [Icon],
  template: `<sn8w-icon name="mail" /><sn8w-icon name="search" title="Search <now>" [size]="18" />`,
})
class Host {}

describe('Icon (SN8W icons)', () => {
  it('hides a decorative icon and names a meaningful one, escaping the title', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [decorative, named] = Array.from(fixture.nativeElement.querySelectorAll('svg')) as SVGElement[];
    expect(decorative.getAttribute('aria-hidden')).toBe('true');
    expect(decorative.getAttribute('fill')).toBe('currentColor');
    expect(named.getAttribute('role')).toBe('img');
    expect(named.querySelector('title')?.textContent).toBe('Search <now>');
    expect((fixture.nativeElement.querySelectorAll('sn8w-icon')[1] as HTMLElement).style.width).toBe('18px');
  });

  it('has a drawing made only of shapes for every name', () => {
    for (const name of ICON_NAMES) {
      expect(ICONS[name]).toMatch(/^(<(path|circle|rect|line|polyline|polygon|ellipse)\b[^<>]*\/>)+$/);
    }
  });
});
