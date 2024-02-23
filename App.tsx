import {
  Canvas,
  ImageSVG,
  Oval,
  useCanvasRef,
} from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { Dimensions, SafeAreaView, StyleSheet, Text } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import FoodSVG from "./FoodSVG";
import { Food, MoveEnum, SnakeSegment } from "./types";
import { canEatFood, generateFood, generateSnakeSegments } from "./utils/food";

const dimensions = Dimensions.get("window");
const WIDTH = dimensions.width;
const HEIGHT = dimensions.height - 100;
const FRAME_INTERVAL = 1000 / 60;
const TOLERANCE = 0.1;
const FOOD_BOX = 25;
const INTIAL_SNAKE: Array<SnakeSegment> = generateSnakeSegments(WIDTH, HEIGHT);
const INITIAL_FOOD = generateFood(INTIAL_SNAKE, WIDTH, HEIGHT, FOOD_BOX);
const SNAKE_SEGMENT_FRAMES = new Array(3).fill(0);
let lastRenderTime = performance.now();

export default function App() {
  const canvasRef = useCanvasRef();
  const [snakePos, setSnakePos] = useState<Array<SnakeSegment>>(INTIAL_SNAKE);
  const [food, setFood] = useState<Food>(INITIAL_FOOD);
  const [move, setMove] = useState<MoveEnum>(MoveEnum.Right);
  const [gameOver, setGameOver] = useState<boolean>(false);

  useEffect(() => {
    let animationFrameId: number;

    const updateSnake = () => {
      const currentRenderTime = performance.now();
      const elapsed = currentRenderTime - lastRenderTime;

      if (elapsed >= FRAME_INTERVAL - TOLERANCE) {
        lastRenderTime = currentRenderTime - (elapsed % FRAME_INTERVAL);

        setSnakePos((oldSnakePos) => {
          const head = oldSnakePos[0];
          const newHeads: SnakeSegment[] = SNAKE_SEGMENT_FRAMES.map(
            (_, index, segments) => {
              const copyHead = {
                x: head.x,
                y: head.y,
                pos: oldSnakePos.length + 1 + index,
              };
              const newMove =
                FOOD_BOX * 0.125 * Math.abs(segments.length - index);

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
            },
          );

          const newHead = newHeads.at(-1);

          // collision
          const col = oldSnakePos.findIndex(
            (seg) => seg.x === newHead.x && seg.y === newHead.y,
          );
          const col2 =
            newHead.x < 0 ||
            newHead.x + FOOD_BOX > WIDTH ||
            newHead.y < 0 ||
            newHead.y + FOOD_BOX > HEIGHT;

          if (col2 || (col !== -1 && col !== oldSnakePos.length - 1)) {
            setGameOver(true);
            return oldSnakePos;
          }

          if (canEatFood(newHead, food, FOOD_BOX - 10)) {
            const newSnake = newHeads.concat(oldSnakePos);
            setFood(generateFood(newSnake, WIDTH, HEIGHT, FOOD_BOX));
            return newSnake;
          }

          return [newHead, ...oldSnakePos.slice(0, -1)];
        });
      }

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(updateSnake);
      }
    };

    if (!gameOver) {
      animationFrameId = requestAnimationFrame(updateSnake);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameOver, move, food]);

  const pan = Gesture.Pan().onStart((event) => {
    if (gameOver) return;

    const { translationX, translationY } = event;

    if (Math.abs(translationX) > Math.abs(translationY)) {
      if (move === MoveEnum.Left || move === MoveEnum.Right) return;
      if (translationX > 0) {
        setMove(MoveEnum.Right);
      } else {
        setMove(MoveEnum.Left);
      }
    } else {
      if (move === MoveEnum.Up || move === MoveEnum.Down) return;
      if (translationY > 0) {
        setMove(MoveEnum.Down);
      } else {
        setMove(MoveEnum.Up);
      }
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.gameStatus}>
        {gameOver ? "Game Over" : "Playing..."}
      </Text>
      <GestureHandlerRootView>
        <GestureDetector gesture={pan}>
          <Canvas ref={canvasRef} style={styles.canvas}>
            {snakePos.map((seg, index) => {
              if (index < 1) {
                return (
                  <Oval
                    key={JSON.stringify(seg)}
                    x={seg.x}
                    y={seg.y}
                    width={
                      move === MoveEnum.Left || move === MoveEnum.Right
                        ? 25
                        : 20
                    }
                    height={
                      move === MoveEnum.Up || move === MoveEnum.Down ? 25 : 20
                    }
                    color={styles.snakeBody.color}
                  />
                );
              }

              return (
                <Oval
                  key={JSON.stringify(seg)}
                  x={seg.x + (isVerticalMove(move) ? 3.5 : 0)}
                  y={seg.y + (isHorizontalMove(move) ? 3.5 : 0)}
                  width={isHorizontalMove(move) ? 18 : 13}
                  height={isVerticalMove(move) ? 18 : 13}
                  color={styles.snakeBody.color}
                />
              );
            })}
            <ImageSVG
              svg={FoodSVG}
              width={FOOD_BOX}
              height={FOOD_BOX}
              x={food.x}
              y={food.y}
            />
          </Canvas>
        </GestureDetector>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

function isVerticalMove(move: MoveEnum) {
  return move === MoveEnum.Up || move === MoveEnum.Down;
}

function isHorizontalMove(move: MoveEnum) {
  return move === MoveEnum.Left || move === MoveEnum.Right;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#2B2B2B",
  },
  gameStatus: {
    padding: 16,
    fontSize: 22,
    color: "#fff",
  },
  snakeBody: {
    color: "#789461",
  },
});
