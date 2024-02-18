export type Food = {
  x: number;
  y: number;
};

export type SnakeSegment = {
  x: number;
  y: number;
  pos: number;
};

export enum MoveEnum {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
