var blackholesun = {
    version: "0.2"
};

var mu = blackholesun;

//Default arc span of the plot, in degrees.  360 for full polar plot
var span = 360;


var chartCenter;

var radius;

/**
*   Return a dimension arc given a groupID
*/
function getDimensionByGroupId(aGroupId) {
    var node = null;
    
    var outerBandContainer = d3.select("g.outer-band-group-bhs");
    var nodes = outerBandContainer.selectAll("path");

    nodes.each(function(d,i) {    
        if(d.groupId==aGroupId)               {
            //console.log("Found node "+ aGroupId + " with label " + d.label);   
            node = d;  
         }
       
    });
    return node;
}

/**
*   Return a dimension arc given a label
*/
function getDimensionByLabel(aLabel) {
    var node = null;
     var svg = d3.select("svg.chart-root");
    var outerBandContainer = svg.select("g.outer-band-group-bhs");
    var nodes = outerBandContainer.selectAll("path");

    nodes.each(function(d,i) {    
        if(d.label==aLabel)               {
            //console.log("Found node "+ d.groupId + " with label " + d.label);   
            node = d;  
         }       
    });
    return node;
}



/*
*  Generates some random bars
*/
function randomBars() {

    for(gId=1; gId <=14; gId++ ) {

        var dim = getDimensionByGroupId(gId)

        if(dim.type != "undefined") {
            sarc = dim.startArc;
            earc = dim.endArc;
            w=(earc-sarc);
            cap = Math.random();
            for(i=0; i < w; i++) {
                nextLevel = cap*Math.random();
                plotBar(dim, i, nextLevel);
            }
        }
    }
}


/**
* Adds a bar given a groupId, channel within that label {0..width}, and a level (0..1)
*/
function plotBar(dim, channel, level) {

    
    if(dim.type != "undefined") {

        sarc= dim.startArc;
        earc = dim.endArc;

        channelArc = sarc + channel;

        if(channelArc > earc) channelArc = earc;


        
              
        var graphicsContainer = d3.select("g.geometry-group-bhs");
           
        

        cx = 0;
        cy = 0;

        tx = Math.cos((channelArc-90) * (Math.PI / 180));
        ty = Math.sin((channelArc-90) * (Math.PI / 180));


        //console.log("adding a line channelArc:" + channelArc + " tx:" + tx + "   ty:" + ty);

        //Scale lines based on level
        s1 = level/0.3;
        if(s1 > 1) s1 =1;

        s2 = level/0.6;
        if(s2 > 1) s2 =1;

        s3 = level/1 ;
        if(s3 > 1) s3 =1;

        //outer ring -- always static
        r0x = tx * 0.90 * radius;
        r0y = ty * 0.90 * radius;

        //low ring 
        r1x = tx * (0.90-(s1*0.15)) * radius;
        r1y = ty * (0.90-(s1*0.15)) * radius;

        //med ring 
        r2x = tx * (0.90-(s2*0.30)) * radius;
        r2y = ty * (0.90-(s2*0.30)) * radius;


        //highring 
        r3x = tx * (0.90-(s3*0.50)) * radius;
        r3y = ty * (0.90-(s3*0.50)) * radius;


    

        var line1Data = [ { "x": r1x,   "y": r1y},  { "x": r0x,  "y": r0y}]
        var line2Data = [ { "x": r2x,   "y": r2y},  { "x": r1x,  "y": r1y}]
        var line3Data = [ { "x": r3x,   "y": r3y},  { "x": r2x,  "y": r2y}]

        //This is the accessor function we talked about above
        var lineFunction = d3.svg.line()
          .x(function(d) { return d.x; })
          .y(function(d) { return d.y; })
         .interpolate("linear");
        
       
       if(level > 0) {
        graphicsContainer.append("path")
        .attr("d", lineFunction(line1Data))
        .attr("stroke", "#3ae1d0")
        .attr("stroke-width", 1)
        .attr("startArc", sarc)        
        .attr("fill", "none")
        .style("opacity", .75);
        }


        if(level > 0.3) {
        graphicsContainer.append("path")
        .attr("d", lineFunction(line2Data))
        .attr("stroke", "#ffaa01")
        .attr("stroke-width", 2)
        .attr("startArc", sarc)        
        .attr("fill", "none")
        .style("opacity", .75);
        }

        if(level > 0.6) {
        graphicsContainer.append("path")
        .attr("d", lineFunction(line3Data))
        .attr("stroke", "#ff0b00")
        .attr("stroke-width", 2)
        .attr("startArc", sarc)        
        .attr("fill", "none")
        .style("opacity", .75);
        }

    

    }


}



/**
* Main module
*/
mu.Axis = function module() {
    var config = {
        dimensions: [],
        layout: {}
    }, inputConfig = {}, liveConfig = {};
    var container, dispatch = d3.dispatch("hover"), radialScale, angularScale;
    var angularTooltip, radialTooltip, geometryTooltip;
    var exports = {};
    function render(_container) {
        container = _container || container;
        var dimensions = config.dimensions;
        var axisConfig = config.layout;
          

        if (typeof container === "string" || container.nodeName) {
            container = d3.select(container);
        }
       
        //Read each dimensions line
        container.datum(dimensions).each(function(_dimensions, _index) {
            var dimensionsOriginal = _dimensions.slice();
            liveConfig = {
                dimensions: mu.util.cloneJson(dimensionsOriginal),
                layout: mu.util.cloneJson(axisConfig)
            };
            var colorIndex = 0;
            dimensionsOriginal.forEach(function(d, i) {
                if (!d.color) {
                    d.color = axisConfig.defaultColorRange[colorIndex];
                    colorIndex = (colorIndex + 1) % axisConfig.defaultColorRange.length;
                }
                if (!d.strokeColor) {
                    d.strokeColor = d.geometry === "LinePlot" ? d.color : d3.rgb(d.color).darker().toString();
                }
                liveConfig.dimensions[i].color = d.color;
                liveConfig.dimensions[i].strokeColor = d.strokeColor;
                liveConfig.dimensions[i].strokeDash = d.strokeDash;
                liveConfig.dimensions[i].strokeSize = d.strokeSize;
            });
            var dimensions = dimensionsOriginal.filter(function(d, i) {
                var visible = d.visible;
                return typeof visible === "undefined" || visible === true;
            });
           
            dimensions.forEach(function(d, i) {
                d.t = Array.isArray(d.t[0]) ? d.t : [ d.t ];
                d.r = Array.isArray(d.r[0]) ? d.r : [ d.r ];
            });
            radius = Math.min(axisConfig.width - axisConfig.margin.left - axisConfig.margin.right-50, axisConfig.height - axisConfig.margin.top - axisConfig.margin.bottom-50) / 2;
            radius = Math.max(10, radius);
            chartCenter = [ axisConfig.margin.left + radius, axisConfig.margin.top + radius ];
            var extent;
            
            extent = d3.extent(mu.util.flattenArray(dimensions.map(function(d, i) {
                return d.r;
            })));
        
            if (axisConfig.radialAxis.domain !== mu.dimensionsEXTENT) {
                extent[0] = 0;
            }

            //Figure out the radial scale
            radialScale = d3.scale.linear().domain(axisConfig.radialAxis.domain !== mu.dimensionsEXTENT && axisConfig.radialAxis.domain ? axisConfig.radialAxis.domain : extent).range([ 0.6*radius, 1.0*radius ]);
            liveConfig.layout.radialAxis.domain = radialScale.domain();
            var angulardimensionsMerged = mu.util.flattenArray(dimensions.map(function(d, i) {
                return d.t;
            }));
            
            var ticks;
           
            var hasOnlyLineOrDotPlot = false;
            var isOrdinal= false;
            var needsEndSpacing = axisConfig.needsEndSpacing === null ? isOrdinal || !hasOnlyLineOrDotPlot : axisConfig.needsEndSpacing;
            var useProvidedDomain = axisConfig.angularAxis.domain && axisConfig.angularAxis.domain !== mu.dimensionsEXTENT && !isOrdinal && axisConfig.angularAxis.domain[0] >= 0;
            var angularDomain = useProvidedDomain ? axisConfig.angularAxis.domain : d3.extent(angulardimensionsMerged);
            var angularDomainStep = Math.abs(angulardimensionsMerged[1] - angulardimensionsMerged[0]);
            if (hasOnlyLineOrDotPlot && !isOrdinal) {
                angularDomainStep = 0;
            }
            var angularDomainWithPadding = angularDomain.slice();
            if (needsEndSpacing && isOrdinal) {
                angularDomainWithPadding[1] += angularDomainStep;
            }
            var tickCount = axisConfig.angularAxis.ticksCount || 7;
            if (tickCount > 8) {
                tickCount = tickCount / (tickCount / 8) + tickCount % 8;
            }
            if (axisConfig.angularAxis.ticksStep) {
                tickCount = (angularDomainWithPadding[1] - angularDomainWithPadding[0]) / tickCount;
            }
            var angularTicksStep = axisConfig.angularAxis.ticksStep || (angularDomainWithPadding[1] - angularDomainWithPadding[0]) / (tickCount * (axisConfig.minorTicks + 1));
            if (ticks) {
                angularTicksStep = Math.max(Math.round(angularTicksStep), 1);
            }
            if (!angularDomainWithPadding[2]) {
                angularDomainWithPadding[2] = angularTicksStep;
            }
            var angularAxisRange = d3.range.apply(this, angularDomainWithPadding);
            angularAxisRange = angularAxisRange.map(function(d, i) {
                return parseFloat(d.toPrecision(12));
            });
            //spanset
            angularScale = d3.scale.linear().domain(angularDomainWithPadding.slice(0, 2)).range(axisConfig.direction === "clockwise" ? [ 0, span ] : [ span, 0 ]);
            liveConfig.layout.angularAxis.domain = angularScale.domain();
            liveConfig.layout.angularAxis.endPadding = needsEndSpacing ? angularDomainStep : 0;
            var svg = d3.select(this).select("svg.chart-root");
            if (typeof svg === "undefined" || svg.empty()) {
                var skeleton = '<svg xmlns="http://www.w3.org/2000/svg" class="chart-root">' 
                        + '<g class="outer-group">' + '<g class="chart-group">' 
                        + '<path class="background-circle"></path>' + '<g class="outer-band-group-bhs"></g>' 
                        + '<g class="radial axis-group"></g>' +'<g class="geometry-group-bhs"></g>' + 
                        + '<circle class="outside-circle"></circle>' + '<g class="angular axis-group"></g>' 
                        + '<g class="guides-group"><line></line><circle r="0"></circle></g>' + "</g>" 
                        + '<g class="tooltips-group"></g>' + '<g class="title-group"><text></text></g>' 
                        + "</g>" + "</svg>";

                var doc = new DOMParser().parseFromString(skeleton, "application/xml");
                var newSvg = this.appendChild(this.ownerDocument.importNode(doc.documentElement, true));
                svg = d3.select(newSvg);
            }
            svg.select(".guides-group").style({
                "pointer-events": "none"
            });
            svg.select(".angular.axis-group").style({
                "pointer-events": "none"
            });
            svg.select(".radial.axis-group").style({
                "pointer-events": "none"
            });
            var chartGroup = svg.select(".chart-group");
            var lineStyle = {
                fill: "none",
                stroke: axisConfig.tickColor
            };
            var fontStyle = {
                "font-size": axisConfig.font.size,
                "font-family": axisConfig.font.family,
                fill: axisConfig.font.color
                
            };
            
            
            svg.attr({
                width: axisConfig.width,
                height: axisConfig.height
            }).style({
                opacity: axisConfig.opacity
            });
            chartGroup.attr("transform", "translate(" + chartCenter + ")").style({
                cursor: "crosshair"
            });
            
            var centeringOffset = [ (axisConfig.width - (axisConfig.margin.left + axisConfig.margin.right + radius * 2 + 0)) / 2, (axisConfig.height - (axisConfig.margin.top + axisConfig.margin.bottom + radius * 2)) / 2 ];
            centeringOffset[0] = Math.max(0, centeringOffset[0]);
            centeringOffset[1] = Math.max(0, centeringOffset[1]);
            svg.select(".outer-group").attr("transform", "translate(" + centeringOffset + ")");
            if (axisConfig.title) {
                var title = svg.select("g.title-group text").style(fontStyle).text(axisConfig.title);
                var titleBBox = title.node().getBBox();
                title.attr({
                    x: chartCenter[0] - titleBBox.width / 2,
                    y: chartCenter[1] - radius - 30
                });
            }

            var radialAxis = svg.select(".radial.axis-group");
           
            function currentAngle(d, i) {
                //spanset
                as = angularScale(d)
                return as % span + axisConfig.orientation;
            }

           //Concentric circles           
            if (axisConfig.radialAxis.gridLinesVisible) {
                var gridCircles = radialAxis.selectAll("circle.grid-circle").data(radialScale.ticks(3));              
                gridCircles.enter().append("circle");
                gridCircles.attr("r", radialScale);                
                gridCircles.style("opacity", 0.4);
                gridCircles.style("stroke", "#3ae1d0")
                gridCircles.style("fill", "none")
                gridCircles.exit().remove();
            }



            //Plot outside arc            
            var pi = Math.PI;             
            
            var arc = d3.svg.arc()
                .innerRadius(0)
                .outerRadius(radius*2)
                .startAngle(0 * (pi/180)) //converting from degs to radians
                .endAngle(360 * (pi/180)) //just radians

              var gridCircles =  radialAxis;           
                gridCircles.append("circle")
                    .attr("r", radius*0.9)                
                    .style("opacity", 0.6)
                    .style("stroke-width", 5)
                    .style("stroke", "#3ae1d0")
                    .style("fill", "none");
                
            
            //Outside ticks
            var angularAxis = svg.select(".angular.axis-group").selectAll("g.angular-tick").data(angularAxisRange);
            var angularAxisEnter = angularAxis.enter().append("g").classed("angular-tick", true);
            angularAxis.attr({
                transform: function(d, i) {
                    ca = currentAngle(d, i);
                    return "rotate(" + ca + ")";
                }
            }).style({
                display: axisConfig.angularAxis.visible ? "block" : "none"
            });
            angularAxis.exit().remove();
            angularAxisEnter.append("line").classed("grid-line", true).classed("major", function(d, i) {
                return i % (axisConfig.minorTicks + 1) === 0;
            }).classed("minor", function(d, i) {
                return i % (axisConfig.minorTicks + 1) !== 0;
            }).style(lineStyle);
            angularAxisEnter.selectAll(".minor").style({
                stroke: axisConfig.minorTickColor
            });

            //Series Arcs
            var hasGeometry = svg.select("g.outer-band-group-bhs").selectAll("g").size() > 0;
            var outerBandContainer = svg.select("g.outer-band-group-bhs").selectAll("g.geometry").data(dimensions);
            
            if (dimensions[0] || hasGeometry) {
                var geometryConfigs = [];
                
                dimensions.forEach(function(d, i) {                    
                    if(typeof d.label != "undefined") {
                        sarc = d.startArc
                        earc = d.endArc

                        console.log("adding an arc");
            
                        //Create an arc
                        var arc = d3.svg.arc()
                            .innerRadius(radius-5)
                            .outerRadius(radius+10)
                            .startAngle(sarc * (pi/180)) //converting from degs to radians
                            .endAngle(earc * (pi/180)) //just radians

                        
                       
                        outerBandContainer.enter().append("path")
                        .attr("d", arc)
                        .attr("groupId", d.groupId)
                        .attr("label", d.label)
                        .attr("startArc", sarc)
                        .attr("endArc", earc)
                        .attr("fill", d.color)
                        .style("opacity", .75);
                    }
                    
                });            
                
            }
           
            
        
        });


        //STEVE TEST
        n=getDimensionByGroupId(5);
        //getDimensionByLabel("CVE");
        plotBar(n,1,0.6);
        
        //plotBar(12,5,0.8);
        randomBars();

        return exports;
    }
    exports.render = function(_container) {
        render(_container);
        return this;
    };
    exports.config = function(_x) {
        if (!arguments.length) {
            return config;
        }
        var xClone = mu.util.cloneJson(_x);
        xClone.dimensions.forEach(function(d, i) {
            if (!config.dimensions[i]) {
                config.dimensions[i] = {};
            }
            mu.util.deepExtend(config.dimensions[i], mu.Axis.defaultConfig().dimensions[0]);
            mu.util.deepExtend(config.dimensions[i], d);
        });
        mu.util.deepExtend(config.layout, mu.Axis.defaultConfig().layout);
        mu.util.deepExtend(config.layout, xClone.layout);
        return this;
    };
    exports.getLiveConfig = function() {
        return liveConfig;
    };
    exports.getinputConfig = function() {
        return inputConfig;
    };
    exports.radialScale = function(_x) {
        return radialScale;
    };
    exports.angularScale = function(_x) {
        return angularScale;
    };
    exports.svg = function() {
        return svg;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};




mu.Axis.defaultConfig = function(d, i) {
    var config = {
        dimensions: [ {
            t: [ 1, 2, 3, 4 ],
            r: [ 10, 11, 12, 13 ],
            name: "Line1",
            geometry: "LinePlot",
            color: null,
            strokeDash: "solid",
            strokeColor: null,
            strokeSize: "1",
            visibleInLegend: true,
            opacity: 1
        } ],
        layout: {
            defaultColorRange: d3.scale.category10().range(),
            title: null,
            height: 450,
            width: 500,
            margin: {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40
            },
            font: {
                size: 12,
                color: "gray",
                outlineColor: "white",
                family: "Tahoma, sans-serif"
            },
            direction: "clockwise",
            orientation: 0,
            labelOffset: 10,
            radialAxis: {
                domain: null,
                orientation: 0,
                ticksSuffix: "",
                visible: true,
                gridLinesVisible: true,
                tickOrientation: "horizontal",
                rewriteTicks: null
            },
            angularAxis: {
                domain: [ 0, 360 ],
                ticksSuffix: "",
                visible: true,
                gridLinesVisible: true,
                labelsVisible: true,
                tickOrientation: "horizontal",
                rewriteTicks: null,
                ticksCount: null,
                ticksStep: null
            },
            minorTicks: 0,
            tickLength: null,
            tickColor: "silver",
            minorTickColor: "#eee",
            backgroundColor: "none",
            needsEndSpacing: null,
            showLegend: true,
            legend: {
                reverseOrder: false
            },
            opacity: 1
        }
    };
    return config;
};

mu.util = {};

mu.dimensionsEXTENT = "dimensionsExtent";

mu.AREA = "AreaChart";


mu.util._override = function(_objA, _objB) {
    for (var x in _objA) {
        if (x in _objB) {
            _objB[x] = _objA[x];
        }
    }
};

mu.util._extend = function(_objA, _objB) {
    for (var x in _objA) {
        _objB[x] = _objA[x];
    }
};

mu.util._rndSnd = function() {
    return Math.random() * 2 - 1 + (Math.random() * 2 - 1) + (Math.random() * 2 - 1);
};

mu.util.dimensionsFromEquation2 = function(_equation, _step) {
    var step = _step || 6;
    //spanset
    var dimensions = d3.range(0, span + step, step).map(function(deg, index) {
        var theta = deg * Math.PI / 180;
        var radius = _equation(theta);
        return [ deg, radius ];
    });
    return dimensions;
};

mu.util.dimensionsFromEquation = function(_equation, _step, _name) {
    var step = _step || 6;
    var t = [], r = [];
    //spanset
    d3.range(0, span + step, step).forEach(function(deg, index) {
        var theta = deg * Math.PI / 180;
        var radius = _equation(theta);
        t.push(deg);
        r.push(radius);
    });
    var result = {
        t: t,
        r: r
    };
    if (_name) {
        result.name = _name;
    }
    return result;
};

mu.util.ensureArray = function(_val, _count) {
    if (typeof _val === "undefined") {
        return null;
    }
    var arr = [].concat(_val);
    return d3.range(_count).map(function(d, i) {
        return arr[i] || arr[0];
    });
};

mu.util.fillArrays = function(_obj, _valueNames, _count) {
    _valueNames.forEach(function(d, i) {
        _obj[d] = mu.util.ensureArray(_obj[d], _count);
    });
    return _obj;
};

mu.util.cloneJson = function(json) {
    return JSON.parse(JSON.stringify(json));
};

mu.util.deepExtend = function(destination, source) {
    for (var property in source) {
        if (source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
};

mu.util.validateKeys = function(obj, keys) {
    if (typeof keys === "string") {
        keys = keys.split(".");
    }
    var next = keys.shift();
    return obj[next] && (!keys.length || objHasKeys(obj[next], keys));
};

mu.util.sumArrays = function(a, b) {
    return d3.zip(a, b).map(function(d, i) {
        return d3.sum(d);
    });
};

mu.util.arrayLast = function(a) {
    return a[a.length - 1];
};

mu.util.arrayEqual = function(a, b) {
    var i = Math.max(a.length, b.length, 1);
    while (i-- >= 0 && a[i] === b[i]) ;
    return i === -2;
};

mu.util.flattenArray = function(arr) {
    var r = [];
    while (!mu.util.arrayEqual(r, arr)) {
        r = arr;
        arr = [].concat.apply([], arr);
    }
    return arr;
};

mu.util.deduplicate = function(arr) {
    return arr.filter(function(v, i, a) {
        return a.indexOf(v) === i;
    });
};

mu.util.convertToCartesian = function(radius, theta) {
    var thetaRadians = theta * Math.PI / 180;
    var x = radius * Math.cos(thetaRadians);
    var y = radius * Math.sin(thetaRadians);
    return [ x, y ];
};

mu.util.round = function(_value, _digits) {
    var digits = _digits || 2;
    var mult = Math.pow(10, digits);
    return Math.round(_value * mult) / mult;
};

mu.util.getMousePos = function(_referenceElement) {
    var mousePos = d3.mouse(_referenceElement.node());
    var mouseX = mousePos[0];
    var mouseY = mousePos[1];
    var mouse = {};
    mouse.x = mouseX;
    mouse.y = mouseY;
    mouse.pos = mousePos;
    mouse.angle = (Math.atan2(mouseY, mouseX) + Math.PI) * 180 / Math.PI;
    mouse.radius = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
    return mouse;
};

mu.util.duplicatesCount = function(arr) {
    var uniques = {}, val;
    var dups = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        val = arr[i];
        if (val in uniques) {
            uniques[val]++;
            dups[val] = uniques[val];
        } else {
            uniques[val] = 1;
        }
    }
    return dups;
};

mu.util.duplicates = function(arr) {
    return Object.keys(mu.util.duplicatesCount(arr));
};

mu.util.translator = function(obj, sourceBranch, targetBranch, reverse) {
    if (reverse) {
        var targetBranchCopy = targetBranch.slice();
        targetBranch = sourceBranch;
        sourceBranch = targetBranchCopy;
    }
    var value = sourceBranch.reduce(function(previousValue, currentValue) {
        if (typeof previousValue !== "undefined") {
            return previousValue[currentValue];
        }
    }, obj);
    if (typeof value === "undefined") {
        return;
    }
    sourceBranch.reduce(function(previousValue, currentValue, index) {
        if (typeof previousValue === "undefined") {
            return;
        }
        if (index === sourceBranch.length - 1) {
            delete previousValue[currentValue];
        }
        return previousValue[currentValue];
    }, obj);
    targetBranch.reduce(function(previousValue, currentValue, index) {
        if (typeof previousValue[currentValue] === "undefined") {
            previousValue[currentValue] = {};
        }
        if (index === targetBranch.length - 1) {
            previousValue[currentValue] = value;
        }
        return previousValue[currentValue];
    }, obj);
};

mu.AreaChart = function module() {
    return mu.PolyChart();
};

mu.AreaChart.defaultConfig = function() {
    var config = {
        geometryConfig: {
            geometryType: "arc"
        }
    };
    return config;
};

mu.DotPlot = function module() {
    return mu.PolyChart();
};



mu.tooltipPanel = function() {
    var tooltipEl, tooltipTextEl, backgroundEl;
    var config = {
        container: null,
        hasTick: false,
        fontSize: 12,
        color: "white",
        padding: 5
    };
    var id = "tooltip-" + mu.tooltipPanel.uid++;
    var tickSize = 10;
    var exports = function() {
        tooltipEl = config.container.selectAll("g." + id).dimensions([ 0 ]);
        var tooltipEnter = tooltipEl.enter().append("g").classed(id, true).style({
            "pointer-events": "none",
            display: "none"
        });
        backgroundEl = tooltipEnter.append("path").style({
            fill: "white",
            "fill-opacity": .9
        }).attr({
            d: "M0 0"
        });
        tooltipTextEl = tooltipEnter.append("text").attr({
            dx: config.padding + tickSize,
            dy: +config.fontSize * .3
        });
        return exports;
    };
    exports.text = function(_text) {
        var l = d3.hsl(config.color).l;
        var strokeColor = l >= .5 ? "#aaa" : "white";
        var fillColor = l >= .5 ? "black" : "white";
        var text = _text || "";
        tooltipTextEl.style({
            fill: fillColor,
            "font-size": config.fontSize + "px"
        }).text(text);
        var padding = config.padding;
        var bbox = tooltipTextEl.node().getBBox();
        var boxStyle = {
            fill: config.color,
            stroke: strokeColor,
            "stroke-width": "2px"
        };
        var backGroundW = bbox.width + padding * 2 + tickSize;
        var backGroundH = bbox.height + padding * 2;
        backgroundEl.attr({
            d: "M" + [ [ tickSize, -backGroundH / 2 ], [ tickSize, -backGroundH / 4 ], [ config.hasTick ? 0 : tickSize, 0 ], [ tickSize, backGroundH / 4 ], [ tickSize, backGroundH / 2 ], [ backGroundW, backGroundH / 2 ], [ backGroundW, -backGroundH / 2 ] ].join("L") + "Z"
        }).style(boxStyle);
        tooltipEl.attr({
            transform: "translate(" + [ tickSize, -backGroundH / 2 + padding * 2 ] + ")"
        });
        tooltipEl.style({
            display: "block"
        });
        return exports;
    };
    exports.move = function(_pos) {
        if (!tooltipEl) {
            return;
        }
        tooltipEl.attr({
            transform: "translate(" + [ _pos[0], _pos[1] ] + ")"
        }).style({
            display: "block"
        });
        return exports;
    };
    exports.hide = function() {
        if (!tooltipEl) {
            return;
        }
        tooltipEl.style({
            display: "none"
        });
        return exports;
    };
    exports.show = function() {
        if (!tooltipEl) {
            return;
        }
        tooltipEl.style({
            display: "block"
        });
        return exports;
    };
    exports.config = function(_x) {
        mu.util.deepExtend(config, _x);
        return exports;
    };
    return exports;
};

mu.tooltipPanel.uid = 1;

mu.adapter = {};

mu.adapter.plotly = function module() {
    var exports = {};
    exports.convert = function(_inputConfig, reverse) {
        var outputConfig = {};
        if (_inputConfig.dimensions) {
            outputConfig.dimensions = _inputConfig.dimensions.map(function(d, i) {
                var r = mu.util.deepExtend({}, d);
                var toTranslate = [ [ r, [ "marker", "color" ], [ "color" ] ], [ r, [ "marker", "opacity" ], [ "opacity" ] ], [ r, [ "marker", "line", "color" ], [ "strokeColor" ] ], [ r, [ "marker", "line", "dash" ], [ "strokeDash" ] ], [ r, [ "marker", "line", "width" ], [ "strokeSize" ] ], [ r, [ "marker", "symbol" ], [ "dotType" ] ], [ r, [ "marker", "size" ], [ "dotSize" ] ], [ r, [ "marker", "barWidth" ], [ "barWidth" ] ], [ r, [ "line", "interpolation" ], [ "lineInterpolation" ] ], [ r, [ "showlegend" ], [ "visibleInLegend" ] ] ];
                toTranslate.forEach(function(d, i) {
                    mu.util.translator.apply(null, d.concat(reverse));
                });
                if (!reverse) {
                    delete r.marker;
                }
                if (reverse) {
                    delete r.groupId;
                }
                if (!reverse) {
                    if (r.type === "scatter") {
                        if (r.mode === "lines") {
                            r.geometry = "LinePlot";
                        } else if (r.mode === "markers") {
                            r.geometry = "DotPlot";
                        } else if (r.mode === "lines+markers") {
                            r.geometry = "LinePlot";
                            r.dotVisible = true;
                        }
                    } else if (r.type === "area") {
                        r.geometry = "AreaChart";
                    } else if (r.type === "bar") {
                        r.geometry = "BarChart";
                    }
                    delete r.mode;
                    delete r.type;
                } else {
                    if (r.geometry === "LinePlot") {
                        r.type = "scatter";
                        if (r.dotVisible === true) {
                            delete r.dotVisible;
                            r.mode = "lines+markers";
                        } else {
                            r.mode = "lines";
                        }
                    } else if (r.geometry === "DotPlot") {
                        r.type = "scatter";
                        r.mode = "markers";
                    } else if (r.geometry === "AreaChart") {
                        r.type = "area";
                    } else if (r.geometry === "BarChart") {
                        r.type = "bar";
                    }
                    delete r.geometry;
                }
                return r;
            });
            if (!reverse && _inputConfig.layout && _inputConfig.layout.barmode === "stack") {
                var duplicates = mu.util.duplicates(outputConfig.dimensions.map(function(d, i) {
                    return d.geometry;
                }));
                outputConfig.dimensions.forEach(function(d, i) {
                    var idx = duplicates.indexOf(d.geometry);
                    if (idx !== -1) {
                        outputConfig.dimensions[i].groupId = idx;
                    }
                });
            }
        }
        if (_inputConfig.layout) {
            var r = mu.util.deepExtend({}, _inputConfig.layout);
            var toTranslate = [ [ r, [ "plot_bgcolor" ], [ "backgroundColor" ] ], [ r, [ "showlegend" ], [ "showLegend" ] ], [ r, [ "radialaxis" ], [ "radialAxis" ] ], [ r, [ "angularaxis" ], [ "angularAxis" ] ], [ r.angularaxis, [ "showline" ], [ "gridLinesVisible" ] ], [ r.angularaxis, [ "showticklabels" ], [ "labelsVisible" ] ], [ r.angularaxis, [ "nticks" ], [ "ticksCount" ] ], [ r.angularaxis, [ "tickorientation" ], [ "tickOrientation" ] ], [ r.angularaxis, [ "ticksuffix" ], [ "ticksSuffix" ] ], [ r.angularaxis, [ "range" ], [ "domain" ] ], [ r.angularaxis, [ "endpadding" ], [ "endPadding" ] ], [ r.radialaxis, [ "showline" ], [ "gridLinesVisible" ] ], [ r.radialaxis, [ "tickorientation" ], [ "tickOrientation" ] ], [ r.radialaxis, [ "ticksuffix" ], [ "ticksSuffix" ] ], [ r.radialaxis, [ "range" ], [ "domain" ] ], [ r.angularAxis, [ "showline" ], [ "gridLinesVisible" ] ], [ r.angularAxis, [ "showticklabels" ], [ "labelsVisible" ] ], [ r.angularAxis, [ "nticks" ], [ "ticksCount" ] ], [ r.angularAxis, [ "tickorientation" ], [ "tickOrientation" ] ], [ r.angularAxis, [ "ticksuffix" ], [ "ticksSuffix" ] ], [ r.angularAxis, [ "range" ], [ "domain" ] ], [ r.angularAxis, [ "endpadding" ], [ "endPadding" ] ], [ r.radialAxis, [ "showline" ], [ "gridLinesVisible" ] ], [ r.radialAxis, [ "tickorientation" ], [ "tickOrientation" ] ], [ r.radialAxis, [ "ticksuffix" ], [ "ticksSuffix" ] ], [ r.radialAxis, [ "range" ], [ "domain" ] ], [ r.font, [ "outlinecolor" ], [ "outlineColor" ] ], [ r.legend, [ "traceorder" ], [ "reverseOrder" ] ], [ r, [ "labeloffset" ], [ "labelOffset" ] ], [ r, [ "defaultcolorrange" ], [ "defaultColorRange" ] ] ];
            toTranslate.forEach(function(d, i) {
                mu.util.translator.apply(null, d.concat(reverse));
            });
            if (!reverse) {
                if (r.angularAxis && typeof r.angularAxis.ticklen !== "undefined") {
                    r.tickLength = r.angularAxis.ticklen;
                }
                if (r.angularAxis && typeof r.angularAxis.tickcolor !== "undefined") {
                    r.tickColor = r.angularAxis.tickcolor;
                }
            } else {
                if (typeof r.tickLength !== "undefined") {
                    r.angularaxis.ticklen = r.tickLength;
                    delete r.tickLength;
                }
                if (r.tickColor) {
                    r.angularaxis.tickcolor = r.tickColor;
                    delete r.tickColor;
                }
            }
            if (r.legend && typeof r.legend.reverseOrder !== "boolean") {
                r.legend.reverseOrder = r.legend.reverseOrder !== "normal";
            }
            if (r.legend && typeof r.legend.traceorder === "boolean") {
                r.legend.traceorder = r.legend.traceorder ? "reversed" : "normal";
                delete r.legend.reverseOrder;
            }
            if (r.margin && typeof r.margin.t !== "undefined") {
                var source = [ "t", "r", "b", "l", "pad" ];
                var target = [ "top", "right", "bottom", "left", "pad" ];
                var margin = {};
                d3.entries(r.margin).forEach(function(dB, iB) {
                    margin[target[source.indexOf(dB.key)]] = dB.value;
                });
                r.margin = margin;
            }
            if (reverse) {
                delete r.needsEndSpacing;
                delete r.minorTickColor;
                delete r.minorTicks;
                if (r.angularaxis) {
                    delete r.angularaxis.ticksCount;
                    delete r.angularaxis.ticksCount;
                    delete r.angularaxis.ticksStep;
                    delete r.angularaxis.rewriteTicks;
                    delete r.angularaxis.nticks;
                }
                if (r.radialaxis) {
                    delete r.radialaxis.ticksCount;
                    delete r.radialaxis.ticksCount;
                    delete r.radialaxis.ticksStep;
                    delete r.radialaxis.rewriteTicks;
                    delete r.radialaxis.nticks;
                }
            }
            outputConfig.layout = r;
        }
        return outputConfig;
    };
    return exports;
};

mu.PolyChart = function module() {
    var config = [ mu.PolyChart.defaultConfig() ];
    var dispatch = d3.dispatch("hover");
    var dashArray = {
        solid: "none",
        dash: [ 5, 2 ],
        dot: [ 2, 5 ]
    };
    var colorScale;
    function exports() {
        var geometryConfig = config[0].geometryConfig;
        var container = geometryConfig.container;
        if (typeof container === "string") {
            container = d3.select(container);
        }
        container.datum(config).each(function(_config, _index) {
            var isStack = !!_config[0].dimensions.yStack;
            var dimensions = _config.map(function(d, i) {
                if (isStack) {
                    return d3.zip(d.dimensions.t[0], d.dimensions.r[0], d.dimensions.yStack[0]);
                } else {
                    return d3.zip(d.dimensions.t[0], d.dimensions.r[0]);
                }
            });
            var angularScale = geometryConfig.angularScale;
            var domainMin = geometryConfig.radialScale.domain()[0];
            var generator = {};
            generator.bar = function(d, i, pI) {
                var dimensionsConfig = _config[pI].dimensions;
                var h = geometryConfig.radialScale(d[1]) - geometryConfig.radialScale(0);
                var stackTop = geometryConfig.radialScale(d[2] || 0);
                var w = dimensionsConfig.barWidth;
                d3.select(this).attr({
                    "class": "mark bar",
                    d: "M" + [ [ h + stackTop, -w / 2 ], [ h + stackTop, w / 2 ], [ stackTop, w / 2 ], [ stackTop, -w / 2 ] ].join("L") + "Z",
                    transform: function(d, i) {
                        return "rotate(" + (geometryConfig.orientation + angularScale(d[0])) + ")";
                    }
                });
            };
            generator.dot = function(d, i, pI) {
                var stackeddimensions = d[2] ? [ d[0], d[1] + d[2] ] : d;
                var symbol = d3.svg.symbol().size(_config[pI].dimensions.dotSize).type(_config[pI].dimensions.dotType)(d, i);
                d3.select(this).attr({
                    "class": "mark dot",
                    d: symbol,
                    transform: function(d, i) {
                        var coord = convertToCartesian(getPolarCoordinates(stackeddimensions));
                        return "translate(" + [ coord.x, coord.y ] + ")";
                    }
                });
            };
            var line = d3.svg.line.radial().interpolate(_config[0].dimensions.lineInterpolation).radius(function(d) {
                return geometryConfig.radialScale(d[1]);
            }).angle(function(d) {
                return geometryConfig.angularScale(d[0]) * Math.PI / 180;
            });
            generator.line = function(d, i, pI) {
                var linedimensions = d[2] ? dimensions[pI].map(function(d, i) {
                    return [ d[0], d[1] + d[2] ];
                }) : dimensions[pI];
                d3.select(this).each(generator.dot).style({
                    opacity: function(dB, iB) {
                        return +_config[pI].dimensions.dotVisible;
                    },
                    fill: markStyle.stroke(d, i, pI)
                }).attr({
                    "class": "mark dot"
                });
                if (i > 0) {
                    return;
                }
                var lineSelection = d3.select(this.parentNode).selectAll("path.line").dimensions([ 0 ]);
                lineSelection.enter().insert("path");
                lineSelection.attr({
                    "class": "line",
                    d: line(linedimensions),
                    transform: function(dB, iB) {
                        return "rotate(" + (geometryConfig.orientation + 90) + ")";
                    },
                    "pointer-events": "none"
                }).style({
                    fill: function(dB, iB) {
                        return markStyle.fill(d, i, pI);
                    },
                    "fill-opacity": 0,
                    stroke: function(dB, iB) {
                        return markStyle.stroke(d, i, pI);
                    },
                    "stroke-width": function(dB, iB) {
                        return markStyle["stroke-width"](d, i, pI);
                    },
                    "stroke-dasharray": function(dB, iB) {
                        return markStyle["stroke-dasharray"](d, i, pI);
                    },
                    opacity: function(dB, iB) {
                        return markStyle.opacity(d, i, pI);
                    },
                    display: function(dB, iB) {
                        return markStyle.display(d, i, pI);
                    }
                });
            };
            var angularRange = geometryConfig.angularScale.range();
            var triangleAngle = Math.abs(angularRange[1] - angularRange[0]) / dimensions[0].length * Math.PI / 180;
            var arc = d3.svg.arc().startAngle(function(d) {
                return -triangleAngle / 2;
            }).endAngle(function(d) {
                return triangleAngle / 2;
            }).innerRadius(function(d) {
                return geometryConfig.radialScale(domainMin + (d[2] || 0));
            }).outerRadius(function(d) {
                return geometryConfig.radialScale(domainMin + (d[2] || 0)) + geometryConfig.radialScale(d[1]);
            });
            generator.arc = function(d, i, pI) {
                dd = d[0];
                asd =angularScale(dd)
                g = geometryConfig.orientation + asd + 90;
                d3.select(this).attr({
                    "class": "mark arc",
                    d: arc,
                    transform: function(d, i) {
                        return "rotate(" + (g) + ")";
                    }
                });
            };
            var pieArc = d3.svg.arc().outerRadius(geometryConfig.radialScale.range()[1]);
            var pie = d3.layout.pie().value(function(d) {
                return d[1];
            });
            var piedimensions = pie(dimensions[0]);
            generator.pie = function(d, i, pI) {
                d3.select(this).attr({
                    "class": "mark arc",
                    d: pieArc(piedimensions[i], i)
                });
            };
            var markStyle = {
                fill: function(d, i, pI) {
                    return _config[pI].dimensions.color;
                },
                stroke: function(d, i, pI) {
                    return _config[pI].dimensions.strokeColor;
                },
                "stroke-width": function(d, i, pI) {
                    return 0;
                    //return _config[pI].dimensions.strokeSize + "px";  HACK
                },
                "stroke-dasharray": function(d, i, pI) {
                    return dashArray[_config[pI].dimensions.strokeDash];
                },
                opacity: function(d, i, pI) {
                    return _config[pI].dimensions.opacity;
                },
                display: function(d, i, pI) {
                    return typeof _config[pI].dimensions.visible === "undefined" || _config[pI].dimensions.visible ? "block" : "none";
                }
            };
            var geometryLayer = d3.select(this).selectAll("g.layer").dimensions(dimensions);
            geometryLayer.enter().append("g").attr({
                "class": "layer"
            });
            var geometry = geometryLayer.selectAll("path.mark").dimensions(function(d, i) {
                return d;
            });
            geometry.enter().append("path").attr({
                "class": "mark"
            });
            geometry.style(markStyle).each(generator[geometryConfig.geometryType]);
            geometry.exit().remove();
            geometryLayer.exit().remove();
            function getPolarCoordinates(d, i) {
                var r = geometryConfig.radialScale(d[1]);
                var t = (geometryConfig.angularScale(d[0]) + geometryConfig.orientation) * Math.PI / 180;
                return {
                    r: r,
                    t: t
                };
            }
            function convertToCartesian(polarCoordinates) {
                var x = polarCoordinates.r * Math.cos(polarCoordinates.t);
                var y = polarCoordinates.r * Math.sin(polarCoordinates.t);
                return {
                    x: x,
                    y: y
                };
            }
        });
    }
    exports.config = function(_x) {
        if (!arguments.length) {
            return config;
        }
        _x.forEach(function(d, i) {
            if (!config[i]) {
                config[i] = {};
            }
            mu.util.deepExtend(config[i], mu.PolyChart.defaultConfig());
            mu.util.deepExtend(config[i], d);
        });
        return this;
    };
    exports.getColorScale = function() {
        return colorScale;
    };
    d3.rebind(exports, dispatch, "on");
    return exports;
};

mu.PolyChart.defaultConfig = function() {
    var config = {
        dimensions: {
            name: "geom1",
            t: [ [ 1, 2, 3, 4 ] ],
            r: [ [ 1, 2, 3, 4 ] ],
            dotType: "circle",
            dotSize: 64,
            dotVisible: false,
            barWidth: 20,
            color: "#ffa500",
            strokeSize: 1,
            strokeColor: "silver",
            strokeDash: "solid",
            opacity: 1,
            index: 0,
            visible: true,
            visibleInLegend: true
        },
        geometryConfig: {
            geometry: "LinePlot",
            geometryType: "arc",
            direction: "clockwise",
            orientation: 0,
            container: "body",
            radialScale: null,
            angularScale: null,
            colorScale: d3.scale.category20()
        }
    };
    return config;
};
