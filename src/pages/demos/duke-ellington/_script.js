function setUp(topText, bottomText) {
  const h1 = document.querySelector('h1');
  
  // Clear existing spans but keep the text nodes at the end
  const textNodes = Array.from(h1.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
  h1.innerHTML = '';
  
  // Get max length to handle different word lengths
  const maxLength = Math.max(topText.length, bottomText.length);
  
  // Create span structure for each character position
  for (let i = 0; i < maxLength; i++) {
    const wrapper = document.createElement('span');
    wrapper.style.setProperty('--index', i);
    wrapper.style.setProperty('--delay', Math.random());
    const topSpan = document.createElement('span');
    const bottomSpan = document.createElement('span');
    
    // Use character or non-breaking space if word has ended
    topSpan.innerHTML = i < topText.length ? topText[i] : '&nbsp;';
    bottomSpan.innerHTML = i < bottomText.length ? bottomText[i] : '&nbsp;';
    
    wrapper.appendChild(topSpan);
    wrapper.appendChild(bottomSpan);
    h1.appendChild(wrapper);
  }
  
  // Add back the text nodes for reference
  for (const node of textNodes) {
    h1.appendChild(node);
  }
}

// Example usage:
setUp("Duke Ellington", "Design Engineer");

document.body.addEventListener('click', () => {
  document.body.dataset.toggled = document.body.dataset.toggled === 'true' ? 'false' : 'true';
})