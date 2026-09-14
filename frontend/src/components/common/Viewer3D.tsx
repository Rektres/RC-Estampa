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
  subTipo?: string;
  productColor: string;
  canvasSource?: HTMLCanvasElement | null;
  textureVersion?: number;
  className?: string;
}

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
        cameraRef.current.position.set(0, 0.15, dist);
        break;
      case 'back':
        cameraRef.current.position.set(0, 0.15, -dist);
        break;
      case 'side':
        cameraRef.current.position.set(dist, 0.15, 0);
        break;
      case 'iso':
      default:
        cameraRef.current.position.set(3.2, 1.8, 3.6);
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

  // Build ultra-realistic and distinctive 3D models
  const buildProductMesh = useCallback((type: string, sub: string, color: string, texture: THREE.Texture | null) => {
    const group = new THREE.Group();
    baseMaterialsRef.current = [];
    printMaterialsRef.current = [];

    // Helper for PBR base material
    const createBaseMaterial = (roughness = 0.85, metalness = 0.05, clearcoat = 0.0) => {
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
      baseMaterialsRef.current.push(mat);
      return mat;
    };

    // Helper for Decal Print Material (Pure white diffuse so graphic colors are 100% faithful)
    const createPrintMaterial = (roughness = 0.85, metalness = 0.0) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture || null,
        transparent: true,
        alphaTest: 0.01,
        roughness,
        metalness,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
        side: THREE.FrontSide,
      });
      printMaterialsRef.current.push(mat);
      return mat;
    };

    switch (type) {
      /* ==========================================================
         1. POLERAS & ROPA (Cuello Redondo, Polo Piqué, Cuello V, Polerón)
      ========================================================== */
      case 'polera': {
        const isPolo = sub === 'polo';
        const isVNeck = sub === 'cuello-v';
        const isPoleron = sub === 'poleron';

        const fabricMat = createBaseMaterial(isPolo ? 0.92 : 0.82, 0.0, 0.0);
        const printMat = createPrintMaterial(0.8, 0.0);

        const widthScale = isPoleron ? 1.3 : isPolo ? 1.18 : 1.15;
        const depthScale = isPoleron ? 0.75 : 0.62;

        // Torso body
        const torsoGeo = new THREE.CylinderGeometry(1.3, 1.2, 2.5, 64, 32, false);
        torsoGeo.scale(widthScale, 1.0, depthScale);

        const pos = torsoGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          if (y > 0.8) {
            const shoulderFactor = 1.0 - (Math.abs(x) / 1.5) * 0.15;
            pos.setY(i, y * shoulderFactor);
          }
        }
        torsoGeo.computeVertexNormals();
        group.add(new THREE.Mesh(torsoGeo, fabricMat));

        // Decal Print Zone on front chest
        const printGeo = new THREE.PlaneGeometry(2.4, 2.2, 32, 32);
        const printPos = printGeo.attributes.position;
        const printUvs = printGeo.attributes.uv;
        for (let i = 0; i < printPos.count; i++) {
          const x = printPos.getX(i);
          const y = printPos.getY(i);
          const zCurve = (isPoleron ? 0.92 : 0.77) - (x * x) * 0.09;
          printPos.setZ(i, zCurve);
          printUvs.setXY(i, THREE.MathUtils.clamp((x + 1.2) / 2.4, 0, 1), THREE.MathUtils.clamp((y + 1.1) / 2.2, 0, 1));
        }
        printGeo.computeVertexNormals();
        printUvs.needsUpdate = true;
        const printMesh = new THREE.Mesh(printGeo, printMat);
        printMesh.position.set(0, -0.05, 0);
        group.add(printMesh);

        // Sleeves
        const sleeveRadius = isPoleron ? 0.52 : isPolo ? 0.46 : 0.44;
        const sleeveLength = isPoleron ? 1.45 : isPolo ? 0.95 : 1.1;
        const sleeveGeo = new THREE.CylinderGeometry(sleeveRadius, sleeveRadius * 0.85, sleeveLength, 48, 16);
        sleeveGeo.computeVertexNormals();

        const leftSleeve = new THREE.Mesh(sleeveGeo, fabricMat);
        leftSleeve.position.set(-1.48, 0.7, 0);
        leftSleeve.rotation.set(0.1, 0, isPoleron ? 0.65 : 0.58);
        group.add(leftSleeve);

        const rightSleeve = new THREE.Mesh(sleeveGeo, fabricMat);
        rightSleeve.position.set(1.48, 0.7, 0);
        rightSleeve.rotation.set(0.1, 0, isPoleron ? -0.65 : -0.58);
        group.add(rightSleeve);

        // Distinct Sub-Type Details
        if (isPolo) {
          // --- POLO PIQUÉ ---
          // 1. Cuello camisero doblado (Left & Right Collar Wings)
          const leftCollarShape = new THREE.Shape();
          leftCollarShape.moveTo(0, 0);
          leftCollarShape.lineTo(-0.95, -0.6);
          leftCollarShape.lineTo(-0.7, 0.35);
          leftCollarShape.lineTo(0, 0.2);
          leftCollarShape.closePath();
          const leftWingGeo = new THREE.ExtrudeGeometry(leftCollarShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
          leftWingGeo.computeVertexNormals();
          const leftWing = new THREE.Mesh(leftWingGeo, fabricMat);
          leftWing.rotation.x = -Math.PI / 3.2;
          leftWing.position.set(-0.02, 1.25, 0.45);
          group.add(leftWing);

          const rightCollarShape = new THREE.Shape();
          rightCollarShape.moveTo(0, 0);
          rightCollarShape.lineTo(0.95, -0.6);
          rightCollarShape.lineTo(0.7, 0.35);
          rightCollarShape.lineTo(0, 0.2);
          rightCollarShape.closePath();
          const rightWingGeo = new THREE.ExtrudeGeometry(rightCollarShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
          rightWingGeo.computeVertexNormals();
          const rightWing = new THREE.Mesh(rightWingGeo, fabricMat);
          rightWing.rotation.x = -Math.PI / 3.2;
          rightWing.position.set(0.02, 1.25, 0.45);
          group.add(rightWing);

          // 2. Solapa de botones (Placket)
          const placketGeo = new THREE.BoxGeometry(0.32, 0.95, 0.08);
          placketGeo.computeVertexNormals();
          const placketMesh = new THREE.Mesh(placketGeo, fabricMat);
          placketMesh.position.set(0, 0.78, 0.78);
          group.add(placketMesh);

          // 3. Botones nácar con relieve
          const buttonMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#FAFAFA'), roughness: 0.15, metalness: 0.4 });
          const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), buttonMat);
          b1.rotation.x = Math.PI / 2;
          b1.position.set(0, 1.1, 0.83);
          const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), buttonMat);
          b2.rotation.x = Math.PI / 2;
          b2.position.set(0, 0.85, 0.83);
          const b3 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), buttonMat);
          b3.rotation.x = Math.PI / 2;
          b3.position.set(0, 0.6, 0.83);
          group.add(b1, b2, b3);

          // 4. Ribetes en puños de mangas
          const cuffGeo = new THREE.TorusGeometry(0.39, 0.04, 16, 32);
          const leftCuff = new THREE.Mesh(cuffGeo, fabricMat);
          leftCuff.position.set(-1.85, 0.35, 0);
          leftCuff.rotation.z = 0.58;
          const rightCuff = new THREE.Mesh(cuffGeo, fabricMat);
          rightCuff.position.set(1.85, 0.35, 0);
          rightCuff.rotation.z = -0.58;
          group.add(leftCuff, rightCuff);

        } else if (isPoleron) {
          // --- POLERÓN / HOODIE ---
          // 1. Capucha 3D en la espalda y cuello
          const hoodGeo = new THREE.SphereGeometry(1.05, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.68);
          hoodGeo.scale(1.0, 1.15, 1.0);
          hoodGeo.computeVertexNormals();
          const hoodMesh = new THREE.Mesh(hoodGeo, fabricMat);
          hoodMesh.position.set(0, 1.45, -0.35);
          group.add(hoodMesh);

          // 2. Cordones de capucha blancos colgando al frente
          const cordMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#FFFFFF'), roughness: 0.5 });
          const leftCord = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 16), cordMat);
          leftCord.position.set(-0.2, 0.9, 0.82);
          leftCord.rotation.z = 0.05;
          const rightCord = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 16), cordMat);
          rightCord.position.set(0.2, 0.9, 0.82);
          rightCord.rotation.z = -0.05;
          group.add(leftCord, rightCord);

          // 3. Bolsillo Canguro frontal prominente
          const pocketShape = new THREE.Shape();
          pocketShape.moveTo(-1.0, -0.65);
          pocketShape.lineTo(-0.75, 0.35);
          pocketShape.lineTo(0.75, 0.35);
          pocketShape.lineTo(1.0, -0.65);
          pocketShape.closePath();
          const pocketGeo = new THREE.ExtrudeGeometry(pocketShape, { depth: 0.16, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
          pocketGeo.computeVertexNormals();
          const pocketMesh = new THREE.Mesh(pocketGeo, fabricMat);
          pocketMesh.position.set(0, -0.45, 0.82);
          group.add(pocketMesh);

          // 4. Pretina acanalada gruesa inferior
          const hemGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.35, 64);
          hemGeo.scale(1.28, 1.0, 0.76);
          hemGeo.computeVertexNormals();
          const hemMesh = new THREE.Mesh(hemGeo, fabricMat);
          hemMesh.position.y = -1.35;
          group.add(hemMesh);

        } else if (isVNeck) {
          // --- CUELLO V ---
          const vCollarCurve = new THREE.CurvePath<THREE.Vector3>();
          vCollarCurve.add(new THREE.LineCurve3(new THREE.Vector3(-0.6, 1.25, 0.35), new THREE.Vector3(0, 0.62, 0.76)));
          vCollarCurve.add(new THREE.LineCurve3(new THREE.Vector3(0, 0.62, 0.76), new THREE.Vector3(0.6, 1.25, 0.35)));
          const vCollarGeo = new THREE.TubeGeometry(vCollarCurve, 32, 0.08, 16, false);
          vCollarGeo.computeVertexNormals();
          group.add(new THREE.Mesh(vCollarGeo, fabricMat));

        } else {
          // --- CUELLO REDONDO CLÁSICO ---
          const collarGeo = new THREE.TorusGeometry(0.52, 0.08, 24, 64);
          collarGeo.scale(1.1, 0.45, 0.75);
          collarGeo.computeVertexNormals();
          const collarMesh = new THREE.Mesh(collarGeo, fabricMat);
          collarMesh.rotation.x = Math.PI / 2;
          collarMesh.position.set(0, 1.26, 0);
          group.add(collarMesh);
        }
        break;
      }

      /* ==========================================================
         2. PANTALÓN / JOGGER (Conectado, orgánico, con pretina y cordones)
      ========================================================== */
      case 'pantalon': {
        const pantsMat = createBaseMaterial(0.85, 0.0, 0.0);
        const printMat = createPrintMaterial(0.8, 0.0);

        // 1. Pelvis / Cadera Unificada (Single connected pelvic torso)
        const pelvisGeo = new THREE.CylinderGeometry(1.22, 1.32, 1.3, 48, 16);
        pelvisGeo.scale(1.15, 1.0, 0.72);
        pelvisGeo.computeVertexNormals();
        const pelvisMesh = new THREE.Mesh(pelvisGeo, pantsMat);
        pelvisMesh.position.y = 0.95;
        group.add(pelvisMesh);

        // 2. Pretina elástica superior con relieve
        const waistGeo = new THREE.TorusGeometry(1.25, 0.12, 16, 48);
        waistGeo.scale(1.12, 0.6, 0.7);
        waistGeo.computeVertexNormals();
        const waistMesh = new THREE.Mesh(waistGeo, pantsMat);
        waistMesh.rotation.x = Math.PI / 2;
        waistMesh.position.y = 1.6;
        group.add(waistMesh);

        // 3. Cordones de ajuste frontales
        const cordMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#FFFFFF'), roughness: 0.5 });
        const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 12), cordMat);
        c1.position.set(-0.12, 1.25, 0.85);
        c1.rotation.z = 0.1;
        const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 12), cordMat);
        c2.position.set(0.12, 1.25, 0.85);
        c2.rotation.z = -0.1;
        group.add(c1, c2);

        // 4. Pierna Izquierda (Tapered leg connecting seamlessly to pelvis)
        const legGeo = new THREE.CylinderGeometry(0.62, 0.38, 2.5, 48, 32);
        legGeo.computeVertexNormals();

        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.set(-0.62, -0.65, 0);
        leftLeg.rotation.z = -0.05;
        group.add(leftLeg);

        // Pierna Derecha
        const rightLeg = new THREE.Mesh(legGeo, pantsMat);
        rightLeg.position.set(0.62, -0.65, 0);
        rightLeg.rotation.z = 0.05;
        group.add(rightLeg);

        // 5. Decal Overlay en Muslo Izquierdo
        const thighPrintGeo = new THREE.PlaneGeometry(0.8, 1.4, 24, 24);
        const tPos = thighPrintGeo.attributes.position;
        const tUvs = thighPrintGeo.attributes.uv;
        for (let i = 0; i < tPos.count; i++) {
          const x = tPos.getX(i);
          const y = tPos.getY(i);
          tPos.setZ(i, 0.62 - (x * x) * 0.15);
          tUvs.setXY(i, THREE.MathUtils.clamp((x + 0.4) / 0.8, 0, 1), THREE.MathUtils.clamp((y + 0.7) / 1.4, 0, 1));
        }
        thighPrintGeo.computeVertexNormals();
        tUvs.needsUpdate = true;
        const thighMesh = new THREE.Mesh(thighPrintGeo, printMat);
        thighMesh.position.set(-0.62, -0.3, 0.08);
        thighMesh.rotation.z = -0.05;
        group.add(thighMesh);

        // 6. Puños elásticos en los tobillos
        const cuffGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
        cuffGeo.computeVertexNormals();
        const leftCuff = new THREE.Mesh(cuffGeo, pantsMat);
        leftCuff.position.set(-0.72, -1.95, 0);
        const rightCuff = new THREE.Mesh(cuffGeo, pantsMat);
        rightCuff.position.set(0.72, -1.95, 0);
        group.add(leftCuff, rightCuff);
        break;
      }

      /* ==========================================================
         3. VASOS & DRINKWARE (Clásico, Shopero Cervecero, Jarra, Vaso Térmico)
      ========================================================== */
      case 'vaso': {
        const isShopero = sub === 'shopero';
        const isJarra = sub === 'jarra';
        const isTermico = sub === 'termico';

        const glassMat = createBaseMaterial(isTermico ? 0.25 : 0.12, isTermico ? 0.6 : 0.08, 0.5);
        const printMat = createPrintMaterial(0.2, 0.0);
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
        }

        if (isShopero) {
          // --- SHOPERO CERVECERO ---
          const bodyGeo = new THREE.CylinderGeometry(1.32, 1.25, 3.2, 64, 32, true);
          bodyGeo.computeVertexNormals();
          group.add(new THREE.Mesh(bodyGeo, glassMat));

          const printGeo = new THREE.CylinderGeometry(1.325, 1.255, 3.2, 64, 32, true);
          printGeo.computeVertexNormals();
          group.add(new THREE.Mesh(printGeo, printMat));

          // Base gruesa facetada
          const baseGeo = new THREE.CylinderGeometry(1.38, 1.45, 0.45, 48);
          baseGeo.computeVertexNormals();
          const baseMesh = new THREE.Mesh(baseGeo, glassMat);
          baseMesh.position.y = -1.6;
          group.add(baseMesh);

          // Asa gruesa de shopero
          const handleCurve = new THREE.CurvePath<THREE.Vector3>();
          handleCurve.add(new THREE.CubicBezierCurve3(
            new THREE.Vector3(-1.3, 1.1, 0),
            new THREE.Vector3(-2.45, 0.95, 0),
            new THREE.Vector3(-2.45, -0.95, 0),
            new THREE.Vector3(-1.3, -1.1, 0)
          ));
          const handleGeo = new THREE.TubeGeometry(handleCurve, 48, 0.25, 24, false);
          handleGeo.computeVertexNormals();
          group.add(new THREE.Mesh(handleGeo, glassMat));

          // Rim superior
          const rimGeo = new THREE.TorusGeometry(1.32, 0.05, 16, 64);
          const rimMesh = new THREE.Mesh(rimGeo, glassMat);
          rimMesh.rotation.x = Math.PI / 2;
          rimMesh.position.y = 1.6;
          group.add(rimMesh);

        } else if (isJarra) {
          // --- JARRA CON PICO ---
          const bodyGeo = new THREE.CylinderGeometry(1.05, 1.48, 3.2, 64, 32, true);
          bodyGeo.computeVertexNormals();
          group.add(new THREE.Mesh(bodyGeo, glassMat));

          const printGeo = new THREE.CylinderGeometry(1.055, 1.485, 3.2, 64, 32, true);
          printGeo.computeVertexNormals();
          group.add(new THREE.Mesh(printGeo, printMat));

          // Base
          const baseGeo = new THREE.CylinderGeometry(1.48, 1.48, 0.18, 64);
          const baseMesh = new THREE.Mesh(baseGeo, glassMat);
          baseMesh.position.y = -1.6;
          group.add(baseMesh);

          // Pico vertedor frontal
          const spoutShape = new THREE.Shape();
          spoutShape.moveTo(-0.4, 0);
          spoutShape.lineTo(0, 0.65);
          spoutShape.lineTo(0.4, 0);
          spoutShape.closePath();
          const spoutGeo = new THREE.ExtrudeGeometry(spoutShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
          spoutGeo.computeVertexNormals();
          const spoutMesh = new THREE.Mesh(spoutGeo, glassMat);
          spoutMesh.rotation.x = -Math.PI / 3;
          spoutMesh.position.set(0, 1.6, 1.0);
          group.add(spoutMesh);

          // Asa vertical trasera
          const handleCurve = new THREE.CurvePath<THREE.Vector3>();
          handleCurve.add(new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 1.2, -1.1),
            new THREE.Vector3(0, 1.3, -2.4),
            new THREE.Vector3(0, -1.0, -2.4),
            new THREE.Vector3(0, -1.2, -1.48)
          ));
          const handleGeo = new THREE.TubeGeometry(handleCurve, 48, 0.2, 24, false);
          handleGeo.computeVertexNormals();
          group.add(new THREE.Mesh(handleGeo, glassMat));

        } else if (isTermico) {
          // --- VASO TÉRMICO ---
          const bodyGeo = new THREE.CylinderGeometry(1.2, 0.88, 3.0, 64, 32);
          bodyGeo.computeVertexNormals();
          group.add(new THREE.Mesh(bodyGeo, glassMat));

          const printGeo = new THREE.CylinderGeometry(1.205, 0.885, 3.0, 64, 32, true);
          printGeo.computeVertexNormals();
          group.add(new THREE.Mesh(printGeo, printMat));

          // Banda de silicona central
          const gripMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#2A2A2A'), roughness: 0.9 });
          const gripGeo = new THREE.CylinderGeometry(1.08, 1.0, 0.95, 64);
          const gripMesh = new THREE.Mesh(gripGeo, gripMat);
          gripMesh.position.y = 0.2;
          group.add(gripMesh);

          // Tapa de café con boquilla
          const lidMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#222222'), roughness: 0.3, metalness: 0.4 });
          const lidGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.45, 64);
          const lidMesh = new THREE.Mesh(lidGeo, lidMat);
          lidMesh.position.y = 1.65;
          group.add(lidMesh);

        } else {
          // --- VASO CLÁSICO ---
          const vasoGeo = new THREE.CylinderGeometry(1.22, 0.88, 3.0, 64, 32, false);
          vasoGeo.computeVertexNormals();
          group.add(new THREE.Mesh(vasoGeo, glassMat));

          const printGeo = new THREE.CylinderGeometry(1.225, 0.885, 3.0, 64, 32, true);
          printGeo.computeVertexNormals();
          group.add(new THREE.Mesh(printGeo, printMat));

          // Rim superior dorado
          const rimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#D4AF37'), roughness: 0.2, metalness: 0.9 });
          const rimGeo = new THREE.TorusGeometry(1.22, 0.04, 16, 64);
          const rimMesh = new THREE.Mesh(rimGeo, rimMat);
          rimMesh.rotation.x = Math.PI / 2;
          rimMesh.position.y = 1.5;
          group.add(rimMesh);
        }
        break;
      }

      /* ==========================================================
         4. TAZA CERÁMICA MUG
      ========================================================== */
      case 'taza': {
        const isConica = sub === 'conica';
        const ceramicMat = createBaseMaterial(0.12, 0.04, 0.5);
        const printMat = createPrintMaterial(0.15, 0.0);
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
        }

        const rTop = isConica ? 1.35 : 1.2;
        const rBottom = isConica ? 0.92 : 1.15;

        // Outer cylinder base
        const outerGeo = new THREE.CylinderGeometry(rTop, rBottom, 2.6, 64, 32, true);
        outerGeo.computeVertexNormals();
        group.add(new THREE.Mesh(outerGeo, ceramicMat));

        // Outer print wrap overlay
        const printGeo = new THREE.CylinderGeometry(rTop + 0.005, rBottom + 0.005, 2.6, 64, 32, true);
        printGeo.computeVertexNormals();
        group.add(new THREE.Mesh(printGeo, printMat));

        // Inner cylinder
        const innerMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#FFFFFF'), roughness: 0.12, metalness: 0.02 });
        const innerGeo = new THREE.CylinderGeometry(rTop - 0.1, rBottom - 0.1, 2.55, 64, 16, true);
        innerGeo.computeVertexNormals();
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        innerMesh.position.y = 0.03;
        group.add(innerMesh);

        // Rim
        const rimGeo = new THREE.TorusGeometry((rTop + (rTop - 0.1)) / 2, 0.05, 24, 64);
        const rimMesh = new THREE.Mesh(rimGeo, ceramicMat);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = 1.3;
        group.add(rimMesh);

        // Bottom
        const baseGeo = new THREE.CylinderGeometry(rBottom, rBottom * 0.95, 0.12, 64);
        baseGeo.computeVertexNormals();
        const baseMesh = new THREE.Mesh(baseGeo, ceramicMat);
        baseMesh.position.y = -1.3;
        group.add(baseMesh);

        // Handle
        const handleCurve = new THREE.CurvePath<THREE.Vector3>();
        handleCurve.add(new THREE.CubicBezierCurve3(
          new THREE.Vector3(-rTop + 0.02, 0.85, 0),
          new THREE.Vector3(-2.2, 0.7, 0),
          new THREE.Vector3(-2.2, -0.7, 0),
          new THREE.Vector3(-rBottom + 0.02, -0.85, 0)
        ));
        const handleGeo = new THREE.TubeGeometry(handleCurve, 64, 0.17, 24, false);
        handleGeo.computeVertexNormals();
        group.add(new THREE.Mesh(handleGeo, ceramicMat));
        break;
      }

      /* ==========================================================
         5. TERMO DE ACERO INOXIDABLE
      ========================================================== */
      case 'termo': {
        const isDeportivo = sub === 'deportivo';
        const steelBodyMat = createBaseMaterial(0.24, 0.75, 0.3);
        const printMat = createPrintMaterial(0.2, 0.0);
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
        }

        // Cylinder body
        const bodyGeo = new THREE.CylinderGeometry(1.05, 0.98, 3.3, 64, 32);
        bodyGeo.computeVertexNormals();
        group.add(new THREE.Mesh(bodyGeo, steelBodyMat));

        const printGeo = new THREE.CylinderGeometry(1.055, 0.985, 3.3, 64, 32, true);
        printGeo.computeVertexNormals();
        group.add(new THREE.Mesh(printGeo, printMat));

        // Shoulder
        const shoulderGeo = new THREE.CylinderGeometry(0.78, 1.05, 0.5, 64, 16);
        shoulderGeo.computeVertexNormals();
        const shoulderMesh = new THREE.Mesh(shoulderGeo, steelBodyMat);
        shoulderMesh.position.y = 1.9;
        group.add(shoulderMesh);

        // Cap / Lid
        const capMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#2A2A2A'), roughness: 0.35, metalness: 0.7 });
        const capGeo = new THREE.CylinderGeometry(0.74, 0.74, isDeportivo ? 0.9 : 0.75, 64, 16);
        capGeo.computeVertexNormals();
        const capMesh = new THREE.Mesh(capGeo, capMat);
        capMesh.position.y = isDeportivo ? 2.85 : 2.75;
        group.add(capMesh);

        // Accent Ring
        const ringMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#D4AF37'), roughness: 0.15, metalness: 0.95 });
        const ringGeo = new THREE.TorusGeometry(0.75, 0.04, 16, 64);
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = 2.7;
        group.add(ringMesh);
        break;
      }

      /* ==========================================================
         6. GORRA / JOCKEY
      ========================================================== */
      case 'gorra': {
        const isPlana = sub === 'plana';
        const capFabricMat = createBaseMaterial(0.78, 0.02, 0.0);
        const printMat = createPrintMaterial(0.75, 0.0);

        // Crown Dome
        const crownGeo = new THREE.SphereGeometry(1.4, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5);
        crownGeo.scale(1.0, 0.76, 1.15);
        crownGeo.computeVertexNormals();
        group.add(new THREE.Mesh(crownGeo, capFabricMat));

        // Front Panel Decal Overlay
        const frontPatchGeo = new THREE.PlaneGeometry(1.5, 1.0, 24, 24);
        const pPos = frontPatchGeo.attributes.position;
        const pUvs = frontPatchGeo.attributes.uv;
        for (let i = 0; i < pPos.count; i++) {
          const x = pPos.getX(i);
          const y = pPos.getY(i);
          pPos.setZ(i, 1.15 - (x * x) * 0.18);
          pUvs.setXY(i, THREE.MathUtils.clamp((x + 0.75) / 1.5, 0, 1), THREE.MathUtils.clamp((y + 0.5) / 1.0, 0, 1));
        }
        frontPatchGeo.computeVertexNormals();
        pUvs.needsUpdate = true;
        const frontPatch = new THREE.Mesh(frontPatchGeo, printMat);
        frontPatch.position.set(0, 0.55, 0.45);
        group.add(frontPatch);

        // Visor Brim
        const brimShape = new THREE.Shape();
        brimShape.moveTo(-1.25, 0);
        brimShape.quadraticCurveTo(0, isPlana ? 1.7 : 1.9, 1.25, 0);
        brimShape.quadraticCurveTo(0, 0.45, -1.25, 0);
        const brimGeo = new THREE.ExtrudeGeometry(brimShape, { depth: 0.08, bevelEnabled: true, bevelSegments: 8, bevelSize: 0.05, bevelThickness: 0.05 });
        brimGeo.center();
        brimGeo.computeVertexNormals();
        const brimMesh = new THREE.Mesh(brimGeo, capFabricMat);
        brimMesh.rotation.x = isPlana ? Math.PI / 2.05 : Math.PI / 2.3;
        brimMesh.position.set(0, 0.15, 1.6);
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

      default:
        break;
    }

    return group;
  }, []);

  // Update base color on all body materials
  const updateMaterialsColor = useCallback((hexColor: string) => {
    const col = new THREE.Color(hexColor);
    baseMaterialsRef.current.forEach((mat) => {
      mat.color.copy(col);
      mat.needsUpdate = true;
    });
  }, []);

  // Initialize Three.js Scene, Camera, WebGLRenderer & OrbitControls (NO SHADOWS)
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
    camera.position.set(3.2, 1.8, 3.6);
    cameraRef.current = camera;

    // Clean WebGLRenderer without shadow map
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio 3-Point Lighting setup (Pure studio reflections without ground shadows)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xf0f4ff, 0.8);
    fillLight.position.set(-6, 3, -4);
    scene.add(fillLight);

    // Rim Light
    const rimLight = new THREE.DirectionalLight(0xfff5e6, 0.7);
    rimLight.position.set(0, 6, -7);
    scene.add(rimLight);

    // OrbitControls attached directly to renderer canvas
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.0;
    controls.maxDistance = 9.0;
    controls.maxPolarAngle = Math.PI / 1.75;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Continuous 60 FPS Render Loop
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

    printMaterialsRef.current.forEach((mat) => {
      if (canvasTextureRef.current) {
        mat.map = canvasTextureRef.current;
        mat.needsUpdate = true;
      }
    });
  }, [canvasSource, textureVersion]);

  // Re-build 3D Mesh when product, subTipo or base color changes
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

    const group = buildProductMesh(producto, subTipo, productColor, canvasTextureRef.current);
    productGroupRef.current = group;
    sceneRef.current.add(group);
  }, [producto, subTipo, buildProductMesh, productColor]);

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
