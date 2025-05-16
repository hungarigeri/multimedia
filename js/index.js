const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const towerMenu = document.getElementById('towerMenu');
const towerCostDisplay = document.getElementById('towerCostDisplay');
let selectedTile = null;
let selectedBuilding = null;
const towerManagementMenu = document.getElementById('towerManagementMenu');
const sellTowerBtn = document.getElementById('sellTowerBtn');
const towerInfo = document.getElementById('towerInfo');
let isScoreSaved = false;

// Hangkezelés
let isMuted = false;
const towerPlaceSound = new Audio("kepek/place.mp3");
const enemyHitSound = new Audio("kepek/hit.mp3");

// Eseményfigyelők egyszeri regisztrálása
document.getElementById('saveScoreBtn').addEventListener('click', function handleSaveScore() {
  if (isScoreSaved) return;
  
  const playerName = document.getElementById('playerName').value.trim();
  if (playerName) {
    saveHighscore(playerName, wave);
    displayHighscores();
    isScoreSaved = true;
    this.disabled = true; // Letiltjuk a gombot
    this.textContent = "Mentve"; // Változtatjuk a szöveget
  }
});


document.getElementById('newGameBtn').addEventListener('click', startNewGame);

muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? "🔇" : "🔊";
  [towerPlaceSound, enemyHitSound].forEach((audio) => {
    audio.volume = isMuted ? 0 : 0.7;
  });
});

// Canvas beállítások
canvas.width = 1280;
canvas.height = 768;
c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

// Pálya inicializálása
const lerakasadat2D = [];
for (let i = 0; i < lerakasadat.length; i += 20) {
  lerakasadat2D.push(lerakasadat.slice(i, i + 20));
}

const csempek = [];
lerakasadat2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 14) {
      csempek.push(
        new PlacementTile({
          position: { x: x * 64, y: y * 64 }
        })
      );
    }
  });
});

// Játékállapot változók
const kep = new Image();
kep.onload = () => animate();
kep.src = "kepek/map.png";

const enemies = [];
const buildings = [];
const explosions = [];
let activeTile = undefined;
let enemyCount = 3;
let hearts = 10;
let coins = 100;
let wave = 1;
let selectedBuildingType = "normal";

const mouse = { x: undefined, y: undefined };

// Fő játékciklus
function animate() {
  const animationId = requestAnimationFrame(animate);
  c.drawImage(kep, 0, 0);

  // Ellenségek frissítése
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update();

    if (enemy.position.x > canvas.width) {
      hearts -= 1;
      enemies.splice(i, 1);
      document.querySelector("#hearts").innerHTML = hearts;

      if (hearts === 0) {
        cancelAnimationFrame(animationId);
        document.querySelector('#gameOver').style.display = 'flex';
        document.getElementById('finalWave').textContent = wave;
      }
    }
  }

  // Explosions
  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i];
    explosion.draw();
    explosion.update();
    if (explosion.frames.current >= explosion.frames.max - 1) {
      explosions.splice(i, 1);
    }
  }

  // Wave kezelés
  if (enemies.length === 0) {
    enemyCount += 2;
    wave++;
    document.querySelector("#waveCounter").textContent = `Wave: ${wave}`;
    spawnEnemies(enemyCount);
  }

  // Csempék frissítése
  csempek.forEach((tile) => tile.update(mouse));

  // Tornyok frissítése
  buildings.forEach((building) => {
    building.update();
    building.target = null;
    const validEnemies = enemies.filter((enemy) => {
      const xDifference = enemy.center.x - building.center.x;
      const yDifference = enemy.center.y - building.center.y;
      return Math.hypot(xDifference, yDifference) < enemy.radius + building.radius;
    });
    building.target = validEnemies[0];

    // Lövedékek kezelése
    for (let i = building.projectiles.length - 1; i >= 0; i--) {
      handleProjectile(building, i);
    }
  });
}

// Segédfüggvények
function handleProjectile(building, i) {
  const projectile = building.projectiles[i];
  
  // Debug információk
  console.log("Projectile type:", projectile.constructor.name);
  console.log("Before hit - Enemy health:", projectile.enemy.health);

  if (projectile.update()) { // Minden lövedék frissítése
    const enemy = projectile.enemy;
    const damage = projectile instanceof SlowProjectile ? 5 : 20;
    enemy.health -= damage;
    
    console.log(`Hit! Damage: ${damage}, Remaining health: ${enemy.health}`);

    if (enemy.health <= 0) {
      const enemyIndex = enemies.indexOf(enemy);
      if (enemyIndex > -1) {
        enemies.splice(enemyIndex, 1);
        coins += 25;
        document.querySelector("#coins").innerHTML = coins;
        console.log("Enemy defeated");
      }
    }

    if (!isMuted) {
      enemyHitSound.currentTime = 0;
      enemyHitSound.play();
    }
       
    explosions.push(new Sprite({
      position: { x: projectile.position.x, y: projectile.position.y },
      imageSrc: projectile instanceof SlowProjectile 
        ? "kepek/lovedek_explosion.png" 
        : "kepek/explosion.png",
      frames: { max: 4 },
      offset: { x: 0, y: 0 }
    }));
    
    building.projectiles.splice(i, 1);
  }
}

function spawnEnemies(spawnCount) {
  for (let i = 1; i < spawnCount + 1; i++) {
    enemies.push(new Enemy({
      position: { x: ut[0].x - (i * 150), y: ut[0].y }
    }));
  }
}

function startNewGame() {
  enemies.length = 0;
  buildings.length = 0;
  explosions.length = 0;
  hearts = 10;
  coins = 100;
  wave = 4;
  enemyCount = 3;
  saveBtn = document.getElementById('saveScoreBtn');
  saveBtn.disabled = false;
  saveBtn.textContent = "Mentés";
  isScoreSaved = false;

  document.querySelector('#hearts').textContent = hearts;
  document.querySelector('#coins').textContent = coins;
  document.querySelector('#waveCounter').textContent = `Wave: ${wave}`;
  document.querySelector('#gameOver').style.display = 'none';

  csempek.forEach(tile => tile.isOccupied = false);
  spawnEnemies(enemyCount);
  animate();
}

function saveHighscore(name, wave) {
  const highscores = JSON.parse(localStorage.getItem('td_highscores')) || [];
  highscores.push({ name, wave, date: new Date().toLocaleDateString() });
  highscores.sort((a, b) => b.wave - a.wave);
  localStorage.setItem('td_highscores', JSON.stringify(highscores.slice(0, 10)));
}

function displayHighscores() {
  const highscores = JSON.parse(localStorage.getItem('td_highscores')) || [];
  const highscoresList = document.getElementById('highscoresList');
  highscoresList.innerHTML = '';
  highscores.forEach((score, index) => {
    const entry = document.createElement('div');
    entry.className = 'highscore-entry';
    entry.innerHTML = `<strong>${index + 1}.</strong> ${score.name}<br>Wave: ${score.wave} | ${score.date}`;
    highscoresList.appendChild(entry);
  });
}

// UI kezelés
function showTowerMenu(x, y) {
  const menuWidth = 250, menuHeight = 180;
  const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
  const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;
  
  towerMenu.style.left = `${adjustedX}px`;
  towerMenu.style.top = `${adjustedY}px`;
  towerMenu.style.display = 'block';
  updateCostDisplay();
}

function updateCostDisplay() {
  const normalCost = 50, slowCost = 75;
  const slowBtn = document.querySelector('[data-type="slow"]');
  
  if (coins >= slowCost) {
    towerCostDisplay.innerHTML = `Elérhető arany: ${coins}`;
    slowBtn.disabled = false;
  } else if (coins >= normalCost) {
    towerCostDisplay.innerHTML = `Csak normál torony (${normalCost} arany)`;
    slowBtn.disabled = true;
  } else {
    towerCostDisplay.innerHTML = `Nincs elég arany! Szükséges: normál (${normalCost}) vagy lassító (${slowCost})`;
    document.querySelectorAll('.tower-btn').forEach(btn => btn.disabled = true);
  }
}

function placeTower() {
  if (!selectedTile || selectedTile.isOccupied) return;
  
  const cost = selectedBuildingType === 'normal' ? 50 : 75;
  if (coins >= cost) {
    if (!isMuted){
      towerPlaceSound.currentTime = 0;
towerPlaceSound.play();
    }
    coins -= cost;
    document.querySelector("#coins").innerHTML = coins;

    const building = selectedBuildingType === "normal" 
      ? new Building({ position: selectedTile.position })
      : new SlowTower({ position: selectedTile.position });

    buildings.push(building);
    selectedTile.isOccupied = true;
    selectedTile = null;
    buildings.sort((a, b) => a.position.y - b.position.y);
  }
}

function checkBuildingClick(x, y) {
  return buildings.find(building => 
    x > building.position.x && x < building.position.x + building.width &&
    y > building.position.y && y < building.position.y + building.height
  );
}

function showTowerManagementMenu(x, y, building) {
  // Tartalom frissítése
  towerInfo.innerHTML = `
    <p>${building instanceof SlowTower ? 'Lassító' : 'Normál'} torony</p>
    <p>Sebzés: ${building.damage || 20}</p>
    ${building instanceof SlowTower ? `<p>Lassítás: ${building.slowFactor * 100}%</p>` : ''}
  `;

  // Osztály hozzáadása a megjelenítéshez
  towerManagementMenu.classList.add('visible');
  towerManagementMenu.style.left = `${x}px`;
  towerManagementMenu.style.top = `${y}px`;
  selectedBuilding = building;
}

;



// Eseménykezelők
document.querySelectorAll('.tower-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    selectedBuildingType = e.target.dataset.type;
    placeTower();
    towerMenu.style.display = 'none';
  });
});

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  activeTile = csempek.find(tile => 
    mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size &&
    mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size
  ) || null;
});

canvas.addEventListener("click", (event) => {
  // Mindkét menü elrejtése először
  towerMenu.style.display = 'none';
  towerManagementMenu.style.display = 'none';

  // 1. Először ellenőrizzük, hogy toronyra kattintottunk-e
  const clickedBuilding = checkBuildingClick(mouse.x, mouse.y);
  if (clickedBuilding) {
    showTowerManagementMenu(mouse.x, mouse.y, clickedBuilding);
    return;
  }

  // 2. Ha nem toronyra kattintottunk, nézzük a tile-okat
  if (activeTile) {
    event.stopPropagation();
    
    if (activeTile.isOccupied) {
      // Ha a tile foglalt, keressük meg a hozzá tartozó épületet
      const buildingOnTile = buildings.find(building => 
        Math.abs(building.position.x - activeTile.position.x) < 10 && 
        Math.abs(building.position.y - activeTile.position.y) < 10
      );
      
      if (buildingOnTile) {
        showTowerManagementMenu(mouse.x, mouse.y, buildingOnTile);
      } else {
        console.log("Nem található épület a tile-on, de isOccupied=true");
      }
    } else {
      // Ha a tile üres, megjelenítjük a toronyválasztó menüt
      selectedTile = activeTile;
      showTowerMenu(event.clientX, event.clientY);
    }
  }
});
window.addEventListener('click', (e) => {
  if (!towerMenu.contains(e.target) && 
      !towerManagementMenu.contains(e.target) && 
      e.target.className !== 'tower-btn') {
    towerMenu.style.display = 'none';
    towerManagementMenu.style.display = 'none';
  }
});


sellTowerBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log("Sell button clicked"); // Debug üzenet
  
  if (selectedBuilding) {
    console.log("Selling tower:", selectedBuilding);
    
    // Visszatérítés számítása
    const cost = selectedBuilding instanceof SlowTower ? 75 : 50;
    const refund = Math.floor(cost * 0.5);
    coins += refund;
    document.querySelector("#coins").innerHTML = coins;
    
    // Épület eltávolítása
    const index = buildings.indexOf(selectedBuilding);
    if (index > -1) {
      buildings.splice(index, 1);
      console.log("Tower removed from buildings array");
    }
    
    // Tile felszabadítása
    const tile = csempek.find(t => 
      t.position.x === selectedBuilding.position.x && 
      t.position.y === selectedBuilding.position.y
    );
    if (tile) {
      tile.isOccupied = false;
      console.log("Tile freed up");
    }
    
    // Menü bezárása
    towerManagementMenu.classList.remove('visible');
    selectedBuilding = null;
    console.log("Menu closed and selection cleared");
  } else {
    console.log("No building selected to sell");
  }
});
// Játék indítása
displayHighscores();
spawnEnemies(enemyCount);