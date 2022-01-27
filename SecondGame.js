const SPIN = new function () {
    let SPIN = this, cnv, ctx, width, height, nodes = [], for_destroy = {}, node_count = 0, down_keys = {}, timer = 0, user_draw;
    var img = new Image();
    var mouse_x = 0, mouse_y = 0, offset_x = 0, offset_y = 0;
    img.src = "img/Board.png";

    let $ = (id) => {return document.getElementById(id)};

    let drawText = (x, y, clr, text) => {
        ctx.fillStyle = clr;
        ctx.fillText(text, x, y);
    };

    let rect = (x, y, w, h, clr) => {
        ctx.fillStyle = clr;
        ctx.fillRect(x, y, w, h)
    };

    let drawImage = (image, x, y) => {
        ctx.drawImage(image, x, y);
    };

    SPIN.set_draw = (f) => {
        user_draw = f;
    };

    class Node {
        constructor (x, y, w, h, img, type, update) {
            this.id = node_count++;
            this.type = type;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.img = img;
            this.update = update;

            nodes.push(this);
        }

        _update () {
            if (this.update) {
                this.update(this);
            }
        }

        draw() {
            drawImage(this.img, this.x, this.y);
        }

        destroy() {
            for_destroy[this.id] = this;
        }

        intersect(other) {
            return !(this.x + this.w < other.x || this.y + this.h < other.y || this.x > other.x + other.w || this.y > other.y + other.h);
        }
    }

    class Subject extends Node {
        constructor (x, y, w, h, img, type, title, update, damage, chance, info) {
            super(x * 150, y * 150, w, h, img, type, update);
            this.damage = damage;
            this.chance = chance;
            this.info = info;
            this.title = title;
        }

        study(person) {
            var home_task = person.home_task;
            if (home_task) {
                person.home_task = false;
            }
            if (Math.random() < this.chance) {
                if (this.title == "shmon") {
                    person.shmon_damage(this.damage);
                } else {
                    person.damage((home_task ? Math.abs(this.damage) : this.damage));
                }
            }
        }
        mouse_intersect(mouse_x, mouse_y) {
            return !(this.x + this.w < mouse_x || this.y + this.h < mouse_y || this.x > mouse_x || this.y > mouse_y);
        }

        show_info() {
            drawText(220, 360, "#ffffff", this.title);
            var ln = 0;
            var mxl = 43;
            var sy = 400;
            while (true) {
                if (this.info.length - ln > mxl) {
                    drawText(220, sy, "#ffffff", this.info.substr(ln, mxl));
                    sy += 30;
                    ln += mxl;
                } else {
                    drawText(220, sy, "#ffffff", this.info.substr(ln, this.info.length - ln));
                    break;
                }
            }
        };

    }

    class Card extends Node {
        constructor (x, y, w, h, img, type, update, func) {
            super(x, y, w, h, img, type, update);


        }
    }

    SPIN.create_node = (x, y, w, h, img, type, update) => {
        return new Node(x, y, w, h, img, type, update);
    };

    SPIN.create_subject = (x, y, w, h, img, type, title, update, damage, chance, info) => {
        return new Subject(x, y, w, h, img, type, title, update, damage, chance, info);
    };

    SPIN.update = () => {
        ctx.clearRect(0, 0, width, height);
        for (let i = nodes.length - 1; i > -1; --i) {
            if (for_destroy[nodes[i].id]) {
                nodes.splice(i, 1);
                continue;
            } else if (nodes[i].type == "subject" && nodes[i].mouse_intersect(mouse_x, mouse_y)) {
                nodes[i].show_info()
            }
            nodes[i]._update();
            nodes[i].draw();
        }
        if (user_draw) {
            user_draw(SPIN);
        }
        // ctx.drawImage(img, 0, 0);
        requestAnimationFrame(SPIN.update);
        timer++;
        // console.log(offset_x, offset_y);
    };

    SPIN.key = (key) => {
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
        // console.log(cnv);
        ctx = cnv.getContext('2d');
        width = W;
        height = H;
        cnv.width = width;
        cnv.height = height;
        ctx.textBaseline = 'top';
        ctx.font = '30px Aria';
        offset_x = cnv.offsetLeft;
        offset_y = cnv.offsetTop;

        window.addEventListener('keydown', (e) => {
            down_keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            down_keys[e.code] = false;
        });

        window.addEventListener('resize', (e)  => {
            offset_x = cnv.offsetLeft;
            offset_y = cnv.offsetTop;
        });

        addEventListener('mousemove', (event) => {
            // на какую клавишу ткнули
            mouse_x = event.clientX - offset_x;
            mouse_y = event.clientY - offset_y;
        });


        addEventListener('mousemove', (event) => {
            // TODO: something with click
        });

        SPIN.update();
    };
};

window.addEventListener('load', function() {
    SPIN.start(1050, 1050)
    var sub_images = ["Chemistry.png", "English.png", "History.png", "Informatic.png", "Math.png", "PE.png", "Physics.png", "Russian.png", "Shmon.png", "Informatic.png", "Russian.png", "Math.png"];
    var sub_damage = [[0.3, 15], [0.1, 25], [0.25, -5], [0.4, -15], [0.7, 30], [0, 0], [0.2, 10], [0.1, 50], [0.3, 30], [0.4, -15], [0.1, 50], [0.7, 30]];
    var sub_position = [[4, 0], [0, 2], [6, 3], [4, 6], [0, 6], [6, 5], [0, 4], [0, 0], [6, 0], [6, 1], [2, 6], [2, 0]]
    var sub_types = ["У нас было..", "Птичий язык", "Верните мой мезозой", "{{text}}", "Каков шанс сдать ЕГЭ?", "Кто-кто?", "E = mc^2", "Татары злопамятны", "USB флешки на стол!", "{{text}}", "Татары злопамятны", "Каков шанс сдать ЕГЭ?"];
    var sub_info = ["...2 мешка травы, 75 таблеток мисколина, 5 марок мощнейшей кислоты, пол солонки кокаина...", "Jjsfj jsjfa oasfj asfj safjaj asfjjqj afsasf kaskfas kasf kasf kassafkm",
                    "Одна история офигеннее другой", "{{description}}", "Правило какашки запомнится на всю жизнь...", "Ты видишь физру? Нет. И я не вижу, а она есть", "Дифференцируемый импенданс конденсатора при параллельном подключении в сеть с переменным током 50Гц?",
                    "Сожмись и молись, что бы тебя не спросили", "Или вы выверните карманы, или я выверну вас", "{{description}}", "Сожмись и молись, что бы тебя не спросили", "Правило какашки запомнится на всю жизнь..."];
    for (var i = 0; i < sub_images.length; ++i) {
        var img = new Image();
        img.src = "img/cells/" + sub_images[i];
        SPIN.create_subject(sub_position[i][0], sub_position[i][1], 150, 150, img, "subject", sub_types[i], null, sub_damage[i][0], sub_damage[i][1], sub_info[i]);
    }

    var img = new Image();
    img.src = "img/Board.png";
    SPIN.create_node(0, 0, 1050, 1050, img, "board", null);

    // var img = new Image();
    // img.src = "img/Board.png";
});
