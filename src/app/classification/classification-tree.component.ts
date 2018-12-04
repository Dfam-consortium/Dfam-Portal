import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'dfam-classification-tree',
  templateUrl: './classification-tree.component.html',
  styleUrls: ['./classification-tree.component.scss']
})
export class ClassificationTreeComponent implements OnInit {


  private _classes: any;
  get classes(): any { return this._classes; }
  @Input() set classes(value: any) {
    this._classes = value;
    this.onDataChanged();
  }

  private _search: string;
  get search(): string { return this._search; }
  @Input() set search(value: string) {
    this._search = value;
    this.searchForText(this.search);
    this.update(this.rootNode);
  }

  @ViewChild('outlet') outlet: ElementRef;

  private tooltipTag: any;
  private svgTag: any;
  private svgGTag: any;
  private d3tree: any;
  private rootNode: any;

  private duration = 750;
  private ySpacing = 200;
  private margin = {
    top: 20,
    right: 120,
    bottom: 20,
    left: 120
  };

  private nextID = 0;

  constructor() { }

  ngOnInit() {
    var element = this.outlet.nativeElement;

    this.tooltipTag = d3.select(element).append("div")
      .attr("class", "tooltip")
      .style({
        "position": "absolute",
        "display": "block",
        "width": "200px",
        "padding": "5px",
        "font": "12px sans-serif",
        "background": "white",
        "border-style": "solid",
        "border-width": "2px",
        "border-color": "lightsteelblue",
        "border-radius": "8px",
        "pointer-events": "none",
        "opacity": "0",
      });

    // Initially we do not have a size
    this.svgTag = d3.select(element)
      .append('svg');

    // Add the translation tag
    this.svgGTag = this.svgTag.append("g");

    this.d3tree = d3.layout.tree()
      .nodeSize([20, 20]);
  }

  expandAll() {
    this.expand(this.rootNode);
    this.update(this.rootNode);
  }

  collapseAll() {
    this.collapse(this.rootNode);
    this.update(this.rootNode);
  }

  expand(node) {
    if (node) {
      node._matched = false;
      node._matched_path = false;
      node._hidden = false;
      if (node._children)
        node.children = node._children;
      if (node.children)
        node.children.forEach(this.expand.bind(this));
    }
  }

  // Collapse all nodes under the given node.
  // As D3 uses the "children" property to layout
  // the tree we can collapse a node by storing the
  // children under a different property.  Here
  // we simply set the .children to null and hope
  // that somewhere else the links were copied.
  collapse(node) {
    if (node) {
      node._matched = false;
      node._matched_path = false;
      node._hidden = false;
      if (node.children) {
        node.children.forEach(this.collapse.bind(this));
        node.children = null;
      }
    }
  }

  onDataChanged() {
    function initTree(d) {
      // Set all nodes as unmatched
      d._matched = false;
      // Nodes are not part of a matched path yet
      d._matched_path = false;
      // All nodes are visible
      d._hidden = false;
      if (d.children) {
        // Initially collapse all nodes
        d._children = d.children;
        d._children.forEach(initTree);
        d.children = null;
      }
    }

    if (this.classes != null) {
      let classes = this.classes;
      this.rootNode = classes;
      // Always init to include the root and first generation
      if (classes.children) {
        classes._children = classes.children;
        classes._children.forEach(initTree);
      }
      // Fixed width depends on tree depth
      let treeNodeDepth = this.treeDepth(classes, 1);
      let width = (treeNodeDepth * (this.ySpacing)) - this.margin.right - this.margin.left;
      this.svgTag.attr("width", width + this.margin.right + this.margin.left);
      // Origin for root node transition
      classes.x0 = 0;
      classes.y0 = 0;
      // Render the tree
      this.update(classes);
    }
  }

  // The depth of the tree starting from a given node
  // using either the visible or the complete set of
  // nodes.
  treeDepth(root, useCollapsed) {
    var treeDepth = 0;
    var queue = [];
    var next = {
      depth: 1,
      node: root
    };
    while (next) {
      var node = next.node;
      var depth = next.depth;
      var children = node.children;
      if (useCollapsed)
        children = node._children;
      if (children && children.length > 0) {
        depth += 1;
        if (depth > treeDepth)
          treeDepth = depth;
        children.forEach(function(child) {
          queue.push({
            depth: depth,
            node: child
          });
        });
      }
      next = queue.shift();
    }
    return treeDepth;
  }

  searchForText(text) {
    this.collapse(this.rootNode);
    if (text === undefined || text === null || text === "")
      return;

    var stack = [];
    stack.push(this.rootNode);
    var textRE = new RegExp(text, "i");
    while (stack.length > 0) {
      var tmp = stack.pop();
      if (textRE.test(tmp.name)) {
        // Go back up and open up full path
        var thisNode = tmp;
        while (thisNode._parent) {
          var parent = thisNode._parent;

          if (!thisNode._matched && !thisNode._matched_path) {
            // Create an array for children property if null
            if (!parent.children)
              parent.children = [];

            parent.children.push(thisNode);

            // Mark this as part of the path to a matched node
            thisNode._matched_path = true;
            thisNode._hidden = false;
          }
          thisNode = parent;
        }

        // Flag the matched node(s)
        tmp._matched = true;

        // Reset any _hidden flags on this node so it will be drawn
        tmp._hidden = false;

      }

      if (tmp._children && tmp._children.length > 0) {
        tmp._children.forEach(function(child) {
          child._parent = tmp;
          stack.push(child);
        });
      }
    }
  }

  update(root, source?) {
    if (!root) {
      return;
    }

    if (!source) {
      source = root;
    }

    // Compute the new tree layout.
    var nodes = this.d3tree.nodes(root).filter(function(d) {
      return !d._hidden;
    }).reverse();

    var links = this.d3tree.links(nodes);

    // Normalize for fixed-depth and calculate max d.x
    var maxDx = 0;
    var minDx = -1;
    let ySpacing = this.ySpacing;
    nodes.forEach(function(d) {
      if (d.x > maxDx)
        maxDx = d.x;
      if (minDx == -1 || d.x < minDx)
        minDx = d.x;
      d.y = d.depth * ySpacing;
    });
    let height = maxDx + Math.abs(minDx);
    this.svgTag.attr("height", (height + this.margin.top + this.margin.bottom));

    this.svgGTag.transition()
      .duration(this.duration)
      .attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + (Math.abs(minDx))) + ")");

    // Update the nodes?
    var self = this;
    var node = this.svgGTag.selectAll("g.node")
      .data(nodes, function(d) {
        return d.id || (d.id = ++self.nextID);
      });

    // Toggle children on click.
    function click(d) {
      if (d.children) {
        d.children = null;
      } else {
        d.children = d._children;
      }
      self.update(self.rootNode, d);
    }

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on("click", click);

    var tooltipTag = this.tooltipTag;
    nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style({ fill: "#ffffff", stroke: "steelblue", "stroke-width": "1.5px" })
      .on('mouseover', function(d) {
        if (d.tooltip) {
          tooltipTag.transition()
            .duration(200)
            .style("opacity", .9);
          tooltipTag.html(d.tooltip);

          let d3event = d3.event as MouseEvent;
          tooltipTag.style("left", (d3event.pageX + 10) + "px")
            .style("top", (d3event.pageY - 28) + "px");
        }
      })
      .on('mouseout', function(d) {
        tooltipTag.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .style("fill", function(d) {
        if (d._matched)
          return "#f00";
        else if (d._children && d._children.length > 0)
          return "lightsteelblue";
        else
          return "#fff";
      });

    nodeEnter.append("a")
      .attr('xlink:href', function(d) {
        return d.hyperlink ? d.hyperlink : "javascript:void(0)";
      })
      .append("text")
      .style("font", "11px sans-serif")
      .attr("x", -10)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(function(d) {
        return d.name;
      })
      .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(this.duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    nodeUpdate.select("circle")
      .attr("r", 6)
      .style("fill", function(d) {
        if (d._matched)
          return "#f00";
        else if (d._children && d._children.length > 0)
          return "lightsteelblue";
        else
          return "#fff";
      });


    nodeUpdate.select("text")
      .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
      .duration(this.duration)
      .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    nodeExit.select("circle")
      .attr("r", 1e-6);

    nodeExit.select("text")
      .style("fill-opacity", 1e-6);

    // Update the links
    var link = this.svgGTag.selectAll("path.link")
      .data(links, function(d) {
        return d.target.id;
      });

    var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .style({ "fill": "none", "stroke": "#cccccc", "stroke-width": "1.5px" })
      .attr("d", function(d) {
        var o = {
          x: source.x0,
          y: source.y0
        };
        return diagonal({
          source: o,
          target: o
        });
      });

    // Transition links to their new position.
    link.transition()
      .duration(this.duration)
      .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(this.duration)
      .attr("d", function(d) {
        var o = {
          x: source.x,
          y: source.y
        };
        return diagonal({
          source: o,
          target: o
        });
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

  }
}
