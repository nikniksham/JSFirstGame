const SPIN = new function () {
    let SPIN = this, cnv, ctx, width, height, nodes = [], for_destroy = {}, node_count = 0, down_keys = {}, timer = 0, card_move = false, cells = [];
    var mouse_x = 0, mouse_y = 0, offset_x = 0, offset_y = 0, scroll_x = 0, scroll_y = 0, is_pressed = false, destr_card = 2, cell_id = 0, person, move_del = false;
    var html = document.documentElement, cursor = document.body.style.cursor;
    var delete_image = new Image();
    delete_image.src = "img/cells/Delete.png";
    let ne_portite_image_func = (person) => {
        var img = new Image();
        img.src = "img/DontDestroy.png";
        SPIN.create_node(50 + Math.random() * 650, 900, 350, 160, img, "popup", (node) => {node.y -= 5; if (node.y - this.h < 0) {node.destroy()}});
        person.ne_portite_damage(50);
    }
    var card_title = ["Альтаировский гамбит", "Угадай, какой загашу", "Домашняя работа", "Опять перемена", "Поднимешь руку на оборудование технопарка?"];
    var card_info = ["А вы доверяете своему тактическому гению?", "4 стола, 3 ракетки, а мячика нет", "Сомнительный досуг", "Сложно продолжать спать пока звенит колокольчик", "Тварь я дрожащая или право имею?"];
    var card_types = ["chess", "tennis", "ht", "relax", "delete"];
    var card_functions = [(person) => {(Math.random() < 0.5 ? person.damage(5, true) : person.damage(-5, true));},
                          (person) => {person.damage(-20, true);},
                          (person) => {person.home_task = true;},
                          (person) => {person.damage(-10, true);},
                          (person) => {ne_portite_image_func(person)}];
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
        constructor (x, y, w, h, img, type, title, update, damage, chance, info, sub_type) {
            super(x * 150, y * 150, w, h, img, type, update, sub_type);
            this.damage = damage;
            this.chance = chance;
            this.info = info;
            this.title = title;
            this.sub_type = sub_type;
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
        constructor (x, y, w, h, img, type, update, func, title, info, card_type) {
            x = x * 150 + 69;
            y = y * 150 + 53;
            super(x, y, w, h, img, type, update);
            this.func = func;
            this.card_type = card_type;
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
                    move_del = false;
                    this.on_move = false;
                    if (this.card_type == "delete") {
                        card_move = false;
                        for (var i = 0; i < nodes.length; ++i) {
                            if (nodes[i].type == "subject" && nodes[i].sub_type != "Shmon" && nodes[i].mouse_intersect(mouse_x, mouse_y)) {
                                nodes[i].destroy();
                                this.func(person);
                                this.destroy();
                                break
                            }
                        }
                    }
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
                    if (this.card_type == "delete") {
                        move_del = true;
                    }
                    this.on_move = true;
                    card_move = true;
                    this.move_offset_x = mouse_x - this.start_x;
                    this.move_offset_y = mouse_y - this.start_y;
                }
            }
        }

        set_cell(cell) {
            if (cell != this.cell && !(cell.cell_id in [0, 1] && this.card_type == "delete")) {
//                console.log("New operation");
//                console.log(this.cell + " && " + (this.cell && this.cell.cell_id in [0, 1]) + " || " + (cell.cell_id in [0, 1]) + " && " + cell.obj)
                var f = (cell.cell_id in [0, 1])
                if (this.cell && this.cell.cell_id in [0, 1] || cell.cell_id in [0, 1] && cell.obj) {
                    return false;
                } else if (!cell.obj) {
//                    console.log("Тут 1");
                    if (this.cell) {
                        this.cell.obj = null;
                    }
                    cell.obj = this;
                    this.cell = cell;
                    this.x = cell.x;
                    this.y = cell.y;
                    this.start_x = cell.x;
                    this.start_y = cell.y;
                } else if (!this.cell) {
//                    console.log("Тут 2");
                    cell.obj = this;
                    this.cell = cell;
                    this.x = cell.x;
                    this.y = cell.y;
                    this.start_x = cell.x;
                    this.start_y = cell.y;
                } else {
//                    console.log("Тут 3");
                    if (this.cell) {
                        this.cell.obj = null;
                    }
                    cell.obj.set_cell(this.cell);
                    this.cell = null;
                    this.set_cell(cell);
                }
            if (f) {this.func(person);}
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
            }
        }
    }

    class Cell {
        constructor(x, y, w, h) {
            this.x = x * 150 + 69;
            this.y = y * 150 + 53;
            this.w = w;
            this.h = h;
            this.obj = null
            this.cell_id = cell_id;
            cell_id++;
            cells.push(this);
//            console.log("Я родился на " + this.x + " " + this.y);
        }

        mouse_intersect(mouse_x, mouse_y) {
            return !(this.x + this.w < mouse_x || this.y + this.h < mouse_y || this.x > mouse_x || this.y > mouse_y);;
        }
    }

    class Person extends Node {
        constructor (x, y, w, h, img, type, update) {
            super(x * 150, y * 150, w, h, img, type, update);
            this.type = type
            this.idle_image = img;
            this.max_hp = 250;
            this.hp = this.max_hp;
            this.speed = 100;
            this.frame = 0;
            this.cur_frame = 0;
            this.need_frame = 6;
            this.on_move = false;
            this.is_alive = true;
            this.some_activity = false;
            this.cell_x = x;
            this.cell_y = y;
            this.front = [];
            this.back = [];
            this.left = [];
            this.right = [];
            person = this;
        }

        set_images(front, back, left, right) {
            this.front = [];
            this.back = [];
            this.left = [];
            this.right = [];

            for (var i = 0; i < front.length; ++i) {
                var img = new Image();
                img.src = front[i];
                this.front.push(img);
            }

            for (var i = 0; i < back.length; ++i) {
                var img = new Image();
                img.src = back[i];
                this.back.push(img);
            }

            for (var i = 0; i < left.length; ++i) {
                var img = new Image();
                img.src = left[i];
                this.left.push(img);
            }

            for (var i = 0; i < right.length; ++i) {
                var img = new Image();
                img.src = right[i];
                this.right.push(img);
            }
        }

        go_to_next() {
            if (this.cell_x * 150 == this.x && this.cell_y * 150 == this.y && !this.some_activity && !card_move && this.is_alive) {
                for (var i = 0; i < 2; ++i) {
                    if (cells[i].obj) { cells[i].obj.destroy(); }
                }
                if (this.cell_x == 6 && this.cell_y == 6) {
                    for (var i = 0; i < nodes.length; ++i) {
                        if (nodes[i].type == "subject") {
                            nodes[i].damage *= 1.05;
//                            console.log("!!!!!");
                        }
                    }
                    this.damage(-50);
                }
                this.on_move = true;
                if (this.cell_x == 0 && this.cell_y <= 6 && this.cell_y > 0) {
                    this.cell_y--;
                } else if (this.cell_x <= 6 && this.cell_y == 6) {
                    this.cell_x--;
                } else if (this.cell_x >= 0 && this.cell_x < 6 && this.cell_y == 0) {
                    this.cell_x++;
                } else if (this.cell_x == 6 && this.cell_y >= 0 && this.cell_y != 6) {
                    this.cell_y++;
                }
            }
        }

        move() {
            if (this.x > this.cell_x * 150) {
                this.x = Math.max(this.cell_x * 150, this.x - this.speed);
                if (this.frame > this.need_frame) {
                    this.frame = 0;
                    this.cur_frame++;
                    if (this.cur_frame >= this.left.length) { this.cur_frame = 0; }
                    this.img = this.left[this.cur_frame];
                }
                this.frame++;
            } else if (this.x < this.cell_x * 150) {
                this.x = Math.min(this.cell_x * 150, this.x + this.speed);
                if (this.frame > this.need_frame) {
                    this.frame = 0;
                    this.cur_frame++;
                    if (this.cur_frame >= this.right.length) { this.cur_frame = 0; }
                    this.img = this.right[this.cur_frame];
                }
                this.frame++;
            } else if (this.y > this.cell_y * 150) {
                this.y = Math.max(this.cell_y * 150, this.y - this.speed);
                if (this.frame > this.need_frame) {
                    this.frame = 0;
                    this.cur_frame++;
                    if (this.cur_frame >= this.front.length) { this.cur_frame = 0; }
                    this.img = this.front[this.cur_frame];
                }
                this.frame++;
            } else if (this.y < this.cell_y * 150) {
                this.y = Math.min(this.cell_y * 150, this.y + this.speed);
                if (this.frame > this.need_frame) {
                    this.frame = 0;
                    this.cur_frame++;
                    if (this.cur_frame >= this.back.length) { this.cur_frame = 0; }
                    this.img = this.back[this.cur_frame];
                }
                this.frame++;
            } else {
                if (this.on_move) {
                    this.on_move = false;
                    for (var i = 0; i < nodes.length; ++i) {
                        if (nodes[i].type == "subject") {
                            if (this.x == nodes[i].x && this.y == nodes[i].y && Math.random() < nodes[i].chance) {
                                if (nodes[i].sub_type == "Shmon") {
                                    this.shmon_damage(nodes[i].damage);
                                } else {
                                    this.damage(nodes[i].damage);
                                }
                            }
                        }
                    }
                }
                this.home_task = false;
                this.img = this.idle_image;
            }

        }

        ne_portite_damage(dam) {
            // TODO: Отрисовывать специальное что-то
            this.damage(dam, true);
        }

        shmon_damage(dam) {
            var n_d_c = 2;
            for (var i = cells.length - 1; i > 1; --i) {
                if (cells[i].obj) {
                    n_d_c--;
                    cells[i].obj.destroy();
                }
                if (n_d_c <= 0) {
                    break;
                }
            }
            this.damage(dam, true);
        }

        damage(dam, fr_sh = false) {
            if (this.home_task && !fr_sh) {
                this.hp += Math.abs(Math.floor(dam / 2 + 0.5));
            } else {
                this.hp -= Math.floor(dam + 0.5);
            }
//            this.hp -= ((this.home_task && !fr_sh) ? -Math.abs(this.dam) : this.dam);
            if (this.hp > this.max_hp) {this.hp = this.max_hp;}
            if (this.hp < 0) {this.hp = 0;}
            if (this.hp <= 0) {
                this.is_alive = false;
            } else if (!fr_sh && !this.home_task) {  // && Math.random() > 0.5
                var id = 0, count = 0;
                while (count < 1 && dam > 0) {
                    id = Math.floor(Math.random() * 4.1);
                    if (id == 4) {
                        if (destr_card > 0) {
                            destr_card--;
                        } else {
                            continue;
                        }
                    }
                    SPIN.create_card(id);
//                    SPIN.create_card(4);
                    count++;
                }
            }
//        console.log("HP: " + this.hp);
        }
    }

    SPIN.create_node = (x, y, w, h, img, type, update) => {
        return new Node(x, y, w, h, img, type, update);
    };

    SPIN.create_subject = (x, y, w, h, img, type, title, update, damage, chance, info, sub_type) => {
        return new Subject(x, y, w, h, img, type, title, update, damage, chance, info, sub_type);
    };

    SPIN.create_card = (card_id) => {
        var f = true;
        for (var i = 2; i < cells.length; ++i) {
            if (!cells[i].obj) {
                var obje = new Card(1, 3, 112, 144, card_images[card_id], "card", null, card_functions[card_id], card_title[card_id], card_info[card_id], card_types[card_id]);
                obje.set_cell(cells[i]);
                f = false;
                break;
            }
        }

        if (f) {
            if (cells[cells.length - 1].obj) {
                cells[cells.length - 1].obj.destroy();
            }

            for (var i = cells.length - 1; i > 2; --i) {
                var obj = cells[i - 1].obj;
                cells[i].obj = null;
                if (obj) {
//                    console.log("move obj to " + i);
                    obj.set_cell(cells[i]);
                }
            }
//            console.log("Задаю клетку, тут я ваще не понял");
            var obje = new Card(1, 3, 112, 144, card_images[card_id], "card", null, card_functions[card_id], card_title[card_id], card_info[card_id]);
            obje.set_cell(cells[2]);
        }
    };

    SPIN.create_cell = (x, y) => {
        return new Cell(x, y, 112, 144);
    };

    SPIN.create_person = (x, y, w, h, img, type, update) => {
        return new Person(x, y, w, h, img, type, update);
    };

    SPIN.update = () => {
        ctx.clearRect(0, 0, width, height);
        for (let i = nodes.length - 1; i > -1; --i) {
            if (nodes[i].type != "card" && nodes[i].type != "person" && nodes[i].type != "popup") {
                if (for_destroy[nodes[i].id]) {
                    nodes.splice(i, 1);
                    continue;
                } else if (nodes[i].type == "subject") {
                    if (nodes[i].mouse_intersect(mouse_x, mouse_y) && !card_move) {
                        nodes[i].show_info();
                    }
                    if (nodes[i].sub_type != "Shmon" && move_del) {
//                        console.log("Ну рисуй");
                        drawImage(delete_image, nodes[i].x, nodes[i].y);
                    }
                }
                nodes[i]._update();
                nodes[i].draw();
            }
        }

        rect(495, 245, 390, 60, "#444444");
        rect(500, 250, 380, 50, "#ffffff");

        for (let i = nodes.length - 1; i > -1; --i) {
            if ((nodes[i].type == "card" && !nodes[i].on_move) || nodes[i].type == "person") {
                if (for_destroy[nodes[i].id]) {
                    nodes.splice(i, 1);
                    continue;
                } else if (nodes[i].type == "card" && !card_move) {
                    nodes[i].move(mouse_x, mouse_y, is_pressed);
                    if (nodes[i].mouse_intersect(mouse_x, mouse_y)) {nodes[i].show_info();}
                } else if (nodes[i].type == "person") {
                    rect(500, 250, 380 * nodes[i].hp / nodes[i].max_hp, 50, "#ff0000");
                    drawText(620, 320, "#ffffff", nodes[i].hp + " / " + nodes[i].max_hp);
//                  console.log("I'm here " + down_keys["KeyG"]);
                    if (!nodes[i].some_activity && nodes[i].is_alive) {
                        if (nodes[i].on_move) {
                            nodes[i].move();
                        } else if (down_keys["KeyG"]) {
                            nodes[i].go_to_next();
                        }
                    }
                }
                nodes[i]._update();
                nodes[i].draw();
            }
        }

        for (let i = nodes.length - 1; i > -1; --i) {
            if (nodes[i].type == "popup") {
                if (for_destroy[nodes[i].id]) {
                    nodes.splice(i, 1);
                    continue;
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

//      console.log(document.getElementById("cnv").style.cursor);
      document.getElementById("cnv").style.cursor = (is_pressed ? "url('img/cursorPressed.png'), auto" : "url('img/cursor.png'), auto");
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
            // KeyG
            // console.log(e.code);
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
            card_move = false;
            move_del = false;
        });

        SPIN.update();
    };
};

window.addEventListener('load', function() {
    SPIN.start(1050, 1050)
    var sub_images = ["Chemistry.png", "English.png", "History.png", "Informatic.png", "Math.png", "PE.png", "Physics.png", "Russian.png", "Shmon.png", "Informatic.png", "Russian.png", "Math.png"];
    var sub_damage = [[0.8, 10], [0.4, 15], [0.2, -5], [0.2, -15], [0.6, 30], [0, 0], [0.7, 10], [0.1, 60], [0.5, 30], [0.2, -15], [0.1, 60], [0.6, 30]];
    var sub_position = [[4, 0], [0, 2], [6, 3], [4, 6], [0, 6], [6, 5], [0, 4], [0, 0], [6, 0], [6, 1], [2, 6], [2, 0]]
    var sub_types = ["Chemistry", "English", "History", "IT", "Math", "Idk", "Physic", "Russian", "Shmon", "IT", "Russian", "Math"]
    var sub_titles = ["Где лабораторные работы?", "Эти диалоги в этом прекрасном качестве", "Верните мой мезозой", "{{text}}", "Каков шанс сдать ЕГЭ?", "Кто-кто?", "E = mc^2", "Татары злопамятны", "USB флешки на стол!", "{{text}}", "Татары злопамятны", "Каков шанс сдать ЕГЭ?"];
    var sub_info = ["У нас было 2 мешка травы, 75 таблеток мисколина, 5 марок мощнейшей кислоты, пол солонки кокаина...", "Jjsfj jsjfa oasfj asfj safjaj asfjjqj afsasf kaskfas kasf kasf kassafkm",
                    "Одна история офигеннее другой", "{{description}}", "Вы знаете, чем учителя отличаются от педофилов? *первый урок математики*", "Ты видишь физру? Нет. И я не вижу, а она есть", "Дифференцируемый импенданс конденсатора при параллельном подключении в сеть с переменным током 50Гц?",
                    "Сожмись и молись, что бы тебя не спросили", "Или вы выверните карманы, или я выверну вас", "{{description}}", "Сожмись и молись, что бы тебя не спросили", "Вы знаете, чем учителя отличаются от педофилов? *первый урок математики*"];
    for (var i = 0; i < sub_images.length; ++i) {
        var img = new Image();
        img.src = "img/cells/" + sub_images[i];
            SPIN.create_subject(sub_position[i][0], sub_position[i][1], 150, 150, img, "subject", sub_titles[i], null, sub_damage[i][1], sub_damage[i][0], sub_info[i], sub_types[i]);
    }
    var cell_coords = [[1, 1], [2, 1], [1, 3], [2, 3], [3, 3], [4, 3], [1, 4], [2, 4], [3, 4], [4, 4]];
    for (var i = 0; i < cell_coords.length; ++i) {
        SPIN.create_cell(cell_coords[i][0], cell_coords[i][1]);
    }
//    SPIN.create_card(2);
//    SPIN.create_card(1);
//    SPIN.create_card(3);
//    SPIN.create_card(0);
//    SPIN.create_card(1);
//    SPIN.create_card(2);
//    SPIN.create_card(0);
//    SPIN.create_card(1);
//    SPIN.create_card(3);
//    SPIN.create_card(4);
    var img = new Image();
    img.src = "img/hero/Idle.png";
    person = SPIN.create_person(6, 6, 150, 150, img, "person", null)
    person.set_images(["img/hero/Top1.png", "img/hero/Top2.png"], ["img/hero/Back1.png", "img/hero/Back2.png"],
                      ["img/hero/Left1.png", "img/hero/Left2.png"], ["img/hero/Right1.png", "img/hero/Right2.png"])
    var img = new Image();
    img.src = "img/Board.png";
    SPIN.create_node(0, 0, 1050, 1050, img, "board", null);
    // var img = new Image();
    // img.src = "img/Board.png";
});
