

var width = 500;
var height = 500;

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor( 0xffffff, 0 );
renderer.setSize( width, height );
//document.body.appendChild( renderer.domElement );

var aspect = width / height;


var render = function(params)
{


	var canvas = document.createElement("canvas");

	var context = canvas.getContext( '2d' );


	context.canvas.width  = width;
	context.canvas.height = height;

	document.body.appendChild( canvas);


	var div = document.createElement("div");
	div.innerHTML = JSON.stringify(params);
	document.body.appendChild( div);


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
	var object;
	// load a resource
	loader.load(
		// resource URL
		filename,
		// called when resource is loaded

		

		function ( object ) {

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

				var sum_bbox;

				var material = new THREE.MeshLambertMaterial({color: 0xffffff, side: THREE.DoubleSide});
				object.traverse( function ( child ) {
			        if ( child instanceof THREE.Mesh ) {
			        	
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

			var sum_bbox;

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
		}
		);



}


function renderPages()
{
	for (var i = 0; i < data.length; i++) {	
		render(data[i]);
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