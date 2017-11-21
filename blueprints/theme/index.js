
module.exports = {
  description: 'Generates theme directory with default files.',

  beforeInstall: function(options) {
    if (options.args.length < 2) {
      throw new Error("nullbase-theme-service theme generator requires a theme name.");
    }

    const theme = options.args[1];

    if (!/^[a-zA-Z0-9-]+$/.test(theme)) {
      throw new Error(theme + ' is not a valid theme name.');
    }
  }
};
