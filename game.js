const SPIN = new function () {
    let SPIN = this, cnv, ctx, width, height, nodes = [], for_destroy = {}, node_count = 0, down_keys = {}, timer = 0, user_draw;

    let $ = (id) => {return document.getElementById(id)};

    let text = (x, y, clr, _text) => {
        ctx.fillStyle = clr;
        ctx.fillText(_text, x, y);
    };

    let rect = (x, y, w, h, clr) => {
        ctx.fillStyle = clr;
        ctx.fillRect(x, y, w, h)
    };

    SPIN.set_draw = (f) => {
        user_draw = f;
    };

    class Node {
        constructor (x, y, w, h, clr, upd) {
            this.id = node_count++;
            this.hp = 6;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.clr = clr;
            this.update = upd;
            // console.log(this.update);

            nodes.push(this);
        }

        _update () {
//            console.log("Ват?");
            if (this.update) {
                this.update(this);
            }
        }

        draw() {
            rect(this.x, this.y, this.w, this.h, this.clr);
        }

        destroy() {
            for_destroy[this.id] = this;
        }

        move(x, y) {
            this.x += x;
            this.y += y;
        }

        damage(d) {
            this.hp -= d;
            if (this.hp == 5) {
                this.clr = "#9ffc08";
            }
            if (this.hp == 4) {
                this.clr = "#e8fc08";
            }
            if (this.hp == 3) {
                this.clr = "#fcc708";
            }
            if (this.hp == 2) {
                this.clr = "#fc7e08";
            }
            if (this.hp == 1) {
                this.clr = "#fc0808";
            }
            if (this.hp == 0) {
                this.destroy();
                return true;
            }
            return false;
        }

        intersect(other) {
            return !(this.x + this.w < other.x || this.y + this.h < other.y || this.x > other.x + other.w || this.y > other.y + other.h);
        }
    }

    SPIN.create_node = (x, y, w, h, clr, upd) => {
        return new Node(x, y, w, h, clr, upd);
    };

    SPIN.update = () => {
        ctx.clearRect(0, 0, width, height);
        for (let i = nodes.length - 1; i > -1; --i) {
            if (for_destroy[nodes[i].id]) {
                nodes.splice(i, 1);
                continue;
            }
            nodes[i]._update();
            nodes[i].draw();
        }
        if (user_draw) {
            user_draw(SPIN);
        }
        requestAnimationFrame(SPIN.update);
        timer++;
        // console.log(nodes.length);
    };

    SPIN.key = (key) => {
        // console.log(down_keys[key]);
        return down_keys[key];
    };

    SPIN.clear_timer = () => {
        timer = 0;
    };

    SPIN.get_timer = () => {
        return timer;
    };

    SPIN.start = (W, H) => {
        cnv = $('cnv');
        console.log(cnv);
        ctx = cnv.getContext('2d');
        width = W;
        height = H;
        cnv.width = width;
        cnv.height = height;
        ctx.textBaseline = 'top';
        ctx.font = '30px mv boli';

        window.addEventListener('keydown', (e) => {
            down_keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            down_keys[e.code] = false;
        });

        SPIN.update();
    };

    SPIN.draw_text = (x, y, clr, _text) => {
        text(x, y, clr, _text);
    }
};

window.addEventListener('load', function() {
    SPIN.start(640, 480)

    let enemies = [], score = 0;

    let enemy_ai = (node) => {
        node.y += 0.1;
    };

    for (let j = 0; j < 3; ++j) {
        for (let i = 0; i < 10; ++i) {
            enemies.push(SPIN.create_node(30+(60)*i, 20+(60)*j, 40, 40, "04ff00", enemy_ai));
        }
    }

    let bullet_ai = (node) => {
        node.y -= 10;
        if (node.y + node.h < 0) {
            node.destroy();
        }

        for (let i = enemies.length - 1; i > -1; --i) {
            if (node.intersect(enemies[i])) {
                if (enemies[i].damage(1)) {
                    enemies[i].destroy();
                    enemies.splice(i, 1);
                    score += 1;
                }
                node.destroy();
                break;
            };
        }
    };

    let fire = (x, y) => {
        if (SPIN.get_timer() > 4) {
            SPIN.create_node(x + 20, y, 10, 10, "#ff00ff", bullet_ai);
            SPIN.clear_timer();
        }
    }

    SPIN.create_node(640/2-25, 400, 50, 50, "#000000", (node) => {
        if (SPIN.key('KeyA') && node.x - 4 >= -1) {
            node.x -= 4;
        }
        if (SPIN.key('KeyD') && node.x + 4 <= 590) {
            node.x += 4;
        }
        if (SPIN.key("Space")) {
            fire(node.x, node.y);
        }
    });

    SPIN.set_draw((s) => {
        s.draw_text(5, 5, "#ffffff", "Игровой счёт: " + score);
    });
});
