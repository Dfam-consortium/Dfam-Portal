import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3'
import * as datasets from "./datasets.json";

@Component({
    selector: 'dfam-chart-wrapper',
    templateUrl: './chart_wrapper.component.html',
    styleUrls: ['./chart_wrapper.component.scss']
  })
export class ChartWrapperComponent implements AfterViewInit {
    height: number = 300
    width: number = 450 
    margin: number = 20
    radius: number = Math.min(this.width, this.height) / 2 - this.margin;
    data: Array<any>
    svg: any;
    colors: any;
    default: string = 'curated'
    key: string = this.default
    datasets: object
    constructor(
        private router: Router,
      ) {}

    ngAfterViewInit(): void {
        this.radius = Math.min(this.width, this.height) / 2 - this.margin;
        this.datasets = datasets
        this.createSvg();
        this.makeChart(this.default)
    }

    createSvg(): void {
        this.svg = d3.select(`#pie_chart`)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
    }

    createColors(): void {
        let vals = this.data.map(d=>d.count)
        let min = Math.min(...vals);
        let max = Math.max(...vals);
        this.colors = d3.scaleLinear([min, max], ['#eef2e5','#43610d'])
    }

    makeChart(key){
        this.key = key
        this.data = this.datasets[key]
        this.createColors();
        this.drawChart();
        this.drawChart();  // This is necessary because the .enter() functions do not
                           // fully initialize each element. TODO.
    }

    drawChart(): void {
        // Sort order is defined in the datastructure so don't allow d3.pie() to automatically
        // sort the data by using ".sort(null)".  
        const pie = d3.pie<any>().sort(null).value((d: any) => d.count);

        const arc = d3.arc()
            .innerRadius(this.radius * 0.2)
            .outerRadius(this.radius * 0.8)
        
        const outerArc = d3.arc()
            .innerRadius(this.radius * 0.9)
            .outerRadius(this.radius * 0.9)
   
        function lkey(d) { if ( d ) { return d.data.group; }else { return this.getAttribute("id"); } }

        // cool drop shadow effect from https://codepen.io/Aayushrij/pen/rLzwwJ
        var defs = this.svg.append("defs");
        var filter = defs.append("filter")
                        .attr("id", "drop-shadow")
                        .attr("height","130%");

        filter.append("feGaussianBlur")
                .attr("in","SourceAlpha")
                .attr("stdDeviation", 3)
                .attr("result", "blur");

        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 3)
            .attr("dy", 3)
            .attr("result", "offsetBlur");
            var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");

        /* ------- PIE SLICES -------*/
        // Join new data. Source/inspiration: https://gist.github.com/adamjanes/5e53cfa2ef3d3f05828020315a3ba18c
     
        // this.svg points to the <g transform...> element so selectAll will apply 
        // to everything below that.  In this case all <path> elements.  Supposedly
        // the lkey function is supposed to support the dividing up of selected 
        // elements into two sets.  The ones that are already defined and the ones
        // that need to be created.
        const slice = this.svg.selectAll("path")
            .data(pie(this.data), lkey);

        // This creates any new data elements that haven't yet been created
        // as path elements.  NOTE: This is the one case where .enter() 
        // generates a full element on the first pass.  The text and line 
        // .enter() routines still need fixing.
        slice.enter()
            .insert("path")
            .attr("id", (d,i) => d.data.group)
            .style("fill", (d,i) => this.colors(d.data.count))
            .attr("d", (d,i) => arc(d))
            .on('mouseover', (d,i,n)=> {
                if (d.data.taxon > 0){
                    d3.select(n[i])
                    .attr("stroke","#fff")
                    .attr("stroke-width","2px")
                    .style("filter", "url(#drop-shadow)")
                }
            })
            .on('mouseout', (d,i,n)=> d3.select(n[i])
                .attr('stroke','none')
                .style('filter','none'))
            .on('click', (d) => {
                if (d.data.taxon > 0){
                    let params = { 'clade': d.data.taxon, 'clade_descendants': true} 
                    this.key === 'uncurated' ? params['include_raw'] = true : {}
                    this.router.navigate(['browse'], { queryParams: params });
                }
            })

        slice   
            .transition().duration(1000)
            .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
            })

        slice.exit()
            .remove();

        /* ------- TEXT LABELS -------*/
        const text = this.svg.selectAll("text")
            .data(pie(this.data), lkey);

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .attr("style", "font-size:11px;")
            .text(function(d) {
                return d.data.group;
            });

        const midAngle = (d) => {
            return d.startAngle + (d.endAngle - d.startAngle)/2;
        }

        const radius = this.radius;
        text.transition().duration(1000)
            .attrTween("transform", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate("+ pos +")";
                };
            })
            .styleTween("text-anchor", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start":"end";
                };
            });

        text.exit()
            .remove();
       
        /* ------- SLICE TO TEXT POLYLINES -------*/
        let polyline = this.svg.selectAll("polyline")
            .data(pie(this.data), lkey);

        polyline.enter().remove()
            .append("polyline")
            .attr("style", "fill:none;opacity: .3;stroke:black;stroke-width:2px; z-index:999;");

        polyline.transition().duration(1000)
            .attrTween("points", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    var cent = arc.centroid(d2).map(d=>d*1.62)
                    return [cent, outerArc.centroid(d2), pos];
                };			
            });

        polyline.exit()
            .remove();
    }
}
