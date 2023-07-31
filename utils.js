class UMap extends Map {
  constructor(data) {
    super(data);
  }

  clone() {
    const cloned = new this.constructor();
    for (const [key, value] of this) {
      cloned.set(key, value);
    }
    return cloned;
  }

  concat(...others) {
    const comb = this.clone();
    for (const other of others) {
      for (const [key, value] of other) {
        comb.set(key, value);
      }
    }
    return comb;
  }

  difference(other) {
    const diff = new this.constructor();
    for (const [key, value] of this) {
      if (!other.has(key)) diff.set(key, value);
    }
    for (const [key, value] of other) {
      if (!this.has(key)) diff.set(key, value);
    }
    return diff;
  }

  each(fn) {
    for (const [key, value] of this) {
      fn(value, key, this);
    }
    return this;
  }

  ensure(key, genFn) {
    if (!this.has(key)) {
      this.set(key, genFn(key, this));
    }
    return this.get(key);
  }

  every(fn) {
    for (const [key, value] of this) {
      if (!fn(value, key, this)) return false;
    }
    return true;
  }

  filter(fn) {
    const filtered = new this.constructor();
    for (const [key, value] of this) {
      if (fn(value, key, this)) filtered.set(key, value);
    }
    return filtered;
  }

  find(fn) {
    for (const [key, value] of this) {
      if (fn(value, key, this)) return value;
    }
    return undefined;
  }

  map(fn) {
    const mapped = Array(this.size);
    let i = 0;
    for (const [key, value] of this) {
      mapped[i++] = fn(value, key, this);
    }
    return mapped;
  }

  mapValues(fn) {
    const mapped = new this.constructor();
    for (const [key, value] of this) {
      mapped.set(key, fn(value, key, this));
    }
    return mapped;
  }

  reduce(fn, initial) {
    let reduced = initial;
    for (const [key, value] of this) {
      reduced = fn(reduced, value, key, this);
    }
    return reduced;
  }

  some(fn) {
    for (const [key, value] of this) {
      if (fn(value, key, this)) return true;
    }
    return false;
  }

  subtract(other) {
    const diff = this.clone();
    for (const [key, value] of other) {
      if (this.has(key)) diff.delete(key);
    }
    return diff;
  }

  sweep(fn) {
    let count = 0;
    for (const [key, value] of this) {
      if (fn(value, key, this)) {
        this.delete(key);
        count++;
      }
    }
    return count;
  }

  tap(fn) {
    fn(this);
    return this;
  }

  toJSON() {
    return [...this];
  }
}

class USet extends Set {
  constructor(data) {
    super(data);
  }

  clone() {
    const cloned = new this.constructor();
    for (const value of this) {
      cloned.add(value);
    }
    return cloned;
  }

  concat(...others) {
    const comb = this.clone();
    for (const other of others) {
      for (const value of other) {
        comb.add(value);
      }
    }
    return comb;
  }

  difference(other) {
    const diff = new this.constructor();
    for (const value of this) {
      if (!other.has(value)) diff.add(value);
    }
    for (const value of other) {
      if (!this.has(value)) diff.add(value);
    }
    return diff;
  }

  each(fn) {
    for (const value of this) {
      fn(value, this);
    }
    return this;
  }

  every(fn) {
    for (const value of this) {
      if (!fn(value, this)) return false;
    }
    return true;
  }

  filter(fn) {
    const filtered = new this.constructor();
    for (const value of this) {
      if (fn(value, this)) filtered.add(value);
    }
    return filtered;
  }

  find(fn) {
    for (const value of this) {
      if (fn(value, this)) return value;
    }
    return undefined;
  }

  map(fn) {
    const mapped = Array(this.size);
    let i = 0;
    for (const value of this) {
      mapped[i++] = fn(value, this);
    }
    return mapped;
  }

  mapValues(fn) {
    const mapped = new this.constructor();
    for (const value of this) {
      mapped.add(fn(value, this));
    }
    return mapped;
  }

  reduce(fn, initial) {
    let reduced = initial;
    for (const value of this) {
      reduced = fn(reduced, value, this);
    }
    return reduced;
  }

  some(fn) {
    for (const value of this) {
      if (fn(value, this)) return true;
    }
    return false;
  }

  subtract(other) {
    const diff = this.clone();
    for (const value of other) {
      if (this.has(value)) diff.delete(value);
    }
    return diff;
  }

  sweep(fn) {
    let count = 0;
    for (const value of this) {
      if (fn(value, this)) {
        this.delete(value);
        count++;
      }
    }
    return count;
  }

  tap(fn) {
    fn(this);
    return this;
  }

  toJSON() {
    return [...this];
  }
}

module.exports = {
  UMap,
  USet,
}
