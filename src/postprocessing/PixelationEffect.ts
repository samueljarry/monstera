import { Texture, Uniform, Vector2 } from "three";

import { AssetsId } from "@/constants/AssetsId";
import { AssetsManager } from "@/managers/AssetsManager";
import { Effect } from "postprocessing";
import { PostProcessingEffect } from "@/constants/PostProcessingEffect";
import { Ticker } from "@/utils/Ticker";
import { lerp } from "three/src/math/MathUtils.js";

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D glass;
  uniform float pixelSize;
  uniform vec2 cursor;
  uniform float scaleValue;
  uniform float pixelationMode;

  float sdBox( in vec2 p, in vec2 b )
  {
      vec2 d = abs(p)-b;
      return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 pixelCoords = (uv - cursor) * resolution;
    vec2 normalizedPixelSize = pixelSize / resolution;  
    vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

    float factor = resolution.y * 0.15 + scaleValue;
    vec2 boxSize = vec2(0.75, 1.) * factor;
    float offset = 4.;

    // Glass border
    float innerBorder = sdBox(pixelCoords, boxSize);
    float outerBorder = sdBox(pixelCoords, boxSize + offset);
    
    float clampedInner = clamp(innerBorder, 0., 1.);
    float clampedOuter = clamp(outerBorder, 0., 1.);

    vec2 glassUV = (pixelCoords + (boxSize + offset)) / ((boxSize + offset) * 2.0);
    float glassX = texture(glass, glassUV).x;

    vec4 color = texture(inputBuffer, uvPixel);

    float t = smoothstep(clampedInner, 1.-clampedInner, pixelationMode);
    vec4 finalColor = mix(inputColor, color,  t);

    float border = 1.-clampedOuter - clamp(1.-innerBorder, 0., 1.);
    border *= glassX;

    finalColor += border;
    outputColor = finalColor;
  }
`;

export class PixelationEffect extends Effect {
  private _targetPos = new Vector2(0.5, 0.5);
  private _targetScale = 0;

  constructor() {
    super(PostProcessingEffect.PIXELATE, fragment, {
      uniforms: new Map([
        ["pixelSize", new Uniform(20)],
        ["cursor", new Uniform(new Vector2(0.5, 0.5))],
        ["scaleValue", new Uniform(0)],
        ["glass", new Uniform(AssetsManager.GetAsset(AssetsId.TEXTURE_GLASS))],
        ["pixelationMode", new Uniform(0)]
      ]),
    });

    window.addEventListener("pointermove", this._handleMouseMove);
    window.addEventListener("mousedown", this._handlePointerDown);

    const button = document.querySelector('button');
    button.addEventListener('click', this._switchMode);

    Ticker.Add(this._update);
  }

  private _switchMode = (): void => {
    const pixelation = this.uniforms.get('pixelationMode');
    pixelation.value = pixelation.value === 0 ? 1 : 0;
  }

  private _handleMouseMove = ({ clientX, clientY }: PointerEvent): void => {
    const x = clientX / window.innerWidth;
    const y = 1 - clientY / window.innerHeight;

    this._targetPos.set(x, y);
  };

  private _handlePointerDown = (): void => {
    this._targetScale = window.innerHeight * 0.9;
    window.addEventListener('pointerup', this._handlePointerUp)
  };

  private _handlePointerUp = (): void => {
    this._targetScale = 0;

    window.removeEventListener('pointerup', this._handlePointerUp);
  };

  private _update = (dt: number) => {
    const cursor = this.uniforms.get("cursor");
    const scaleValue = this.uniforms.get("scaleValue");

    cursor.value.lerp(this._targetPos, 1 - Math.pow(0.01, dt));
    scaleValue.value = lerp(
      scaleValue.value,
      this._targetScale,
      1 - Math.pow(0.1, dt)
    );
  };
}
