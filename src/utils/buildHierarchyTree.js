function calculateMetrics(node) {
  if (!node.children || node.children.length === 0) {
    node.icCost = node.salary;
    node.managementCost = 0;
    node.totalCost = node.salary;
    node.totalDescendants = 0;
    node.managementCostRatio = 0; // No managers below
    return {
      icCost: node.salary,
      managementCost: 0,
      totalCost: node.salary,
      totalDescendants: 0,
    };
  }

  let icCost = 0;
  let managementCost = 0;
  let totalDescendants = 0;

  for (const child of node.children) {
    const metrics = calculateMetrics(child);
    icCost += metrics.icCost;
    managementCost += metrics.managementCost;
    totalDescendants += metrics.totalDescendants + 1;
  }

  managementCost += node.salary;
  const totalCost = icCost + managementCost;
  const managementCostRatio = managementCost > 0 ? icCost / managementCost : 0;

  node.icCost = icCost;
  node.managementCost = managementCost;
  node.totalCost = totalCost;
  node.totalDescendants = totalDescendants;
  node.managementCostRatio = parseFloat(managementCostRatio.toFixed(2)); // rounded

  return { icCost, managementCost, totalCost, totalDescendants };
}


export default function buildHierarchyTree(flatData) {
  const employeeMap = {};
  const roots = [];

  for (const emp of flatData) {
    employeeMap[emp['Employee Id']] = {
      id: emp['Employee Id'],
      name: emp['Name'],
      title: emp['Job Title'],
      email: emp['Email'],
      managerId: emp['Manager'],
      status: emp['Status'],
      department: emp['Department'],
      location: emp['Location'],
      salary: parseFloat(emp['Salary']) || 0,
      bonus: parseFloat(emp['Bonus']) || 0,
      performance: emp['Performance'],
      project: emp['Project'],
      entity: emp['Entity'],
      level: parseInt(emp['level']) || 1,
      children: [],
    };
  }

  for (const emp of Object.values(employeeMap)) {
    if (emp.managerId && employeeMap[emp.managerId]) {
      employeeMap[emp.managerId].children.push(emp);
    } else {
      roots.push(emp); 
    }
  }

  for (const root of roots) {
    calculateMetrics(root);
  }

  return roots[0]; 
}