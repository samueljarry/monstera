import { AmbientLight, BoxGeometry, Group, Mesh, MeshBasicMaterial } from "three";

import { AssetsId } from "@/constants/AssetsId";
import { AssetsManager } from "@/managers/AssetsManager";
import { ExtendedObject3D } from "@utils/ExtendedObject3D";
import { GLB } from '@/loaders/GlbLoader';
import { MainThree } from "@/MainThree";

enum OBJECT_NAMES {
  MONSTERA = "SM_MZRa_Monstera_B02",
  GROUND = "Cube",
}

export class Monstera extends ExtendedObject3D {
  private _glb: GLB;
  private _monstera: Group;
  private _ground: Mesh;
  
  constructor() {
    super();

    this.position.y = -0.6;
    
    this._setupGlb();
    this._setupGround();

    this._addLights();
    this.add(this._glb.scene);
  }

  private _setupGlb(): void {
    this._glb = AssetsManager.GetAsset<GLB>(AssetsId.GLB_MONSTERA);
    this._glb.scene.scale.setScalar(0.75);

    this._glb.scene.traverse((child) => {
      switch (child.name) {
        case OBJECT_NAMES.MONSTERA:
          this._monstera = child as Group;
          break;
        case OBJECT_NAMES.GROUND:
          this._ground = child as Mesh;
          break;
      }
    });
  }

  private _setupGround(): void {
    const length = MainThree.Camera.right - MainThree.Camera.left;

    this._ground.scale.x = length * 0.6
  }

  private _addLights(): void {
    const ambient = new AmbientLight();
    this.add(ambient);
  }

  public resize() {
    this._setupGround();
  }

  public update(dt: number): void {
    this._monstera.rotation.y += dt * 0.75;
  }
}