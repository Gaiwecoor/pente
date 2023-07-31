const { nanoid } = require("nanoid");
const { UMap, USet } = require("./utils");

function l(x, y) {
  return `${x},${y}`;
};

class PenteGame {
  constructor(data = {}) {
    this.id = data?.id || nanoid();
    this.players = data?.players || [];
    this.currentIndex = data?.currentIndex;
    this.stones = new UMap(data?.stones);
    this.colors = data?.colors || ["white", "black", "red", "blue", "yellow", "green"];
  }

  addPlayer({ name, id }) {
    this.players.push(new Player({ name, id }));
    return this;
  }

  capture(stone) {
    const toRemove = new USet();
    const { x, y, color } = stone;
    const player = this.players.find(({ color: playerColor }) => playerColor === color);
    const deltas = [
      [ 0, 1 ],
      [ 1, 1 ],
      [ 1, 0 ],
      [ 1, -1 ],
      [ 0, -1 ],
      [ -1, -1 ],
      [ -1, 0 ],
      [ -1, 1 ],
    ];
    for (const [ dx, dy ] of deltas) {
      const s = [1, 2, 3].map(d => l(x + (d * dx), y + (d * dy)));
      if (
        (this.stones.has(s[0]) && (this.stones.get(s[0]).color !== color)) &&
        (this.stones.has(s[1]) && (this.stones.get(s[1]).color !== color)) &&
        (this.stones.has(s[2]) && (this.stones.get(s[2]).color === color))
      ) {
        for (let i = 0; i < 2; i++) {
          let captured = this.stones.get(s[i]);
          toRemove.add(captured);
          this.remove(captured);
          player.captured.add(captured);
        }
      }
    }

    return toRemove;
  }

  checkSequence(stone) {
    const { x, y, color } = stone;
    const player = this.players.find(({ color: playerColor }) => playerColor === color);
    const deltas = [
      [ 0, 1 ],
      [ 1, 1 ],
      [ 1, 0 ],
      [ 1, -1 ],
    ];

    for (const [ dx, dy ] of deltas) {
      let count = 1;
      let i = 1;
      let xi = x;
      let yi = y;
      let next;
      while ((next = this.stones.get(l(x + (i * dx), y + (i * dy)))) && (next?.color === color)) {
        count++; i++;
      }
      i = 1;
      while ((next = this.stones.get(l(x - (i * dx), y - (i * dy)))) && (next?.color === color)) {
        count++; i++;
      }
      if (count >= 5) return true;
    }
    return false;
  }

  get currentId() {
    return this.players[this.currentIndex].id;
  }

  get currentPlayer() {
    return this.players[this.currentIndex];
  }

  place({ x, y, color }) {
    color = color || this.currentPlayer.color;
    const stone = new Stone({ x, y, color });
    this.stones.set(stone.location, stone);
    return stone;
  }

  remove(stone, index) {
    this.stones.delete(stone.location);
    return this;
  }

  start() {
    const count = this.players.length;
    if (count < 2) return this;
    if (count == 2) {
      this.colors = this.colors.slice(0, 2);
    } else {
      this.colors = this.colors.slice(2, 2 + count);
    }

    for (let i = 0; i < count; i++) {
      this.players[i].color = this.colors[i];
    }

    this.currentIndex = Math.floor(Math.random() * this.players.length);

    return this;
  }
}

class Player {
  constructor({ name, id, color, captured }) {
    this.name = name;
    this.id = id || nanoid();
    this.color = color;
    this.captured = new USet(captured);
  }
}

class Stone {
  constructor({ x, y, color }) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  get location() {
    return `${this.x},${this.y}`;
  }
}

module.exports = {
  PenteGame,
  Player,
  Stone,
};
