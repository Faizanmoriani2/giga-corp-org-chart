<script setup>
import { ref, onMounted } from 'vue'
import Papa from 'papaparse'
import OrgChart from './components/OrgChart.vue'
import buildHierarchyTree from './utils/buildHierarchyTree'

const treeData = ref(null)

const loadCSV = async () => {
  try {
    const response = await fetch('/GigaCorp.csv')
    const csvText = await response.text()

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = result.data.map(d => ({
          ...d,
          Salary: parseFloat(d.Salary),
          Bonus: parseFloat(d.Bonus),
        }))
        treeData.value = buildHierarchyTree(parsed)
      },
      error: (error) => {
        console.error('Error parsing CSV:', error)
      }
    })
  } catch (error) {
    console.error('Error loading CSV:', error)
  }
}

onMounted(() => {
  loadCSV()
})
</script>

<template>
  <div class="w-full h-screen flex flex-col">
    <div class="p-4 bg-white border-b">
      <h1 class="text-xl font-bold text-gray-800">Organizational Hierarchy</h1>
    </div>
    <div class="flex-1 relative">
      <OrgChart v-if="treeData" :data="treeData" />
      <div v-else class="flex justify-center items-center h-full text-lg text-gray-500">
        Loading hierarchy...
      </div>
    </div>
  </div>
</template>


