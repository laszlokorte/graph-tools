# Graphs

JS GUI for exploring graph algorithms

![Screenshot om the UI][screenshot]

## Status

I just started this project. You can already construct a simple graph not not much else can be done yet.

## Features

You can construct a graph and run following algorithms visualizing the computation steps:

* Bellmann-Ford (shortest path)
* Bi-Connected-Components
* Breadth-First-Search
* Delaunay Triangulation
* Depth-First-Search (considering only the nodes as 2d points)
* Dijkstra (shortest path)
* Floyd-Warshall (shortest paths)
* Graham Scan (convex hull)
* Johnson (shortest path)
* KD Tree (considering only the nodes as 2d points)
* Quad Tree (considering only the nodes as 2d points)
* Dinic (maximal flow)
* Edmonds-Karp (maximal flow)
* Push/Relabel (maximal flow)
* Rotating Calipers (considering only the nodes as 2d points)
* Tarjan (Strongly Connected Components)
* Two Coloring

### Not yet implemented

* ❌ Closest Point Pair
* ❌ Maximal Bipartit Matching
* ❌ Maximal Matching
* ❌ Minimal Disk
* ❌ Topological Sort

## Future

In the future I would like to implement:

* finite state automata simulation
* petri net simulation

## Prerequisites

In order to work with this project you need to have NodeJS and the Yarn package manager installed.

## Usage

1. First run

```sh
$ yarn install
```

to install javascript dependencies.

2. then in order to start the development web server run

```sh
$ yarn dev
```


3. Then open [http://localhost:1234](http://localhost:1234)

[screenshot]:screenshot.png
