import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

vec2 coverUv(vec2 uv, vec2 resolution, vec2 imageRes) {
  vec2 ratio = vec2(
    min((resolution.x / resolution.y) / (imageRes.x / imageRes.y), 1.0),
    min((resolution.y / resolution.x) / (imageRes.y / imageRes.x), 1.0)
  );
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

float circle(vec2 uv, vec2 circlePosition, float radius) {
  float dist = distance(circlePosition, uv);
  return 1.0 - smoothstep(0.0, radius, dist);
}

void main() {
  vec2 resolution = uResolution / max(uResolution.x, uResolution.y);
  vec2 uv = vUv * resolution;

  vec2 mouseDir = uMouse - uPrevMouse;
  vec2 mousePos = uMouse / max(uResolution.x, uResolution.y);

  float c = circle(uv, mousePos, 0.05) * length(mouseDir * 20.0) * uIntensity;

  vec2 texUv = coverUv(vUv, uResolution, uImageResolution) + c;
  vec4 tex = texture2D(uTexture, texUv);

  vec4 displacement = texture2D(uDisplacement, uv + uTime);

  vec2 finalUv = mix(coverUv(vUv, uResolution, uImageResolution), displacement.rg, c);

  gl_FragColor = texture2D(uTexture, finalUv);
}
`;

export function MaterialitySection() {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
    camera.position.z = 1;

    const loader = new THREE.TextureLoader();

    // Create a noise texture programmatically
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 512;
    noiseCanvas.height = 512;
    const nctx = noiseCanvas.getContext('2d')!;
    const imgData = nctx.createImageData(512, 512);
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = Math.random() * 255;
      imgData.data[i + 1] = Math.random() * 255;
      imgData.data[i + 2] = Math.random() * 255;
      imgData.data[i + 3] = 255;
    }
    nctx.putImageData(imgData, 0, 0);
    const noiseTexture = new THREE.CanvasTexture(noiseCanvas);

    // Load the two material images
    const texture1 = loader.load('/images/material-texture-1.jpg');
    const texture2 = loader.load('/images/material-texture-2.jpg');

    // Shared uniforms
    const uniforms = {
      uTexture: { value: texture1 },
      uDisplacement: { value: noiseTexture },
      uResolution: { value: new THREE.Vector2(w / 2, h) },
      uImageResolution: { value: new THREE.Vector2(1920, 1080) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPrevMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uIntensity: { value: 1.5 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { ...uniforms },
    });

    const material2 = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        ...uniforms,
        uTexture: { value: texture2 },
      },
    });

    // Two planes side by side
    const geo1 = new THREE.PlaneGeometry(0.5, 1);
    geo1.translate(-0.25, 0, 0);
    const mesh1 = new THREE.Mesh(geo1, material);

    const geo2 = new THREE.PlaneGeometry(0.5, 1);
    geo2.translate(0.25, 0, 0);
    const mesh2 = new THREE.Mesh(geo2, material2);

    scene.add(mesh1);
    scene.add(mesh2);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = rect.height - (e.clientY - rect.top);
    };
    container.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize
    const handleResize = () => {
      const r = container.getBoundingClientRect();
      renderer.setSize(r.width, r.height);
      material.uniforms.uResolution.value.set(r.width / 2, r.height);
      material2.uniforms.uResolution.value.set(r.width / 2, r.height);
    };
    window.addEventListener('resize', handleResize);

    // Animation
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      material.uniforms.uTime.value = time * 0.02;
      material2.uniforms.uTime.value = time * 0.02;

      // Lerp previous mouse
      material.uniforms.uPrevMouse.value.lerp(material.uniforms.uMouse.value, 0.1);
      material2.uniforms.uPrevMouse.value.lerp(material2.uniforms.uMouse.value, 0.1);

      material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
      material2.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geo1.dispose();
      geo2.dispose();
      material.dispose();
      material2.dispose();
      noiseTexture.dispose();
      texture1.dispose();
      texture2.dispose();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="materiality"
      className="relative w-full h-[80vh] overflow-hidden cursor-crosshair"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {/* Overlay text */}
      <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center pointer-events-none">
        <h2 className="text-4xl lg:text-6xl xl:text-[84px] font-normal tracking-[-2.52px] text-white text-center leading-none mix-blend-difference">
          Materiality
        </h2>
        <p className="mt-4 text-xs uppercase tracking-wider text-white/70 mix-blend-difference">
          Move your cursor to explore
        </p>
      </div>
    </section>
  );
}
