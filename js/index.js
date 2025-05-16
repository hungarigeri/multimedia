const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 768;

c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

const lerakasadat2D = [];

for (let i = 0; i < lerakasadat.length; i += 20) {
  lerakasadat2D.push(lerakasadat.slice(i, i + 20));
}

const csempek = [];

lerakasadat2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 14) {
      // add building placement tile here
      csempek.push(
        new PlacementTile({
          position: {
            x: x * 64,
            y: y * 64,
          },
        })
      );
    }
  });
});

const kep = new Image();

kep.onload = () => {
  animate();
};

kep.src = "kepek/map.png";

const enemies = [];

function spawnEnemies(spawnCount) {
  for (let i = 1; i < spawnCount + 1; i++) {
    const xOffset = i * 150;
    enemies.push(
      new Enemy({
        position: { x: ut[0].x - xOffset, y: ut[0].y },
      })
    );
  }
}

const buildings = [];
let activeTile = undefined;
let enemyCount = 3;
let hearts = 10;
let coins = 100;
const explosions = [];
spawnEnemies(enemyCount);

let selectedBuildingType = "normal";

document.querySelector("#normalTowerBtn").addEventListener("click", () => {
  selectedBuildingType = "normal";
});

document.querySelector("#slowTowerBtn").addEventListener("click", () => {
  selectedBuildingType = "slow";
});
let wave = 1;
function animate() {
  const animationId = requestAnimationFrame(animate);

  c.drawImage(kep, 0, 0);

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update();

    if (enemy.position.x > canvas.width) {
      hearts -= 1;
      enemies.splice(i, 1);
      document.querySelector("#hearts").innerHTML = hearts;

      if (hearts === 0) {
        console.log("game over");
        cancelAnimationFrame(animationId);
          document.querySelector('#gameOver').style.display = 'flex';
        // Eredmény mentése gomb
 document.getElementById('saveScoreBtn').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value.trim();
    if (playerName) {
      saveHighscore(playerName, wave);
      displayHighscores();
            }
          });
           document.getElementById('newGameBtn').addEventListener('click', startNewGame);
      }
    }
  }


  // Új játék indítása
function startNewGame() {
  // Alapállapotba visszaállítás
  enemies.length = 0;
  buildings.length = 0;
  explosions.length = 0;
  hearts = 10;
  coins = 100;
  wave = 1;
  enemyCount = 3;
  
  // UI frissítése
  document.querySelector('#hearts').textContent = hearts;
  document.querySelector('#coins').textContent = coins;
  document.querySelector('#waveCounter').textContent = `Wave: ${wave}`;
  
  // Csempek resetelése
  csempek.forEach(tile => {
    tile.isOccupied = false;
  });
  
  // Game Over elrejtése
  document.querySelector('#gameOver').style.display = 'none';
  
  // Új ellenségek
  spawnEnemies(enemyCount);
  
  // Animáció újraindítása
  animate();
}

  // Highscore mentése
function saveHighscore(name, wave) {
  const highscores = JSON.parse(localStorage.getItem('td_highscores')) || [];
  highscores.push({ name, wave, date: new Date().toLocaleDateString() });
  
  // Rendezés wave szerint csökkenő sorrendben
  highscores.sort((a, b) => b.wave - a.wave);
  
  // Csak a top 10 eredmény megtartása
  const top10 = highscores.slice(0, 10);
  localStorage.setItem('td_highscores', JSON.stringify(top10));
}
// Játék betöltésekor automatikusan megjeleníti a toplistát
displayHighscores();

// Frissített highscore megjelenítő függvény
function displayHighscores() {
  const highscores = JSON.parse(localStorage.getItem('td_highscores')) || [];
  const highscoresList = document.getElementById('highscoresList');
  
  highscoresList.innerHTML = '';
  
  highscores.forEach((score, index) => {
    const entry = document.createElement('div');
    entry.className = 'highscore-entry';
    entry.innerHTML = `
      <strong>${index + 1}.</strong> ${score.name}<br>
      Wave: ${score.wave} | ${score.date}
    `;
    highscoresList.appendChild(entry);
  });
}


  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i];
    explosion.draw();
    explosion.update();

    if (explosion.frames.current >= explosion.frames.max - 1) {
      explosions.splice(i, 1);
    }

    console.log(explosions);
  }

  // tracking total amount of enemies
  if (enemies.length === 0) {
    enemyCount += 2;
    wave++;
    document.querySelector("#waveCounter").textContent = `Wave: ${wave}`;
    spawnEnemies(enemyCount);
  }

  csempek.forEach((tile) => {
    tile.update(mouse);
  });

  buildings.forEach((building) => {
    building.update();
    building.target = null;
    const validEnemies = enemies.filter((enemy) => {
      const xDifference = enemy.center.x - building.center.x;
      const yDifference = enemy.center.y - building.center.y;
      const distance = Math.hypot(xDifference, yDifference);
      return distance < enemy.radius + building.radius;
    });
    building.target = validEnemies[0];

    for (let i = building.projectiles.length - 1; i >= 0; i--) {
      const projectile = building.projectiles[i];

      if (projectile instanceof SlowProjectile) {
        if (projectile.update()) {
          // Ha talált, eltávolítjuk
          building.projectiles.splice(i, 1);
        }
      } else {
        // Normál lövedék kezelése
        projectile.update();
        const xDifference = projectile.enemy.center.x - projectile.position.x;
        const yDifference = projectile.enemy.center.y - projectile.position.y;
        const distance = Math.hypot(xDifference, yDifference);

        if (distance < projectile.enemy.radius + projectile.radius) {
          projectile.enemy.health -= 20;
          if (projectile.enemy.health <= 0) {
            const enemyIndex = enemies.findIndex((e) => e === projectile.enemy);
            if (enemyIndex > -1) {
              enemies.splice(enemyIndex, 1);
              coins += 25;
              document.querySelector("#coins").innerHTML = coins;
            }
          }
          if (!isMuted) enemyHitSound.play();
          explosions.push(
            new Sprite({
              position: { x: projectile.position.x, y: projectile.position.y },
              imageSrc: "kepek/explosion.png",
              frames: { max: 4 },
              offset: { x: 0, y: 0 },
            })
          );
          building.projectiles.splice(i, 1);
        }
      }
    }
  });
}

const mouse = {
  x: undefined,
  y: undefined,
};

//HANG EFFEKTEK
let isMuted = false;
const towerPlaceSound = new Audio("kepek/place.mp3");
const enemyHitSound = new Audio("kepek/hit.mp3");

// Mute gomb kezelése
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? "🔇" : "🔊";

  // Hangok volume beállítása
  [towerPlaceSound, enemyHitSound].forEach((audio) => {
    audio.volume = isMuted ? 0 : 0.7;
  });
});

canvas.addEventListener("click", (event) => {
  if (activeTile && !activeTile.isOccupied && coins - 50 >= 0) {
    if (!isMuted) towerPlaceSound.play();
    coins -= 50;
    document.querySelector("#coins").innerHTML = coins;

    let building;
    if (selectedBuildingType === "normal") {
      building = new Building({ position: activeTile.position });
    } else if (selectedBuildingType === "slow") {
      building = new SlowTower({ position: activeTile.position });
    }

    buildings.push(building);
    activeTile.isOccupied = true;

    buildings.sort((a, b) => {
      return a.position.y - b.position.y;
    });
  }
});

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;

  activeTile = null;
  for (let i = 0; i < csempek.length; i++) {
    const tile = csempek[i];
    if (
      mouse.x > tile.position.x &&
      mouse.x < tile.position.x + tile.size &&
      mouse.y > tile.position.y &&
      mouse.y < tile.position.y + tile.size
    ) {
      activeTile = tile;
      break;
    }
  }
});
