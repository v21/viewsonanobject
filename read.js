var fs = require('fs-extra');
var _ = require("underscore");
var randomFile = require('select-random-file')
var filetry;




randomFile('NTU3D', (err, file) => {
	filetry = file.substring(0, file.length - 4);
	console.log(filetry)
	fs.mkdir("output/" + filetry);
	callFile(filetry);

	fs.copySync('template/', "output/" + filetry);
});



function callFile(file){
	fs.readFile('NTU3D/' + file + ".obj", 'utf8', function (error, data) {
		var here = data;
		here = here.split(/\r?\n/);

		done(here, "original");

		var parsed = parseFile(here);


		var process = "truncate";
		var truncations = 20;//_.random(15,25);
		for (var i = truncations; i >= 0; i--) {
			done(_.first(here, (i/truncations)*here.length) , process + i);
		}


		var process = "shuffle";
		var here2 = shuffle(here); //shuffle lines randomly
		done(here2, process);

		var process = "perturb";
		for (x=0; x<here.length; x++){
			here2[x] = perturb(here[x], x); //randomize individual points
			if (x == here.length-1){
				done(here2, process);
			}

		}
		var process = "sort";
		var here2 = here.sort(); // sort in numerical order
		done(here2, process);


		generateBook(parsed);

	});



}




var parseFile = function(lines)
{

var parseString = {
files: {
	original_file: filetry + "_original_edit.obj",
	perturbed_file: filetry + "_perturb_edit.obj",
	shuffled_file: filetry + "_shuffle_edit.obj",
	sorted_file: filetry + "_sort_edit.obj",
},
metadata: {
	name: filetry,
	groups: [],
	use_material: [],
//	comments: [],
	mtl_lib: [],
}
}
		_.each(lines, line => {

			if (line.startsWith("mtllib "))
			{
				parseString.metadata.mtl_lib.push(line.substring(7));
			}
/*
			if (line.startsWith("# "))
			{
				parseString.metadata.comments.push(line.substring(2));
			}
*/
			if (line.startsWith("g "))
			{
				parseString.metadata.groups.push(line.substring(2));
			}

			if (line.startsWith("usemtl "))
			{
				parseString.metadata.use_material.push(line.substring(7));
			}
		});
			writeJson(parseString);

	return parseString;
}



function perturb(line, row){
line = line.split(" ");

for (d=0; d<line.length; d++){

if (line[d].match(/[-]?(\d*\.)?\d+/g)){
//line[d] = Number(line[d]) + Math.random()*d*(row*0.001); 
line[d] = Number(line[d]) + (row*0.001); 
}
}
line = line.join(" ");
return line;
}


function shuffle(array) {
var currentIndex = array.length, temporaryValue, randomIndex;

while (0 !== currentIndex) {

randomIndex = Math.floor(Math.random() * currentIndex);
currentIndex -= 1;

temporaryValue = array[currentIndex];
array[currentIndex] = array[randomIndex];
array[randomIndex] = temporaryValue;
}

return array;
}



function generateBook(parsed)
{
	var original_file = filetry + "_original_edit.obj";
	var perturbed_file = filetry + "_perturb_edit.obj";
	var shuffled_file = filetry + "_shuffle_edit.obj";
	var sorted_file = filetry + "_sort_edit.obj";

	pages = [];

	//basic model
	pages.push({model : original_file, randomRot: false});

	//with a rotation
	var rng1 = Math.random();
	//basic model
	pages.push({model : original_file, rng : rng1, randomRot: true});

	//with a rotation
	var rng2 = Math.random();
	//basic model
	pages.push({model : original_file, rng : rng2, randomRot: true});


	//with a rotation
	var rng3 = Math.random();
	//basic model
	pages.push({model : original_file, rng : rng3, randomRot: true});


	_.times(20, function(i){
		pages.push({model : filetry + "_truncate" + (i + 1) + "_edit.obj", randomRot: false});
	});

	//slices of basic model
	var sliceCount = _.random(5,25);
	_.times(sliceCount, function(i){
		pages.push({model : original_file, randomRot: false, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})


	_.times(sliceCount, function(i){
		pages.push({model : original_file, rng : rng1, randomRot: true, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})



	_.times(sliceCount, function(i){
		pages.push({model : original_file, rng : rng2, randomRot: true, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})


	_.times(sliceCount, function(i){
		pages.push({model : original_file, rng : rng3, randomRot: true, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})

	if (parsed.metadata.groups.length > 1)
	{
		_.times(parsed.metadata.groups.length, function(i){
			pages.push({model : original_file, showSingleGroup: true, group: i, rng : rng1, randomRot: false});
		});	
	}

	

	//multiple models!
	var count = _.random(2, 10);

	//with a rotation
	var rng1 = Math.random();
	//basic model
	pages.push({model : original_file, rng : rng1, randomRot: true, count : count});


	_.times(sliceCount, function(i){
		pages.push({model : original_file, rng : rng1, randomRot: true, count : count, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})

	

	//multiple models!
	var count = _.random(30, 100);

	//with a rotation
	var rng1 = Math.random();
	//basic model
	pages.push({model : original_file, rng : rng1, randomRot: true, count : count});

	//slices of basic model
	var sliceCount = _.random(5,25);
	_.times(sliceCount, function(i){
		pages.push({model : original_file, rng : rng1, randomRot: true, count : count, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})



	pages.push({model : perturbed_file, randomRot: true});
	pages.push({model : shuffled_file, randomRot: true});
	pages.push({model : sorted_file, randomRot: true});


	//console.log(pages);

	var fd = fs.openSync("output/"+ filetry+ "/" + "pages.js", 'w+');
	//var data = fs.readFileSync("edits/"+ filetry+ "/" + "data.json");
	//var buffer = new ArrayBuffer(parseString);

	fs.writeSync(fd, "var data = ");

	parseString = JSON.stringify(pages, null, '\t');
	//console.log(parseString)
	fs.writeSync(fd, parseString);
	fs.close(fd);
}


function done (send, process){
send = send.join("\r\n");
writeData(send, process);
}

function writeData(here, process){
var newfile = filetry + "_" + process + "_edit.obj";
fs.writeFile("output/" + filetry + "/" +newfile, here, (err) => {
if (err) throw err;
console.log(newfile + ' has been saved!');
});
}

function writeJson(parseString){
var fd = fs.openSync("output/"+ filetry+ "/" + "data.json", 'w+');
var data = fs.readFileSync("output/"+ filetry+ "/" + "data.json");
//var buffer = new ArrayBuffer(parseString);
parseString = JSON.stringify(parseString, null, '\t');
console.log(parseString)
fs.writeSync(fd, parseString);
fs.close(fd);
}



