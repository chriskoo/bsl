#!/usr/bin/env node

var program = require('commander'),
  util = require('util'),
  path = require('path'),
  ncp = require('ncp').ncp,
  express = require('express'),
  fs = require('fs'),
  https = require('https'),
  mkdirp = require('mkdirp'),
  _ = require('underscore'),
  rimraf = require('rimraf'),
  AdmZip = require('adm-zip'),
  request = require('request'),
  exec = require("child_process").exec,
  pkg = require('../package.json'),
  version = pkg.version;

console.log('Cube Framework SDK v' + version);
console.log('current path: %s', path.resolve('.'));
console.log('sdk path: %s', path.resolve(__dirname));


function cloneCube(dest, fn) {
  cp(path.resolve(__dirname, '..', 'src'), path.resolve(dest, 'cube'), function(){
    fn && fn();
  });
}


program.option('-c, --compass', 'compass when possible');

program
  .command('app <name>')
  .description('create a new application')
  .action(function(name) {

  var app_fullpath = path.resolve('.', name);

  function createApp() {
    cloneCube(app_fullpath, function(error, stdout, stderr) {

      scaffold('index.html', path.resolve(app_fullpath, 'index.html'), {});
    });
  }

  fs.exists(app_fullpath, function(exists) {
    if (exists) {
      program.confirm('directory not empty, continue? ', function(ok) {
        if (ok) {
          createApp();
        } else {
          console.log('exit.');
        }
      });
    } else {
      mkdir(app_fullpath, function() {
        createApp();
      });
    }
  });
});

//TODO: 淡化module概念
program
  .command('module <identifier>')
  .description('create a new module')
  .action(function(identifier) {
  mkdir(path.resolve('.', identifier), function() {

  });
});

/*
 * copy scaffold resource to dest directory, using underscore template
 */

function scaffold(src, dest, obj) {
  console.log('   \033[36mgenerate\033[0m : ' + dest);
  fs.readFile(path.resolve(__dirname, '..', 'scaffold', src), {
    encoding: 'utf-8'
  }, function(err, data) {
    if (err) throw err;
    var compiled = _.template(data);
    //write
    fs.writeFile(dest, compiled(obj), {
      encoding: 'utf-8'
    });
  });
}

program
  .command('view <module> <name>')
  .description('generate view')
  .action(function(module, name) {
  //remove tail slash
  if (endsWith(module, '/')) module = module.substring(0, module.length - 1);
  var data = {
    module: module,
    view: name
  };
  scaffold('view.html', path.resolve('.', module, name + '.html'), data);
  scaffold('view.js', path.resolve('.', module, name + '.js'), data);
});

program
  .command('package <module>')
  .description('package module')
  .action(function(moduleId) {
  //remove tail slash
  if (endsWith(moduleId, '/')) moduleId = moduleId.substring(0, moduleId.length - 1);

  console.log('user require compass: ' + program.compass);

  //check default view
  var default_view;
  var json = require(path.resolve('.', moduleId, 'CubeModule.json'));
  if (json) default_view = json.defaultView || json.defaultPage;
  console.log('default view: %s', default_view);

  pack(moduleId, moduleId, moduleId, 'module.js');
});

program
  .command('server')
  .description('run a http server at port 3000')
  .action(runServer);

program
  .command('chrome')
  .description('start chrome browser with --disable-web-security option')
  .action(function() {
  exec('open -a Google\\ Chrome --args --disable-web-security', function(error, stdout, stderr) {
    if (error) throw error;
  });
});

/**
 * compass js files into one js file
 *
 * @param folder folder contains js files
 * @param configFolder where CubeModule.json is
 * @param targetFileName target js file name
 */

function pack(folder, configFolder, requirePrefix, targetFileName, capitalizeKey) {
  //remove tail slash
  if (endsWith(folder, '/')) folder = folder.substring(0, folder.length - 1);

  console.log('user require compass: ' + program.compass);

  //check default view
  var default_view;
  var json = require(path.resolve('.', configFolder, 'CubeModule.json'));
  if (json) default_view = json.defaultView || json.defaultPage;
  console.log('default view: %s', default_view);

  if (fs.existsSync(path.resolve('.', folder, targetFileName))) {
    fs.unlinkSync(path.resolve('.', folder, targetFileName));
  }
  fs.readdir(path.resolve('.', folder), function(err, files) {
    var jsFiles = _.filter(files, function(file) {
      return endsWith(file, '.js');
    });
    console.log('build files: %s', jsFiles);

    //define start
    var ct = ['define(function(require) {'];

    //require define
    _.each(jsFiles, function(file, index) {
      ct.push(util.format("  var v%d = require('%s/%s');", index, requirePrefix, file.substr(0, file.length - 3)));
    });

    //return define
    ct.push('  return {');

    //default view
    if (default_view) {
      var index = jsFiles.indexOf(default_view + '.js');
      ct.push(util.format("    'default': v%s,", index));
    }

    _.each(jsFiles, function(file, index) {
      var key = file.substr(0, file.length - 3);
      key = capitalizeKey ? capitalize(key) : key;
      ct.push(util.format("    '%s': v%d%s", key, index, (index === jsFiles.length - 1 ? '' : ',')));
    });
    ct.push('  };');
    //define end
    ct.push('});');

    fs.writeFile(path.resolve('.', folder, targetFileName), ct.join('\n'), function(err) {
      if (err) throw err;
      console.log('\033[36mcreate\033[0m %s/%s', folder, targetFileName);

      var zip = new AdmZip();
      zip.addLocalFolder(path.resolve('.', folder));
      zip.writeZip(path.resolve('.', 'dist', folder + '.zip'), function() {
        console.log('archive module %s', folder);
      }); //write zip

      //TODO: upload to server
    }); //write

  }); //readdir
}

program
  .command('build-cube')
  .description('build cube framework')
  .action(function() {
  console.log('build cube framework');
  pack('js', '', 'cube', 'cube.js', true);
});

program.parse(process.argv);

function runServer() {
  var app = express();
  app.use(express.static(path.resolve('.')));
  app.listen(3000);
  console.log('Cube Server Started, listening at 3000...');
}

/**
 * copy directory recursive
 */

function cp(src, dest, fn) {
  ncp(src, dest, function(err) {
    if (err) throw err;
    console.log('    \033[36m copy\033[0m : %s \033[36mto\033[0m : %s', src, dest);
    fn && fn();
  });
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(path, fn) {
  mkdirp(path, 0755, function(err) {
    if (err) throw err;
    console.log('   \033[36mcreate\033[0m : ' + path);
    fn && fn();
  });
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}