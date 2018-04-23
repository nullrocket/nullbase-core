/* jshint node: true */
'use strict';
var path = require('path');
var jsonfile = require('jsonfile');
var XXH = require('xxhashjs').h32;
var fse = require('fs-extra');
var currentFingerprint = '';
var reload = require('require-reload')(require);
var _ = require('lodash');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');

var walk = function ( dir, done ) {
  var results = [];
  fse.readdir(dir, function ( err, list ) {
    if ( err ) return done(err);
    var i = 0;
    (function next() {
      var file = list[ i++ ];
      if ( !file ) return done(null, results);
      file = dir + '/' + file;
      fse.stat(file, function ( err, stat ) {
        if ( stat && stat.isDirectory() ) {
          walk(file, function ( err, res ) {
            results = results.concat(res);
            next();
          });
        }
        else {
          results.push(file);
          next();
        }
      });
    })();
  });
};
var selfx = null;
module.exports = {
  name: 'nullbase-core',
  init: function(){
    this._super.init && this._super.init.apply(this, arguments);
    selfx = this;
  },

  options: {
    nodeAssets: {
      'tether': {
        srcDir: 'dist/js',
        destDir :'tether',
        vendor: [ 'tether.js' ]


      }
    }
  },

  included: function ( app ) {
    if ( typeof app.import !== 'function' && app.app ) {
      app = app.app;
    }
    app.import('vendor/setImmediate.js');
    app.import('vendor/intersection-observer.js');
   app.import('vendor/tether/tether.js');
    selfx.app = app;

  },
  preBuild: function () {

    var self = selfx;
    if ( self.app.project.pkg[ 'ember-addon' ] && !self.app.project.pkg[ 'ember-addon' ].paths ) {
      self.iconDirectory = path.resolve(self.app.project.root, path.join('tests', 'dummy', 'app', 'icons'));
      self.styleDirectory = path.resolve(self.app.project.root, path.join('tests', 'dummy', 'app', 'styles'));
      self.publicDirectory = path.resolve(self.app.project.root, path.join('tests', 'dummy', 'public', 'nullbase-icons'));
    }
    else {
      self.iconDirectory = path.join(self.app.project.root, 'app', 'icons');
      self.styleDirectory = path.join(self.app.project.root, 'app', 'styles');
      self.publicDirectory = path.join(self.app.project.root, 'public', 'nullbase-icons');
    }
    //var nullbaseTheme = this.addonsFactory.project.config(process.env.EMBER_ENV).nullbaseTheme;


    var fingerPrint = "";
    var allIcons = [];
    walk(self.iconDirectory, function ( err, results ) {
      allIcons = _.map(results, function ( file ) {
        return reload(file);
      });
      fingerPrint = XXH(_.join(JSON.stringify(allIcons)), 0xCAFEBABE).toString(16);


      var icons = _.flatten(_.map(allIcons, function ( icons ) {
        return icons.icons;
      }));


      if ( fingerPrint !== currentFingerprint ) {
        currentFingerprint = fingerPrint;
        var p = path.join(__dirname, "addon/svg");
        var dataURIFileContent = '';
        var externalSVGFileContent = '';
        let svgMapContent = '';
        let svgMapSymbolAttributes  = 'version="1.1" baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enable-background="new 0 0 24.00 24.00" xml:space="preserve"';
        let svgMapStart = '<?xml version="1.0" encoding="utf-8"?> <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"> <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
        let svgMapEnd = "\n</svg>";
        var includeIcon = function ( icons, name ) {
          return !!_.find(icons, function ( icon ) {
            return name === icon.name;
          });

        };
        var getColors = function ( icons, name ) {
          var icon = _.find(icons, function ( icon ) {
            return name === icon.name;
          });
          if ( icon ) {
            return icon.colors;
          }
          else {
            return [];
          }

        };
        fse.readdir(p, function ( err, files ) {
          if ( err ) {
            throw err;
          }

          files.map(function ( file ) {

            return path.join(p, file);
          }).filter(function ( file ) {
            return fse.statSync(file).isFile() && path.extname(file) === '.svg' && includeIcon(icons, path.basename(file, '.svg'));
          }).forEach(function ( file ) {
            var colors = getColors(icons, path.basename(file, '.svg'));
            let svgSymbol = fse.readFileSync(file, "utf8");
            svgSymbol = "<symbol "+ svgMapSymbolAttributes+" id=\""+path.basename(file,'.svg')+"\">\n"+svgSymbol.match(/<path\b([\s\S]*?)\/>/g).join("").replace(/(fill)[\s]*=[\s]*"[^"]+"|(fill)[\s]*=[\s]*\x27[^\']+\x27 | (fill)[\s]*=[\s]*[^\'\s]+/, ' fill="currentColor" ')+"\n</symbol>\n";
            svgMapContent += svgSymbol;
            _.each(colors, function ( color ) {
              var temp = fse.readFileSync(file, "utf8");

             temp = temp.replace(/(fill)[\s]*=[\s]*"[^"]+"|(fill)[\s]*=[\s]*\x27[^\']+\x27 | (fill)[\s]*=[\s]*[^\'\s]+/, ' fill="' + color.color + '" ')







             // dataURIFileContent += "." + path.basename(file, '.svg') + "-" + color.name + " { \n background-image: url('data:image/svg+xml;charset=US-ASCII," + encodeURIComponent(temp) + "');\nbackground-repeat: no-repeat;\n background-size:contain;\n }\n\n";

              fse.ensureDirSync(self.publicDirectory);
              fse.removeSync(self.publicDirectory + '/' + path.basename(file, '.svg') + "-" + color.name + ".svg");
              fse.writeFileSync(self.publicDirectory + '/' + path.basename(file, '.svg') + "-" + color.name + ".svg", temp);

            });



          });
          fse.removeSync(self.publicDirectory + '/svg-map.svg');
          fse.writeFileSync(self.publicDirectory + '/svg-map.svg', svgMapStart+svgMapContent+svgMapEnd);



        });

      }
    });
  }
};