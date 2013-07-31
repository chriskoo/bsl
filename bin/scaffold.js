/*
 * copy scaffold resource to dest directory, using underscore template
 */

function mustache_scaffold(src, dest, obj) {
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