// lib/ar/SceneManager.ts — Three.js sahne yönetimi (imperatif)
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import { loadAsync } from 'expo-three';
import * as THREE from 'three';
import type { ARObject, AtesState } from '../../types';
import { ATES_ANIMATIONS } from '../../constants/animations';
import { ATES_MODEL } from '../../constants/animations';

/** GLB yükleme sonucu tipi */
interface GLTFResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  scenes: THREE.Group[];
  cameras: THREE.Camera[];
  asset: Record<string, unknown>;
}

/**
 * Three.js sahnesini yönetir.
 * GLView'den gelen GL context ile başlatılır.
 * Ateş karakteri (ates.glb) + ders nesneleri burada render edilir.
 */
export class SceneManager {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private atesGroup!: THREE.Group;
  private objectsGroup!: THREE.Group;
  private animationId: number | null = null;
  private clock = new THREE.Clock();
  private atesState: AtesState = 'idle';
  private bounceTime = 0;
  private disposed = false;

  // GLB model & animasyon
  private mixer: THREE.AnimationMixer | null = null;
  private animationClips: THREE.AnimationClip[] = [];
  private currentAction: THREE.AnimationAction | null = null;
  private modelLoaded = false;
  private _onModelLoaded: (() => void) | null = null;
  private _onModelError: ((error: Error) => void) | null = null;

  /** Model yüklendiğinde çağrılacak callback'i ayarla */
  set onModelLoaded(cb: (() => void) | null) {
    this._onModelLoaded = cb;
  }

  /** Model yükleme hatası callback'i */
  set onModelError(cb: ((error: Error) => void) | null) {
    this._onModelError = cb;
  }

  /** Model yüklendi mi? */
  get isModelLoaded(): boolean {
    return this.modelLoaded;
  }

  async init(gl: ExpoWebGLRenderingContext, width: number, height: number) {
    // Renderer
    this.renderer = new Renderer({ gl }) as unknown as THREE.WebGLRenderer;
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);

    // Sahne
    this.scene = new THREE.Scene();

    // Kamera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.set(0, 0.5, 2);
    this.camera.lookAt(0, 0, 0);

    // Işıklar
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(2, 3, 4);
    this.scene.add(directional);

    // Ateş karakter grubu
    this.atesGroup = new THREE.Group();
    const [px, py, pz] = ATES_MODEL.defaultPosition;
    this.atesGroup.position.set(px, py, pz);
    this.scene.add(this.atesGroup);

    // Ders nesneleri grubu
    this.objectsGroup = new THREE.Group();
    this.scene.add(this.objectsGroup);

    // GLB model yükle
    this.loadAtesModel();

    // Render döngüsü
    this.startLoop();
  }

  /** GLB modeli yükle, hata olursa geometrik fallback */
  private async loadAtesModel() {
    try {
      console.log('[SceneManager] GLB model yükleniyor...');
      const gltf = (await loadAsync(ATES_MODEL.source)) as unknown as GLTFResult;

      const model = gltf.scene;
      const [sx, sy, sz] = ATES_MODEL.scale;
      model.scale.set(sx, sy, sz);
      this.atesGroup.add(model);

      // Animasyonları listele
      this.animationClips = gltf.animations ?? [];
      if (this.animationClips.length > 0) {
        console.log(
          `[SceneManager] ${this.animationClips.length} animasyon bulundu:`,
          this.animationClips.map((c) => c.name),
        );
        this.mixer = new THREE.AnimationMixer(model);
        this.playAnimationForState(this.atesState);
      } else {
        console.log('[SceneManager] Animasyon yok, basit bounce döngüsü kullanılacak.');
      }

      this.modelLoaded = true;
      this._onModelLoaded?.();
      console.log('[SceneManager] GLB model başarıyla yüklendi ✓');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.warn('[SceneManager] GLB yükleme hatası, geometrik fallback:', error.message);
      this.buildFallbackFox();
      this.modelLoaded = true;
      this._onModelError?.(error);
    }
  }

  /** Animasyonlu modelde duruma göre klip eşleştirme */
  private playAnimationForState(state: AtesState) {
    if (!this.mixer || this.animationClips.length === 0) return;

    const config = ATES_ANIMATIONS[state];

    // Modeldeki animasyon adlarına göre eşleştir
    let clip = this.animationClips.find((c) =>
      c.name.toLowerCase().includes(config.name.toLowerCase()),
    );

    // Eşleşme yoksa durum adıyla dene
    if (!clip) {
      clip = this.animationClips.find((c) =>
        c.name.toLowerCase().includes(state.toLowerCase()),
      );
    }

    // Hâlâ yoksa ilk klip'i kullan (idle varsayılan)
    if (!clip) {
      clip = this.animationClips[0];
    }

    if (this.currentAction) {
      this.currentAction.fadeOut(0.3);
    }

    const action = this.mixer.clipAction(clip);
    action.reset();
    action.setLoop(
      config.loop ? THREE.LoopRepeat : THREE.LoopOnce,
      config.loop ? Infinity : 1,
    );
    action.clampWhenFinished = !config.loop;
    action.fadeIn(0.3);
    action.play();
    this.currentAction = action;
  }

  /** Geometrik fallback tilki (model yüklenemezse) */
  private buildFallbackFox() {
    // Gövde — turuncu küre
    const bodyGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xff6b35 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.name = 'body';
    this.atesGroup.add(body);

    // Kafa
    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xff6b35 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.35, 0);
    head.name = 'head';
    this.atesGroup.add(head);

    // Kulaklar
    const earGeo = new THREE.ConeGeometry(0.06, 0.15, 8);
    const earMat = new THREE.MeshLambertMaterial({ color: 0xff8c55 });
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.1, 0.55, 0);
    this.atesGroup.add(leftEar);
    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.1, 0.55, 0);
    this.atesGroup.add(rightEar);

    // Gözler
    const eyeWhiteGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupilGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

    const leftEyeW = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEyeW.position.set(-0.07, 0.38, 0.15);
    this.atesGroup.add(leftEyeW);
    const leftEyeP = new THREE.Mesh(eyePupilGeo, eyePupilMat);
    leftEyeP.position.set(-0.07, 0.38, 0.18);
    this.atesGroup.add(leftEyeP);

    const rightEyeW = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEyeW.position.set(0.07, 0.38, 0.15);
    this.atesGroup.add(rightEyeW);
    const rightEyeP = new THREE.Mesh(eyePupilGeo, eyePupilMat);
    rightEyeP.position.set(0.07, 0.38, 0.18);
    this.atesGroup.add(rightEyeP);

    // Burun
    const noseGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const noseMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.33, 0.17);
    this.atesGroup.add(nose);

    // Kuyruk
    const tailGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.3, 8);
    const tailMat = new THREE.MeshLambertMaterial({ color: 0xff8c55 });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0, 0.05, -0.25);
    tail.rotation.x = -0.5;
    tail.name = 'tail';
    this.atesGroup.add(tail);

    // Kuyruk ucu
    const tailTipGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const tailTipMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const tailTip = new THREE.Mesh(tailTipGeo, tailTipMat);
    tailTip.position.set(0, 0.18, -0.35);
    this.atesGroup.add(tailTip);
  }

  /** Ders nesnelerini yenile */
  setSceneObjects(objects: ARObject[]) {
    // Eski nesneleri temizle
    while (this.objectsGroup.children.length > 0) {
      const child = this.objectsGroup.children[0];
      this.objectsGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    }

    // Yeni nesneler ekle
    for (const obj of objects) {
      const mesh = this.createObjectMesh(obj);
      if (mesh) {
        mesh.userData = { objectId: obj.id, interactive: obj.interactive };
        this.objectsGroup.add(mesh);
      }
    }
  }

  /** ARObject verisinden Three.js mesh oluştur */
  private createObjectMesh(obj: ARObject): THREE.Mesh | null {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    const scale = obj.scale[0] * 2;

    if (obj.model.includes('apple')) {
      geometry = new THREE.SphereGeometry(scale, 12, 12);
      material = new THREE.MeshLambertMaterial({ color: 0xe53935 });
    } else if (obj.model.includes('star')) {
      geometry = new THREE.OctahedronGeometry(scale, 0);
      material = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    } else if (obj.model.includes('block')) {
      geometry = new THREE.BoxGeometry(scale, scale, scale);
      material = new THREE.MeshLambertMaterial({ color: 0x2196f3 });
    } else if (obj.model.includes('plus')) {
      geometry = new THREE.BoxGeometry(scale, scale * 0.3, scale * 0.3);
      material = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
    } else if (obj.model.includes('plate')) {
      geometry = new THREE.CylinderGeometry(scale, scale, scale * 0.1, 16);
      material = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    } else if (obj.model.includes('pizza')) {
      geometry = new THREE.CylinderGeometry(0, scale, scale * 0.1, 8, 1, false, 0, Math.PI);
      material = new THREE.MeshLambertMaterial({ color: 0xffb74d });
    } else if (obj.model.includes('square')) {
      geometry = new THREE.PlaneGeometry(scale, scale);
      material = new THREE.MeshLambertMaterial({ color: 0x9c27b0, side: THREE.DoubleSide });
    } else {
      geometry = new THREE.BoxGeometry(scale, scale, scale);
      material = new THREE.MeshLambertMaterial({ color: 0x999999 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
    return mesh;
  }

  /** Ateş durumunu güncelle */
  setAtesState(state: AtesState) {
    this.atesState = state;
    if (this.mixer && this.animationClips.length > 0) {
      this.playAnimationForState(state);
    }
    this.updateAtesAppearance();
  }

  /** Duruma göre renk/ölçek güncelle (fallback modda) */
  private updateAtesAppearance() {
    const body = this.atesGroup.getObjectByName('body') as THREE.Mesh | undefined;
    if (!body) return;

    const mat = body.material as THREE.MeshLambertMaterial;
    switch (this.atesState) {
      case 'correct':
      case 'celebrating':
        mat.color.setHex(0xffd700);
        break;
      case 'wrong':
        mat.color.setHex(0xff9800);
        break;
      default:
        mat.color.setHex(0xff6b35);
        break;
    }
  }

  /** Dokunma ile nesne algılama */
  handleTouch(x: number, y: number, viewWidth: number, viewHeight: number): string | null {
    const mouse = new THREE.Vector2(
      (x / viewWidth) * 2 - 1,
      -(y / viewHeight) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.objectsGroup.children, true);
    for (const hit of intersects) {
      const userData = hit.object.userData;
      if (userData?.interactive && userData?.objectId) {
        return userData.objectId as string;
      }
    }
    return null;
  }

  /** Animasyon döngüsü */
  private startLoop() {
    const animate = () => {
      if (this.disposed) return;
      this.animationId = requestAnimationFrame(animate);

      const delta = this.clock.getDelta();
      this.bounceTime += delta;

      // AnimationMixer güncelle (GLB animasyonları)
      this.mixer?.update(delta);

      this.animateAtes();
      this.animateObjects();

      this.renderer.render(this.scene, this.camera);
      // @ts-expect-error — expo-gl endFrameEXP
      this.renderer.domElement?.getContext?.('webgl')?.endFrameEXP?.();
    };
    animate();
  }

  private animateAtes() {
    const [, baseY] = ATES_MODEL.defaultPosition;

    if (this.mixer && this.animationClips.length > 0) {
      // GLB modelde animasyon var — sadece basit bounce + celebrating pulse ekle
      const bounceAmp = this.atesState === 'celebrating' ? 0.08 : 0.02;
      this.atesGroup.position.y = baseY + Math.sin(this.bounceTime * 2) * bounceAmp;

      if (this.atesState === 'celebrating') {
        const pulse = 1 + Math.sin(this.bounceTime * 6) * 0.05;
        this.atesGroup.scale.set(pulse, pulse, pulse);
      } else {
        this.atesGroup.scale.set(1, 1, 1);
      }
      return;
    }

    // Fallback geometrik model animasyonları
    const config = ATES_ANIMATIONS[this.atesState];
    const bounceSpeed = config.loop ? 2 : 5;
    const bounceAmp = this.atesState === 'celebrating' ? 0.15 : 0.05;
    this.atesGroup.position.y = baseY + Math.sin(this.bounceTime * bounceSpeed) * bounceAmp;

    const tail = this.atesGroup.getObjectByName('tail');
    if (tail) {
      const tailSpeed = this.atesState === 'celebrating' ? 8 : 3;
      tail.rotation.z = Math.sin(this.bounceTime * tailSpeed) * 0.3;
    }

    const head = this.atesGroup.getObjectByName('head');
    if (head && (this.atesState === 'talking' || this.atesState === 'explaining')) {
      head.rotation.z = Math.sin(this.bounceTime * 4) * 0.1;
    }

    if (this.atesState === 'celebrating') {
      const pulse = 1 + Math.sin(this.bounceTime * 6) * 0.05;
      this.atesGroup.scale.set(pulse, pulse, pulse);
    } else {
      this.atesGroup.scale.set(1, 1, 1);
    }
  }

  private animateObjects() {
    for (const child of this.objectsGroup.children) {
      // Hafif yüzme animasyonu
      child.position.y += Math.sin(this.bounceTime * 1.5 + child.position.x * 3) * 0.0005;
      child.rotation.y += 0.005;
    }
  }

  /** Temizlik */
  dispose() {
    this.disposed = true;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        }
      }
    });
    this.renderer.dispose();
  }
}
