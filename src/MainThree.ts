import { ACESFilmicToneMapping, DataTexture, HalfFloatType, Object3D, OrthographicCamera, Scene, WebGLRenderer } from "three";
import { ClearPass, EffectComposer, EffectPass, RenderPass } from "postprocessing";

import { AssetsId } from "./constants/AssetsId";
import { AssetsManager } from "./managers/AssetsManager";
import { DomElements } from "./constants/DomElements";
import { ExtendedObject3D } from "./utils/ExtendedObject3D";
import { MaskEffect } from '@/postprocessing/MaskEffect';
import { PixelationEffect } from '@/postprocessing/PixelationEffect';
import { Ticker } from "./utils/Ticker";

export class MainThree {
  private static _Scene = new Scene();

  private static _CanvasContainer: HTMLDivElement;
  private static _Camera: OrthographicCamera;
  private static _Renderer: WebGLRenderer;
  private static _ExtendedObject3D = new Set<ExtendedObject3D>();
  private static _EffectComposer: EffectComposer;

  // #region public methods
  static Init(): void {
    this._CreateRenderer();
    this._CreateCanvas();
    this._CreateCamera();

    this._CreateEffectComposer();
    

    window.addEventListener("resize", this._HandleResize);
    Ticker.Add(this._Update);
  }

  public static Add(object3d: Object3D): void {
    object3d.traverse((child) => {
      if (child instanceof ExtendedObject3D) {
        this._ExtendedObject3D.add(child);
      }
    });

    this._Scene.add(object3d);
  }

  public static Remove(object3d: Object3D): void {
    object3d.traverse((child) => {
      if (child instanceof ExtendedObject3D) {
        this._ExtendedObject3D.delete(child);
      }
    });

    this._Scene.remove(object3d);
  }
  // #endregion

  private static _CreateCanvas(): void {
    this._CanvasContainer = document.getElementById(
      DomElements.THREE_CONTAINER
    ) as HTMLDivElement;
    this._CanvasContainer.appendChild(this._Renderer.domElement);
  }

  private static _CreateRenderer(): void {
    this._Renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    this._Renderer.toneMapping = ACESFilmicToneMapping;
    this._Renderer.setSize(window.innerWidth, window.innerHeight);
    this._Renderer.setPixelRatio(window.devicePixelRatio);
  }

  private static _CreateCamera(): void {
    const aspect = this._CanvasContainer.offsetWidth / MainThree._CanvasContainer.offsetHeight;

    this._Camera = new OrthographicCamera(
      -aspect, 
      aspect, 
      1, 
      -1
    );
    this._Camera.position.z = 5;
  }

  private static _CreateEffectComposer(): void {
    this._EffectComposer = new EffectComposer(this._Renderer, {
      frameBufferType: HalfFloatType,
    });

    const renderPass = new RenderPass(this._Scene, this._Camera);
    this._EffectComposer.addPass(renderPass);
  }

  public static AddPixelationEffectPass(): void {
    const pixelationEffect = new EffectPass(
      this._Camera,
      new PixelationEffect()
    );

    this._EffectComposer.addPass(pixelationEffect);
  }

  private static _HandleResize = (event: Event): void => {
    this._Renderer.setSize(window.innerWidth, window.innerHeight);
    this._EffectComposer.setSize(window.innerWidth, window.innerHeight);
    
    const aspect =
      this._CanvasContainer.offsetWidth /
      MainThree._CanvasContainer.offsetHeight;

    this._Camera.left = -aspect;
    this._Camera.right = aspect;
    this._Camera.top = 1 
    this._Camera.bottom = -1;

    this._Camera.updateProjectionMatrix();

    for (const object of this._ExtendedObject3D) {
      object.resize(event);
    }
  };

  public static SetHdr(assetsId: AssetsId): void {
    const hdr = AssetsManager.GetAsset<DataTexture>(assetsId);
    this._Scene.environment = hdr;
  }

  private static _Update = (dt: number): void => {
    this.EffectComposer?.render(dt);

    for (const object of this._ExtendedObject3D) {
      object.update(dt);
    }
  };

  // #region getters / setters
  public static get Scene(): Scene { return this._Scene; }
  public static get Camera(): OrthographicCamera { return this._Camera; }
  public static get Renderer(): WebGLRenderer { return this._Renderer; }
  public static get EffectComposer(): EffectComposer { return this._EffectComposer; }
  public static get Canvas(): HTMLCanvasElement { return this._Renderer.domElement; }
  // #endregion
}