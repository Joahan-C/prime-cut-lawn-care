const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

// Scroll reveal animation
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Price estimator. Edit these amounts in the HTML if your prices change.
const yardSize = document.getElementById('yard-size');
const frequency = document.getElementById('frequency');
const addOns = [...document.querySelectorAll('.estimator-addon')];
const estimatePrice = document.getElementById('estimate-price');

function updateEstimate() {
  let total = Number(yardSize?.value || 45);
  total *= Number(frequency?.value || 1);
  addOns.forEach(item => { if (item.checked) total += Number(item.value); });
  estimatePrice.textContent = `$${Math.round(total)}`;
}
[yardSize, frequency, ...addOns].forEach(el => el?.addEventListener('change', updateEstimate));
updateEstimate();

// Before/after comparison slider
const comparisonSlider = document.getElementById('comparison-slider');
const beforeLayer = document.getElementById('before-layer');
const comparisonLine = document.getElementById('comparison-line');
comparisonSlider?.addEventListener('input', () => {
  const value = `${comparisonSlider.value}%`;
  beforeLayer.style.width = value;
  comparisonLine.style.left = value;
});

// Reviews carousel
const reviewTrack = document.getElementById('review-track');
const reviewCards = document.querySelectorAll('.review-card');
let reviewIndex = 0;
function showReview(index) {
  if (!reviewCards.length) return;
  reviewIndex = (index + reviewCards.length) % reviewCards.length;
  reviewTrack.style.transform = `translateX(-${reviewIndex * 100}%)`;
}
document.getElementById('review-prev')?.addEventListener('click', () => showReview(reviewIndex - 1));
document.getElementById('review-next')?.addEventListener('click', () => showReview(reviewIndex + 1));
setInterval(() => showReview(reviewIndex + 1), 7000);

// Set earliest scheduling date to today
const serviceDate = document.getElementById('service-date');
if (serviceDate) serviceDate.min = new Date().toISOString().split('T')[0];

// Formspree background submission
const quoteForm = document.getElementById('quote-form');
const formStatus = document.getElementById('form-status');
quoteForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const button = quoteForm.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Sending…';
  formStatus.textContent = '';

  try {
    const response = await fetch(quoteForm.action, {
      method: 'POST',
      body: new FormData(quoteForm),
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.errors?.[0]?.message || 'Submission failed');
    }

    quoteForm.reset();
    document.getElementById('state').value = 'TX';
    formStatus.textContent = 'Thank you! Your request was sent. We will contact you soon.';
    formStatus.className = 'form-status success';
  } catch (error) {
    formStatus.textContent = 'The request could not be sent. Please call or text 210-253-0410.';
    formStatus.className = 'form-status error';
  } finally {
    button.disabled = false;
    button.textContent = 'Send My Request';
  }
});

// Scripted FAQ helper (not a live AI service)
const chatPanel = document.getElementById('chat-panel');
const chatMessages = document.getElementById('chat-messages');
document.getElementById('chat-launcher')?.addEventListener('click', () => {
  chatPanel.classList.add('open');
  chatPanel.setAttribute('aria-hidden', 'false');
});
document.getElementById('chat-close')?.addEventListener('click', () => {
  chatPanel.classList.remove('open');
  chatPanel.setAttribute('aria-hidden', 'true');
});

const chatAnswers = {
  pricing: 'Mowing packages generally start near $45 for a small maintained yard. Use the estimator for a starting range or request an exact quote.',
  services: 'Prime Cut offers mowing, edging, weed eating, blowing, light yard cleanups, and curb painting.',
  area: 'Prime Cut serves San Antonio and nearby neighborhoods. Submit the address so availability can be confirmed.',
  booking: 'Use the estimate and scheduling form below, or text 210-253-0410.'
};

document.querySelectorAll('.quick-replies button').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.question;
    const userBubble = document.createElement('div');
    userBubble.className = 'user-message';
    userBubble.textContent = button.textContent;
    const botBubble = document.createElement('div');
    botBubble.className = 'bot-message';
    botBubble.textContent = chatAnswers[key];
    chatMessages.append(userBubble, botBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
});