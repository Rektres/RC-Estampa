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

    // Helper for PBR base material (Textile, Glass, Ceramic, Steel)
    const createBaseMaterial = (roughness = 0.82, metalness = 0.04, clearcoat = 0.0) => {
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

    // Helper for Decal Print Material (Faithful pure diffuse map)
    const createPrintMaterial = (roughness = 0.8, metalness = 0.0) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture || null,
        transparent: true,
        alphaTest: 0.01,
        roughness,
        metalness,
        polygonOffset: true,
        polygonOffsetFactor: -1.5,
        polygonOffsetUnits: -1.5,
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

        const fabricMat = createBaseMaterial(isPolo ? 0.90 : isPoleron ? 0.86 : 0.82, 0.0, 0.0);
        const ribMat = createBaseMaterial(isPolo ? 0.92 : isPoleron ? 0.88 : 0.85, 0.0, 0.0);
        const printMat = createPrintMaterial(0.8, 0.0);

        const widthScale = isPoleron ? 1.08 : isPolo ? 1.0 : 0.96;
        const depthScale = isPoleron ? 0.44 : 0.36;

        // 1. Torso: High-density anatomical mannequin silhouette
        const torsoGeo = new THREE.CylinderGeometry(1.08 * widthScale, 1.0 * widthScale, 2.55, 64, 48, false);
        torsoGeo.scale(1.0, 1.0, depthScale);

        const pos = torsoGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);

          // Shoulder slope
          if (y > 0.45) {
            const shoulderDrop = Math.pow(Math.abs(x) / (1.08 * widthScale), 1.7) * 0.35;
            pos.setY(i, y - shoulderDrop);
          }

          // Gentle waist entalle & chest contour
          if (y > -0.65 && y < 0.45) {
            const waistFactor = 1.0 - Math.cos((y + 0.1) * Math.PI) * 0.055;
            pos.setX(i, x * waistFactor);
            const chestBoost = (z > 0 && y > -0.1 && y < 0.55) ? Math.sin((y + 0.1) * 2.8) * 0.05 : 0;
            pos.setZ(i, z * waistFactor + chestBoost);
          }

          // Back spine indent
          if (z < 0 && y > 0.1) {
            const spineIndent = Math.exp(-Math.pow(x * 3, 2)) * 0.025;
            pos.setZ(i, z + spineIndent);
          }
        }
        torsoGeo.computeVertexNormals();
        group.add(new THREE.Mesh(torsoGeo, fabricMat));

        // Ruedo inferior (Hem band)
        const hemGeo = new THREE.TorusGeometry(1.01 * widthScale, 0.022, 16, 64);
        hemGeo.scale(1.0, depthScale, 1.0);
        const hemMesh = new THREE.Mesh(hemGeo, ribMat);
        hemMesh.rotation.x = Math.PI / 2;
        hemMesh.position.y = -1.27;
        group.add(hemMesh);

        // 2. Decal Print Zone (Molded directly to chest curve, contained inside chest boundaries)
        const printW = 1.20;
        const printH = 1.45;
        const printGeo = new THREE.PlaneGeometry(printW, printH, 32, 32);
        const printPos = printGeo.attributes.position;
        const printUvs = printGeo.attributes.uv;
        for (let i = 0; i < printPos.count; i++) {
          const x = printPos.getX(i);
          const y = printPos.getY(i);
          const zCurve = (isPoleron ? 0.46 : 0.38) - (x * x) * 0.075 + (y > 0 ? y * 0.03 : 0);
          printPos.setZ(i, zCurve);
          printUvs.setXY(i, THREE.MathUtils.clamp((x + printW / 2) / printW, 0, 1), THREE.MathUtils.clamp((y + printH / 2) / printH, 0, 1));
        }
        printGeo.computeVertexNormals();
        printUvs.needsUpdate = true;
        const printMesh = new THREE.Mesh(printGeo, printMat);
        printMesh.position.set(0, 0.02, 0);
        group.add(printMesh);

        // 3. Sleeves: Positioned and angled seamlessly from the shoulders
        const sleeveLen = isPoleron ? 1.45 : isPolo ? 0.88 : 0.92;
        const rTop = isPoleron ? 0.40 : isPolo ? 0.34 : 0.32;
        const rBottom = isPoleron ? 0.30 : isPolo ? 0.28 : 0.26;
        const sleeveAngle = isPoleron ? 0.36 : 0.32;

        const leftSleeveGeo = new THREE.CylinderGeometry(rBottom, rTop, sleeveLen, 48, 16, false);
        leftSleeveGeo.computeVertexNormals();
        const leftSleeve = new THREE.Mesh(leftSleeveGeo, fabricMat);
        leftSleeve.position.set(-1.08 * widthScale, 0.62, 0.02);
        leftSleeve.rotation.set(0.06, 0, sleeveAngle);
        group.add(leftSleeve);

        const rightSleeveGeo = new THREE.CylinderGeometry(rBottom, rTop, sleeveLen, 48, 16, false);
        rightSleeveGeo.computeVertexNormals();
        const rightSleeve = new THREE.Mesh(rightSleeveGeo, fabricMat);
        rightSleeve.position.set(1.08 * widthScale, 0.62, 0.02);
        rightSleeve.rotation.set(0.06, 0, -sleeveAngle);
        group.add(rightSleeve);

        // Sleeve Cuffs (Seamlessly placed at the exact end of each sleeve)
        const cuffOffsetX = Math.sin(sleeveAngle) * (sleeveLen / 2);
        const cuffOffsetY = Math.cos(sleeveAngle) * (sleeveLen / 2);

        const leftCuff = new THREE.Mesh(new THREE.TorusGeometry(rBottom, 0.025, 16, 32), ribMat);
        leftCuff.position.set(-1.08 * widthScale - cuffOffsetX, 0.62 - cuffOffsetY, 0.02);
        leftCuff.rotation.set(0.06, 0, sleeveAngle);
        const rightCuff = new THREE.Mesh(new THREE.TorusGeometry(rBottom, 0.025, 16, 32), ribMat);
        rightCuff.position.set(1.08 * widthScale + cuffOffsetX, 0.62 - cuffOffsetY, 0.02);
        rightCuff.rotation.set(0.06, 0, -sleeveAngle);
        group.add(leftCuff, rightCuff);

        // Dark inner sleeve depth discs (Prevents open floating cylinder look)
        const darkHoleMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#18181B') });
        const leftHole = new THREE.Mesh(new THREE.CircleGeometry(rBottom * 0.95, 24), darkHoleMat);
        leftHole.position.set(-1.08 * widthScale - cuffOffsetX, 0.62 - cuffOffsetY, 0.02);
        leftHole.rotation.set(Math.PI / 2 + 0.06, 0, sleeveAngle);
        const rightHole = new THREE.Mesh(new THREE.CircleGeometry(rBottom * 0.95, 24), darkHoleMat);
        rightHole.position.set(1.08 * widthScale + cuffOffsetX, 0.62 - cuffOffsetY, 0.02);
        rightHole.rotation.set(Math.PI / 2 + 0.06, 0, -sleeveAngle);
        group.add(leftHole, rightHole);

        // Shoulder Stitch Seams
        const stitchMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color).offsetHSL(0, 0, -0.08),
          roughness: 0.9,
        });
        const leftShoulderSeam = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.58, 8), stitchMat);
        leftShoulderSeam.position.set(-0.68 * widthScale, 1.12, 0.02);
        leftShoulderSeam.rotation.set(0, 0, 0.35);
        const rightShoulderSeam = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.58, 8), stitchMat);
        rightShoulderSeam.position.set(0.68 * widthScale, 1.12, 0.02);
        rightShoulderSeam.rotation.set(0, 0, -0.35);
        group.add(leftShoulderSeam, rightShoulderSeam);

        // 4. Sub-Type Collar & Hoodie details
        if (isPolo) {
          // --- POLO PIQUÉ ---
          // Cuello camisero estilizado con lapelas
          const leftCollarShape = new THREE.Shape();
          leftCollarShape.moveTo(0, 0);
          leftCollarShape.lineTo(-0.55, -0.32);
          leftCollarShape.lineTo(-0.45, 0.22);
          leftCollarShape.lineTo(0, 0.12);
          leftCollarShape.closePath();
          const leftWingGeo = new THREE.ExtrudeGeometry(leftCollarShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015 });
          const leftWing = new THREE.Mesh(leftWingGeo, fabricMat);
          leftWing.rotation.x = -Math.PI / 3.2;
          leftWing.position.set(-0.02, 1.16, 0.26);
          group.add(leftWing);

          const rightCollarShape = new THREE.Shape();
          rightCollarShape.moveTo(0, 0);
          rightCollarShape.lineTo(0.55, -0.32);
          rightCollarShape.lineTo(0.45, 0.22);
          rightCollarShape.lineTo(0, 0.12);
          rightCollarShape.closePath();
          const rightWingGeo = new THREE.ExtrudeGeometry(rightCollarShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015 });
          const rightWing = new THREE.Mesh(rightWingGeo, fabricMat);
          rightWing.rotation.x = -Math.PI / 3.2;
          rightWing.position.set(0.02, 1.16, 0.26);
          group.add(rightWing);

          // Solapa de botones
          const placketGeo = new THREE.BoxGeometry(0.20, 0.72, 0.04);
          const placketMesh = new THREE.Mesh(placketGeo, fabricMat);
          placketMesh.position.set(0, 0.76, 0.38);
          group.add(placketMesh);

          // 3 Botones nácar con bordes
          const buttonMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#F4F4F5'), roughness: 0.2, metalness: 0.3 });
          [-0.20, 0.0, 0.20].forEach((offsetY) => {
            const b = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.015, 16), buttonMat);
            b.rotation.x = Math.PI / 2;
            b.position.set(0, 0.76 + offsetY, 0.41);
            group.add(b);
          });

        } else if (isPoleron) {
          // --- POLERÓN / HOODIE (STREETWEAR NATURAL) ---
          // 1. Capucha caída natural sobre la espalda y hombros (Cowl drape)
          const hoodCowlGeo = new THREE.TorusGeometry(0.54, 0.22, 24, 48, Math.PI * 1.4);
          hoodCowlGeo.scale(0.85, 0.75, 1.15);
          hoodCowlGeo.computeVertexNormals();
          const hoodCowlMesh = new THREE.Mesh(hoodCowlGeo, fabricMat);
          hoodCowlMesh.rotation.set(-Math.PI / 2.8, 0, Math.PI * 0.8);
          hoodCowlMesh.position.set(0, 1.10, -0.15);
          group.add(hoodCowlMesh);

          // Fondo oscuro de la capucha
          const hoodBackMesh = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), fabricMat);
          hoodBackMesh.scale.set(0.8, 0.6, 0.9);
          hoodBackMesh.position.set(0, 1.08, -0.28);
          group.add(hoodBackMesh);

          // 2. Ojales metálicos
          const grommetMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#94A3B8'), roughness: 0.2, metalness: 0.85 });
          const leftGrommet = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.006, 8, 16), grommetMat);
          leftGrommet.position.set(-0.14, 0.95, 0.44);
          const rightGrommet = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.006, 8, 16), grommetMat);
          rightGrommet.position.set(0.14, 0.95, 0.44);
          group.add(leftGrommet, rightGrommet);

          // 3. Cordones trenzados de caída natural con herretes
          const cordMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#FFFFFF'), roughness: 0.6 });
          const agletMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#CBD5E1'), roughness: 0.15, metalness: 0.9 });

          // Curva suave del cordón izquierdo
          const leftCordCurve = new THREE.CurvePath<THREE.Vector3>();
          leftCordCurve.add(new THREE.CubicBezierCurve3(
            new THREE.Vector3(-0.14, 0.95, 0.44),
            new THREE.Vector3(-0.16, 0.72, 0.46),
            new THREE.Vector3(-0.12, 0.55, 0.45),
            new THREE.Vector3(-0.14, 0.40, 0.43)
          ));
          const leftCordGeo = new THREE.TubeGeometry(leftCordCurve, 24, 0.014, 8, false);
          group.add(new THREE.Mesh(leftCordGeo, cordMat));

          const leftAglet = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 12), agletMat);
          leftAglet.position.set(-0.14, 0.36, 0.43);
          group.add(leftAglet);

          // Curva suave del cordón derecho
          const rightCordCurve = new THREE.CurvePath<THREE.Vector3>();
          rightCordCurve.add(new THREE.CubicBezierCurve3(
            new THREE.Vector3(0.14, 0.95, 0.44),
            new THREE.Vector3(0.16, 0.72, 0.46),
            new THREE.Vector3(0.12, 0.55, 0.45),
            new THREE.Vector3(0.14, 0.40, 0.43)
          ));
          const rightCordGeo = new THREE.TubeGeometry(rightCordCurve, 24, 0.014, 8, false);
          group.add(new THREE.Mesh(rightCordGeo, cordMat));

          const rightAglet = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 12), agletMat);
          rightAglet.position.set(0.14, 0.36, 0.43);
          group.add(rightAglet);

          // 4. Bolsillo Canguro frontal
          const pocketShape = new THREE.Shape();
          pocketShape.moveTo(-0.68, -0.52);
          pocketShape.lineTo(-0.50, 0.18);
          pocketShape.lineTo(0.50, 0.18);
          pocketShape.lineTo(0.68, -0.52);
          pocketShape.closePath();
          const pocketGeo = new THREE.ExtrudeGeometry(pocketShape, {
            depth: 0.10,
            bevelEnabled: true,
            bevelSegments: 4,
            bevelSize: 0.025,
            bevelThickness: 0.025,
          });
          pocketGeo.computeVertexNormals();
          const pocketMesh = new THREE.Mesh(pocketGeo, fabricMat);
          pocketMesh.position.set(0, -0.42, 0.43);
          group.add(pocketMesh);

        } else if (isVNeck) {
          // --- CUELLO V ---
          const vCollarCurve = new THREE.CurvePath<THREE.Vector3>();
          vCollarCurve.add(new THREE.LineCurve3(new THREE.Vector3(-0.42, 1.18, 0.20), new THREE.Vector3(0, 0.68, 0.38)));
          vCollarCurve.add(new THREE.LineCurve3(new THREE.Vector3(0, 0.68, 0.38), new THREE.Vector3(0.42, 1.18, 0.20)));
          const vCollarGeo = new THREE.TubeGeometry(vCollarCurve, 32, 0.045, 12, false);
          vCollarGeo.computeVertexNormals();
          group.add(new THREE.Mesh(vCollarGeo, ribMat));

        } else {
          // --- CUELLO REDONDO CLÁSICO RIB 1X1 ---
          const collarGeo = new THREE.TorusGeometry(0.40, 0.048, 20, 64);
          collarGeo.scale(1.0, 0.36, 0.65);
          collarGeo.computeVertexNormals();
          const collarMesh = new THREE.Mesh(collarGeo, ribMat);
          collarMesh.rotation.x = Math.PI / 2 + 0.16;
          collarMesh.position.set(0, 1.18, 0.06);
          group.add(collarMesh);
        }
        break;
      }

      /* ==========================================================
         2. PANTALÓN / JOGGER & RECTO
      ========================================================== */
      case 'pantalon': {
        const isRecto = sub === 'recto';
        const pantsMat = createBaseMaterial(0.85, 0.0, 0.0);
        const ribMat = createBaseMaterial(0.90, 0.0, 0.0);
        const printMat = createPrintMaterial(0.8, 0.0);

        // 1. Pelvis / Cadera anatómica unificada
        const pelvisGeo = new THREE.CylinderGeometry(0.92, 0.98, 1.10, 48, 24);
        pelvisGeo.scale(1.0, 1.0, 0.58);
        pelvisGeo.computeVertexNormals();
        const pelvisMesh = new THREE.Mesh(pelvisGeo, pantsMat);
        pelvisMesh.position.y = 0.95;
        group.add(pelvisMesh);

        // 2. Pretina elástica fruncida superior
        const waistGeo = new THREE.TorusGeometry(0.92, 0.08, 16, 64);
        waistGeo.scale(1.0, 0.52, 0.58);
        waistGeo.computeVertexNormals();
        const waistMesh = new THREE.Mesh(waistGeo, ribMat);
        waistMesh.rotation.x = Math.PI / 2;
        waistMesh.position.y = 1.48;
        group.add(waistMesh);

        // Ojales, nudo y cordones frontales
        const grommetMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#94A3B8'), roughness: 0.2, metalness: 0.85 });
        const cordMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#FFFFFF'), roughness: 0.5 });
        const agletMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#CBD5E1'), roughness: 0.15, metalness: 0.9 });

        const leftEyelet = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 8, 16), grommetMat);
        leftEyelet.position.set(-0.07, 1.42, 0.60);
        const rightEyelet = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 8, 16), grommetMat);
        rightEyelet.position.set(0.07, 1.42, 0.60);
        group.add(leftEyelet, rightEyelet);

        const knotMesh = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 12), cordMat);
        knotMesh.position.set(0, 1.40, 0.62);
        group.add(knotMesh);

        const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.42, 12), cordMat);
        c1.position.set(-0.07, 1.18, 0.63);
        c1.rotation.z = 0.08;
        const ag1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 12), agletMat);
        ag1.position.set(-0.09, 0.96, 0.63);
        ag1.rotation.z = 0.08;

        const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.42, 12), cordMat);
        c2.position.set(0.07, 1.18, 0.63);
        c2.rotation.z = -0.08;
        const ag2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 12), agletMat);
        ag2.position.set(0.09, 0.96, 0.63);
        ag2.rotation.z = -0.08;
        group.add(c1, ag1, c2, ag2);

        // 3. Piernas con corte anatómico cónico
        const legRadiusTop = 0.45;
        const legRadiusBottom = isRecto ? 0.36 : 0.26;
        const legLength = 2.45;
        const legAngle = 0.03;

        const leftLegGeo = new THREE.CylinderGeometry(legRadiusBottom, legRadiusTop, legLength, 48, 24);
        leftLegGeo.computeVertexNormals();
        const leftLeg = new THREE.Mesh(leftLegGeo, pantsMat);
        leftLeg.position.set(-0.44, -0.65, 0);
        leftLeg.rotation.z = -legAngle;
        group.add(leftLeg);

        const rightLegGeo = new THREE.CylinderGeometry(legRadiusBottom, legRadiusTop, legLength, 48, 24);
        rightLegGeo.computeVertexNormals();
        const rightLeg = new THREE.Mesh(rightLegGeo, pantsMat);
        rightLeg.position.set(0.44, -0.65, 0);
        rightLeg.rotation.z = legAngle;
        group.add(rightLeg);

        // 4. Decal en muslo izquierdo (molded to leg curve)
        const thighW = 0.58;
        const thighH = 1.05;
        const thighGeo = new THREE.PlaneGeometry(thighW, thighH, 20, 20);
        const tPos = thighGeo.attributes.position;
        const tUvs = thighGeo.attributes.uv;
        for (let i = 0; i < tPos.count; i++) {
          const x = tPos.getX(i);
          const y = tPos.getY(i);
          tPos.setZ(i, 0.46 - (x * x) * 0.12);
          tUvs.setXY(i, THREE.MathUtils.clamp((x + thighW / 2) / thighW, 0, 1), THREE.MathUtils.clamp((y + thighH / 2) / thighH, 0, 1));
        }
        thighGeo.computeVertexNormals();
        tUvs.needsUpdate = true;
        const thighMesh = new THREE.Mesh(thighGeo, printMat);
        thighMesh.position.set(-0.44, -0.30, 0.05);
        thighMesh.rotation.z = -legAngle;
        group.add(thighMesh);

        // 5. Puños en tobillos colocados exactamente al final de las piernas
        const legEndOffsetY = Math.cos(legAngle) * (legLength / 2);
        const legEndOffsetX = Math.sin(legAngle) * (legLength / 2);

        if (isRecto) {
          const cuffGeo = new THREE.TorusGeometry(legRadiusBottom, 0.022, 16, 32);
          const leftCuff = new THREE.Mesh(cuffGeo, pantsMat);
          leftCuff.position.set(-0.44 - legEndOffsetX, -0.65 - legEndOffsetY, 0);
          leftCuff.rotation.x = Math.PI / 2;
          const rightCuff = new THREE.Mesh(cuffGeo, pantsMat);
          rightCuff.position.set(0.44 + legEndOffsetX, -0.65 - legEndOffsetY, 0);
          rightCuff.rotation.x = Math.PI / 2;
          group.add(leftCuff, rightCuff);
        } else {
          const cuffGeo = new THREE.CylinderGeometry(legRadiusBottom * 0.95, legRadiusBottom, 0.22, 32);
          cuffGeo.computeVertexNormals();
          const leftCuff = new THREE.Mesh(cuffGeo, ribMat);
          leftCuff.position.set(-0.44 - legEndOffsetX, -0.65 - legEndOffsetY, 0);
          leftCuff.rotation.z = -legAngle;
          const rightCuff = new THREE.Mesh(cuffGeo, ribMat);
          rightCuff.position.set(0.44 + legEndOffsetX, -0.65 - legEndOffsetY, 0);
          rightCuff.rotation.z = legAngle;
          group.add(leftCuff, rightCuff);
        }

        // Dark ankle hole discs
        const darkHoleMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#18181B') });
        const leftAnkleHole = new THREE.Mesh(new THREE.CircleGeometry(legRadiusBottom * 0.9, 24), darkHoleMat);
        leftAnkleHole.position.set(-0.44 - legEndOffsetX, -0.65 - legEndOffsetY - (isRecto ? 0 : 0.11), 0);
        leftAnkleHole.rotation.x = Math.PI / 2;
        const rightAnkleHole = new THREE.Mesh(new THREE.CircleGeometry(legRadiusBottom * 0.9, 24), darkHoleMat);
        rightAnkleHole.position.set(0.44 + legEndOffsetX, -0.65 - legEndOffsetY - (isRecto ? 0 : 0.11), 0);
        rightAnkleHole.rotation.x = Math.PI / 2;
        group.add(leftAnkleHole, rightAnkleHole);
        break;
      }

      /* ==========================================================
         3. VASOS & DRINKWARE (Clásico, Shopero Cervecero, Jarra, Vaso Térmico)
      ========================================================== */
      case 'vaso': {
        const isShopero = sub === 'shopero';
        const isJarra = sub === 'jarra';
        const isTermico = sub === 'termico';

        const glassMat = createBaseMaterial(isTermico ? 0.22 : 0.08, isTermico ? 0.70 : 0.06, 0.6);
        const printMat = createPrintMaterial(0.18, 0.0);
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
        }

        if (isShopero) {
          // --- SHOPERO CERVECERO ALEMÁN ---
          const bodyGeo = new THREE.CylinderGeometry(1.08, 0.98, 3.25, 64, 32, true);
          bodyGeo.computeVertexNormals();
          group.add(new THREE.Mesh(bodyGeo, glassMat));

          const printGeo = new THREE.CylinderGeometry(1.085, 0.985, 3.25, 64, 32, true);
          printGeo.computeVertexNormals();
          group.add(new THREE.Mesh(printGeo, printMat));

          // Base gruesa facetada con 8 paneles decorativos
          const baseGeo = new THREE.CylinderGeometry(1.14, 1.20, 0.45, 8);
          baseGeo.computeVertexNormals();
          const baseMesh = new THREE.Mesh(baseGeo, glassMat);
          baseMesh.position.y = -1.62;
          group.add(baseMesh);

          // Fondo macizo de cristal
          const bottomDiscGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.2, 32);
          const bottomDisc = new THREE.Mesh(bottomDiscGeo, glassMat);
          bottomDisc.position.y = -1.50;
          group.add(bottomDisc);

          // Asa gruesa de cristal con apoyo para pulgar (Thumb rest)
          const handleCurve = new THREE.CurvePath<THREE.Vector3>();
          handleCurve.add(new THREE.CubicBezierCurve3(
            new THREE.Vector3(-1.08, 1.15, 0),
            new THREE.Vector3(-2.25, 1.05, 0),
            new THREE.Vector3(-2.25, -1.05, 0),
            new THREE.Vector3(-1.05, -1.15, 0)
          ));
          const handleGeo = new THREE.TubeGeometry(handleCurve, 64, 0.22, 24, false);
          handleGeo.computeVertexNormals();
          group.add(new THREE.Mesh(handleGeo, glassMat));

          // Apoyo para pulgar en el tope del asa
          const thumbRestGeo = new THREE.SphereGeometry(0.18, 16, 16);
          thumbRestGeo.scale(0.8, 0.5, 1.2);
          const thumbRest = new THREE.Mesh(thumbRestGeo, glassMat);
          thumbRest.position.set(-1.85, 1.22, 0);
          group.add(thumbRest);

          // Rim superior pulido y redondeado
          const rimGeo = new THREE.TorusGeometry(1.08, 0.045, 16, 64);
          const rimMesh = new THREE.Mesh(rimGeo, glassMat);
          rimMesh.rotation.x = Math.PI / 2;
          rimMesh.position.y = 1.62;
          group.add(rimMesh);

        } else if (isJarra) {
          // --- JARRA CON PICO VERTEDOR ---
          const bodyGeo = new THREE.CylinderGeometry(0.88, 1.28, 3.25, 64, 32, true);
          bodyGeo.computeVertexNormals();
          group.add(new THREE.Mesh(bodyGeo, glassMat));

          const printGeo = new THREE.CylinderGeometry(0.885, 1.285, 3.25, 64, 32, true);
          printGeo.computeVertexNormals();
          group.add(new THREE.Mesh(printGeo, printMat));

          // Base gruesa y estable
          const baseGeo = new THREE.CylinderGeometry(1.28, 1.28, 0.22, 64);
          const baseMesh = new THREE.Mesh(baseGeo, glassMat);
          baseMesh.position.y = -1.62;
          group.add(baseMesh);

          // Pico vertedor frontal modelado
          const spoutShape = new THREE.Shape();
          spoutShape.moveTo(-0.38, 0);
          spoutShape.lineTo(0, 0.65);
          spoutShape.lineTo(0.38, 0);
          spoutShape.closePath();
          const spoutGeo = new THREE.ExtrudeGeometry(spoutShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025 });
          spoutGeo.computeVertexNormals();
          const spoutMesh = new THREE.Mesh(spoutGeo, glassMat);
          spoutMesh.rotation.x = -Math.PI / 3.2;
          spoutMesh.position.set(0, 1.62, 0.82);
          group.add(spoutMesh);

          // Asa vertical trasera de gran agarre
          const handleCurve = new THREE.CurvePath<THREE.Vector3>();
          handleCurve.add(new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 1.25, -0.92),
            new THREE.Vector3(0, 1.25, -2.15),
            new THREE.Vector3(0, -0.95, -2.15),
            new THREE.Vector3(0, -1.15, -1.28)
          ));
          const handleGeo = new THREE.TubeGeometry(handleCurve, 64, 0.18, 24, false);
          handleGeo.computeVertexNormals();
          group.add(new THREE.Mesh(handleGeo, glassMat));

        } else if (isTermico) {
          // --- VASO TÉRMICO / TRAVEL TUMBLER ---
          const bodyGeo = new THREE.CylinderGeometry(0.96, 0.74, 3.05, 64, 32);
          bodyGeo.computeVertexNormals();
          group.add(new THREE.Mesh(bodyGeo, glassMat));

          const printGeo = new THREE.CylinderGeometry(0.965, 0.745, 3.05, 64, 32, true);
          printGeo.computeVertexNormals();
          group.add(new THREE.Mesh(printGeo, printMat));

          // Base biselada antideslizante
          const baseBumperMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#1F2937'), roughness: 0.85 });
          const baseBumper = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.73, 0.15, 64), baseBumperMat);
          baseBumper.position.y = -1.52;
          group.add(baseBumper);

          // Banda de silicona central con ranuras texturadas
          const gripMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#27272A'), roughness: 0.95 });
          const gripGeo = new THREE.CylinderGeometry(0.89, 0.82, 0.95, 64);
          const gripMesh = new THREE.Mesh(gripGeo, gripMat);
          gripMesh.position.y = 0.18;
          group.add(gripMesh);

          // Tapa Barista hermética con boquilla y pestaña flip-top
          const lidMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#18181B'), roughness: 0.3, metalness: 0.5 });
          const lidGeo = new THREE.CylinderGeometry(1.00, 0.98, 0.38, 64);
          const lidMesh = new THREE.Mesh(lidGeo, lidMat);
          lidMesh.position.y = 1.68;
          group.add(lidMesh);

          // Boquilla y Flip-Top de la tapa
          const flipGeo = new THREE.BoxGeometry(0.35, 0.08, 0.65);
          const flipMesh = new THREE.Mesh(flipGeo, lidMat);
          flipMesh.position.set(0, 1.90, 0.25);
          group.add(flipMesh);

          // Aro de silicona de sellado
          const gasketMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#EF4444'), roughness: 0.8 });
          const gasket = new THREE.Mesh(new THREE.TorusGeometry(0.97, 0.02, 12, 64), gasketMat);
          gasket.rotation.x = Math.PI / 2;
          gasket.position.y = 1.50;
          group.add(gasket);

        } else {
          // --- VASO CLÁSICO ---
          const vasoGeo = new THREE.CylinderGeometry(0.98, 0.72, 3.05, 64, 32, false);
          vasoGeo.computeVertexNormals();
          group.add(new THREE.Mesh(vasoGeo, glassMat));

          const printGeo = new THREE.CylinderGeometry(0.985, 0.725, 3.05, 64, 32, true);
          printGeo.computeVertexNormals();
          group.add(new THREE.Mesh(printGeo, printMat));

          // Base pesada de cristal sólido
          const thickBaseGeo = new THREE.CylinderGeometry(0.74, 0.70, 0.35, 64);
          const thickBase = new THREE.Mesh(thickBaseGeo, glassMat);
          thickBase.position.y = -1.45;
          group.add(thickBase);

          // Rim superior dorado elegante
          const rimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#D4AF37'), roughness: 0.18, metalness: 0.92 });
          const rimGeo = new THREE.TorusGeometry(0.98, 0.035, 16, 64);
          const rimMesh = new THREE.Mesh(rimGeo, rimMat);
          rimMesh.rotation.x = Math.PI / 2;
          rimMesh.position.y = 1.52;
          group.add(rimMesh);
        }
        break;
      }

      /* ==========================================================
         4. TAZA CERÁMICA MUG & TAZA CÓNICA (Acabado Vitrificado)
      ========================================================== */
      case 'taza': {
        const isConica = sub === 'conica';
        const ceramicMat = createBaseMaterial(0.12, 0.04, 0.8);
        const printMat = createPrintMaterial(0.15, 0.0);
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
        }

        const rTop = isConica ? 1.16 : 0.98;
        const rBottom = isConica ? 0.74 : 0.94;

        // Pared exterior de cerámica vitrificada
        const outerGeo = new THREE.CylinderGeometry(rTop, rBottom, 2.65, 64, 32, true);
        outerGeo.computeVertexNormals();
        group.add(new THREE.Mesh(outerGeo, ceramicMat));

        // Envoltorio 360° para impresión y diseño
        const printGeo = new THREE.CylinderGeometry(rTop + 0.005, rBottom + 0.005, 2.65, 64, 32, true);
        printGeo.computeVertexNormals();
        group.add(new THREE.Mesh(printGeo, printMat));

        // Interior vitrificado blanco puro con profundidad
        const innerMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#FFFFFF'),
          roughness: 0.10,
          metalness: 0.02,
        });
        (innerMat as any).clearcoat = 0.8;
        const innerGeo = new THREE.CylinderGeometry(rTop - 0.08, rBottom - 0.08, 2.60, 64, 16, true);
        innerGeo.computeVertexNormals();
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        innerMesh.position.y = 0.03;
        group.add(innerMesh);

        // Fondo interior vitrificado
        const innerFloorGeo = new THREE.CircleGeometry(rBottom - 0.08, 64);
        const innerFloor = new THREE.Mesh(innerFloorGeo, innerMat);
        innerFloor.rotation.x = -Math.PI / 2;
        innerFloor.position.y = -1.27;
        group.add(innerFloor);

        // Borde superior redondeado y pulido (Smooth drinking lip)
        const rimGeo = new THREE.TorusGeometry((rTop + (rTop - 0.08)) / 2, 0.042, 24, 64);
        const rimMesh = new THREE.Mesh(rimGeo, ceramicMat);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = 1.325;
        group.add(rimMesh);

        // Base exterior con anillo de apoyo cerámico (Foot ring)
        const baseGeo = new THREE.CylinderGeometry(rBottom, rBottom * 0.96, 0.12, 64);
        baseGeo.computeVertexNormals();
        const baseMesh = new THREE.Mesh(baseGeo, ceramicMat);
        baseMesh.position.y = -1.325;
        group.add(baseMesh);

        // Anillo de apoyo sin esmaltar en la base
        const footRingMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#E5E0D8'), roughness: 0.7 });
        const footRing = new THREE.Mesh(new THREE.TorusGeometry(rBottom * 0.82, 0.025, 12, 48), footRingMat);
        footRing.rotation.x = Math.PI / 2;
        footRing.position.y = -1.385;
        group.add(footRing);

        // Asa ergonómica en D con curvatura natural y uniones suaves
        const handleCurve = new THREE.CurvePath<THREE.Vector3>();
        handleCurve.add(new THREE.CubicBezierCurve3(
          new THREE.Vector3(-rTop + 0.02, 0.88, 0),
          new THREE.Vector3(-2.02, 0.72, 0),
          new THREE.Vector3(-2.02, -0.72, 0),
          new THREE.Vector3(-rBottom + 0.02, -0.88, 0)
        ));
        const handleGeo = new THREE.TubeGeometry(handleCurve, 64, 0.15, 24, false);
        handleGeo.computeVertexNormals();
        group.add(new THREE.Mesh(handleGeo, ceramicMat));
        break;
      }

      /* ==========================================================
         5. TERMO DE ACERO INOXIDABLE & BOTELLA DEPORTIVA
      ========================================================== */
      case 'termo': {
        const isDeportivo = sub === 'deportivo';
        const steelBodyMat = createBaseMaterial(0.20, 0.80, 0.4);
        const printMat = createPrintMaterial(0.20, 0.0);
        if (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
        }

        // Cuerpo cilíndrico de acero inoxidable multicapa
        const bodyGeo = new THREE.CylinderGeometry(0.86, 0.82, 3.35, 64, 32);
        bodyGeo.computeVertexNormals();
        group.add(new THREE.Mesh(bodyGeo, steelBodyMat));

        const printGeo = new THREE.CylinderGeometry(0.865, 0.825, 3.35, 64, 32, true);
        printGeo.computeVertexNormals();
        group.add(new THREE.Mesh(printGeo, printMat));

        // Hombro biselado aislante
        const shoulderGeo = new THREE.CylinderGeometry(0.64, 0.86, 0.48, 64, 16);
        shoulderGeo.computeVertexNormals();
        const shoulderMesh = new THREE.Mesh(shoulderGeo, steelBodyMat);
        shoulderMesh.position.y = 1.91;
        group.add(shoulderMesh);

        // Base reforzada
        const baseRingMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#334155'), roughness: 0.5, metalness: 0.6 });
        const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.83, 0.83, 0.16, 64), baseRingMat);
        baseRing.position.y = -1.68;
        group.add(baseRing);

        if (isDeportivo) {
          // --- BOTELLA DEPORTIVA CON TAPA QUICK-FLIP & ASA CARABINER ---
          const sportCapMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#1E293B'), roughness: 0.35, metalness: 0.6 });
          const capGeo = new THREE.CylinderGeometry(0.60, 0.60, 0.85, 64, 16);
          capGeo.computeVertexNormals();
          const capMesh = new THREE.Mesh(capGeo, sportCapMat);
          capMesh.position.y = 2.58;
          group.add(capMesh);

          // Asa ergonómica de transporte (Carry Loop)
          const loopCurve = new THREE.CurvePath<THREE.Vector3>();
          loopCurve.add(new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 2.95, -0.25),
            new THREE.Vector3(0, 3.65, -0.65),
            new THREE.Vector3(0, 3.65, 0.25),
            new THREE.Vector3(0, 2.95, 0.25)
          ));
          const loopGeo = new THREE.TubeGeometry(loopCurve, 32, 0.08, 16, false);
          const loopMesh = new THREE.Mesh(loopGeo, sportCapMat);
          group.add(loopMesh);

          // Boquilla deportiva & Botón de apertura (Push button)
          const buttonMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#EF4444'), roughness: 0.3, metalness: 0.2 });
          const pushBtn = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 0.12), buttonMat);
          pushBtn.position.set(0, 2.58, 0.62);
          group.add(pushBtn);

          // Anillo de silicona de agarre
          const ringMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#38BDF8'), roughness: 0.6 });
          const ringGeo = new THREE.TorusGeometry(0.62, 0.035, 16, 64);
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2;
          ringMesh.position.y = 2.22;
          group.add(ringMesh);

        } else {
          // --- TERMO CLÁSICO CON TAPA TAZA DE ACERO ---
          const cupCapMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#E2E8F0'), roughness: 0.18, metalness: 0.85 });
          const capGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.82, 64, 16);
          capGeo.computeVertexNormals();
          const capMesh = new THREE.Mesh(capGeo, cupCapMat);
          capMesh.position.y = 2.56;
          group.add(capMesh);

          // Anillo dorado o negro de separación
          const ringMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#D4AF37'), roughness: 0.15, metalness: 0.95 });
          const ringGeo = new THREE.TorusGeometry(0.63, 0.035, 16, 64);
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2;
          ringMesh.position.y = 2.15;
          group.add(ringMesh);
        }
        break;
      }

      /* ==========================================================
         6. GORRA / JOCKEY (6 Paneles, Ojales Bordados, Visera Curva/Plana & Snapback)
      ========================================================== */
      case 'gorra': {
        const isPlana = sub === 'plana';
        const capFabricMat = createBaseMaterial(0.78, 0.02, 0.0);
        const seamMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).offsetHSL(0, 0, -0.15), roughness: 0.9 });
        const eyeletMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#1E293B'), roughness: 0.4, metalness: 0.6 });
        const printMat = createPrintMaterial(0.75, 0.0);

        // 1. Corona estructurada de 6 paneles
        const crownGeo = new THREE.SphereGeometry(1.28, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.52);
        crownGeo.scale(1.0, 0.78, 1.15);
        crownGeo.computeVertexNormals();
        group.add(new THREE.Mesh(crownGeo, capFabricMat));

        // 2. Costuras radiales entre los 6 paneles (6 Seam Ribs)
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3;
          const seamCurve = new THREE.CurvePath<THREE.Vector3>();
          seamCurve.add(new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 1.18, 0),
            new THREE.Vector3(Math.cos(angle) * 0.75, 0.95, Math.sin(angle) * 0.86),
            new THREE.Vector3(Math.cos(angle) * 1.15, 0.45, Math.sin(angle) * 1.32),
            new THREE.Vector3(Math.cos(angle) * 1.28, 0.08, Math.sin(angle) * 1.47)
          ));
          const seamGeo = new THREE.TubeGeometry(seamCurve, 24, 0.014, 8, false);
          group.add(new THREE.Mesh(seamGeo, seamMat));

          // 3. Ojal de ventilación bordado en cada panel
          const eyeletAngle = angle + Math.PI / 6;
          const eyeletRadius = 0.92;
          const ex = Math.cos(eyeletAngle) * eyeletRadius;
          const ez = Math.sin(eyeletAngle) * eyeletRadius * 1.15;
          const ey = 0.62;
          const eyeletMesh = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.010, 8, 16), eyeletMat);
          eyeletMesh.position.set(ex, ey, ez);
          eyeletMesh.lookAt(ex * 1.5, ey + 0.3, ez * 1.5);
          group.add(eyeletMesh);
        }

        // 4. Parche frontal estructurado para Decal / Logo
        const frontPatchGeo = new THREE.PlaneGeometry(1.35, 0.95, 28, 28);
        const pPos = frontPatchGeo.attributes.position;
        const pUvs = frontPatchGeo.attributes.uv;
        for (let i = 0; i < pPos.count; i++) {
          const x = pPos.getX(i);
          const y = pPos.getY(i);
          pPos.setZ(i, 1.08 - (x * x) * 0.19);
          pUvs.setXY(i, THREE.MathUtils.clamp((x + 0.675) / 1.35, 0, 1), THREE.MathUtils.clamp((y + 0.475) / 0.95, 0, 1));
        }
        frontPatchGeo.computeVertexNormals();
        pUvs.needsUpdate = true;
        const frontPatch = new THREE.Mesh(frontPatchGeo, printMat);
        frontPatch.position.set(0, 0.52, 0.42);
        group.add(frontPatch);

        // 5. Visera (Curva con pespuntes vs Plana pro Snapback)
        if (isPlana) {
          const brimShape = new THREE.Shape();
          brimShape.moveTo(-1.12, 0);
          brimShape.quadraticCurveTo(0, 1.62, 1.12, 0);
          brimShape.quadraticCurveTo(0, 0.42, -1.12, 0);
          const brimGeo = new THREE.ExtrudeGeometry(brimShape, {
            depth: 0.08,
            bevelEnabled: true,
            bevelSegments: 6,
            bevelSize: 0.03,
            bevelThickness: 0.03,
          });
          brimGeo.center();
          brimGeo.computeVertexNormals();
          const brimMesh = new THREE.Mesh(brimGeo, capFabricMat);
          brimMesh.rotation.x = Math.PI / 2.05;
          brimMesh.position.set(0, 0.12, 1.50);
          group.add(brimMesh);

          // Sticker circular dorado pro snapback en la visera
          const stickerMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#D4AF37'), roughness: 0.1, metalness: 0.95 });
          const sticker = new THREE.Mesh(new THREE.CircleGeometry(0.18, 32), stickerMat);
          sticker.rotation.x = -Math.PI / 2.05;
          sticker.position.set(0.52, 0.18, 1.65);
          group.add(sticker);

        } else {
          const brimShape = new THREE.Shape();
          brimShape.moveTo(-1.14, 0);
          brimShape.quadraticCurveTo(0, 1.82, 1.14, 0);
          brimShape.quadraticCurveTo(0, 0.42, -1.14, 0);
          const brimGeo = new THREE.ExtrudeGeometry(brimShape, {
            depth: 0.08,
            bevelEnabled: true,
            bevelSegments: 8,
            bevelSize: 0.04,
            bevelThickness: 0.04,
          });
          brimGeo.center();
          brimGeo.computeVertexNormals();
          const brimMesh = new THREE.Mesh(brimGeo, capFabricMat);
          brimMesh.rotation.x = Math.PI / 2.32;
          brimMesh.position.set(0, 0.10, 1.48);
          group.add(brimMesh);

          // 4 hilos de pespunte arqueados en la visera (Curved Topstitches)
          for (let s = 1; s <= 4; s++) {
            const stitchArchCurve = new THREE.CurvePath<THREE.Vector3>();
            const offset = s * 0.12;
            stitchArchCurve.add(new THREE.QuadraticBezierCurve3(
              new THREE.Vector3(-0.95 + offset * 0.4, 0.11 - offset * 0.02, 1.25 + offset * 0.8),
              new THREE.Vector3(0, 0.16 - offset * 0.02, 1.95 + offset * 0.2),
              new THREE.Vector3(0.95 - offset * 0.4, 0.11 - offset * 0.02, 1.25 + offset * 0.8)
            ));
            const archGeo = new THREE.TubeGeometry(stitchArchCurve, 32, 0.008, 6, false);
            group.add(new THREE.Mesh(archGeo, seamMat));
          }
        }

        // 6. Botón superior (Squatchee)
        const buttonGeo = new THREE.SphereGeometry(0.11, 24, 24);
        buttonGeo.scale(1, 0.65, 1);
        buttonGeo.computeVertexNormals();
        const buttonMesh = new THREE.Mesh(buttonGeo, capFabricMat);
        buttonMesh.position.set(0, 1.18, 0);
        group.add(buttonMesh);

        // 7. Cierre trasero Snapback plástico con orificios
        const snapMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#0F172A'), roughness: 0.4, metalness: 0.2 });
        const snapStrap = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.04), snapMat);
        snapStrap.position.set(0, 0.18, -1.22);
        group.add(snapStrap);
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
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(3.1, 1.6, 3.4);
    cameraRef.current = camera;

    // High performance WebGLRenderer
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

    // Studio 4-Point Lighting setup for vivid reflections and textures
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    // Key Light (Warm daylight)
    const keyLight = new THREE.DirectionalLight(0xfffbf5, 1.6);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    // Fill Light (Cool ambient fill)
    const fillLight = new THREE.DirectionalLight(0xf0f5ff, 0.9);
    fillLight.position.set(-6, 3, -4);
    scene.add(fillLight);

    // Rim Light (Edge specular highlight)
    const rimLight = new THREE.DirectionalLight(0xfff8ee, 0.85);
    rimLight.position.set(0, 6, -7);
    scene.add(rimLight);

    // Top Highlight (Brings out collars, lids, and brims)
    const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    // OrbitControls attached directly to renderer canvas
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.0;
    controls.maxDistance = 8.5;
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
