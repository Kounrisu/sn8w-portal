export interface Particle {
  x: number;
  y: number;
  radius: number;
  driftX: number;
  driftY: number;
  twinklePhase: number;
  twinkleSpeed: number;
  baseAlpha: number;
}

const DENSITY = 0.00012;
const MAX_PARTICLES = 220;

export function createParticles(width: number, height: number): Particle[] {
  const count = Math.min(MAX_PARTICLES, Math.round(width * height * DENSITY));

  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.1 + 0.3,
    driftX: (Math.random() - 0.5) * 0.06,
    driftY: (Math.random() - 0.5) * 0.06,
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
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#a9d8ea';

  for (const particle of particles) {
    if (time > 0) {
      particle.x = wrap(particle.x + particle.driftX, width / dpr);
      particle.y = wrap(particle.y + particle.driftY, height / dpr);
    }

    const twinkle = time > 0 ? Math.sin(time * particle.twinkleSpeed + particle.twinklePhase) : 0;
    const alpha = clamp(particle.baseAlpha + twinkle * 0.3, 0.05, 1);

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(particle.x * dpr, particle.y * dpr, particle.radius * dpr, 0, Math.PI * 2);
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
