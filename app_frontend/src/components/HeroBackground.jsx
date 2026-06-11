import { useEffect, useRef } from 'react';

export default function ResumeBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animId;
        let t = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const streamPaths = [
            { sx: -0.05, sy: 0.48, c1x: 0.2,  c1y: 0.9,  c2x: 0.8,  c2y: 0.1,  ex: 1.05, ey: 0.44 },
            { sx: -0.05, sy: 0.54, c1x: 0.25, c1y: 0.85, c2x: 0.75, c2y: 0.15, ex: 1.05, ey: 0.50 },
            { sx: -0.05, sy: 0.60, c1x: 0.3,  c1y: 0.95, c2x: 0.7,  c2y: 0.05, ex: 1.05, ey: 0.40 },
            { sx: -0.05, sy: 0.65, c1x: 0.2,  c1y: 0.75, c2x: 0.8,  c2y: 0.25, ex: 1.05, ey: 0.56 },
            { sx: -0.05, sy: 0.70, c1x: 0.35, c1y: 1.0,  c2x: 0.65, c2y: 0.0,  ex: 1.05, ey: 0.62 },
        ];

        class Stream {
            constructor(idx) {
                this.idx = idx;
                this.particles = [];
                const count = 140;
                const dotSize = 1.4;
                for (let i = 0; i < count; i++) {
                    this.particles.push({
                        t: (i / count) + idx * 0.2,
                        size: dotSize,
                    });
                }
            }

            getPos(tVal, W, H) {
                const tt = ((tVal % 1) + 1) % 1;
                const o = streamPaths[this.idx];
                const mt = 1 - tt;
                const x = mt*mt*mt*(o.sx*W) + 3*mt*mt*tt*(o.c1x*W) + 3*mt*tt*tt*(o.c2x*W) + tt*tt*tt*(o.ex*W);
                const y = mt*mt*mt*(o.sy*H) + 3*mt*mt*tt*(o.c1y*H) + 3*mt*tt*tt*(o.c2y*H) + tt*tt*tt*(o.ey*H);
                return { x, y };
            }

            draw(ctx, time, W, H) {
                for (const p of this.particles) {
                    const tPos = ((p.t + time * 0.07) % 1 + 1) % 1;
                    const { x, y } = this.getPos(tPos, W, H);
                    const edge = Math.min(tPos, 1 - tPos) * 2;
                    const alpha = 0.35 * Math.min(edge * 6, 1);
                    ctx.beginPath();
                    ctx.arc(x, y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(217, 169, 25, ${alpha})`;
                    ctx.fill();
                }
            }
        }

        const streams = Array.from({ length: 5 }, (_, i) => new Stream(i));

        const draw = () => {
            const W = canvas.width;
            const H = canvas.height;
            const isMobile = W < 768;
            t += 0.004;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#0A0A0A';
            ctx.fillRect(0, 0, W, H);

            if (!isMobile) {
                streams.forEach((s) => s.draw(ctx, t, W, H));
            }

            const glowIntensity = isMobile ? 0.13 : 0.04;
            const glowRadius = isMobile ? W * 0.55 : W * 0.35;
            const grd = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, glowRadius);
            grd.addColorStop(0, `rgba(217,169,25,${glowIntensity})`);
            grd.addColorStop(0.5, `rgba(217,169,25,${glowIntensity * 0.3})`);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, W, H);
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" style={{ zIndex: 0 }}/>
  )
}