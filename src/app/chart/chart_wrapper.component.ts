import { Component, AfterViewInit } from '@angular/core';
import * as d3 from 'd3'

@Component({
    selector: 'dfam-chart-wrapper',
    templateUrl: './chart_wrapper.component.html',
    styleUrls: ['./chart_wrapper.component.scss']
  })
export class ChartWrapperComponent implements AfterViewInit {
    height: number = 300
    width: number = 300
    radius: number
    data: Array<any>
    svg: any;
    colors: any;
    default: string = 'curated'
    key: string = this.default
    margin: number = 20

    datasets = {
        'uncurated': [
            { group : "Mammalia", count : 240940},
            { group : "Birds", count : 205910},
            { group : "Reptiles", count : 145365},
            { group : "Amphibians", count : 46715},
            { group : "Fish", count : 788964},
            { group : "Plants", count : 176667},
            { group : "Echinoderms", count : 9256},
            { group : "Protostomes", count : 1951101},
            { group : "Fungi", count : 43},
            { group : "Other", count : 9106},
        ],
        'curated': [
            { group : "ASFAFS", count : 7964},
            { group : "AFSFASF", count : 17667},
            { group : "Protostomes", count : 43},
            { group : "ASgsfgbds", count : 195101},
            { group : "Mammalia", count : 240940},
            { group : "Birds", count : 205910},
            { group : "Reptiles", count : 14565},
            { group : "Other", count : 9106},
        ]
    }

    ngAfterViewInit(): void {
        this.radius = Math.min(this.width, this.height) / 2 - this.margin;
        this.createSvg();
        this.makeChart(this.default)
    }

    createSvg(): void {
        this.svg = d3.select(`#pie_chart`)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")")
        
        // this.svg.append("g")
        // .attr("class", "slices");
        
        // this.svg.append("g")
        // .attr("class", "labels");
        
        // this.svg.append("g")
        // .attr("class", "lines");
    }

    createColors(): void {
        this.colors = d3.scaleOrdinal()
        .domain(this.data.map(d => d.count.toString()))
        .range(['#eef2e5', '#9db166', '#6b8821', '#43610d']);
    }

    makeChart(key){
        this.key = key
        this.data = this.datasets[key]
        this.createColors();
        this.drawChart();
    }

    drawChart(): void {
        const pie = d3.pie<any>().value((d: any) => d.count).sort(null);

        const arc = d3.arc()
            .innerRadius(this.radius * 0.2)
            .outerRadius(this.radius * 0.8)
        
        const outerArc = d3.arc()
            .innerRadius(this.radius * 0.9)
            .outerRadius(this.radius * 0.9)

        function arcTween(a) {
            const i = d3.interpolate(this._current, a);
            this._current = i(1);
            return (t) => arc(i(t));
        }
   
        /* ------- PIE SLICES -------*/
        // Join new data      Source/inspiration: https://gist.github.com/adamjanes/5e53cfa2ef3d3f05828020315a3ba18c
        const path = this.svg.selectAll("path")
            .data(pie(this.data));

        // Update existing arcs
        path.transition().duration(1000).attrTween("d", arcTween);

        // Enter new arcs
        path.enter().append("path")
            .attr("fill", (d, i) => this.colors(i))
            .attr("d", arc)
            .attr("stroke", "white")
            .attr("stroke-width", "1px")
            .each(function(d) { this._current = d; });
        
        // /* ------- TEXT LABELS -------*/
        const text = this.svg.selectAll("text")
		    .data(pie(this.data));
        
        // text.transition().duration(1000).attrTween("d", arcTween);

        text.enter().append("text")
            .attr("d", outerArc)
            .text(function(d) {
                    return d.data.group;
                })
            .each(function(d) { this._current = d; });

        // text.enter()
        //     .append("text")
        //     .attr("dy", ".35em")
        //     .text(function(d) {
        //         return d.data.group;
        //     });
	
        const midAngle = (d) => {
            return d.startAngle + (d.endAngle - d.startAngle)/2;
        }

        // text.transition().duration(1000)
        //     .attrTween("transform", function(d) {
        //         this._current = this._current || d;
        //         var interpolate = d3.interpolate(this._current, d);
        //         this._current = interpolate(0);
        //         return function(t) {
        //             var d2 = interpolate(t);
        //             var pos = outerArc.centroid(d2);
        //             pos[0] = this.radius * (midAngle(d2) < Math.PI ? 1 : -1);
        //             return "translate("+ pos +")";
        //         };
        //     })
        //     .styleTween("text-anchor", function(d){
        //         this._current = this._current || d;
        //         var interpolate = d3.interpolate(this._current, d);
        //         this._current = interpolate(0);
        //         return function(t) {
        //             var d2 = interpolate(t);
        //             return midAngle(d2) < Math.PI ? "start":"end";
        //         };
        //     });

        // text.exit()
        //     .remove();
       
        //     /* ------- SLICE TO TEXT POLYLINES -------*/
	    // let polyline = this.svg.select(".lines").selectAll("polyline")
        //     .data(pie(this.data), key);

        // polyline.enter()
        //     .append("polyline");

        // polyline.transition().duration(1000)
        //     .attrTween("points", function(d){
        //         this._current = this._current || d;
        //         var interpolate = d3.interpolate(this._current, d);
        //         this._current = interpolate(0);
        //         return function(t) {
        //             var d2 = interpolate(t);
        //             var pos = outerArc.centroid(d2);
        //             pos[0] = this.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
        //             return [arc.centroid(d2), outerArc.centroid(d2), pos];
        //         };			
        //     });

        // polyline.exit()
        //     .remove();
    }
}
