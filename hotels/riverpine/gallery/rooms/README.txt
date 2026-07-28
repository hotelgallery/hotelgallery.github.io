Put this hotel's rooms photos in this folder (e.g. rooms-1.jpg, rooms-2.jpg).
Then list them in ../hotel.json under categories -> "rooms" -> images, like:
  { "src": "hotels/riverpine/gallery/rooms/rooms-1.jpg", "cap": "Short caption" }
(Note the full path starting with hotels/riverpine/ — required because hotel.html
lives at the project root, not inside this folder.)
Recommended: JPG or WebP, under ~500KB each, so pages load fast.
Or, in Edit Mode, use the "+ Register Existing Photo" button and just type
the filename — it builds this path for you automatically.
