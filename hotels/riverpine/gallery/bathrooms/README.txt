Put this hotel's bathrooms photos in this folder (e.g. bathrooms-1.jpg, bathrooms-2.jpg).
Then list them in ../hotel.json under categories -> "bathrooms" -> images, like:
  { "src": "hotels/riverpine/gallery/bathrooms/bathrooms-1.jpg", "cap": "Short caption" }
(Note the full path starting with hotels/riverpine/ — required because hotel.html
lives at the project root, not inside this folder.)
Recommended: JPG or WebP, under ~500KB each, so pages load fast.
Or, in Edit Mode, use the "+ Register Existing Photo" button and just type
the filename — it builds this path for you automatically.
