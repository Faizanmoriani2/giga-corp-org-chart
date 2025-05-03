<script setup>
  import { ref, onMounted, watch } from 'vue'
  import * as d3 from 'd3'
  
  const props = defineProps({
    data: Object,
  })
  
  const svgRef = ref(null)
  const gRef = ref(null)
  const containerRef = ref(null)
  const expandedNodes = ref(new Set())
  
  const toggleNode = (node) => {
    if (expandedNodes.value.has(node.id)) {
      expandedNodes.value.delete(node.id)
    } else {
      expandedNodes.value.add(node.id)
    }
    renderChart()
  }
  
  onMounted(() => {
    if (props.data) renderChart()
  })
  
  watch(() => props.data, () => {
    renderChart()
  })
  
  function renderChart() {
    const svg = d3.select(svgRef.value)
    const g = d3.select(gRef.value)
    g.selectAll('*').remove()
  
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
  
    const treeLayout = d3.tree()
      .nodeSize([280, 400])
      .separation((a, b) => 1.6)
  
    const root = d3.hierarchy(props.data)
    root.x0 = width / 2
    root.y0 = 120
  
    root.descendants().forEach(node => {
      if (expandedNodes.value.has(node.data.id)) {
        if (node.children) node._children = null
      } else {
        if (node.children) {
          node._children = node.children
          node.children = null
        }
      }
    })
  
    treeLayout(root)
  

    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
  
    svg.call(zoom)
  
    g.selectAll('path.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.5)
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      )
  
    const node = g.selectAll('g.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .attr('class', 'node')
  
    node.append('rect')
      .attr('x', -180)
      .attr('y', -100)
      .attr('width', 430)
      .attr('height', 300)
      .attr('rx', 8)
      .attr('fill', '#ffffff') 
      .attr('stroke', '#1e40af')  
      .attr('stroke-width', 2)  
      .attr('class', 'shadow-sm hover:shadow-md transition-shadow')
  
  
      const content = node.append('foreignObject')
      .attr('x', -170)
      .attr('y', -90)
      .attr('width', 400)
      .attr('height', 250)
      .append('xhtml:div')
      .attr('class', 'p-3 h-full')
  
      content.append('xhtml:div')
  .attr('class', 'h-full flex flex-col')
  .html(d => `
    <div class="flex justify-between items-start mb-2">
      <h3 class="text-lg font-bold text-gray-900 truncate">${d.data.name}</h3>
      <span class="text-sm font-medium text-gray-500 ml-2">${d.data.title}</span>
    </div>

    <div class="grid grid-cols-2 gap-x-4 gap-y-2 flex-grow">
      <!-- Level -->
      <div class="flex items-baseline">
        <span class="text-xs font-medium text-gray-500 mr-1">Level:</span>
        <span class="text-sm text-gray-700">${d.data.level || '-'}</span>
      </div>

      <!-- Salary -->
      <div class="flex items-baseline">
        <span class="text-xs font-medium text-gray-500 mr-1">Salary:</span>
        <span class="text-sm font-semibold text-blue-600">$${d.data.salary.toLocaleString()}</span>
      </div>

      <!-- Department -->
      <div class="flex items-baseline">
        <span class="text-xs font-medium text-gray-500 mr-1">Department:</span>
        <span class="text-sm text-gray-700">${d.data.department || '-'}</span>
      </div>

      <!-- Location -->
      <div class="flex items-baseline">
        <span class="text-xs font-medium text-gray-500 mr-1">Location:</span>
        <span class="text-sm text-gray-700">${d.data.location || '-'}</span>
      </div>

      <!-- Descendants -->
      <div class="flex items-baseline">
        <span class="text-xs font-medium text-gray-500 mr-1">Descendants:</span>
        <span class="text-sm text-gray-700">${d.data.totalDescendants}</span>
      </div>

      <!-- IC Cost -->
      <div class="flex items-baseline">
        <span class="text-xs font-medium text-gray-500 mr-1">IC Cost:</span>
        <span class="text-sm text-gray-700">$${d.data.icCost?.toLocaleString() || '0'}</span>
      </div>

      <!-- Management Cost -->
      <div class="flex items-baseline">
        <span class="text-xs font-medium text-gray-500 mr-1">Mgmt Cost:</span>
        <span class="text-sm text-gray-700">$${d.data.managementCost?.toLocaleString() || '0'}</span>
      </div>

      <!-- Total Cost -->
      <div class="flex items-baseline">
        <span class="text-xs font-medium text-gray-500 mr-1">Total Cost:</span>
        <span class="text-sm font-semibold text-gray-900">$${d.data.totalCost?.toLocaleString() || '0'}</span>
      </div>

      <!-- Management Ratio -->
      <div class="flex items-baseline col-span-2">
        <span class="text-xs font-medium text-gray-500 mr-1">Mgmt Ratio:</span>
        <span class="text-sm text-gray-700">${d.data.managementCostRatio || 0}</span>
      </div>
    </div>
  `);
    node.filter(d => d._children || d.children)
      .append('circle')
      .attr('r', 16)
      .attr('cy', 180)
      .attr('cx', 30)
      .attr('fill', 'white')
      .attr('stroke', '#1e40af') 
      .attr('stroke-width', 2)
      .attr('class', 'cursor-pointer hover:stroke-blue-600 transition-colors')
      .on('click', (event, d) => toggleNode(d.data))
  
    node.filter(d => d._children || d.children)
      .append('text')
      .attr('dy', 183)
      .attr('dx', 30)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs font-medium cursor-pointer text-blue-600 hover:text-blue-800')  // Blue text
      .text(d => d.children ? '−' : '+')
      .on('click', (event, d) => toggleNode(d.data))
    const bounds = g.node().getBBox()
    const dx = bounds.width
    const dy = bounds.height
    const initialTransform = d3.zoomIdentity
      .translate(width / 2 - bounds.x - bounds.width / 2, 120)
      .scale(Math.min(1, 0.9 / Math.max(dx / width, dy / height)))
    
    svg.call(zoom.transform, initialTransform)
  }
  </script>
  <template>
    <div ref="containerRef" class="w-full h-screen bg-gray-50 overflow-auto">
      <svg ref="svgRef" class="w-full h-full">
        <g ref="gRef" />
      </svg>
    </div>
  </template>
  
  <style>
  .link {
    fill: none;
    stroke: #93c5fd; 
    stroke-width: 1.5px;
    stroke-opacity: 0.7;
  }
  .node text {
    font-family: 'Inter', sans-serif;
  }
  </style>