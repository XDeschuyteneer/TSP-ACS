var output;
var input;
var pattern = '\(\\d+,\\d+,\\d+\)';
var regex = new RegExp(pattern, 'g');

// Utils

function include(arr, obj) {
    var index = -1;
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i].equals(obj)) {
            index = i;
            break;
        }
    }
    return index != -1;
}

function createArray2D(x, y) {
    var tab = new Array(x);
    for (var i = 0; i < x; ++i) {
        tab[i] = new Array(y);
        for (var j = 0; j < y; ++j) {
            tab[i][j] = 0;
        }
    }
    return tab;
}

// graph drawing parameters

var opt = {
    minZoom: 0.5,
    maxZoom: 2,

    // style can be specified as plain JSON, a stylesheet string (probably a CSS-like
    // file pulled from the server), or in a functional format
    style: [
        {
            selector: 'node',
            css: {
                'content': 'data(name)',
                'font-family': 'helvetica',
                'font-size': 14,
                'text-outline-width': 3,
                'text-outline-color': '#888',
                'text-valign': 'center',
                'color': '#fff',
                'width': 'mapData(weight, 30, 80, 20, 50)',
                'height': 'mapData(height, 0, 200, 10, 45)',
                'border-color': '#fff'
            }
        },

        {
            selector: ':selected',
            css: {
                'background-color': '#000',
                'line-color': '#000',
                'target-arrow-color': '#000',
                'text-outline-color': '#000'
            }
        },

        {
            selector: 'edge',
            css: {
                'width': 2,
                'target-arrow-shape': 'triangle'
            }
        }
    ],

    ready: function(){
        // when layout has set initial node positions etc
    }
};

// Graph object definition

function Graph() {
    this.nodes = new Array();
    this.edges = new Array();
    this.costs = {};
}

Graph.prototype.updateCosts = function () {
    this.costs = {};
    for (var i = 0; i < this.nodes.length; ++i) {
        var node = this.nodes[i];
        this.costs[node.id] = {};
    }
    for (var i = 0; i < this.edges.length; ++i) {
        var edge = this.edges[i];
        var s = edge.source;
        var d = edge.destination;
        var c = edge.value;
        this.costs[s][d] = c;
    }
}

Graph.prototype.getCost = function (s, d) {
    try {
        return this.costs[s][d];
    } catch (err) {
        return null;
    }
}

Graph.prototype.addNode = function (id, value) {
    var node =  new Node(id, value);
    var alreadyPresent = include(this.nodes, node);
    if (!alreadyPresent)
        this.nodes[this.nodes.length] = node;
}

Graph.prototype.addEdge = function (source, destination, value) {
    var sourceAlreadyPresent = include(this.nodes, source);
    var destAlreadyPresent = include(this.nodes, destination);
    if (!sourceAlreadyPresent) {
        this.addNode(source);
    }

    if (!destAlreadyPresent) {
        this.addNode(destination);
    }
    this.edges[this.edges.length] = new Edge(source, destination, value)
}

Graph.prototype.neighborhood = function (source) {
    var n = new Array();
    for (var i = 0; i < this.edges.length; ++i) {
        var edge = this.edges[i];
        if (edge.source == source) {
            n[n.length] = edge
        }
    }
}

Graph.prototype.print = function () {
    console.log("Nodes(id, value):");
    for (var i = 0; i < this.nodes.length; ++i) {
        console.log("\t" + this.nodes[i].toString());
    }
    console.log("Edges(s, d, value):");
    for (var i = 0; i < this.edges.length; ++i) {
        console.log("\t" + this.edges[i].toString());
    }
}

Graph.prototype.draw = function () {
    // specify the elements in the graph
    opt.elements = {
        nodes: [],
        edges: [],
    };
    console.log("add nodes");
    for (var i = 0; i < this.nodes.length; ++i) {
        var node = this.nodes[i];
        opt.elements.nodes.push({ data: { id: node.id, name: node.id, weight : 70, height: 180 } })
    }
    console.log("add edges");
    for (var i =0; i < this.edges.length; ++i) {
        var edge = this.edges[i];
        opt.elements.edges.push({ data: { source: edge.source, target: edge.destination } });
    }

    // initialise cytoscape.js on a html dom element with some options:
    cy = cytoscape(options=opt);
}

// Node object definition

function Node(id, value) {
    this.id = id;
    this.value = value;
}

Node.prototype.equals = function(y) {
    return this.id == y.id && this.value == y.value;
}

Node.prototype.toString = function() {
    return "(" + this.id + ", " + this.value + ")";
}

// Edge object definition

function Edge(source, destination, value) {
    this.source = source;
    this.destination = destination;
    this.value = value;
}

Edge.prototype.equals = function(y) {
    return (this.source == y.source
            && this.destination == y.destination
            && this.value == y.value);
}

Edge.prototype.toString = function() {
    return "(" + this.source + ", " + this.destination + ", " + this.value + ")";
}

// TSP solving with ACS

function TSPACS(graph) {
    this.alpha = 1;
    this.beta = 1;
    this.ants = 3;
    this.evaporationRate = 0.5;
    this.graph = graph;
    var n = this.graph.nodes.length;
    this.pheromones = createArray2D(n, n);
}

TSPACS.prototype.actionChoiceRule = function (source) {

}

TSPACS.prototype.updatePheromones = function () {

}

TSPACS.prototype.updateCosts = function () {

}

TSPACS.prototype.printTab = function (tab) {
    var s = "  "
    for (var i = 0; i < tab.length; ++i) {
        s += this.graph.nodes[i].id + " ";
    }
    s += "\n"
    for (var i = 0; i < tab.length; ++i) {
        s += this.graph.nodes[i].id + " ";
        for (var j = 0; j < tab[0].length; ++j) {
            s += tab[i][j] +  " ";
        }
        s += "\n"
    }
    console.log(s);
}

TSPACS.prototype.printCosts = function () {
    this.printTab(this.costs);
}

TSPACS.prototype.printPheromones = function () {
    this.printTab(this.pheromones);
}

function init () {
    output = document.getElementById("out");
    input = document.getElementById("in");
    input.value = "(1,2,1)(2,3,1)(3,4,1)(4,1,1)";
    opt.container = document.getElementById('cy')
}

function validate() {
    console.log(input.value);
    var graph = parse(input.value);
    graph.draw();
    var tsp = new TSPACS(graph);
}

function parse(text) {
    var graph = new Graph();
    var item;
    while ((item = regex.exec(text)) != null) {
        var numbers = item[0].split(',');
        if (numbers.length == 3) {
            var s = numbers[0];
            var d = numbers[1];
            var v = numbers[2];
            graph.addEdge(s, d, v);
        }
    }
    graph.updateCosts();
    return graph;
}

window.onload = init
