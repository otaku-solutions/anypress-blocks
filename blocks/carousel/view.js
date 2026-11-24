// Carousel blocks, on the Interactivity API: arrows move one slide, dots jump to a place, the arrow keys move it,
// and autoplay (seconds in the context) moves on by itself, pausing while the visitor hovers, touches or tabs into
// it, and never when they prefer reduced motion. Without JavaScript the track still scrolls by swipe or scroll bar.
// With the fade transition (an is-fade carousel) the slides sit on top of each other: one shows at a time, the track
// keeps the shown slide's number in data-index, and a sideways swipe moves it.
import { store, getContext, getElement } from '@wordpress/interactivity';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const parts = (ref) => {
	const carousel = ref.closest('.wp-block-anypress-carousel');
	return { carousel, track: carousel?.querySelector('.wp-block-anypress-carousel__track') };
};
const slides = (track) => Array.from(track.children);
const fading = (track) => track.parentElement.classList.contains('is-fade');
// Where the track is: the slide whose left edge is nearest the scroll position.
const pos = (track, slide) => slide.offsetLeft - track.offsetLeft;
const current = (track) => {
	if (fading(track)) return Number(track.dataset.index || 0);
	let best = 0;
	slides(track).forEach((slide, i, all) => {
		if (Math.abs(pos(track, slide) - track.scrollLeft) < Math.abs(pos(track, all[best]) - track.scrollLeft)) best = i;
	});
	return best;
};
const atEnd = (track) => (fading(track) ? current(track) >= slides(track).length - 1 : track.scrollLeft + track.clientWidth >= track.scrollWidth - 2);
const atStart = (track) => (fading(track) ? current(track) <= 0 : track.scrollLeft <= 2);
const show = (track, index) => {
	track.dataset.index = String(index);
	slides(track).forEach((slide, i) => {
		slide.classList.toggle('is-shown', i === index);
		slide.toggleAttribute('inert', i !== index);
	});
	update(track.parentElement, track);
};
const go = (track, index) => {
	const list = slides(track);
	const to = Math.max(0, Math.min(index, list.length - 1));
	if (fading(track)) show(track, to);
	else if (list[to]) track.scrollTo({ left: pos(track, list[to]), behavior: reduced() ? 'auto' : 'smooth' });
};
// One dot per place the track can stop: with three slides shown, five slides have three places.
const places = (track) => {
	if (fading(track)) return slides(track).length;
	const first = slides(track)[0];
	if (!first || !first.offsetWidth) return slides(track).length;
	const shown = Math.max(1, Math.floor((track.clientWidth + 4) / first.offsetWidth));
	return Math.max(1, slides(track).length - shown + 1);
};

function buildDots(carousel, track, dots) {
	const count = places(track) < 2 ? 0 : places(track);
	let holder = carousel.querySelector('.wp-block-anypress-carousel__dots');
	if (count === (holder ? holder.children.length : 0)) return;
	let nav = carousel.querySelector('.wp-block-anypress-carousel__nav');
	if (!nav) {
		nav = document.createElement('div');
		nav.className = 'wp-block-anypress-carousel__nav';
		carousel.append(nav);
	}
	if (!holder) {
		holder = document.createElement('div');
		holder.className = 'wp-block-anypress-carousel__dots';
		nav.prepend(holder);
	}
	holder.replaceChildren(...Array.from({ length: count }, (_, i) => {
		const dot = document.createElement('button');
		dot.type = 'button';
		dot.className = 'wp-block-anypress-carousel__dot';
		dot.setAttribute('aria-label', dots.replace('%1$s', i + 1).replace('%2$s', count));
		dot.addEventListener('click', () => go(track, i));
		return dot;
	}));
}

function update(carousel, track) {
	const dots = Array.from(carousel.querySelectorAll('.wp-block-anypress-carousel__dot'));
	const index = atEnd(track) ? dots.length - 1 : current(track);
	dots.forEach((dot, i) => dot.setAttribute('aria-current', i === index ? 'true' : 'false'));
	const prev = carousel.querySelector('.wp-block-anypress-carousel__prev');
	const next = carousel.querySelector('.wp-block-anypress-carousel__next');
	if (prev) prev.disabled = atStart(track);
	if (next) next.disabled = atEnd(track);
	carousel.classList.toggle('is-static', fading(track) ? slides(track).length < 2 : track.scrollWidth <= track.clientWidth + 2);
}

store('anypress/carousel', {
	actions: {
		prev() {
			const { track } = parts(getElement().ref);
			go(track, current(track) - 1);
		},
		next() {
			const { track } = parts(getElement().ref);
			go(track, current(track) + 1);
		},
		keys(event) {
			const { track } = parts(getElement().ref);
			if (event.target !== track) return;
			if (event.key === 'ArrowRight') { event.preventDefault(); go(track, current(track) + 1); }
			if (event.key === 'ArrowLeft') { event.preventDefault(); go(track, current(track) - 1); }
		},
		pause() {
			getContext().paused = true;
		},
		resume() {
			getContext().paused = false;
		},
		moved() {
			const { carousel, track } = parts(getElement().ref);
			requestAnimationFrame(() => update(carousel, track));
		},
		resized() {
			const { carousel, track } = parts(getElement().ref);
			const { dots, slideLabel } = getContext();
			if (dots) buildDots(carousel, track, slideLabel);
			update(carousel, track);
		},
	},
	callbacks: {
		setUp() {
			const { carousel, track } = parts(getElement().ref);
			if (!track) return;
			const context = getContext();
			slides(track).forEach((slide, i, all) => {
				slide.setAttribute('role', 'group');
				slide.setAttribute('aria-roledescription', context.slideRole);
				if (!slide.hasAttribute('aria-label')) slide.setAttribute('aria-label', context.slideLabel.replace('%1$s', i + 1).replace('%2$s', all.length));
			});
			const cleanups = [];
			if (context.fade) {
				carousel.classList.add('is-ready');
				show(track, 0);
				let startX = null;
				const start = (e) => { startX = e.touches[0].clientX; };
				const end = (e) => {
					const dx = e.changedTouches[0].clientX - (startX ?? e.changedTouches[0].clientX);
					startX = null;
					if (Math.abs(dx) > 40) go(track, current(track) + (dx < 0 ? 1 : -1));
				};
				track.addEventListener('touchstart', start, { passive: true });
				track.addEventListener('touchend', end, { passive: true });
				cleanups.push(() => { track.removeEventListener('touchstart', start); track.removeEventListener('touchend', end); });
			}
			if (context.dots) buildDots(carousel, track, context.slideLabel);
			update(carousel, track);
			if (context.autoplay > 0 && slides(track).length > 1) {
				const timer = setInterval(() => {
					if (context.paused || reduced() || document.hidden) return;
					if (atEnd(track)) go(track, 0);
					else go(track, current(track) + 1);
				}, context.autoplay * 1000);
				cleanups.push(() => clearInterval(timer));
			}
			return () => cleanups.forEach((done) => done());
		},
	},
});
