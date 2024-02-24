import { MoveEnum, SnakeSegment } from "../types";

export function generateInitialSnakeSegments(
  width: number,
  height: number,
): SnakeSegment[] {
  const snakeSegments: SnakeSegment[] = [];
  const x = Math.floor(Math.random() * width);
  const y = Math.floor(Math.random() * height);
  snakeSegments.push({ x, y, pos: snakeSegments.length + 1 });
  return snakeSegments;
}

export function generateSnakeSegments(
  oldSnake: SnakeSegment[],
  snakeSegmentFrames: number[],
  foodBox: number,
  move: MoveEnum,
) {
  const head = oldSnake[0];
  return snakeSegmentFrames.map((_, index, segments) => {
    const copyHead = {
      x: head.x,
      y: head.y,
      pos: oldSnake.length + 1 + index,
    };
    const newMove = foodBox * 0.125 * Math.abs(segments.length - index);

    if (move === MoveEnum.Up) {
      copyHead.y -= newMove;
    } else if (move === MoveEnum.Down) {
      copyHead.y += newMove;
    } else if (move === MoveEnum.Left) {
      copyHead.x -= newMove;
    } else {
      copyHead.x += newMove;
    }
    return copyHead;
  });
}

export function getSnakeSegmentKey(snakeSegment: SnakeSegment): string {
  return `x${snakeSegment.x}-y${snakeSegment.y}-p${snakeSegment.pos}`;
}
