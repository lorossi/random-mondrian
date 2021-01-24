/*jshint esversion: 6 */

let chart, stats;
let inside_points, total_points;
let ctx, canvas;

class Sketch {
  constructor(canvas, ctx, fps) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.setFps(fps);
  }

  setFps(fps) {
    // set fps
    this.fps = fps || 60;
    // keep track of time to handle fps
    this.then = performance.now();
    // time between frames
    this.fps_interval = 1 / this.fps;
  }

  run() {
    // bootstrap the sketch
    this.setup();
    // anti alias
    this.ctx.imageSmoothingQuality = "high";
    this.timeDraw();
  }

  timeDraw() {
    // request another frame
    window.requestAnimationFrame(this.timeDraw.bind(this));
    let diff;
    diff = performance.now() - this.then;
    if (diff < this.fps_interval) {
    // not enough time has passed, so we request next frame and give up on this render
      return;
    }
    // updated last frame rendered time
    this.then = performance.now();
    // now draw
    this.ctx.save();
    this.draw();
    this.ctx.restore();
  }

  background(color) {
    // reset background
    // reset canvas
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // set background
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  download() {
    // create download link
    let link = $("<a></a>");
    // append to body
    $("body").append(link);
    // edit values
    $(link).attr("download", `Mondrian-${this.name}.png`);
    $(link).attr("href", this.canvas.toDataURL("image/png"));
    // click on it
    $(link)[0].click();
    // remove it
    $(link).remove();
  }

  resize(size) {
    this.canvas.width = size;
    this.canvas.height = size;
    this.setup();
  }

  reset() {
    this.setup();
  }

  setup() {
    // this is ran once
    this.palette = [0, 55, 220];
    // give some variance to colors
    for (let i = 0; i < this.palette.length; i++) {
      this.palette[i] = wrap(this.palette[i] + random(-5, 5, true), 0, 360);
    }
    this.drawn = false;
    this.scl = 0.8;
    this.color_percentage = random(0.1, 0.6);

    // calculate text positions
    let text_height = (1 - this.scl) / 2 * this.canvas.height * 0.5;
    let text_left = (1 - this.scl) / 2 * this.canvas.width;
    let text_right = this.canvas.width - (1 - this.scl) / 2 * this.canvas.width;
    let text_top = text_height * 0.5;
    let text_bottom = this.canvas.height - text_height;
    this.name = random(10000, 99999, true);
    this.title = new Title(this.name, text_height, text_left, text_right, text_top, text_bottom);

    // calculate minimum size of each rectangle
    let min_size = map(this.canvas.width, 0, 1000, 0, 350);
    this.rectangles = [];
    this.rectangles.push(new Rectangle(0, 0, this.canvas.width, this.canvas.height, min_size));

    // outer rectangle
    this.frame = new Frame(this.canvas.width, this.canvas.height);

    // some graining texture
    this.texture = new Texture(this.canvas.width, this.canvas.height);
  }

  draw() {
    // now draw everything but only once
    if (!this.drawn) {
      this.drawn = true;

      // split all rectangles that can be split
      while (this.rectangles.filter(r => r.can_split).length > 0) {
        // shuffle the array so we don't always pick the first one
        shuffle_array(this.rectangles);
        let index = this.rectangles.findIndex(r => r.can_split);
        let new_rectangles = this.rectangles[index].split();
        // remove the triangle
        this.rectangles.splice(index, 1);
        // add the new triangles
        new_rectangles.forEach((r, i) => {
          this.rectangles.push(r);
        });
      }

      let hues_length = Math.ceil(this.rectangles.length * this.color_percentage);
      let hues = [];

      for (let i = 0; i < hues_length; i++) {
        hues.push(this.palette[i % this.palette.length]);
      }

      while (this.rectangles.filter(r => r.colored).length / this.rectangles.length < this.color_percentage) {
        shuffle_array(this.rectangles);
        let index = this.rectangles.findIndex(r => !r.colored);
        let hue = hues.pop();
        this.rectangles[index].color = `hsl(${hue}, 100%, 50%)`;
      }

      this.ctx.save();
      this.background("white");
      this.title.show(ctx);

      // scaling
      this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
      this.ctx.scale(this.scl, this.scl);
      this.ctx.translate(-this.canvas.width/2, -this.canvas.height/2);
      // show frame
      this.frame.show(this.ctx);
      // now start drawing the actual stuff
      this.rectangles.forEach((r, i) => {
        r.show(this.ctx);
      });
      // add some texture
      this.texture.show(this.ctx);
    }
    this.ctx.restore();
  }
}

class Title {
  constructor(name, height, left, right, top, bottom) {
    this.top_text = `Composition N° ${name}`;
    this.bottom_text = "Random Mondrian";
    this.website = "www.lorenzoros.si";
    this.color = "#000000";
    this.top_font = `${height}px Raleway`;
    this.bottom_font = `${height/2}px Raleway`;
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  show(ctx) {
    ctx.save();

    ctx.font = this.top_font;
    ctx.textBaseline = "top";
    ctx.textAlign = "start";
    ctx.fillStyle = this.color;
    ctx.fillText(this.top_text, this.left, this.top);

    ctx.font = this.bottom_font;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "end";
    ctx.fillStyle = this.color;
    ctx.fillText(this.bottom_text, this.right, this.bottom);

    ctx.font = this.bottom_font;
    ctx.textBaseline = "bottom";
    ctx.textAlign = "start";
    ctx.fillStyle = this.color;
    ctx.fillText(this.website, this.left, this.bottom);

    ctx.restore();
  }
}


class Rectangle {
  constructor(x, y, w, h, min_size) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this._color = null;

    this.direction = Math.random() > 0.5 ? "horizontal" : "vertical";
    this.children = parseInt(random(2, 3, true));

    this.stroke_weight = 8;
    this.fill_chanche = 0.2;
    this.min_size = min_size;
  }

  split() {
    let new_rectangles = [];
    let new_dimension = Array(this.children).fill(0);
    let sum = 0;

    for (let i = 0; i < new_dimension.length; i++) {
      new_dimension[i] = random(1, 2, true);
      sum += new_dimension[i];
    }

    for (let i = 0; i < new_dimension.length; i++) {
      new_dimension[i] /= sum;
    }

    if (this.direction === "horizontal") {
      let new_w = this.w;
      let new_direction = "vertical";
      for (let i = 0; i < this.children; i++) {
        let new_h = new_dimension[i] * this.h;
        let new_x = this.x;
        let new_y = this.y + partial_sum(new_dimension, i) * this.h;
        new_rectangles.push(new Rectangle(new_x, new_y, new_w, new_h, this.min_size));
      }
    } else if (this.direction === "vertical") {
      let new_h = this.h;
      let new_direction = "horizontal";
      for (let i = 0; i < this.children; i++) {
        let new_w = new_dimension[i] * this.w;
        let new_x = this.x + partial_sum(new_dimension, i) * this.w;
        let new_y = this.y;
        new_rectangles.push(new Rectangle(new_x, new_y, new_w, new_h, this.min_size));
      }
    }
    return new_rectangles;
  }

  show(ctx) {
    ctx.save();
    ctx.fillStyle = this._color || "white";
    ctx.fillRect(this.x + this.stroke_weight / 2, this.y + this.stroke_weight / 2, this.w - this.stroke_weight, this.h - this.stroke_weight);
    ctx.restore();
  }

  get can_split() {
    if (this.direction === "horizontal") {
      if (this.h > this.min_size) {
        return true;
      } else if (this.w > this.min_size) {
        this.direction = "vertical";
        return true;
      } else {
        return false;
      }
    }
    else if (this.direction === "vertical") {
      if (this.w > this.min_size) {
        return true;
      } else if (this.h > this.min_size) {
        this.direction = "horizontal";
        return true;
      } else {
        return false;
      }
    }
  }

  get colored() {
    return this._color != null;
  }

  get color() {
    return this._color;
  }

  set color(c) {
    this._color = c;
  }
}


class Frame {
  constructor(w, h) {
    this.w = w;
    this.h = h;
  }

  show(ctx) {
    ctx.save();
    ctx.lineWidth = this.stroke_weight;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.strokeRect(0, 0, this.w, this.h);
    ctx.restore();
  }
}

class Texture {
  constructor(w, h) {
    this.w = w;
    this.h = h;

    this.scl = 1;
    this.chanche = map(this.w, 1000, 0, 0.05, 0);
  }

  show(ctx) {
    ctx.save();
    for (let x = 0; x < this.w; x += this.scl) {
      for (let y = 0; y < this.h; y += this.scl) {
        if (random(1) <= this.chanche) {
          let a = random(0.1, 0.2);
          ctx.fillStyle = `rgba(0, 0, 0, ${a})`;
          ctx.fillRect(x, y, this.scl, this.scl);
        }
      }
    }
    ctx.restore();
  }
}
