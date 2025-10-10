import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import { Pane } from 'tweakpane'
gsap.registerPlugin(Draggable)

const config = {
  theme: 'light',
  duration: 0.26,
  opacity: 0.4,
  blur: 10,
  translate: 12,
}

const ctrl = new Pane({
  title: 'config',
  expanded: true,
})

const update = () => {
  document.documentElement.dataset.theme = config.theme
  document.documentElement.style.setProperty('--duration', config.duration)
  document.documentElement.style.setProperty('--opacity', config.opacity)
  document.documentElement.style.setProperty('--blur', config.blur)
  document.documentElement.style.setProperty('--translate', config.translate)
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.addBinding(config, 'duration', {
  min: 0.1,
  max: 2,
  step: 0.01,
  label: 'duration(s)',
})

ctrl.addBinding(config, 'opacity', {
  min: 0,
  max: 1,
  step: 0.1,
})

ctrl.addBinding(config, 'blur', {
  min: 0,
  max: 20,
  step: 1,
  label: 'blur(px)',
})

ctrl.addBinding(config, 'translate', {
  min: 0,
  max: 40,
  step: 1,
  label: 'translate(px)',
})

ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
})

ctrl.on('change', sync)
update()

// make tweakpane panel draggable
const tweakClass = 'div.tp-dfwv'
const d = Draggable.create(tweakClass, {
  type: 'x,y',
  allowEventDefault: true,
  trigger: `${tweakClass} button.tp-rotv_b`,
})
document.querySelector(tweakClass).addEventListener('dblclick', () => {
  gsap.to(tweakClass, {
    x: `+=${d[0].x * -1}`,
    y: `+=${d[0].y * -1}`,
    onComplete: () => {
      gsap.set(tweakClass, { clearProps: 'all' })
    },
  })
})

// Tree navigation data structure
const TREE_DATA = {
  label: "Mythical University",
  groups: [
    {
      // First group - standalone items
      items: [
        {
          id: "home",
          label: "Home",
          href: "#home",
          current: true
        },
        {
          id: "what",
          label: "What this is",
          href: "#what",
        }
      ]
    },
    {
      // Second group - main navigation
      items: [
        {
          id: "about",
          label: "About",
          href: "#about",
          items: [
        {
          id: "overview",
          label: "Overview",
          href: "#overview"
        },
        {
          id: "administration",
          label: "Administration",
          href: "#administration"
        },
        {
          id: "facts",
          label: "Facts",
          href: "#facts",
          items: [
            {
              id: "history",
              label: "History",
              href: "#history"
            },
            {
              id: "current-statistics",
              label: "Current Statistics",
              href: "#current-statistics"
            },
            {
              id: "awards",
              label: "Awards",
              href: "#awards"
            }
          ]
        },
        {
          id: "campus-tours",
          label: "Campus Tours",
          href: "#campus-tours",
          items: [
            {
              id: "prospective-students",
              label: "For Prospective Students",
              href: "#prospective-students"
            },
            {
              id: "alumni",
              label: "For Alumni",
              href: "#alumni"
            },
            {
              id: "visitors",
              label: "For Visitors",
              href: "#visitors"
            }
          ]
        }
      ]
    },
    {
      id: "admissions",
      label: "Admissions",
      href: "#admissions",
      items: [
        {
          id: "apply",
          label: "Apply",
          href: "#apply"
        },
        {
          id: "tuition",
          label: "Tuition",
          href: "#tuition",
          items: [
            {
              id: "undergraduate",
              label: "Undergraduate",
              href: "#undergraduate"
            },
            {
              id: "graduate",
              label: "Graduate",
              href: "#graduate"
            },
            {
              id: "professional-schools",
              label: "Professional Schools",
              href: "#professional-schools"
            }
          ]
        },
        {
          id: "sign-up",
          label: "Sign Up",
          href: "#sign-up"
        },
        {
          id: "visit",
          label: "Visit",
          href: "#visit"
        },
        {
          id: "photo-tour",
          label: "Photo Tour",
          href: "#photo-tour"
        },
        {
          id: "connect",
          label: "Connect",
          href: "#connect"
        }
      ]
    },
        {
          id: "academics",
          label: "Academics",
          href: "#academics",
          items: [
        {
          id: "colleges-schools",
          label: "Colleges & Schools",
          href: "#colleges-schools"
        },
        {
          id: "programs-of-study",
          label: "Programs of Study",
          href: "#programs-of-study"
        },
        {
          id: "honors-programs",
          label: "Honors Programs",
          href: "#honors-programs"
        },
        {
          id: "online-courses",
          label: "Online Courses",
          href: "#online-courses"
        },
        {
          id: "course-explorer",
          label: "Course Explorer",
          href: "#course-explorer"
        },
        {
          id: "register-for-classes",
          label: "Register for Classes",
          href: "#register-for-classes"
        },
        {
          id: "academic-calendar",
          label: "Academic Calendar",
          href: "#academic-calendar"
        },
        {
          id: "transcripts",
          label: "Transcripts",
          href: "#transcripts"
        }
      ]
    }
      ]
    }
  ]
};

// Standalone function to generate tree HTML markup
function generateTreeHTML(data) {
  const processItems = (items, level = 1, parentId = null) => {
    const setSize = items.length;
    const htmlParts = [];
    
    items.forEach((item, index) => {
      const posInSet = index + 1;
      const hasChildren = item.items && item.items.length > 0;
      const itemId = `tree-item-${item.id}`;
      const groupId = hasChildren ? `tree-group-${item.id}` : null;

      let html = `<li role="none">`;
      html += `<a
        id="${itemId}"
        role="treeitem"
        href="${item.href || '#'}"
        tabindex="${item.current ? '0' : '-1'}"
        aria-level="${level}"
        aria-setsize="${setSize}"
        aria-posinset="${posInSet}"
        ${item.current ? 'aria-current="page"' : ''}
        ${hasChildren ? `aria-expanded="false" aria-owns="${groupId}"` : ''}
      >`;
      

      html += `<span>${item.label}</span>`;
      
      if (hasChildren) {
        html += `<span class="tree-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        </span>
        `;
      }
      
      html += '</a>';
      
      if (hasChildren) {
        html += '<div inert>';
        html += `<ul id="${groupId}" role="group">`;
        html += processItems(item.items, level + 1, itemId);
        html += '</ul>';
        html += '</div>';
      }
      
      html += '</li>';
      htmlParts.push(html);
    });
    
    return htmlParts.join('');
  };

  // Handle new groups structure
  if (data.groups) {
    let treeHTML = `<ul role="tree" aria-label="${data.label}">`;
    
    data.groups.forEach((group, groupIndex) => {
      // Each group becomes a role="group" at the top level
      const groupId = `tree-group-toplevel-${groupIndex}`;
      treeHTML += `<li role="none" class="tree-group-container">`;
      treeHTML += `<ul role="group" id="${groupId}">`;
      treeHTML += processItems(group.items);
    treeHTML += '</ul>';
    treeHTML += '</li>';
    });
    
  treeHTML += '</ul>';
  return treeHTML;
  }
  
  // Fallback for old structure
  return `
    <ul role="tree" aria-label="${data.label}">
      ${processItems(data.items || [])}
    </ul>
  `;
}

document.querySelector('sidebar-tree').innerHTML = generateTreeHTML(TREE_DATA);

class SidebarTree extends HTMLElement {
  constructor() {
    super();
    this.currentFocus = null;
    this.nodeMap = new Map();
  }
  
  // Helper method to update tabindex for all tree items
  resetTabIndexes() {
  for (const el of this.tree.querySelectorAll('[role="treeitem"]')) {
    el.setAttribute('tabindex', '-1');
  }
  }
  
  // Helper method to set focus on an item
  setFocusToItem(item, updateTabindex = true) {
    if (!item) return;
    
    if (updateTabindex) {
      this.resetTabIndexes();
      item.setAttribute('tabindex', '0');
    }
    
    item.focus();
    this.currentFocus = item;
  }
  
  // Helper to check if an item is expanded
  isExpanded(item) {
    return item.getAttribute('aria-expanded') === 'true';
  }
  
  // Helper to find parent tree item
  findParentTreeItem(childElement) {
    const parentGroup = childElement.closest('ul[role="group"][id]');
    if (parentGroup?.id.startsWith('tree-group-') && !parentGroup.id.includes('toplevel')) {
      return this.querySelector(`[aria-owns="${parentGroup.id}"]`);
    }
    return null;
  }
  
  // Helper to get group element from tree item
  getGroupFromItem(item) {
    const groupId = item.getAttribute('aria-owns');
    return groupId ? document.getElementById(groupId) : null;
  }

  connectedCallback() {
    // Use external function to generate HTML
    
    this.tree = this.querySelector('[role="tree"]');
    
    // Build node map from the DOM
    this.buildNodeMap();
    
    this.setupEventListeners();
    this.initializeFocus();
  }
  
  buildNodeMap() {
    // Build nodeMap from the rendered DOM
    const allTreeItems = this.querySelectorAll('[role="treeitem"]');
    
  for (const item of allTreeItems) {
    const parentItem = this.findParentTreeItem(item);
    
    this.nodeMap.set(item.id, {
      id: item.id,
      level: Number.parseInt(item.getAttribute('aria-level')),
      hasChildren: item.hasAttribute('aria-expanded'),
      parentId: parentItem?.id || null,
      label: item.textContent.trim()
    });
  }
  }


  setupEventListeners() {
    this.tree.addEventListener('click', this.handleClick.bind(this));
    this.tree.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  initializeFocus() {
    // Set initial focus to current page or first item
    const currentItem = this.tree.querySelector('[aria-current="page"]');
    this.currentFocus = currentItem || this.tree.querySelector('[role="treeitem"]');
    
    // Ensure current page is visible
    if (currentItem) {
      this.ensureItemVisible(currentItem);
    }
  }

  handleClick(event) {
    const treeItem = event.target.closest('[role="treeitem"]');
    if (!treeItem) return;

    // Check if the click was on the arrow icon
    const icon = event.target.closest('.tree-icon');
    
    if (icon && treeItem.hasAttribute('aria-expanded')) {
      // Only prevent default and toggle if clicking the icon
      event.preventDefault();
      this.toggleExpanded(treeItem);
    } else if (!icon) {
      // Let the link navigate naturally, just update the current state
      this.activateItem(treeItem);
    }
  }

  handleKeydown(event) {
    const treeItem = event.target.closest('[role="treeitem"]');
    if (!treeItem) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Always activate the item (navigate), don't toggle expansion
        this.activateItem(treeItem);
        // Simulate a click to trigger navigation
        treeItem.click();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem(treeItem);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem(treeItem);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.handleRightArrow(treeItem);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.handleLeftArrow(treeItem);
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
      case '*':
        event.preventDefault();
        this.expandAllSiblings(treeItem);
        break;
      default:
        if (event.key.length === 1 && event.key.match(/[a-zA-Z]/)) {
          event.preventDefault();
          this.focusItemByFirstChar(event.key.toLowerCase());
        }
    }
  }

  toggleExpanded(item) {
    const wasExpanded = this.isExpanded(item);
    const group = this.getGroupFromItem(item);
    
    if (group) {
      const wrapper = group.parentElement; // Get the wrapper div
      item.setAttribute('aria-expanded', !wasExpanded);
      
      if (wasExpanded) {
        wrapper.setAttribute('inert', '');
      } else {
        wrapper.removeAttribute('inert');
      }
      
      // Update icon rotation
      const icon = item.querySelector('.tree-icon svg');
    }
  }

  activateItem(item) {
    // Remove current from all items
  for (const el of this.tree.querySelectorAll('[aria-current="page"]')) {
    el.removeAttribute('aria-current');
  }
    
    // Set current on clicked item
    item.setAttribute('aria-current', 'page');
    
    // Update tabindex
    this.resetTabIndexes();
    item.setAttribute('tabindex', '0');
  }

  focusItem(item) {
    this.setFocusToItem(item);
  }

  focusNextItem(current) {
    const allVisible = this.getVisibleItems();
    const currentIndex = allVisible.indexOf(current);
    if (currentIndex < allVisible.length - 1) {
      this.focusItem(allVisible[currentIndex + 1]);
    }
  }

  focusPreviousItem(current) {
    const allVisible = this.getVisibleItems();
    const currentIndex = allVisible.indexOf(current);
    if (currentIndex > 0) {
      this.focusItem(allVisible[currentIndex - 1]);
    }
  }

  handleRightArrow(item) {
    if (item.hasAttribute('aria-expanded')) {
      if (!this.isExpanded(item)) {
        this.toggleExpanded(item);
      } else {
        // Focus first child
        const group = this.getGroupFromItem(item);
        const firstChild = group?.querySelector('[role="treeitem"]');
        if (firstChild) {
          this.focusItem(firstChild);
        }
      }
    }
  }

  handleLeftArrow(item) {
    const nodeInfo = this.nodeMap.get(item.id);
    
    if (item.hasAttribute('aria-expanded') && this.isExpanded(item)) {
      this.toggleExpanded(item);
    } else if (nodeInfo.parentId) {
      const parent = document.getElementById(nodeInfo.parentId);
      if (parent) {
        this.focusItem(parent);
      }
    }
  }

  focusFirstItem() {
    const firstItem = this.tree.querySelector('[role="treeitem"]');
    this.focusItem(firstItem);
  }

  focusLastItem() {
    const allVisible = this.getVisibleItems();
    this.focusItem(allVisible[allVisible.length - 1]);
  }

  expandAllSiblings(item) {
    const nodeInfo = this.nodeMap.get(item.id);
    const parent = nodeInfo.parentId ? 
      document.getElementById(nodeInfo.parentId).parentElement : 
      this.tree;
    
  for (const sibling of parent.querySelectorAll(':scope > li > [aria-expanded="false"]')) {
    this.toggleExpanded(sibling);
  }
  }

  focusItemByFirstChar(char) {
    const allVisible = this.getVisibleItems();
    const current = document.activeElement;
    const currentIndex = allVisible.indexOf(current);
    
    // Search from current position to end
    for (let i = currentIndex + 1; i < allVisible.length; i++) {
      if (allVisible[i].textContent.toLowerCase().trim().startsWith(char)) {
        this.focusItem(allVisible[i]);
        return;
      }
    }
    
    // Wrap around to beginning
    for (let i = 0; i <= currentIndex; i++) {
      if (allVisible[i].textContent.toLowerCase().trim().startsWith(char)) {
        this.focusItem(allVisible[i]);
        return;
      }
    }
  }

  getVisibleItems() {
    const items = [];
    const walkTree = (element) => {
      // Handle both direct tree items and those in groups
      const directItems = element.querySelectorAll(':scope > li > [role="treeitem"]');
      const groupItems = element.querySelectorAll(':scope > li > ul[role="group"] > li > [role="treeitem"]');
      const treeItems = [...directItems, ...groupItems];
      
    for (const item of treeItems) {
      items.push(item);
      if (this.isExpanded(item)) {
        const group = this.getGroupFromItem(item);
        if (group) {
          walkTree(group);
        }
      }
    }
    };
    
    walkTree(this.tree);
    return items;
  }

  ensureItemVisible(item) {
    let parent = item.parentElement;
    while (parent && parent !== this.tree) {
      if (parent.getAttribute('role') === 'group') {
        const wrapper = parent.parentElement;
        if (wrapper?.hasAttribute('inert')) {
          const parentItem = this.tree.querySelector(`[aria-owns="${parent.id}"]`);
          if (parentItem && !this.isExpanded(parentItem)) {
            this.toggleExpanded(parentItem);
          }
        }
      }
      parent = parent.parentElement;
    }
  }
  
  filter(searchTerm) {
    const allItems = this.tree.querySelectorAll('[role="treeitem"]');
    
    // Require minimum 3 characters
    if (!searchTerm || searchTerm.length < 3) {
      // Clear filter
    for (const item of allItems) {
      item.removeAttribute('data-filtered');
      item.removeAttribute('data-search-match');
      item.removeAttribute('data-search-related');
    }
      this.tree.removeAttribute('data-filtering');
      
      // Restore original state (collapse all except current page path)
      const allExpandable = this.tree.querySelectorAll('[aria-expanded="true"]');
    for (const item of allExpandable) {
      this.toggleExpanded(item);
    }
      
      // Ensure current page is visible
      const currentItem = this.tree.querySelector('[aria-current="page"]');
      if (currentItem) {
        this.ensureItemVisible(currentItem);
      }
      
      return 0;
    }
    
    // Apply filter
    this.tree.setAttribute('data-filtering', 'true');
    const term = searchTerm.toLowerCase();
    const matches = new Set();
    const relatedItems = new Set();
    
    // First pass: find all matches
  for (const item of allItems) {
    const text = item.textContent.toLowerCase();
    if (text.includes(term)) {
      matches.add(item);
        item.setAttribute('data-search-match', 'true');
        
        // Mark all ancestors as related
        let parent = item.parentElement;
        while (parent && parent !== this.tree) {
          if (parent.getAttribute('role') === 'group') {
            const parentItem = this.tree.querySelector(`[aria-owns="${parent.id}"]`);
            if (parentItem) {
              relatedItems.add(parentItem);
              // Expand parent if collapsed
              if (!this.isExpanded(parentItem)) {
                this.toggleExpanded(parentItem);
              }
            }
          }
          parent = parent.parentElement;
        }
        
        // Mark all descendants as related
        if (item.hasAttribute('aria-owns')) {
          const group = this.getGroupFromItem(item);
          if (group) {
            const descendants = group.querySelectorAll('[role="treeitem"]');
            for (const desc of descendants) { relatedItems.add(desc); }
            // Expand to show children
            if (!this.isExpanded(item)) {
              this.toggleExpanded(item);
            }
          }
        }
      }
    }
    
    // Second pass: apply attributes
  for (const item of allItems) {
    if (matches.has(item)) {
      item.removeAttribute('data-filtered');
      item.removeAttribute('data-search-related');
      // data-search-match already set
    } else if (relatedItems.has(item)) {
        item.removeAttribute('data-filtered');
        item.removeAttribute('data-search-match');
        item.setAttribute('data-search-related', 'true');
      } else {
        item.removeAttribute('data-search-match');
        item.removeAttribute('data-search-related');
        item.setAttribute('data-filtered', 'true');
      }
    }
    
    return matches.size;
  }
}

// Register the custom element
customElements.define('sidebar-tree', SidebarTree);

// Set up search functionality
const searchInput = document.getElementById('tree-search');
const sidebarTree = document.querySelector('sidebar-tree');

// Helper to update search input aria-label
function updateSearchAriaLabel(value, matches) {
  const baseLabel = 'Search navigation tree - Press slash to focus';
  
  if (!value || value.length < 3) {
    searchInput.setAttribute('aria-label', baseLabel);
  } else {
    searchInput.setAttribute('aria-label', 
      matches > 0 
        ? `Search navigation tree - ${matches} items found - Press slash to focus`
        : 'Search navigation tree - No items found - Press slash to focus'
    );
  }
}
  
if (searchInput && sidebarTree) {
  searchInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    const matches = sidebarTree.filter(value);
    updateSearchAriaLabel(value, matches);
  });
  
  // Clear search on Escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.target.value = '';
      sidebarTree.filter('');
      updateSearchAriaLabel('', 0);
    }
  });
  
  // Focus search on "/" key press
  document.addEventListener('keydown', (e) => {
    // Don't trigger if already in an input, textarea, or contenteditable
    const tagName = e.target.tagName.toLowerCase();
    const isEditable = e.target.isContentEditable;
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    
    if (e.key === '/' && !isInput && !isEditable) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select(); // Select any existing text
    }
  });
}