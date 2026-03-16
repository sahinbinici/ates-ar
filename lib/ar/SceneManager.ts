// lib/ar/SceneManager.ts — Three.js sahne yönetimi (imperatif)
import { ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer, TextureLoader } from 'expo-three';
import * as THREE from 'three';
import type { ARObject, AtesState } from '../../types';
import { ATES_ANIMATIONS } from '../../constants/animations';

/**
 * Three.js sahnesini yönetir.
 * GLView'den gelen GL context ile başlatılır.
 * Ateş karakteri + ders nesneleri burada render edilir.
 */
export class SceneManager {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private atesGroup!: THREE.Group;
  private objectsGroup!: THREE.Group;
  private animationId: number | null = null;
  private timer = new THREE.Timer();
  private atesState: AtesState = 'idle';
  private bounceTime = 0;
  private disposed = false;

  async init(gl: ExpoWebGLRenderingContext, width: number, height: number) {
    // Renderer
    this.renderer = new Renderer({ gl }) as unknown as THREE.WebGLRenderer;
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0); // şeffaf arka plan

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
    this.atesGroup.position.set(0, -0.3, 0);
    this.buildAtesFox();
    this.scene.add(this.atesGroup);

    // Ders nesneleri grubu
    this.objectsGroup = new THREE.Group();
    this.scene.add(this.objectsGroup);

    // Render döngüsü
    this.startLoop();
  }

  /** Ateş tilki geometrik model */
  private buildAtesFox() {
    // Gövde — turuncu küre
    const bodyGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xff6b35 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.name = 'body';
    this.atesGroup.add(body);

    // Kafa — daha küçük küre
    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xff6b35 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.35, 0);
    head.name = 'head';
    this.atesGroup.add(head);

    // Kulaklar — koniler
    const earGeo = new THREE.ConeGeometry(0.06, 0.15, 8);
    const earMat = new THREE.MeshLambertMaterial({ color: 0xff8c55 });
    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.1, 0.55, 0);
    this.atesGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.1, 0.55, 0);
    this.atesGroup.add(rightEar);

    // Gözler — beyaz + siyah
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

    // Burun — küçük siyah küre
    const noseGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const noseMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.33, 0.17);
    this.atesGroup.add(nose);

    // Kuyruk — eğimli silindir
    const tailGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.3, 8);
    const tailMat = new THREE.MeshLambertMaterial({ color: 0xff8c55 });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0, 0.05, -0.25);
    tail.rotation.x = -0.5;
    tail.name = 'tail';
    this.atesGroup.add(tail);

    // Kuyruk ucu — beyaz
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
    this.updateAtesAppearance();
  }

  /** Duruma göre renk/ölçek güncelle */
  private updateAtesAppearance() {
    const body = this.atesGroup.getObjectByName('body') as THREE.Mesh | undefined;
    if (!body) return;

    const mat = body.material as THREE.MeshLambertMaterial;
    switch (this.atesState) {
      case 'correct':
      case 'celebrating':
        mat.color.setHex(0xffd700); // altın
        break;
      case 'wrong':
        mat.color.setHex(0xff9800); // koyu turuncu
        break;
      default:
        mat.color.setHex(0xff6b35); // normal turuncu
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

      this.timer.update();
      const delta = this.timer.getDelta();
      this.bounceTime += delta;

      this.animateAtes();
      this.animateObjects();

      this.renderer.render(this.scene, this.camera);
      // @ts-expect-error — expo-gl endFrameEXP
      this.renderer.domElement?.getContext?.('webgl')?.endFrameEXP?.();
    };
    animate();
  }

  private animateAtes() {
    const config = ATES_ANIMATIONS[this.atesState];

    // Zıplama animasyonu
    const bounceSpeed = config.loop ? 2 : 5;
    const bounceAmp = this.atesState === 'celebrating' ? 0.15 : 0.05;
    this.atesGroup.position.y = -0.3 + Math.sin(this.bounceTime * bounceSpeed) * bounceAmp;

    // Kuyruk sallama
    const tail = this.atesGroup.getObjectByName('tail');
    if (tail) {
      const tailSpeed = this.atesState === 'celebrating' ? 8 : 3;
      tail.rotation.z = Math.sin(this.bounceTime * tailSpeed) * 0.3;
    }

    // Kafa hafif sallanma (konuşurken)
    const head = this.atesGroup.getObjectByName('head');
    if (head && (this.atesState === 'talking' || this.atesState === 'explaining')) {
      head.rotation.z = Math.sin(this.bounceTime * 4) * 0.1;
    }

    // Kutlamada ölçek pulsasyonu
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
