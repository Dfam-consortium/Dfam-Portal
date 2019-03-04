function scale(x, width, target_width) {
  return (x/width) * target_width;
}

function createSVGElement(elem) {
  return document.createElementNS("http://www.w3.org/2000/svg", elem);
}

function setSVGAttrs(el, attrs) {
  Object.keys(attrs).forEach(function(k) {
    el.setAttributeNS(null, k, attrs[k]);
  });
  return el;
}

function createSVGText(x, y, text, anchor) {
  var el = createSVGElement("text");
  el.textContent = text;
  var attrs = { "x": x, "y": y };
  if (anchor) {
    attrs["text-anchor"] = anchor;
  }
  return setSVGAttrs(el, attrs);
}

function FeaturesVisualization(options) {
  options = options || {};
  this.target = options.target || document.body;
  this.data = options.data || {};

  this.DIMENSIONS = {
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
    axis: {
      height: 4,
    },
    feature: {
      height: 15,
      margin_bottom: 4,
    },
    coding_sequence: {
      intron_inflect_height: 3,
    },
  }
};

FeaturesVisualization.prototype.render = function() {
  if (this.svg) {
    if (this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
  }

  // Create the SVG element
  this.svg = createSVGElement("svg");
  this.target.appendChild(this.svg);
  this.width = this.target.offsetWidth;
  this.height = 0;

  var DIMENSIONS = this.DIMENSIONS;

  if (this.data.target_site_cons) {
    // Draw TSD boxes on either side of axis

    var tsdTextL = createSVGText(DIMENSIONS.margin.left, DIMENSIONS.margin.top + 5, "TSD");
    var tsdTextLTitle = createSVGElement("title");
    tsdTextLTitle.innerHTML = this.data.target_site_cons;
    tsdTextL.appendChild(tsdTextLTitle);
    this.svg.appendChild(tsdTextL);
    var tsdTextLBB = tsdTextL.getBBox();

    var tsdTextR = createSVGText(this.width - DIMENSIONS.margin.right, DIMENSIONS.margin.top + 5, "TSD", "end");
    var tsdTextRTitle = createSVGElement("title");
    tsdTextRTitle.innerHTML = this.data.target_site_cons;
    tsdTextR.appendChild(tsdTextRTitle);
    this.svg.appendChild(tsdTextR);
    var tsdTextRBB = tsdTextR.getBBox();

    var tsdBoxL = createSVGElement("rect");
    this.svg.appendChild(tsdBoxL);
    setSVGAttrs(tsdBoxL, {
      "x": tsdTextLBB.x, "y": tsdTextLBB.y,
      "width": tsdTextLBB.width, "height": tsdTextLBB.height,
      "fill": "none", "stroke": "black",
    });

    var tsdBoxR = createSVGElement("rect");
    this.svg.appendChild(tsdBoxR);
    setSVGAttrs(tsdBoxR, {
      "x": tsdTextRBB.x, "y": tsdTextRBB.y,
      "width": tsdTextRBB.width,
      "height": tsdTextRBB.height,
      "fill": "none", "stroke": "black",
    });

    DIMENSIONS.margin.left += tsdBoxL.getBBox().width + 4;
    DIMENSIONS.margin.right += tsdBoxR.getBBox().width + 4;
  }

  this.inWidth = this.width - DIMENSIONS.margin.left - DIMENSIONS.margin.right;

  // Render the main axis and labels
  var axisG = createSVGElement("g");
  this.svg.appendChild(axisG);
  setSVGAttrs(axisG, { "transform": "translate(" + DIMENSIONS.margin.left + " " + DIMENSIONS.margin.top + ")" });
  this.height += DIMENSIONS.margin.top;

  var axis = createSVGElement("line");
  axisG.appendChild(axis);
  setSVGAttrs(axis, { "x1": 0, "y1": 0, "x2": this.inWidth, "y2": 0, stroke: "black" });

  var startLine = createSVGElement("line");
  axisG.appendChild(startLine);
  setSVGAttrs(startLine, { "x1": 0, "y1": 0, "x2": 0, "y2": DIMENSIONS.axis.height, stroke: "black" });
  var startLabel = createSVGText(0, 0, "1");
  axisG.appendChild(startLabel);

  var endLine = createSVGElement("line");
  axisG.appendChild(endLine);
  setSVGAttrs(endLine, { "x1": this.inWidth, "y1": 0, "x2": this.inWidth, "y2": DIMENSIONS.axis.height, stroke: "black" });
  var endLabel = createSVGText(this.inWidth, 0, this.data.length, "end");
  axisG.appendChild(endLabel);

  var textHeight = startLabel.getBBox().height;
  setSVGAttrs(startLabel, { y: textHeight });
  setSVGAttrs(endLabel, { y: textHeight });

  this.height += textHeight;

  // Figure out how many tick marks to draw
  var endWidth = endLabel.getBBox().width;
  var maxTickCount = (this.inWidth - endWidth) / endWidth;
  var ticksAt = Math.pow(10, Math.floor(Math.log10(this.data.length))) / 2;
  if (this.data.length / ticksAt > maxTickCount) {
    ticksAt *= 2;
  }
  if (this.data.length / ticksAt > maxTickCount) {
    ticksAt = this.data.length;
  }

  // Render peridoic axis tick marks
  for (var x = ticksAt; x < this.data.length; x += ticksAt) {
    // -1 because positions are 1-based
    var scaled_x = scale(x - 1, this.data.length, this.inWidth);
    var line = createSVGElement("line");
    axisG.appendChild(line);
    setSVGAttrs(line, { "x1": scaled_x, "y1": 0, "x2": scaled_x, "y2": DIMENSIONS.axis.height, stroke: "black" });

    var label = createSVGText(scaled_x, textHeight, x, "middle");
    axisG.appendChild(label);

    // Remove labels that overlap with the end label
    var bbox = label.getBBox()
    if ((bbox.x + bbox.width) > endLabel.getBBox().x) {
      line.parentNode.removeChild(line);
      label.parentNode.removeChild(label);
      break;
    }
  }

  this.height += 10;

  // Render features
  var featuresG = createSVGElement("g");
  this.svg.appendChild(featuresG);
  setSVGAttrs(featuresG, {
    "transform": "translate(" + DIMENSIONS.margin.left + " 0)"
  });

  this.data.features.forEach(function(feat) {
    var featG = createSVGElement("g");
    featuresG.appendChild(featG);
    setSVGAttrs(featG, { "transform": "translate(0 " + this.height + ")" });

    var left = feat.model_start_pos;
    var right = feat.model_end_pos;
    if (left > right) {
      var tmp = left;
      left = right;
      right = tmp;
    }

    // Subtract 1 from left to convert from 1-based to 0-based drawing coordinates
    // Do not change right (1-based to 0-based is -1, left edge to right edge of 'cell' is +1)
    left -= 1;

    left = scale(left, this.data.length, this.inWidth);
    right = scale(right, this.data.length, this.inWidth);

    var height = DIMENSIONS.feature.height;

    // A feature is made up of left and right (vertical) bars and a connecting horizontal bar

    var featLeftBar = createSVGElement("line");
    featG.appendChild(featLeftBar);
    setSVGAttrs(featLeftBar, { "x1": left, "y1": 0, "x2": left, "y2": height, stroke: "black" });

    var featRightBar = createSVGElement("line");
    featG.appendChild(featRightBar);
    setSVGAttrs(featRightBar, { "x1": right, "y1": 0, "x2": right, "y2": height, stroke: "black" });

    var featCrossBar = createSVGElement("line");
    featG.appendChild(featCrossBar);
    setSVGAttrs(featCrossBar, { "x1": left, "y1": height/2, "x2": right, "y2": height/2, stroke: "black" });

    var featText = createSVGText(left, 0, feat.label);
    featG.appendChild(featText);
    var featHeight = DIMENSIONS.feature.height + featText.getBBox().height;
    setSVGAttrs(featText, { y: featHeight });

    this.height += featHeight + DIMENSIONS.feature.margin_bottom;
  }, this);

  // Render coding sequences
  var cdsG = createSVGElement("g");
  this.svg.appendChild(cdsG);
  setSVGAttrs(cdsG, {
    "transform": "translate(" + DIMENSIONS.margin.left + " 0)"
  });

  this.data.coding_seqs.forEach(function(cs) {
    // Build list of exons in screen position order
    var exons = [];
    for (var i = 0; i < cs.exon_count; i++) {
      var left = cs.exon_starts[i];
      var right = cs.exon_ends[i];

      if (left > right) {
        var tmp = left;
        left = right;
        right = tmp;
      }

      // Subtract 1 from left to convert from 1-based to 0-based drawing coordinates
      // Do not change right (1-based to 0-based is -1, left edge to right edge of 'cell' is +1)
      left -= 1;

      exons.push({ left: left, right: right, length: right - left });
    }
    exons.sort(function(a, b) { return a.left - b.left; });

    var csG = createSVGElement("g");
    cdsG.appendChild(csG);
    setSVGAttrs(csG, { "transform": "translate(0 " + this.height + ")" });

    // -1 because positions are 1-based
    var left = cs.start;
    var right = cs.end;
    if (left > right) {
      var tmp = left;
      left = right;
      right = tmp;
    }

    // Subtract 1 from left to convert from 1-based to 0-based drawing coordinates
    // Do not change right (1-based to 0-based is -1, left edge to right edge of 'cell' is +1)
    left -= 1;

    left = scale(left, this.data.length, this.inWidth);
    right = scale(right, this.data.length, this.inWidth);

    var last_right = left;

    function maybeDrawIntron(to) {
      if (last_right != to) {
        // Draw intron line
        //
        //             B
        //         ---- ----
        //     ----         ----
        // A---                 ---C
        //
        // A: Starting point at (0, 0)
        // B: Inflection point at (width/2, height)
        // C: Ending point at (width, 0)
        // Note that "height" can be simply negated for the reverse direction

        var width = to - last_right;
        var height = -DIMENSIONS.coding_sequence.intron_inflect_height;
        if (cs.reverse) {
          height = -height;
        }

        var pathDef = "M 0,0" +
          " L " + (width/2) + "," + height +
          " L " + width + ",0";

        var intronLine = createSVGElement("path");
        csG.appendChild(intronLine);
        setSVGAttrs(intronLine, {
          "d": pathDef,
          "transform": "translate(" + last_right + " 5)",
          "fill": "none",
          "stroke": "black",
        });
      }
    }

    // Render each exon
    exons.forEach(function(exon) {
      var left = scale(exon.left, this.data.length, this.inWidth);
      var right = scale(exon.right, this.data.length, this.inWidth);

      maybeDrawIntron(left);

      // Draw exon rectangle
      var exonRect = createSVGElement("rect");
      csG.appendChild(exonRect);
      setSVGAttrs(exonRect, {
        "x": left, "y": 0,
        "width": right - left, "height": DIMENSIONS.feature.height,
        "fill": "none", "stroke": "black",
      });

      last_right = right;
    }, this);

    maybeDrawIntron(right);

    var label = (cs.reverse ? '< ' + cs.product : cs.product + ' >');
    var csText = createSVGText(left, 0, label);
    csG.appendChild(csText);
    var csHeight = DIMENSIONS.feature.height + csText.getBBox().height;
    setSVGAttrs(csText, { y: csHeight });

    this.height += csHeight + DIMENSIONS.feature.margin_bottom;
  }, this);

  this.height += DIMENSIONS.margin.bottom;

  setSVGAttrs(this.svg, { "width": this.width, "height": this.height });
};

export { FeaturesVisualization };
