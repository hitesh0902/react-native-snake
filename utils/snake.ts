import { MoveEnum, SnakeSegment } from "../types";

export function generateInitialSnakeSegments(
  width: number,
  height: number,
  move: MoveEnum,
): SnakeSegment[] {
  const snakeSegments: SnakeSegment[] = [];
  let x = Math.floor(Math.random() * width);
  let y = Math.floor(Math.random() * height);
  if (move === MoveEnum.Up) {
    y += 100;
  } else if (move === MoveEnum.Down) {
    y -= 100;
  } else if (move === MoveEnum.Left) {
    x += 100;
  } else {
    x -= 100;
  }
  snakeSegments.push({ x: x, y, pos: snakeSegments.length + 1 });
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

export function generateNextSnakeSegments(
  oldSnake: SnakeSegment[],
  newHead: SnakeSegment,
): SnakeSegment[] {
  const segments = new Array(oldSnake.length);
  for (let i = 0; i < segments.length; i++) {
    if (i === 0) {
      segments[i] = newHead;
    } else {
      segments[i] = oldSnake[i - 1];
    }
  }
  return segments;
}

const _moves = Object.values(MoveEnum);
export function generateMove(): MoveEnum {
  const index = Math.floor(Math.random() * _moves.length);
  return _moves[index];
}
