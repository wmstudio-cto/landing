// La escena 3D de Whole Models.
//
// · La escultura: una sola cinta ancha de satén dorado, generada por código
//   (sin archivo 3D que descargar). Cambia de forma, posición y escala según
//   la pose que le pide el scroll.
// · La figura: la modelo recortada, dentro de la misma escena. La cinta pasa
//   por delante y por detrás de ella, y una luz la saca de la oscuridad.
// · El polvo dorado: pocas motas champagne que giran alrededor de la modelo,
//   por delante y por detrás de ella, y suben despacio con el scroll.
// · La cámara se desplaza un poco con el cursor: las capas se separan y la
//   página deja de ser plana.
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import figuras from "../lib/figuras.json";

/** Lo que el scroll le pide a la escultura en cada instante. */
export type Pose = {
  /** Mezcla de formas: cinta, movimiento, arco y portal. Suman 1. */
  w: [number, number, number, number];
  /** Posición en la pantalla: -1 y 1 son los bordes. */
  x: number;
  y: number;
  /** Tamaño: media altura de la pieza respecto a media pantalla. */
  size: number;
  rx: number;
  ry: number;
  rz: number;
  /** Media anchura de la cinta. */
  band: number;
  /** 0 = torsión repartida; 1 = cinta plana de frente (marco). */
  flat: number;
  /** 0–1: cuánto se ajusta al rectángulo del marco de la escena 03. */
  fit: number;
  /** Movimiento propio: ondulación; por encima de 0.5 además gira y se retuerce. */
  life: number;
  /** Torsión fija de la cinta (radianes): define la composición de cada escena. */
  twist?: number;
  alpha: number;
};

export type FigureKey = keyof typeof figuras;

/** La modelo recortada que acompaña a la escultura. */
export type Figure = {
  /** Qué recorte se muestra; null = ninguno. */
  key: FigureKey | null;
  /** Centro horizontal (-1..1) y base (-1 = borde inferior de la pantalla). */
  x: number;
  base: number;
  /** Altura respecto a la pantalla (1 = toda la altura). */
  height: number;
  /** Profundidad: positiva hacia la cámara. */
  z: number;
  /** 0 = silueta en la oscuridad; 1 = iluminada. */
  light: number;
  /** Resplandor cálido detrás de la figura. */
  warm: number;
  /** 1 = se coloca dentro del marco de la escena 03. */
  fit: number;
  alpha: number;
};

export type Frame = { x: number; y: number; width: number; height: number };

export type SculptureOptions = {
  /** Menos polígonos y resolución para móviles. */
  lite: boolean;
  /** Sin movimiento propio ni paralaje. */
  still: boolean;
  /** Devuelve lo que debe verse en este fotograma. */
  target: () => { pose: Pose; figure: Figure };
  /** Rectángulo (en píxeles de pantalla) del marco de la escena 03. */
  frame: () => Frame | null;
  /** Avisa cuando la primera figura ya se ve (para ocultar la foto de respaldo). */
  onFigure?: () => void;
};

const TAU = Math.PI * 2;
const FOV = 32;
const CAMERA_Z = 9;
const SHAPE_HALF_HEIGHT = 1.9;
const THICKNESS = 0.034; // una lámina, no un tubo

// ---------- Las cuatro formas de la misma cinta (u de 0 a 1) ----------

/** Cinta suspendida: grandes eses que cruzan la pantalla y rodean a la modelo. */
const ribbon = (u: number, out: number[]) => {
  const t = u * TAU;
  out[0] = 2.25 * Math.sin(t) + 0.45 * Math.sin(3 * t + 0.4);
  out[1] = 1.05 * Math.cos(t) + 0.8 * Math.sin(2 * t + 0.3);
  out[2] = 1.25 * Math.sin(2 * t + 1.0) + 0.25 * Math.cos(3 * t);
};

/** Movimiento dorado: curvas abiertas que llenan la pantalla. */
const flow = (u: number, out: number[]) => {
  const t = u * TAU;
  out[0] = 2.3 * Math.sin(t) + 0.3 * Math.cos(2 * t);
  out[1] = 1.15 * Math.sin(2 * t) + 0.35 * Math.cos(t);
  out[2] = 0.75 * Math.cos(3 * t) + 0.55 * Math.sin(t);
};

/** Arco arquitectónico, recorrido a velocidad constante para que no se facete. */
const ARCH = (() => {
  const W = 1.3;
  const r = 0.35;
  const topY = 1.9 - W;
  const legs = topY - (-1.9 + r);
  const parts = [
    (Math.PI * W) / 2, // cuarto de arco derecho
    legs, // pierna derecha
    (Math.PI * r) / 2, // esquina inferior derecha
    2 * (W - r), // base
    (Math.PI * r) / 2, // esquina inferior izquierda
    legs, // pierna izquierda
    (Math.PI * W) / 2, // cuarto de arco izquierdo
  ];
  const total = parts.reduce((a, b) => a + b, 0);
  return { W, r, topY, legs, parts, total };
})();

const arch = (u: number, out: number[]) => {
  const { W, r, topY, legs, parts, total } = ARCH;
  let d = (((u % 1) + 1) % 1) * total;
  let i = 0;
  while (i < parts.length - 1 && d > parts[i]) d -= parts[i++];
  const k = d / parts[i];
  let x = 0;
  let y = 0;
  if (i === 0) {
    const a = (k * Math.PI) / 2;
    x = W * Math.sin(a);
    y = topY + W * Math.cos(a);
  } else if (i === 1) {
    x = W;
    y = topY - k * legs;
  } else if (i === 2) {
    const a = (k * Math.PI) / 2;
    x = W - r + r * Math.cos(a);
    y = -1.9 + r - r * Math.sin(a);
  } else if (i === 3) {
    x = W - r - k * 2 * (W - r);
    y = -1.9;
  } else if (i === 4) {
    const a = (k * Math.PI) / 2;
    x = -(W - r) - r * Math.sin(a);
    y = -1.9 + r - r * Math.cos(a);
  } else if (i === 5) {
    x = -W;
    y = -1.9 + r + k * legs;
  } else {
    const a = (k * Math.PI) / 2;
    x = -W * Math.cos(a);
    y = topY + W * Math.sin(a);
  }
  out[0] = x;
  out[1] = y;
  out[2] = 0.1 * Math.sin(u * TAU * 2);
};

/** Portal: un aro que la cámara atraviesa. */
const portal = (u: number, out: number[]) => {
  const t = u * TAU;
  out[0] = 1.7 * Math.sin(t);
  out[1] = 1.7 * Math.cos(t);
  out[2] = 0.3 * Math.sin(3 * t);
};

const SHAPES = [ribbon, flow, arch, portal];
const ARCH_HALF = { width: ARCH.W, height: 1.9 };

const smooth = (v: number) => {
  const t = Math.max(0, Math.min(1, v));
  return t * t * (3 - 2 * t);
};

// ---------- La figura: de la oscuridad a la luz ----------
const FIGURE_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FIGURE_FRAGMENT = /* glsl */ `
  uniform sampler2D map;
  uniform sampler2D relief;
  uniform float uLight;
  uniform float uOpacity;
  uniform vec2 uShift;
  uniform vec2 uTexel;
  uniform vec3 uGold;
  varying vec2 vUv;

  void main() {
    // Paralaje: lo que está más cerca se desplaza más con la cámara.
    float near = texture2D(relief, vUv).r;
    vec2 uv = vUv + uShift * (near - 0.45) * 0.045;
    vec4 photo = texture2D(map, uv);

    // Normal aproximada a partir del relieve.
    vec2 e = uTexel * 5.0;
    float hx = texture2D(relief, uv + vec2(e.x, 0.0)).r - texture2D(relief, uv - vec2(e.x, 0.0)).r;
    float hy = texture2D(relief, uv + vec2(0.0, e.y)).r - texture2D(relief, uv - vec2(0.0, e.y)).r;
    vec3 n = normalize(vec3(-hx * 4.0, -hy * 4.0, 1.0));

    // Primero una luz rasante dibuja el volumen; después llega la exposición completa.
    vec3 side = normalize(vec3(mix(1.5, 0.5, uLight), mix(0.8, 0.5, uLight), mix(0.25, 1.0, uLight)));
    float graze = pow(clamp(dot(n, side), 0.0, 1.0), 1.6) * 1.7;
    float exposure = mix(graze * smoothstep(0.0, 0.45, uLight), 1.0, smoothstep(0.4, 1.0, uLight));

    vec3 color = photo.rgb * exposure;
    // Contraluz dorado en los bordes: el reflejo de la escultura sobre ella.
    float rim = pow(1.0 - n.z, 1.5) * smoothstep(0.05, 0.6, uLight);
    color += uGold * rim * 0.55 * (0.4 + photo.r);

    // La base se funde con la oscuridad: no queda un corte recto.
    float a = photo.a * uOpacity * smoothstep(0.0, 0.12, vUv.y);
    gl_FragColor = vec4(color * a, a);
    #include <colorspace_fragment>
  }
`;

// Un resplandor cálido detrás de la figura: la luz hacia la que sale.
const GLOW_FRAGMENT = /* glsl */ `
  uniform float uPower;
  uniform vec3 uWarm;
  varying vec2 vUv;
  void main() {
    float d = distance(vUv, vec2(0.5));
    float halo = smoothstep(0.5, 0.0, d);
    // Luz pura: suma color sin tapar nada (alfa 0 con mezcla premultiplicada).
    gl_FragColor = vec4(uWarm * halo * halo * uPower, 0.0);
    #include <colorspace_fragment>
  }
`;

// ---------- Polvo dorado ----------
// Cada mota lleva cuatro números al azar: ángulo inicial, radio, altura y
// carácter (velocidad, tamaño, parpadeo). Todo el movimiento se calcula en la
// GPU, así que el polvo no cuesta nada al procesador.
const DUST_VERTEX = /* glsl */ `
  attribute vec4 seed;
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixel;
  uniform float uOpacity;
  uniform vec3 uCenter;
  uniform vec2 uSize;
  uniform sampler2D uMask;
  uniform float uHasMask;
  varying float vAlpha;

  void main() {
    // Gira alrededor de la modelo: la envuelve en profundidad.
    float angle = seed.x + uTime * (0.05 + seed.w * 0.07);
    float rx = uSize.y * mix(0.24, 0.6, seed.y);
    float rz = mix(0.7, 1.7, seed.y);
    // Sube despacio y, al hacer scroll, fluye con la página. Las motas más
    // lejanas se mueven menos: paralaje.
    float h = fract(seed.z + uTime * 0.012 * (0.5 + seed.w) - uScroll * 0.16 * (0.55 + seed.y));
    vec3 p = uCenter + vec3(
      cos(angle) * rx,
      (h - 0.5) * uSize.y * 1.12 + sin(uTime * 0.4 + seed.x) * 0.04,
      sin(angle) * rz
    );

    // Las motas que pasan por detrás de ella quedan ocultas por su silueta.
    float hidden = 0.0;
    if (uHasMask > 0.5 && p.z < uCenter.z) {
      vec2 uv = (p.xy - uCenter.xy) / uSize + 0.5;
      if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) hidden = texture2D(uMask, uv).a;
    }

    float edge = smoothstep(0.0, 0.16, h) * smoothstep(1.0, 0.84, h);
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.1 + seed.w * 1.8) + seed.x * 7.0);
    vAlpha = uOpacity * edge * twinkle * (1.0 - hidden * 0.96);

    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = mix(1.4, 3.6, seed.w * seed.w) * uPixel * (9.0 / -view.z);
  }
`;

const DUST_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    // Luz pura, como el resplandor: suma sin tapar.
    gl_FragColor = vec4(uColor * core * core * vAlpha, 0.0);
    #include <colorspace_fragment>
  }
`;

type Loaded = { map: Texture; relief: Texture; aspect: number; ready: boolean };

export function createSculpture(canvas: HTMLCanvasElement, options: SculptureOptions) {
  const N = options.lite ? 280 : 520; // tramos a lo largo
  const M = options.lite ? 10 : 16; // tramos alrededor

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);

  // Estudio de luz: una cúpula cálida muy tenue (nada refleja negro puro) y
  // cajas de luz anchas que dejan en el satén brillos champagne y oro profundo.
  const studio = new Scene();
  const dome = new Mesh(
    new SphereGeometry(30, 24, 16),
    new MeshBasicMaterial({ color: new Color("#2a1c0a").multiplyScalar(0.5), side: BackSide }),
  );
  studio.add(dome);
  const softbox = (w: number, h: number, color: string, power: number, at: [number, number, number]) => {
    const mesh = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ color: new Color(color).multiplyScalar(power), side: DoubleSide }),
    );
    mesh.position.set(...at);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
  };
  softbox(10, 4.5, "#fff1d6", 11, [0, 7, 3]);
  softbox(3.5, 10, "#f0d59c", 8, [-7.5, 1, 3]);
  softbox(3, 9, "#d9a84f", 7, [7.5, 0, 0]);
  softbox(7, 2, "#fff8ea", 6, [3, -6, 5]);
  softbox(12, 4, "#a67a2e", 3, [0, 2, -8.5]);
  softbox(5, 5, "#ffe9bd", 5, [-3, 2, 9]);
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, 0.03);
  scene.environment = environment.texture;
  pmrem.dispose();
  studio.traverse((child) => {
    if (child instanceof Mesh) {
      child.geometry.dispose();
      (child.material as MeshBasicMaterial).dispose();
    }
  });

  const key = new DirectionalLight(0xfff1d6, 1.1);
  key.position.set(-3, 5, 6);
  scene.add(key);

  // Satén dorado: metal puro con el brillo algo abierto.
  const material = new MeshStandardMaterial({
    color: new Color("#d8a858"),
    metalness: 1,
    roughness: 0.15,
    envMapIntensity: 1.35,
    side: DoubleSide,
  });

  const rows = N + 1;
  const cols = M + 1;
  const positions = new Float32Array(rows * cols * 3);
  const normals = new Float32Array(rows * cols * 3);
  const indices = new Uint16Array(N * M * 6);
  let q = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * cols + j;
      const b = a + cols;
      indices[q++] = a;
      indices[q++] = b;
      indices[q++] = a + 1;
      indices[q++] = a + 1;
      indices[q++] = b;
      indices[q++] = b + 1;
    }
  }
  const geometry = new BufferGeometry();
  const positionAttr = new BufferAttribute(positions, 3);
  const normalAttr = new BufferAttribute(normals, 3);
  geometry.setAttribute("position", positionAttr);
  geometry.setAttribute("normal", normalAttr);
  geometry.setIndex(new BufferAttribute(indices, 1));
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  scene.add(mesh);

  // ---------- Figura y resplandor ----------
  const figureMaterial = new ShaderMaterial({
    vertexShader: FIGURE_VERTEX,
    fragmentShader: FIGURE_FRAGMENT,
    uniforms: {
      map: { value: null },
      relief: { value: null },
      uLight: { value: 0 },
      uOpacity: { value: 0 },
      uShift: { value: new Vector2() },
      uTexel: { value: new Vector2(1 / 512, 1 / 512) },
      uGold: { value: new Color("#e5c88c") },
    },
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
    toneMapped: false,
  });
  const figureMesh = new Mesh(new PlaneGeometry(1, 1), figureMaterial);
  figureMesh.visible = false;
  figureMesh.renderOrder = 2;
  scene.add(figureMesh);

  const glowMaterial = new ShaderMaterial({
    vertexShader: FIGURE_VERTEX,
    fragmentShader: GLOW_FRAGMENT,
    uniforms: { uPower: { value: 0 }, uWarm: { value: new Color("#c69a45") } },
    transparent: true,
    premultipliedAlpha: true,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const glowMesh = new Mesh(new PlaneGeometry(1, 1), glowMaterial);
  glowMesh.visible = false;
  glowMesh.renderOrder = 0;
  scene.add(glowMesh);

  const DUST = options.lite ? 110 : 240;
  const seeds = new Float32Array(DUST * 4);
  for (let i = 0; i < DUST * 4; i++) seeds[i] = Math.random();
  for (let i = 0; i < DUST; i++) seeds[i * 4] *= TAU;
  const dustGeometry = new BufferGeometry();
  // La posición real sale del sombreador; este atributo solo da el número de motas.
  dustGeometry.setAttribute("position", new BufferAttribute(new Float32Array(DUST * 3), 3));
  dustGeometry.setAttribute("seed", new BufferAttribute(seeds, 4));
  const dustMaterial = new ShaderMaterial({
    vertexShader: DUST_VERTEX,
    fragmentShader: DUST_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPixel: { value: 1 },
      uOpacity: { value: 0 },
      uCenter: { value: new Vector3() },
      uSize: { value: new Vector2(1, 1) },
      uMask: { value: null },
      uHasMask: { value: 0 },
      uColor: { value: new Color("#f0d59c").multiplyScalar(1.5) },
    },
    transparent: true,
    premultipliedAlpha: true,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const dust = new Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  dust.visible = false;
  // Después de la cinta: las motas que quedan detrás de ella no se ven.
  dust.renderOrder = 3;
  scene.add(dust);
  let dustLevel = 0;

  const loader = new TextureLoader();
  const loaded = new Map<FigureKey, Loaded>();
  const load = (name: FigureKey) => {
    if (loaded.has(name)) return;
    const size = figuras[name];
    const entry: Loaded = {
      map: loader.load(`/figuras/${name}.webp`, () => {
        entry.ready = true;
      }),
      relief: loader.load(`/figuras/${name}-relieve.webp`),
      aspect: size.width / size.height,
      ready: false,
    };
    entry.map.colorSpace = SRGBColorSpace;
    entry.map.minFilter = LinearFilter;
    entry.map.generateMipmaps = false;
    entry.relief.minFilter = LinearFilter;
    entry.relief.generateMipmaps = false;
    loaded.set(name, entry);
  };

  // Memoria de trabajo para reconstruir la cinta sin crear objetos.
  const pts = new Float32Array(N * 3);
  const tan = new Float32Array(N * 3);
  const nrm = new Float32Array(N * 3);
  const tmp = [0, 0, 0];
  let holonomy = 0;
  let closure = 0;

  const rebuild = (pose: Pose, clock: number, phase: number) => {
    const fixed = pose.twist ?? 0;
    const weights = pose.w;
    // 1. La línea central: mezcla de las cuatro formas.
    for (let i = 0; i < N; i++) {
      const u = i / N;
      let x = 0;
      let y = 0;
      let z = 0;
      for (let s = 0; s < 4; s++) {
        if (weights[s] < 0.0005) continue;
        SHAPES[s](u, tmp);
        x += tmp[0] * weights[s];
        y += tmp[1] * weights[s];
        z += tmp[2] * weights[s];
      }
      // Ondulación lenta: el metal parece seguir vivo.
      const wave = pose.life * 0.06 * Math.sin(u * TAU * 3 + clock * 0.45);
      pts[i * 3] = x;
      pts[i * 3 + 1] = y + wave;
      pts[i * 3 + 2] = z + wave;
    }
    // 2. Tangentes.
    for (let i = 0; i < N; i++) {
      const a = ((i + N - 1) % N) * 3;
      const b = ((i + 1) % N) * 3;
      let tx = pts[b] - pts[a];
      let ty = pts[b + 1] - pts[a + 1];
      let tz = pts[b + 2] - pts[a + 2];
      const len = Math.hypot(tx, ty, tz) || 1;
      tx /= len;
      ty /= len;
      tz /= len;
      tan[i * 3] = tx;
      tan[i * 3 + 1] = ty;
      tan[i * 3 + 2] = tz;
    }
    // 3. Normales por transporte paralelo, empezando en el plano de la pantalla.
    let nx = tan[1];
    let ny = -tan[0];
    let nz = 0;
    let nl = Math.hypot(nx, ny, nz);
    if (nl < 1e-4) {
      nx = 1;
      ny = 0;
      nl = 1;
    }
    nx /= nl;
    ny /= nl;
    for (let i = 0; i < N; i++) {
      const tx = tan[i * 3];
      const ty = tan[i * 3 + 1];
      const tz = tan[i * 3 + 2];
      const dot = nx * tx + ny * ty + nz * tz;
      nx -= dot * tx;
      ny -= dot * ty;
      nz -= dot * tz;
      const l = Math.hypot(nx, ny, nz) || 1;
      nx /= l;
      ny /= l;
      nz /= l;
      nrm[i * 3] = nx;
      nrm[i * 3 + 1] = ny;
      nrm[i * 3 + 2] = nz;
    }
    // 4. Cierre del lazo: el giro acumulado se reparte a lo largo de la cinta.
    {
      const tx = tan[0];
      const ty = tan[1];
      const tz = tan[2];
      const dot = nx * tx + ny * ty + nz * tz;
      let ex = nx - dot * tx;
      let ey = ny - dot * ty;
      let ez = nz - dot * tz;
      const l = Math.hypot(ex, ey, ez) || 1;
      ex /= l;
      ey /= l;
      ez /= l;
      const sx = nrm[0];
      const sy = nrm[1];
      const sz = nrm[2];
      const cos = sx * ex + sy * ey + sz * ez;
      const cx = sy * ez - sz * ey;
      const cy = sz * ex - sx * ez;
      const cz = sx * ey - sy * ex;
      const raw = Math.atan2(cx * tx + cy * ty + cz * tz, cos);
      // La sección es simétrica: basta con múltiplos de media vuelta, y se
      // elige el más cercano al fotograma anterior para que no dé saltos.
      holonomy = raw + Math.PI * Math.round((holonomy - raw) / Math.PI);
      closure = raw - holonomy;
    }
    // 5. La sección (una lámina de bordes redondeados) alrededor de cada punto.
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const k = (i % N) * 3;
      const tx = tan[k];
      const ty = tan[k + 1];
      const tz = tan[k + 2];
      let ax = nrm[k];
      let ay = nrm[k + 1];
      let az = nrm[k + 2];
      // Torsión: una vuelta completa repartida, o concentrada en la base
      // cuando la cinta hace de marco y debe verse de frente.
      const spread = u;
      const packed = smooth((u - 0.44) / 0.12);
      // La última fila repite el punto inicial: solo lleva el resto del cierre.
      const undo = i === N ? closure : -holonomy * u;
      const twist = TAU * (spread + (packed - spread) * pose.flat) + undo + (fixed + phase) * (1 - pose.flat);
      const cs = Math.cos(twist);
      const sn = Math.sin(twist);
      // binormal = t × n
      const bx = ty * az - tz * ay;
      const by = tz * ax - tx * az;
      const bz = tx * ay - ty * ax;
      const rx = ax * cs + bx * sn;
      const ry = ay * cs + by * sn;
      const rz = az * cs + bz * sn;
      const ux = bx * cs - ax * sn;
      const uy = by * cs - ay * sn;
      const uz = bz * cs - az * sn;
      ax = rx;
      ay = ry;
      az = rz;
      // La anchura respira a lo largo de la cinta, como una tela.
      const half = pose.band * (1 + 0.34 * (1 - pose.flat) * Math.sin(u * TAU * 2 + 1.3));
      const body = half * (0.5 - 0.42 * pose.flat);
      const px = pts[k];
      const py = pts[k + 1];
      const pz = pts[k + 2];
      for (let j = 0; j <= M; j++) {
        const a = (j / M) * TAU;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const o = (i * cols + j) * 3;
        positions[o] = px + half * ca * ax + THICKNESS * sa * ux;
        positions[o + 1] = py + half * ca * ay + THICKNESS * sa * uy;
        positions[o + 2] = pz + half * ca * az + THICKNESS * sa * uz;
        // La geometría es una lámina fina, pero se ilumina como si tuviera cuerpo:
        // así el brillo recorre el ancho de la cinta, como en el metal líquido.
        let mx = body * ca * ax + half * sa * ux;
        let my = body * ca * ay + half * sa * uy;
        let mz = body * ca * az + half * sa * uz;
        const ml = Math.hypot(mx, my, mz) || 1;
        mx /= ml;
        my /= ml;
        mz /= ml;
        normals[o] = mx;
        normals[o + 1] = my;
        normals[o + 2] = mz;
      }
    }
    positionAttr.needsUpdate = true;
    normalAttr.needsUpdate = true;
  };

  // ---------- Bucle ----------
  let width = 1;
  let height = 1;
  const halfH = Math.tan((FOV * Math.PI) / 360) * CAMERA_Z;
  let halfW = halfH;

  const resize = () => {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.lite ? 1.5 : 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    halfW = halfH * camera.aspect;
  };
  resize();

  // El cursor desplaza la cámara: paralaje real entre cinta, figura y fondo.
  let pointerX = 0;
  let pointerY = 0;
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!options.still) window.addEventListener("pointermove", onPointer, { passive: true });

  let current: Pose | null = null;
  let raf = 0;
  let before = 0;
  let clock = 0;
  let reveal = 0; // la escena surge de la oscuridad al cargar
  let shown = -1;
  let spin = 0;
  let phase = 0;
  let camX = 0;
  let camY = 0;
  const wrap = (v: number, limit: number) => (v > limit ? v - 2 * limit : v < -limit ? v + 2 * limit : v);

  // Estado real de la figura (el objetivo llega suavizado).
  let figureKey: FigureKey | null = null;
  let figureOpacity = 0;
  let figureLight = 0;
  let figureWarm = 0;
  let fx = 0;
  let fy = 0;
  let fw = 1;
  let fh = 1;
  let fz = 0;
  let announced = false;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(0.1, before ? (now - before) / 1000 : 0.016);
    before = now;
    const { pose: target, figure: wanted } = options.target();
    if (!current) {
      current = { ...target, w: [...target.w] as Pose["w"] };
    } else {
      const k = 1 - Math.exp(-dt / 0.14);
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;
      current.size += (target.size - current.size) * k;
      current.rx += (target.rx - current.rx) * k;
      current.ry += (target.ry - current.ry) * k;
      current.rz += (target.rz - current.rz) * k;
      current.band += (target.band - current.band) * k;
      current.flat += (target.flat - current.flat) * k;
      current.fit += (target.fit - current.fit) * k;
      current.life += (target.life - current.life) * k;
      current.twist = (current.twist ?? 0) + ((target.twist ?? 0) - (current.twist ?? 0)) * k;
      current.alpha += (target.alpha - current.alpha) * k;
      for (let s = 0; s < 4; s++) current.w[s] += (target.w[s] - current.w[s]) * k;
    }
    reveal = Math.min(1, reveal + dt / 2.6);
    const ribbonAlpha = Math.max(0, Math.min(1, current.alpha));

    // ----- Figura: dónde y cómo debería estar -----
    if (wanted.key) load(wanted.key);
    const frame = current.fit > 0.001 || wanted.fit > 0.5 ? options.frame() : null;
    const toWorld = (2 * halfH) / height;
    let goalH = wanted.height * 2 * halfH;
    let goalX = wanted.x * halfW;
    let goalY = wanted.base * halfH + goalH / 2;
    if (wanted.fit > 0.5 && frame) {
      goalH = frame.height * toWorld * 1.04;
      goalX = (frame.x + frame.width / 2 - width / 2) * toWorld;
      goalY = (height / 2 - (frame.y + frame.height)) * toWorld + goalH / 2;
    }
    const entry = wanted.key ? loaded.get(wanted.key) : undefined;
    const goalW = goalH * (entry?.aspect ?? 0.66);

    if (wanted.key !== figureKey) {
      // Cambio de figura: la actual vuelve a la oscuridad y entra la nueva.
      figureOpacity += (0 - figureOpacity) * (1 - Math.exp(-dt / 0.07));
      if (figureOpacity < 0.02 && (!wanted.key || entry?.ready)) {
        figureKey = wanted.key;
        figureOpacity = 0;
        figureLight = 0;
        if (entry) {
          figureMaterial.uniforms.map.value = entry.map;
          figureMaterial.uniforms.relief.value = entry.relief;
        }
        fx = goalX;
        fy = goalY;
        fw = goalW;
        fh = goalH;
        fz = wanted.z;
      }
    } else if (figureKey) {
      const k = 1 - Math.exp(-dt / 0.16);
      fx += (goalX - fx) * k;
      fy += (goalY - fy) * k;
      fw += (goalW - fw) * k;
      fh += (goalH - fh) * k;
      fz += (wanted.z - fz) * k;
      figureOpacity += (wanted.alpha - figureOpacity) * (1 - Math.exp(-dt / 0.2));
      // La luz llega despacio y se va más deprisa.
      const pace = wanted.light > figureLight ? 0.75 : 0.22;
      figureLight += (wanted.light * smooth(reveal * 1.2) - figureLight) * (1 - Math.exp(-dt / pace));
      if (!announced && figureOpacity > 0.3) {
        announced = true;
        options.onFigure?.();
      }
    }
    figureWarm += (wanted.warm * figureOpacity - figureWarm) * (1 - Math.exp(-dt / 0.4));

    const visible = Math.max(ribbonAlpha, figureOpacity) * smooth(reveal);
    if (Math.abs(visible - shown) > 0.004) {
      shown = visible;
      canvas.style.opacity = Math.min(1, visible * 1.6).toFixed(3);
    }
    // Sin nada que mostrar no se dibuja: la escena de talentos no gasta GPU.
    if (visible < 0.01 || document.hidden) return;

    clock += dt;
    // Giro y torsión propios, acumulados y acotados para que al apagarse
    // (cuando la cinta se vuelve marco) deshagan como mucho media vuelta.
    // Solo cuando la escultura es la protagonista (life > 0.5); si acompaña a
    // una modelo, la composición queda fija y el rostro siempre despejado.
    const drift = smooth((current.life - 0.5) / 0.5);
    spin = wrap(spin + drift * dt * 0.05, Math.PI);
    phase = wrap(phase + drift * dt * 0.2, Math.PI / 2);

    // Cámara: sigue al cursor y, sin cursor, se mece muy despacio.
    const roam = options.still ? 0 : 1;
    const goalCamX = roam * (pointerX * 0.55 + Math.sin(clock * 0.21) * 0.16);
    const goalCamY = roam * (-pointerY * 0.32 + Math.cos(clock * 0.17) * 0.08);
    camX += (goalCamX - camX) * (1 - Math.exp(-dt / 0.6));
    camY += (goalCamY - camY) * (1 - Math.exp(-dt / 0.6));
    camera.position.set(camX, camY, CAMERA_Z);
    camera.lookAt(0, 0, 0);

    // ----- Escultura -----
    mesh.visible = ribbonAlpha > 0.01;
    if (mesh.visible) {
      material.opacity = ribbonAlpha;
      material.transparent = ribbonAlpha < 0.995;
      rebuild(current, clock, phase * drift);
      let px = current.x * halfW;
      let py = current.y * halfH;
      let sx = (current.size * halfH) / SHAPE_HALF_HEIGHT;
      let sy = sx;
      if (frame && current.fit > 0.001) {
        const cx = (frame.x + frame.width / 2 - width / 2) * toWorld;
        const cy = (height / 2 - (frame.y + frame.height / 2)) * toWorld;
        // El aire entre la figura y el marco es proporcional al tamaño del marco.
        const gap = (frame.height / 2) * toWorld * 0.15;
        const sxFit = ((frame.width / 2) * toWorld + gap) / ARCH_HALF.width;
        const syFit = ((frame.height / 2) * toWorld + gap) / ARCH_HALF.height;
        const f = smooth(current.fit);
        px += (cx - px) * f;
        py += (cy - py) * f;
        sx += (sxFit - sx) * f;
        sy += (syFit - sy) * f;
      }
      const sway = current.life * Math.sin(clock * 0.33) * 0.1;
      const free = 1 - smooth(current.fit);
      mesh.position.set(px, py, 0);
      mesh.scale.set(sx, sy, (sx + sy) / 2);
      mesh.rotation.set(current.rx + sway * 0.5, current.ry + spin * free * drift + sway, current.rz);
    }

    // ----- Figura y resplandor -----
    figureMesh.visible = figureKey !== null && figureOpacity > 0.01;
    if (figureMesh.visible) {
      figureMesh.position.set(fx, fy, fz);
      figureMesh.scale.set(fw, fh, 1);
      figureMaterial.uniforms.uOpacity.value = figureOpacity;
      figureMaterial.uniforms.uLight.value = figureLight;
      (figureMaterial.uniforms.uShift.value as Vector2).set(-camX * 0.6, -camY * 0.6);
    }
    glowMesh.visible = figureWarm > 0.01;
    if (glowMesh.visible) {
      const span = fh * 1.9;
      glowMesh.position.set(fx + fw * 0.2, fy + fh * 0.12, fz - 2.2);
      glowMesh.scale.set(span, span, 1);
      glowMaterial.uniforms.uPower.value = figureWarm * 0.2 * figureLight;
    }

    // ----- Polvo dorado: aparece cuando ella sale a la luz -----
    const dustGoal = figureKey ? figureOpacity * smooth((figureLight - 0.25) / 0.6) : 0;
    dustLevel += (dustGoal - dustLevel) * (1 - Math.exp(-dt / 0.5));
    dust.visible = dustLevel > 0.01;
    if (dust.visible) {
      const u = dustMaterial.uniforms;
      // Sin movimiento propio cuando se pide menos movimiento: polvo quieto.
      u.uTime.value = options.still ? 0 : clock;
      u.uScroll.value = options.still ? 0 : window.scrollY / Math.max(1, height);
      u.uPixel.value = renderer.getPixelRatio();
      u.uOpacity.value = dustLevel * 0.85;
      (u.uCenter.value as Vector3).set(fx, fy, fz);
      (u.uSize.value as Vector2).set(fw, fh);
      u.uMask.value = figureMaterial.uniforms.map.value;
      u.uHasMask.value = figureMaterial.uniforms.map.value ? 1 : 0;
    }

    renderer.render(scene, camera);
  };

  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  raf = requestAnimationFrame(tick);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      geometry.dispose();
      material.dispose();
      figureMaterial.dispose();
      glowMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      loaded.forEach((entry) => {
        entry.map.dispose();
        entry.relief.dispose();
      });
      environment.dispose();
      renderer.dispose();
    },
  };
}
