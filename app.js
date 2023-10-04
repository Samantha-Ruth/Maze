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

const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 20;
const cellsVertical = 14;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
// disable gravity
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
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

// Buid 3x3 grid
const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));
// Build 3x2 grid
// iterate over verticals at bottom of code
const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));
// Build 2x3 grid
// iterate over horizontals at the bottom of code:
const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

// start at random starting point
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

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
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  // for each neighbor...

  for (let neighbor of neighbors) {
    // don't go outside of boundaries
    const [nextRow, nextColumn, direction] = neighbor;

    // check to see if that neighbor is out of bounds (ie, off the grid)
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }
    // check to see if we have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // remove a wall from either horizontals or verticals array
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }

    iterateThroughMaze(nextRow, nextColumn);
  }

  // Visit that next cell, call iterateThroughMaze again and enter current row,column
};

iterateThroughMaze(startRow, startColumn);

// Iterating over horizontal walls, to CREATE MAZE

horizontals.forEach((row, rowIindex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIindex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        label: 'wall',
        isStatic: true,
        render: {
            fillStyle: 'purple'
        }
      }
    );
    World.add(world, wall);
  });
});

// Iterating over vertical walls, to CREATE MAZE

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
        render: {
            fillStyle: 'purple'
        }
      }
    );
    World.add(world, wall);
  });
});

// Find coordinates for middle of the goal; widgth - 1/2 of cell, height - 1/2 of cell
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    label: "goal",
    isStatic: true,
    render: {
        fillStyle: 'green'
    }
  }
);
World.add(world, goal);

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  unitLengthX / 2,
  unitLengthY / 2,
  ballRadius,
  // custom label for winning collision
  {
    label: "ball",
    render: {
        fillStyle: 'blue'
    }
  }
);
World.add(world, ball);
document.addEventListener("keydown", (event) => {
  // Find key code of letter keys. Use code as keyCode is deprecated
  var key = event.code || event.keyCode;
  // to move ball, look at current velocity and change it. Get the Body property to change properties of a shape and look at velocy
  const { x, y } = ball.velocity;

  if (key === "KeyW" || key === 87) {
    Body.setVelocity(ball, { x, y: y - 5 });
  } else if (key === "KeyD" || key === 68) {
    Body.setVelocity(ball, { x: x + 5, y });
  } else if (key === "KeyS" || key === 83) {
    Body.setVelocity(ball, { x, y: y + 5 });
  } else if (key === "KeyA" || key === 65) {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});

// Win Condition is a Detect collision event.  Pull Events out of Matter properties
Events.on(engine, "collisionStart", (event) => {
  // One single event object that matter.js owns. Constantly updating.
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      document.querySelector('.winner').classList.remove('hidden');
      // Turn gravity back on
      world.gravity.y = 1;
      // make walls fall down. Add label to vertical and horizontal walls, then iterate over walls
      world.bodies.forEach(body => {
        if(body.label === 'wall') {
            Body.setStatic(body, false);
        }
      })
    }
  });
});
