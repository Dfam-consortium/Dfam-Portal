import * as d3 from 'd3';

function FeaturesVisualization(options) {
  options = options || {};
  this.target = options.target || document.body;

  this.DIMENSIONS = {
    margin: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
    tsd: {
      margin_side: 20,
    },
    axis: {
      height: 30,
      margin_bottom: 20,
    },
    feature: {
      box_height: 15,
      box_text_space: 5,
      text_height: 20,
      margin_bottom: 4,
    },
    coding_sequence: {
      intron_inflect_height: 3,
    },
    section: {
      min_height: 100,
    },
    divider_margin: 5,
  };

  this.setData(options.data || {});
};

// Sets the data to be rendered, normalizes it, separates it into
// sections, and recalculates the layout.
FeaturesVisualization.prototype.setData = function(data) {
  this.data = data;

  const CURATED_FEATURE_TYPES = [
    "named_region",
    "binding_site",
  ];

  function isCuratedFeature(feature) {
    return CURATED_FEATURE_TYPES.includes(feature.type);
  }

  let curated = { class: "curated", name: "curated", items: [] };
  let aligned = { class: "aligned", name: "aligned", items: [] };

  // Normalize: rename e.g. model_start_pos => start and exon_starts+exon_ends => exons,introns
  // Segregate: push features into either curated.items or aligned.items
  data.coding_seqs.forEach(cds => {
    cds.segments = [];
    for (let i = 0; i < cds.exon_count; i++) {
      let left = cds.exon_starts[i];
      let right = cds.exon_ends[i];
      if (left > right) {
        let tmp = left;
        left = right;
        right = tmp;
      }
      cds.segments.push([left, right]);
    }

    cds.segments.sort((a, b) => a.start - b.start);

    cds.between_segments = [];
    let prev_end = -1;
    for (let i = 0; i < cds.segments.length; i++) {
      if (prev_end != -1) {
        cds.between_segments.push([prev_end + 1, cds.segments[i][0]]);
      }
      prev_end = cds.segments[i][1];
    }

    cds.label = cds.product;

    curated.items.push(cds);
  });

  data.features.forEach(feature => {
    feature.start = feature.model_start_pos;
    feature.end = feature.model_end_pos;

    const segs_attr = feature.attributes.find(a => a.attribute === "prot_segments");
    if (feature.type === "protein_match" && segs_attr) {
      // Rename fields and calculate segments similarly to coding sequences above
      const segs = segs_attr.value.split(",").map(s => parseInt(s.trim()));
      feature.segments = [];
      for (let i = 0; i < segs.length; i += 2) {
        let left = segs[i];
        let right = segs[i + 1];
        if (left > right) {
          let tmp = left;
          left = right;
          right = tmp;
        }
        feature.segments.push([left, right]);
      }

      feature.segments.sort((a, b) => a.start - b.start);

      feature.between_segments = [];
      let prev_end = -1;
      for (let i = 0; i < feature.segments.length; i++) {
        if (prev_end != -1) {
          feature.between_segments.push([prev_end + 1, feature.segments[i][0]]);
        }
        prev_end = feature.segments[i][1];
      }

      feature.reverse = feature.attributes.find(a => a.attribute === "orientation" && a.value === "-") !== undefined;
    }

    if (isCuratedFeature(feature)) {
      curated.items.push(feature);
    } else {
      aligned.items.push(feature);
    }
  });

  // Calculate layout
  this.sections = [curated, aligned];
  this.sections.forEach(s => this.layoutSection(s));
};

// Layout: set x0, x1, y, and similar properties taking into account
// items that have swapped coordinates
FeaturesVisualization.prototype.layoutSection = function(section) {
  const DIM_feature = this.DIMENSIONS.feature;
  let y = 0;
  section.items.forEach(item => {
    let left = item.start;
    let right = item.end;
    if (left > right) {
      let tmp = left;
      left = right;
      right = tmp;
    }

    item.x0 = left;
    item.x1 = right;
    item.y0 = y;
    item.y1 = y + DIM_feature.box_height;
    item.ymid = (item.y1 + item.y0) / 2;

    y += DIM_feature.box_height + DIM_feature.box_text_space + DIM_feature.text_height + DIM_feature.margin_bottom;
  });
  section.height = y;
  if (section.items.length && section.height < this.DIMENSIONS.section.min_height) {
    section.height = this.DIMENSIONS.section.min_height;
  }
}

// Render a generic feature:
//
// |------|
// feature
FeaturesVisualization.prototype.renderFeature = function(g) {
  // left bar
  g.call(g => g
    .append("line")
    .attr("stroke", "black")
    .attr("x1", d => this.scale(d.x0))
    .attr("y1", d => d.y0)
    .attr("x2", d => this.scale(d.x0))
    .attr("y2", d => d.y1)
  )
  // bar across
  .call(g => g
    .append("line")
    .attr("stroke", "black")
    .attr("x1", d => this.scale(d.x0))
    .attr("y1", d => d.ymid)
    .attr("x2", d => this.scale(d.x1 + 1))
    .attr("y2", d => d.ymid)
  )
  // right bar
  .call(g => g
    .append("line")
    .attr("stroke", "black")
    .attr("x1", d => this.scale(d.x1 + 1))
    .attr("y1", d => d.y0)
    .attr("x2", d => this.scale(d.x1 + 1))
    .attr("y2", d => d.y1)
  )
  .call(g => g
    .append("text")
    .text(d => d.label)
    .attr("dominant-baseline", "hanging")
    .attr("x", d => this.scale(d.x0))
    .attr("y", d => d.y1 + this.DIMENSIONS.feature.box_text_space)
  );
};

// Render segments for a feature, such as exons or chained fragments.
// Currently implemented styles:
//   "cds" - inflected caret to represent introns between the segments (exons)
//   "plain" - a simple line between segments
FeaturesVisualization.prototype.renderSegments = function(g, data, style) {
  // Segments are drawn as a box for all current styles
  g.call(g => g
        .selectAll(".segment")
    .data(d => d.segments)
    .enter()
      .append("rect")
        .attr("class", "segment")
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("x", d => this.scale(d[0]))
        .attr("y", d => data.y0)
        .attr("width", d => this.scale(d[1] + 1) - this.scale(d[0]))
        .attr("height", this.DIMENSIONS.feature.box_height)
  );

  // Between_segments are drawn as inflected introns for "cds" style,
  // or as simple lines for "plain"
  if (style == "cds") {
    g.call(g => g
          .selectAll(".between-segment")
      .data(d => d.between_segments)
      .enter()
        .append("path")
          .attr("class", "between-segment")
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("d", d => this.intronPath(
          this.scale(d[0]),
          this.scale(d[1]),
          data.y0,
          (data.reverse ? -1 : 1) * this.DIMENSIONS.coding_sequence.intron_inflect_height,
        ))
    );
  } else if (style === "plain") {
    g.call(g => g
          .selectAll(".between-segment")
      .data(d => d.between_segments)
      .enter()
        .append("line")
          .attr("class", "between-segment")
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("x1", d => this.scale(d[0]))
        .attr("y1", d => data.ymid)
        .attr("x2", d => this.scale(d[1]))
        .attr("y2", d => data.ymid)
    );
  } else {
    throw new Exception("Unknown segment style: " + style);
  }
};

// Render a protein match (as chained fragments)
FeaturesVisualization.prototype.renderProteinMatch = function(g, feature) {
  g
  .call(g => this.renderSegments(g, feature, "plain"))
  .call(g => g
    .append("text")
    .text(d => proteinLabel(d))
    .attr("dominant-baseline", "hanging")
    .attr("x", d => this.scale(d.x0))
    .attr("y", d => d.y1 + this.DIMENSIONS.feature.box_text_space)
  );
}

// Calculate an intron path, which spans 'from'-'to' on the x axis and makes
// a bend with height 'inflection' above the y value.
FeaturesVisualization.prototype.intronPath = function(from, to, y, inflection) {
  let path = d3.path();
  path.moveTo(from, y)
  path.lineTo((from + to) / 2, y - inflection)
  path.lineTo(to, y)
  return path.toString();
}

function proteinLabel(d) {
  if (d.reverse) {
    return "< " + d.label;
  } else {
    return d.label + " >";
  }
}

// Render a coding sequence with exons and introns
FeaturesVisualization.prototype.renderCDS = function(g, cds) {
  g
  .call(g => this.renderSegments(g, cds, "cds"))
  .call(g => g
    .append("text")
      .text(d => proteinLabel(d))
      .attr("dominant-baseline", "hanging")
      .attr("x", d => this.scale(d.x0))
      .attr("y", d => d.y1 + this.DIMENSIONS.feature.box_text_space)
  );
};

// Render the appropriate shape depending on the data type associated with 'g'
FeaturesVisualization.prototype.renderAny = function(g) {
  let self = this;
  g.each(function(d) {
    d3.select(this).call(g => {
      if (d.exon_count) {
        self.renderCDS(g, d);
      } else if (d.type === "protein_match") {
        self.renderProteinMatch(g, d);
      } else {
        self.renderFeature(g);
      }
    });
  });
}

// Render the TSD boxes and main axis labels
FeaturesVisualization.prototype.renderAxis = function(g, width, tsd) {
  let left_margin = this.DIMENSIONS.margin.left;
  let right_margin = this.DIMENSIONS.margin.right;

  if (tsd) {
    // Draw the fixed text "TSD" in a box and add it to the left_margin
    let tsd_left = g
      .append("text")
        .text("TSD")
        .attr("x", left_margin)
        .attr("y", 10)
        .attr("dominant-baseline", "hanging")
        .call(text => text.append("title").text(tsd));
    let tsd_left_box = tsd_left.node().getBBox();
    g.append("rect")
      .attr("x", tsd_left_box.x)
      .attr("y", tsd_left_box.y)
      .attr("width", tsd_left_box.width)
      .attr("height", tsd_left_box.height)
      .attr("stroke", "black")
      .attr("fill", "none")

    left_margin += tsd_left_box.width + this.DIMENSIONS.tsd.margin_side;

    // And the same on the right
    let tsd_right = g
      .append("text")
        .text("TSD")
        .attr("x", width - right_margin)
        .attr("y", 10)
        .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "end")
        .call(text => text.append("title").text(tsd));
    let tsd_right_box = tsd_right.node().getBBox();
    g.append("rect")
      .attr("x", tsd_right_box.x)
      .attr("y", tsd_right_box.y)
      .attr("width", tsd_right_box.width)
      .attr("height", tsd_right_box.height)
      .attr("stroke", "black")
      .attr("fill", "none")

    right_margin += tsd_right_box.width + this.DIMENSIONS.tsd.margin_side;
  }

  this.scale = d3.scaleLinear().domain([1, this.data.length]).range([left_margin, width - right_margin]);
  let axis = d3.axisTop(this.scale);

  g
    .append("g")
    .attr("id", "axis")
    .attr("transform", `translate(0, ${this.DIMENSIONS.axis.height})`)
    .call(axis);

  this.total_height += this.DIMENSIONS.axis.height + this.DIMENSIONS.axis.margin_bottom;
}

// Render a "section" (such as "curated" or "aligned").
// This includes a label on the left and all features in section_data.items.
FeaturesVisualization.prototype.renderSection = function(g, section_data) {
  if (section_data.items.length) {
    g
      .append("g")
      .attr("class", section_data.class)
      .attr("transform", `translate(0, ${this.total_height})`)
      .call(g => g.append("text")
        .text(section_data.name)
        .attr("x", 0)
        .attr("y", section_data.height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .attr("transform", `rotate(-90 0 ${section_data.height / 2})`)
      )
      .selectAll("g")
      .data(section_data.items)
      .enter()
        .append("g")
        .call(g => this.renderAny(g));
  }
  this.total_height += section_data.height;
};

// Render a vertical line between sections at the current total_height.
FeaturesVisualization.prototype.renderSectionDivider = function(svg) {
  this.total_height += this.DIMENSIONS.divider_margin;

  svg
    .append("line")
    .attr("stroke", "black")
    .attr("x1", this.scale(0))
    .attr("y1", this.total_height)
    .attr("x2", this.scale(this.data.length))
    .attr("y2", this.total_height);

  this.total_height += this.DIMENSIONS.divider_margin;
};

// (Re)render the axis and all sections
FeaturesVisualization.prototype.render = function() {
  let width = this.target.offsetWidth;

  if (this.svg) {
    this.svg.remove();
  }
  this.svg = d3.select(this.target).append("svg");

  this.total_height = 0;
  this.renderAxis(this.svg, width, this.data.target_site_cons);
  for (let i = 0; i < this.sections.length; i++) {
    if (this.sections[i].items.length) {
      this.renderSection(this.svg, this.sections[i]);
      if ((i + 1) < this.sections.length && this.sections[i + 1].items.length > 0) {
        this.renderSectionDivider(this.svg);
      }
    }
  }
  this.svg.attr("width", width).attr("height", this.total_height);
}

export { FeaturesVisualization };
