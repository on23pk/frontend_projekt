enum Direction {
    Up,
    Down,
    Left,
    Right
}

interface Position {
    x: number;
    y: number;
}

class Snake {
    private body: Position[];
    private direction: Direction;
    private gridSize: number;
    private food!: Position;
    private score: number;

    constructor(gridSize: number) {
        this.gridSize = gridSize;
        this.direction = Direction.Right;
        this.body = [{ x: 5, y: 5 }]; // Startposition der Schlange
        this.score = 0;
        this.generateFood();
    }

    private generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
        };

        // Stellen sicher, dass das Essen nicht auf der Schlange erscheint
        for (const segment of this.body) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.generateFood();
                break;
            }
        }
    }

    move() {
        const head = { ...this.body[0] };
        switch (this.direction) {
            case Direction.Up:
                head.y = (head.y - 1 + this.gridSize) % this.gridSize;
                break;
            case Direction.Down:
                head.y = (head.y + 1) % this.gridSize;
                break;
            case Direction.Left:
                head.x = (head.x - 1 + this.gridSize) % this.gridSize;
                break;
            case Direction.Right:
                head.x = (head.x + 1) % this.gridSize;
                break;
        }

        // // Kollisionserkennung mit Essen
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.body.unshift(head);
            this.generateFood();
        } else {
            this.body.pop();
            this.body.unshift(head);
        }
    }

    changeDirection(newDirection: Direction) {
        if (this.isOppositeDirection(newDirection, this.direction)) return;
        this.direction = newDirection;
    }

    private isOppositeDirection(dir1: Direction, dir2: Direction): boolean {
        return Math.abs(dir1 - dir2) === 2;
    }

    getBody(): Position[] {
        return this.body;
    }

    getFood(): Position {
        return this.food;
    }

    getScore(): number {
        return this.score;
    }

    isCollided(): boolean {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].x === head.x && this.body[i].y === head.y) {
                return true;
            }
        }
        return false;
    }
}

class Game {
    private gridSize: number;
    private snake: Snake;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private cellSize: number;
    private gameRunning: boolean;
    private highScore: number;

    constructor(gridSize: number, cellSize: number) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.gridSize * this.cellSize;
        this.canvas.height = this.gridSize * this.cellSize;
        this.ctx = this.canvas.getContext('2d')!;
        document.body.appendChild(this.canvas);
        this.snake = new Snake(this.gridSize);
        this.gameRunning = false;
        this.highScore = 0;

        this.setupInput();
        this.run();
    }

    private setupInput() {
        window.addEventListener('keydown', (e) => {
            if (!this.gameRunning) {
                if (e.key === 'Enter') {
                    this.startGame();
                }
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                    this.snake.changeDirection(Direction.Up);
                    break;
                case 'ArrowDown':
                    this.snake.changeDirection(Direction.Down);
                    break;
                case 'ArrowLeft':
                    this.snake.changeDirection(Direction.Left);
                    break;
                case 'ArrowRight':
                    this.snake.changeDirection(Direction.Right);
                    break;
            }
        });
    }

    private drawCell(position: Position, color: string) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(position.x * this.cellSize, position.y * this.cellSize, this.cellSize, this.cellSize);
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const snakeBody = this.snake.getBody();
        snakeBody.forEach(segment => {
            this.drawCell(segment, 'green');
        });

        const food = this.snake.getFood();
        this.drawCell(food, 'red');

        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.snake.getScore()}`, 10, 30);
    }

    private update() {
        this.snake.move();
        if (this.snake.isCollided()) {
            this.endGame();
        }
    }

    private run() {
        setInterval(() => {
            if (this.gameRunning) {
                this.update();
                this.draw();
            }
        }, 100);
    }

    private startGame() {
        this.snake = new Snake(this.gridSize);
        this.gameRunning = true;
        alert(`Press Enter to start the Game!`);
    }

    private endGame() {
        this.gameRunning = false;
        this.highScore = Math.max(this.highScore, this.snake.getScore());
        alert(`Game Over! Your score: ${this.snake.getScore()}, High Score: ${this.highScore}`);
        this.snake = new Snake(this.gridSize);
    }
}

const game = new Game(20, 20);