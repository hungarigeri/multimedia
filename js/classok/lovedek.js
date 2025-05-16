class Projectile extends Sprite {
    constructor({ position = { x: 0, y: 0 }, enemy }) {
        super({ position, imageSrc: 'kepek/projectile.png' })
        this.velocity = {
            x: 0,
            y: 0
        }
        this.enemy = enemy
        this.radius = 10
        this.hasHit = false // Új property a találat nyilvántartására
    }

    update() {
        if (this.hasHit) return false // Ha már eltaláltuk, ne csináljunk semmit
        
        this.draw()

        const angle = Math.atan2(
            this.enemy.center.y - this.position.y,
            this.enemy.center.x - this.position.x
        )

        const power = 5
        this.velocity.x = Math.cos(angle) * power
        this.velocity.y = Math.sin(angle) * power

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        // Találat detektálása
        const xDiff = this.enemy.center.x - this.position.x
        const yDiff = this.enemy.center.y - this.position.y
        const distance = Math.hypot(xDiff, yDiff)

        if (distance < this.enemy.radius + this.radius) {
            explosions.push(
                new Sprite({
                    position: { x: this.position.x, y: this.position.y },
                    imageSrc: 'kepek/explosion.png', // Normál explosion kép
                    frames: { max: 4 },
                    offset: { x: 0, y: 0 }
                })
            )
            this.hasHit = true
            return true // Jelzés, hogy eltaláltuk az ellenséget
        }
        return false // Még nem találtuk el
    }
}


  //lassító lövedék
class SlowProjectile extends Projectile {
    constructor({ position = { x: 0, y: 0 }, enemy }) {
      super({ 
        position, 
        imageSrc: 'kepek/lovedek.png',
        enemy 
      })
      this.radius = 10
       this.hasHit = false
        this.slowDuration = 180 // 3 másodperc (60 FPS esetén)
        this.slowFactor = 0.5 // Sebesség 50%-ra csökkentése
    }
  
  update() {
        if (this.hasHit) return false
        
        super.update()

        const xDiff = this.enemy.center.x - this.position.x
        const yDiff = this.enemy.center.y - this.position.y
        const distance = Math.hypot(xDiff, yDiff)

        if (distance < this.enemy.radius + this.radius) {
            this.enemy.slowTimer = this.slowDuration // Itt állítjuk be az időzítőt
            explosions.push(
                new Sprite({
                    position: { x: this.position.x, y: this.position.y },
                    imageSrc: 'kepek/lovedek_explosion.png',
                    frames: { max: 4 },
                    offset: { x: 0, y: 0 }
                })
            )
            this.hasHit = true
            return true
        }
        return false
    }
}
