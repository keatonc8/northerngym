document.addEventListener('DOMContentLoaded', () => {
  const badge = document.getElementById('selling-fast-badge');
  if (!badge) return;

  let hideTimer;

  const showBadge = () => {
    // Force visibility even if theme CSS set display:none
    badge.style.setProperty('display', 'inline-flex');

    // Ensure it can transition from hidden -> visible
    badge.classList.remove('opacity-0', 'pointer-events-none');

    // If you rely on a transition, add the hidden class first then remove next frame
    // (prevents "no animation" when classes are already removed)
    badge.classList.add('opacity-0', 'pointer-events-none');
    requestAnimationFrame(() => {
      badge.classList.remove('opacity-0', 'pointer-events-none');
    });
  };

  const hideBadge = () => {
    badge.classList.add('opacity-0', 'pointer-events-none');
    clearTimeout(hideTimer);
  };

  // Start hidden (in case it flashes)
  badge.style.setProperty('display', 'inline-flex');
  badge.classList.add('opacity-0', 'pointer-events-none');

  // Show after 1s, then hide after 8s
  setTimeout(() => {
    showBadge();
    hideTimer = setTimeout(hideBadge, 8000);
  }, 1000);
});