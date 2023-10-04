//*********** GENERATE MAZE *********************
// Create a grid of "cells"
// pick a random starting cell
// for that cell, build a randomly-ordered list of neighbors
// If a neighbor has been visited before, remove it from the list
// For each remaining neighbor, 'move' to it and remove the wall between these two cells
// repeat this for the new neighbor

// if get stuck with no new neighbors, back track

// Need to introduce more arrays: Verticals (to keep track of vertical walls) and Horizontals (to keep track of horizontal walls)
// True = no wall, False = wall

const { Engine, Render, Runner, World, Bodies } = Matter;

const cells = 3;
const width = 600;
const height = 600;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: true,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 40, height, { isStatic: true }),
];
World.add(world, walls);

// Maze Generation

const shuffle = (array) => {
  let counter = array.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temporary = array[counter];
    array[counter] = array[index];
    array[index] = temporary;
  }

  return array;
};
// Maze generation
//  const grid = [];

//  for (let i = 0; i< 3; i++) {
//     grid.push([]);
//     for (let j = 0; j<3; j++) {
//         grid[i].push(false);
//     }
//  }

//  console.log(grid)

// Buid 3x3 grid
const grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false));
// Build 3x2 grid
const verticals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));
// Build 2x3 grid
const horizontals = Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false));

// start at random starting point
const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const iterateThroughMaze = (row, column) => {
  // If I have visited the cell at [row,column], then return
  if (grid[row][column]) {
    return;
  }

  // Mark this cell as being visited in grid array (true)
  grid[row][column] = true;

  // Assemble randomly ordered list of neighbors
  // javascript has no ability to randomize items within an array. Create Shuffle function
  const neighbors = shuffle([
    // [row - 1, column, 'up'],
    // [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left'],
  ]);

  // for each neighbor...

  for (let neighbor of neighbors) {
    // don't go outside of boundaries
    const [nextRow, nextColumn, direction] = neighbor;

    // check to see if that neighbor is out of bounds (ie, off the grid)
    if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
      continue;
  }
    // check to see if we have visited that neighbor, continue to next neighbor
  if (grid[nextRow][nextColumn]) {
    continue;
  }

    // remove a wall from either horizontals or verticals array
    if (direction === 'left') {
        verticals[row][column -1] = true;
    } else if (direction === 'right') {
        verticals[row][column] = true;
    } else if (direction === 'up') {
        horizontals[row -1][column] = true;
    } else if (direction === 'down') {
        horizontals[row][column] = true;
    }
  }

  // Visit that next cell, call iterateThroughMaze again and enter current row,column
};

iterateThroughMaze(1, 1);
