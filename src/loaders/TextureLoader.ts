import { RepeatWrapping, SRGBColorSpace, TextureLoader as ThreeTextureLoader } from "three";

export class TextureLoader {
  static #_Loader = new ThreeTextureLoader();

  static async Load(path) {
    const texture = await this.#_Loader.loadAsync(path);
    
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.colorSpace = SRGBColorSpace;

    return texture;
  }
}