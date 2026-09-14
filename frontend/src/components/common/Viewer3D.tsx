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
  const [autoRotate, setAutoRotate] = useState(false);
  const [activePreset, setActivePreset] = useState<'front' | 'back' | 'side' | 'iso'>('iso');

  // Direct render call
  const renderFrame = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  // Set camera view angles with smooth transition
  const setCameraView = useCallback((view: 'front' | 'back' | 'side' | 'iso') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActivePreset(view);
    const dist = 5.0;

    switch (view) {
      case 'front':
        cameraRef.current.position.set(0, 0.2, dist);
        break;
      case 'back':
        cameraRef.current.position.set(0, 0.2, -dist);
        break;
      case 'side':
        cameraRef.current.position.set(dist, 0.2, 0);
        break;
      case 'iso':
      default:
        cameraRef.current.position.set(3.2, 2.0, 3.6);
        break;
    }
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, []);

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

  // Build smooth, organic 3D models per product
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
        // High-gloss Ceramic Mug
        const ceramicMat = createMaterial(0.12, 0.04, 0.5);
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
        const outerGeo = new THREE.CylinderGeometry(1.2, 1.15, 2.6, 64, 32, true);
        outerGeo.computeVertexNormals();
        const outerMesh = new THREE.Mesh(outerGeo, printMat);
        outerMesh.castShadow = true;
        outerMesh.receiveShadow = true;
        group.add(outerMesh);

        // Inner cylinder (white ceramic)
        const innerMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#FFFFFF'),
          roughness: 0.12,
          metalness: 0.02,
        });
        const innerGeo = new THREE.CylinderGeometry(1.1, 1.05, 2.55, 64, 16, true);
        innerGeo.computeVertexNormals();
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        innerMesh.position.y = 0.03;
        group.add(innerMesh);

        // Smooth rounded Rim / Lip
        const rimGeo = new THREE.TorusGeometry(1.15, 0.055, 24, 64);
        const rimMesh = new THREE.Mesh(rimGeo, ceramicMat);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = 1.3;
        group.add(rimMesh);

        // Smooth Bottom Base
        const baseGeo = new THREE.CylinderGeometry(1.15, 1.08, 0.12, 64);
        baseGeo.computeVertexNormals();
        const baseMesh = new THREE.Mesh(baseGeo, ceramicMat);
        baseMesh.position.y = -1.3;
        group.add(baseMesh);

        // Smooth Ergonomic Handle
        const handleCurve = new THREE.CurvePath<THREE.Vector3>();
        const p0 = new THREE.Vector3(-1.18, 0.85, 0);
        const p1 = new THREE.Vector3(-2.2, 0.7, 0);
        const p2 = new THREE.Vector3(-2.2, -0.7, 0);
        const p3 = new THREE.Vector3(-1.14, -0.85, 0);
        const bezier = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
        handleCurve.add(bezier);
        const handleGeo = new THREE.TubeGeometry(handleCurve, 64, 0.17, 24, false);
        handleGeo.computeVertexNormals();
        const handleMesh = new THREE.Mesh(handleGeo, ceramicMat);
        handleMesh.castShadow = true;
        group.add(handleMesh);
        break;
      }

      case 'termo': {
        // Metallic Brushed Stainless Steel Insulated Tumbler / Bottle
        const steelBodyMat = createMaterial(0.24, 0.75, 0.3);
        const printMat = steelBodyMat.clone();
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: steelBodyMat, printZone: printMat });

        // Main contoured cylinder body
        const bodyGeo = new THREE.CylinderGeometry(1.05, 0.98, 3.3, 64, 32);
        bodyGeo.computeVertexNormals();
        const bodyMesh = new THREE.Mesh(bodyGeo, printMat);
        bodyMesh.castShadow = true;
        group.add(bodyMesh);

        // Tapered rounded shoulder
        const shoulderGeo = new THREE.CylinderGeometry(0.78, 1.05, 0.5, 64, 16);
        shoulderGeo.computeVertexNormals();
        const shoulderMesh = new THREE.Mesh(shoulderGeo, steelBodyMat);
        shoulderMesh.position.y = 1.9;
        group.add(shoulderMesh);

        // Neck ring
        const neckGeo = new THREE.CylinderGeometry(0.68, 0.78, 0.3, 64);
        const neckMesh = new THREE.Mesh(neckGeo, steelBodyMat);
        neckMesh.position.y = 2.3;
        group.add(neckMesh);

        // Cap / Lid (Matte finish)
        const capMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#2A2A2A'), roughness: 0.35, metalness: 0.7 });
        const capGeo = new THREE.CylinderGeometry(0.74, 0.74, 0.75, 64, 16);
        capGeo.computeVertexNormals();
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.y = 2.75;
        group.add(capMesh);

        // Golden Accent Ring
        const ringMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#D4AF37'), roughness: 0.15, metalness: 0.95 });
        const ringGeo = new THREE.TorusGeometry(0.75, 0.04, 16, 64);
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 2.7;
        group.add(ringMesh);
        break;
      }

      case 'vaso': {
        // Tapered Tumbler / Glass
        const glassMat = createMaterial(0.18, 0.2, 0.6);
        const printMat = glassMat.clone();
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: glassMat, printZone: printMat });

        const vasoGeo = new THREE.CylinderGeometry(1.22, 0.9, 3.0, 64, 32, false);
        vasoGeo.computeVertexNormals();
        const vasoMesh = new THREE.Mesh(vasoGeo, printMat);
        vasoMesh.castShadow = true;
        group.add(vasoMesh);

        // Smooth rounded rim ring
        const rimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#D4AF37'), roughness: 0.2, metalness: 0.9 });
        const rimGeo = new THREE.TorusGeometry(1.22, 0.04, 16, 64);
        const rimMesh = new THREE.Mesh(rimGeo, rimMat);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = 1.5;
        group.add(rimMesh);
        break;
      }

      case 'polera': {
        // Smooth Organic Cotton T-Shirt 3D
        const fabricMat = createMaterial(0.82, 0.0, 0.0);
        const printMat = fabricMat.clone();
        if (texture) {
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: fabricMat, printZone: printMat });

        // Torso: Smooth curved tubular body with organic tapering and chest curvature
        const torsoGeo = new THREE.CylinderGeometry(1.3, 1.2, 2.5, 64, 32, false);
        // Scale to realistic chest depth
        torsoGeo.scale(1.15, 1.0, 0.62);

        // Deform vertices for natural body shape
        const pos = torsoGeo.attributes.position;
        const uvs = torsoGeo.attributes.uv;

        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);

          // Subtle shoulder dip and chest curve
          if (y > 0.8) {
            const shoulderFactor = 1.0 - (Math.abs(x) / 1.5) * 0.15;
            pos.setY(i, y * shoulderFactor);
          }

          // Custom UV mapping for front chest print zone
          if (z > 0.1) {
            const u = THREE.MathUtils.clamp((x + 1.25) / 2.5, 0, 1);
            const v = THREE.MathUtils.clamp((y + 1.25) / 2.5, 0, 1);
            uvs.setXY(i, u, v);
          }
        }
        torsoGeo.computeVertexNormals();
        uvs.needsUpdate = true;
        pos.needsUpdate = true;

        const torsoMesh = new THREE.Mesh(torsoGeo, printMat);
        torsoMesh.castShadow = true;
        torsoMesh.receiveShadow = true;
        group.add(torsoMesh);

        // Left Sleeve (Smooth angled cylinder)
        const sleeveGeo = new THREE.CylinderGeometry(0.44, 0.38, 1.1, 48, 16);
        sleeveGeo.computeVertexNormals();
        const leftSleeve = new THREE.Mesh(sleeveGeo, fabricMat);
        leftSleeve.position.set(-1.42, 0.72, 0);
        leftSleeve.rotation.set(0.1, 0, 0.58);
        leftSleeve.castShadow = true;
        group.add(leftSleeve);

        // Right Sleeve
        const rightSleeve = new THREE.Mesh(sleeveGeo, fabricMat);
        rightSleeve.position.set(1.42, 0.72, 0);
        rightSleeve.rotation.set(0.1, 0, -0.58);
        rightSleeve.castShadow = true;
        group.add(rightSleeve);

        // Collar Ribbing (Smooth rounded ring)
        const collarGeo = new THREE.TorusGeometry(0.52, 0.08, 24, 64);
        collarGeo.scale(1.1, 0.45, 0.75);
        collarGeo.computeVertexNormals();
        const collarMesh = new THREE.Mesh(collarGeo, fabricMat);
        collarMesh.rotation.x = Math.PI / 2;
        collarMesh.position.set(0, 1.26, 0);
        group.add(collarMesh);
        break;
      }

      case 'gorra': {
        // Smooth 6-Panel Baseball Cap / Jockey
        const capFabricMat = createMaterial(0.78, 0.02, 0.0);
        const printMat = capFabricMat.clone();
        if (texture) {
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: capFabricMat, printZone: printMat });

        // Crown / Dome (Smooth dome)
        const crownGeo = new THREE.SphereGeometry(1.4, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
        crownGeo.scale(1.0, 0.76, 1.15);
        crownGeo.computeVertexNormals();

        // Custom UV for front cap panel
        const uvs = crownGeo.attributes.uv;
        const pos = crownGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);
          if (z > 0.3) {
            const u = THREE.MathUtils.clamp((x + 1.2) / 2.4, 0, 1);
            const v = THREE.MathUtils.clamp(y / 1.2, 0, 1);
            uvs.setXY(i, u, v);
          }
        }
        uvs.needsUpdate = true;

        const crownMesh = new THREE.Mesh(crownGeo, printMat);
        crownMesh.position.set(0, 0.2, 0);
        crownMesh.castShadow = true;
        group.add(crownMesh);

        // Visor / Brim (Smooth curved bill)
        const brimShape = new THREE.Shape();
        brimShape.moveTo(-1.25, 0);
        brimShape.quadraticCurveTo(0, 1.9, 1.25, 0);
        brimShape.quadraticCurveTo(0, 0.45, -1.25, 0);
        const brimExtrude = {
          depth: 0.08,
          bevelEnabled: true,
          bevelSegments: 8,
          bevelSize: 0.05,
          bevelThickness: 0.05,
        };
        const brimGeo = new THREE.ExtrudeGeometry(brimShape, brimExtrude);
        brimGeo.center();
        brimGeo.computeVertexNormals();
        const brimMesh = new THREE.Mesh(brimGeo, capFabricMat);
        brimMesh.rotation.x = Math.PI / 2.3;
        brimMesh.position.set(0, 0.15, 1.6);
        brimMesh.castShadow = true;
        group.add(brimMesh);

        // Top button
        const buttonGeo = new THREE.SphereGeometry(0.12, 24, 24);
        buttonGeo.scale(1, 0.6, 1);
        buttonGeo.computeVertexNormals();
        const buttonMesh = new THREE.Mesh(buttonGeo, capFabricMat);
        buttonMesh.position.set(0, 1.26, 0);
        group.add(buttonMesh);
        break;
      }

      case 'pantalon': {
        // Smooth Pants / Joggers
        const pantsMat = createMaterial(0.85, 0.0, 0.0);
        const printMat = pantsMat.clone();
        if (texture) {
          printMat.map = texture;
          printMat.needsUpdate = true;
        }
        materialsRef.current.push({ base: pantsMat, printZone: printMat });

        // Waistband
        const waistGeo = new THREE.CylinderGeometry(1.18, 1.12, 0.7, 48, 16);
        waistGeo.scale(1.1, 1.0, 0.7);
        waistGeo.computeVertexNormals();
        const waistMesh = new THREE.Mesh(waistGeo, pantsMat);
        waistMesh.position.y = 1.6;
        group.add(waistMesh);

        // Left Leg (with smooth tapering and print zone)
        const leftLegGeo = new THREE.CylinderGeometry(0.56, 0.36, 2.9, 48, 32);
        leftLegGeo.computeVertexNormals();
        const leftLegMesh = new THREE.Mesh(leftLegGeo, printMat);
        leftLegMesh.position.set(-0.58, -0.15, 0);
        leftLegMesh.rotation.z = -0.06;
        leftLegMesh.castShadow = true;
        group.add(leftLegMesh);

        // Right Leg
        const rightLegGeo = new THREE.CylinderGeometry(0.56, 0.36, 2.9, 48, 32);
        rightLegGeo.computeVertexNormals();
        const rightLegMesh = new THREE.Mesh(rightLegGeo, pantsMat);
        rightLegMesh.position.set(0.58, -0.15, 0);
        rightLegMesh.rotation.z = 0.06;
        rightLegMesh.castShadow = true;
        group.add(rightLegMesh);

        // Ankle Cuffs
        const cuffGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.25, 32);
        cuffGeo.computeVertexNormals();
        const leftCuff = new THREE.Mesh(cuffGeo, pantsMat);
        leftCuff.position.set(-0.67, -1.6, 0);
        const rightCuff = new THREE.Mesh(cuffGeo, pantsMat);
        rightCuff.position.set(0.67, -1.6, 0);
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
  }, []);

  // Initialize Three.js Scene, Camera, WebGLRenderer & OrbitControls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3.2, 2.0, 3.6);
    cameraRef.current = camera;

    // WebGLRenderer with high-precision antialiasing & shadow map
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xe8f0fe, 0.7);
    fillLight.position.set(-6, 3, -4);
    scene.add(fillLight);

    // Rim Light
    const rimLight = new THREE.DirectionalLight(0xfff5e6, 0.6);
    rimLight.position.set(0, 6, -7);
    scene.add(rimLight);

    // Soft Studio Ground Shadow
    const groundGeo = new THREE.PlaneGeometry(14, 14);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -1.9;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // OrbitControls attached directly to renderer canvas
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.0;
    controls.maxDistance = 9.0;
    controls.maxPolarAngle = Math.PI / 1.75;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Continuous 60 FPS Render Loop for smooth interaction and auto-rotation
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

    // Resize observer
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
      // Texture update fallback
    }

    materialsRef.current.forEach(({ printZone }) => {
      if (printZone && canvasTextureRef.current) {
        printZone.map = canvasTextureRef.current;
        printZone.needsUpdate = true;
      }
    });
  }, [canvasSource, textureVersion]);

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
  }, [producto, buildProductMesh]);

  // Update color
  useEffect(() => {
    updateMaterialsColor(productColor);
  }, [productColor, updateMaterialsColor]);

  // Zoom buttons
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
