# 📸 Her Photos

Drop photo files in this folder, e.g.:

```
public/photos/
  luna-at-beach.jpg
  us-at-cafe.jpg
```

Then open `src/config/friendProfile.ts` and add an `image` to a memory:

```ts
{
  id: 'mem-1',
  title: 'Beach day',
  caption: 'The best day.',
  image: '/photos/luna-at-beach.jpg',   // <- path starts with /photos/
},
```

That's it. Square photos look best (they fill the polaroid frame).
Until a memory has an `image`, it shows a cute pixel placeholder automatically.
