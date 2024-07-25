import { fetchImages } from './pics-api.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const sentinel = document.querySelector('#sentinel');

let page = 1;
let query = '';
let lightbox;

const onFormSubmit = e => {
  e.preventDefault();
  query = e.currentTarget.elements.searchQuery.value;
  console.log('Form submitted with query:', query);
  page = 1;
  onSearch(query);
};

const onSearch = async query => {
  const images = await fetchImages(query, page);
  console.log(images);
  renderGallery(images.hits, true);
  if (images.hits.length < 20) {
    loadMoreButton.style.display = 'none';
  } else {
    loadMoreButton.style.display = 'block';
  }
  if (images.totalHits > 0) {
    Notify.success(`Hooray! We found ${images.totalHits} images.`);
  } else {
    Notify.failure('Sorry, no images found. Please try again.');
  }
  if (lightbox) {
    lightbox.refresh();
  } else {
    lightbox = new SimpleLightbox('.gallery a');
  }
};

const loadMore = async () => {
  page++;
  const images = await fetchImages(query, page);
  renderGallery(images.hits, false);
  if (images.hits.length < 20) {
    loadMoreButton.style.display = 'none';
  }
  if (lightbox) {
    lightbox.refresh();
  }
  smoothScroll();
};

const renderGallery = (images, reset) => {
  if (reset) {
    gallery.innerHTML = '';
  }
  const markup = images
    .map(
      ({
        id,
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div id="${id}" class="photo-card">
        <a href="${largeImageURL}" target="_blank">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes: ${likes}</b>
          </p>
          <p class="info-item">
            <b>Views: ${views}</b>
          </p>
          <p class="info-item">
            <b>Comments: ${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads: ${downloads}</b>
          </p>
        </div>
      </div>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
};
const onIntersection = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && query) {
      loadMore();
    }
  });
};

const observer = new IntersectionObserver(onIntersection, {
  rootMargin: '200px',
});
observer.observe(sentinel);

form.addEventListener('submit', onFormSubmit);
