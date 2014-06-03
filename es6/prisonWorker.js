postMessage({type: 'log', message: 'initialized worker'});
importScripts('underscore.js', 'prisoner.js', 'moralities.js');
addEventListener('message', function(e) {
    postMessage({type: 'init', message: moralities().map(x => x.name), id: e.data.id});
    survival(moralities(), e.data.communitySize, e.data.id, function (moralities) {
        postMessage({type: 'result', id: e.data.id, message: moralities.map(x => x.name)});
    }, function (moralities, tally, generation, id) {
        postMessage({type: 'playby', message: _.zip(moralities.map(x => x.name), tally), generation: generation, id: id});
    });
}, false);