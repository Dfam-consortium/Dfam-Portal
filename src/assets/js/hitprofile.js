function scale(coord, orig, desired) {
  var scaled = (desired * coord) / orig;
  return scaled;
}

function nice_number(value, round_) {
  //default value for round_ is false
  round_ = round_ || false;
  // :latex: \log_y z = \frac{\log_x z}{\log_x y}
  var exponent = Math.floor(Math.log(value) / Math.log(10));
  var fraction = value / Math.pow(10, exponent);

  if (round_)
    if (fraction < 1.5)
      nice_fraction = 1.
    else if (fraction < 3.)
      nice_fraction = 2.
    else if (fraction < 7.)
      nice_fraction = 5.
    else
      nice_fraction = 10.
  else
    if (fraction <= 1)
      nice_fraction = 1.
    else if (fraction <= 2)
      nice_fraction = 2.
    else if (fraction <= 5)
      nice_fraction = 5.
    else
      nice_fraction = 10.

  return nice_fraction * Math.pow(10, exponent)
}

function nice_bounds(axis_start, axis_end, num_ticks) {
  //default value is 10
  num_ticks = num_ticks || 10;
  var axis_width = axis_end - axis_start;

  if (axis_width == 0) {
    axis_start -= 0.5;
    axis_end += 0.5;
    axis_width = axis_end - axis_start;
  }

  var nice_range = nice_number(axis_width);
  var nice_tick = nice_number(nice_range / (num_ticks -1), true);
  var axis_start = Math.floor(axis_start / nice_tick) * nice_tick;
  var axis_end = Math.ceil(axis_end / nice_tick) * nice_tick;
  return {
    "min": axis_start,
    "max": axis_end,
    "steps": nice_tick
  }
}

// Hit Profile Graphic
//
// options.data ( required ):
//   .points []
//   .max

function HitProfilePlot(options) {
  options = options || {};
  this.data = options.data || null;
  this.target = options.target || document.body;
  this.height = options.height || 130;
  this.width  = options.width || this.target.offsetWidth;
  this.leftMargin = 30;
  this.bottomMargin = 30;
  this.rightMargin = 45;

  // RMH: Test....reload widget using passed in data
  this.reload = function (data) {
    this.data = data;
    this.clear();
    this.render();
  };

  this.render = function () {
    var context = Raphael(this.target, this.width, this.height);

    this.draw_axes(context);
    this.draw_labels(context);
    // inserts
    this.draw_data_line(context, "#aaaaaa", this.data.points[2]);
    // identity
    this.draw_data_line(context, "#9AC231", this.data.points[1]);
    // coverage
    this.draw_data_line(context, "#7753D3", this.data.points[0]);

    this.create_crosshair(context);

    var self = this;
    this.target.querySelector('svg').addEventListener('click', function (e) {
      var x = parseInt(e.offsetX) - self.leftMargin;
      var scaled_x = scale(x , self.width - self.rightMargin - self.leftMargin, self.data.points[0].length);
      var positionEvent = new CustomEvent("model_position", { detail: scaled_x, bubbles: true });
      e.target.dispatchEvent(positionEvent);
    });

  };

  this.create_crosshair = function (context) {
    var self = this,
      marker = context.set();
    marker.push(
      context.circle(-100, this.height - 20, 10)
        .attr({"stroke" : "#666666", "fill" : "#ffffff"}),
      context.text(-100, this.height - 20, '1')
    );
    var crosshair = context.rect(-100, 0, 1, this.height - this.bottomMargin)
      .attr({"fill" : "#666666", "stroke-opacity" : 0});

    var move_target = context.rect(0, 0, this.width, this.height)
      .attr({"opacity" : 0, "fill" : "#990000" })
      .mousemove(function (e) {
        if (e.layerX > self.leftMargin && (e.layerX < (self.width - self.rightMargin))) {
          //work out the position for the label
          var text = scale(
            e.layerX - self.leftMargin,
            self.width - self.leftMargin - self.rightMargin,
            self.data.points[0].length
          );
          marker.attr({x : e.layerX, cx : e.layerX, text : Math.round(text)});
          crosshair.attr({x : e.layerX});
        } else {
          marker.attr({x : -100, cx : -100});
          crosshair.attr({x : -100});
        }
      })
      .mouseout(function(e) {
        marker.attr({x : -100, cx : -100});
        crosshair.attr({x : -100});
      });
  }

  this.draw_data_line = function(context, color, data) {
    var self = this,
      prevX = null,
      prevY = null,
      path = '';

    data.forEach(function(value, i) {
      var y = self.height - Math.round(100 * value) - self.bottomMargin;
      var x = scale(i, data.length, self.width - self.leftMargin - self.rightMargin);

      if (i > 0) {
        if (prevX) {
          path = path + 'L' + (prevX + self.leftMargin + 1) + ',' + prevY;
        }
        prevX = x;
        prevY = y;
      } else {
        path = 'M' + (x + self.leftMargin) + ',' + y;
      }
    });
    context.path(path).attr({'stroke': color});
  }

  this.draw_labels = function (context) {

    //draw 0
    context.text(this.leftMargin - 3, this.height - (this.bottomMargin - 7),'0')
      .attr({"text-anchor": "end"});

    //draw x-max
    context.text(this.width - this.rightMargin, this.height - (this.bottomMargin - 8), this.data.points[0].length)
      .attr({"text-anchor": "end"});
    var xmax = this.line_path(
      this.width - this.rightMargin,
      this.height - (this.bottomMargin),
      this.width - this.rightMargin,
      this.height - (this.bottomMargin - 3)
    );
    context.path(xmax);

    //var x_max_left = this.width - context.measureText(this.data.points[0].length).width;

    //draw left y-max
    context.text(this.leftMargin - 3, 4, '100').attr({"text-anchor": "end"});
    var lymax = this.line_path(this.leftMargin, 1, this.leftMargin - 3, 1);
    context.path(lymax);
    var y_max_bottom = 10;

    //draw left y-ticks
    var y_ticks = nice_bounds(0, parseInt(100), 5);
    var y_start = y_ticks.steps;
    for (var y_start = y_ticks.steps; y_start < y_ticks.max; y_start += y_ticks.steps) {
      var y = this.height - (scale(y_start, 100, this.height - this.bottomMargin) + this.bottomMargin);
      if ( y <= y_max_bottom) {
        break;
      }
      var x = this.leftMargin;
      context.path(this.line_path(x, y, x -3, y));
      context.text(x - 3, y, y_start).attr({"text-anchor": "end"});
    }

    //draw x-ticks
    var x_ticks = nice_bounds(0, parseInt(this.data.points[0].length), 10);
    var x_start = x_ticks.steps;
    for (var x_start = x_ticks.steps; x_start < x_ticks.max; x_start += x_ticks.steps) {
      var x = scale(x_start, this.data.points[0].length, this.width - this.leftMargin - this.rightMargin) + this.leftMargin;
      //TODO: fix the overlap detection
      //var text_width = context.measureText(x_start).width
      //var x_right = x + (text_width / 2);
      //if (x_right >= x_max_left) {
      //  break;
     // }
      var y = this.height - this.bottomMargin;
      context.path(this.line_path(x, y, x, y + 3));
      context.text(x, y + 8, x_start);
    }

    //draw right y-max
    context.text(this.width - this.rightMargin + 3, 4, this.data.max)
      .attr({"text-anchor": "start"});
    context.path(
      this.line_path(this.width - this.rightMargin, 1, this.width - this.rightMargin + 3, 1)
    );

    //draw right y-ticks
    var y_ticks = nice_bounds(0, parseInt(this.data.max), 5);
    var y_start = y_ticks.steps;
    for (var y_start = y_ticks.steps; y_start < y_ticks.max; y_start += y_ticks.steps) {
      var y = this.height - (scale(y_start, this.data.max, this.height - this.bottomMargin) + this.bottomMargin);
      if ( y <= y_max_bottom) {
        break;
      }
      var x = this.width - this.rightMargin + 3;
      context.path(this.line_path(x, y, x - 3, y));
      context.text(x, y, y_start).attr({"text-anchor": "start"});
    }

  }

  this.line_path = function (x1, y1, x2, y2) {
    return "M" + x1 + ',' + y1 + 'L' + x2 + ',' + y2;
  };


  this.draw_axes = function(context) {
    var color = '#111';

    // y-axis left
    var ypath = this.line_path(
      this.leftMargin,
      0,
      this.leftMargin,
      this.height - (this.bottomMargin - 5)
    );
    context.path(ypath).attr({"fill":color,"stroke":color});
    context.text(0, (this.height - this.bottomMargin) / 2, "Percent")
      .transform("r-90t0,10");

    // x-axis
    var xpath = this.line_path(
      this.leftMargin - 5,
      this.height - this.bottomMargin,
      this.width - this.rightMargin,
      this.height - this.bottomMargin
    );
    context.path(xpath).attr({"fill":color,"stroke":color});
    context.text(
      (this.width / 2) + (this.leftMargin / 2),
      this.height - this.bottomMargin + 22,
      "Model Position"
    );


    // y-axis right
    var yrpath = this.line_path(
      this.width - this.rightMargin,
      0,
      this.width - this.rightMargin,
      this.height - this.bottomMargin
    );
    context.path(yrpath).attr({"fill":color,"stroke":color});
    context.text(this.width , (this.height - this.bottomMargin) / 2, "Number of Insertions")
      .transform("r-90t0,-10");
  }
}

window.dfamHitProfilePlot = function(target, data) {
  var plot = new HitProfilePlot({data: data, target: target});
  plot.render();
  return plot;
};
