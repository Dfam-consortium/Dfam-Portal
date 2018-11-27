function highlightFade(element, duration) {
  var start = [60, 100, 50];
  var target = [60, 100, 100];
  function interp(n, frac) {
    return start[n] + (target[n] - start[n]) * frac;
  }

  var elapsed = 0;
  var stepTime = 50;
  function step() {
    elapsed += stepTime;
    var frac = elapsed / duration;
    var hsl = "hsl(" + interp(0, frac) + ", " + interp(1, frac) + "%, " + interp(2, frac) + "%)";
    element.style.backgroundColor = hsl;
    if (elapsed < duration) {
      setTimeout(step, stepTime);
    }
  }

  setTimeout(step, stepTime);
};

function AnnotationsGraphic(options) {
  options = (options) ? options : {};
  this.data = options.data || null;
  this.target = options.target || document.body;
  this.height = options.height || 200;
  this.width  = options.width || this.target.offsetWidth;

  this.render = function () {
    // plot the dimensions of the graphic
    this.setHeight();
    // attach the canvas
    var context = Raphael(this.target, this.width, this.height);

    this.drawQueryReference(context);
    // draw trf hits on sequence line
    this.drawTRFHits(context);
    // draw nhmmer hits above and below the sequence
    this.drawNhmmerHits(context);
  }

  this.setHeight = function() {
    var that = this;
    var offset = parseInt(this.data.offset) || '';
    var forward_max_x = [];
    var reverse_max_x = [];

    //loop over the data elements and work out the max x and y coordinates.
    this.data.nhmmer.forEach(function(hit, i) {
      var x = 0, width = 0, y_offset = 0;

      if (hit.strand === '-') {
        // we are on the reverse strand;
        var start = parseInt(hit.ali_end) - offset;
        var end   = parseInt(hit.ali_start) - offset;
        if (start < 0) {
          start = 0;
        }

        x = Math.floor(scale(start - 1, that.data.length, that.width));
        width = Math.ceil(scale(end - start + 1, that.data.length, that.width));
        if (x < 0) {
          x = 0;
          width = width - x;
        }

        //work out if we are going to overlap and bump if needed.
        y_offset = that._position(x, width, reverse_max_x, 0);
      }
      else {
        var start = parseInt(hit.ali_start) - offset;
        var end   = parseInt(hit.ali_end) - offset;
        if (start < 0) {
          start = 0;
        }
        x = Math.floor(scale(start - 1, that.data.length, that.width));
        width = Math.ceil(scale(end - start + 1, that.data.length, that.width));

        if (x < 0) {
          x = 0;
          width = width - x;
        }
        y_offset = that._position(x, width, forward_max_x, 0);
      }

      hit.x = x;
      hit.start = start;
      hit.end   = end;
      hit.width = width;
      hit.y_offset = y_offset;

    });

    this.forward_height = forward_max_x.length * 11;

    this.height = (forward_max_x.length * 11) + (reverse_max_x.length * 11) + 24;
  }

  this._position = function (x, width, max, i) {
    var y = 0;
    if(typeof max[i] === 'undefined') {
      y = i * 11;
      max[i] = x + width;
    }
    else {
      if (x > max[i] ) {
        y = i * 11;
        max[i] = x + width;
      }
      else {
        y = this._position(x, width, max, i + 1);
      }
    }
    return y;
  }

  this.drawNhmmerHits = function(context) {
    var that = this;
    this.data.nhmmer.forEach(function(hit, i) {
      var x = hit.x, y = 0, width = hit.width;

      if (hit.strand === '-') {
        // we are on the reverse strand;
        y = that.forward_height + 25 + hit.y_offset;
      }
      else {
       // we are on the positive strand
        y = that.forward_height - 6 - hit.y_offset;
      }
      var repeat = hit;
      repeat.color = repeat.color || '#ccc';
      var label_set = context.set();
      context.rect(x, y, width, 8 )
        .attr({fill: repeat.color, stroke: 'none'})
        .mouseover( function() {
          var text = repeat.query + ' : ' + (repeat.ali_start) + ' - ' + (repeat.ali_end);

          // check to see if the label will fall off the top of the image and
          // if it will, then flip it below the mouse pointer.
          if ((y - 10) <= 0) {
            y = 40;
          }

          label = context.text(x, y - 10, text).attr({fill: '#000'});
          var ld = label.getBBox();

          //flip the label if it is going to go off the end of the graphic.
          if (ld.x < 0) {
            label.attr({'text-anchor':'start'});
            ld = label.getBBox();
          }
          else if (ld.x2 > that.width) {
            label.attr({'text-anchor':'end'});
            ld = label.getBBox();
          }

          var label_back = context.rect(ld.x - 4,ld.y - 4,ld.width + 4,ld.height + 4, 2)
                             .attr({fill: '#eee', stroke: '#ccc'});
          label.toFront();
          label_set.push(label, label_back);


          this.attr({'stroke-width': 5, 'stroke-opacity': 0.4, stroke: '#B9C792'});
        })
        .mouseout( function () {
          label_set.remove();
          this.attr({stroke:'none', 'stroke-width': 1});
        })
        .click(function () {
          var el = document.getElementById(repeat.row_id);
          highlightFade(el, 1000);
          el.scrollIntoView(false);
        });
    });
  }

  this.drawTRFHits = function(context) {
    var that = this;
    var offset = parseInt(this.data.offset) || '';
    var y = this.forward_height + 6;
    this.data.trf.forEach(function(hit, i) {
      //calculate start and end
      var x = Math.floor(scale(hit.start - offset, that.data.length, that.width));
      var width = Math.ceil(scale(hit.end - parseInt(hit.start) + 1, that.data.length, that.width));
      //draw a rectangle
      var repeat = hit;
      var label_set = context.set();
      context.rect(x, y, width, 8 )
        .attr({fill:"#444444", stroke: "none"})
        .mouseover( function() {
          var text = repeat.type + ' : ' + (repeat.start) + ' - ' + (repeat.end);
          label = context.text(x, y - 10, text).attr({fill: '#000'});
          var ld = label.getBBox();
          if (ld.x < 0) {
            label.attr({'text-anchor':'start'});
            ld = label.getBBox();
          }
          else if (ld.x2 > that.width) {
            label.attr({'text-anchor':'end'});
            ld = label.getBBox();
          }
          var label_back = context.rect(ld.x - 2,ld.y - 2,ld.width + 2,ld.height + 2, 2)
                             .attr({fill: '#eee', stroke: '#ccc'});
          label.toFront();
          label_set.push(label, label_back);
          this.attr({'stroke-width': 5, 'stroke-opacity': 0.4, stroke: '#444444'});
        })
        .mouseout( function () {
          label_set.remove();
          this.attr({stroke:'none', 'stroke-width': 1});
        })
        .click(function () {
          var el = document.getElementById(repeat.row_id);
          highlightFade(el, 1000);
          el.scrollIntoView(false);
        });
    });
  }

  this.drawQueryReference = function(context) {
    var y = this.forward_height + 6 ;
    var search = context.rect(0, y, this.width, 8 )
                  .attr({fill: "#aaa", stroke: "none"});
    var label = context.text(1, y + 12, this.data.query)
                  .attr({'text-anchor': 'start'});
  }
}

window.dfamAnnotationsGraphic = function(target, data) {
  var plot = new AnnotationsGraphic({ data: data, target: target });
  plot.render();
};
