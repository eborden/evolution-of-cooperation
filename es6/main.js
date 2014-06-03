var loaders = [],
    workers = [];
function worker (script, callback, error, always) {
    var w;
    if (typeof script == 'function') {
        script = window.URL.createObjectURL(new Blob(['onmessage = ' + script.toString()]));
    }
    w = new Worker(script);
    w.addEventListener('message', callback);
    w.addEventListener('error', error);
    w.addEventListener('always', always);
    return w;
}
function log (m) {
    console ? console.log(m) : '';
}
function loader () {
    var l = ['|', '/', '--', '\\'],
        i = 0;
    l = ['....', '*...', '.*..', '..*.', '...*'];
    return function (text) {
        var m = text + l[i];
        if (++i >= l.length) {
            i = 0;
        }
        return m;
    };
};
function workerMessage (simulations) {
    return function (e) {
        switch(e.data.type) {
            case 'log':
                log(e.data.message);
                break;
            case 'init':
                document.getElementById('survive' + e.data.id).innerHTML = loaders[e.data.id]();
                break;
            case 'playby':
                var population = e.data.message.length,
                    data = _.groupBy(e.data.message, 0),
                    widths = _.reduce(_.map(moralities(), x => x.name), function (o, name) {
                        o[name] = data[name] ? Math.floor(data[name].length / population * 100) : 0;
                        return o;
                    }, {}),
                    total = _.reduce(widths, (x, y) => x + y);
                if (total !== 100) {
                    widths[_.keys(widths)[0]] += 100 - total;
                }
                log(_.reduce(widths, (x, y) => x + y));
                _.forEach(moralities().map(x => x.name), function (name) {
                    simulations[e.data.id].getElementsByClassName(name)[0].style.width = widths[name] + '%';
                });
                simulations[e.data.id].getElementsByTagName('var')[0].textContent = e.data.generation;
                document.getElementById('survive' + e.data.id).innerHTML = [
                        loaders[e.data.id]('evolving'),
                        _.map(data, (x, k) => [k, x.length].join(': ')).sort().join('; '),
                        'generation:',
                        e.data.generation
                    ].join(' ');
                break;
            case 'result':
                document.getElementById('survive' + e.data.id).innerHTML = e.data.message.join(', ');
                var winner = _.unique(e.data.message)[0];
                _.forEach(moralities().map(x => x.name), function (name) {
                    simulations[e.data.id].getElementsByClassName(name)[0].style.width = name == winner ? 100 + '%' : 0;
                });
                break;
        }
    }
}

function create (o) {
    var el = document.createElement(o.tag);
    el.className = coalesce(o.className, '');
    el.id = coalesce(o.id, '');
    if (o.innerHTML) el.innerHTML = o.innerHTML;
    if (!_.isUndefined(o.text)) el.textContent = o.text, '';
    _.rest(arguments).forEach(function (child) {
        el.appendChild(child);
    })
    return el;
}

function coalesce () {
    return _.find(Array.prototype.slice.call(arguments, 0), x => !_.isUndefined(x));
}

var getColor = (function () {
    var i = 1;
    return function () {
        if (i > 5) {
            i = 1;
        }
        return 'color-' + i++;
    };
}());

function camelToSpace (text) {
    return text.replace(/([A-Z])/g, ' $1');
}

function setupSimulation() {
    var i = 5,
        simulations = [],
        simulationsEl = document.getElementById('simulations'),
        consoleEl = document.getElementById('console'),
        w = worker('prisonWorker.js', workerMessage(simulations), log, log),
        morlts = moralities();
    simulations[i] = create({tag: 'div', className: 'simulation'});
    morlts.forEach(function (m) {
        var d = create({tag: 'div', className: m.name + ' ' + getColor()},
            create({tag: 'h2', text: camelToSpace(m.name)}), create({tag: 'article'},
                create({tag: 'p', text: m.description})));
        d.style.width = (100 / morlts.length) + '%';
        simulations[i].appendChild(d);
    });
    simulations[i].appendChild(create({tag: 'var', text: 0}));
    simulationsEl.appendChild(simulations[i]);
    consoleEl.appendChild(create({tag: 'p', id: 'survive' + i}));
    loaders[i] = loader();
    
    
    return function () {
        simulations[i].className += ' running';
        w.postMessage({id: i, communitySize: i});
    }
}

function resize () {
    setTimeout(function () {
        document.getElementsByTagName('header')[0].style.height = window.innerHeight + 'px';
        _.toArray(document.getElementsByTagName('section')).forEach(x => x.style.minHeight = window.innerHeight + 'px');
    }, 0);
}

var scrollTop = (function () {
    var scrollSteps = [];
    function scroll () {
        if (window.scrollY !== position) {
            window.scroll(0, window.scrollY + speed);
            scrollTimer = setTimeout(function () {
                scrollTop(position, speed);
            }, 1);        
        }
    }
    return function scrollTop (position, speed) {
        if (scrollTimer) {
            cancelTimeout(scrollTimer);
        };
        if (!speed) {
            speed = (position - window.scrollY) / 25;
        }
        scrollSteps = _.each(repeat(0, 5), x => x);
    }
}());

var runSimulation = setupSimulation();

document.getElementById('run-simulation').addEventListener('click', function (e) {
    e.preventDefault();
    runSimulation();
    this.style.opacity = 0;
});

resize();
window.addEventListener('resize', resize);

/*_.each(document.querySelectorAll('nav a'), function (x) { x.addEventListener('click', function (e) {
        e.preventDefault();
        scrollTop(document.querySelector('[name="' + this.getAttribute('href').substring(1) + '"]').parentNode.offsetTop);
    });
});*/