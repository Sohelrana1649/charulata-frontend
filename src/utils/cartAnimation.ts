export const triggerFlyToCartAnimation = (startElement: HTMLElement | null, imgSrc?: string) => {
  if (typeof window === 'undefined' || !startElement) return;

  const targetElement = document.querySelector('[data-cart-icon]') || document.getElementById('header-cart-icon');
  if (!targetElement) return;

  const startRect = startElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  // Create flying clone element
  const flyImg = document.createElement('img');
  if (!imgSrc) return; // never animate an unrelated stock image
  flyImg.src = imgSrc;
  flyImg.className = 'fly-to-cart-thumbnail';
  
  const initialWidth = Math.min(startRect.width, 80);
  const initialHeight = Math.min(startRect.height, 80);
  
  flyImg.style.left = `${startRect.left + startRect.width / 2 - initialWidth / 2}px`;
  flyImg.style.top = `${startRect.top + startRect.height / 2 - initialHeight / 2}px`;
  flyImg.style.width = `${initialWidth}px`;
  flyImg.style.height = `${initialHeight}px`;
  flyImg.style.opacity = '1';

  document.body.appendChild(flyImg);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetX = targetRect.left + targetRect.width / 2 - 15;
      const targetY = targetRect.top + targetRect.height / 2 - 15;

      flyImg.style.left = `${targetX}px`;
      flyImg.style.top = `${targetY}px`;
      flyImg.style.width = '30px';
      flyImg.style.height = '30px';
      flyImg.style.opacity = '0.15';
      flyImg.style.transform = 'scale(0.3) rotate(360deg)';
    });
  });

  setTimeout(() => {
    if (flyImg.parentNode) {
      flyImg.parentNode.removeChild(flyImg);
    }
    window.dispatchEvent(new Event('cart_icon_bounce'));
  }, 500);
};
