module.exports = {
  findDistance: (pos1, pos2) => {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2))
  },

  limitPositions: (x,y,r) => {
    x = Math.max(r, Math.min(x, (settings.width - r)));
    y = Math.max(r, Math.min(y, (settings.height - r)));
    return [x,y];
  },

  chooseOne: (args) => {
    args = Array.prototype.slice.call(arguments);
    if(args.length === 1 && typeof Array.isArray(args[0])) {
      return args[0][Math.floor(Math.random() * args[0].length)]
    }
    return args[Math.floor(Math.random() * args.length)];
  },

}