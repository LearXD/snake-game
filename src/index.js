window.addEventListener('DOMContentLoaded', () => {

    const FPS = 10;
    const size = 25

    const canvas = document.querySelector('canvas')
    const context = canvas.getContext('2d')

    canvas.width = 410 //screen.width
    canvas.height = 410 //screen.height

    const MAX_X = canvas.width / size - 1
    const MAX_Y = canvas.height / size - 1

    class Utils {
        static random(min, max) {
            return Math.ceil((Math.random() * (max - min)) + min)
        }
    }

    class Engine {

        static player
        static food

        static init() {
            Engine.start();

            window.addEventListener('keydown', ({ key }) => this.onKeyDown(key.toLowerCase()))
            setInterval(this.tick, 1000 / FPS)
            setInterval(this.update, 100)
        }

        static start() {
            this.player = new Player()
            this.food = new Food()
            this.food.randomize()
        }

        static stop() {
            this.player = null
        }

        static draw = (x, y, color = '#FFF') => {
            if (this.canDraw(x, y)) {
                context.fillStyle = color
                context.fillRect(
                    (x + MAX_X / 2) * size,
                    (-y + MAX_Y / 2) * size,
                    size, size
                )
                return true;
            }
            return false;
        }

        static canDraw = (x, y) => {
            return (
                x <= MAX_X / 2 && x >= -MAX_X / 2 &&
                y <= MAX_Y / 2 && y >= -MAX_Y / 2
            )
        }

        static clear = () => {
            context.fillStyle = '#000'
            context.fillRect(0, 0, canvas.width, canvas.height)
        }

        static onKeyDown = (key) => {
            this.player.onKeyDown(key)
        }

        static tick = () => {
            this.clear()
            this.player && this.player.draw()
            this.food && this.food.draw()
            Engine.draw(-27, 0)
        }

        static update = () => {
            this.player && this.player.move()
        }
    }

    class Vector2d {

        constructor(x = 0, y = 0) {
            this.x = x
            this.y = y
        }

        add(x = 0, y = 0) {
            this.x += x
            this.y += y
        }

        equals(x, y) {
            if (x instanceof Vector2d) {
                return x.x === this.x && x.y === this.y
            }
            return x === this.x && this.y === y
        }
    }

    class Food extends Vector2d {

        constructor() {
            super(0, 0)
        }

        isColliding(x) {
            return this.equals(x)
        }

        randomize() {
            this.setPosition(
                Utils.random(-MAX_X / 2, MAX_X / 2),
                Utils.random(-MAX_Y / 2, MAX_Y / 2)
            )
        }

        setPosition(x, y) {
            if (x instanceof Vector2d) {
                this.x = x.x
                this.y = x.y
                return;
            }

            this.x = x
            this.y = y
        }

        draw() {
            Engine.draw(this.x, this.y, '#0FF')
        }
    }

    class Player extends Vector2d {

        parts = []
        lastMove = [0, 1]

        actions = {
            'w': () => this.lastMove = [0, 1],
            'a': () => this.lastMove = [-1, 0],
            's': () => this.lastMove = [0, -1],
            'd': () => this.lastMove = [1, 0]
        }

        constructor() {
            super(0, 0)
            for (let i = 0; i < 2; i++) {
                this.grow()
            }
        }

        grow() {
            const part = new BodyPart(this.getTail())
            if (part.parent) {
                part.parent.children = part
                part.setPosition(part.parent)
                part.x += this.lastMove[0] * -1
                part.y += this.lastMove[1] * -1
            }
            this.parts.push(part)
        }

        getHead() {
            return this.parts[0]
        }

        getTail() {
            if (this.parts.length > 0) {
                return this.parts[this.parts.length - 1]
            }
            return null
        }

        onKeyDown(key) {
            const action = this.actions[key]
            if (action) {
                action()
            }
        }

        move() {
            const head = this.getHead()
            if (head) {

                const newX = head.x + this.lastMove[0]
                const newY = head.y + this.lastMove[1]

                console.log(Engine.food.isColliding(this.head))
                if (Engine.food.isColliding(head)) {
                    this.grow()
                    Engine.food.randomize()
                }

                if (Engine.canDraw(newX, newY)) {
                    if (head.isColliding(newX, newY, true) === false) {
                        head.move(...this.lastMove)
                        return;
                    }
                    return;
                }
                // this.kill()
            }
        }

        kill() {
            Engine.stop()
            alert('Você morreu!')
            Engine.start()
        }

        onCollide(object) {

        }

        draw() {
            for (const part of this.parts) {
                part.draw()
            }
        }
    }

    class BodyPart extends Vector2d {

        parent = null
        children = null

        constructor(parent = null) {
            super(0, 0)
            this.parent = parent
        }

        isColliding(x, y, recursive = false) {
            if (x === this.x && y === this.y) {
                return true;
            }
            if (recursive) {
                if (this.children) {
                    return this.children.isColliding(x, y, true)
                }
            }
            return false;
        }

        setPosition(vector) {
            this.x = vector.x
            this.y = vector.y
        }

        move(x, y) {
            if (this.children) {
                this.children.follow()
            }
            this.add(x, y)
        }

        follow() {
            if (this.children) {
                this.children.follow()
            }
            this.setPosition(this.parent)
        }

        draw() {
            Engine.draw(
                this.x,
                this.y,
                this.parent ?
                    (this.children ? '#F00' : '#00F') : '#0F0'
            )
        }
    }

    Engine.init()
})

