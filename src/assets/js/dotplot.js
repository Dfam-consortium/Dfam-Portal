function DotPlot(options) {
  options     = (options) ? options : {};
  this.cigar  = options.data.cigar || null;
  this.strand = options.data.strand || '+';
  this.target = options.target || document.body;
  this.data   = options.data || {};

  this.render = function () {
    // plot the dimensions of the graphic
    this.width = options.data.model_end - options.data.model_start;
    if (this.strand === '-') {
      this.height  = options.data.target_start - options.data.target_end;
    }
    else {
      this.height  = options.data.target_end - options.data.target_start;
    }

    // attach a canvas element if it isn't there already
    var context = Raphael(this.target, 300, 300);
    this.drawPlot(context);
    this.drawAxes(context);
    context.setViewBox(0,0,this.width,this.height);
  }

  this.drawAxes = function (context) {
    //draw y-axis down the left
    context.path('M0,0l0,' + this.height).attr({'stroke-width': 2});
    target_label = this.data.auto_overlap.target.id;
    target_start = this.data.target_start;
    target_end   = this.data.target_end;
    if (this.strand === '-') {
      target_start = this.data.target_end;
      target_end   = this.data.target_start;
    }
    //have to draw a canvas here to get vertical text.
    var canvas = document.createElement("canvas");
    canvas.classList.add("y-axis");
    canvas.width = 20;
    canvas.height = 300;
    this.target.insertBefore(canvas, this.target.firstChild);

    var y_context = canvas.getContext('2d');
    y_context.fillStyle = "#333333";
    y_context.textAlign = "right";
    y_context.font = "normal 10px Arial";
    y_context.textBaseline = "top";

    y_context.save()
    y_context.translate(3, 1);
    y_context.rotate(-Math.PI/2);
    y_context.fillText(target_start, 1, 0);
    y_context.restore();

    y_context.save()
    y_context.textAlign = "left";
    y_context.translate(3, 295);
    y_context.rotate(-Math.PI/2);
    y_context.fillText(target_end, 1, 0);
    y_context.restore();

    y_context.textAlign = "center";
    y_context.font = "normal 12px Arial";
    y_context.translate(3, 300 / 2);
    y_context.rotate(-Math.PI/2);
    y_context.fillText(target_label, 1, 0);

    //draw x-axis across the top
    //create a div with width 300 and a margin of 30
    context.path('M0,0l' + this.width + ',0').attr({'stroke-width': 2});
    model_label = this.data.auto_overlap.model.id;
    model_start = this.data.model_start;
    model_end = this.data.model_end;
    this.target.insertAdjacentHTML('afterbegin', '<div style="font-family: Arial,sans-serif; font-size:12px; margin-left:20px;"><p style="text-align: center;">' +
      model_label + '<span style="float: left; font-size=10px;">' + model_start  + '</span><span style="float: right; font-size=10px;">' +
      model_end + '</span></p></div>')

  }

  this.drawPlot = function (context) {
    var that = this;
    //split cigar string into array of characters
    var chars = this.cigar.split('');
    if (this.strand === '-') {
      chars = chars.reverse();
    }
    var x = 1;
    if (this.strand === '-') {
      x = this.width
    }
    var y = 1;

    var previousState = 'M';
    var path = 'M' + x + ' ' + y;

    chars.forEach(function(ch) {
      //for each item in data string draw a dota / move the line to a point.
      if (ch[0] === 'M') {
        //make sure we go back to black lines
        if (that.strand === '-') {
          x--; y++;
        }
        else {
          x++; y++;
        }
      }
      else if (ch[0] === 'I') {
        //change color to red
        y++;
      }
      else if (ch[0] === 'D'){
        //change color to blue
        if (that.strand === '-') {
          x--;
        }
        else {
          x++;
        }
      }
      path += 'L'+ x + ' ' + y;
    });
    context.path(path);
  }
}

window.dfamDotPlot = function(target, data) {
  var plot = new DotPlot({target: target, data : data});
  plot.render();
};
