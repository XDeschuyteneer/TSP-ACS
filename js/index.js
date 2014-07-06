var output;
var input;
var pattern = '\(\\d+,\\d+,\\d+\)';
var regex = new RegExp(pattern, 'g');

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

function Graph() {
    this.nodes = new Array();
    this.edges = new Array();
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

function init () {
    output = document.getElementById("out");
    input = document.getElementById("in");
    input.value = "(1,2,3)(4,5,6)";
}

function validate() {
    console.log(input.value);
    parse(input.value);
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
    graph.print();
}

window.onload = init
