import { Canvas, Circle, useCanvasRef } from "@shopify/react-native-skia";
import { Dimensions, SafeAreaView, StyleSheet, Text } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Food, MoveEnum, SnakeSegment } from "./types";
import { canEatFood, generateFood } from "./utils/food";
import { useEffect, useState } from "react";

const dimensions = Dimensions.get("window");
const WIDTH = dimensions.width;
const HEIGHT = dimensions.height - 100;
const FRAME_INTERVAL = 1000 / 60;
const TOLERANCE = 0.1;
const RADIUS = 13;
const INTIAL_SNAKE: Array<SnakeSegment> = [{ x: 5, y: RADIUS, pos: 1 }];
let lastRenderTime = performance.now();

export default function App() {
  const canvasRef = useCanvasRef();
  const [snakePos, setSnakePos] = useState<Array<SnakeSegment>>(INTIAL_SNAKE);
  const [food, setFood] = useState<Food>(
    generateFood(snakePos, WIDTH - 10, HEIGHT - 10, RADIUS),
  );
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
          const newHeads: SnakeSegment[] = new Array(3)
            .fill(0)
            .map((_, index) => {
              const copyHead = {
                x: head.x,
                y: head.y,
                pos: oldSnakePos.length + 1 + index,
              };
              if (move === MoveEnum.Up) {
                copyHead.y -= RADIUS * 0.25 * Math.abs(3 - index);
              } else if (move === MoveEnum.Down) {
                copyHead.y += RADIUS * 0.25 * Math.abs(3 - index);
              } else if (move === MoveEnum.Left) {
                copyHead.x -= RADIUS * 0.25 * Math.abs(3 - index);
              } else {
                copyHead.x += RADIUS * 0.25 * Math.abs(3 - index);
              }
              return copyHead;
            });

          const newHead = newHeads.at(-1);

          // collision
          const col = oldSnakePos.findIndex(
            (seg) => seg.x === newHead.x && seg.y === newHead.y,
          );
          const col2 =
            newHead.x < 0 - RADIUS ||
            newHead.x + RADIUS > WIDTH ||
            newHead.y < 0 - RADIUS ||
            newHead.y + RADIUS > HEIGHT;

          if (col2 || (col !== -1 && col !== oldSnakePos.length - 1)) {
            setGameOver(true);
            return oldSnakePos;
          }

          if (canEatFood(newHead, food, RADIUS)) {
            const newSnake = newHeads.concat(oldSnakePos);
            setFood(generateFood(newSnake, WIDTH - 10, HEIGHT - 10, RADIUS));
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

  const pan = Gesture.Pan().onEnd((event) => {
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
            {snakePos.map((seg) => {
              return (
                <Circle
                  key={JSON.stringify(seg)}
                  cx={seg.x + RADIUS}
                  cy={seg.y + RADIUS}
                  r={RADIUS}
                />
              );
            })}
            <Circle
              cx={food.x + RADIUS}
              cy={food.y + RADIUS}
              r={RADIUS}
              color="red"
            />
          </Canvas>
        </GestureDetector>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#ddd",
  },
  gameStatus: {
    padding: 10,
    fontSize: 20,
    color: "#fff",
  },
});
