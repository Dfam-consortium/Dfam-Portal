import { Component, AfterViewInit, Input, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'dfam-classification-tree',
  templateUrl: './classification-tree.component.html',
  styleUrls: ['./classification-tree.component.scss']
})
export class ClassificationTreeComponent implements AfterViewInit {

  private _classes: any;
  get classes(): any { return this._classes; }
  @Input() set classes(value: any) {
    this._classes = value;
    this.onDataChanged();
  }

  private _initialClass: any;
  get initialClass(): any { return this._initialClass; }
  @Input() set initialClass(value: any) {
    this._initialClass = value;
  }

  private _search: string;
  get search(): string { return this._search; }
  @Input() set search(value: string) {
    this._search = value;
    this.searchForText(this.search);
    this.render();
  }

  @ViewChild('outlet') outlet: ElementRef;

  private tooltipTag: any;
  private svgTag: any;
  private svgGTag: any;
  private rootNode: any;

  private duration = 750;
  private ySpacing = 200;
  private margin = {
    top: 20,
    right: 120,
    bottom: 20,
    left: 120
  };

  constructor() { }

  ngAfterViewInit() {
    const element = this.outlet.nativeElement;

    this.tooltipTag = d3.select(element).append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('display', 'block')
      .style('width', '200px')
      .style('padding', '5px')
      .style('font', '12px sans-serif')
      .style('background', 'white')
      .style('border-style', 'solid')
      .style('border-width', '2px')
      .style('border-color', 'lightsteelblue')
      .style('border-radius', '8px')
      .style('pointer-events', 'none')
      .style('opacity', '0');

    // Initially we do not have a size
    this.svgTag = d3.select(element).append('svg');

    // Add the translation tag
    this.svgGTag = this.svgTag.append('g');
  }

  expandAll() {
    this.expand(this.rootNode);
    this.render();
  }

  collapseAll() {
    this.collapse(this.rootNode);
    this.render();
  }

  expand(node) {
    if (node) {
      node._matched = false;
      node._matched_path = false;
      node._hidden = false;
      node._collapsed = false;
      if (node.children) {
        node.children.forEach(this.expand.bind(this));
      }
    }
  }

  // Collapse all nodes under the given node.
  collapse(node) {
    if (node) {
      node._matched = false;
      node._matched_path = false;
      node._hidden = false;
      node._collapsed = true;
      if (node.children) {
        node.children.forEach(this.collapse.bind(this));
      }
    }
  }

  // Hide all nodes under the given node
  hide(node) {
    if (node) {
      node._hidden = true;
      if (node.children) {
        node.children.forEach(this.hide.bind(this));
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
      // Initially collapse all nodes
      d._collapsed = true;
      if (d.children) {
        d.children.forEach(initTree);
      }
    }

    if (this.classes != null) {
      const classes = this.classes;
      this.rootNode = classes;

      // Always init to include the root and first generation
      initTree(classes);
      classes._collapsed = false;

      // Fixed width depends on tree depth
      const treeNodeDepth = this.treeDepth(classes);
      const width = (treeNodeDepth * (this.ySpacing)) - this.margin.right - this.margin.left;
      this.svgTag.attr('width', width + this.margin.right + this.margin.left);
      // Render the tree
      this.render({ x: 0, y: 0 });

      if (this.initialClass) {
        this.expandPath(this.initialClass);
      }
    }
  }

  // The depth of the tree starting from a given node
  // using either the visible or the complete set of
  // nodes.
  treeDepth(root) {
    let treeDepth = 0;
    const queue = [];
    let next = {
      depth: 1,
      node: root
    };
    while (next) {
      const node = next.node;
      let depth = next.depth;
      const children = node.children;
      if (children && children.length > 0) {
        depth += 1;
        if (depth > treeDepth) {
          treeDepth = depth;
        }
        children.forEach(child => queue.push({ depth, node: child }));
      }
      next = queue.shift();
    }
    return treeDepth;
  }

  searchForText(text) {
    this.collapse(this.rootNode);
    if (text === undefined || text === null || text === '') {
      return;
    }

    this.hide(this.rootNode);

    const stack = [];
    stack.push(this.rootNode);
    const textRE = new RegExp(text, 'i');
    while (stack.length > 0) {
      const tmp = stack.pop();
      if (textRE.test(tmp.name)) {
        // Go back up and open up full path
        let thisNode = tmp;
        while (thisNode._parent) {
          const parent = thisNode._parent;

          if (!thisNode._matched && !thisNode._matched_path) {
            // Create an array for children property if null
            if (!parent.children) {
              parent.children = [];
            }

            // Mark this as part of the path to a matched node
            thisNode._matched_path = true;
            thisNode._hidden = false;
            parent._collapsed = false;
          }
          thisNode = parent;
        }

        // Flag the matched node(s)
        tmp._matched = true;

        // Reset any _hidden flags on this node so it will be drawn
        tmp._hidden = false;
      }

      if (tmp.children && tmp.children.length > 0) {
        tmp.children.forEach(function(child) {
          child._parent = tmp;
          stack.push(child);
        });
      }
    }
  }

  expandPath(path) {
    this.collapse(this.rootNode);
    if (!path || typeof path !== 'string') {
      return;
    }

    path = path.replace(/^root;/, '').split(';');

    let parent = this.rootNode;
    parent._collapsed = false;

    while (path.length && parent && parent.children) {
      const segment = path.shift();

      // Find the child with this name
      const child = parent.children.find(node => node.name === segment);
      if (child) {
        // Mark this child as not-hidden and not-collapsed
        child._hidden = false;
        child._collapsed = false;

        // Mark as matched path, or matched if it's the last one.
        if (path.length) {
          child._matched_path = true;
        } else {
          child._matched = true;
        }
      }

      parent = child;
    }

    this.render();
  }


  render(fromPos?) {
    if (!this.rootNode) {
      return;
    }

    if (!fromPos) {
      fromPos = { x: 0, y: 0 };
    }

    // Compute the new tree layout.
    const d3Root = d3.hierarchy(this.rootNode, function(d) {
      if (d._collapsed || !d.children || !d.children.length) {
        return null;
      }

      return d.children.filter(function(c) {
        return !c._hidden;
      });
    });

    d3Root.sort(function(a, b) {
      return a.data.full_name.localeCompare(b.data.full_name);
    });

    d3.tree().nodeSize([20, 20])(d3Root);

    // Normalize for fixed-depth and calculate max d.x
    let maxDx = 0;
    let minDx = 99999;
    const ySpacing = this.ySpacing;
    d3Root.descendants().forEach(function(d: any) {
      if (d.x > maxDx) {
        maxDx = d.x;
      }
      if (d.x < minDx) {
        minDx = d.x;
      }
      d.y = d.depth * ySpacing;
    });
    const height = maxDx - minDx;
    this.svgTag.attr('height', (height + this.margin.top + this.margin.bottom));

    this.svgGTag.transition()
      .duration(this.duration)
      .attr('transform', 'translate(' + this.margin.left + ',' + (this.margin.top - minDx) + ')');

    // Update nodes
    const self = this;
    const nodes = this.svgGTag.selectAll('g.node')
      .data(d3Root.descendants(), d => d.data.full_name);

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = nodes.enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .attr('transform', function(d) {
        return 'translate(' + fromPos.y + ',' + fromPos.x + ')';
      })
      .on('click', function(d) {
        // Toggle children on click.
        d.data._collapsed = !d.data._collapsed;
        self.render(d);
      });

    const tooltipTag = this.tooltipTag;
    nodeEnter.append('circle')
      .attr('r', 6)
      .style('fill', '#ffffff')
      .style('stroke', 'steelblue')
      .style('stroke-width', '1.5px')
      .on('mouseover', function(d) {
        if (d.data.tooltip) {
          tooltipTag.transition()
            .duration(200)
            .style('opacity', .9);
          tooltipTag.html(d.data.tooltip);

          const d3event = d3.event as MouseEvent;
          tooltipTag.style('left', (d3event.pageX + 10) + 'px')
            .style('top', (d3event.pageY - 28) + 'px');
        }
      })
      .on('mouseout', function(d) {
        tooltipTag.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .style('fill', function(d) {
        if (d.data._matched) {
          return '#f00';
        } else if (d.data.children && d.data.children.length > 0) {
          return 'lightsteelblue';
        } else {
          return '#fff';
        }
      });

    nodeEnter.append('a')
      .attr('xlink:href', function(d) {
        return d.data.hyperlink ? d.data.hyperlink : 'javascript:void(0)';
      })
      .append('text')
      .style('font', '11px sans-serif')
      .attr('x', '-10')
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text(function(d) {
        return d.data.name;
      })
      .style('fill-opacity', 1e-6)
      .transition()
      .duration(this.duration)
      .style('fill-opacity', 1);

    // Transition nodes to their new position.
    nodeEnter.merge(nodes).transition()
      .duration(this.duration)
      .attr('transform', function(d) {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    nodes.select('circle')
      .attr('r', 6)
      .style('fill', function(d) {
        if (d.data._matched) {
          return '#f00';
        } else if (d.data.children && d.data.children.length > 0) {
          return 'lightsteelblue';
        } else {
          return '#fff';
        }
      });

    // Transition exiting nodes to the parent's new position.
    const nodeExit = nodes.exit().transition()
      .duration(this.duration)
      .attr('transform', function(d) {
        return 'translate(' + d.parent.y + ',' + d.parent.x + ')';
      })
      .remove();

    nodeExit.select('circle')
      .attr('r', 1e-6);

    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

    // Update the links
    const links = this.svgGTag.selectAll('path.link')
      .data(d3Root.links(), d => d.target.data.full_name);

    const diagonal = function(from, to) {
      const p = d3.path();
      p.moveTo(from.y, from.x);
      p.bezierCurveTo(from.y + 100, from.x, to.y - 100, to.x, to.y, to.x);
      return p.toString();
    };

    // Enter any new links at the parent's previous position.
    const linksEnter = links.enter().insert('path', 'g')
      .attr('class', 'link')
      .style('fill', 'none')
      .style('stroke', '#cccccc')
      .style('stroke-width', '1.5px')
      .attr('d', function(d) {
        return diagonal(fromPos, fromPos);
      });

    // Transition links to the new position
    linksEnter.merge(links)
      .transition()
      .duration(this.duration)
      .attr('d', function(d) {
        return diagonal(d.source, d.target);
      });

    // Transition exiting links to the parent's new position.
    links.exit().transition()
      .duration(this.duration)
      .attr('d', function(d) {
        return diagonal(d.source, d.source);
      })
      .remove();
  }
}
