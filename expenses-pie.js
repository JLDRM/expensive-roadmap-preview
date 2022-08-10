import { pie, arc } from "https://cdn.skypack.dev/d3-shape@3";
import { select } from "https://cdn.skypack.dev/d3-selection@3";
import { EXPENSES } from './expenses.js';

const cleanExpenses = EXPENSES.reduce((accExpenses,currExpense)=> {
  const isAlreadyThisConcept = accExpenses.some(expense => expense.concept === currExpense.concept);
  
  if(isAlreadyThisConcept){
    const expenseToIncrement = accExpenses.find(expense => expense.concept === currExpense.concept);
    expenseToIncrement.amount += currExpense.amount;
  }else {
    accExpenses.push(currExpense)
  }
  
  return accExpenses
},[])

const dimensions = ({
  height: 500,
  width: 500,
})
const radius = dimensions.width * 0.3
const path = arc()
  .outerRadius(radius)
  .innerRadius(0)
const outerPath = arc()
  .outerRadius(radius * 0.95)
  .innerRadius(0)
const arcs = pie()
  .sort(sorterByGroup)
  .value(expense => expense.amount)
  (cleanExpenses);
console.log(arcs);

const svg = select('#expenses')
  .style('font-family', 'Pixel')
  .style('font-size', '9px')
  .append('svg')
  .attr('viewBox', `0,0,${dimensions.width},${dimensions.height}`)
  .attr('preserveAspectRatio', 'xMidYMid meet')
  .append("g")
  .attr("transform", "translate(" + dimensions.width / 2 + "," + dimensions.height / 2 + ")");

svg.selectAll(".arc")
  .data(arcs)
  .enter()
  .append("g")
  .attr("class", "arc")
  .append("path")
  .style('stroke', 'black')
  .style('fill', ({data}) => fillByGroup(data) )
  .attr("d", (d) => {
    return path(d)
  })

const labels = svg.selectAll(".label")
  .data(arcs)
  .enter()
  .append("g")
  .attr("class", "label");

labels
  .append('polyline')
  .attr("stroke", "black")
  .style("fill", "none")
  .attr("stroke-width", 1)
  .attr('points', (d) => {
    var posA = path.centroid(d)
    var posB = outerPath.centroid(d)
    var posC = outerPath.centroid(d);
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
    return [posA, posB, posC]
  })

labels.append("text")
  .attr('transform', (d) => {
    var pos = outerPath.centroid(d);
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
    return 'translate(' + pos + ')';
  })
  .style('text-anchor', (d) => {
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
    return (midangle < Math.PI ? 'start' : 'end')
  })
  .text((d) => `${d.data.concept} - ${d.data.amount}€`);

const size = 20
svg.selectAll("mydots")
  .data([{group: 'menjar'},{group: 'pernoctacio'}, {group:'transport'}])
  .enter()
  .append("rect")
    .attr("x", 100)
    .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", fillByGroup)
    .style("stroke", 'black')

svg.selectAll("mylabels")
  .data([{group: 'menjar'},{group: 'pernoctacio'}, {group:'transport'}])
  .enter()
  .append("text")
    .attr("x", 100 + size*1.2)
    .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", 'black')
    .text((d) => { 
      return d.group})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

function sorterByGroup(a, b) {
  if (a.group === b.group) return 1
  if (a.group !== b.group) return -1
}

function fillByGroup(d) {
  if (d.group === 'menjar') return 'lavenderblush'
  if (d.group === 'pernoctacio') return 'moccasin'
  if (d.group === 'transport') return 'pink'
}