import * as d3 from "d3"
import { layerChannelCounts, layer } from './class-sidebar'

console.log(layerChannelCounts)
let rightInner = d3.select('#right-inner')

let rightInnerOptions = d3.select('#right-inner-options')

let rightInnerDagWrapper = d3.select('#right-inner-dag-wrapper')

// let test = rightInnerDagWrapper
//     .append('div')
//     // .classed('dataset-examples', true)
// test
//     .append('style')
//     .text('.sprite {background-image: url(../data/feature-vis/mixed4b-00310--mixed4b-00319.jpg)}')

// test
//     .append('div')
//         .attr('id', 'test-div')
//         .classed('sprite', true)
//         // .classed('channel-diversity-0', true)
//         .classed('index-0', true)
//         // .on('mouseover', () => {
//         //     // d3.select('#test-div')
//         //     // .transition()
//         //     // .duration(1000)
//         //     // .style('background-position-x', '-441px')
//         //     // .transition()
//         //     // .duration(1000)
//         //     // .style('background-position-x', '-588px')
//         // })
//         // .on('mouseout', () => {
//         // })
//     // .append('span')
//         // .attr('id', 'test-span')



const dagMargin = ({ top: 40, right: 40, bottom: 40, left: 40 })
const dagWidth = 700 - dagMargin.left - dagMargin.right
const dagHeight = 700 - dagMargin.top - dagMargin.bottom // 790 based on laptop screen height
let k = 1; // dag zoom scale

let zoom = d3.zoom()
    .scaleExtent([.1, 10])
    .extent([[0, 0], [dagWidth, dagHeight]])
    .on("zoom", zoomed);

function zoomed() {
    d3.select('#dagG').attr("transform", d3.event.transform);
    // console.log(d3.event.transform)
}

let dagSVG = rightInnerDagWrapper
    .append('svg')
    .attr('viewBox', '0 0 ' + (dagWidth + dagMargin.left + dagMargin.right) + ' ' + (dagHeight + dagMargin.top + dagMargin.bottom))
    .attr('width', '100%')
    .style('border', '1px solid #eeeeee') // for debugging
    .attr('id', 'dag')
    // .call(zoom)

dagSVG.append('filter')
    .attr('id', 'grayscale')
    .append('feColorMatrix')
    .attr('type', 'matrix')
    .attr('values','0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0')  

let zoomRect = dagSVG.append("rect")
    .attr("width", dagWidth)
    .attr("height", dagHeight)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('transform', 'translate(' + dagMargin.left + ',' + dagMargin.top + ')')
    .call(zoom);

let dagG = dagSVG
    .append("g")
    .attr("transform", "translate(" + dagMargin.left + "," + dagMargin.top + ")")
    .attr('id', 'dagG')

let dagDefs = dagSVG.append('defs')

const fvWidth = 100
const fvHeight = fvWidth

const deWidth = 49
const deHeight = deWidth

const layerVerticalSpace = 150

const layerIndex = {
    'mixed3a': 8,
    'mixed3b': 7,
    'mixed4a': 6,
    'mixed4b': 5,
    'mixed4c': 4,
    'mixed4d': 3,
    'mixed4e': 2,
    'mixed5a': 1,
    'mixed5b': 0
}

dagDefs.append('clipPath')
    .attr('id', 'fv-clip-path')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', fvWidth)
    .attr('height', fvHeight)
    .attr('rx', 10)
    .attr('ry', 10)

dagDefs.append('clipPath')
    .attr('id', 'de-clip-path')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', deWidth)
    .attr('height', deHeight)
    .attr('rx', 4)
    .attr('ry', 4)
    
d3.json('./data/test-dag.json').then(function (dag) {
    console.log(dag);

    function drawOrigin(){
        dagG.append('circle')
            .attr('r', 10)
            .attr('cx', 0)
            .attr('cy', 0)

    }
    drawOrigin()


    function drawExamplesForLayer(layer) {
        for (let i = 0; i < 10; i++) {
            if (i < 5) {
                drawDatasetExamples(layer, 376, i, 0, 0)
            } else if (i >= 5) {
                drawDatasetExamples(layer, 376, i, 0, fvWidth/2 + 1)
            }
        }
    }
    // drawExamplesForLayer(layer)


    function drawDatasetExamples(layer, channel, index, x, y) {
        dagG.append('image')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', deWidth)
            .attr('height', deHeight)
            .attr('xlink:href', '../data/feature-vis/' + layer + '-' + channel + '-' + 'dataset-p-' + index + '.png')
            .classed('fv-de', true)
            .attr('clip-path', 'url(#de-clip-path)')
            .attr("transform", "translate(" + x + ", " + y + ")")
            .attr('id', layer + '-' + channel + '-' + 'dataset-p-' + index)
            .classed(layer + '-' + channel + '-' + 'dataset-p', true)
    }

    function drawChannels(layer) {
        
        dagG.selectAll('.fv-ch-' + layer)
            .data(dag[layer])
            .enter()
            .append('image')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', fvWidth)
            .attr('height', fvHeight)
            .attr('xlink:href', d => '../data/feature-vis/channel/' + layer + '-' + d.channel + '-channel.png')
            .classed('fv-channel', true)
            .attr('clip-path', 'url(#fv-clip-path)')
            .attr("transform", (d, i) => "translate(" + ((100 + 50) * i) + "," + layerIndex[layer] * layerVerticalSpace  + " )")
            .attr('id', d => layer + '-' + d.channel + '-channel')
            .on('mouseover', () => {

                // hard coded below! expand to the right
                d3.selectAll('.' + layer + '-376-dataset-p')
                    .transition()
                    .duration(750)
                    .attr("transform", (d, i) => {
                        if (i < 5) {
                            console.log(layer,i)
                            return "translate(" + (100 + fvWidth + i * deWidth + (i + 1) * 2) + ", " + 0 + ")"
                        } else if (i >= 5) {
                            return "translate(" + (100 + fvWidth + (i - 5) * deWidth + (i - 5 + 1) * 2) + ", " + (fvWidth/2 + 1) + ")"
                        }
                    })

                // let t = setInterval(() => {

                d3.select('#mixed4d-101-channel').attr('xlink:href', '../data/feature-vis/mixed4d-376-diversity-0.png')
                .attr('filter', 'url(#grayscale)')
                // // d3.select('#mixed4d-376-channel').attr('xlink:href', '../data/feature-vis/mixed4d-376-diversity-1.png')
                // // d3.select('#mixed4d-376-channel').attr('xlink:href', '../data/feature-vis/mixed4d-376-diversity-2.png')
                // // d3.select('#mixed4d-376-channel').attr('xlink:href', '../data/feature-vis/mixed4d-376-diversity-3.png')

                // }, 1000);

            })
            .on('mouseout', () => {
                d3.selectAll('.' + layer + '-376-dataset-p')
                    .transition()
                    .duration(750)
                    .attr("transform", (d, i) => {
                        if (i < 5) {
                            return "translate(" + 125 + ", " + 100 + ")"
                        } else if (i >= 5) {
                            return "translate(" + 125 + ", " + (150 + 1) + ")"
                        }
                    })
            })
    }
    
    ['mixed4d', 'mixed4c'].forEach(l => {
        drawChannels(l) 
    });


})

