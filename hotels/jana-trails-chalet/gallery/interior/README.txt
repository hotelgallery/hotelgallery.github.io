Put this hotel's interior photos in this folder (e.g. interior-1.jpg, interior-2.jpg).
Then list them in ../hotel.json under categories -> "interior" -> images, like:
  { "src": "hotels/akari-inn/gallery/interior/interior-1.jpg", "cap": "Short caption" }
(Note the full path starting with hotels/akari-inn/ — required because hotel.html
lives at the project root, not inside this folder.)
Recommended: JPG or WebP, under ~500KB each, so pages load fast.
Or, in Edit Mode, use the "+ Register Existing Photo" button and just type
the filename — it builds this path for you automatically.
