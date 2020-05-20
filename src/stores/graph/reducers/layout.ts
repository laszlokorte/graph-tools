export default (graph) => {
    const positions = graph.attributes.nodes.position;
    const nodes = graph.nodes;
    const paths = graph.attributes.edges.path;
    const directed = graph.flags.directed;
    const multiGraph = graph.flags.multiGraph;
    const tension = 0.8;

    const nodeAngles = nodes.map((neighbours, idx) => {
        const ownPos = positions[idx]
        const outgoing = neighbours.map((n, edx) => {
            if(n === idx) {
                return null;
            }

            const p = paths[idx][edx]
            if(p && p.length) {
                return Math.atan2(p[1] - ownPos.y, p[0] - ownPos.x)
            } else {
                return Math.atan2(positions[n].y - ownPos.y, positions[n].x - ownPos.x)
            }

        }).filter(a => a !== null)

        const incoming = nodes.map((others, o) => {
            const edx = others.indexOf(idx)
            if (o === idx || edx < 0) {
               return null;
            }

            const p = paths[o][edx]
            if(p && p.length) {
                return Math.atan2(p[p.length-1] - ownPos.y, p[p.length-2] - ownPos.x)
            } else {
                return Math.atan2(positions[o].y - ownPos.y, positions[o].x - ownPos.x)
            }
        }).filter(a => a !== null)

        const cosSum = outgoing.reduce((acc, angle) => acc + Math.cos(angle), 0) +
            incoming.reduce((acc, angle) => acc + Math.cos(angle), 0)

        const sinSum = outgoing.reduce((acc, angle) => acc + Math.sin(angle), 0) +
            incoming.reduce((acc, angle) => acc + Math.sin(angle), 0)

        return Math.atan2(sinSum, cosSum)
    })

    const edgePaths = nodes.map((neighbors, nodeId) =>
        neighbors.map((neighbourId, edgeIdx, allEdges) => {
            const countDupl = multiGraph ? allEdges.slice(edgeIdx).filter(x => x===neighbourId).length - 1 : 0

            if(neighbourId == nodeId) {
                const nodeRadius = 20
                const bow = 50
                const gap = 5
                const center = positions[nodeId]
                const angle = nodeAngles[nodeId];
                const normX = Math.cos(angle + Math.PI);
                const normY = Math.sin(angle + Math.PI);
                const orientation = Math.round(((Math.atan2(normX, normY) + Math.PI) / Math.PI + 0.5) * 2) % 4

                const tangX = normY
                const tangY = -normX

                const startX = center.x + nodeRadius * normX - gap * tangX
                const startY = center.y + nodeRadius * normY - gap * tangY

                const endX = center.x + nodeRadius * normX + gap * tangX
                const endY = center.y + nodeRadius * normY + gap * tangY


                const c1x = center.x + nodeRadius * normX + bow * normX - bow * tangX + countDupl * 5 * (normX - 2*tangX)
                const c1y = center.y + nodeRadius * normY + bow * normY - bow * tangY + countDupl * 5 * (normY - 2*tangY)

                const c2x = center.x + nodeRadius * normX + bow * normX + bow * tangX + countDupl * 5 * (normX + 2*tangX)
                const c2y = center.y + nodeRadius * normY + bow * normY + bow * tangY + countDupl * 5 * (normY + 2*tangY)

                return {
                    string: 'M ' + startX + ' ' + startY + 'C '+ c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + endX + ' ' + endY,
                    curve: [startX, startY, c1x, c1y, c2x, c2y, endX, endY],
                    midpoints: [],
                    anchors: [],
                    median: {
                        x: positions[nodeId].x + normX * bow,
                        y: positions[nodeId].y + normY * bow,
                        normX: normX,
                        normY: normY,
                    },
                    text: {
                        x: positions[nodeId].x + normX * bow + countDupl * 5 * normX,
                        y: positions[nodeId].y + normY * bow + countDupl * 5 * normY,
                        normX: normX,
                        normY: normY,
                        orientation: orientation
                    },
                    tip: {
                        x: endX,
                        y: endY,
                        angle: Math.atan2(endY - c2y, endX - c2x),
                    }
                }
            }

            let controls = paths[nodeId][edgeIdx]
            let points = [...controls]

            const startPosition = positions[nodeId];
            const endPosition = positions[neighbourId];

            const xtra = ((countDupl + (directed ? 0 : 1)) >> (directed ? 0 : 1)) * 5 * (directed ? 1 : (1 - 2 * (countDupl%2)))

            if(controls.length == 0) {
                const deltaX = startPosition.x - endPosition.x;
                const deltaY = startPosition.y - endPosition.y;
                const distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
                const normX = deltaX / distance;
                const normY = deltaY / distance;
                points = [
                    (startPosition.x + endPosition.x) / 2 + (directed ? 20 * normY : 0) + normY * xtra,
                    (startPosition.y + endPosition.y) / 2 - (directed ? 20 * normX : 0) - normX * xtra,
                ]
            }

            const lastX = points[points.length-2]
            const lastY = points[points.length-1]
            const firstX = points[0]
            const firstY = points[1]

            const departX = firstX - startPosition.x
            const departY = firstY - startPosition.y
            const arivX = lastX - endPosition.x
            const arivY = lastY - endPosition.y

            const departLength = Math.sqrt(departX * departX + departY * departY)
            const arivLength = Math.sqrt(arivX * arivX + arivY * arivY)
            const departXNorm = departX / departLength
            const departYNorm = departY / departLength
            const arivXNorm = arivX / arivLength
            const arivYNorm = arivY / arivLength

            points.unshift(startPosition.y + departYNorm * 20)
            points.unshift(startPosition.x + departXNorm * 20)

            points.push(endPosition.x + arivXNorm * 20, endPosition.y + arivYNorm * 20)

            const curvePath = [];
            const stringPath = [];

            curvePath.push(points[0], points[1]);
            stringPath.push('M' + points[0] + ' ' + points[1]);

            const cs = []

            for (let i = 0; i < points.length - 3; i += 2)
            {
                let p0x = (i > 0) ? points[i - 2] : points[0];
                let p0y = (i > 0) ? points[i - 1] : points[1];
                let p1x = points[i];
                let p1y = points[i+1];
                let p2x = points[i + 2];
                let p2y = points[i + 3];
                let p3x = (i != points.length - 4) ? points[i + 4] : p2x;
                let p3y = (i != points.length - 4) ? points[i + 5] : p2y;

                let cp1x = p1x + (p2x - p0x) / 6 * tension;
                let cp1y = p1y + (p2y - p0y) / 6 * tension;

                let cp2x = p2x - (p3x - p1x) / 6 * tension;
                let cp2y = p2y - (p3y - p1y) / 6 * tension;

                let cx = 0.125 * p1x + 0.75 * 0.5 * cp1x + 1.5 * 0.25 * cp2x + 0.125 * p2x;
                let cy = 0.125 * p1y + 0.75 * 0.5 * cp1y + 1.5 * 0.25 * cp2y + 0.125 * p2y;

                cs.push(cx,cy)

                curvePath.push(cp1x, cp1y, cp2x, cp2y, p2x, p2y);
                stringPath.push("C"+ cp1x +' '+ cp1y +' '+ cp2x +' '+ cp2y +' '+ p2x +' '+ p2y);
            }

            let mx, my, medianAngle, mNormX, mNormY

            if(points.length%4 != 0) {
                mx = points[points.length / 2 - 1]
                my = points[points.length / 2]
                const p1x = cs[cs.length / 2 - 2]
                const p1y = cs[cs.length / 2 - 1]
                const p2x = cs[cs.length / 2]
                const p2y = cs[cs.length / 2+1]
                const d1x = p1x - mx
                const d1y = p1y - my
                const d2x = p2x - mx
                const d2y = p2y - my
                const l1 = Math.sqrt(d1x * d1x + d1y * d1y)
                const l2 = Math.sqrt(d2x * d2x + d2y * d2y)
                const dx = (d1x/l1 + d2x/l2) / 2
                const dy = (d1y/l1 + d2y/l2) / 2
                mNormX = -dx
                mNormY = -dy

                if(mNormX*mNormX + mNormY*mNormY < 0.001) {
                    mNormX = -d2y/l2
                    mNormY = d2x/l2
                }
            } else {
                mx = cs[cs.length / 2 - 1]
                my = cs[cs.length / 2]
                const p1x = points[points.length / 2 - 2]
                const p1y = points[points.length / 2 - 1]
                const p2x = points[points.length / 2]
                const p2y = points[points.length / 2+1]
                const d1x = p1x - mx
                const d1y = p1y - my
                const d2x = p2x - mx
                const d2y = p2y - my
                const l1 = Math.sqrt(d1x * d1x + d1y * d1y)
                const l2 = Math.sqrt(d2x * d2x + d2y * d2y)
                const dx = (d1x/l1 + d2x/l2) / 2
                const dy = (d1y/l1 + d2y/l2) / 2
                mNormX = -dx
                mNormY = -dy

                if(mNormX*mNormX + mNormY*mNormY < 0.001) {
                    mNormX = -d2y/l2
                    mNormY = d2x/l2
                }
            }

            const norm = Math.sqrt(mNormX*mNormX + mNormY*mNormY);
            mNormX /= norm
            mNormY /= norm
            const orientation = Math.round(((Math.atan2(mNormX, mNormY) + Math.PI) / Math.PI + 0.5) * 2) % 4

            const angle = Math.atan2(
                curvePath[curvePath.length-1] - cs[cs.length-1],
                curvePath[curvePath.length-2] - cs[cs.length-2]
            )

            return {
                string: stringPath.join(" "),
                curve: curvePath,
                midpoints: cs,
                anchors: points.slice(2, -2),
                median: {
                    x: mx,
                    y: my,
                    normX: mNormX,
                    normY: mNormY,
                },
                text: {
                    x: mx,
                    y: my,
                    normX: mNormX,
                    normY: mNormY,
                    orientation: orientation
                },
                tip: {
                    x: endPosition.x + arivXNorm * 20,
                    y: endPosition.y + arivYNorm * 20,
                    angle: angle,
                }
            }
        })
    )

    return {
        nodeAngles,
        edgePaths,
    }
}


export const freeEdgePath = (radius, loop, x0, y0, x1, y1, angle, directed, offset) => {
    if(loop) {
        const bow = 50
        const gap = 5
        const normX = Math.cos(angle + Math.PI);
        const normY = Math.sin(angle + Math.PI);

        const tangX = normY
        const tangY = -normX

        const startX = x0 + radius * normX - gap * tangX
        const startY = y0 + radius * normY - gap * tangY

        const endX = x0 + radius * normX + gap * tangX
        const endY = y0 + radius * normY + gap * tangY

        const cp1x = x0 + radius * normX + bow * normX - bow * tangX
        const cp1y = y0 + radius * normY + bow * normY - bow * tangY

        const cp2x = x0 + radius * normX + bow * normX + bow * tangX
        const cp2y = y0 + radius * normY + bow * normY + bow * tangY

        const tipAngle = Math.atan2(endY - cp2y, endX - cp2x);

        return {
            points: [startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY,],
            tip: {
                x: endX,
                y: endY,
                angle: tipAngle,
            }
        }
    }

    const dirX = x0 - x1
    const dirY = y0 - y1
    const length = Math.sqrt(dirX*dirX + dirY*dirY)
    const normX = dirX / length
    const normY = dirY / length
    const perpX = normY
    const perpY = -normX

    const cX = (x0 + x1) / 2 + (directed ? 20 * perpX : 0)
    const cY = (y0 + y1) / 2 + (directed ? 20 * perpY : 0)

    const departX = cX - x0
    const departY = cY - y0
    const arivX = cX - x1
    const arivY = cY - y1

    const departLength = Math.sqrt(departX * departX + departY * departY)
    const arivLength = Math.sqrt(arivX * arivX + arivY * arivY)
    const departXNorm = departX / departLength
    const departYNorm = departY / departLength
    const arivXNorm = arivX / arivLength
    const arivYNorm = arivY / arivLength

    const startX = x0 + departXNorm * radius
    const startY = y0 + departYNorm * radius
    const endX = x1 + arivXNorm * radius
    const endY = y1 + arivYNorm * radius

    const t = 0.8;

    let cp1x = startX + (cX - startX) / 6 * t;
    let cp1y = startY + (cY - startY) / 6 * t;

    let cp2x = cX - (endX - startX) / 6 * t;
    let cp2y = cY - (endY - startY) / 6 * t;

    let cp3x = cX + (endX - startX) / 6 * t;
    let cp3y = cY + (endY - startY) / 6 * t;

    let cp4x = endX - (endX - cX) / 6 * t;
    let cp4y = endY - (endY - cY) / 6 * t;

    const realX = (offset ? endX : x1)
    const realY = (offset ? endY : y1)
    const tipAngle = Math.atan2(endY - cY, endX - cX);

    return {
        points: [startX, startY, cp1x, cp1y, cp2x, cp2y, cX, cY, cp3x, cp3y,
            cp4x, cp4y, realX, realY,],
        tip: {
            x: realX,
            y: realY,
            angle: tipAngle,
        }
    }
}
