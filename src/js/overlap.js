import * as d3 from "d3";

// The "dot plot" visualization shows alignment between two sequences
// from a CIGAR-like string, and it is used as a tooltip for the
// overlaps visualization.
function DotPlot(options) {
  options     = options || {};
  this.target = options.target || document.body;
  this.data   = options.data || {};
  this.cigar  = this.data.cigar || null;
  this.strand = this.data.strand || '+';

  this.DIMENSIONS = {
    maxPlotSize: 280,
    axisMargin: 20,
  };
};

// (re-)renders the dot plot.
DotPlot.prototype.render = function() {
  // Calculate data dimensions. 'bwidth' and 'bheight' are in Basepairs
  this.bwidth = this.data.model_end - this.data.model_start;
  this.bheight = this.data.target_end - this.data.target_start;
  if (this.strand === '-') {
    this.bheight = -this.bheight;
  }

  // Calculate the Plot width and height - the longer dimension will
  // be constrained to fit into maxPlotSize and the other will be
  // scaled to maintain aspect ratio.
  if (this.bwidth > this.bheight) {
    this.pwidth = this.DIMENSIONS.maxPlotSize;
    this.pheight = Math.round(this.bheight / this.bwidth * this.pwidth);
  } else {
    this.pheight = this.DIMENSIONS.maxPlotSize;
    this.pwidth = Math.round(this.bwidth / this.bheight * this.pheight);
  }

  if (this.svg) {
    this.svg.remove();
  }

  this.svg = d3.select(this.target).append("svg")
    .attr("width", this.pwidth + this.DIMENSIONS.axisMargin)
    .attr("height", this.pheight + this.DIMENSIONS.axisMargin);

  this.drawAxes(this.svg);
  this.drawPlot(this.svg, this.pwidth, this.pheight);
};


// Draws axes. Each axis is represented as a line with labels for
// the start position, end position, and name for the family
DotPlot.prototype.drawAxes = function (svg) {
  const g = svg.append("g")
    .attr("class", "axis")
    .attr("font-size", "10px");

  const margin = this.DIMENSIONS.axisMargin;
  const baseline = this.DIMENSIONS.axisMargin - 3;

  const axesPath = d3.path();
  // Bottom-left
  axesPath.moveTo(margin, margin + this.pheight);
  // Top-left corner
  axesPath.lineTo(margin, margin)
  // Top-right corner
  axesPath.lineTo(margin + this.pwidth, margin);

  g.append("path")
    .attr("d", axesPath.toString())
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "2px");

  function createLabel(g, x, y, text, anchor) {
    return g.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", anchor)
      .text(text);
  }

  // Draw top labels
  const xlabels = g.append("g")
    .attr("transform", `translate(${margin} 0)`);

  createLabel(xlabels, 0, baseline, this.data.model_start, "start");
  createLabel(xlabels, this.pwidth / 2, baseline, this.data.auto_overlap.model.id, "middle");
  createLabel(xlabels, this.pwidth, baseline, this.data.model_end, "end");

  // Draw side labels (by using a rotation)
  const ylabels = g.append("g")
    .attr("transform", `translate(0 ${this.pheight + margin}) rotate(-90)`);

  let target_start = this.data.target_start;
  let target_end   = this.data.target_end;
  if (this.strand === '-') {
    target_start = this.data.target_end;
    target_end   = this.data.target_start;
  }

  createLabel(ylabels, 0, baseline, target_end, "start");
  createLabel(ylabels, this.pheight / 2, baseline, this.data.auto_overlap.target.id, "middle");
  createLabel(ylabels, this.pheight, baseline, target_start, "end");

  return g;
};

DotPlot.prototype.drawPlot = function (g) {
  let self = this;
  // Split cigar string into array of characters
  let chars = this.cigar.split('');
  if (this.strand === '-') {
    chars = chars.reverse();
  }

  // NB: Instead of drawing in data space and transforming the
  // whole thing to graph space, we scale the individual points
  // to graph space. This is done so that we are not also scaling
  // the 1px thickness of the line.
  const xscale = d3.scaleLinear()
    .domain([0, this.bwidth])
    .range([0, this.pwidth]);
  const yscale = d3.scaleLinear()
    .domain([0, this.bheight])
    .range([0, this.pheight]);

  let x = 0;
  let y = 0;
  if (this.strand === '-') {
    x = this.bwidth;
  }

  const path = d3.path();
  path.moveTo(xscale(x), yscale(y));

  chars.forEach(function(ch) {
    // For each item in the data string, move the line to the next point.
    if (ch[0] === 'M') {
      y += 1;
      if (self.strand === '-') {
        x -= 1;
      }
      else {
        x += 1;
      }
    }
    else if (ch[0] === 'I') {
      y += 1;
    }
    else if (ch[0] === 'D'){
      if (self.strand === '-') {
        x -= 1;
      }
      else {
        x += 1;
      }
    }
    path.lineTo(xscale(x), yscale(y));
  });

  return g.append("path")
    .attr("d", path.toString())
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .attr("transform", `translate(${this.DIMENSIONS.axisMargin} ${this.DIMENSIONS.axisMargin})`);
};

export { DotPlot };

// The "overlap" visualization shows a model (a gray block) and overlapping
// families (green or purple blocks) at the overlap positions, with text columns
// for %identity, %coverage, and match E-value.
//
// Hovering a model shows a tooltip (a DotPlot) of the individual alignment.
//
// The text columns can be used to re-sort the data.
function Overlap(options) {
  this.data = options.data;
  this.target = options.target;

  this.DIMENSIONS = {
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
    axis: {
      height: 30,
      margin_bottom: 20,
    },
    overlap: {
      height: 10,
      margin_bottom: 4,
    },
    sidebar: {
      padding_left: 30,
      column_width: 40,
      width: 150,
    },
  };

  this.width = options.width || 800;
  this.model = this.data[0].auto_overlap.model;
  this.sort_by = options.sort_by || "identity";
  this.sort_reverse = options.sort_reverse || true;

  this.calculateLayout();
}

// (re-)sort data and calculate layout
Overlap.prototype.calculateLayout = function() {
  this.data.sort((a, b) => {
    const aval = +a[this.sort_by];
    const bval = +b[this.sort_by]

    return this.sort_reverse ? (bval - aval) : (aval - bval);
  });

  this.sidebar_x0 = this.width - this.DIMENSIONS.margin.right - this.DIMENSIONS.sidebar.width;
  this.x_identity = this.sidebar_x0 + this.DIMENSIONS.sidebar.padding_left;
  this.x_coverage = this.x_identity + this.DIMENSIONS.sidebar.column_width;
  this.x_evalue = this.x_coverage + this.DIMENSIONS.sidebar.column_width;

  this.scale = d3.scaleLinear()
    .domain([1, this.model.length])
    .range([this.DIMENSIONS.margin.left, this.sidebar_x0]);

  let y = 0;
  this.data.forEach(overlap => {
    // Inclusive coordinates - +1 to end to "fill" that space
    overlap.x0 = this.scale(overlap.model_start);
    overlap.x1 = this.scale(overlap.model_end + 1);
    overlap.y = y;
    overlap.color = overlap.strand === "-" ? "#b7a4e8" : "#afd353";
    overlap.label = overlap.auto_overlap.target.id;

    y += this.DIMENSIONS.overlap.height + this.DIMENSIONS.overlap.margin_bottom;
  });
  this.overlaps_height = y;
};

Overlap.prototype.render = function () {
  // Create root element and popup
  if (this.svg) {
    this.svg.remove();
  }

  if (this.tooltip) {
    this.tooltip.remove();
  }

  this.svg = d3.select(this.target).append("svg");
  this.tooltip = d3.select(this.target).append("div");

  this.total_height = 0;

  const dataArea = this.svg.append("g");

  // Render top axis
  dataArea
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${this.DIMENSIONS.axis.height})`)
    .call(d3.axisTop(this.scale));

  this.total_height += this.DIMENSIONS.axis.height + this.DIMENSIONS.axis.margin_bottom;

  // Render the "current" model and sort columns
  this.renderHeader(dataArea);

  // Render each match - arrow graphic and data values
  dataArea
    .append("g")
    .attr("class", "overlaps")
    .attr("transform", `translate(0, ${this.total_height})`)
    .call(g => this.renderOverlaps(g));

  this.total_height += this.overlaps_height;

  // Set up the popup
  this.setupPopUp();
  this.svg.on("mousemove", () => this.updatePopUp());

  // Resize the host element
  this.svg
    .attr("width", this.width)
    .attr("height", this.total_height);
};

// Recalculate layout and re-render. Called after sorting.
Overlap.prototype.reRender = function() {
  this.calculateLayout();
  this.render();
};

// Inserts a text element into 'g' at 'x,y' with text 'text' and returns it.
// "dy" is set to 1em to emulate a "hanging" baseline, a consistent font is
// applied, and the cursor is set to "cursor" instead of the usual text
// selection I-beam.
function renderText(g, x, y, text, color, cursor) {
  color = color || "black";
  cursor = cursor || "default";
  return g.append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("dy", "1em")
    .attr("fill", color)
    .style("font", '10px Arial, sans-serif')
    .style("cursor", cursor)
    .text(text);
}

// Renders the header - the arrow representing the "current"
// model, and the sorting columns.
Overlap.prototype.renderHeader = function(g) {
  this.renderArrow(
    g,
    this.scale(1),
    this.scale(this.model.length + 1),
    this.total_height,
    this.DIMENSIONS.overlap.height,
    "#aaaaaa",
    false,
    this.model.id,
  );

  const columns = [
    { name: "identity", label: "%id", x: this.x_identity },
    { name: "coverage", label: "%cov", x: this.x_coverage },
    { name: "evalue", label: "E-value", x: this.x_evalue },
  ];

  const self = this;
  g
    .selectAll(".sorter")
    .data(columns)
    .enter()
      .append("g")
      .attr("class", "sorter")
      .attr("transform", d => `translate(${d.x} ${self.total_height})`)
      .style("cursor", "pointer")
      .style("user-select", "none")
      .on("click", function(d) {
        if (self.sort_by === d.name) {
          self.sort_reverse = !self.sort_reverse;
        } else {
          self.sort_by = d.name;
          self.sort_reverse = (self.sort_by !== "evalue");
        }

        self.reRender();
      })
      .each(function(d) {
        const text = renderText(d3.select(this), 0, 0, d.label, null, "pointer");
        const length = text.node().getComputedTextLength();
        renderSortArrows(d3.select(this), length + 2, 0, self.sort_by === d.name ? self.sort_reverse : null);
      });

  this.total_height += this.DIMENSIONS.overlap.height + this.DIMENSIONS.overlap.margin_bottom;
};

// Render sort arrows starting at x,y.
// sort can be true (descending), false (ascending), or null (neither)
function renderSortArrows(g, x, y, sort) {
  g.append("path")
    .attr("d", "M3,0 L0,5 L6,5 L3,0")
    .attr("transform", `translate(${x} ${y})`)
    .attr("stroke", "black")
    .attr("fill", sort === false ? "black" : "transparent");

  g.append("path")
    .attr("d", "M3,13 L0,8 L6,8 L3,13")
    .attr("transform", `translate(${x} ${y})`)
    .attr("stroke", "black")
    .attr("fill", sort === true ? "black" : "transparent");
}

// Renders the overlap arrows, and attaches click/mouseover events
Overlap.prototype.renderOverlaps = function(g) {
  const self = this;

  g.selectAll("g.overlap")
    .data(this.data)
    .enter()
      .append("g")
      .attr("class", "overlap")
      .each(function(d) {
        d3.select(this)
          .call(g => {
            g.append("a")
              .call(g => self.renderArrow(g,
                d.x0, d.x1, d.y,
                self.DIMENSIONS.overlap.height,
                d.color, d.strand === "-", d.label
              ))
              .attr("href", d => '/family/' + d.auto_overlap.target.accession)
              .style("cursor", "default")
              .on("mouseenter", function(d) { self.hovered_overlap = d; })
              .on("mouseleave", function(d) {
                if (self.hovered_overlap === d) {
                  self.hovered_overlap = null;
                }
              })
          })
          .call(g => renderText(g, self.x_identity, d.y, Math.round(d.identity * 100)))
          .call(g => renderText(g, self.x_coverage, d.y, Math.round(d.coverage * 100)))
          .call(g => renderText(g, self.x_evalue, d.y, d.evalue));
      });
};

// Calculate an arrow path.
// x0 and x1 are the left and right ends, y is the top,
// and reverse should be set to true to draw on the reverse strand
function arrowPath(x0, x1, y, height, reverse) {
  const arr_width = height / 2 * (reverse ? -1 : 1);
  if (reverse) {
    const tmp = x0;
    x0 = x1;
    x1 = tmp;
  }

  const path = d3.path();
  // starting corner
  path.moveTo(x0, y);
  // straight across
  path.lineTo(x1 - arr_width, y);
  // diagonal to tip of pointed end
  path.lineTo(x1, y + height/2);
  // diagonal back to "floor"
  path.lineTo(x1 - arr_width, y + height);
  // straight back
  path.lineTo(x0, y + height);
  return path.toString();
}

// Render an arrow, appending a path and text label into 'g'
Overlap.prototype.renderArrow = function(g, x0, x1, y, height, color, reverse, label) {
  g.append("path")
    .attr("fill", color)
    .attr("d", arrowPath(x0, x1, y, height, reverse));

  const text = renderText(g, x0 + 5, y - 1, label, "#333333");

  // If the text would run into the sidebar, set the sidebar to be the right
  // edge instead
  if (x0 + 5 + text.node().getComputedTextLength() > this.sidebar_x0) {
    text
      .attr("x", this.scale(this.model.length))
      .attr("text-anchor", "end");
  }
}

// Initializes the static parts of the popup tooltip.
Overlap.prototype.setupPopUp = function() {
  let self = this;

  this.tooltip
    .style("position", "fixed")
    .style("background", "#ffffff")
    .style("border", "2px solid #333333")
    .style("border-radius", "3px")
    .style("font-size", "0.8em")
    .style("z-index", "10")
    .style("display", "none");

  this.tooltip.title = this.tooltip.append("div")
    .style("background", "#333333")
    .style("color", "#ffffff")
    .style("padding", "0.3em 1em")
    .style("font-weight", "bold");

  this.tooltip.content = this.tooltip.append("div")
    .style("padding", "0.3em 1em");

  const li = this.tooltip.content.append("ul")
    .style("margin", "0")
    .style("padding", "0 0 0 1em")
    .append("li")
      .style("margin", "0")

  li.append("strong").text("E-value");
  li.append("span").text(": ");
  this.tooltip.content_evalue = li.append("span");

  this.tooltip.dotplot = this.tooltip.content.append("div")
    .attr("class", "dotplot");
};

// Updates the popup tooltip after the mouse has moved or entered/left an
// overlapping element
Overlap.prototype.updatePopUp = function() {
  const tooltip = this.tooltip;
  const hovered = this.hovered_overlap;

  if (!hovered) {
    tooltip.style("display", "none");
    return;
  }

  // If the hovered item changed, reset the tooltip data first
  if (this.hovered_overlap_prev !== hovered) {
    tooltip.title.text(hovered.auto_overlap.target.id);
    tooltip.content_evalue.text(hovered.evalue);

    tooltip.dotplot.text("");
    new DotPlot({ target: tooltip.dotplot.node(), data: hovered }).render();

    this.hovered_overlap_prev = hovered;
  }

  tooltip.style("display", null);

  const x = d3.event.clientX;
  const y = d3.event.clientY;

  const ttNode = tooltip.node();
  const svgNode = this.svg.node();
  const svgBBox = svgNode.getBBox();

  let displayX;
  if ((d3.mouse(svgNode)[0] + ttNode.offsetWidth) < svgBBox.width) {
    // Display to right of pointer, if it would stay within bounds
    displayX = x + 20;
  } else {
    // Otherwise display to left of pointer
    displayX = x - (ttNode.offsetWidth + 20);
  }

  let displayY;
  if (
    (y + ttNode.offsetHeight < document.querySelector("html").clientHeight)
    ||
    (y - ttNode.offsetHeight <= 0)
  ) {
    // Display only slightly above the pointer, if it would
    //   a) not go past the bottom, or
    //   b) it would go off the top of the screen if displayed above
    displayY = y - 20;
  } else {
    // Otherwise display far above the pointer
    displayY = y - (ttNode.offsetHeight + 20);
  }

  // Move the tooltip to follow the mouse
  tooltip
    .style("left", `${displayX}px`)
    .style("top", `${displayY}px`);
};

export { Overlap };
