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
              
    const svgWidth = 1150;
    const svgHeight = 600;

    // Center the group
    const svgGroup = svg.append("g")
      .attr("transform", `translate(${svgWidth / 3}, ${svgHeight / 10})`); 

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
                    name: "left-middle-1",
                    children: []
                  }, 
                  {
                    name: "left-middle-2",
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
                  {
                    name: "right-right",
                    children: []
                }
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
      .spacing(() => 300);
    
    const zoom = d3zoom
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 5]) 
    .on("zoom", (event) => {
      const initialTransform = d3zoom.zoomIdentity.translate(svgWidth / 3, svgHeight / 10);
      svgGroup.attr("transform", event.transform.toString() + initialTransform.toString());
    });
    svg.call(zoom);

    let numberOfNode = 0;
    const duration = 750;
    const root = d3hierarchy.hierarchy(rawData);

    update(root);

    function update(source: any){
      var treeData = treelayout(root)
      var nodes = treeData.descendants()
      var node = svgGroup
              .selectAll<SVGGElement, d3hierarchy.HierarchyNode<TreeNode>>('g.card')
              .data(nodes, (d : any) => d.id || (d.id = ++numberOfNode));
      
      var nodeEnter = node
        .enter().append('g')
        .attr('class', 'card')
        .attr("transform", function(d) {
            return "translate(" + source.x0 + "," + source.y0 + ")";
        })
        .on('click', click);
  
      
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
  
        // group.append("image")
        // .attr("href", "hierarchy.svg") 
        // .attr("x", 5) 
        // .attr("y", 5)
        // .attr("width", 20)
        // .attr("height", 20);
        
        group.append("text")
          .attr("x", 30) 
          .attr("y", 20)
          .attr("font-size", "14px")
          .attr("fill", "black")
          .text(d.data.name);
      });
  
      const nodeUpdate = nodeEnter.merge(node)
      .attr("fill", "#fff")
      .attr("stroke", "black")
      .attr("stroke-width", "1px;")
      .style('font', '12px sans-serif');
      
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
      let link = svgGroup.selectAll('path.link')
          .data(links, function(d : any) { return d.target.id; });
  
      const linkEnter = link.enter().insert('path', "g")
          .attr("class", "link")
          .attr('d', d => {
              const o = {x: source.x0, y: source.y0};
              return diagonal(o, o);
          })
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", "2px");
  
      const linkUpdate = linkEnter.merge(link as any);
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
}
export interface TreeNode {
  name: string;
  children?: TreeNode[];
  _children?: TreeNode[];
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