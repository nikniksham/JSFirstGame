const SPIN = new function () {
    let SPIN = this, cnv, ctx, width, height, nodes = [], for_destroy = {}, node_count = 0, down_keys = {}, timer = 0, card_move = false, cells = [];
    var mouse_x = 0, mouse_y = 0, offset_x = 0, offset_y = 0, scroll_x = 0, scroll_y = 0, is_pressed = false;
    var html = document.documentElement, cursor = document.body.style.cursor;
    var card_title = ["Альтаировский гамбит", "Вышибалы", "Козырь", "Опять перемена", "Поднимешь руку на оборудование технопарка?"];
    var card_info = ["А вы доверяете своему тактическому гению?", "Береги голову", "Делать дз? Ты что, крейзи?", "Опять отдыхать", "Тварь я дрожащая или право имею?"];
    var card_functions = [(person) => {(Math.random() < 0.5 ? person.damage(5) : person.damage(-5));},
                          (person) => {person.damage(-20);},
                          (person) => {person.home_task = true;},
                          (person) => {person.damage(-10);},
                          (person) => {(Math.random() < 0.5 ? person.ne_portite_damage(15) : null);}];
    var card_images = [new Image(), new Image(), new Image(), new Image(), new Image()];
    card_images[0].src = "img/items/Chess.png";
    card_images[1].src = "img/items/Tenis.png";
    card_images[2].src = "img/items/Homework.png";
    card_images[3].src = "img/items/Peremena.png";
    card_images[4].src = "img/items/Destroy.png";
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
                    person.damage((home_task ? -Math.abs(this.damage) : this.damage));
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
        }

    }

    class Card extends Node {
        constructor (x, y, w, h, img, type, update, func, title, info) {
            x = x * 150 + 69;
            y = y * 150 + 53;
            super(x, y, w, h, img, type, update);
            this.func = func;
            this.title = title;
            this.info = info;
            this.start_x = x;
            this.start_y = y;
            this.on_move = false;
            this.move_offset_x = 0;
            this.move_offset_y = 0;
            this.cell = null;
        }

        move(mouse_x, mouse_y, is_pressed) {
            if (this.on_move) {
                if (is_pressed) {
                    this.x = mouse_x - this.move_offset_x;
                    this.y = mouse_y - this.move_offset_y;
                } else {
                    this.on_move = false;
                    card_move = false;
                    this.x = this.start_x;
                    this.y = this.start_y;
                    var f = false;
                    for (var i = 0; i < cells.length; ++i) {
                        if (cells[i].mouse_intersect(mouse_x, mouse_y)) {
                            this.set_cell(cells[i]);
                            // console.log(this.set_cell(cells[i]));
                            break;
                        }
                    }
                }
            } else {
                if (is_pressed && this.mouse_intersect(mouse_x, mouse_y)) {
                    this.on_move = true;
                    card_move = true;
                    this.move_offset_x = mouse_x - this.start_x;
                    this.move_offset_y = mouse_y - this.start_y;
                }
            }
        }

        set_cell(cell) {
            if (cell != this.cell) {
                if (cell.is_free) {
                    if (this.cell) {
                        this.cell.is_free = true;
                        this.cell.obj = null;
                    }
                    cell.is_free = false;
                    cell.obj = this;
                    this.cell = cell;
                    this.x = cell.x;
                    this.y = cell.y;
                    this.start_x = cell.x;
                    this.start_y = cell.y;
                } else {
                    if (this.cell) {
                        this.cell.is_free = true;
                        this.cell.obj = null;
                    }
                    cell.obj.set_cell(this.cell);
                    this.cell = null;
                    this.set_cell(cell);
                }
            return true;
            } else {
                return false
            }

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
        }

        mouse_intersect(mouse_x, mouse_y) {
            return !(this.x + this.w < mouse_x || this.y + this.h < mouse_y || this.x > mouse_x || this.y > mouse_y);
        }

        destroy() {
            for_destroy[this.id] = this;
            if (this.cell) {
                this.cell.obj = null;
                this.cell.is_free = true;
            }
        }
    }

    class Cell {
        constructor(x, y, w, h) {
            this.x = x * 150 + 69;
            this.y = y * 150 + 53;
            this.w = w;
            this.h = h;
            this.is_free = true;
            this.obj = null
            cells.push(this);
//            console.log("Я родился на " + this.x + " " + this.y);
        }

        mouse_intersect(mouse_x, mouse_y) {
            return !(this.x + this.w < mouse_x || this.y + this.h < mouse_y || this.x > mouse_x || this.y > mouse_y);;
        }
    }

    class Person extends Node {
        constructor (x, y, w, h, img, type, title, update) {
            super(x * 150, y * 150, w, h, img, type, update);
            this.idle_image = img;
            this.hp = 100;
        }
    }

    SPIN.create_node = (x, y, w, h, img, type, update) => {
        return new Node(x, y, w, h, img, type, update);
    };

    SPIN.create_subject = (x, y, w, h, img, type, title, update, damage, chance, info) => {
        return new Subject(x, y, w, h, img, type, title, update, damage, chance, info);
    };

    SPIN.create_card = (card_id) => {
        var obj = new Card(1, 3, 112, 144, card_images[card_id], "card", null, card_functions[card_id], card_title[card_id], card_info[card_id]), tmp_obj = null;
        if (cells[cells.length - 1].obj) {
            cells[cells.length - 1].obj.destroy();
        }
        for (var i = 2; i < cells.length; ++i) {
            tmp_obj = cells[i].obj;
            if (obj) {
                cells[i].is_free = false;
                cells[i].obj = obj;
                obj.x = cells[i].x;
                obj.y = cells[i].y;
                obj.start_x = cells[i].x;
                obj.start_y = cells[i].y;
                obj.cell = cells[i];
            } else {
                cells[i].is_free = true;
            }
            obj = tmp_obj;
        }
    };

    SPIN.create_cell = (x, y) => {
        return new Cell(x, y, 112, 144);
    };

    SPIN.update = () => {
        ctx.clearRect(0, 0, width, height);
        for (let i = nodes.length - 1; i > -1; --i) {
            if (nodes[i].type != "card" && nodes[i].type != "person") {
                if (for_destroy[nodes[i].id]) {
                    nodes.splice(i, 1);
                    continue;
                } else if (nodes[i].type == "subject" && nodes[i].mouse_intersect(mouse_x, mouse_y) && !card_move) {
                    nodes[i].show_info();
                }
                nodes[i]._update();
                nodes[i].draw();
            }
        }
        for (let i = nodes.length - 1; i > -1; --i) {
            if ((nodes[i].type == "card" && !nodes[i].on_move) || nodes[i].type == "person") {
                if (for_destroy[nodes[i].id]) {
                    nodes.splice(i, 1);
                    continue;
                } else if (nodes[i].type == "card" && !card_move) {
                    nodes[i].move(mouse_x, mouse_y, is_pressed);
                    if (nodes[i].mouse_intersect(mouse_x, mouse_y)) {nodes[i].show_info();}
                }
                nodes[i]._update();
                nodes[i].draw();
            }
        }

        for (let i = nodes.length - 1; i > -1; --i) {
            if (nodes[i].type == "card") {
                if (for_destroy[nodes[i].id]) {
                    nodes.splice(i, 1);
                    continue;
                } else if (nodes[i].on_move) {
                    nodes[i].move(mouse_x, mouse_y, is_pressed);
                    if (nodes[i].mouse_intersect(mouse_x, mouse_y)) {nodes[i].show_info();}
                    nodes[i]._update();
                    nodes[i].draw();
                }
            }
        }
        document.getElementById("cnv").style.cursor = (is_pressed ? "url('img/cursorPressed.png'), auto" : "url('img/cursor.png'), auto");
        // console.log(document.getElementById("cnv").style.cursor);
        // console.log(document.body.style.cursor);
        requestAnimationFrame(SPIN.update);
        timer++;
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
            mouse_x = event.clientX - offset_x + scroll_x;
            mouse_y = event.clientY - offset_y + scroll_y;
        });

        addEventListener('scroll', (event) => {
            scroll_x = html.scrollLeft;
            scroll_y = html.scrollTop;
//            console.log("А? " + scroll_x + " " + scroll_y)
        });

        addEventListener('mousedown', (event) => {
            is_pressed = true;
        });

        addEventListener('mouseup', (event) => {
            is_pressed = false;
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
    var cell_coords = [[1, 1], [2, 1], [1, 3], [2, 3], [3, 3], [4, 3], [1, 4], [2, 4], [3, 4], [4, 4]];
    for (var i = 0; i < cell_coords.length; ++i) {
        SPIN.create_cell(cell_coords[i][0], cell_coords[i][1]);
    }
    SPIN.create_card(2);
    SPIN.create_card(1);
    SPIN.create_card(3);
    SPIN.create_card(0);
    SPIN.create_card(1);
    SPIN.create_card(2);
    SPIN.create_card(0);
    SPIN.create_card(1);
    SPIN.create_card(3);
    SPIN.create_card(4);
    var img = new Image();
    img.src = "img/Board.png";
    SPIN.create_node(0, 0, 1050, 1050, img, "board", null);
    // var img = new Image();
    // img.src = "img/Board.png";
});
