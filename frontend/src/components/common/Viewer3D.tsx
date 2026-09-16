import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { RotateCw, RefreshCw, ZoomIn, ZoomOut, Compass } from 'lucide-react';

export interface Viewer3DRef {
  getSnapshot: () => string;
  resetCamera: () => void;
  setCameraView: (view: 'front' | 'back' | 'side' | 'iso') => void;
  triggerRender: () => void;
}

interface Viewer3DProps {
  producto: string;
  subTipo?: string;
  productColor: string;
  canvasSource?: HTMLCanvasElement | null;
  textureVersion?: number;
  className?: string;
}

interface ModelConfig {
  path: string;
  targetScale: number;
  yOffset: number;
  cameraDistance: number;
  cameraHeight: number;
  metalness?: number;
  roughness?: number;
  patchType: 'shirt' | 'hoodie' | 'mug' | 'bottle' | 'pants' | 'cap' | 'tote';
  patchPos: [number, number, number];
  patchSize: [number, number];
}

// Configuración calibrada de modelos 3D y áreas de estampado
const GLTF_MODEL_CONFIGS: Record<string, ModelConfig> = {
  // --- ROPA: POLERAS Y CAMISETAS ---
  polera: {
    path: '/models/tshirt.glb',
    targetScale: 3.2,
    yOffset: -0.15,
    cameraDistance: 4.6,
    cameraHeight: 0.15,
    roughness: 0.85,
    metalness: 0.02,
    patchType: 'shirt',
    patchPos: [0, 0.06, 0.665],
    patchSize: [1.30, 1.50],
  },
  'cuello-redondo': {
    path: '/models/tshirt.glb',
    targetScale: 3.2,
    yOffset: -0.15,
    cameraDistance: 4.6,
    cameraHeight: 0.15,
    roughness: 0.85,
    metalness: 0.02,
    patchType: 'shirt',
    patchPos: [0, 0.06, 0.665],
    patchSize: [1.30, 1.50],
  },
  'cuello-v': {
    path: '/models/tshirt.glb',
    targetScale: 3.2,
    yOffset: -0.15,
    cameraDistance: 4.6,
    cameraHeight: 0.15,
    roughness: 0.85,
    metalness: 0.02,
    patchType: 'shirt',
    patchPos: [0, 0.06, 0.665],
    patchSize: [1.30, 1.50],
  },
  polo: {
    path: '/models/tshirt.glb',
    targetScale: 3.2,
    yOffset: -0.15,
    cameraDistance: 4.6,
    cameraHeight: 0.15,
    roughness: 0.90,
    metalness: 0.02,
    patchType: 'shirt',
    patchPos: [0, 0.06, 0.665],
    patchSize: [1.30, 1.50],
  },

  // --- ROPA: POLERONES Y HOODIES ---
  poleron: {
    path: '/models/hoodie.glb',
    targetScale: 3.3,
    yOffset: -0.2,
    cameraDistance: 4.8,
    cameraHeight: 0.15,
    roughness: 0.88,
    metalness: 0.02,
    patchType: 'hoodie',
    patchPos: [0, 0.06, 0.365],
    patchSize: [1.25, 1.40],
  },
  hoodie: {
    path: '/models/hoodie.glb',
    targetScale: 3.3,
    yOffset: -0.2,
    cameraDistance: 4.8,
    cameraHeight: 0.15,
    roughness: 0.88,
    metalness: 0.02,
    patchType: 'hoodie',
    patchPos: [0, 0.06, 0.365],
    patchSize: [1.25, 1.40],
  },
  canguro: {
    path: '/models/hoodie.glb',
    targetScale: 3.3,
    yOffset: -0.2,
    cameraDistance: 4.8,
    cameraHeight: 0.15,
    roughness: 0.88,
    metalness: 0.02,
    patchType: 'hoodie',
    patchPos: [0, 0.06, 0.365],
    patchSize: [1.25, 1.40],
  },

  // --- DRINKWARE: TAZAS Y MUGS ---
  taza: {
    path: '/models/mug.glb',
    targetScale: 2.6,
    yOffset: 0.0,
    cameraDistance: 3.8,
    cameraHeight: 0.2,
    roughness: 0.25,
    metalness: 0.05,
    patchType: 'mug',
    patchPos: [0, 0, 0],
    patchSize: [1.8, 1.8],
  },
  clasica: {
    path: '/models/mug.glb',
    targetScale: 2.6,
    yOffset: 0.0,
    cameraDistance: 3.8,
    cameraHeight: 0.2,
    roughness: 0.25,
    metalness: 0.05,
    patchType: 'mug',
    patchPos: [0, 0, 0],
    patchSize: [1.8, 1.8],
  },
  conica: {
    path: '/models/mug.glb',
    targetScale: 2.6,
    yOffset: 0.0,
    cameraDistance: 3.8,
    cameraHeight: 0.2,
    roughness: 0.25,
    metalness: 0.05,
    patchType: 'mug',
    patchPos: [0, 0, 0],
    patchSize: [1.8, 1.8],
  },
  mug: {
    path: '/models/mug.glb',
    targetScale: 2.6,
    yOffset: 0.0,
    cameraDistance: 3.8,
    cameraHeight: 0.2,
    roughness: 0.25,
    metalness: 0.05,
    patchType: 'mug',
    patchPos: [0, 0, 0],
    patchSize: [1.8, 1.8],
  },

  // --- DRINKWARE: TERMOS Y BOTELLAS ---
  botella: {
    path: '/models/bottle.glb',
    targetScale: 3.4,
    yOffset: 0.0,
    cameraDistance: 4.4,
    cameraHeight: 0.15,
    roughness: 0.2,
    metalness: 0.6,
    patchType: 'bottle',
    patchPos: [0, 0, 0],
    patchSize: [1.8, 2.0],
  },
  termo: {
    path: '/models/bottle.glb',
    targetScale: 3.4,
    yOffset: 0.0,
    cameraDistance: 4.4,
    cameraHeight: 0.15,
    roughness: 0.2,
    metalness: 0.6,
    patchType: 'bottle',
    patchPos: [0, 0, 0],
    patchSize: [1.8, 2.0],
  },
  deportivo: {
    path: '/models/bottle.glb',
    targetScale: 3.4,
    yOffset: 0.0,
    cameraDistance: 4.4,
    cameraHeight: 0.15,
    roughness: 0.2,
    metalness: 0.6,
    patchType: 'bottle',
    patchPos: [0, 0, 0],
    patchSize: [1.8, 2.0],
  },

  // --- DRINKWARE: VASOS QUE USAN MODELOS GLTF ---
  shopero: {
    path: '/models/mug.glb',
    targetScale: 2.7,
    yOffset: 0.0,
    cameraDistance: 3.9,
    cameraHeight: 0.2,
    roughness: 0.15,
    metalness: 0.1,
    patchType: 'mug',
    patchPos: [0, 0, 0],
    patchSize: [1.8, 1.8],
  },
  jarra: {
    path: '/models/mug.glb',
    targetScale: 2.8,
    yOffset: 0.0,
    cameraDistance: 4.0,
    cameraHeight: 0.2,
    roughness: 0.15,
    metalness: 0.1,
    patchType: 'mug',
    patchPos: [0, 0, 0],
    patchSize: [1.8, 1.8],
  },
  termico: {
    path: '/models/bottle.glb',
    targetScale: 3.2,
    yOffset: 0.0,
    cameraDistance: 4.3,
    cameraHeight: 0.15,
    roughness: 0.25,
    metalness: 0.7,
    patchType: 'bottle',
    patchPos: [0, 0, 0],
    patchSize: [1.8, 2.0],
  },
};

// Global cache for loaded GLTF scenes to ensure instant switches
const gltfSceneCache = new Map<string, THREE.Group>();
const gltfLoader = new GLTFLoader();

export const Viewer3D = forwardRef<Viewer3DRef, Viewer3DProps>(({
  producto,
  subTipo = 'default',
  productColor,
  canvasSource,
  textureVersion = 0,
  className = '',
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const productGroupRef = useRef<THREE.Group | null>(null);
  const baseMaterialsRef = useRef<THREE.Material[]>([]);
  const printMaterialsRef = useRef<THREE.Material[]>([]);
  const canvasTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activePreset, setActivePreset] = useState<'front' | 'back' | 'side' | 'iso'>('iso');
  const [isLoadingModel, setIsLoadingModel] = useState(false);

  // Direct render call
  const renderFrame = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  // Set camera view angles with smooth transition
  const setCameraView = useCallback((view: 'front' | 'back' | 'side' | 'iso') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActivePreset(view);

    const config = GLTF_MODEL_CONFIGS[subTipo] || GLTF_MODEL_CONFIGS[producto];
    const dist = config?.cameraDistance || 5.0;
    const height = config?.cameraHeight || 0.15;

    switch (view) {
      case 'front':
        cameraRef.current.position.set(0, height, dist);
        break;
      case 'back':
        cameraRef.current.position.set(0, height, -dist);
        break;
      case 'side':
        cameraRef.current.position.set(dist, height, 0);
        break;
      case 'iso':
      default:
        cameraRef.current.position.set(dist * 0.65, dist * 0.35, dist * 0.72);
        break;
    }
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, [producto, subTipo]);

  const resetCamera = useCallback(() => {
    setCameraView('iso');
  }, [setCameraView]);

  const getSnapshot = useCallback((): string => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return '';
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    return rendererRef.current.domElement.toDataURL('image/webp', 0.95);
  }, []);

  useImperativeHandle(ref, () => ({
    getSnapshot,
    resetCamera,
    setCameraView,
    triggerRender: renderFrame,
  }), [getSnapshot, resetCamera, setCameraView, renderFrame]);

  // Update dynamic base colors across all meshes
  const updateMaterialsColor = useCallback((hexColor: string) => {
    const c = new THREE.Color(hexColor);
    baseMaterialsRef.current.forEach((mat) => {
      if ((mat as THREE.MeshStandardMaterial).color) {
        (mat as THREE.MeshStandardMaterial).color.copy(c);
        mat.needsUpdate = true;
      }
    });
  }, []);

  // Helper to build print decal mesh calibrated for every model geometry
  const createPrintMesh = useCallback((
    patchType: string,
    pos: [number, number, number],
    size: [number, number],
    texture: THREE.Texture | null
  ): THREE.Mesh => {
    const printMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture || null,
      transparent: true,
      alphaTest: 0.001,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
      side: THREE.DoubleSide,
    });
    printMaterialsRef.current.push(printMat);

    if (patchType === 'mug') {
      // Body radius is 0.8004. Wrap radius 0.806 sits 0.005 outside the mug surface
      // Centered at theta = 0 (+Z), leaving room for the handle at +X
      const wrapGeo = new THREE.CylinderGeometry(0.806, 0.806, 1.75, 64, 1, true, -Math.PI * 0.65, Math.PI * 1.30);
      const mesh = new THREE.Mesh(wrapGeo, printMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      return mesh;
    } else if (patchType === 'bottle') {
      // Body radius is 0.7108. Wrap radius 0.716 sits 0.005 outside the bottle surface
      const wrapGeo = new THREE.CylinderGeometry(0.716, 0.716, 2.1, 64, 1, true, -Math.PI * 0.60, Math.PI * 1.20);
      const mesh = new THREE.Mesh(wrapGeo, printMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      return mesh;
    } else if (patchType === 'glass') {
      // Conical glass tumbler wrap
      const wrapGeo = new THREE.CylinderGeometry(0.854, 0.684, 1.8, 48, 1, true, -Math.PI * 0.60, Math.PI * 1.20);
      const mesh = new THREE.Mesh(wrapGeo, printMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      return mesh;
    } else if (patchType === 'cap') {
      // Cap forehead patch curved over spherical crown
      const printGeo = new THREE.PlaneGeometry(size[0] || 1.30, size[1] || 0.90, 24, 24);
      const pPos = printGeo.attributes.position;
      for (let i = 0; i < pPos.count; i++) {
        const x = pPos.getX(i);
        const y = pPos.getY(i);
        pPos.setZ(i, -(x * x) * 0.18 - (y * y) * 0.06);
      }
      printGeo.computeVertexNormals();
      const mesh = new THREE.Mesh(printGeo, printMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      return mesh;
    } else if (patchType === 'pants') {
      // Pants thigh patch
      const printGeo = new THREE.PlaneGeometry(size[0] || 0.60, size[1] || 0.85, 16, 16);
      const pPos = printGeo.attributes.position;
      for (let i = 0; i < pPos.count; i++) {
        const x = pPos.getX(i);
        pPos.setZ(i, -(x * x) * 0.08);
      }
      printGeo.computeVertexNormals();
      const mesh = new THREE.Mesh(printGeo, printMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      return mesh;
    } else {
      // Flat / Contoured Front Decal for shirts and hoodies
      const printW = size[0] || 1.30;
      const printH = size[1] || 1.50;
      const printGeo = new THREE.PlaneGeometry(printW, printH, 32, 32);
      const printPos = printGeo.attributes.position;
      for (let i = 0; i < printPos.count; i++) {
        const x = printPos.getX(i);
        const y = printPos.getY(i);
        const zCurve = -(x * x) * 0.08 + (y > 0 ? -y * 0.04 : y * 0.02);
        printPos.setZ(i, zCurve);
      }
      printGeo.computeVertexNormals();

      const mesh = new THREE.Mesh(printGeo, printMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      return mesh;
    }
  }, []);

  // Procedural Fallback Builder (For accessories or models without a standalone GLB)
  const buildProceduralFallback = useCallback((type: string, sub: string, color: string, texture: THREE.Texture | null) => {
    const group = new THREE.Group();
    baseMaterialsRef.current = [];
    printMaterialsRef.current = [];

    const createBaseMat = (roughness = 0.85, metalness = 0.04) => {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness,
        metalness,
        side: THREE.DoubleSide,
      });
      baseMaterialsRef.current.push(mat);
      return mat;
    };

    if (type === 'vaso' || sub === 'clasico') {
      // Vaso de vidrio / Tumbler cónico con fondo grueso de cristal
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color === '#FFFFFF' ? '#e2e8f0' : color),
        roughness: 0.08,
        metalness: 0.1,
        transmission: 0.85,
        ior: 1.5,
        thickness: 0.2,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
      });
      baseMaterialsRef.current.push(glassMat);

      const bodyGeo = new THREE.CylinderGeometry(0.85, 0.68, 2.2, 48, 1, true);
      const bodyMesh = new THREE.Mesh(bodyGeo, glassMat);
      group.add(bodyMesh);

      const baseGeo = new THREE.CylinderGeometry(0.70, 0.70, 0.28, 48);
      const baseMesh = new THREE.Mesh(baseGeo, glassMat);
      baseMesh.position.y = -1.0;
      group.add(baseMesh);

      const printMesh = createPrintMesh('glass', [0, 0.1, 0], [1.8, 1.8], texture);
      group.add(printMesh);
    } else if (type === 'pantalon' || sub === 'jogger' || sub === 'recto') {
      const mat = createBaseMat(0.85, 0.02);
      const pelvisGeo = new THREE.CylinderGeometry(0.92, 0.88, 0.9, 32);
      pelvisGeo.scale(1.0, 1.0, 0.55);
      const pelvis = new THREE.Mesh(pelvisGeo, mat);
      pelvis.position.y = 0.9;
      group.add(pelvis);

      const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.28, 2.3, 32), mat);
      leftLeg.position.set(-0.44, -0.65, 0);
      leftLeg.rotation.z = -0.04;
      const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.28, 2.3, 32), mat);
      rightLeg.position.set(0.44, -0.65, 0);
      rightLeg.rotation.z = 0.04;
      group.add(leftLeg, rightLeg);

      const printMesh = createPrintMesh('pants', [-0.44, -0.2, 0.32], [0.60, 0.85], texture);
      group.add(printMesh);
    } else if (type === 'gorro' || type === 'gorra' || type === 'jockey') {
      const mat = createBaseMat(0.8, 0.05);
      const crownGeo = new THREE.SphereGeometry(1.05, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
      const crown = new THREE.Mesh(crownGeo, mat);
      crown.position.y = 0.2;
      group.add(crown);

      const visor = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.06, 32, 1, false, 0, Math.PI * 0.6), mat);
      visor.rotation.set(-0.15, -Math.PI * 0.3, 0);
      visor.position.set(0, 0.15, 0.6);
      group.add(visor);

      const printMesh = createPrintMesh('cap', [0, 0.55, 0.98], [1.30, 0.90], texture);
      group.add(printMesh);
    } else {
      // General apparel fallback
      const mat = createBaseMat(0.85, 0.02);
      const torsoGeo = new THREE.CylinderGeometry(1.05, 0.98, 2.4, 48);
      torsoGeo.scale(1.0, 1.0, 0.4);
      const torso = new THREE.Mesh(torsoGeo, mat);
      group.add(torso);

      const printMesh = createPrintMesh('shirt', [0, 0.05, 0.42], [1.30, 1.50], texture);
      group.add(printMesh);
    }

    return group;
  }, [createPrintMesh]);

  // Load and configure GLTF 3D model
  const loadProductModel = useCallback(async (
    type: string,
    sub: string,
    color: string,
    texture: THREE.Texture | null
  ): Promise<THREE.Group> => {
    const configKey = GLTF_MODEL_CONFIGS[sub] ? sub : GLTF_MODEL_CONFIGS[type] ? type : null;
    if (!configKey) {
      return buildProceduralFallback(type, sub, color, texture);
    }

    const config = GLTF_MODEL_CONFIGS[configKey];
    baseMaterialsRef.current = [];
    printMaterialsRef.current = [];

    try {
      let baseScene = gltfSceneCache.get(config.path);
      if (!baseScene) {
        const gltf = await gltfLoader.loadAsync(config.path);
        baseScene = gltf.scene;
        gltfSceneCache.set(config.path, baseScene);
      }

      // Deep clone scene using SkeletonUtils to preserve all skinning/materials
      const modelGroup = SkeletonUtils.clone(baseScene) as THREE.Group;

      // Compute bounding box and normalize scale & center
      const box = new THREE.Box3().setFromObject(modelGroup);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = (config.targetScale || 3.0) / (maxDim || 1.0);

      // Wrapper group to hold centered & scaled model
      const rootGroup = new THREE.Group();
      modelGroup.scale.setScalar(scaleFactor);

      // Mug body centering correction: handle is at +X, body cylinder is centered at (0, 0)
      if (config.patchType === 'mug') {
        modelGroup.position.set(
          0,
          -center.y * scaleFactor + (config.yOffset || 0),
          0
        );
      } else {
        modelGroup.position.set(
          -center.x * scaleFactor,
          -center.y * scaleFactor + (config.yOffset || 0),
          -center.z * scaleFactor
        );
      }
      rootGroup.add(modelGroup);

      // Material colorization (WITHOUT SHADOWS)
      const garmentColor = new THREE.Color(color);

      modelGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = false;
          mesh.receiveShadow = false;

          // Create standard PBR fabric/body material
          const newMat = new THREE.MeshStandardMaterial({
            color: garmentColor,
            roughness: config.roughness ?? 0.85,
            metalness: config.metalness ?? 0.02,
            side: THREE.DoubleSide,
          });

          mesh.material = newMat;
          baseMaterialsRef.current.push(newMat);
        }
      });

      // Attach persistent Decal/Print mesh directly to the root group
      const printMesh = createPrintMesh(
        config.patchType,
        config.patchPos,
        config.patchSize,
        texture
      );
      rootGroup.add(printMesh);

      return rootGroup;
    } catch {
      // Graceful fallback to procedural mesh
      return buildProceduralFallback(type, sub, color, texture);
    }
  }, [buildProceduralFallback, createPrintMesh]);

  // Three.js Scene, Renderer & 4-Point Clean Studio Lighting (NO SHADOWS)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(3.2, 1.8, 3.6);
    cameraRef.current = camera;

    // 3. Renderer (Shadows Disabled for pure, clean e-commerce rendering)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.8;
    controls.maxDistance = 10.0;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.minPolarAngle = Math.PI * 0.05;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Professional Studio Illumination (Bright, Clean, Uniform)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 1.0);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf8fafc, 0.9);
    fillLight.position.set(-4, 3, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // Animation Loop
    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 2.0;
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate]);

  // Canvas dynamic texture synchronization
  useEffect(() => {
    if (!canvasSource) return;

    try {
      if (!canvasTextureRef.current) {
        const texture = new THREE.CanvasTexture(canvasSource);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        texture.needsUpdate = true;
        canvasTextureRef.current = texture;
      } else {
        canvasTextureRef.current.image = canvasSource;
        canvasTextureRef.current.needsUpdate = true;
      }
    } catch {
      // Texture sync fallback
    }

    printMaterialsRef.current.forEach((mat) => {
      if (canvasTextureRef.current) {
        (mat as any).map = canvasTextureRef.current;
        mat.needsUpdate = true;
      }
    });

    renderFrame();
  }, [canvasSource, textureVersion, renderFrame]);

  // Rebuild / Load 3D Model when product, subTipo or base color changes
  useEffect(() => {
    if (!sceneRef.current) return;

    let isSubscribed = true;
    setIsLoadingModel(true);

    loadProductModel(producto, subTipo, productColor, canvasTextureRef.current).then((group) => {
      if (!isSubscribed || !sceneRef.current) return;

      if (productGroupRef.current) {
        sceneRef.current.remove(productGroupRef.current);
        productGroupRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry?.dispose();
          }
        });
      }

      productGroupRef.current = group;
      sceneRef.current.add(group);
      setIsLoadingModel(false);
      renderFrame();
    });

    return () => {
      isSubscribed = false;
    };
  }, [producto, subTipo, productColor, loadProductModel, renderFrame]);

  // Real-time garment color update
  useEffect(() => {
    updateMaterialsColor(productColor);
  }, [productColor, updateMaterialsColor]);

  // Zoom controls
  const handleZoom = (inOut: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const factor = inOut === 'in' ? 0.85 : 1.15;
    cameraRef.current.position.multiplyScalar(factor);
    if (controlsRef.current) controlsRef.current.update();
  };

  return (
    <div className={`position-relative w-100 h-100 d-flex flex-column ${className}`} style={{ minHeight: '520px' }}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-100 flex-grow-1 rounded"
        style={{ touchAction: 'none', cursor: 'grab', minHeight: '500px' }}
      />

      {/* Floating 3D Navigation Controls Bar */}
      <div className="position-absolute top-0 start-0 m-3 d-flex flex-wrap gap-1 align-items-center bg-card bg-opacity-90 backdrop-blur p-1 rounded-3 border border-border shadow-sm z-3">
        <button
          type="button"
          onClick={() => setCameraView('front')}
          className={`btn btn-sm py-1 px-2 font-montserrat fw-semibold ${activePreset === 'front' ? 'btn-primary' : 'text-muted bg-transparent border-0'}`}
          style={{ fontSize: '0.72rem' }}
        >
          Frente
        </button>
        <button
          type="button"
          onClick={() => setCameraView('back')}
          className={`btn btn-sm py-1 px-2 font-montserrat fw-semibold ${activePreset === 'back' ? 'btn-primary' : 'text-muted bg-transparent border-0'}`}
          style={{ fontSize: '0.72rem' }}
        >
          Espalda
        </button>
        <button
          type="button"
          onClick={() => setCameraView('side')}
          className={`btn btn-sm py-1 px-2 font-montserrat fw-semibold ${activePreset === 'side' ? 'btn-primary' : 'text-muted bg-transparent border-0'}`}
          style={{ fontSize: '0.72rem' }}
        >
          Lateral
        </button>
        <button
          type="button"
          onClick={() => setCameraView('iso')}
          className={`btn btn-sm py-1 px-2 font-montserrat fw-semibold ${activePreset === 'iso' ? 'btn-primary' : 'text-muted bg-transparent border-0'}`}
          style={{ fontSize: '0.72rem' }}
        >
          3D
        </button>
      </div>

      {/* Right Controls: Auto-Rotate, Reset & Zoom */}
      <div className="position-absolute top-0 end-0 m-3 d-flex flex-column gap-1 bg-card bg-opacity-90 backdrop-blur p-1 rounded-3 border border-border shadow-sm z-3">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Detener rotación' : 'Rotar 360° automático'}
          className={`btn btn-sm p-1 d-flex align-items-center justify-content-center ${autoRotate ? 'btn-primary' : 'text-muted bg-transparent border-0'}`}
          style={{ width: '30px', height: '30px' }}
        >
          <RotateCw size={15} className={autoRotate ? 'spin-anim' : ''} />
        </button>
        <button
          type="button"
          onClick={resetCamera}
          title="Restablecer vista"
          className="btn btn-sm p-1 text-muted bg-transparent border-0 d-flex align-items-center justify-content-center"
          style={{ width: '30px', height: '30px' }}
        >
          <RefreshCw size={15} />
        </button>
        <button
          type="button"
          onClick={() => handleZoom('in')}
          title="Acercar"
          className="btn btn-sm p-1 text-muted bg-transparent border-0 d-flex align-items-center justify-content-center"
          style={{ width: '30px', height: '30px' }}
        >
          <ZoomIn size={15} />
        </button>
        <button
          type="button"
          onClick={() => handleZoom('out')}
          title="Alejar"
          className="btn btn-sm p-1 text-muted bg-transparent border-0 d-flex align-items-center justify-content-center"
          style={{ width: '30px', height: '30px' }}
        >
          <ZoomOut size={15} />
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoadingModel && (
        <div className="position-absolute top-50 start-50 translate-middle badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill shadow z-3">
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Cargando modelo 3D...
        </div>
      )}

      {/* 360 Drag Indicator Badge at bottom */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 pointer-events-none z-2">
        <span className="badge bg-elevated text-muted border border-border font-montserrat fw-normal px-3 py-1 d-inline-flex align-items-center gap-1 shadow-sm" style={{ fontSize: '0.72rem', opacity: 0.95 }}>
          <Compass size={13} className="text-primary" />
          Haz clic y arrastra para rotar en 360°
        </span>
      </div>
    </div>
  );
});

Viewer3D.displayName = 'Viewer3D';
