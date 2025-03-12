export class Ticker {
  static #_IsRunning = false;
  static #_CurrentTime = 0;
  static #_ElapsedTime = 0;
  static #_Callbacks = new Set();

  // #region public
  static Start() {
    this.#_IsRunning = true;

    this.#_CurrentTime = performance.now();
    this.#_Raf();
  }

  static Stop() {
    this.#_IsRunning = false;
  }

  static Add(callback) {
    this.#_Callbacks.add(callback);
  }

  static Remove(callback) {
    this.#_Callbacks.delete(callback);
  }
  // #endregion

  // #region private
  static #_Raf = () => {
    this.#_Update();

    if (this.#_IsRunning) {
      requestAnimationFrame(this.#_Raf);
    }
  };

  static #_Update = () => {
    const now = performance.now();
    const prev = this.#_CurrentTime;

    const dt = now - prev;

    this.#_ElapsedTime += dt;
    this.#_CurrentTime = now;

    for (const func of this.#_Callbacks) {
      func(dt * 0.001);
    }
  };
  // #endregion

  // #region getters
  static get IsRunning() {
    return this.#_IsRunning;
  }

  static get CurrentTime() {
    return this.#_CurrentTime;
  }

  static get ElapsedTime() {
    return this.#_ElapsedTime;
  }

  static get ElapsedTimeInSeconds() {
    return this.#_ElapsedTime / 1000;
  }
  // #endregion
}