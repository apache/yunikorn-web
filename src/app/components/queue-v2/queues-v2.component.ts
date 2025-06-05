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

import { select, Selection } from "d3-selection";
import * as d3hierarchy from "d3-hierarchy";
import * as d3flextree from "d3-flextree";
import * as d3zoom from "d3-zoom";
import { transition } from 'd3-transition'; // we need to import transition even if we don't use it explicitly
import { CommonUtil } from '@app/utils/common.util';

export interface TreeNode {
  name: string;
  children?: TreeNode[];
  _children?: TreeNode[];
}

@Component({
    selector: 'queues-v2-view',
    templateUrl: './queues-v2.component.html',
    styleUrls: ['./queues-v2.component.scss'],
    standalone: false
})

export class QueueV2Component implements OnInit {
  rootQueue: QueueInfo | null = null;
  seletedInfo: QueueInfo | null = null;
  resourceValueFormatter = CommonUtil.queueResourceColumnFormatter;
  memoryValueFormatter = CommonUtil.absoluteUsedMemoryColumnFormatter;
  cpuValueFormatter = CommonUtil.absoluteUsedCPUColumnFormatter;

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
          queueVisualization(this.rootQueue as QueueInfo, this)
          setTimeout(() => this.adjustToScreen(),1000) // since the ngAfterViewInit hook is not working, we used setTimeout instead
        }
      });
  }

  adjustToScreen() {
    const fitButton = document.getElementById('fitButton');
    fitButton?.click(); 
  }

  showQueueStats(status: string | undefined) {
    console.log('sssss', status)
    if(status !== 'Active'){
      return '[Inactive]';
    } else{
      return null; 
    }
  }
}

function queueVisualization(rawData : QueueInfo , componentInstance: QueueV2Component){
  let numberOfNode = 0;
  let isShowingDetails = false;
  let selectedNode: any = null;

  // Set this variable to 'horizontal' or 'vertical' to change orientation
  // Define a type for the orientation
  type Orientation = 'horizontal' | 'vertical';

  // Declare orientation as the defined type
  let orientation: Orientation = 'horizontal';

  const duration = 500;

  const svg = select('.visualize-area').append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  function fitGraphScale() {
    const baseSvgElem = svg.node() as SVGGElement;
    const bounds = baseSvgElem.getBBox();
    const parent = baseSvgElem.parentElement as HTMLElement;
    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight;
    
    const xfactor: number = fullWidth / bounds.width;
    const yfactor: number = fullHeight / bounds.height;
    let scaleFactor: number = Math.min(xfactor, yfactor);

    const paddingPercent = 0.9;
    scaleFactor = scaleFactor * paddingPercent;
    return scaleFactor;
  }

  function centerGraph() {
    const bbox = (svgGroup.node() as SVGGElement).getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    return {cx, cy};
  }

  function adjustVisulizeArea(duration: number = 0) {
    const scaleFactor = fitGraphScale();
    const {cx, cy} = centerGraph();
    svg.transition().duration(duration/1.5).call(zoom.translateTo, cx, cy)
    .on("end", function() {
      svg.transition().duration(duration/1.5).call(zoom.scaleBy, scaleFactor)
    });
  } 

  function changeOrientation() {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    const root = d3hierarchy.hierarchy(rawData);
    update(root);

     // Update the position of existing plus circles, plus text, and queue names
     svgGroup.selectAll('g.card')
      .each(function(d: any) {
        const group = select(this);
        group.select('circle')
          .attr("cx", orientation === 'horizontal' ? 300 : 150)
          .attr("cy", orientation === 'horizontal' ? 60 : 120);
        group.select('.plus-text')
          .attr("x", orientation === 'horizontal' ? 300 : 150)
          .attr("y", orientation === 'horizontal' ? 67 : 127);
      });
  }

  const svgGroup = svg.append("g");

  const fitButton = select(".fit-to-screen-button")
    .on("click", function() {
      adjustVisulizeArea(duration);
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

  const ortButton = select(".ort-button")
    .on("click", function() {
      changeOrientation();
      setTimeout(
        () => {
          const fitButton = document.getElementById('fitButton');
          if (fitButton) {
            fitButton.click();
          }
        }, duration);
    });

  
  const treelayout = d3flextree
    .flextree<QueueInfo>({})
    .nodeSize((d) => {
      return orientation === 'horizontal' ? [300, 600] : [300, 300];
    })
    .spacing(() => orientation === 'horizontal' ? 100 : 300);
  
  const zoom = d3zoom
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 5]) 
    .on("zoom", (event) => {
      svgGroup.attr("transform", event.transform);
    });
  svg.call(zoom);

  const root = d3hierarchy.hierarchy(rawData);
  update(root);

  function update(source: any) {
    var treeData = treelayout(root);
    var nodes = treeData.descendants();
    var node = svgGroup
      .selectAll<SVGGElement, d3hierarchy.HierarchyNode<QueueInfo>>('g.card')
      .data(nodes, function(d: any) { 
        return d.id || (d.id = ++numberOfNode); 
      });

    var nodeEnter = node
      .enter().append('g')
      .attr('class', 'card')
      .attr("transform", function() {
        if (source.y0 !== undefined && source.x0 !== undefined) {
          return orientation === 'horizontal'
            ? `translate(${source.y0},${source.x0})`
            : `translate(${source.x0},${source.y0})`;
        } else {
          return orientation === 'horizontal'
            ? `translate(${source.y},${source.x})`
            : `translate(${source.x},${source.y})`;
        }
      });

    nodeEnter.each(function(d) {
      const group = select(this);
      const queueName = d.data.queueName?.split(".").at(-1) ?? d.data.queueName;

      group.append("rect")
        .attr("width", 300) 
        .attr("height", 120) 
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 2) 
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("class", "cardMain");

      group.append("rect")
        .attr("width", 300)
        .attr("height", 30)
        .attr("fill", "#d4eaf7")
        .attr("class", "cardTop");

      group.append("rect")
        .attr("y", 30)
        .attr("width", 300)
        .attr("height", 60)
        .attr("fill", "white")
        .attr("class", "cardMiddle");

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
        .text(queueName)
        .call(ellipsis, 270)
        .call(tooltip, group, queueName);
      
        const plusCircle = group.append("circle")
        .attr("cx", () => orientation === 'horizontal' ? 300 : 150) // Right side if horizontal, center if vertical
        .attr("cy", () => orientation === 'horizontal' ? 60 : 120)  // Center if horizontal, bottom if vertical
        .attr("r", 20)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("visibility", "hidden")
        .on('click', function(event) {
          event.stopPropagation();
          click(event, d);
        });
      
        const plusText = group.append("text")
        .classed("plus-text", true)
        .attr("x", () => orientation === 'horizontal' ? 300 : 150) 
        .attr("y", () => orientation === 'horizontal' ? 67 : 127)  
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("fill", "black")
        .text("+")
        .attr("pointer-events", "none")
        .style("visibility", "hidden");
      
      if (d.children) {
        group.on("mouseover", function() {
          plusCircle.style("visibility", "visible");
          plusText.style("visibility", "visible");
        });
      }
      

      group.on("click", function() {
        if(selectedNode == this || selectedNode == null){
          isShowingDetails = !isShowingDetails;
        } else {
          select(selectedNode).select('.cardMain').attr("stroke", "white")
          .attr("stroke-width", 2);

          select(selectedNode).select('.cardTop').attr("fill", "#d4eaf7");
        }

        selectedNode = this;
        componentInstance.seletedInfo = d.data;

        if(isShowingDetails){
          console.log("showing details", componentInstance.seletedInfo);
          select(this).select('.cardMain').attr("stroke-width", 8)
          .attr("stroke", "#50505c");

          select(this).select('.cardTop').attr("fill", "#95d5f9");

          select(".additional-info-element").style("display", "block");
        } else {
          select(this).select('.cardMain').attr("stroke-width", 2)
          .attr("stroke", "white");

          select(this).select('.cardTop').attr("fill", "#d4eaf7");

          select(".additional-info-element").style("display", "none");
        }

        adjustVisulizeArea(duration);
      });
    
      group.on("mouseout", function() {
        plusCircle.style("visibility", "hidden");
        plusText.style("visibility", "hidden");
      });

      plusCircle.on("mouseover", function() {
        select(this).attr("fill", "grey");
      });

      plusCircle.on("mouseout", function() {
        select(this).attr("fill", "white");
      });
    });

    const nodeUpdate = nodeEnter.merge(node)
    .attr("stroke", "black");
    
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", function(this: SVGGElement, event: any, i: any, arr: any) {
        const d: any = select(this).datum();
        return orientation === 'horizontal'
          ? `translate(${d.y},${d.x})`
          : `translate(${d.x},${d.y})`;
      });
   
    nodeUpdate.select('.cardBottom')
    .style("fill", function(d: any) {
      return d._children ? "#9fc6aa" : "#e6f4ea";
    });
    
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(this: SVGGElement, event: any, i: any, arr: any) {
        const d = select(this).datum();
        return orientation === 'horizontal'
          ? `translate(${source.y},${source.x})`
          : `translate(${source.x},${source.y})`;
      })
      .remove();
  
    const links = treeData.links();
    let link = svgGroup.selectAll<SVGPathElement, d3hierarchy.HierarchyPointLink<QueueInfo>>('path.link')
      .data(links, function(d: any) { return d.target.id; });

    const linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', d => {
        const o = orientation === 'horizontal'
          ? {y: source.y0 || source.y, x: source.x0 || source.x}
          : {x: source.x0 || source.x, y: source.y0 || source.y};
        return diagonal(o, o, orientation);
      })
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "2px");

    const linkUpdate = linkEnter.merge(link);
    linkUpdate.transition()
      .duration(duration)
      .attr('d', d => diagonal(d.source, d.target, orientation));

    const linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', d => {
        const o = orientation === 'horizontal'
          ? {y: source.y, x: source.x}
          : {x: source.x, y: source.y};
        return diagonal(o, o, orientation);
      })
      .remove();

    nodes.forEach(function(d: any) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  
    function click(event: MouseEvent, d: any) {
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

function diagonal(s: any, d: any, orientation: string) {
  if (orientation == 'horizontal') {
    const sourceY = s.y + 300;  // Right side of the rectangle
    const sourceX = s.x + 60;   // Middle of the rectangle's height
    const targetY = d.y;        // Left side of the target rectangle
    const targetX = d.x + 60;   // Middle of the target rectangle's height

    return `M ${sourceY} ${sourceX} 
    H ${(sourceY + targetY) / 2} 
    V ${targetX} 
    H ${targetY}`;
  } else {
    const sourceX = s.x + 150;  // Middle of the rectangle's width
    const sourceY = s.y + 120;  // Bottom of the rectangle
    const targetX = d.x + 150;  // Middle of the rectangle's width
    const targetY = d.y;        // Top of the rectangle

    return `M ${sourceX} ${sourceY} 
        V ${(sourceY + targetY) / 2} 
        H ${targetX} 
        V ${targetY}`;
    }
}

function ellipsis(
  selection: Selection<SVGTextElement, unknown, null, undefined>, 
  maxWidth: number
) {
  const text = selection.text();
  selection.text(text);
  const textNode = selection.node();
  
  let count = 1;
  while (textNode && maxWidth < textNode.getBBox().width) {
    selection.text(`${text.slice(0, text.length - count)}...`);
    count++;
  }
}

function tooltip(
  selection: Selection<SVGTextElement, unknown, null, undefined>, 
  container: Selection<SVGGElement, unknown, null, undefined>,
  text: string,
): Selection<SVGGElement, unknown, null, undefined> | null {
  // if current text same as tooltip text, unnecessary render tooltip
  if(selection.text() === text) return null;
  
  const textNode = selection.node();
  const bbox = textNode?.getBBox();
  const textWidth = bbox?.width || 100;
  const textHeight = bbox?.height || 30;

  const x = bbox?.x || 0;
  const y = bbox?.y || 0;
  const padding = 10;
  const radius = 8;

  const tooltipGroup = container
    .append("g")
    .style("visibility", "hidden");

  const tooltipBg = tooltipGroup.append("rect")
    .attr("y", y - textHeight - padding) 
    .attr("width", textWidth + padding)
    .attr("height", textHeight + padding / 2)
    .attr("fill", "#00000099")
    .attr("rx", radius)
    .attr("ry", radius)
    .attr("stroke", "none");

  const tooltipText = tooltipGroup.append("text")
    .attr("y", y - textHeight / 2) 
    .attr("font-size", "25px")
    .attr("stroke", "white")
    .attr("fill", "white")
    .text(text);
    
  const tooltipTextNode = tooltipText.node();
  const tooltipTextWidth = tooltipTextNode?.getBBox().width || 100;

  tooltipText.attr("x", x + (textWidth - tooltipTextWidth) / 2);
  tooltipBg
    .attr("x", x + (textWidth - tooltipTextWidth - padding) / 2)
    .attr("width", tooltipTextWidth + padding);

  selection.on("mouseover", function() {
    tooltipGroup.style("visibility", "visible");
  });

  selection.on("mouseout", function() {
    tooltipGroup.style("visibility", "hidden");
  });

  tooltipGroup.raise();
  return tooltipGroup;
}