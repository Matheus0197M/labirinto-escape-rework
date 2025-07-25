const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

const cols = 20;
const rows = 20;
const cellSize = 25;

canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

const playerImages = {};
const assassinImages = {};

const backgroundImage = new Image();
backgroundImage.src = 'https://i.postimg.cc/tC8JfFP3/fundo7.png';
let isBackgroundLoaded = false;

const exitImage = new Image();
exitImage.src = 'https://i.postimg.cc/pr4Wwt9W/portal100.gif';

let grid = [];
let current;
let stack = [];

let player = { x: 0, y: 0, direction: 'down' };
let exit = { x: 0, y: 0 };
let assassins = [];
let level = 1;
let assassinMovementInterval;

let playerDistanceMap = null;

backgroundImage.onload = () => {
    isBackgroundLoaded = true;
};
backgroundImage.onerror = () => {
    console.error("Erro ao carregar a imagem de fundo: https://i.postimg.cc/tC8JfFP3/fundo7.png");
};

exitImage.onload = () => {
    console.log("Imagem do portal carregada!");
};
exitImage.onerror = () => {
    console.error("Erro ao carregar a imagem do portal: https://i.postimg.cc/pr4Wwt9W/portal100.gif");
};

function loadImages() {
    return new Promise(resolve => {
        let imagesLoaded = 0;
        const totalImages = 8;

        const loadImage = (src, collection, name) => {
            const img = new Image();
            img.src = `assets/${src}`;
            img.onload = () => {
                collection[name] = img;
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    resolve();
                }
            };
            img.onerror = () => {
                console.error(`Erro ao carregar imagem de personagem: ${src}`);
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    resolve();
                }
            };
        };


        playerImages.left = loadImage("https://i.postimg.cc/PSLvtD4Q/player-left-Photoroom.png");
        playerImages.right = loadImage("https://i.postimg.cc/KzgbfBGQ/player-right-Photoroom.png");
        playerImages.up = loadImage("https://i.postimg.cc/cJxW5VFC/player-up-Photoroom.png");
        playerImages.down = loadImage("https://i.postimg.cc/V6FbPS1V/player-down-Photoroom.png");

        assassinImages.left = loadImage("https://i.postimg.cc/fPB3jEvF/vilain-left-Photoroom.png");
        assassinImages.right = loadImage("https://i.postimg.cc/Hs9Lremq/vilain-right-Photoroom.png");
        assassinImages.up = loadImage("https://i.postimg.cc/C1uwQH51/vilain-up-Photoroom.png");
        assassinImages.down = loadImage("https://i.postimg.cc/W4hgJ1tB/vilain-right-Photoroom.png");

    });
}

function initGame() {
    if (assassinMovementInterval) {
        clearInterval(assassinMovementInterval);
    }

    player.x = 0;
    player.y = 0;
    player.direction = 'down';

    exit.x = cols - 1;
    exit.y = rows - 1;

    playerDistanceMap = getDistanceMap(player.x, player.y).distances;

    assassins = [];
    const numberOfAssassins = Math.min(level, 7);
    for (let i = 0; i < numberOfAssassins; i++) {
        assassins.push(createAssassin());
    }

    // Altere esta linha para um valor fixo, removendo a dependência do 'level'
    assassinMovementInterval = setInterval(moveAssassins, 500); // O assassino terá sempre a mesma velocidade

    // A linha abaixo se torna redundante se você usar um valor fixo acima
    // if (assassinMovementInterval < 100) assassinMovementInterval = 100;

    drawAll();
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = [true, true, true, true];
        this.visited = false;
    }

    draw() {
        const x = this.x * cellSize;
        const y = this.y * cellSize;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        if (this.walls[0]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); ctx.stroke(); }
        if (this.walls[1]) { ctx.beginPath(); ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); ctx.stroke(); }
        if (this.walls[2]) { ctx.beginPath(); ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x, y + cellSize); ctx.stroke(); }
        if (this.walls[3]) { ctx.beginPath(); ctx.moveTo(x, y + cellSize); ctx.lineTo(x, y); ctx.stroke(); }
    }
}

function idx(x, y) {
    if (x < 0 || y < 0 || x >= cols || y >= rows) {
        return -1;
    }
    return x + y * cols;
}

function removeWalls(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    if (dx === 1) {
        a.walls[3] = false;
        b.walls[1] = false;
    } else if (dx === -1) {
        a.walls[1] = false;
        b.walls[3] = false;
    }

    if (dy === 1) {
        a.walls[0] = false;
        b.walls[2] = false;
    } else if (dy === -1) {
        a.walls[2] = false;
        b.walls[0] = false;
    }
}

function addExtraPaths(numPaths) {
    let wallsRemoved = 0;
    for (let attempts = 0; attempts < numPaths * 5 && wallsRemoved < numPaths; attempts++) {
        const randomCellIndex = Math.floor(Math.random() * grid.length);
        const cell = grid[randomCellIndex];

        const directions = [
            { dx: 0, dy: -1, wallIdx: 0, oppositeWallIdx: 2 },
            { dx: 1, dy: 0, wallIdx: 1, oppositeWallIdx: 3 },
            { dx: 0, dy: 1, wallIdx: 2, oppositeWallIdx: 0 },
            { dx: -1, dy: 0, wallIdx: 3, oppositeWallIdx: 1 }
        ];
        const shuffledDirections = directions.sort(() => 0.5 - Math.random());

        for (const { dx, dy, wallIdx, oppositeWallIdx } of shuffledDirections) {
            const neighborX = cell.x + dx;
            const neighborY = cell.y + dy;
            const neighborIdx = idx(neighborX, neighborY);

            if (neighborIdx !== -1 && cell.walls[wallIdx]) {
                const neighbor = grid[neighborIdx];
                cell.walls[wallIdx] = false;
                neighbor.walls[oppositeWallIdx] = false;
                wallsRemoved++;
                break;
            }
        }
    }
    console.log(`${wallsRemoved} atalhos adicionais criados.`);
}

function generateMaze() {
    grid = [];
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
        }
    }
    current = grid[0];
    stack = [];

    function mazeStep() {
        current.visited = true;

        const neighbors = [];
        [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => {
            const n = grid[idx(current.x + dx, current.y + dy)];
            if (n && !n.visited) {
                neighbors.push(n);
            }
        });

        if (neighbors.length) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length) {
            current = stack.pop();
        } else {
            addExtraPaths(75);
            initGame();
            return;
        }
        mazeStep();
    }
    mazeStep();
}

function getDistanceMap(startX, startY) {
    const queue = [];
    const distances = new Array(cols * rows).fill(Infinity);
    const visited = new Array(cols * rows).fill(false);
    const parentMap = new Array(cols * rows).fill(null);

    const startIndex = idx(startX, startY);
    if (startIndex === -1) {
        return { distances: distances, parentMap: parentMap };
    }

    queue.push(startIndex);
    distances[startIndex] = 0;
    visited[startIndex] = true;

    while (queue.length > 0) {
        const currentCellIndex = queue.shift();
        const currentCell = grid[currentCellIndex];

        const directions = [
            { dx: 0, dy: -1, wallIdx: 0 },
            { dx: 1, dy: 0, wallIdx: 1 },
            { dx: 0, dy: 1, wallIdx: 2 },
            { dx: -1, dy: 0, wallIdx: 3 }
        ];

        for (const { dx, dy, wallIdx } of directions) {
            const nextX = currentCell.x + dx;
            const nextY = currentCell.y + dy;
            const nextCellIndex = idx(nextX, nextY);

            if (nextCellIndex !== -1 && !currentCell.walls[wallIdx] && !visited[nextCellIndex]) {
                distances[nextCellIndex] = distances[currentCellIndex] + 1;
                visited[nextCellIndex] = true;
                parentMap[nextCellIndex] = currentCellIndex;
                queue.push(nextCellIndex);
            }
        }
    }
    return { distances: distances, parentMap: parentMap };
}

function isWalkable(x, y) {
    if (x < 0 || x >= cols || y < 0 || y >= rows) {
        return false;
    }
    if ((x === player.x && y === player.y) || (x === exit.x && y === exit.y)) {
        return false;
    }
    for (const assassin of assassins) {
        if (assassin.x === x && assassin.y === y) {
            return false;
        }
    }
    return true;
}

function createAssassin() {
    let pos;
    const minMazeDistance = 100;
    let attempts = 0;
    const maxAttempts = cols * rows * 2;
    let distance = Infinity; // Inicialize distance aqui para que esteja sempre disponível

    do {
        pos = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        const posIndex = idx(pos.x, pos.y);

        // Calcule a distância dentro do loop
        distance = (posIndex !== -1 && playerDistanceMap && playerDistanceMap[posIndex] !== undefined)
            ? playerDistanceMap[posIndex]
            : Infinity;

        attempts++;
        if (attempts > maxAttempts) {
            console.warn("Não foi possível encontrar uma posição ideal para o assassino, spawnando em qualquer lugar caminhável.");
            if (isWalkable(pos.x, pos.y)) break;
        }

    } while (!isWalkable(pos.x, pos.y) || (attempts < maxAttempts && distance < minMazeDistance)); // 'distance' está visível aqui

    return { ...pos, direction: 'down' };
}

function resetGame() {
    level++;
    document.getElementById('level').innerHTML = `<span> LEVEL : ${level}</span>`
    console.log(`Iniciando Nível ${level}`);
    generateMaze();
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isBackgroundLoaded) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    grid.forEach(c => c.draw());
}

function drawPlayer() {
    const img = playerImages[player.direction];
    if (img && img.complete) {
        ctx.drawImage(img, player.x * cellSize, player.y * cellSize, cellSize, cellSize);
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x * cellSize + 2, player.y * cellSize + 2, cellSize - 4, cellSize - 4);
    }
}

function drawExit() {
    const px = exit.x * cellSize;
    const py = exit.y * cellSize;

    if (exitImage.complete) {
        ctx.drawImage(exitImage, px, py, cellSize, cellSize);
    } else {
        ctx.fillStyle = 'lime';
        ctx.fillRect(px + 5, py + 5, cellSize - 10, cellSize - 10);
    }
}

function drawAssassins() {
    assassins.forEach(a => {
        const img = assassinImages[a.direction] || assassinImages['down'];
        if (img && img.complete) {
            ctx.drawImage(img, a.x * cellSize, a.y * cellSize, cellSize, cellSize);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(a.x * cellSize + 2, a.y * cellSize + 2, cellSize - 4, cellSize - 4);
        }
    });
}

function drawAll() {
    drawMaze();
    drawExit();
    drawPlayer();
    drawAssassins();
}

function moveAssassins() {
    playerDistanceMap = getDistanceMap(player.x, player.y).distances;

    assassins.forEach(assassin => {
        const directions = [
            { dx: 0, dy: -1, dir: 'up', wallIdx: 0 },
            { dx: 1, dy: 0, dir: 'right', wallIdx: 1 },
            { dx: 0, dy: 1, dir: 'down', wallIdx: 2 },
            { dx: -1, dy: 0, dir: 'left', wallIdx: 3 }
        ];

        const currentCell = grid[idx(assassin.x, assassin.y)];
        let bestMove = null;
        let minDistance = Infinity;

        for (const { dx, dy, dir, wallIdx } of directions) {
            const newX = assassin.x + dx;
            const newY = assassin.y + dy;
            const nextCellIndex = idx(newX, newY);

            if (currentCell && !currentCell.walls[wallIdx] && nextCellIndex !== -1) {
                const distanceToPlayer = playerDistanceMap[nextCellIndex];

                if (distanceToPlayer < minDistance) {
                    minDistance = distanceToPlayer;
                    bestMove = { newX, newY, dir };
                }
            }
        }

        if (bestMove) {
            assassin.x = bestMove.newX;
            assassin.y = bestMove.newY;
            assassin.direction = bestMove.dir;
        } else {
            const shuffled = directions.sort(() => 0.5 - Math.random());
            for (const { dx, dy, dir, wallIdx } of shuffled) {
                const newX = assassin.x + dx;
                const newY = assassin.y + dy;
                if (currentCell && !currentCell.walls[wallIdx] && idx(newX, newY) !== -1) {
                    assassin.x = newX;
                    assassin.y = newY;
                    assassin.direction = dir;
                    break;
                }
            }
        }
        checkCollision();
    });

    drawAll();
}

function checkCollision() {
    assassins.forEach(a => {
        if (a.x === player.x && a.y === player.y) {
            setTimeout(() => {
                alertT("pego");
                level = 0;
                resetGame();
                onModalFeedBack();
            }, 50);
            if (assassinMovementInterval) {
                clearInterval(assassinMovementInterval);
            }
        }
    });
}

window.addEventListener('keydown', e => {
    const cellIndex = idx(player.x, player.y);

    if (cellIndex === -1) {
        return;
    }
    const cell = grid[cellIndex];

    let moved = false;

    if (e.code === 'KeyW' && !cell.walls[0]) { player.y--; player.direction = 'up'; moved = true; }
    else if (e.code === 'KeyD' && !cell.walls[1]) { player.x++; player.direction = 'right'; moved = true; }
    else if (e.code === 'KeyS' && !cell.walls[2]) { player.y++; player.direction = 'down'; moved = true; }
    else if (e.code === 'KeyA' && !cell.walls[3]) { player.x--; player.direction = 'left'; moved = true; }

    if (moved) {
        drawAll();
        checkCollision();

        if (player.x === exit.x && player.y === exit.y) {
            setTimeout(() => {
                alertT("escapou");
                resetGame();
                onModalFeedBack();
            }, 50);
        }
    }
});

function onModalFeedBack() {
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.style.display = "flex";
    } else {
        console.warn("Elemento 'feedbackForm' não encontrado no DOM. O modal de feedback não será exibido.");
    }
}

loadImages().then(() => {
    console.log("Todas as imagens de personagem carregadas.");
    generateMaze();
}).catch(error => {
    console.error("Erro ao carregar uma ou mais imagens: ", error);
});