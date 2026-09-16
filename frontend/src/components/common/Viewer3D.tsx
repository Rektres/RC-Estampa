import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
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
  decalPosition: [number, number, number];
  decalOrientation: [number, number, number];
  decalSize: [number, number, number];
  cameraDistance: number;
  cameraHeight: number;
  metalness?: number;
  roughness?: number;
}

// Configuración de modelos GLB profesionales y parámetros de proyección de estampado
const GLTF_MODEL_CONFIGS: Record<string, ModelConfig> = {
  polera: {
    path: '/models/tshirt.glb',
    targetScale: 3.2,
    yOffset: -0.15,
    decalPosition: [0, 0.04, 0.15],
    decalOrientation: [0, 0, 0],
    decalSize: [0.38, 0.48, 0.35],
    cameraDistance: 4.6,
    cameraHeight: 0.15,
    roughness: 0.85,
    metalness: 0.02,
  },
  'cuello-redondo': {
    path: '/models/tshirt.glb',
    targetScale: 3.2,
    yOffset: -0.15,
    decalPosition: [0, 0.04, 0.15],
    decalOrientation: [0, 0, 0],
    decalSize: [0.38, 0.48, 0.35],
    cameraDistance: 4.6,
    cameraHeight: 0.15,
    roughness: 0.85,
    metalness: 0.02,
  },
  'cuello-v': {
    path: '/models/tshirt.glb',
    targetScale: 3.2,
    yOffset: -0.15,
    decalPosition: [0, 0.04, 0.15],
    decalOrientation: [0, 0, 0],
    decalSize: [0.38, 0.48, 0.35],
    cameraDistance: 4.6,
    cameraHeight: 0.15,
    roughness: 0.85,
    metalness: 0.02,
  },
  polo: {
    path: '/models/tshirt.glb',
    targetScale: 3.2,
    yOffset: -0.15,
    decalPosition: [0, 0.04, 0.15],
    decalOrientation: [0, 0, 0],
    decalSize: [0.38, 0.48, 0.35],
    cameraDistance: 4.6,
    cameraHeight: 0.15,
    roughness: 0.90,
    metalness: 0.02,
  },
  poleron: {
    path: '/models/hoodie.glb',
    targetScale: 3.3,
    yOffset: -0.2,
    decalPosition: [0, 0.10, 0.20],
    decalOrientation: [0, 0, 0],
    decalSize: [0.38, 0.46, 0.35],
    cameraDistance: 4.8,
    cameraHeight: 0.15,
    roughness: 0.88,
    metalness: 0.02,
  },
  hoodie: {
    path: '/models/hoodie.glb',
    targetScale: 3.3,
    yOffset: -0.2,
    decalPosition: [0, 0.10, 0.20],
    decalOrientation: [0, 0, 0],
    decalSize: [0.38, 0.46, 0.35],
    cameraDistance: 4.8,
    cameraHeight: 0.15,
    roughness: 0.88,
    metalness: 0.02,
  },
  canguro: {
    path: '/models/hoodie.glb',
    targetScale: 3.3,
    yOffset: -0.2,
    decalPosition: [0, 0.10, 0.20],
    decalOrientation: [0, 0, 0],
    decalSize: [0.38, 0.46, 0.35],
    cameraDistance: 4.8,
    cameraHeight: 0.15,
    roughness: 0.88,
    metalness: 0.02,
  },
  taza: {
    path: '/models/mug.glb',
    targetScale: 2.6,
    yOffset: 0.0,
    decalPosition: [0, 0, 0.48],
    decalOrientation: [0, 0, 0],
    decalSize: [0.65, 0.65, 0.55],
    cameraDistance: 3.8,
    cameraHeight: 0.2,
    roughness: 0.25,
    metalness: 0.05,
  },
  mug: {
    path: '/models/mug.glb',
    targetScale: 2.6,
    yOffset: 0.0,
    decalPosition: [0, 0, 0.48],
    decalOrientation: [0, 0, 0],
    decalSize: [0.65, 0.65, 0.55],
    cameraDistance: 3.8,
    cameraHeight: 0.2,
    roughness: 0.25,
    metalness: 0.05,
  },
  botella: {
    path: '/models/bottle.glb',
    targetScale: 3.4,
    yOffset: 0.0,
    decalPosition: [0, 0, 0.38],
    decalOrientation: [0, 0, 0],
    decalSize: [0.55, 0.85, 0.45],
    cameraDistance: 4.4,
    cameraHeight: 0.15,
    roughness: 0.2,
    metalness: 0.6,
  },
  termo: {
    path: '/models/bottle.glb',
    targetScale: 3.4,
    yOffset: 0.0,
    decalPosition: [0, 0, 0.38],
    decalOrientation: [0, 0, 0],
    decalSize: [0.55, 0.85, 0.45],
    cameraDistance: 4.4,
    cameraHeight: 0.15,
    roughness: 0.2,
    metalness: 0.6,
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
  const baseMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const printMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const decalMeshRef = useRef<THREE.Mesh | null>(null);
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

    const config = GLTF_MODEL_CONFIGS[producto] || GLTF_MODEL_CONFIGS[subTipo];
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
      mat.color.copy(c);
      mat.needsUpdate = true;
    });
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

    const createPrintMat = () => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture || null,
        transparent: true,
        alphaTest: 0.01,
        roughness: 0.8,
        metalness: 0.0,
        polygonOffset: true,
        polygonOffsetFactor: -1.5,
        polygonOffsetUnits: -1.5,
        side: THREE.FrontSide,
      });
      printMaterialsRef.current.push(mat);
      return mat;
    };

    if (type === 'pantalon' || sub === 'jogger' || sub === 'recto') {
      const mat = createBaseMat(0.85, 0.02);
      const printMat = createPrintMat();

      // Waistband & Pelvis
      const pelvisGeo = new THREE.CylinderGeometry(0.92, 0.88, 0.9, 32);
      pelvisGeo.scale(1.0, 1.0, 0.55);
      const pelvis = new THREE.Mesh(pelvisGeo, mat);
      pelvis.position.y = 0.9;
      group.add(pelvis);

      // Left Leg
      const leftLegGeo = new THREE.CylinderGeometry(0.42, 0.28, 2.3, 32);
      const leftLeg = new THREE.Mesh(leftLegGeo, mat);
      leftLeg.position.set(-0.44, -0.65, 0);
      leftLeg.rotation.z = -0.04;
      group.add(leftLeg);

      // Right Leg
      const rightLegGeo = new THREE.CylinderGeometry(0.42, 0.28, 2.3, 32);
      const rightLeg = new THREE.Mesh(rightLegGeo, mat);
      rightLeg.position.set(0.44, -0.65, 0);
      rightLeg.rotation.z = 0.04;
      group.add(rightLeg);

      // Thigh print
      const thighPrintGeo = new THREE.PlaneGeometry(0.4, 0.6);
      const thighPrint = new THREE.Mesh(thighPrintGeo, printMat);
      thighPrint.position.set(-0.44, -0.2, 0.32);
      group.add(thighPrint);
    } else if (type === 'gorro' || type === 'jockey') {
      const mat = createBaseMat(0.8, 0.05);
      const printMat = createPrintMat();

      // Crown
      const crownGeo = new THREE.SphereGeometry(1.05, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
      const crown = new THREE.Mesh(crownGeo, mat);
      crown.position.y = 0.2;
      group.add(crown);

      // Visor
      const visorGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.06, 32, 1, false, 0, Math.PI * 0.6);
      const visor = new THREE.Mesh(visorGeo, mat);
      visor.rotation.set(-0.15, -Math.PI * 0.3, 0);
      visor.position.set(0, 0.15, 0.6);
      group.add(visor);

      // Front Patch Print
      const patchGeo = new THREE.PlaneGeometry(0.7, 0.55);
      const patch = new THREE.Mesh(patchGeo, printMat);
      patch.position.set(0, 0.55, 0.98);
      group.add(patch);
    } else {
      // General apparel fallback
      const mat = createBaseMat(0.85, 0.02);
      const printMat = createPrintMat();

      const torsoGeo = new THREE.CylinderGeometry(1.05, 0.98, 2.4, 48);
      torsoGeo.scale(1.0, 1.0, 0.4);
      const torso = new THREE.Mesh(torsoGeo, mat);
      group.add(torso);

      const printGeo = new THREE.PlaneGeometry(1.15, 1.35);
      const printMesh = new THREE.Mesh(printGeo, printMat);
      printMesh.position.set(0, 0.05, 0.42);
      group.add(printMesh);
    }

    return group;
  }, []);

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
    decalMeshRef.current = null;

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
      modelGroup.position.set(
        -center.x * scaleFactor,
        -center.y * scaleFactor + (config.yOffset || 0),
        -center.z * scaleFactor
      );
      rootGroup.add(modelGroup);

      // Material colorization & Shadow configuration
      const garmentColor = new THREE.Color(color);
      let targetMeshForDecal: THREE.Mesh | null = null;

      modelGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Select primary mesh for decal projection
          if (!targetMeshForDecal) {
            targetMeshForDecal = mesh;
          }

          // Create standard PBR fabric material
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

      // Decal Projection Setup
      if (texture && targetMeshForDecal) {
        const decalMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: texture,
          transparent: true,
          alphaTest: 0.01,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -4,
          roughness: 0.8,
          metalness: 0.0,
          side: THREE.FrontSide,
        });
        printMaterialsRef.current.push(decalMat);

        const decalPos = new THREE.Vector3(...config.decalPosition);
        const decalEuler = new THREE.Euler(...config.decalOrientation);
        const decalSize = new THREE.Vector3(...config.decalSize);

        try {
          const decalGeo = new DecalGeometry(targetMeshForDecal, decalPos, decalEuler, decalSize);
          const decalMesh = new THREE.Mesh(decalGeo, decalMat);
          decalMesh.renderOrder = 2;
          (targetMeshForDecal as THREE.Mesh).add(decalMesh);
          decalMeshRef.current = decalMesh;
        } catch {
          // Fallback to front billboard plane if DecalGeometry fails on complex non-manifold geometry
          const planeGeo = new THREE.PlaneGeometry(config.decalSize[0] * 1.5, config.decalSize[1] * 1.5);
          const planeMesh = new THREE.Mesh(planeGeo, decalMat);
          planeMesh.position.set(decalPos.x, decalPos.y, decalPos.z + 0.02);
          rootGroup.add(planeMesh);
        }
      }

      return rootGroup;
    } catch {
      // Graceful fallback to procedural mesh
      return buildProceduralFallback(type, sub, color, texture);
    }
  }, [buildProceduralFallback]);

  // Three.js Scene, Renderer & 4-Point Lighting Initialization
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

    // 3. Renderer with soft PBR shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
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

    // 5. Professional 4-Point Studio Lighting
    // Ambient / Hemisphere soft bounce
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x64748b, 0.9);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Key Light (Front-Right Key)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(4, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Fill Light (Front-Left Fill)
    const fillLight = new THREE.DirectionalLight(0xf1f5f9, 0.9);
    fillLight.position.set(-4, 3, 4);
    scene.add(fillLight);

    // Rim / Backlight (Highlights edges & cloth silhouette)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // Soft Shadow Contact Floor Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(12, 12);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.16 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.75;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

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
        texture.anisotropy = 4;
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
        mat.map = canvasTextureRef.current;
        mat.needsUpdate = true;
      }
    });
  }, [canvasSource, textureVersion]);

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
