import { Food, SnakeSegment } from "../types";

function validFoodPos(
  food: Food,
  snake: SnakeSegment[],
  width: number,
  height: number,
): boolean {
  if (!food) {
    return false;
  }
  if (food.x < 0 || food.x > width || food.y < 0 || food.y > height) {
    return false;
  }
  for (let seg of snake) {
    if (seg.x === food.x || seg.y === food.y) {
      return false;
    }
  }
  return true;
}

export function canEatFood(
  snakeHead: SnakeSegment,
  food: Food,
  radius: number,
): boolean {
  const distanceBetweenFoodAndSnakeX: number = Math.abs(snakeHead.x - food.x);
  const distanceBetweenFoodAndSnakeY: number = Math.abs(snakeHead.y - food.y);
  return (
    distanceBetweenFoodAndSnakeX < radius &&
    distanceBetweenFoodAndSnakeY < radius
  );
}

export function generateFood(
  snake: SnakeSegment[],
  width: number,
  height: number,
  radius: number,
): Food {
  let food: Food;
  while (!food || !validFoodPos(food, snake, width, height)) {
    const x = Math.floor(Math.random() * width - radius);
    const y = Math.floor(Math.random() * height - radius);
    if (food) {
      food.x = x;
      food.y = y;
    } else {
      food = { x, y };
    }
  }
  return food;
}
