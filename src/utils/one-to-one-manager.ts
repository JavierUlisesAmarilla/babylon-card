/* eslint-disable @typescript-eslint/no-explicit-any */
export class OneToOneManager {
  options
  items = new Map()

  /**
     * Creates a new instance of the OneToOneMeshManager class.
     *
     * @param options An object containing the options for the manager.
     * @param options.create A function that creates a new item of type T given a key of type K.
     * @param options.dispose A function that disposes an item of type T given a key of type K.
     * @param options.animateIn A function that animates an item of type T into the scene given a key of type K.
     * @param options.animateOut A function that animates an item of type T out of the scene given a key of type K.
     * @throws An error if the create option is not provided.
     */
  constructor(options: any) {
    this.options = options

    if (!options.create) {
      throw new Error('create is required')
    }

    if (!options.dispose) {
      options.dispose = (item: any) => {
        let _a
        return (_a = item.dispose) == null ? void 0 : _a.call(item)
      }
    }
  }

  _addTo(key: string, ...rest: any[]) {
    let _a, _b

    if (this.items.has(key)) {
      return this.items.get(key)
    }

    const item = this.options.create(key, ...rest)
    this.items.set(key, item);
    (_b = (_a = this.options).animateIn) == null ? void 0 : _b.call(_a, item, key)
    return item
  }

  addTo(key: string, ...rest: any[]) {
    if (!Array.isArray(key)) {
      return this._addTo(key, ...rest)
    } else {
      return key.map((k2) => this._addTo(k2, ...rest))
    }
  }

  /**
     * Removes an item from the manager with the given key.
     *
     * @param key The key of the item to remove.
     * @returns A promise that resolves when the item has been removed.
     */
  async removeFrom(key: string) {
    let _a, _b, _c, _d
    const item = this.items.get(key)
    if (item) {
      this.items.delete(key)
      await ((_b = (_a = this.options).animateOut) == null ? void 0 : _b.call(_a, item, key));
      (_d = (_c = this.options).dispose) == null ? void 0 : _d.call(_c, item, key)
    }
  }

  /**
     * Gets the item with the given key.
     *
     * @param key The key of the item to get.
     * @returns The item with the given key, or undefined if it doesn't exist.
     */
  getAt(key: string) {
    return this.items.get(key)
  }

  /**
     * Disposes all items in the manager.
     */
  removeAll() {
    const keysToRemove = [...this.items.keys()]
    for (const key of keysToRemove) {
      this.removeFrom(key)
    }
    this.items.clear()
  }

  /**
     * Sets the items in the manager to the given keys, removing any items that are not in the keys array.
     *
     * @param keys An array of keys to set the items to.
     * @param rest Additional parameters to pass to the create function.
     */
  setOnlyAt(keys: string[], ...rest: any[]) {
    const keysSet = new Set(keys)
    const keysToRemove = []
    for (const [key] of this.items) {
      if (!keysSet.has(key)) {
        keysToRemove.push(key)
      }
    }
    for (const key of keysToRemove) {
      this.removeFrom(key)
    }
    for (const key of keys) {
      if (!this.items.has(key)) {
        this.addTo(key, ...rest)
      }
    }
  }

  /**
     * Checks if an item with the given key exists in the manager.
     *
     * @param key The key to check.
     * @returns True if an item with the given key exists in the manager, false otherwise.
     */
  has(key: string) {
    return this.items.has(key)
  }
}