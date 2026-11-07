import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ProjectsService } from '../../../core/projects.service';

type VpsAction = 'start' | 'stop' | 'uninstall' | 'update' | 'clean';

interface VpsJob {
  op: VpsAction;
  state: 'running' | 'done' | 'error';
  log: string;
}

interface VpsProject {
  key: string;
  name: string;
  state: 'running' | 'partial' | 'stopped' | 'uninstalled' | 'unknown';
  containers: number;
  job: VpsJob | null;
  projectId: number | null;
  git: { repo: boolean; branch?: string; behind?: number | null; dirty?: boolean | null } | null;
  manual: string | boolean | null;
  builds: boolean;
  usage?: { mem: number; cpu: number } | null;
}

interface VpsHost {
  diskTotal: number;
  diskFree: number;
  memTotal: number | null;
  memAvailable: number | null;
  swapTotal?: number | null;
  swapFree?: number | null;
  cpus?: number | null;
  load?: number[] | null;
  uptime?: number | null;
  docker?: { type: string; size: number; reclaimable: number }[] | null;
}

interface VpsContainer {
  name: string;
  project: string | null;
  mem: number;
  cpu: number;
}

interface VpsStatus {
  host: VpsHost | null;
  projects: VpsProject[];
  topContainers?: VpsContainer[];
  linksAvailable?: boolean;
  disk?: Record<string, { source: number; nodeModules: number; git: number; images: number }> | null;
  hostJob?: VpsJob | null;
}

const COPY = {
  en: {
    title: 'VPS deployment',
    lede: 'Install or remove project containers on the VPS. Stop frees memory; Uninstall also frees disk (data volumes are kept).',
    refresh: 'Refresh',
    diskUsed: 'Disk',
    free: 'free',
    load: 'Load',
    uptime: 'Uptime',
    reclaimable: 'reclaimable',
    topContainers: 'Heaviest containers (RAM)',
    start: 'Install / start',
    stop: 'Stop',
    uninstall: 'Uninstall',
    update: 'Update from GitHub',
    redeploy: 'Redeploy',
    clean: 'Free space',
    diskTitle: 'Where the disk goes',
    colImages: 'Images',
    colSource: 'Source',
    colModules: 'node_modules',
    colGit: '.git',
    colTotal: 'Total',
    pruneCache: 'Clear Docker build cache',
    pruneHint: 'Reclaimable build cache, rebuilt on demand',
    confirmClean: 'Delete node_modules (rebuilt on the next Update) and run git gc?',
    confirmPrune: 'Clear the Docker build cache? Only makes the next image build slower.',
    upToDate: 'Up to date',
    behind: 'commits behind',
    dirty: 'uncommitted changes on VPS',
    manualRelease: 'own release process',
    link: 'Linked card',
    none: '— none —',
    busy: 'Working…',
    failed: 'Last operation failed',
    unreachable: 'VPS agent unreachable or not configured.',
    confirmUninstall: 'Remove containers and images for this project? Data volumes are kept; reinstalling rebuilds the images.',
    states: { running: 'Running', partial: 'Partial', stopped: 'Stopped', uninstalled: 'Not installed', unknown: 'Unknown' },
  },
  fr: {
    title: 'Déploiement VPS',
    lede: 'Installer ou retirer les conteneurs des projets sur le VPS. Arrêter libère la mémoire ; Désinstaller libère aussi le disque (les volumes de données sont conservés).',
    refresh: 'Actualiser',
    diskUsed: 'Disque',
    free: 'libre',
    load: 'Charge',
    uptime: 'Disponibilité',
    reclaimable: 'récupérable',
    topContainers: 'Conteneurs les plus gourmands (RAM)',
    start: 'Installer / démarrer',
    stop: 'Arrêter',
    uninstall: 'Désinstaller',
    update: 'Mettre à jour depuis GitHub',
    redeploy: 'Redéployer',
    clean: 'Libérer de l’espace',
    diskTitle: 'Où va le disque',
    colImages: 'Images',
    colSource: 'Sources',
    colModules: 'node_modules',
    colGit: '.git',
    colTotal: 'Total',
    pruneCache: 'Vider le cache de build Docker',
    pruneHint: 'Cache récupérable, reconstruit à la demande',
    confirmClean: 'Supprimer node_modules (reconstruit à la prochaine mise à jour) et lancer git gc ?',
    confirmPrune: 'Vider le cache de build Docker ? Le prochain build d’image sera juste plus lent.',
    upToDate: 'À jour',
    behind: 'commits de retard',
    dirty: 'modifications non commitées sur le VPS',
    manualRelease: 'processus de release dédié',
    link: 'Carte liée',
    none: '— aucune —',
    busy: 'En cours…',
    failed: 'Dernière opération en échec',
    unreachable: 'Agent VPS injoignable ou non configuré.',
    confirmUninstall: 'Supprimer les conteneurs et images de ce projet ? Les volumes de données sont conservés ; la réinstallation reconstruit les images.',
    states: { running: 'En marche', partial: 'Partiel', stopped: 'Arrêté', uninstalled: 'Non installé', unknown: 'Inconnu' },
  },
} as const;

@Component({
  selector: 'sn8w-vps-panel',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="vps">
      <div class="vps__head">
        <div>
          <h2 class="vps__title">{{ t().title }}</h2>
          <p class="vps__lede">{{ t().lede }}</p>
        </div>
        <button type="button" class="btn btn--secondary" (click)="refresh()">{{ t().refresh }}</button>
      </div>

      @if (error()) {
        <p class="vps__error">{{ t().unreachable }} @if (errorDetail()) { <code>{{ errorDetail() }}</code> }</p>
      }

      @if (status(); as s) {
        @if (s.linksAvailable === false) {
          <p class="vps__error">Table <code>vps_links</code> missing in this database — run migration 011 in phpMyAdmin to link projects to cards.</p>
        }
        @if (s.host; as h) {
          <div class="vps__meters">
            <div class="vps__meter">
              <span class="vps__meter-label">{{ t().diskUsed }}</span>
              <div class="vps__bar"><div [style.width.%]="pct(h.diskTotal - h.diskFree, h.diskTotal)" [class.vps__bar--warn]="pct(h.diskTotal - h.diskFree, h.diskTotal) > 85"></div></div>
              <span>{{ fmt(h.diskTotal - h.diskFree) }} / {{ fmt(h.diskTotal) }} · {{ t().free }} {{ fmt(h.diskFree) }}</span>
            </div>
            @if (h.memTotal !== null && h.memAvailable !== null) {
              <div class="vps__meter">
                <span class="vps__meter-label">RAM</span>
                <div class="vps__bar"><div [style.width.%]="pct(h.memTotal - h.memAvailable, h.memTotal)" [class.vps__bar--warn]="pct(h.memTotal - h.memAvailable, h.memTotal) > 85"></div></div>
                <span>{{ fmt(h.memTotal - h.memAvailable) }} / {{ fmt(h.memTotal) }} · {{ t().free }} {{ fmt(h.memAvailable) }}</span>
              </div>
            }
            @if (h.swapTotal) {
              <div class="vps__meter">
                <span class="vps__meter-label">Swap</span>
                <div class="vps__bar"><div [style.width.%]="pct(h.swapTotal - (h.swapFree ?? 0), h.swapTotal)"></div></div>
                <span>{{ fmt(h.swapTotal - (h.swapFree ?? 0)) }} / {{ fmt(h.swapTotal) }}</span>
              </div>
            }
            @if (h.load && h.cpus) {
              <div class="vps__meter">
                <span class="vps__meter-label">CPU</span>
                <div class="vps__bar"><div [style.width.%]="pct(h.load[0], h.cpus)" [class.vps__bar--warn]="h.load[0] / h.cpus > 0.85"></div></div>
                <span>{{ t().load }} {{ h.load[0].toFixed(2) }} · {{ h.load[1].toFixed(2) }} · {{ h.load[2].toFixed(2) }} ({{ h.cpus }} vCPU)</span>
              </div>
            }
          </div>
          <p class="vps__host">
            @if (h.uptime) { {{ t().uptime }}: {{ uptimeText(h.uptime) }} }
            @for (d of h.docker ?? []; track d.type) {
              · {{ d.type }}: {{ fmt(d.size) }}@if (d.reclaimable > 0) { ({{ t().reclaimable }} {{ fmt(d.reclaimable) }}) }
            }
          </p>
          @if (s.topContainers?.length) {
            <details class="vps__top">
              <summary>{{ t().topContainers }}</summary>
              <ul>
                @for (c of s.topContainers; track c.name) {
                  <li><strong>{{ c.name }}</strong> — {{ fmt(c.mem) }} · {{ c.cpu.toFixed(1) }}% CPU</li>
                }
              </ul>
            </details>
          }
        }
        @if (s.disk) {
          <details class="vps__disk" open>
            <summary>{{ t().diskTitle }}</summary>
            <table>
              <thead><tr><th></th><th>{{ t().colImages }}</th><th>{{ t().colSource }}</th><th>{{ t().colModules }}</th><th>{{ t().colGit }}</th><th>{{ t().colTotal }}</th></tr></thead>
              <tbody>
                @for (row of diskRows(s); track row.key) {
                  <tr>
                    <th scope="row">{{ row.name }}</th>
                    <td>{{ fmt(row.images) }}</td><td>{{ fmt(row.source) }}</td><td>{{ fmt(row.nodeModules) }}</td><td>{{ fmt(row.git) }}</td>
                    <td><strong>{{ fmt(row.total) }}</strong></td>
                  </tr>
                }
              </tbody>
            </table>
            <p class="vps__cache">
              @for (d of s.host?.docker ?? []; track d.type) {
                @if (d.type === 'Build Cache' && d.size > 0) {
                  {{ d.type }}: {{ fmt(d.size) }} — {{ t().pruneHint }}
                  <button type="button" class="btn btn--secondary" [disabled]="s.hostJob?.state === 'running'" (click)="pruneCache()">{{ t().pruneCache }}</button>
                }
              }
            </p>
          </details>
        }
        <ul class="vps__list">
          @for (p of s.projects; track p.key) {
            <li class="vps__row">
              <div class="vps__name">
                <strong>{{ p.name }}</strong>
                <span class="vps__state vps__state--{{ p.state }}">{{ t().states[p.state] }}</span>
                @if (p.git?.repo) {
                  <span class="vps__git">
                    @if (p.manual) { {{ t().manualRelease }} }
                    @else if (p.git?.dirty) { {{ t().dirty }} }
                    @else if ((p.git?.behind ?? 0) > 0) { ↑ {{ p.git?.behind }} {{ t().behind }} }
                    @else { {{ t().upToDate }} }
                  </span>
                }
                @if (p.usage) {
                  <span class="vps__git">{{ fmt(p.usage.mem) }} RAM · {{ p.usage.cpu.toFixed(1) }}% CPU</span>
                }
                @if (p.job?.state === 'running') {
                  <span class="vps__busy">{{ t().busy }}</span>
                } @else if (p.job?.state === 'error') {
                  <span class="vps__fail" [title]="p.job?.log ?? ''">{{ t().failed }}</span>
                }
              </div>
              <label class="vps__link">
                {{ t().link }}
                <select [ngModel]="p.projectId" (ngModelChange)="link(p, $event)" [name]="'link-' + p.key">
                  <option [ngValue]="null">{{ t().none }}</option>
                  @for (c of projects.list(); track c.id) {
                    <option [ngValue]="c.id">{{ c.name }}</option>
                  }
                </select>
              </label>
              <div class="vps__actions">
                <button type="button" class="btn btn--primary" [disabled]="isBusy(p) || p.state === 'running'" (click)="act(p, 'start')">{{ t().start }}</button>
                <button type="button" class="btn btn--secondary" [disabled]="isBusy(p) || p.state === 'stopped' || p.state === 'uninstalled'" (click)="act(p, 'stop')">{{ t().stop }}</button>
                <button type="button" class="btn btn--secondary" [disabled]="isBusy(p) || p.state === 'uninstalled'" (click)="act(p, 'uninstall')">{{ t().uninstall }}</button>
                @if ((s.disk?.[p.key]?.nodeModules ?? 0) > 0 || (s.disk?.[p.key]?.git ?? 0) > 50000000) {
                  <button type="button" class="btn btn--secondary" [disabled]="isBusy(p)" (click)="act(p, 'clean')">{{ t().clean }}</button>
                }
                @if (!p.git?.repo || p.manual) {
                  <button type="button" class="btn btn--secondary" [disabled]="isBusy(p) || p.state === 'uninstalled'" (click)="act(p, 'start')">{{ t().redeploy }}</button>
                }
                @if (p.git?.repo && !p.manual) {
                  <button type="button" class="btn btn--secondary" [disabled]="isBusy(p) || p.state === 'uninstalled' || p.git?.dirty" (click)="act(p, 'update')">{{ t().update }}</button>
                }
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: `
    .vps { margin: 0 0 2rem; padding: 1rem 0; border-bottom: 1px solid var(--line); }
    .vps__head { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
    .vps__title { margin: 0 0 .25rem; }
    .vps__lede, .vps__host { color: var(--mist); margin: .25rem 0 1rem; }
    .vps__error, .vps__fail { color: var(--danger); }
    .vps__list { list-style: none; margin: 0; padding: 0; display: grid; gap: .75rem; }
    .vps__row { display: grid; grid-template-columns: 1.2fr 1fr auto; gap: 1rem; align-items: center; padding: .75rem 0; border-top: 1px solid var(--line); }
    .vps__name { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; }
    .vps__state { font-size: .8rem; padding: .1rem .5rem; border: 1px solid var(--line-strong); border-radius: 999px; }
    .vps__meters { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin: 0 0 .75rem; }
    .vps__meter { display: grid; gap: .3rem; font-size: .85rem; }
    .vps__meter-label { font-weight: 600; }
    .vps__bar { height: .5rem; background: var(--surface-sunken); border: 1px solid var(--line); border-radius: 999px; overflow: hidden; }
    .vps__bar > div { height: 100%; background: var(--ice); }
    .vps__bar > div.vps__bar--warn { background: var(--danger); }
    .vps__top { margin: 0 0 1rem; font-size: .85rem; color: var(--mist); }
    .vps__top ul { margin: .5rem 0 0; padding-left: 1.2rem; }
    .vps__disk { margin: 0 0 1rem; font-size: .85rem; }
    .vps__disk table { width: 100%; border-collapse: collapse; margin-top: .5rem; }
    .vps__disk th, .vps__disk td { padding: .25rem .5rem; text-align: right; border-top: 1px solid var(--line); }
    .vps__disk th[scope='row'], .vps__disk thead th:first-child { text-align: left; }
    .vps__cache { color: var(--mist); display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; }
    .vps__git { font-size: .8rem; color: var(--mist); }
    .vps__state--running { color: var(--ice); }
    .vps__link { display: grid; gap: .25rem; font-size: .8rem; color: var(--mist); }
    .vps__actions { display: flex; gap: .5rem; flex-wrap: wrap; }
    @media (max-width: 800px) { .vps__row { grid-template-columns: 1fr; } }
  `,
})
export class VpsPanel implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly projects = inject(ProjectsService);
  private readonly url = `${environment.apiBaseUrl}/vps.php`;

  protected readonly status = signal<VpsStatus | null>(null);
  protected readonly error = signal(false);
  protected readonly errorDetail = signal('');
  protected readonly pending = signal<ReadonlySet<string>>(new Set());
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected t() {
    return this.i18n.lang() === 'fr' ? COPY.fr : COPY.en;
  }

  ngOnInit(): void {
    void this.refresh();
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected fmt(bytes: number): string {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    return `${Math.round(bytes / 1024 ** 2)} MB`;
  }

  protected pct(used: number, total: number): number {
    return total > 0 ? Math.min(100, Math.max(0, (used / total) * 100)) : 0;
  }

  protected uptimeText(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    return d > 0 ? `${d}d ${h}h` : `${h}h`;
  }

  protected isBusy(p: VpsProject): boolean {
    return this.pending().has(p.key) || p.job?.state === 'running';
  }

  protected async refresh(): Promise<void> {
    clearTimeout(this.timer);
    try {
      const s = await firstValueFrom(this.http.get<VpsStatus>(this.url));
      this.status.set(s);
      this.error.set(false);
      this.errorDetail.set('');
      // The portal syncs card availability server-side; reload cards when it may have changed.
      await this.projects.load();
      if (s.projects.some((p) => p.job?.state === 'running')) {
        this.timer = setTimeout(() => void this.refresh(), 4000);
      }
    } catch (e) {
      this.error.set(true);
      this.errorDetail.set(this.describe(e));
    }
  }

  private describe(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const msg = (e.error as { error?: string } | null)?.error;
      return `HTTP ${e.status}${msg ? ' — ' + msg : ''}`;
    }
    return String(e);
  }

  protected diskRows(s: VpsStatus) {
    return s.projects
      .map((p) => {
        const d = s.disk?.[p.key];
        return { key: p.key, name: p.name, images: d?.images ?? 0, source: d?.source ?? 0, nodeModules: d?.nodeModules ?? 0, git: d?.git ?? 0, total: (d?.images ?? 0) + (d?.source ?? 0) };
      })
      .sort((a, b) => b.total - a.total);
  }

  protected async pruneCache(): Promise<void> {
    if (!confirm(this.t().confirmPrune)) return;
    try {
      await firstValueFrom(this.http.post(this.url, { key: '_host', action: 'prune-cache' }));
    } catch (e) {
      this.error.set(true);
      this.errorDetail.set(this.describe(e));
    }
    this.timer = setTimeout(() => void this.refresh(), 1500);
  }

  protected async act(p: VpsProject, action: VpsAction): Promise<void> {
    if (action === 'uninstall' && !confirm(this.t().confirmUninstall)) return;
    if (action === 'clean' && !confirm(this.t().confirmClean)) return;
    this.pending.update((s) => new Set(s).add(p.key));
    try {
      await firstValueFrom(this.http.post(this.url, { key: p.key, action }));
    } catch {
      this.error.set(true);
    } finally {
      this.pending.update((s) => {
        const n = new Set(s);
        n.delete(p.key);
        return n;
      });
    }
    this.timer = setTimeout(() => void this.refresh(), 1500);
  }

  protected async link(p: VpsProject, projectId: number | null): Promise<void> {
    await firstValueFrom(this.http.post(this.url, { key: p.key, action: 'link', projectId }));
    await this.refresh();
  }
}
