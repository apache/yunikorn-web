/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { QueueInfo } from '@app/models/queue-info.model';
import { finalize } from 'rxjs/operators';
import { SchedulerService } from '@app/services/scheduler/scheduler.service';

import { select } from "d3-selection";
import * as d3hierarchy from "d3-hierarchy";
import * as d3flextree from "d3-flextree";
import * as d3zoom from "d3-zoom";
import { transition } from 'd3-transition'; // we need to import transition even if we don't use it explicitly

export interface TreeNode {
  name: string;
  children?: TreeNode[];
  _children?: TreeNode[];
}

@Component({
  selector: 'queues-v2-view',
  templateUrl: './queues-v2.component.html',
  styleUrls: ['./queues-v2.component.scss']
})

export class QueueV2Component implements OnInit {
  rootQueue: QueueInfo | null = null;

  constructor(
    private scheduler: SchedulerService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchSchedulerQueuesForPartition()
  }

  fetchSchedulerQueuesForPartition() {
    let partitionName = 'default';
    this.spinner.show();
  
    this.scheduler
      .fetchSchedulerQueues(partitionName)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      )
      .subscribe((data) => {
        if (data && data.rootQueue) {
          this.rootQueue = data.rootQueue;
          queueVisualization(this.rootQueue as QueueInfo)
          setTimeout(() => this.adjustToScreen(),1000) // since the ngAfterViewInit hook is not working, we used setTimeout instead
        }
      });
  }

  adjustToScreen() {
    const fitButton = document.getElementById('fitButton');
    fitButton?.click(); 
  }
}

function queueVisualization(rawData : QueueInfo){
  let numberOfNode = 0;
  const duration = 750;

  const svg = select('.visualize-area').append('svg')
               .attr('width', '100%')
               .attr('height', '100%')
                  
    function fitGraphScale(){
      const baseSvgElem = svg.node() as SVGGElement;
      const bounds = baseSvgElem.getBBox();
      const parent = baseSvgElem.parentElement as HTMLElement;
      const fullWidth = parent.clientWidth;
      const fullHeight = parent.clientHeight;
      
      const xfactor: number = fullWidth / bounds.width;
      const yfactor: number = fullHeight / bounds.height;
      let scaleFactor: number = Math.min(xfactor, yfactor);

       // Add some padding so that the graph is not touching the edges
       const paddingPercent = 0.9;
       scaleFactor = scaleFactor * paddingPercent;
       return scaleFactor
    }

    function centerGraph() {
        const bbox = (svgGroup.node() as SVGGElement).getBBox();
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        return {cx, cy};
    }

    function adjustVisulizeArea(duration : number = 0){
      const scaleFactor = fitGraphScale();
      const {cx, cy} = centerGraph();
      // make the total duration to be 1 second
      svg.transition().duration(duration/1.5).call(zoom.translateTo, cx, cy)
      .on("end", function() {
        svg.transition().duration(duration/1.5).call(zoom.scaleBy, scaleFactor)
      })
    } 

    // Append a svg group which holds all nodes and which is for the d3 zoom
    const svgGroup = svg.append("g")

    const fitButton = select(".fit-to-screen-button")
    .on("click", function() {
      adjustVisulizeArea(duration)
    })
    .on('mouseenter', function() {
      select(this).select('.tooltip')
            .style('visibility', 'visible')
            .style('opacity', 1);
    })
    .on('mouseleave', function() {
      select(this).select('.tooltip')
            .style('visibility', 'hidden')
            .style('opacity', 0);
    });
    
    const treelayout = d3flextree
      .flextree<QueueInfo>({})
      .nodeSize((d) => {
          return [300, 300];
        }
      )
      .spacing(() => 300);
    
    const zoom = d3zoom
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 5]) 
    .on("zoom", (event) => {
      svgGroup.attr("transform", event.transform)
    });
    svg.call(zoom);

    const root = d3hierarchy.hierarchy(rawData);
    update(root);

    function update(source: any){
      var treeData = treelayout(root)
      var nodes = treeData.descendants()
      var node = svgGroup
          .selectAll<SVGGElement, d3hierarchy.HierarchyNode<QueueInfo>>('g.card')
          .data(nodes, function(d : any) { 
            return d.id || (d.id = ++numberOfNode); 
          });

      var nodeEnter = node
          .enter().append('g')
          .attr('class', 'card')
          .attr("transform", function() {
              if (source.x0 && source.y0) {
                  return "translate(" + source.x0 + "," + source.y0 + ")";
              }
              else {
                  return "translate(" + source.x + "," + source.y + ")";
              }
          })

      nodeEnter.each(function(d) {
        const group = select(this);

        group.append("rect")
          .attr("width", 300) 
          .attr("height", 120) 
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 2) 
          .attr("rx", 10)
          .attr("ry", 10);
  
        group.append("rect")
          .attr("width", 300)
          .attr("height", 30)
          .attr("fill", "#d4eaf7");
  
        group.append("rect")
          .attr("y", 30)
          .attr("width", 300)
          .attr("height", 60)
          .attr("fill", "white");
  
        group.append("rect")
          .attr("y", 90)
          .attr("width", 300)
          .attr("height", 30)
          .attr("fill", "#e6f4ea")
          .attr("class", "cardBottom");
        
        group.append("image")
          .attr("href", "./assets/images/hierarchy.svg") 
          .attr("x", 5) 
          .attr("y", 5) 
          .attr("width", 20)
          .attr("height", 20);
  
        group.append("text")
          .attr("x", 30) 
          .attr("y", 22.5)
          .attr("font-size", "25px")
          .attr("fill", "black")
          .text(d.data.queueName);
        
        const plusCircle = group.append("circle")
          .attr("cx", 150)
          .attr("cy", 120) 
          .attr("r", 20)   
          .attr("fill", "white") 
          .attr("stroke", "black") 
          .attr("stroke-width", 1)
          .style("visibility", "hidden")
          .on('click', click);
        
        const plusText = group.append("text")
          .attr("x", 150) 
          .attr("y", 127) 
          .attr("text-anchor", "middle") 
          .attr("font-size", "20px") 
          .attr("fill", "black") 
          .text("+")
          .attr("pointer-events", "none") // Prevents the text from interfering with the click event
          .style("visibility", "hidden");
        
        group.on("mouseover", function() {
          plusCircle.style("visibility", "visible");
          plusText.style("visibility", "visible");
        });
      
        // Hide the circle and '+' text when the mouse leaves the node
        group.on("mouseout", function() {
          plusCircle.style("visibility", "hidden");
          plusText.style("visibility", "hidden");
        });

        // Add hover effect to the circle to change its color to grey
        plusCircle.on("mouseover", function() {
          select(this).attr("fill", "grey");
        });

        // Reset circle color when mouse leaves
        plusCircle.on("mouseout", function() {
          select(this).attr("fill", "white");
        });

      });
  
      const nodeUpdate = nodeEnter.merge(node)
      .attr("stroke", "black")
      
      nodeUpdate.transition()
        .duration(duration)
        .attr("transform", function(this: SVGGElement , event : any , i : any, arr : any) {
            const d : any = select(this).datum();
            return "translate(" + d.x + "," + d.y + ")";
        });
     
      nodeUpdate.select('.cardBottom')
      .style("fill", function(d : any) {
          return d._children ? "#9fc6aa" : "#e6f4ea";
      })
  
      // Remove any exiting nodes
      var nodeExit= node.exit().transition()
        .duration(duration)
        .attr("transform", function(this: SVGGElement , event : any , i : any, arr : any) {
            const d = select(this).datum();
            return "translate(" + source.x + "," + source.y + ")";
        })
        .remove();
    
      // Link sections
      const links = treeData.links();
      let link = svgGroup.selectAll<SVGPathElement, d3hierarchy.HierarchyPointLink<QueueInfo>>('path.link')
          .data(links, function(d : any) { return d.target.id; });
  
      const linkEnter = link.enter().insert('path', "g")
          .attr("class", "link")
          .attr('d', d => {
              if (source.x0 && source.y0) {
                  const o = {x: source.x0, y: source.y0};
                  return diagonal(o, o);
              }
              else {
                  const o = {x: source.x, y: source.y};
                  return diagonal(o, o);
              }
          })
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", "2px");
  
      const linkUpdate = linkEnter.merge(link);
      linkUpdate.transition()
          .duration(duration)
          .attr('d', d => diagonal(d.source, d.target));
  
      const linkExit = link.exit().transition()
          .duration(duration)
          .attr('d', d => {
              const o = {x: source.x, y: source.y};
              return diagonal(o, o);
          })
          .remove();
  
      nodes.forEach(function(d : any) {
          d.x0 = d.x;
          d.y0 = d.y;
      });
    
      function click(event : MouseEvent, d : any) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        
        update(d);
      }
    }
}

function diagonal(s : any , d : any) {
  const sourceX = s.x + 150;  // Middle of the rectangle's width
  const sourceY = s.y + 120;  // Bottom of the rectangle
  const targetX = d.x + 150;  // Middle of the rectangle's width
  const targetY = d.y;        // Top of the rectangle

  return `M ${sourceX} ${sourceY} 
          V ${(sourceY + targetY) / 2} 
          H ${targetX} 
          V ${targetY}`;
}