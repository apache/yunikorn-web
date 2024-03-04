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

import { Component, OnInit } from '@angular/core';
import { select } from "d3-selection";
import * as d3hierarchy from "d3-hierarchy";
import * as d3flextree from "d3-flextree";
import * as d3zoom from "d3-zoom";
import { transition } from 'd3-transition';

@Component({
  selector: 'queues-v2-view',
  templateUrl: './queues-v2.component.html',
  styleUrls: ['./queues-v2.component.scss']
})

export class QueueV2Component implements OnInit {
  constructor() {}

  ngOnInit() {
    const svg = select('.visualize-area').append('svg')
               .attr('width', '100%')
               .attr('height', '100%')
              //  .style('background-color', '#f0f0f0'); 

    const svgWidth = 1150;
    const svgHeight = 600;

    const svgGroup = svg.append("g")
      .attr("transform", `translate(${svgWidth / 3}, ${svgHeight / 10})`); // Center the group

    interface TreeNode {
      name: string;
      children?: TreeNode[];
      _children?: TreeNode[]; // To store collapsed children
    }
    
    const rawData: TreeNode = {
        name: "root",
        children: [
            {
                name: "left",
                children: [
                  {
                      name: "left-left",
                      children: []
                  },
                  {
                      name: "left-right",
                      children: []
                  }
                ]
            },
            {
                name: "right",
                children: [
                ]
            }
        ]
    };
  
    const treelayout = d3flextree
      .flextree<TreeNode>({})
      .nodeSize((d) => {
          return [300, 300];
        }
      )
      .spacing(() => 400);
    
    const zoom = d3zoom
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 5]) 
    .on("zoom", (event) => {
    const initialTransform = d3zoom.zoomIdentity.translate(svgWidth / 3, svgHeight / 10);
    svgGroup.attr("transform", event.transform.toString() + initialTransform.toString());
    });
    svg.call(zoom);

    const duration = 750;
    let i = 0;
    const root = d3hierarchy.hierarchy(rawData);

    function diagonal(s :any, d : any) {
      const sourceX = s.x + 150; // Middle of the rectangle's width
      const sourceY = s.y + 120; // Bottom of the rectangle
      const targetX = d.x + 150; // Middle of the rectangle's width
      const targetY = d.y; // Top of the rectangle (assuming it starts from the top)
  
      return `M ${sourceX} ${sourceY}
              C ${(sourceX + targetX) / 2} ${sourceY},
                ${(sourceX + targetX) / 2} ${targetY},
                ${targetX} ${targetY}`;
    }

    update(root);

    function update(source: any){
      var treeData = treelayout(root)
      var nodes = treeData.descendants()
      var node = svgGroup
              .selectAll<SVGGElement, d3hierarchy.HierarchyNode<TreeNode>>('g.card')
              .data(nodes, (d : any) => d.id || (d.id = ++i));
      
      var nodeEnter = node
        .enter().append('g')
        .attr('class', 'card')
        .attr("transform", function(d) {
            return "translate(" + source.x0 + "," + source.y0 + ")";
        })
        .on('click', click);
  
      
      nodeEnter.each(function(d) {
        const group = select(this);
  
        // Adjusted outer frame size and position
        group.append("rect")
          .attr("width", 300) // Significantly smaller width
          .attr("height", 120) // Smaller height
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 2) // Thinner stroke
          .attr("rx", 10) // Adjusted corner radius
          .attr("ry", 10);
  
        // Adjusted background sections
        group.append("rect")
          .attr("width", 300)
          .attr("height", 30) // Smaller height for the section
          .attr("fill", "#d4eaf7");
  
        group.append("rect")
          .attr("y", 30)
          .attr("width", 300)
          .attr("height", 60) // Adjusted for proportional size
          .attr("fill", "white");
  
        group.append("rect")
          .attr("y", 90)
          .attr("width", 300)
          .attr("height", 30) // Adjusted section size
          .attr("fill", "#e6f4ea")
          .attr("class", "cardBottom"); // #8cc29b
  
        // group.append("image")
        // .attr("href", "hierarchy.svg") // Ensure the path to your SVG is correct
        // .attr("x", 5) // Positioning the icon beside the text, adjust as needed
        // .attr("y", 5) // Adjust the vertical position as needed
        // .attr("width", 20)
        // .attr("height", 20);
        
        // Example text, scaled down
        group.append("text")
          .attr("x", 30) // Adjusted position
          .attr("y", 20) // Adjusted position
          .attr("font-size", "14px") // Smaller font size
          .attr("fill", "black")
          .text(d.data.name);
      });
  
      
      const nodeUpdate: any = nodeEnter.merge(node as any)
      .attr("fill", "#fff")
      .attr("stroke", "black")
      .attr("stroke-width", "1px;")
      .style('font', '12px sans-serif');
      
  
  
      (nodeUpdate as any).transition()
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
      var nodeExit : any = (node as any).exit().transition()
        .duration(duration)
        .attr("transform", function(this: SVGGElement , event : any , i : any, arr : any) {
            const d = select(this).datum();
            return "translate(" + source.x + "," + source.y + ")";
        })
        .remove();
  
      nodeExit.select('circle')
            .attr('r', 1e-6);
  
      // On exit reduce the opacity of text labels
      nodeExit.select('text')
          .style('fill-opacity', 0)
      
  
      // Now handle the links between nodes
      const links = treeData.links(); // This creates the links based on the hierarchy
      let link = svgGroup.selectAll('path.link')
          .data(links, function(d : any) { return d.target.id; });
  
      // Enter any new links at the parent's previous position
      const linkEnter = link.enter().insert('path', "g")
          .attr("class", "link")
          .attr('d', d => {
              const o = {x: source.x0, y: source.y0};
              return diagonal(o, o);
          })
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", "2px");
  
      // UPDATE existing links
      const linkUpdate : any = linkEnter.merge(link as any);
      linkUpdate.transition()
          .duration(duration)
          .attr('d', (d : any)=> diagonal(d.source, d.target));
  
      // Remove any exiting links
      const linkExit : any = link.exit().transition()
          .duration(duration)
          .attr('d', (d : any) => {
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
}
