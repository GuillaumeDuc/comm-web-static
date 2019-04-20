window.onload = function() {
  class Puissance4 {
    constructor(element_id, depth, rows = 6, cols = 7) {
      this.rows = rows;
      this.cols = cols;
      this.depth = depth;
      this.board = Array(this.rows);
      for (let i = 0; i < this.rows; i++) {
        this.board[i] = Array(this.cols).fill(0);
      }
      this.turn = 1;
      this.winner = null;

      this.element = document.querySelector(element_id);
      this.element.addEventListener("click", event => this.handle_click(event));
      this.render();
    }

    render() {
      let table = document.createElement("table");
      for (let i = this.rows - 1; i >= 0; i--) {
        let tr = table.appendChild(document.createElement("tr"));
        for (let j = 0; j < this.cols; j++) {
          let td = tr.appendChild(document.createElement("td"));
          let colour = this.board[i][j];
          if (colour) td.className = "player" + colour;
          td.dataset.column = j;
        }
      }
      this.element.innerHTML = "";
      this.element.appendChild(table);
    }

    set(row, column, player, board) {
      board[row][column] = player;
    }

    play(column, board, turn) {
      let row;
      for (let i = 0; i < this.rows; i++) {
        if (board[i][column] == 0) {
          row = i;
          break;
        }
      }
      if (row === undefined) {
        return null;
      } else {
        this.set(row, column, turn, board);
        return row;
      }
    }

    cloneBoard(board) {
      let arrayCloned = [];
      for (let row = 0; row < this.rows; row++) {
        arrayCloned.push(board[row].slice());
      }
      return arrayCloned;
    }

    min(node1, node2) {
      return node1.value > node2.value ? node2 : node1;
    }

    max(node1, node2) {
      return node1.value > node2.value ? node1 : node2;
    }

    minimax(node, depth, maximizingPlayer) {
      if (depth === 0 || !node.child.length) {
        return node;
      }
      if (maximizingPlayer === 2) {
        let value = { column: -1, value: -10000000 };
        node.child.forEach(child => {
          value = this.max(
            value,
            this.minimax(child, depth - 1, 3 - maximizingPlayer)
          );
        });
        return value;
      } /*minimizing player*/ else {
        let value = { column: -1, value: 10000000 };
        node.child.forEach(child => {
          child.value = -child.value;
          value = this.min(
            value,
            this.minimax(child, depth - 1, 3 - maximizingPlayer)
          );
        });
        value.column = node.column;
        return value;
      }
    }

    createNodes(node, currentDepth, depth, board, turn) {
      if (currentDepth < depth) {
        if (node.value < 10000) {
          for (let column = 0; column < this.cols; column++) {
            let newNode = { column, value: 0, currentDepth, child: [] };
            let newBoard = this.cloneBoard(board);
            let row = this.play(column, newBoard, turn);
            if (row !== null) {
              let value = this.getValueBoard(
                newBoard,
                turn,
                row,
                column,
                currentDepth
              );
              newNode.value = value;
              node.child.push(newNode);
            }
            this.createNodes(
              newNode,
              currentDepth + 1,
              depth,
              newBoard,
              3 - turn
            );
          }
        }
      }
    }

    createTree(depth) {
      let root = {
        column: 0,
        value: 0,
        depth: "root",
        child: []
      };
      this.createNodes(root, 0, depth, this.board, this.turn);
      return root;
    }

    getValueBoard(board, player, depth) {
      let value = 0;

      for (let row = 0; row < this.rows; row++) {
        for (let column = 0; column < this.cols; column++) {
          if (board[row][column] !== 0) {
            // Horizontal
            for (let j = 0; j < this.cols; j++) {
              value = board[row][j] == player ? value + 1 : value;
            }
            // Vertical
            for (let i = 0; i < this.rows; i++) {
              value = board[i][column] == player ? value + 1 : value;
            }
            // Diagonal
            let shift = row - column;
            for (
              let i = Math.max(shift, 0);
              i < Math.min(this.rows, this.cols + shift);
              i++
            ) {
              value = board[i][i - shift] == player ? value + 1 : value;
            }
            // Anti-diagonal
            shift = row + column;
            for (
              let i = Math.max(shift - this.cols + 1, 0);
              i < Math.min(this.rows, shift + 1);
              i++
            ) {
              value = board[i][shift - i] == player ? value + 1 : value;
            }

            let adversary = 3 - player;
            // Horizontal
            for (let j = 0; j < this.cols; j++) {
              value = board[row][j] == adversary ? value + 1 : value;
            }
            // Vertical
            for (let i = 0; i < this.rows; i++) {
              value = board[i][column] == adversary ? value + 1 : value;
            }
            // Diagonal
            shift = row - column;
            for (
              let i = Math.max(shift, 0);
              i < Math.min(this.rows, this.cols + shift);
              i++
            ) {
              value = board[i][i - shift] == adversary ? value + 1 : value;
            }
            // Anti-diagonal
            shift = row + column;
            for (
              let i = Math.max(shift - this.cols + 1, 0);
              i < Math.min(this.rows, shift + 1);
              i++
            ) {
              value = board[i][shift - i] == adversary ? value + 1 : value;
            }
          }

          if (this.win(board, row, column, player)) {
            return 1000000 / (depth + 1);
          }
        }
      }

      return value;
    }

    playAuto(depth) {
      let root = this.createTree(depth);
      let bestYellowPlay = this.minimax(root, depth, this.turn);
      let rowYellow = this.play(bestYellowPlay.column, this.board, this.turn);
      if (this.win(this.board, rowYellow, bestYellowPlay.column, this.turn)) {
        this.winner = this.turn;
      }
      this.turn = 3 - this.turn;

      this.render();

      switch (this.winner) {
        case 0:
          window.alert("Null");
          break;
        case 1:
          window.alert("Gagner !");
          break;
        case 2:
          window.alert("Perdu !");
          break;
      }
    }

    displayWinner(text) {
      let displayWinner = document.getElementById("displayWinner");
      displayWinner.innerHTML = text;
    }

    handle_click(event) {
      if (this.winner !== null) {
        this.reset();
      }

      let column = event.target.dataset.column;
      if (column !== undefined) {
        column = parseInt(column);
        let row = this.play(parseInt(column), this.board, this.turn);

        if (row === null) {
          window.alert("Column is full!");
        } else {
          if (this.win(this.board, row, column, this.turn)) {
            this.winner = this.turn;
          }
          this.turn = 3 - this.turn;

          this.render();

          switch (this.winner) {
            case 0:
              window.alert("Null");
              break;
            case 1:
              window.alert("Gagner !");
              break;
            case 2:
              window.alert("Perdu !");
              break;
          }
        }
      }
      if (!this.winner) {
        this.playAuto(this.depth);
      }
    }

    win(board, row, column, player) {
      // Horizontal
      let count = 0;
      for (let j = 0; j < this.cols; j++) {
        count = board[row][j] == player ? count + 1 : 0;
        if (count >= 4) return true;
      }
      // Vertical
      count = 0;
      for (let i = 0; i < this.rows; i++) {
        count = board[i][column] == player ? count + 1 : 0;
        if (count >= 4) return true;
      }
      // Diagonal
      count = 0;
      let shift = row - column;
      for (
        let i = Math.max(shift, 0);
        i < Math.min(this.rows, this.cols + shift);
        i++
      ) {
        count = board[i][i - shift] == player ? count + 1 : 0;
        if (count >= 4) return true;
      }
      // Anti-diagonal
      count = 0;
      shift = row + column;
      for (
        let i = Math.max(shift - this.cols + 1, 0);
        i < Math.min(this.rows, shift + 1);
        i++
      ) {
        count = board[i][shift - i] == player ? count + 1 : 0;
        if (count >= 4) return true;
      }

      return false;
    }

    reset() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.board[i][j] = 0;
        }
      }
      this.move = 0;
      this.winner = null;
    }
  }

  function newGame(depth) {
    let p4 = new Puissance4("#game", depth);
    p4.reset();
    let selection = document.getElementById("selection");
    selection.style.display = "none";
    let game = document.getElementById("game");
    game.style.display = "block";
    let retry = document.getElementById("retry");
    retry.style.display = "inline-block";
  }

  function retryGame() {
    let selection = document.getElementById("selection");
    selection.style.display = "flex";
    let game = document.getElementById("game");
    game.style.display = "none";
    let retry = document.getElementById("retry");
    retry.style.display = "none";
  }

  let easy = document.getElementById("easy");
  easy.addEventListener("click", event => newGame(1));
  let medium = document.getElementById("medium");
  medium.addEventListener("click", event => newGame(3));
  let hard = document.getElementById("hard");
  hard.addEventListener("click", event => newGame(5));

  let retry = document.getElementById("retry");
  retry.addEventListener("click", event => retryGame());
};
