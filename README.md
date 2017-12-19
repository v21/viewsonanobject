# viewsonanobject

_Views on an object_

A book generator that takes files from the NTU 3D model database, manipulating them by processes of slicing, segmentation, and rotation-- as well as examination of metadata. Eventually, the program operates directly on the .obj files that form the logic of the models, shuffling vertices and faces to create perturbed objects that contain a ghost of their origin, while becoming something entirely new.

_-kr pipkin & v21_

---

Sample outputs:

[face](examples/views on an object-face.pdf)
[tree](examples/views on an object-tree.pdf)
[pln_stuk](examples/views on an object-pln_stuk.pdf)

[more](examples/extra)

How to generate your own:

First, obtain the NTU3D model database, or any other database of 3D models. These should go in the NTU3D folder, as paired files - a jpg preview image and a obj file. These should have the same filename (apart from the extension).

Install a recent version of node (7.10 works). Fetch the requirements by running `npm install` in the root of this folder. You should now be able to run `node read.js` - hopefully, a lot of stuff should be spewed into the terminal, and you should have a new folder within `output/` containing a book, in webpage form. 

To convert that book to a pdf, you can either run a local development server and browse to it via localhost (I use the server built into php : `php -S localhost:8080`) or upload it to a web server. Navigate to that page (these outputs were rendered in Chrome). It will take a while to load and render the page - every page is a new WebGL scene. Now go to Print, and "Print as PDF" (this may also take some time to render).