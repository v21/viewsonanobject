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

		var here2 = [];
		var here3 = [];
		var here4 = [];
		var here5 = []; 
		var here6 = [];

		for (x=0; x<here.length; x++){
			here2[x] = perturbV(here[x], x);
			here3[x] = perturbF(here[x], x); 
			here4[x] = sorting(here[x], "");
			here5[x] = sorting(here[x], function(a, b){return 0.5 - Math.random()});
			here6[x] = sorting(here[x], function(a, b){return a - b});

			if (x == here.length-1){
				done(here2, "perturbV");
				done(here3, "perturbF");
				done(here4, "sorting");
				done(here5, "sorting_2");
				done(here6, "sorting_3");

			}

		}




		copyJpg(filetry + ".jpg");
		generateBook(parsed);

	});



}




var parseFile = function(lines)
{

	var parseString = {
		files: {
			original_file: filetry + "_original_edit.obj",
			perturbedV_file: filetry + "_perturbV_edit.obj",
			perturbedF_file: filetry + "_perturbF_edit.obj",
			//shuffled_file: filetry + "_shuffle_edit.obj",
			sorted_file: filetry + "_sorting_edit.obj",
			sorted_file_2: filetry + "_sorting_2_edit.obj",
			sorted_file_3: filetry + "_sorting_3_edit.obj"

		},
		metadata: {
			name: filetry,
			groups: [],
			use_material: [],
		//	comments: [],
			mtl_lib: [],
		},
		lines : lines,
		contents: makeContents(lines)
	};



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



function perturbV(line, row){

if (line.startsWith("v")){
line = line.split(" ");

for (d=0; d<line.length; d++){

if (line[d].match(/[-]?(\d*\.)?\d+/g)){
line[d] = Number(line[d]) + Math.random()*d*(row*0.001); 
//line[d] = Number(line[d]) + (row*0.001); 
}
}
line = line.join(" ");
}
return line;
}


function perturbF(line, row){

if (line.startsWith("f")){
line = line.split(" ");

for (d=0; d<line.length; d++){

if (line[d].match(/[-]?(\d*\.)?\d+/g)){
//line[d] = Number(line[d]) + Math.random()*d*(row*0.001); 
line[d] = Number(line[d]) + (row*0.001); 
}
}
line = line.join(" ");
}
return line;
}


function sorting(line, method){

if (line.startsWith("v")){
line = line.replace('v ','');
line = line.split(" ");
line = line.sort(method);
//line = line.reverse();
line = line.join(" ");
line = "v " + line
}
return line;
}



/*
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
*/




function makeContents(lines)
{
	var outp = "<div class=\"contents\">";
	var justOutputtedGroup = false;
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
	
		if (line.startsWith("mtllib "))
		{
			outp += "<h2>" + line.substring(7).substring(0, line.length - 11).toString() + "</h2>";
			console.log(line);
			console.log("mtllib " + line.substring(7).toString());
		}

		if (line.startsWith("# object "))
		{
			outp += "<h3>" + line.substring(9).toString() + "</h3>";
			console.log(line);
			console.log("# obj" + line.substring(9).toString());
			justOutputtedGroup = true;
		}
		else
		{
			if (line.startsWith("g "))
			{
				if (!justOutputtedGroup)
				{
					outp += "<h3 class=\"g\">" + line.substring(2).toString() + "</h3>";
					console.log(line);
					console.log("g" + line.substring(2).toString());
				}
			}
			else
			{
				justOutputtedGroup = false;
			}
		}	


		if (line.startsWith("usemtl "))
		{
			outp += "<h4>" + line.substring(7).toString() + "</h4>";
			console.log("usemtl" + line.substring(7).toString());
		}
	}
	outp += "</div>";
	return outp;
}

function generateBook(parsed)
{
	var original_file = filetry + "_original_edit.obj";
	var perturbedF_file = filetry + "_perturbF_edit.obj";
	var perturbedV_file = filetry + "_perturbV_edit.obj";
	//var shuffled_file = filetry + "_shuffle_edit.obj";
	var sorted_file = filetry + "_sorting_edit.obj";
	var sorted_file_2 = filetry + "_sorting_2_edit.obj";
	var sorted_file_3 = filetry + "_sorting_3_edit.obj";
	pages = [];

	pages.push({header: "Contents", model : null, html: parsed.contents});

	//basic model
	pages.push({header: "Default rotation", model : original_file, randomRot: false});

	//with a rotation
	var rng1 = Math.random();
	//basic model
	pages.push({header: "Rotation 1", model : original_file, rng : rng1, randomRot: true});

	//with a rotation
	var rng2 = Math.random();
	//basic model
	pages.push({header: "Rotation 2", model : original_file, rng : rng2, randomRot: true});


	//with a rotation
	var rng3 = Math.random();
	//basic model
	pages.push({header: "Rotation 3", model : original_file, rng : rng3, randomRot: true});


	_.times(20, function(i){
		pages.push({header: "Truncation " + (20 - i) + " of 20", model : filetry + "_truncate" + (20 - i) + "_edit.obj", randomRot: false});
	});

	//slices of basic model
	var sliceCount = _.random(5,25);
	_.times(sliceCount, function(i){
		pages.push({header: "Slice " + (sliceCount - i) + " of " + sliceCount, model : original_file, randomRot: false, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})


	_.times(sliceCount, function(i){
		pages.push({header: "Rotation 1, Slice " + (sliceCount - i) + " of " + sliceCount, model : original_file, rng : rng1, randomRot: true, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})



	_.times(sliceCount, function(i){
		pages.push({header: "Rotation 2, Slice " + (sliceCount - i) + " of " + sliceCount, model : original_file, rng : rng2, randomRot: true, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})


	_.times(sliceCount, function(i){
		pages.push({header: "Rotation 3, Slice " + (sliceCount - i) + " of " + sliceCount, model : original_file, rng : rng3, randomRot: true, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})

	if (parsed.metadata.groups.length > 1)
	{
		_.times(parsed.metadata.groups.length, function(i){
			pages.push({header: "Group (" + parsed.metadata.groups[i] + ")", model : original_file, showSingleGroup: true, group: i, rng : rng1, randomRot: false});
		});	
	}

	

	//multiple models!
	var count = _.random(2, 10);

	//with a rotation
	var rng1 = Math.random();
	//basic model
	pages.push({header: count.toString() + " instances", model : original_file, rng : rng1, randomRot: true, count : count});


	_.times(sliceCount, function(i){
		pages.push({header: count.toString() + " instances, Slice " + (sliceCount - i) + " of " + sliceCount, model : original_file, rng : rng1, randomRot: true, count : count, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})

	

	//multiple models!
	var count = _.random(30, 100);

	//with a rotation
	var rng1 = Math.random();
	//basic model
	pages.push({header: count.toString() + " instances", model : original_file, rng : rng1, randomRot: true, count : count});

	//slices of basic model
	var sliceCount = _.random(5,25);
	_.times(sliceCount, function(i){
		pages.push({header: count.toString() + " instances, Slice " + (sliceCount - i) + " of " + sliceCount, model : original_file, rng : rng1, randomRot: true, count : count, slices : true, sliceIndex : i, sliceCount : sliceCount});
	})



	pages.push({header: "perturbed vertices", model : perturbedV_file, randomRot: false});
	pages.push({header:  "perturbed faces", model : perturbedF_file, randomRot: false});
	//pages.push({header:  "shuffled", model : shuffled_file, randomRot: false});
	pages.push({header:  "sorted", model : sorted_file, randomRot: false});
	pages.push({header:  "sorted 2", model : sorted_file_2, randomRot: false});
	pages.push({header:  "sorted 3", model : sorted_file_3, randomRot: false});


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


function done(send, process){
var send = send.join("\r\n");
writeData(send, process);
}

function writeData(okay, process){
var newfile = filetry + "_" + process + "_edit.obj";
fs.writeFile("output/" + filetry + "/" +newfile, okay, (err) => {
if (err) throw err;
console.log(newfile + ' has been saved!');
});
}

function writeJson(parseString){
var fd = fs.openSync("output/"+ filetry+ "/" + "data.js", 'w+');
var data = fs.readFileSync("output/"+ filetry+ "/" + "data.js");
//var buffer = new ArrayBuffer(parseString);
parseString = "var JSONdata = " + JSON.stringify(parseString, null, '\t');
console.log(parseString)
fs.writeSync(fd, parseString);
fs.close(fd);
}


function copyJpg(source){
fs.copy("NTU3D/" + source, "output/" + filetry + "/" + source, (err) => {
  if (err) throw err;
  console.log('jpg was copied');
});
}