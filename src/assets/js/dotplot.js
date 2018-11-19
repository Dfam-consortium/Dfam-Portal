function DotPlot(options) {
  options     = (options) ? options : {};
  this.cigar  = options.data.cigar || null;
  this.strand = options.data.strand || '+';
  this.target = options.target || document.body;
  this.data   = options.data || {};

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

window.dfamDotPlot = function(target, data) {
  var plot = new DotPlot({target: target, data : data});
  plot.render();
};
