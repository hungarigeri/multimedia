class Enemy extends Sprite {
    constructor({ position = { x: 0, y: 0 } }) {
      super({
        position,
        imageSrc: 'kepek/orc.png',
        frames: {
          max: 7
        }
      })
      this.position = position
      this.width = 100
      this.height = 100
      this.utindex = 0
      this.center = {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height / 2
      }
      this.radius = 50
      this.health = 100
      this.velocity = {
        x: 0,
        y: 0
      }

      this.baseSpeed = 1// Alap sebesség tárolása
      this.currentSpeed = this.baseSpeed // Jelenlegi sebesség
      this.slowTimer = 0 // Lassítás időzítője
    }
  
    draw() {
      super.draw()
  
      // health bar
      c.fillStyle = 'red'
      c.fillRect(this.position.x, this.position.y - 15, this.width, 10)
  
      c.fillStyle = 'green'
      c.fillRect(
        this.position.x,
        this.position.y - 15,
        (this.width * this.health) / 100,
        10
      )
    }
  
    update() {
      this.draw()
      super.update()
  
      const pontok = ut[this.utindex]
      const yDistance = pontok.y - this.center.y
      const xDistance = pontok.x - this.center.x
      const angle = Math.atan2(yDistance, xDistance)
      
      // Sebesség frissítése a slowTimer alapján
      if (this.slowTimer > 0) {
        this.currentSpeed = this.baseSpeed * 0.5 // 50%-os lassítás
        this.slowTimer--
      } else {
        this.currentSpeed = this.baseSpeed // Normál sebesség
      }
  
      this.velocity.x = Math.cos(angle) * this.currentSpeed
      this.velocity.y = Math.sin(angle) * this.currentSpeed
  
      this.position.x += this.velocity.x
      this.position.y += this.velocity.y
  
      this.center = {
        x: this.position.x + this.width / 2,
        y: this.position.y + this.height / 2
      }
  
      if (
        Math.abs(Math.round(this.center.x) - Math.round(pontok.x)) <
          Math.abs(this.velocity.x) &&
        Math.abs(Math.round(this.center.y) - Math.round(pontok.y)) <
          Math.abs(this.velocity.y) &&
        this.utindex < ut.length - 1
      ) {
        this.utindex++
      }
    }
  }