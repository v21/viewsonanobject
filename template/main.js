

var width = 500;
var height = 500;

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor( 0xffffff, 0 );
renderer.setSize( width, height );
renderer.sortObjects = false;
//document.body.appendChild( renderer.domElement );

var aspect = width / height;


var render = function(params)
{


	var canvas = document.createElement("canvas");

	var context = canvas.getContext( '2d' );


	context.canvas.width  = width;
	context.canvas.height = height;

	document.getElementById('renders').appendChild( canvas);


	var header = document.createElement("div");
	header.innerHTML = params.header;
	header.className = "pageheader";
	document.getElementById('renders').appendChild( header);


	var camera;
	var scene;

	var filename = params.model;

	var rng;
	if (params.rng)
	{
		rng = new RNG(params.rng);
	}
	else
	{
		rng = new RNG(Math.random);
	}

	scene = new THREE.Scene();
	//var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


	var frustumSize = 10;


	console.log(params);
	if (params.slices)
	{
		console.log("slicing");
		camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -0.5, 0.5 );
	}
	else
	{
		camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );		
	}

	

	

	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var cube = new THREE.Mesh( geometry, material );
	//scene.add( cube );

	//camera.position.z = 50;


	scene.add( new THREE.AmbientLight( 0x222222 ) );
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
	directionalLight.position.set( 1, 1, 1 ).normalize();
	scene.add( directionalLight );

	// instantiate a loader
	var loader = new THREE.OBJLoader();

	function renderObject(object)
	{


		object.frustumCulled = false;

		if (params.showSingleGroup)
		{
			console.log("group : " + params.group)
			for (var i = 0; i < object.children.length; i++) {
				object.children[i].visible = (i == params.group);
			}
		}

		var count = 1;
		if (params.count)
		{
			count = params.count;
		}

		var objects = [];

		for (var i = 0; i < count; i++) {
			var object = object.clone();
			objects[i] = object;

			var sum_bbox = null;

			var material = new THREE.MeshLambertMaterial({color: 0xffffff, side: THREE.DoubleSide});
			object.traverse( function ( child ) {
		        if ( child instanceof THREE.Mesh ) {
		        	child.frustumCulled = false;
		        	
		            child.material = material;

		            child.geometry.computeBoundingBox();
		            var bbox = child.geometry.boundingBox;

		            if (!isNaN(bbox.min.x) && !isNaN(bbox.min.y) && !isNaN(bbox.min.z) && !isNaN(bbox.max.x) && !isNaN(bbox.max.y) && !isNaN(bbox.max.z))
		            {
		            	if (sum_bbox == null) sum_bbox = bbox;
		            	else sum_bbox.expandByObject(child);
		            }

		        }
		    } );



			if (sum_bbox == null)
			{
				console.error("sum_bbox is null");
			}
			else
			{
				var center = sum_bbox.getCenter().clone();
				center.multiplyScalar(-1);

				object.traverse(function (child) {
	                if (child instanceof THREE.Mesh) {
	                    child.geometry.translate(center.x, center.y, center.z);
	                }
	            });
			}



			scene.add( object );

			if (params.randomRot)
			{
				object.rotation.set(rng.random(0.0, 2.0 * Math.PI), rng.random(0.0, 2.0 * Math.PI), rng.random(0.0, 2.0 * Math.PI));
			}

		}

		var sum_bbox = null;

		scene.updateMatrixWorld();	
		
		for (var i = 0; i < objects.length; i++) {
			
			objects[i].traverse( function ( child ) {
		        if ( child instanceof THREE.Mesh ) {

		            child.geometry.computeBoundingBox();
		            var bbox = child.geometry.boundingBox;

		            if (!isNaN(bbox.min.x) && !isNaN(bbox.min.y) && !isNaN(bbox.min.z) && !isNaN(bbox.max.x) && !isNaN(bbox.max.y) && !isNaN(bbox.max.z))
		            {
		            	if (sum_bbox == null) sum_bbox = bbox;
		            	else sum_bbox.expandByObject(child);
		            }

		        }
		    } );
		}

		console.log(sum_bbox);
		if (sum_bbox == null)
		{
			console.error("sum_bbox is null");
			return false;
		}
		if (isNaN(sum_bbox.max.x) || sum_bbox.max.x == Number.POSITIVE_INFINITY || sum_bbox.max.x == Number.NEGATIVE_INFINITY)
		{
			console.error("sum_bbox is null");
			return false;
		}

		console.log(aspect);
		var size = sum_bbox.getSize();
		var cameraSize = Math.max(size.x, size.y) * 1.2;
		camera.left = cameraSize * aspect / - 2;
		camera.right = cameraSize * aspect / 2;
		camera.top = cameraSize / 2;
		camera.bottom = cameraSize / - 2;
		if (params.slices)
		{
			console.log("slicing");
			var sliceWidth = size.z / (params.sliceCount);
			camera.far = -size.z / 2 + params.sliceIndex * sliceWidth;
			camera.near = -size.z / 2 + (params.sliceIndex + 1) * sliceWidth;
			//camera.
		}
		camera.updateProjectionMatrix();

		console.log(center);
	
	
		renderer.render(scene, camera);

		context.drawImage( renderer.domElement, 0, 0 ,width, height);
		return true;
	}

	function onLoadModel () {

		
		for (var i = 0; i < 5; i++) {
			var text = this.responseText;


			if (params.process != null)
			{
				var lines = text.split(/\r?\n/);
				if (params.process == "perturb")
				{
					for (x=0; x<lines.length; x++){
						if (lines[x].startsWith("v "))
						{
							lines[x] = perturb(lines[x], x); //randomize individual points
						}
					}
				}
				else if (params.process == "sort")
				{
					lines.sort();
				}
				else if (params.process == "shuffle")
				{
					var lines = shuffle(lines); //shuffle lines randomly
				}
				else if (params.process == "shufflesubset")
				{
					var outp = [];
					var linesToShuffle = [];
					for (x=0; x<lines.length; x++){
						if (lines[x].startsWith("v "))
						{
							linesToShuffle.push(lines[x]);
						}
						else
						{
							if (linesToShuffle.length > 0)
							{
								console.log("shuffling " + linesToShuffle.length + " lines");
								console.log(linesToShuffle);
								shuffle(linesToShuffle);

								console.log(linesToShuffle);
								outp = outp.concat(linesToShuffle);
								linesToShuffle = [];
							}
							outp.push(lines[x]);
						}
					}
					lines = outp;
					console.log(lines);

				}
				else if (params.process == "sometimes fail")
				{
					if (Math.random() < 0.8)
					{
						lines = [];
					}
				}
				else if (params.process == "killfaces")
				{
					for (x=0; x<lines.length; x++){
						if (lines[x].startsWith("f ") && Math.random() < 0.5)
						{
							lines[x] = "";
						}
					}
				}

				text = lines.join("\r\n");

				//console.log(text);
			}


			var object = loader.parse(text);
			var rendered = renderObject(object);

			
			if (rendered)
			{
				console.log(i + " object rendered");
				break;
			}
		}





	
	}


	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", onLoadModel);
	oReq.open("GET", filename);
	oReq.send();


}


function addHtml(params) {
	
	var div = document.createElement("div");
	div.innerHTML = params.html;
	
	document.getElementById('renders').appendChild( div);

	var header = document.createElement("div");
	header.innerHTML = params.header;
	header.className = "pageheader";
	document.getElementById('renders').appendChild( header);
}


function perturb(line, row){
	line = line.split(" ");

	for (d=0; d<line.length; d++){

		if (line[d].match(/[-]?(\d*\.)?\d+/g)){
			//line[d] = Number(line[d]) + Math.random()*d*(row*0.001); 
			line[d] = Number(line[d]) * (1 + (Math.random() * row*0.001)); 
		}
	}
	line = line.join(" ");
	return line;
}




function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

function renderPages()
{
	for (var i = 0; i < data.length; i++) {	
		if (data[i].model != null)
		{
			render(data[i]);
		}
		else if (data[i].html != null)
		{
			addHtml(data[i]);
		}
	}
}

renderPages();


// render({model: 'Y203_man_hand.obj', slices: false, showSingleGroup: true, group: 0});
// render({model: 'Y203_man_hand.obj', slices: false, sliceIndex: 5, sliceCount: 10, randomRot: true, count : 15});

// render({model: 'Y203_man_hand.obj', slices: true, sliceIndex: 0, sliceCount: 10, rng: "test", randomRot: true, count : 5});
// render({model: 'Y203_man_hand.obj', slices: true, sliceIndex: 1, sliceCount: 10, rng: "test", randomRot: true, count : 5});
// render({model: 'Y203_man_hand.obj', slices: true, sliceIndex: 2, sliceCount: 10, rng: "test", randomRot: true, count : 5});
// render({model: 'Y203_man_hand.obj', slices: true, sliceIndex: 3, sliceCount: 10, rng: "test", randomRot: true, count : 5});
// render({model: 'Y203_man_hand.obj', slices: true, sliceIndex: 4, sliceCount: 10, rng: "test", randomRot: true, count : 5});
// render({model: 'Y203_man_hand.obj', slices: true, sliceIndex: 5, sliceCount: 10, rng: "test", randomRot: true, count : 5});
// render({model: 'Y203_man_hand.obj', slices: true, sliceIndex: 6, sliceCount: 10, rng: "test", randomRot: true, count : 5});
// render({model: 'Y203_man_hand.obj', slices: true, sliceIndex: 7, sliceCount: 10, rng: "test", randomRot: true, count : 5});
// render({model: 'Y203_man_hand.obj', slices: true, sliceIndex: 8, sliceCount: 10, rng: "test", randomRot: true, count : 5});
// render({model: 'Y203_man_hand.obj', slices: true, sliceIndex: 9, sliceCount: 10, rng: "test", randomRot: true, count : 5});
// render({model: 'Y203_man_hand.obj', slices: false, sliceIndex: 5, sliceCount: 10, rng: "tesasdft4", randomRot: true});
// render({model: 'Y203_man_hand.obj', slices: false, sliceIndex: 5, sliceCount: 10, rng: "teadsfast5", randomRot: true});
// render({model: 'Y203_man_hand.obj', slices: false, sliceIndex: 5, sliceCount: 10, rng: "tesafdsft6", randomRot: true});
// render({model: 'Y203_man_hand.obj', slices: false, sliceIndex: 0});