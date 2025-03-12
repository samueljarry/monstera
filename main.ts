import './style.css'

import { AssetsId } from '@constants/AssetsId';
import { AssetsManager } from '@managers/AssetsManager';
import { MainThree } from './src/MainThree'
import { Monstera } from '@/components/Monstera';
import { Ticker } from '@utils/Ticker';

export class Main {
  public static async Init() {
    MainThree.Init();
    Ticker.Start();

    await this._LoadAssets();
    this._CreateScene();
  }

  private static async _LoadAssets() {
    AssetsManager.AddGlb(AssetsId.GLB_MONSTERA, 'models/monstera.glb');
    AssetsManager.AddHdr(AssetsId.HDR_DEFAULT, 'hdr/studio.hdr');
    AssetsManager.AddTexture(AssetsId.TEXTURE_GLASS, 'textures/glass.webp');

    await AssetsManager.Load();
  }

  private static _CreateScene() {
    MainThree.SetHdr(AssetsId.HDR_DEFAULT);
    MainThree.AddPixelationEffectPass();

    const monstera = new Monstera();

    MainThree.Add(monstera);

    const main = document.querySelector('main');
    main.classList.remove('loading');
  }
}

Main.Init()