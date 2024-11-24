<script lang="ts">
import { Bomb, Flag, Play, Shovel } from 'lucide-vue-next';

export default {
  components: {
    Bomb, Flag, Play, Shovel
  },
  data() {
    return {
      game: {
        game_state: "ongoing",
        dig_state: "dig",

        cells: [] as CellState[][],
        state: [] as CellState[][],

        rules: {
          dimensions: {
            x: 10,
            y: 10,
          },
          bomb_count: 20
        }
      }
    }
  },
  methods: {
    generate_new(x: number, y: number, bomb_count: number) {
      this.game.game_state = "ongoing"
      this.game.rules.bomb_count = bomb_count;
      this.game.rules.dimensions.x = x;
      this.game.rules.dimensions.y = y;
      this.game.cells = [];
      this.game.state = [];

      const dimensions = this.game.rules.dimensions;
      if (this.game.rules.bomb_count > dimensions.x * dimensions.y) return

      for (let y = 0; y < dimensions.y; y++) {
        this.game.cells[y] = []
        this.game.state[y] = []
        for (let x = 0; x < dimensions.x; x++) {
          this.game.state[y][x] = "UNKNOWN"
        }
      }

      function rand(max: number) { return Math.floor(Math.random() * max) }

      for (let b = 1; b <= this.game.rules.bomb_count; b++) {
        let random_pos = { x: rand(dimensions.x), y: rand(dimensions.y) }

        while (this.game.cells[random_pos.y][random_pos.x] == "BOMB") {
          random_pos = { x: rand(dimensions.x), y: rand(dimensions.y) }
        }
        this.game.cells[random_pos.y][random_pos.x] = "BOMB"
      }

      function count_bombs(cells: CellState[][], x_l: number, y_l: number): CellState {
        let count = 0;
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (cells[y + y_l] != undefined)
              if (cells[y + y_l][x + x_l] != undefined)
                if (cells[y + y_l][x + x_l] == "BOMB") count++

          }
        }
        return count as CellState
      }

      for (let y = 0; y < dimensions.y; y++) {
        for (let x = 0; x < dimensions.x; x++) {
          if (this.game.cells[y][x] != "BOMB") {
            this.game.cells[y][x] = count_bombs(this.game.cells, x, y)
          }
        }
      }
    },
    check_win() {

      if (this.game.state.every((e, y) =>
        e.every((f, x) =>
          (f == "FLAG" && this.game.cells[y][x] == "BOMB") ||
          f == this.game.cells[y][x]
        )
      )
      ) {
        this.game.game_state = "win"
      }
    },
    uncover(x: number, y: number) {
      if (this.game.state[y] == undefined || this.game.state[y][x] == undefined) return
      if (this.game.state[y][x] != "UNKNOWN") return;
      if (this.game.cells[y][x] == "BOMB") {
        this.game.state = this.game.cells;
        this.game.game_state = "lost"
        return;
      }

      this.game.state[y][x] = this.game.cells[y][x] as CellState

      if (this.game.state[y][x] == 0) {
        this.uncover(x - 1, y - 1)
        this.uncover(x - 1, y)
        this.uncover(x - 1, y + 1)

        this.uncover(x, y - 1)
        this.uncover(x, y + 1)

        this.uncover(x + 1, y - 1)
        this.uncover(x + 1, y)
        this.uncover(x + 1, y + 1)

      }
      this.check_win()
    },
    flag(x: number, y: number) {
      switch (this.game.state[y][x]) {
        case "UNKNOWN":
          this.game.state[y][x] = "FLAG";
          break;
        case "FLAG":
          this.game.state[y][x] = "UNKNOWN";
          break;
      }
      this.check_win()
    },
    trigger(x: number, y: number) {
      if (this.game.dig_state == "flag") this.flag(x, y)
      else this.uncover(x, y)

    },
    cssForState(state: CellState) {
      if (this.game.game_state == "win") return "transform: scale(1.1); background-color:lightgreen"
      if (state == "FLAG" || state == "BOMB") return "transform: scale(0.95);background-color:lightsalmon";
      if (state != "UNKNOWN") return "transform: scale(0.95);background-color:#888;";
      return ""
    },
  },
  beforeMount() {
    this.generate_new(5, 5, 2);
  },
  mounted() {
    document.addEventListener("keydown", (e) => {
      if (e.key == "f") this.game.dig_state = "flag"
      else if (e.key == "d") this.game.dig_state = "dig"
    })
  },
  beforeUnmount() {
    document.removeEventListener("keydown", (e) => {
      if (e.key == "f") this.game.dig_state = "flag"
      else if (e.key == "d") this.game.dig_state = "dig"
    })
  }
}
</script>

<template>
  <div class="dp-flex fd-c gap-4 ai-c jc-c h100">
    <h1>Level: {{ game.rules.dimensions.x - 4 }}</h1>
    <h2>Total Bomb Count: {{ game.rules.bomb_count }}</h2>
    <div class="dp-flex fd-c gap-1 ai-c jc-c" id="game-board">
      <div v-for="(row, y) in game.state" class="dp-flex gap-1">
        <div v-for="(cell, x) in row" @click="trigger(x, y)" class="cell dp-flex ai-c jc-c" clickable
          :style="cssForState(cell)">
          <Bomb v-if="cell == 'BOMB'" color="white" stroke-width="3" height="40%" width="40%" />
          <Flag v-else-if="cell == 'FLAG'" color="white" stroke-width="3" height="40%" width="40%" />
          <span v-else-if="cell != 'UNKNOWN'">{{ cell }}</span>

        </div>
      </div>
      <div class="dp-flex ai-c jc-c screen" id="win-screen" v-if="game.game_state == 'win'">
        <div class="dp-flex fd-c gap-1 ai-c">
          You Won!
          <Play stroke-width="3" clickable
            @click="generate_new(game.rules.dimensions.x + 1, game.rules.dimensions.y + 1, game.rules.bomb_count + 2)"
            color="black" />
        </div>
      </div>
      <div class="dp-flex ai-c jc-c screen" id="lost-screen" v-if="game.game_state == 'lost'">
        <div class="dp-flex fd-c gap-1 ai-c">
          You Died!
          <Play stroke-width="3" clickable @click="generate_new(5, 5, 2)" />
        </div>
      </div>
    </div>
    <div class="dp-flex gap-4 ai-c jc-c">
      <Shovel :color="game.dig_state == 'dig' ? 'black' : 'white'" height="3rem" width="3rem" clickable
        @click="game.dig_state = 'dig'"
        :style="game.dig_state == 'dig' ? 'background-color:white; padding:1rem; border-radius:1rem' : ''" />
      <Flag :color="game.dig_state == 'flag' ? 'black' : 'white'" height="3rem" width="3rem" clickable
        @click="game.dig_state = 'flag'"
        :style="game.dig_state == 'flag' ? 'background-color:white; padding:1rem; border-radius:1rem' : ''" />



    </div>
  </div>
</template>

<style scoped>
#game-board {
  position: relative;
}

.screen {
  position: absolute;
  width: calc(100% + 3rem);
  height: calc(100% + 3rem);
  backdrop-filter: brightness(0.5);
  border-radius: 1rem;

  & div {
    padding: 1rem;
    border-radius: 1rem;
    font-size: calc(min(80vw, 45vh) / (v-bind("game.rules.dimensions.x")) / 3);
  }
}

#win-screen {
  & div {
    background-color: lightgreen;
    color: black
  }
}

#lost-screen {
  & div {
    background-color: darkred;
    color: white
  }
}

.cell {
  width: calc(min(80vw, 45vh) / (v-bind("game.rules.dimensions.x")));
  height: calc(min(80vw, 45vh) / (v-bind("game.rules.dimensions.y")));
  background-color: #444;
  transition: .05s all ease-out;
  color: maroon;
  border-radius: 5px;

  & span {
    color: white;
    font-size: calc(min(80vw, 45vh) / (v-bind("game.rules.dimensions.x")) / 3);
    font-weight: bold;
  }

  &:hover {
    transform: scale(0.97);
  }
}
</style>