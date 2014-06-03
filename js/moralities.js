function moralities() {
  function describe(fun, description) {
    fun.description = description;
    return fun;
  }
  return [describe(function titForTat(opponentHistory, myHistory) {
    if (_.last(opponentHistory) === DEFECT) {
      return DEFECT;
    } else {
      return COOPERATE;
    }
  }, 'Tit For Tat is nice, but doesn\'t take any guff.'), describe(function lama(opponentHistory, myHistory) {
    return COOPERATE;
  }, 'The embodyment of compassion. The lama doesn\'t hurt a fly.'), describe(function demon(opponentHistory, myHistory) {
    return DEFECT;
  }, 'Mean to the core, Demon defects till the cows come home.'), describe(function() {
    var i = true,
        gen = function() {
          if (i) {
            return COOPERATE;
          } else {
            return DEFECT;
          }
          i = !i;
        };
    return function niceFlipFlop(opponentHistory, myHistory) {
      return gen();
    };
  }(), 'Nice Flip Flop wants to be good, but just can\'t make up its mind.'), describe(function() {
    var i = true,
        gen = function() {
          if (i) {
            return DEFECT;
          } else {
            return COOPERATE;
          }
          i = !i;
        };
    return function meanFlipFlop(opponentHistory, myHistory) {
      return gen();
    };
  }(), 'Mean Flip Flop has anger management issues, but he\'s working on it.'), describe(function niceRandom(opponentHistory, myHistory) {
    return Math.random() > .3 ? COOPERATE : DEFECT;
  }, 'You can never predict what will come out of Nice Random, but being nice would be a good guess.'), describe(function meanRandom(opponentHistory, myHistory) {
    return Math.random() < .3 ? COOPERATE : DEFECT;
  }, 'You can never predict what will come out of Nice Random, but being mean would be a good guess.'), describe(function random(opponentHistory, myHistory) {
    return Math.round(Math.random()) ? DEFECT : COOPERATE;
  }, 'Just plain random, there is no predicting this one.')];
}
