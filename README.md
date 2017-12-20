# viewsonanobject

_Views on an object_

A book generator that takes files from the NTU 3D model database, manipulating them by processes of slicing, segmentation, and rotation-- as well as examination of metadata. Eventually, the program operates directly on the .obj files that form the logic of the models, shuffling vertices and faces to create perturbed objects that contain a ghost of their origin, while becoming something entirely new.

_-kr pipkin & v21_

---

**Sample outputs:**

[face](examples/views%20on%20an%20object-face.pdf) ([download](https://github.com/v21/viewsonanobject/raw/master/examples/views%20on%20an%20object-face.pdf))  
[tree](examples/views%20on%20an%20object-tree.pdf) ([download](https://github.com/v21/viewsonanobject/raw/master/examples/views%20on%20an%20object-tree.pdf))  
[pln_stuk](examples/views%20on%20an%20object-pln_stuk.pdf) ([download](https://github.com/v21/viewsonanobject/raw/master/examples/views%20on%20an%20object-pln_stuk.pdf))  

[more](examples/extra)

**The NTU3D model database**

The NTU3D model database was a online database of 3D models, hosted by the National Taiwan University at [http://3d.csie.ntu.edu.tw/~dynamic/database/index.html](http://3d.csie.ntu.edu.tw/~dynamic/database/index.html). It now appears to be permanently offline, but a description of it can be found in the paper [3D Model Search Engine Based on Lightfield Descriptors](https://www.yumpu.com/en/document/view/18042248/3d-model-search-engine-based-on-lightfield-descriptors) by Yu-Te Shen, Ding-Yun Chen, Xiao-Pei Tian and Ming Ouhyoung. The database contains slightly over 10,000 models, all originally scraped from the web in 2003. The models lack any accompanying material data - what colours or textures they originally had are captured only in the jpg preview.

**How to generate your own:**

First, obtain the NTU3D model database, or any other database of 3D models. These should go in the NTU3D folder, as paired files - a jpg preview image and a obj file. These two files should have the same filename (apart from the extension).

Install a recent version of node (7.10 works). Fetch the requirements by running `npm install` in the root of this folder. You should now be able to run `node read.js` - this will spew a lot of stuff into the terminal, and you should now have a new folder within `output/` containing a book in webpage form.

To convert that webpage to a pdf, you can either run a local development server and browse to it via localhost (I use the server built into php : `php -S localhost:8080`) or upload it to a web server. Unfortunately, it is unlikely to work if opened up directly using the `file://` protocol due to security limitations (although non sandboxed browsers like Firefox are an option). Navigate to that page (we used Chrome). It will take a minute or so to load and render the webpage - every image is a new WebGL scene. Now go to Print, and "Print as PDF" (this may also take some time to render).
