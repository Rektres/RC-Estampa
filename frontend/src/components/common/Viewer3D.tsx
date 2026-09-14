import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, RefreshCw, ZoomIn, ZoomOut, Compass } from 'lucide-react';

export interface Viewer3DRef {
  getSnapshot: () => string;
  resetCamera: () => void;
  setCameraView: (view: 'front' | 'back' | 'side' | 'iso') => void;
  triggerRender: () => void;
}

interface Viewer3DProps {
  producto: string;
  productColor: string;
  canvasSource?: HTMLCanvasElement | null;
  textureVersion?: number;
  className?: string;
}

export const Viewer3D = forwardRef<Viewer3DRef, Viewer3DProps>(({
  producto,
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
  const materialsRef = useRef<{ base: THREE.MeshStandardMaterial; printZone?: THREE.MeshStandardMaterial }[]>([]);
  const canvasTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isInteractingRef = useRef<boolean>(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activePreset, setActivePreset] = useState<'front' | 'back' | 'side' | 'iso'>('iso');

  // Request frame to render on demand
  const renderFrame = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    if (controlsRef.current) controlsRef.current.update();
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  // Set camera view angles
  const setCameraView = useCallback((view: 'front' | 'back' | 'side' | 'iso') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActivePreset(view);
    const dist = 5.2;

    switch (view) {
      case 'front':
        cameraRef.current.position.set(0, 0.4, dist);
        break;
      case 'back':
        cameraRef.current.position.set(0, 0.4, -dist);
        break;
      case 'side':
        cameraRef.current.position.set(dist, 0.4, 0);
        break;
      case 'iso':
      default:
        cameraRef.current.position.set(3.4, 2.2, 3.8);
        break;
    }
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    renderFrame();
  }, [renderFrame]);

  const resetCamera = useCallback(() => {
    setCameraView('iso');
  }, [setCameraView]);

  const getSnapshot = useCallback((): string => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return '';
    renderFrame();
    return rendererRef.current.domElement.toDataURL('image/webp', 0.92);
  }, [renderFrame]);

  useImperativeHandle(ref, () => ({
    getSnapshot,
    resetCamera,
    setCameraView,
    triggerRender: renderFrame,
  }), [getSnapshot, resetCamera, setCameraView, renderFrame]);

  // Build high quality 3D meshes per product
  const buildProductMesh = useCallback((type: string, color: string, texture: THREE.Texture | null) => {
    const group = new THREE.Group();
    materialsRef.current = [];

    // Helper for PBR material
    const createMaterial = (roughness = 0.85, metalness = 0.05, clearcoat = 0.0) => {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness,
        metalness,
        side: THREE.DoubleSide,
      });
      if (clearcoat > 0) {
        (mat as any).clearcoat = clearcoat;
        (mat as any).clearcoatRoughness = 0.1;
      }
      return mat;
    };

    switch (type) {
      case 'taza': {
        // Ceramic Glossy PBR
        const ceramicMat = createMaterial(0.15, 0.04, 0.4);
        const printMat = ceramicMat.clone();
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.repeat.set(1, 1);
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: ceramicMat, printZone: printMat });

        // Outer cylinder (mapped with design)
        const outerGeo = new THREE.CylinderGeometry(1.2, 1.15, 2.6, 64, 1, true);
        const outerMesh = new THREE.Mesh(outerGeo, printMat);
        outerMesh.castShadow = true;
        outerMesh.receiveShadow = true;
        group.add(outerMesh);

        // Inner cylinder (white / ceramic)
        const innerMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#FFFFFF'), roughness: 0.12, metalness: 0.02 });
        const innerGeo = new THREE.CylinderGeometry(1.1, 1.05, 2.55, 48, 1, true);
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        innerMesh.position.y = 0.04;
        group.add(innerMesh);

        // Rim / Lip
        const rimGeo = new THREE.RingGeometry(1.1, 1.2, 64);
        const rimMesh = new THREE.Mesh(rimGeo, ceramicMat);
        rimMesh.rotation.x = -Math.PI / 2;
        rimMesh.position.y = 1.3;
        group.add(rimMesh);

        // Bottom base
        const baseGeo = new THREE.CircleGeometry(1.15, 64);
        const baseMesh = new THREE.Mesh(baseGeo, ceramicMat);
        baseMesh.rotation.x = Math.PI / 2;
        baseMesh.position.y = -1.3;
        group.add(baseMesh);

        // Handle (Torus with smooth curve attached on side)
        const handleCurve = new THREE.CurvePath<THREE.Vector3>();
        const p0 = new THREE.Vector3(-1.18, 0.8, 0);
        const p1 = new THREE.Vector3(-2.1, 0.6, 0);
        const p2 = new THREE.Vector3(-2.1, -0.6, 0);
        const p3 = new THREE.Vector3(-1.14, -0.8, 0);
        const bezier = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
        handleCurve.add(bezier);
        const handleGeo = new THREE.TubeGeometry(handleCurve, 40, 0.18, 24, false);
        const handleMesh = new THREE.Mesh(handleGeo, ceramicMat);
        handleMesh.castShadow = true;
        group.add(handleMesh);
        break;
      }

      case 'termo': {
        // Metallic Stainless Steel Tumbler / Bottle
        const steelBodyMat = createMaterial(0.28, 0.65, 0.2);
        const printMat = steelBodyMat.clone();
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: steelBodyMat, printZone: printMat });

        // Main cylindrical insulated body
        const bodyGeo = new THREE.CylinderGeometry(1.05, 1.0, 3.2, 64);
        const bodyMesh = new THREE.Mesh(bodyGeo, printMat);
        bodyMesh.castShadow = true;
        group.add(bodyMesh);

        // Tapered shoulder
        const shoulderGeo = new THREE.CylinderGeometry(0.75, 1.05, 0.5, 64);
        const shoulderMesh = new THREE.Mesh(shoulderGeo, steelBodyMat);
        shoulderMesh.position.y = 1.85;
        group.add(shoulderMesh);

        // Neck
        const neckGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.35, 64);
        const neckMesh = new THREE.Mesh(neckGeo, steelBodyMat);
        neckMesh.position.y = 2.25;
        group.add(neckMesh);

        // Cap / Lid (Brushed silver + Matte black silicone ring)
        const capMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#333333'), roughness: 0.3, metalness: 0.8 });
        const capGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.75, 64);
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.y = 2.7;
        group.add(capMesh);

        // Grip accent ring on cap
        const ringMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#C9A84C'), roughness: 0.2, metalness: 0.9 });
        const ringGeo = new THREE.TorusGeometry(0.73, 0.04, 16, 64);
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 2.65;
        group.add(ringMesh);
        break;
      }

      case 'vaso': {
        // Tapered Tumbler / Glass
        const glassMat = createMaterial(0.2, 0.15, 0.5);
        const printMat = glassMat.clone();
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: glassMat, printZone: printMat });

        const vasoGeo = new THREE.CylinderGeometry(1.2, 0.9, 3.0, 64, 1, false);
        const vasoMesh = new THREE.Mesh(vasoGeo, printMat);
        vasoMesh.castShadow = true;
        group.add(vasoMesh);

        // Rim ring
        const rimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#D4AF37'), roughness: 0.2, metalness: 0.8 });
        const rimGeo = new THREE.TorusGeometry(1.2, 0.05, 16, 64);
        const rimMesh = new THREE.Mesh(rimGeo, rimMat);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = 1.5;
        group.add(rimMesh);
        break;
      }

      case 'polera': {
        // Cotton T-Shirt 3D Geometry
        const fabricMat = createMaterial(0.85, 0.0, 0.0);
        const printMat = fabricMat.clone();
        if (texture) {
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: fabricMat, printZone: printMat });

        // Torso body (front with print texture)
        const torsoShape = new THREE.Shape();
        torsoShape.moveTo(-1.4, -1.8);
        torsoShape.lineTo(1.4, -1.8);
        torsoShape.lineTo(1.3, 1.2);
        torsoShape.lineTo(1.8, 0.6);
        torsoShape.lineTo(2.2, 1.1);
        torsoShape.lineTo(1.0, 1.6);
        torsoShape.quadraticCurveTo(0.5, 1.3, 0, 1.3);
        torsoShape.quadraticCurveTo(-0.5, 1.3, -1.0, 1.6);
        torsoShape.lineTo(-2.2, 1.1);
        torsoShape.lineTo(-1.8, 0.6);
        torsoShape.lineTo(-1.3, 1.2);
        torsoShape.closePath();

        const extrudeSettings = {
          depth: 0.6,
          bevelEnabled: true,
          bevelSegments: 8,
          steps: 2,
          bevelSize: 0.12,
          bevelThickness: 0.15,
        };

        const tShirtGeo = new THREE.ExtrudeGeometry(torsoShape, extrudeSettings);
        tShirtGeo.center();

        // Custom UV mapping for chest print zone
        const pos = tShirtGeo.attributes.position;
        const uvs = tShirtGeo.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);

          // Front facing vertices map to canvas
          if (z > 0.15) {
            const u = (x + 1.2) / 2.4;
            const v = (y + 1.6) / 3.0;
            uvs.setXY(i, THREE.MathUtils.clamp(u, 0, 1), THREE.MathUtils.clamp(v, 0, 1));
          }
        }
        uvs.needsUpdate = true;

        const tShirtMesh = new THREE.Mesh(tShirtGeo, printMat);
        tShirtMesh.castShadow = true;
        group.add(tShirtMesh);

        // Collar Ribbing
        const collarCurve = new THREE.EllipseCurve(0, 1.35, 0.55, 0.35, 0, 2 * Math.PI, false, 0);
        const collarPoints = collarCurve.getPoints(32).map(p => new THREE.Vector3(p.x, p.y, 0.32));
        const collarTubePath = new THREE.CatmullRomCurve3(collarPoints, true);
        const collarGeo = new THREE.TubeGeometry(collarTubePath, 32, 0.08, 12, true);
        const collarMesh = new THREE.Mesh(collarGeo, fabricMat);
        group.add(collarMesh);
        break;
      }

      case 'gorra': {
        // Baseball Cap / Jockey 3D Geometry
        const capFabricMat = createMaterial(0.8, 0.02, 0.0);
        const printMat = capFabricMat.clone();
        if (texture) {
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: capFabricMat, printZone: printMat });

        // Crown / Dome (Dome half sphere slightly squashed)
        const crownGeo = new THREE.SphereGeometry(1.4, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
        crownGeo.scale(1.0, 0.75, 1.15);
        const crownMesh = new THREE.Mesh(crownGeo, printMat);
        crownMesh.position.set(0, 0.2, 0);
        crownMesh.castShadow = true;
        group.add(crownMesh);

        // Visor / Brim (Curved forward plate)
        const brimShape = new THREE.Shape();
        brimShape.moveTo(-1.2, 0);
        brimShape.quadraticCurveTo(0, 1.8, 1.2, 0);
        brimShape.quadraticCurveTo(0, 0.4, -1.2, 0);
        const brimExtrude = {
          depth: 0.08,
          bevelEnabled: true,
          bevelSegments: 4,
          bevelSize: 0.04,
          bevelThickness: 0.04,
        };
        const brimGeo = new THREE.ExtrudeGeometry(brimShape, brimExtrude);
        brimGeo.center();
        const brimMesh = new THREE.Mesh(brimGeo, capFabricMat);
        brimMesh.rotation.x = Math.PI / 2.3;
        brimMesh.position.set(0, 0.15, 1.55);
        brimMesh.castShadow = true;
        group.add(brimMesh);

        // Top button
        const buttonGeo = new THREE.SphereGeometry(0.12, 16, 16);
        buttonGeo.scale(1, 0.6, 1);
        const buttonMesh = new THREE.Mesh(buttonGeo, capFabricMat);
        buttonMesh.position.set(0, 1.25, 0);
        group.add(buttonMesh);
        break;
      }

      case 'pantalon': {
        // Pants / Joggers
        const pantsMat = createMaterial(0.85, 0.0, 0.0);
        const printMat = pantsMat.clone();
        if (texture) {
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: pantsMat, printZone: printMat });

        // Waistband
        const waistGeo = new THREE.CylinderGeometry(1.15, 1.1, 0.7, 32);
        const waistMesh = new THREE.Mesh(waistGeo, pantsMat);
        waistMesh.position.y = 1.6;
        group.add(waistMesh);

        // Left Leg (with print zone)
        const leftLegGeo = new THREE.CylinderGeometry(0.55, 0.38, 2.8, 32);
        const leftLegMesh = new THREE.Mesh(leftLegGeo, printMat);
        leftLegMesh.position.set(-0.55, -0.1, 0);
        leftLegMesh.rotation.z = -0.06;
        leftLegMesh.castShadow = true;
        group.add(leftLegMesh);

        // Right Leg
        const rightLegGeo = new THREE.CylinderGeometry(0.55, 0.38, 2.8, 32);
        const rightLegMesh = new THREE.Mesh(rightLegGeo, pantsMat);
        rightLegMesh.position.set(0.55, -0.1, 0);
        rightLegMesh.rotation.z = 0.06;
        rightLegMesh.castShadow = true;
        group.add(rightLegMesh);

        // Ankle Cuffs
        const cuffGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.25, 24);
        const leftCuff = new THREE.Mesh(cuffGeo, pantsMat);
        leftCuff.position.set(-0.64, -1.5, 0);
        const rightCuff = new THREE.Mesh(cuffGeo, pantsMat);
        rightCuff.position.set(0.64, -1.5, 0);
        group.add(leftCuff, rightCuff);
        break;
      }

      default:
        break;
    }

    return group;
  }, []);

  // Update base color on all materials
  const updateMaterialsColor = useCallback((hexColor: string) => {
    const col = new THREE.Color(hexColor);
    materialsRef.current.forEach(({ base, printZone }) => {
      base.color.copy(col);
      if (printZone) {
        printZone.color.copy(col);
        printZone.needsUpdate = true;
      }
    });
    renderFrame();
  }, [renderFrame]);

  // Initialize Three.js scene & WebGLRenderer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(3.4, 2.2, 3.8);
    cameraRef.current = camera;

    // Renderer
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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xe8f0fe, 0.6);
    fillLight.position.set(-5, 2, -4);
    scene.add(fillLight);

    // Rim / Backlight
    const rimLight = new THREE.DirectionalLight(0xfff3d6, 0.5);
    rimLight.position.set(0, 5, -6);
    scene.add(rimLight);

    // Soft Studio Ground Shadow Plane
    const groundGeo = new THREE.PlaneGeometry(12, 12);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -1.9;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.0;
    controls.maxDistance = 10.0;
    controls.maxPolarAngle = Math.PI / 1.75;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    controls.addEventListener('start', () => { isInteractingRef.current = true; });
    controls.addEventListener('end', () => { isInteractingRef.current = false; });
    controls.addEventListener('change', renderFrame);

    // Animation Loop (Runs only when damping/auto-rotate or user dragging)
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        if (autoRotate) {
          controlsRef.current.autoRotate = true;
          controlsRef.current.autoRotateSpeed = 2.0;
          controlsRef.current.update();
          renderFrame();
        } else if (isInteractingRef.current || (controlsRef.current as any).state !== -1) {
          controlsRef.current.update();
          renderFrame();
        }
      }
    };
    animate();

    // Resize observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      renderFrame();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    renderFrame();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [renderFrame, autoRotate]);

  // Update canvas dynamic texture
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
      // Canvas error fallback
    }

    materialsRef.current.forEach(({ printZone }) => {
      if (printZone && canvasTextureRef.current) {
        printZone.map = canvasTextureRef.current;
        printZone.needsUpdate = true;
      }
    });

    renderFrame();
  }, [canvasSource, textureVersion, renderFrame]);

  // Re-build 3D Mesh when product changes
  useEffect(() => {
    if (!sceneRef.current) return;

    if (productGroupRef.current) {
      sceneRef.current.remove(productGroupRef.current);
      productGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
        }
      });
    }

    const group = buildProductMesh(producto, productColor, canvasTextureRef.current);
    productGroupRef.current = group;
    sceneRef.current.add(group);

    renderFrame();
  }, [producto, buildProductMesh, renderFrame]);

  // Update color
  useEffect(() => {
    updateMaterialsColor(productColor);
  }, [productColor, updateMaterialsColor]);

  // Quick camera adjustments
  const handleZoom = (inOut: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const factor = inOut === 'in' ? 0.85 : 1.15;
    cameraRef.current.position.multiplyScalar(factor);
    renderFrame();
  };

  return (
    <div className={`position-relative w-100 h-100 d-flex flex-column ${className}`} style={{ minHeight: '440px' }}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-100 flex-grow-1 rounded"
        style={{ touchAction: 'none', cursor: 'grab', minHeight: '400px' }}
      />

      {/* Floating 3D Navigation Controls Bar */}
      <div className="position-absolute top-0 start-0 m-3 d-flex flex-wrap gap-1 align-items-center bg-card bg-opacity-75 backdrop-blur p-1 rounded-3 border border-border shadow-sm z-3">
        <button
          type="button"
          onClick={() => setCameraView('front')}
          className={`btn btn-sm py-1 px-2 font-montserrat fw-semibold ${activePreset === 'front' ? 'btn-primary' : 'text-muted bg-transparent border-0'}`}
          style={{ fontSize: '0.7rem' }}
        >
          Frente
        </button>
        <button
          type="button"
          onClick={() => setCameraView('back')}
          className={`btn btn-sm py-1 px-2 font-montserrat fw-semibold ${activePreset === 'back' ? 'btn-primary' : 'text-muted bg-transparent border-0'}`}
          style={{ fontSize: '0.7rem' }}
        >
          Espalda
        </button>
        <button
          type="button"
          onClick={() => setCameraView('side')}
          className={`btn btn-sm py-1 px-2 font-montserrat fw-semibold ${activePreset === 'side' ? 'btn-primary' : 'text-muted bg-transparent border-0'}`}
          style={{ fontSize: '0.7rem' }}
        >
          Lateral
        </button>
        <button
          type="button"
          onClick={() => setCameraView('iso')}
          className={`btn btn-sm py-1 px-2 font-montserrat fw-semibold ${activePreset === 'iso' ? 'btn-primary' : 'text-muted bg-transparent border-0'}`}
          style={{ fontSize: '0.7rem' }}
        >
          3D
        </button>
      </div>

      {/* Right Controls: Auto-Rotate, Reset & Zoom */}
      <div className="position-absolute top-0 end-0 m-3 d-flex flex-column gap-1 bg-card bg-opacity-75 backdrop-blur p-1 rounded-3 border border-border shadow-sm z-3">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Detener rotación' : 'Rotar 360° automático'}
          className={`btn btn-sm p-1 d-flex align-items-center justify-content-center ${autoRotate ? 'btn-primary' : 'text-muted bg-transparent border-0'}`}
          style={{ width: '28px', height: '28px' }}
        >
          <RotateCw size={14} className={autoRotate ? 'spin-anim' : ''} />
        </button>
        <button
          type="button"
          onClick={resetCamera}
          title="Restablecer vista"
          className="btn btn-sm p-1 text-muted bg-transparent border-0 d-flex align-items-center justify-content-center"
          style={{ width: '28px', height: '28px' }}
        >
          <RefreshCw size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleZoom('in')}
          title="Acercar"
          className="btn btn-sm p-1 text-muted bg-transparent border-0 d-flex align-items-center justify-content-center"
          style={{ width: '28px', height: '28px' }}
        >
          <ZoomIn size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleZoom('out')}
          title="Alejar"
          className="btn btn-sm p-1 text-muted bg-transparent border-0 d-flex align-items-center justify-content-center"
          style={{ width: '28px', height: '28px' }}
        >
          <ZoomOut size={14} />
        </button>
      </div>

      {/* 360 Drag Indicator Badge at bottom */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 pointer-events-none z-2">
        <span className="badge bg-elevated text-muted border border-border font-montserrat fw-normal px-3 py-1 d-inline-flex align-items-center gap-1 shadow-sm" style={{ fontSize: '0.72rem', opacity: 0.9 }}>
          <Compass size={13} className="text-primary" />
          Arrastra con el mouse o dedo para rotar 360°
        </span>
      </div>
    </div>
  );
});

Viewer3D.displayName = 'Viewer3D';
