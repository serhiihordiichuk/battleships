import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private _MATRIX_SIZE = 10;
  private _SHIPS = [5, 4, 4];

  ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  board: number[][] = []; // 8 - empty field, 1 - ship, 0 - missed, -1 - sink
  locations: any[] = [];

  isCheatingEnabled = false;
  inProgress = false;
  log: string = '';
  attempts = 0;

  shootingForm = this._formBuilder.group({
    location: ['', [Validators.required]],
  });

  constructor(
    private _formBuilder: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.onCreateBoard();
  }

  onCreateBoard() {
    this.board = Array.from({length: this._MATRIX_SIZE}, () => Array.from({length: this._MATRIX_SIZE}, () => 8));
  }

  onStartGame() {
    this.locations = [];
    this.inProgress = true;
    this.log = '';
    this.attempts = 0;
    this.onCreateBoard();
    for (let size of this._SHIPS) {
      while (this.locations.length < this._SHIPS.length) {
        let isHorizontal = Math.random() < 0.5;
        let x = Math.floor(Math.random() * (this._MATRIX_SIZE - (isHorizontal ? size - 1 : 1)));
        let y = Math.floor(Math.random() * (this._MATRIX_SIZE - (isHorizontal ? 1 : size - 1)));

        const filtered = this.board.slice(y < 1 ? 0 : y - 1, isHorizontal ? y + 2 : y + 1 + size).some(row => row.slice(x < 1 ? 0 : x - 1, isHorizontal ? x + 1 + size : x + 2).some(cell => cell !== 8));

        if (!filtered) {
          const coordinates = [];
          for (let i = 0; i < size; i++) {
            const lx = x + (isHorizontal ? i : 0);
            const ly = y + (isHorizontal ? 0 : i);
            coordinates.push([lx, ly]);
            this.board[ly][lx] = 1;
          }
          this.locations.push({isHorizontal, x, y, size, coordinates});
          break;
        }
      }
    }
  }

  onSelectLocation(x: number, y: number) {
    this.shootingForm.patchValue({location: this.ROWS[y] + (x + 1)});
  }

  onShoot() {
    let {x, y} = this.decodePosition();

    if (x == undefined || y == undefined) {
      return;
    }

    this.attempts++;
    if (this.board[y][x] === 1) {
      this.board[y][x] = -1;

      for (let i = 0; i < this.locations.length; i++) {
        let {coordinates} = this.locations[i];

        if (coordinates.some((array: number[]) => (array[0] === x && array[1] === y))) {
          this.locations[i].size--;
          if (this.locations[i].size === 0) {
            this.log = 'You sank a battleship!'
            this.locations.splice(i, 1);

            if (!this.locations.length) {
              this.inProgress = false;
              this.log = `Game Over. You Win! Score: ${this._MATRIX_SIZE * this._MATRIX_SIZE - this.attempts}`
            }
          } else {
            this.log = 'You hit a ship!'
          }
          break;
        }
      }
    } else if (this.board[y][x] === 8) {
      this.board[y][x] = 0;
      console.log('You missed.');
      this.log = 'You missed.'
    } else {
      console.log('You already fired at that position.');
      this.log = 'You already fired at that position.'
    }

    this.shootingForm.reset();
  }

  decodePosition() {
    const input = this.shootingForm.value.location;
    let x = input!.charCodeAt(0) - 65;
    let y = parseInt(input!.slice(1)) - 1;

    if (0 <= x && x < this._MATRIX_SIZE && 0 <= y && y < this._MATRIX_SIZE) {
      return {x, y};
    } else {
      alert('Invalid coordinates. Try again.');
      this.log = 'Invalid coordinates. Try again.'
      return {};
    }
  }
}
