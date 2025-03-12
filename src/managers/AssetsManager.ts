import { DataTexture, Texture } from "three";
import { GLB, GlbLoader } from "@/loaders/GlbLoader";

import { AssetsId } from '@constants/AssetsId';
import { HdrLoader } from "@/loaders/HdrLoader";
import { TextureLoader } from "@/loaders/TextureLoader";

enum ASSETS_TYPE {
  TEXTURE = 0,
  GLB = 1,
  HDR = 2,
}

type Asset = GLB | Texture | DataTexture;

export class AssetsManager {
  private static _AssetsQueue = [];
  private static _Assets = new Map();

  public static AddTexture(id: AssetsId, path: string): void {
    this._AssetsQueue.push({
      id,
      path,
      type: ASSETS_TYPE.TEXTURE,
    });
  }

  public static AddGlb(id: AssetsId, path: string): void {
    this._AssetsQueue.push({
      id,
      path,
      type: ASSETS_TYPE.GLB,
    });
  }

  public static AddHdr(id: AssetsId, path: string): void {
    this._AssetsQueue.push({
      id,
      path,
      type: ASSETS_TYPE.HDR,
    });
  }

  public static GetAsset<T extends Asset>(id: AssetsId): T {
    return this._Assets.get(id) as T;
  }

  public static async Load(): Promise<void> {
    let promises = this._AssetsQueue.map(async ({ id, path, type }) => {
      let asset = undefined;

      switch (type) {
        case ASSETS_TYPE.TEXTURE:
          asset = await TextureLoader.Load(path);
          break;
        case ASSETS_TYPE.GLB:
          asset = await GlbLoader.Load(path);
          break;
        case ASSETS_TYPE.HDR:
          asset = await HdrLoader.Load(path);
          break;
        default:
          throw new Error(
            `Assets type: ${type} not recognized and ignored by AssetsManager.js`
          );
          break;
      }

      this._Assets.set(id, asset);
    });

    await Promise.all(promises);
  }
}