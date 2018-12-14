"use strict";

function scale(coord, max, desired) {
  var scaled = (desired * coord) / max;
  return scaled;
}

function DotPlot(options) {
  options     = options || {};
  this.target = options.target || document.body;
  this.data   = options.data || {};
  this.cigar  = this.data.cigar || null;
  this.strand = this.data.strand || '+';

  function createSVGElement(elem) {
    return document.createElementNS("http://www.w3.org/2000/svg", elem);
  }

  function setSVGAttrs(svg, attrs) {
    Object.keys(attrs).forEach(function(k) {
      svg.setAttributeNS(null, k, attrs[k]);
    });
  }

  this.render = function () {
    // plot the dimensions of the graphic
    this.width = options.data.model_end - options.data.model_start;
    if (this.strand === '-') {
      this.height  = options.data.target_start - options.data.target_end;
    }
    else {
      this.height  = options.data.target_end - options.data.target_start;
    }

    var pwidth, pheight;
    if (this.width > this.height) {
      pwidth = 280;
      pheight = Math.round(this.height / this.width * pwidth);
    } else {
      pheight = 280;
      pwidth = Math.round(this.width / this.height * pheight);
    }

    var rwidth = pwidth + 20;
    var rheight = pheight + 20;

    var svg = createSVGElement("svg");
    setSVGAttrs(svg, { "width": rwidth.toString(), "height": rheight.toString(), viewBox: "0 0 " + rwidth.toString() + " " + rheight.toString() });

    var plot = this.drawPlot(pwidth, pheight);
    setSVGAttrs(plot, { "transform": "translate(20,20)" });
    svg.appendChild(plot);

    var axes = this.drawAxes(rwidth, rheight, 20, 20);
    svg.appendChild(axes);

    this.target.appendChild(svg);
  }

  this.drawAxes = function (rwidth, rheight, startx, starty) {
    var g = createSVGElement("g");
    setSVGAttrs(g, { "font-size": "10px" });

    var xunit = (rwidth - startx) / this.width;
    var yunit = (rheight - starty) / this.height;

    var axisLines = createSVGElement("path");
    setSVGAttrs(axisLines, {
      d: "M" + startx + "," + (starty + this.height * yunit) + "L" + startx + "," + starty + "h" + this.width * xunit,
      fill: "none",
      stroke: "black",
      "stroke-width": "2px",
    });

    g.appendChild(axisLines);

    function createLabel(x, y, text, anchor) {
      var label = createSVGElement("text");
      label.textContent = text.toString();
      setSVGAttrs(label, { "x": x, "y": y, "text-anchor": anchor });
      return label;
    }

    var xlabels = createSVGElement("g");
    var xtxform = "translate(0, " + starty/2 + ")";
    setSVGAttrs(xlabels, { "transform": xtxform });

    var model_label = this.data.auto_overlap.model.id;
    var model_start = this.data.model_start;
    var model_end = this.data.model_end;

    var left_x = startx;
    var right_x = startx + this.width * xunit;
    var center_x = (left_x + right_x) / 2;

    xlabels.appendChild(createLabel(center_x, 0, model_label, "middle"));
    xlabels.appendChild(createLabel(left_x, 0, model_start, "start"));
    xlabels.appendChild(createLabel(right_x, 0, model_end, "end"));
    g.appendChild(xlabels);

    var ylabels = createSVGElement("g");
    var ytxform = "translate(" + startx/2 + "," + rheight + ") rotate(-90)";
    setSVGAttrs(ylabels, { "transform": ytxform });

    var target_label = this.data.auto_overlap.target.id;
    var target_start = this.data.target_start;
    var target_end   = this.data.target_end;
    if (this.strand === '-') {
      target_start = this.data.target_end;
      target_end   = this.data.target_start;
    }

    var left_y = rheight - starty - this.height * yunit;
    var right_y = rheight - starty;
    var center_y = (left_y + right_y) / 2;

    ylabels.appendChild(createLabel(center_y, 0, target_label, "middle"));
    ylabels.appendChild(createLabel(right_y, 0, target_start, "end"));
    ylabels.appendChild(createLabel(left_y, 0, target_end, "start"));
    g.appendChild(ylabels);

    return g;
  }

  this.drawPlot = function (pwidth, pheight) {
    var that = this;
    //split cigar string into array of characters
    var chars = this.cigar.split('');
    if (this.strand === '-') {
      chars = chars.reverse();
    }

    var xunit = pwidth / this.width;
    var yunit = pheight / this.height;

    var x = 0;
    if (this.strand === '-') {
      x = this.width * xunit;
    }
    var y = 0;

    var path = 'M ' + x + ' , ' + y;

    chars.forEach(function(ch) {
      var dx = 0;
      var dy = 0;

      //for each item in data string draw a dota / move the line to a point.
      if (ch[0] === 'M') {
        dy = yunit;
        if (that.strand === '-') {
          dx = -xunit;
        }
        else {
          dx = xunit;
        }
      }
      else if (ch[0] === 'I') {
        dy = yunit;
      }
      else if (ch[0] === 'D'){
        if (that.strand === '-') {
          dx = -xunit;
        }
        else {
          dx = xunit;
        }
      }
      path += 'l '+ dx + ' , ' + dy + ' ';
    });

    var pathEl = createSVGElement("path");
    setSVGAttrs(pathEl, {
      d: path,
      fill: "none",
      stroke: "black",
      "stroke-width": "1px",
    });

    return pathEl;
  }
}

export { DotPlot };

function Overlap(options) {
  options = options || {};
  this.data = options.data || null;

  this.target       = options.target || document.body;
  this.height       = (this.data.length + 1) * 15;
  this.width        = options.width || 800;
  this.model        = this.data[0].auto_overlap.model;
  this.order        = options.order || 'default';
  this.right_margin = options.right_margin || 150;
  this.overlap_area = this.width - this.right_margin;
  this.orientation  = options.orientation || 'down';

  this.render = function () {
    // plot the dimensions of the graphic
    // attach a canvas element if it isn't there already
    var canvas = this.target.querySelector('canvas');
    var context = null;

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.height = this.height;
      canvas.width = this.width;
      this.target.appendChild(canvas);
    }

    this.canvas = canvas;

    context = canvas.getContext('2d');
    context.font = "normal 10px Arial";

    this.drawModel(context);
    // draw all the overlap sequences and map coordinates
    this.drawOverlaps(context);
    //attach the click event
    this.attachPopUp(canvas);
  };

  this.attachPopUp = function (canvas) {
    var that = this;

    var tooltip = document.createElement("div");
    tooltip.style.position = "fixed";
    tooltip.style.background = "#ffffff";
    tooltip.style.border = "2px solid #333333";
    tooltip.style.borderRadius = "3px";
    tooltip.style.fontSize = "0.8em";
    tooltip.style.zIndex = "10";

    var tooltipTitle = document.createElement("div");
    tooltipTitle.style.background = "#333333";
    tooltipTitle.style.color = "#ffffff";
    tooltipTitle.style.padding = "0.3em 1em";
    tooltipTitle.style.fontWeight = "bold";
    tooltip.appendChild(tooltipTitle);

    var tooltipContent = document.createElement("div");
    tooltipContent.style.padding = "0.3em 1em";
    tooltip.appendChild(tooltipContent);

    canvas.parentNode.appendChild(tooltip);

    tooltip.style.display = "none";

    canvas.addEventListener('mouseleave', function(e) {
      tooltip.style.display = "none";
    });

    canvas.addEventListener('click', function (e) {
      var y = e.offsetY;
      var x = e.offsetX;
      var scaled_y = scale(y, this.offsetHeight, that.height);
      var scaled_x = scale(x, this.offsetWidth, that.width);

      var target_family = that.data.find(function(overlap) {
        // find the overlap the mouse is over
        return ((scaled_y >= overlap.y && scaled_y < (overlap.y + overlap.height + 5))
            && (scaled_x >= overlap.x && scaled_x < (overlap.x + overlap.width)));
      });

      if (target_family) {
        location.href = '/family/' + target_family.auto_overlap.target.accession;
        return;
      }

      var region;
      if (scaled_x > that.overlap_area) {// in the control region
        if (scaled_x < (that.overlap_area + 55)) {
          region = 'id';
        } else if (scaled_x < (that.overlap_area + 95)) {
          region = 'coverage';
        } else {
          region = 'evalue';
        }
      }

      if (region) {
        if (that.order === region) {
          if (that.orientation === 'down') {
            that.orientation = 'up';
          } else {
            that.orientation = 'down';
          }
        } else {
          that.order = region;
          that.orientation = 'down';
        }

        var context = this.getContext('2d');
        that.drawModel(context);
        that.drawOverlaps(context);
        return;
      }
    });

    canvas.addEventListener('mousemove', function (e) {
      var y = e.offsetY;
      var x = e.offsetX;
      var scaled_y = scale(y, this.offsetHeight, that.height);
      var scaled_x = scale(x, this.offsetWidth, that.width);
      var match = that.data.find(function(overlap) {
        return ((scaled_y >= overlap.y && scaled_y < (overlap.y + overlap.height + 5))
            && (scaled_x >= overlap.x && scaled_x < (overlap.x + overlap.width)));
      });

      if (match) {
        // if previous not the same, then render, otherwise just show it
        if (that.previous !== match) {
          tooltipTitle.innerText = match.auto_overlap.target.id;
          tooltipContent.innerHTML = '<ul style="margin:0; padding: 0 0 0 1em;"><li style="margin: 0;"><strong>E-value</strong>: ' + match.evalue + '</li></ul><div class="dotplot"></div>';
          var tooltipCanvas = tooltip.querySelector('canvas')
          if (tooltipCanvas) {
            tooltipCanvas.parentNode.removeChild(tooltipCanvas);
          }
          new DotPlot({ target: tooltipContent.querySelector('.dotplot'), data: match }).render();
        }
        tooltip.style.removeProperty("display");
        that.previous = match;

        var displayX = e.clientX + 20;
        var displayY = e.clientY - 20;
        // if the pop up falls off the right side, then flip to
        // the other side of the pointer
        if ((x + tooltip.offsetWidth) > canvas.offsetWidth) {
          displayX -= (tooltip.offsetWidth + 40);
        }
        // if the pop up falls off the bottom of the image, then flip
        // it to be above the pointer.
        if ((y + tooltip.offsetHeight) > canvas.offsetHeight) {
          // If the top of the tooltip is off the top of the page then
          // don't bother flipping as the result is worse from a UI
          // point of view
          if (e.pageY - tooltip.offsetHeight > 1) {
            displayY -= (tooltip.offsetHeight - 20);
          }
        }
        // move the div to follow the mouse
        tooltip.style.top = displayY.toString() + "px";
        tooltip.style.left = displayX.toString() + "px";
      } else {
        tooltip.style.display = "none";
      }
    });
  };

  this.drawModel = function (context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    var y = 0,
      height = 10,
      arrow_width = parseInt(height / 2, 10);
    context.fillStyle = '#aaa';
    context.beginPath();
    context.moveTo(0, 0); // move to the top left
    context.lineTo(this.overlap_area - arrow_width, 0); // horizontal line to the right
    context.lineTo(this.overlap_area, arrow_width); // diagonal line to the middle height
    context.lineTo(this.overlap_area - arrow_width, height); // diagonal to close the arrow
    context.lineTo(0, height); // horizontal line back to the start
    context.closePath();// close the path;
    context.fill();

    context.textAlign = "start";
    context.textBaseline = "top";
    context.strokeStyle = '#333';
    context.fillStyle = '#333';
    context.fillText(this.data[0].auto_overlap.model.id, 10, 0);
  };

  this.drawToggleArrows = function (context, x, y) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 3, y + 5);
    context.lineTo(x - 3, y + 5);
    context.lineTo(x, y);

    context.moveTo(x, y + 13);
    context.lineTo(x + 3, y + 8);
    context.lineTo(x - 3, y + 8);
    context.lineTo(x, y + 13);
    context.stroke();

  };

  this.drawToggleFilled = function (context, x, y) {
    context.beginPath();
    if (this.orientation === 'up') {
      context.moveTo(x, y);
      context.lineTo(x + 3, y + 5);
      context.lineTo(x - 3, y + 5);
      context.lineTo(x, y);
    } else {
      context.moveTo(x, y + 13);
      context.lineTo(x + 3, y + 8);
      context.lineTo(x - 3, y + 8);
      context.lineTo(x, y + 13);
    }
    context.fill();
  };

  this.drawOverlaps = function (context) {
    var that = this;

    //draw data column labels
    context.fillText('%id', that.overlap_area + 15, 0);
    that.drawToggleArrows(context, that.overlap_area + 38, 0);

    context.fillText('%cov', that.overlap_area + 55, 0);
    that.drawToggleArrows(context, that.overlap_area + 87, 0);

    context.fillText('E-value', that.overlap_area + 95, 0);
    that.drawToggleArrows(context, that.overlap_area + 135, 0);


    // sort by evalue if that is the order specified
    if (this.order === 'evalue') {
      if (this.orientation === 'down') {
        this.data.sort(function (a, b) {
          return parseFloat(a.evalue) - parseFloat(b.evalue);
        });
      } else {
        this.data.sort(function (a, b) {
          return parseFloat(b.evalue) - parseFloat(a.evalue);
        });
      }
      that.drawToggleFilled(context, that.overlap_area + 135, 0);
    } else if (this.order === 'coverage') {
      if (this.orientation === 'down') {
        this.data.sort(function (a, b) {
          return parseFloat(a.coverage) - parseFloat(b.coverage);
        });
      } else {
        this.data.sort(function (a, b) {
          return parseFloat(b.coverage) - parseFloat(a.coverage);
        });
      }
      that.drawToggleFilled(context, that.overlap_area + 87, 0);
    } else if (this.order === 'id') {
      if (this.orientation === 'down') {
        this.data.sort(function (a, b) {
          return a.identity - b.identity;
        });
      } else {
        this.data.sort(function (a, b) {
          return b.identity - a.identity;
        });
      }
      that.drawToggleFilled(context, that.overlap_area + 38, 0);
    } else {
      // the default sort is alphabetical by the target id.
      this.data.sort(function (a, b) {
        var idA = a.auto_overlap.target.id,
          idB = b.auto_overlap.target.id;
        return (idA < idB) ? -1 : (idA > idB) ? 1 : 0;
      });
    }

    this.data.forEach(function (overlap, i) {
      //draw rectangle
      var y = overlap.y = 20 + (i * 15),
        x = overlap.x = Math.floor(scale(overlap.model_start - 1, that.model.length, that.overlap_area)),
        width = overlap.width = Math.ceil(scale(overlap.model_end - overlap.model_start + 1, that.model.length, that.overlap_area)),
        height = overlap.height = 10,
        arrow_width = parseInt(height / 2, 10),
        text = overlap.auto_overlap.target.id;


      if (overlap.strand === '-') { // draw left facing arrow
        context.fillStyle = '#B7A4E8';
        context.beginPath();
        context.moveTo(x + arrow_width, y); // move to the top left
        context.lineTo((x + width + arrow_width), y); // horizontal line to the right
        context.lineTo((x + width + arrow_width), y + height); // vertical line to the bottom
        context.lineTo(x + arrow_width, y + height); // horizontal line back to the start
        context.lineTo(x, y + arrow_width); // diagonal line to the middle height
        context.lineTo(x + arrow_width, y); // diagonal to close the arrow
        context.closePath();// close the path;
        context.fill();
      } else { // draw right facing arrow
        context.fillStyle = '#AFD353';
        context.beginPath();
        context.moveTo(x, y); // move to the top left
        context.lineTo(x + (width - arrow_width), y); // horizontal line to the right
        context.lineTo(x + width, y + arrow_width); // diagonal line to the middle height
        context.lineTo(x + (width - arrow_width), y + height); // diagonal to close the arrow
        context.lineTo(x, y + height); // horizontal line back to the start
        context.closePath();// close the path;
        context.fill();
      }

      context.strokeStyle = '#222';
      context.fillStyle = '#222';
      context.textBaseline = "top";
      context.textAlign = "start";

      // if text fits inside the arrow, then put it there
      if (context.measureText(text).width < (width - (arrow_width * 2))) {
        context.fillText(text, x + (arrow_width * 2), y);
      } else if (context.measureText(text).width + x + width > that.overlap_area) {
      //  else if it doesn't fit and would fall off the left edge then draw it
      //  on the right side of the arrow
        context.textAlign = "end";
        if (overlap.strand === '-') { // draw left facing arrow
          context.fillText(text, x + (arrow_width * 2), y);
        } else {
          context.fillText(text, x, y);
        }
      } else {
      // finally draw it on the left side of the arrow if none of the other conditions
      // are fired.
        if (overlap.strand === '-') { // draw left facing arrow
          context.fillText(text, x + width + (arrow_width * 2), y);
        } else {
          context.fillText(text, x + width, y);
        }
      }

      context.textAlign = "start";
      // add the %id column
      context.fillText(Math.round(overlap.identity * 100), that.overlap_area + 15, y);
      // add the %coverage column
      context.fillText(Math.round(overlap.coverage * 100), that.overlap_area + 55, y);
      // add the E-value column
      context.fillText(overlap.evalue, that.overlap_area + 95, y);

    });
  };

  this.dfamOverlapClicked = function (e) {
    //if x is > the overlap_area then we are in the right place
    var canvas = this.canvas;
    var y = e.offsetY;
    var x = e.offsetX;
    var scaled_y = scale(y, canvas.offsetHeight, this.height);
    var scaled_x = scale(x, canvas.offsetWidth, this.width);
    var region;

    if (scaled_x > this.overlap_area) {// in the control region
      if (scaled_x < (this.overlap_area + 55)) {
        region = 'id';
      } else if (scaled_x < (this.overlap_area + 95)) {
        region = 'coverage';
      } else {
        region = 'evalue';
      }
    }
    return region;
  };
}

export { Overlap };
