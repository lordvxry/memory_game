let game;
const numCards = 4;
const maxImageWidth = 256 / 2;
const maxImageHeight = 320 / 2;
const offsetX = 10;
const gameHeight = maxImageHeight * numCards + offsetX * 2;

window.onload = function () {
  const config = {
    width: maxImageWidth * numCards + offsetX * 2,
    height: gameHeight,
    backgroundColor: 0xd0d0d0,
    scene: [BootScene, PlayGameScene],
  };

  game = new Phaser.Game(config);

  window.focus();
};

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image("cardBack", "src/assets/images/cardBack.png");
    this.load.image("react", "src/assets/images/react.png");
    this.load.image("angular", "src/assets/images/angular.png");
    this.load.image("php", "src/assets/images/php.png");
    this.load.image("vue", "src/assets/images/vue.png");
    this.load.image("c++", "src/assets/images/c++.png");
    this.load.image("html", "src/assets/images/html.png");
    this.load.image("java", "src/assets/images/java.png");
    this.load.image("js", "src/assets/images/js.png");
    this.load.audio("success", "src/assets/sounds/success.mp3");
    this.load.audio("lose", "src/assets/sounds/wilhelm_scream.mp3");
    this.load.audio("win", "src/assets/sounds/win.mp3");
  }

  create() {
    this.scene.start("PlayGameScene");
  }
}

class PlayGameScene extends Phaser.Scene {
  constructor() {
    super("PlayGameScene");
  }

  create() {
    this.numMatches = 0;
    this.canMove = true;
    this.chosenCards = [];

    const { width, height } = game.config;

    let x = width / 2;
    let y = maxImageHeight / 2 + offsetX;

    const evenCardsArray = ["react", "angular", "php", "js"];
    const oddCardsArray = ["java", "html", "c++", "vue"];

    let shuffleArray = [];
    for (let row = 0; row < 4; row++) {
      shuffleArray[row] = [];

      const isOddRow = Boolean(row % 2);

      for (let col = 0; col < 4; col++) {
        const currentCard = isOddRow ? oddCardsArray[col] : evenCardsArray[col];

        shuffleArray[row][col] = currentCard;
      }
    }

    for (let n = 0; n < 100; n++) {
      const rowA = Phaser.Math.Between(0, 3);
      const colA = Phaser.Math.Between(0, numCards - 1);

      const rowB = Phaser.Math.Between(0, 3);
      const colB = Phaser.Math.Between(0, numCards - 1);

      const temp = shuffleArray[rowA][colA];
      shuffleArray[rowA][colA] = shuffleArray[rowB][colB];
      shuffleArray[rowB][colB] = temp;
    }

    this.boardArray = [];

    for (let row = 0; row < 4; row++) {
      this.boardArray[row] = [];

      for (let col = 0; col < numCards; col++) {
        const cardValue = shuffleArray[row][col];

        x = offsetX + maxImageWidth * col + maxImageWidth / 2;

        const cardBack = this.add.image(x, y, "cardBack");
        cardBack.setScale(0.49);
        cardBack.alpha = 0;
        cardBack.depth = 20;

        const card = this.add.image(x, y, cardValue);
        card.setScale(0.5);
        card.depth = 10;

        this.boardArray[row][col] = {
          cardSelected: true,
          cardValue: shuffleArray[row][col],
          cardBackSprite: cardBack,
        };
      }

      y += maxImageHeight;
    }

    this.time.addEvent({
      delay: 5000,
      callbackScope: this,
      callback: function () {
        this.boardArray.forEach((array) => {
          array.forEach((card) => {
            card.cardSelected = false;
            card.cardBackSprite.alpha = 1;
          });
        });
      },
    });

    this.input.on("pointerdown", this.handleMouseDown, this);

    this.successSound = this.sound.add("success", { volume: 0.5 });
    this.loseSound = this.sound.add("lose");
    this.winSound = this.sound.add("win");
  }

  handleMouseDown(mousePointer) {
    if (!this.canMove) return;

    const row = Math.floor(mousePointer.y / (gameHeight / 4));
    const col = Math.floor((mousePointer.x - offsetX) / maxImageWidth);

    const obj = this.boardArray[row][col];

    if (obj.cardSelected == true) return;

    obj.cardBackSprite.alpha = 0;
    obj.cardSelected = true;

    this.chosenCards.push(obj);

    if (this.chosenCards.length > 1) {
      this.canMove = false;

      const [{ cardValue: firstCardName }, { cardValue: secondCardName }] =
        this.chosenCards;

      if (firstCardName == secondCardName) {
        this.successSound.play();

        this.chosenCards = [];
        this.numMatches++;
        this.canMove = true;
      } else {
        this.loseSound.play();

        this.time.addEvent({
          delay: 2000,
          callbackScope: this,
          callback: function () {
            this.chosenCards.forEach((card) => {
              card.cardBackSprite.alpha = 1;
              card.cardSelected = false;
            });
            this.chosenCards = [];
            this.canMove = true;
          },
        });
      }
    }

    if (this.numMatches == 8) {
      this.winSound.play();
      this.time.addEvent({
        delay: 2000,
        callbackScope: this,
        callback: function () {
          this.scene.start("PlayGameScene");
        },
      });
    }
  }
}
