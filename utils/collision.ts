import { SnakeSegment } from "../types";

export function collision(
  oldSnake: SnakeSegment[],
  newSnakeHead: SnakeSegment,
  width: number,
  height: number,
  foodBox: number,
): boolean {
  const boundaryCollision =
    newSnakeHead.x < 0 ||
    newSnakeHead.x + foodBox > width ||
    newSnakeHead.y < 0 ||
    newSnakeHead.y + foodBox > height;
  if (boundaryCollision) {
    return true;
  }
  const bodyCollision = oldSnake.findIndex(
    (seg) => seg.x === newSnakeHead.x && seg.y === newSnakeHead.y,
  );
  if (bodyCollision !== -1 && bodyCollision !== oldSnake.length - 1) {
    return true;
  }
  return false;
}
