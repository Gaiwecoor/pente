class PenteGame {
  constructor(data = {}) {
    this.id = data?.id;
    this.players = data?.players?.map(p => new Player(p));
    this.currentIndex = data?.currentIndex;
    this.stones = new Map(data?.stones);
    this.colors = data?.colors || ["white", "black", "red", "blue", "yellow", "green"];
  }

  addStone(stone) {
    stone = new Stone(stone);
    gameState.stones.set(stone.location, stone);
    $("#board").append(stone.element);
  }

  get currentId() {
    return this.players[this.currentIndex].id;
  }

  get currentPlayer() {
    return this.players[this.currentIndex];
  }

  removeStone(stone, index) {
    stone = new Stone(stone);
    gameState.stones.delete(stone.location);
    if (index !== undefined) gameState.players[index].captured.add(stone);
    $(stone.selector).remove();
  }

  newTurn(currentIndex) {
    gameState.currentIndex = currentIndex;
    $("#currentPlayer").html(`Current Turn: ${gameState.currentPlayer?.name || "None"}`);
  }

  victory(player) {
    $("#playerName").after(`<h3>${player.name} wins!</h3>`);
  }
}

class Player {
  constructor({ name, id, color, captured }) {
    this.name = name;
    this.id = id;
    this.color = color;
    this.captured = new Set(captured);
  }
}

class Stone {
  constructor({ x, y, color }) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  get element() {
    return `<div class="stone" data-color="${this.color}" data-x="${this.x}" data-y="${this.y}"></div>`;
  }

  get location() {
    return `${this.x},${this.y}`;
  }

  get selector() {
    return `.stone[data-x="${this.x}"][data-y="${this.y}"]`;
  }
}

$(document).ready(() => {
  for (let y = 0; y < 19; y++) {
    let vert = "c";
    if (y == 0) vert = "t";
    else if (y == 18) vert = "b";
    for (let x = 0; x < 19; x++) {
      let horiz = "c";
      if (x == 0) horiz = "l";
      if (x == 18) horiz = "r";

      $("#board").append(`<div class="tile board-${vert}${horiz}" data-x="${x}" data-y="${y}"></div>`);
    }
  }

  $(".tile").on("click", ({ target }) => {
    if (gameState.currentId == myId) {
      const { x, y } = $(target)[0].dataset;
      socket.emit("placeStone", { x, y });
    }
  });
});

const socket = io();
let myId, gameState = new PenteGame();

socket.on("ready", ({ name, id }) => {
  myId = id;
  $("#playerName").html(name);
  socket.emit("join", "pente");
});

socket.on("gameUpdate", (game) => {
  game = new PenteGame(game);
  gameState = game;
  $(".stone").remove();
  for (const [ location, stone ] of game.stones) {
    game.addStone(stone);
  }
  game.newTurn(game.currentIndex);
});

socket.on("addStone", gameState.addStone);

socket.on("removeStone", gameState.removeStone);

socket.on("newTurn", gameState.newTurn);

socket.on("victory", gameState.victory);
