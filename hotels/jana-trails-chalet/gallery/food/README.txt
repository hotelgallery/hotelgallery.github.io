Put this hotel's food photos in this folder (e.g. food-1.jpg, food-2.jpg).
Then list them in ../hotel.json under categories -> "food" -> images, like:
  { "src": "hotels/akari-inn/gallery/food/food-1.jpg", "cap": "Short caption" }
(Note the full path starting with hotels/akari-inn/ — required because hotel.html
lives at the project root, not inside this folder.)
Recommended: JPG or WebP, under ~500KB each, so pages load fast.
Or, in Edit Mode, use the "+ Register Existing Photo" button and just type
the filename — it builds this path for you automatically.
