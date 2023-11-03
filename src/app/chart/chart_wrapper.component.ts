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
    default: string = 'uncurated'
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
        .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
    }

    makeChart(key){
        this.key = key
        this.data = this.datasets[key]
        this.createColors();
        this.drawChart();
    }

    createColors(): void {
        this.colors = d3.scaleOrdinal()
        .domain(this.data.map(d => d.count.toString()))
        .range(['#eef2e5', '#9db166', '#6b8821', '#43610d']);
    }

    drawChart(): void {
        const pie = d3.pie<any>().value((d: any) => d.count).sort(null);
        
        const pathArc = d3.arc()
            .innerRadius(30)
            .outerRadius(this.radius)

        this.svg
        .selectAll('path')
        .data(pie(this.data))
        .join('path')
        .transition()
        .duration(1000)
        .attr('d', pathArc)
        .attr('fill', (d: any, i: any) => (this.colors(i)))
        .attr("stroke", "white")
        .style("stroke-width", "1px")
        .style("opacity", 1)
        
        const labelLocation = d3.arc()
        .innerRadius(50)
        .outerRadius(this.radius);

        this.svg
        .selectAll('text')
        .data(pie(this.data))
        .join('text')
        .transition()
        .duration(1000)
        .attr('d', pathArc)
        .text((d: any)=> d.data.group)
        .attr("transform", (d: any) => "translate(" + labelLocation.centroid(d) + ")")
        .style("text-anchor", "middle")
        .style("font-size", 18)
        .style( "text-shadow", "-1px 0 white, 0 1px white, 1px 0 white, 0 -1px white");
    }
}
