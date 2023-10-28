import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3'

@Component({
    selector: 'dfam-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss']
  })
export class ChartComponent implements OnInit {
  @Input() data: Array<any>;
  @Input() chart_id: string
  @Input() specs: object

  height: number
  width: number
  radius: number

  ngOnInit(): void {
    this.height = this.specs['dimension']
    this.width = this.specs['dimension']
    this.radius = Math.min(this.width, this.height) / 2 - this.specs['margin'];

    this.createSvg();
    this.createColors();
    this.drawChart();

  }
  
  private svg: any;
  
  // The radius of the pie chart is half the smallest side
  private colors;

  private createSvg(): void {
    this.svg = d3.select(`#${this.chart_id}`)
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + this.width / 2 + "," + this.height / 2 + ")"
    );
  }

  private createColors(): void {
    this.colors = d3.scaleOrdinal()
    .domain(this.data.map(d => d.count.toString()))
    .range(["#c7d3ec", "#a5b8db", "#879cc4", "#677795", "#5a6782"]);
  }

  private drawChart(): void {
    // Compute the position of each group on the pie:
    const pie = d3.pie<any>().value((d: any) => Number(d.count));
  
    // Build the pie chart
    this.svg
    .selectAll('pieces')
    .data(pie(this.data))
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(this.radius)
    )
    .attr('fill', (d: any, i: any) => (this.colors(i)))
    .attr("stroke", "#121926")
    .style("stroke-width", "1px");
  
    // Add labels
    const labelLocation = d3.arc()
    .innerRadius(100)
    .outerRadius(this.radius);
  
    this.svg
    .selectAll('pieces')
    .data(pie(this.data))
    .enter()
    .append('text')
    .text((d: any)=> d.data.group)
    .attr("transform", (d: any) => "translate(" + labelLocation.centroid(d) + ")")
    .style("text-anchor", "middle")
    .style("font-size", 15);
  }
}