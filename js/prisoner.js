System.register((void 0), [], function() {
  "use strict";
  var DEFECT = 1,
      COOPERATE = 0;
  function play(p1, p2, rounds, history) {
    history = history ? history : [[], []];
    var p1d = p1(history[1]),
        p2d = p2(history[0]);
    history[0].push(p1d);
    history[1].push(p2d);
    if (rounds > 1) {
      return play(p1, p2, rounds - 1, history);
    } else {
      return history;
    }
  }
  function score(history) {
    return _.zip(history[0], history[1]).reduce(function(tally, game) {
      switch (game[0] + game[1]) {
        case COOPERATE + COOPERATE:
          return tally.map((function(x) {
            return x + 1;
          }));
        case DEFECT + COOPERATE:
        case COOPERATE + DEFECT:
          if (game[1]) {
            tally[1] += 0.5;
            tally[0] += 5;
          } else {
            tally[0] += 0.5;
            tally[1] += 5;
          }
          return tally.map((function(x) {
            return x;
          }));
        case DEFECT + DEFECT:
          return tally.map((function(x) {
            return x + 4.5;
          }));
      }
    }, [0, 0]);
  }
  function series(p1, p2, rounds) {
    return [[p1, p2], score(play(p1, p2, rounds)), rounds];
  }
  function tournament(players, rounds) {
    return players.reduce(function(outcomes, p1, i, players) {
      return outcomes.concat(players.slice(i + 1).map(function(p2, ii) {
        return push(series(p1, p2, rounds), [i, i + ii + 1]);
      }));
    }, []);
  }
  function push(array, item) {
    var a = array.slice(0);
    a.push(item);
    return a;
  }
  function tally(tournament) {
    return tournament.reduce(function(tally, series) {
      tally[series[3][0]] += series[1][0];
      tally[series[3][1]] += series[1][1];
      return tally;
    }, _.uniq(_.flatten(_.pluck(tournament, 3))).map((function(x) {
      return 0;
    })));
  }
  function fittest(tally) {
    return tally.indexOf(Math.min.apply({}, tally));
  }
  function weakest(tally) {
    return tally.indexOf(Math.max.apply({}, tally));
  }
  function cull(index, moralities) {
    return moralities.filter((function(x, i) {
      return i != index;
    }));
  }
  function multiply(index, moralities) {
    return push(moralities, moralities[index]);
  }
  function evolve(moralities, tally) {
    var w = weakest(tally),
        f = fittest(tally);
    return _.shuffle(multiply(f > w ? f - 1 : f, cull(w, moralities)).slice(0));
  }
  function diversity(moralities) {
    return _.uniq(moralities).length;
  }
  function repeat(item, l) {
    var a = [];
    for (var i = 0; i < l; i++) {
      a.push(item);
    }
    return a;
  }
  function survival(moralities, communitySize, id) {
    var done,
        progress,
        generation,
        t,
        rest = Array.prototype.slice.call(arguments, 3);
    switch (rest.length) {
      case 1:
        done = rest[0];
        progress = null;
        generation = 0;
        break;
      case 2:
        done = rest[0];
        progress = rest[1];
        generation = 0;
        break;
      default:
        done = rest[1];
        progress = rest[2];
        generation = rest[0];
    }
    if (communitySize > 1) {
      moralities = _.flatten(moralities.map((function(x) {
        return repeat(x, communitySize);
      })));
    }
    if (diversity(moralities) > 1) {
      t = tally(tournament(moralities, 50 + Math.random() * 50));
      typeof progress == 'function' ? progress(moralities, t, generation, id) : null;
      setTimeout(function() {
        survival(evolve(moralities, t), 1, id, generation += 1, done, progress);
      }, 0);
    } else {
      done(moralities);
    }
  }
  return {};
});
