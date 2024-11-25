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

import { CdkTree, NestedTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatTree } from '@angular/material/tree';

export interface QueueNode {
  name: string;
  value: string;
  children?: QueueNode[];
}

@Component({
  selector: 'app-queue-menu-tree',
  templateUrl: './queue-menu-tree.component.html',
  styleUrls: ['./queue-menu-tree.component.scss'],
})
export class QueueMenuTreeComponent implements OnInit, OnChanges {
  @Input() dataSource: QueueNode[] = [];   
  @Input() selectedNode  = ''; 
  @Output() selectedNodeChange = new EventEmitter<string>();
  @ViewChild('tree') tree: MatTree<QueueNode> | undefined;
  
  childrenAccessor = (node: QueueNode) => node.children ?? [];

  hasChild = (_: number, node: QueueNode) => !!node.children && node.children.length > 0;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedNode'] && !changes['selectedNode'].firstChange) {
      this.expandSelectedNodeParents();
    }
  }

  ngOnInit() {}

  onSelectedNode (value: string){
    if(this.selectedNode === value) this.selectedNode = '';
    else this.selectedNode = value;
    this.selectedNodeChange.emit(this.selectedNode);
  }

  expandAll () {
    this.dataSource.forEach(node => this.tree?.expandDescendants(node))
  }

  collapseAll () {
    this.dataSource.forEach(node => this.tree?.collapseDescendants(node));
    this.expandSelectedNodeParents();
  }

  expandSelectedNodeParents() {
    const parentNodes = this.findAllParentNodes(0, [], this.dataSource);
    parentNodes.forEach(node => this.tree?.expand(node));
  }

  findAllParentNodes(index: number, parents: QueueNode[] = [], children: QueueNode[] = []) {
    let nodes = this.selectedNode.split(".");
    if(nodes.length-1 === index) return parents;
    
    children.forEach(node=> {
      if(node.name === nodes[index]) {
        parents.push(node);
        parents = this.findAllParentNodes(index+1, parents, node.children);
        return;
      }
    });
    return parents;
  }
}
