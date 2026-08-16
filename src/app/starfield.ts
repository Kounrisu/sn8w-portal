export type StarfieldMode = 'frost' | 'squirrel';

export interface Particle {
  x: number;
  y: number;
  radius: number;
  driftX: number;
  driftY: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmplitude: number;
  rotation: number;
  twinklePhase: number;
  twinkleSpeed: number;
  baseAlpha: number;
}

const CONFIG: Record<
  StarfieldMode,
  { density: number; maxParticles: number; color: string; radiusMin: number; radiusRange: number }
> = {
  // Slow-drifting frost dust, twinkling in place — the default "Night Sky" theme.
  frost: { density: 0.00012, maxParticles: 220, color: '#a9d8ea', radiusMin: 0.3, radiusRange: 1.1 },
  // Falling sakura petals — the "Lucky Squirrel" theme's signature.
  squirrel: { density: 0.00006, maxParticles: 110, color: '#c96b8a', radiusMin: 2.4, radiusRange: 2.8 },
};

export function createParticles(width: number, height: number, mode: StarfieldMode = 'frost'): Particle[] {
  const { density, maxParticles } = CONFIG[mode];
  const count = Math.min(maxParticles, Math.round(width * height * density));
  const { radiusMin, radiusRange } = CONFIG[mode];

  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * radiusRange + radiusMin,
    driftX: (Math.random() - 0.5) * 0.06,
    driftY: mode === 'squirrel' ? Math.random() * 0.16 + 0.06 : (Math.random() - 0.5) * 0.06,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: Math.random() * 0.0009 + 0.0004,
    swayAmplitude: Math.random() * 0.35 + 0.15,
    rotation: Math.random() * Math.PI,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 0.0008 + 0.0003,
    baseAlpha: Math.random() * 0.5 + 0.3,
  }));
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  dpr: number,
  time: number,
  mode: StarfieldMode = 'frost',
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = CONFIG[mode].color;

  for (const particle of particles) {
    if (time > 0) {
      const sway = mode === 'squirrel' ? Math.sin(time * particle.swaySpeed + particle.swayPhase) * particle.swayAmplitude : 0;
      particle.x = wrap(particle.x + particle.driftX + sway * 0.02, width / dpr);
      particle.y = wrap(particle.y + particle.driftY, height / dpr);
    }

    const twinkle = time > 0 ? Math.sin(time * particle.twinkleSpeed + particle.twinklePhase) : 0;
    const alpha = clamp(particle.baseAlpha + twinkle * (mode === 'squirrel' ? 0.15 : 0.3), 0.05, 1);

    ctx.globalAlpha = alpha;
    ctx.beginPath();

    if (mode === 'squirrel') {
      const angle = particle.rotation + (time > 0 ? time * 0.00015 : 0);
      ctx.ellipse(
        particle.x * dpr,
        particle.y * dpr,
        particle.radius * dpr,
        particle.radius * dpr * 0.55,
        angle,
        0,
        Math.PI * 2,
      );
    } else {
      ctx.arc(particle.x * dpr, particle.y * dpr, particle.radius * dpr, 0, Math.PI * 2);
    }

    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function wrap(value: number, max: number): number {
  if (value < 0) return value + max;
  if (value > max) return value - max;
  return value;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
