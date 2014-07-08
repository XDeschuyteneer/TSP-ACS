var opt;
var layout;
var cy;
var output;
var input;
var pattern = '\((\\s)*(\\d)+,(\\s)*(\\d)+,(\\s)*(\\d)+\)';
var regex = new RegExp(pattern, 'g');
var tsp;
var undirected;
// Utils

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

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

function exp () {
    var option = {
        full : true
    };
    var img = cy.png(option);
    var win = window.open(img, '_blank');
    win.focus();
    console.log(img);
}

// graph drawing parameters

layout = {
        name: 'circle',

        fit: true, // whether to fit the viewport to the graph
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        rStepSize: 10, // the step size for increasing the radius if the nodes don't fit on screen
        padding: 30, // the padding on fit
        startAngle: 1.1 * Math.PI, // the position of the first node
        counterclockwise: false // whether the layout should go counterclockwise (true) or clockwise (false)
    };


opt = {
    minZoom: 0.5,
    maxZoom: 2,
    name: 'circle',
    fit: true,
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
        var c = edge.cost;
        this.costs[s][d] = c;
    }

    this.syncHTMLTable();
}

Graph.prototype.clearHTMLCostsTable = function () {
    var table = document.getElementById("costs");
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }
    return table;
}

Graph.prototype.syncHTMLTable = function () {
    var table = this.clearHTMLCostsTable();
    var n = this.nodes.length;
    var r = table.insertRow(0);
    r.insertCell("#");
    for (var i = 0; i < n; ++i) {
        var c = r.insertCell(r.cells.length);
        c.innerHTML = "<b>" + this.nodes[i].id + "</b"
    }

    for (var i = 1; i <= n; ++i) {
        var r = table.insertRow(table.rows.length);
        var c = r.insertCell(0);
        c.innerHTML = "<b>" + this.nodes[i - 1].id + "</b>";
        for (var j = 1; j <= n; ++j) {
            var c = r.insertCell(r.cells.length);
            var cost = this.costs[i][j];
            if (cost)
                c.innerHTML = cost;
            else
                c.innerHTML = "-";
        }
    }
}

Graph.prototype.getCost = function (s, d) {
    try {
        return this.costs[s][d];
    } catch (err) {
        return null;
    }
}

Graph.prototype.getNode = function (id) {
    for (var i = 0; i < this.nodes.length; ++i) {
        var node = this.nodes[i];
        if (node.id == id) {
            return node;
        }
    }
    return null;
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

Graph.prototype.neighborhood = function (id) {
    var n = new Array();
    for (var i = 0; i < this.edges.length; ++i) {
        var edge = this.edges[i];
        if (!edge.visited && edge.source == id) {
            n[n.length] = edge
        }
    }
    return n;
}

Graph.prototype.print = function () {
    console.log("Nodes(id, value):");
    n = ""
    for (var i = 0; i < this.nodes.length; ++i) {
        n += this.nodes[i].toString() + " ";
    }
    console.log(n + "\nEdges(s, d, value):");
    e = ""
    for (var i = 0; i < this.edges.length; ++i) {
        e += this.edges[i].toString() + " ";
    }
    console.log(e);
}

Graph.prototype.draw = function () {
    // specify the elements in the graph
    opt.elements = {
        nodes: [],
        edges: [],
    };
    for (var i = 0; i < this.nodes.length; ++i) {
        var node = this.nodes[i];
        opt.elements.nodes.push({ data: { id: node.id, name: node.id, weight : 70, height: 180} })
    }
    for (var i = 0; i < this.edges.length; ++i) {
        var edge = this.edges[i];
        if (undirected)
            ++i;
        opt.elements.edges.push({ data: { source: edge.source, target: edge.destination } });
    }

    // initialise cytoscape.js on a html dom element with some options:
    cy = cytoscape(options=opt);
    cy.layout(layout);
}

Graph.prototype.visited = function (nodeId) {
    for (var i = 0; i < this.edges.length; ++i) {
        var e = this.edges[i];
        var s = e.source;
        var d = e.destination;
        if (d == nodeId) {
            e.visited = true;
        }
    }
}

Graph.prototype.unvisit = function () {
    for (var i = 0; i < this.nodes.length; ++i) {
        this.nodes[i].visited = false;
    }

    for (var i = 0; i < this.edges.length; ++i) {
        this.edges[i].visited = false;
    }
}

// Node object definition

function Node(id, value) {
    this.id = id;
    this.value = value;
    this.visited = false;
}

Node.prototype.equals = function(y) {
    return this.id == y.id && this.value == y.value;
}

Node.prototype.toString = function() {
    return "(" + this.id + ", " + this.value + ")";
}

// Edge object definition

function Edge(source, destination, cost) {
    this.source = source;
    this.destination = destination;
    this.cost = cost;
    this.pheromone = 1;
    this.visited = false;
}

Edge.prototype.equals = function(y) {
    return (this.source == y.source
            && this.destination == y.destination
            && this.cost == y.cost);
}

Edge.prototype.toString = function() {
    return "(" + this.source + ", " + this.destination + ", " + this.cost + " - " + this.visited + ")";
}

// TSP solving with ACS

function TSPACS(graph) {
    this.alpha = 1;
    this.beta = 5;
    this.ants = 1;
    this.evaporationRate = 0.5;
    this.graph = graph;
    this.graph.updateCosts();
    this.costs = this.graph.costs;
    var n = this.graph.nodes.length;
    this.pheromones = createArray2D(n, n);
}

TSPACS.prototype.getDrawedEdge = function (source, destination) {
    var edges = cy.edges();
    for (var i = 0; i < edges.length; ++i) {
        var edge = edges[i]
        if (undirected && (edge.source().id() == source && edge.target().id() == destination || edge.source().id() == destination && edge.target().id() == source))
            return edge;
        else if (edge.source().id() == source && edge.target().id() == destination)
            return edge;
    }
    return null;
}

TSPACS.prototype.selectDrawedEdge = function (source, destination) {
    var edge = this.getDrawedEdge(source, destination);
    edge.select();
}

TSPACS.prototype.unselectDrawedEdge = function (source, destination) {
    var edge = this.getDrawedEdge(source, destination);
    edge.unselect();
}

TSPACS.prototype.getDrawedNode = function (id) {
    var nodes = cy.nodes();
    for (var i = 0; i < nodes.length; ++i) {
        var node = nodes[i]
        if (node.id() == id)
            return node;
    }
    return null;
}

TSPACS.prototype.selectDrawedNode = function (id) {
    var node = this.getDrawedNode(id);
    node.select();
}

TSPACS.prototype.unSelectDrawedNode = function (id) {
    var node = this.getDrawedNode(id);
    node.unselect();
}

TSPACS.prototype.actionChoiceRule = function (source) {

}

TSPACS.prototype.updatePheromones = function () {

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

TSPACS.prototype.getPij = function (neighborhood) {
    var pijs = new Array(neighborhood.length);
    var denom = 0;
    for (var i = 0; i < neighborhood.length; ++i) {
        var edge = neighborhood[i];
        var a = Math.pow(edge.pheromone, this.alpha);
        var b = Math.pow((1 / edge.cost), this.beta);
        denom += (a * b)
    }

    for (var i = 0; i < neighborhood.length; ++i) {
        var edge = neighborhood[i];
        var num = (Math.pow(edge.pheromone, this.beta) * Math.pow((1 / edge.cost), this.beta));
        pijs[i] = num / denom;
    }

    return pijs
}

TSPACS.prototype.unselect = function () {
    var nodes = cy.nodes();
    var edges = cy.edges();

    for (var i = 0; i < nodes.length; ++i) {
        nodes[i].unselect();
    }

    for (var i = 0; i < edges.length; ++i) {
        edges[i].unselect();
    }
}

TSPACS.prototype.step = function () {
    this.unselect();
    var iteration = 0;
    /* start at random position */
    var startNodeId = Math.floor(Math.random() * this.graph.nodes.length);
    var startNode = this.graph.nodes[startNodeId];
    /* mark edge as visited */
    this.graph.visited(startNode.id);
    var path = new Array();
    path.push(startNode.id);
    this.selectDrawedNode(startNode.id);
    /* generate neighborhood */
    var neighborhood = this.graph.neighborhood(startNode.id);
    /* while neighborhood not empty */
    while (iteration < this.graph.nodes.length && neighborhood.length != 0) {
        /* calculate pij for every neighbor*/
        var pijs = this.getPij(neighborhood);
        /* generate a random number */
        var rand = Math.random();
        /* find the first neighbor that have a pij >= random number */
        var nextId = pijs.length - 1;
        for (var i = 0; i < pijs.length; ++i) {
            if (pijs[i] > rand) {
                nextId = i;
                break;
            }
        }
        var next = neighborhood[nextId].destination;
        path.push(next);
        this.selectDrawedNode(next);
        this.selectDrawedEdge(neighborhood[nextId].source, neighborhood[nextId].destination);
        /* generate neighborhood */
        neighborhood = this.graph.neighborhood(next);
        /* mark edge as visited */
        this.graph.visited(next);
        iteration++;
    }
    this.selectDrawedEdge(path[0], path[path.length - 1]);
    this.graph.unvisit();
    console.log(path);
    /* you have now a tour for a ant*/
    /* update pheromone table*/
}

function init () {
    output = document.getElementById("out");
    input = document.getElementById("in");
    document.getElementById("undirected").checked = true;
    undirected = document.getElementById("undirected").checked;
    input.value = "(1,2,7)(1,3,8)(1,4,10)(1,5,8)(2,3,10)(2,4,14)(2,5,13)(3,4,9)(3,5,15)(4,5,7)"
    opt.container = document.getElementById('cy');
    tsp = new TSPACS(new Graph());
    validate();
}

function validate() {
    undirected = document.getElementById("undirected").checked;
    if (undirected)
        opt.style[2].css['target-arrow-shape'] = ""
    else
        opt.style[2].css['target-arrow-shape'] = "triangle"
    var graph = parse(input.value);
    graph.draw();
    tsp = new TSPACS(graph);
}

function next() {
    tsp.step();
}

function parse(text) {
    var graph = new Graph();
    var item;
    while ((item = regex.exec(text)) != null) {
        var numbers = item[0].split(',');
        if (numbers.length == 3) {
            var s = numbers[0].trim();
            var d = numbers[1].trim();
            var v = numbers[2].trim();
            graph.addEdge(s, d, v);
            if (undirected)
                graph.addEdge(d, s, v);
        }
    }
    graph.updateCosts();
    return graph;
}

window.onload = init
