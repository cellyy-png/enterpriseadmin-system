const Carousel = require('./backend/models/Carousel');
console.log('Schema paths:', Object.keys(Carousel.schema.paths));
console.log('imageUrl path definition:', Carousel.schema.paths.imageUrl);
console.log('imageUrl required:', Carousel.schema.paths.imageUrl.isRequired);
console.log('imageUrl options:', Carousel.schema.paths.imageUrl.options);