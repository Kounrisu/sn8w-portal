import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Hero } from '../../landing/hero/hero';
import { AboutExperience } from '../../landing/about-experience/about-experience';
import { FlagshipProducts } from '../../landing/flagship-products/flagship-products';
import { ProductEcosystem } from '../../landing/product-ecosystem/product-ecosystem';
import { EngineeringPrinciples } from '../../landing/engineering-principles/engineering-principles';
import { ProductLab } from '../../landing/product-lab/product-lab';
import { FinalCta } from '../../landing/final-cta/final-cta';

@Component({
  selector: 'sn8w-landing-page',
  // Unstyled custom elements default to `display: inline`, which would make
  // this wrapper the containing block for the sections' layout and for the
  // hero's fixed video backdrop. `display: contents` makes it transparent to
  // layout instead, so <main> is the sections' true parent.
  styles: ':host { display: contents; }',
  imports: [
    Hero,
    AboutExperience,
    FlagshipProducts,
    ProductEcosystem,
    EngineeringPrinciples,
    ProductLab,
    FinalCta,
  ],
  template: `
    <sn8w-hero />
    <sn8w-about-experience />
    <sn8w-flagship-products />
    <sn8w-product-ecosystem />
    <sn8w-engineering-principles />
    <sn8w-product-lab />
    <sn8w-final-cta />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {}
