const SEPARATOR = ',';
const COPY_PROPS = [
  'placeholder', 'pattern', 'spellcheck', 'autocomplete',
  'autocapitalize', 'autofocus', 'accessKey', 'accept', 'lang',
  'minLength', 'maxLength', 'required'
];

export default function tagsInput(input, inputID) {
  const base = document.createElement('div');
  base.className = 'tags-input';
  input.classList.add('hidden');
  input.tabIndex = -1;

  const type = input.getAttribute('type') || 'text';
  const editable = document.createElement('input');
  editable.id = `${inputID}-editable`;
  editable.type = type;

  COPY_PROPS.forEach(prop => {
    if (input[prop] !== undefined) {
      editable[prop] = input[prop];
    }
  });

  base.appendChild(editable);
  input.insertAdjacentElement('afterend', base);

  const tags = new Set();

  const updateInput = () => {
    input.value = Array.from(tags).join(SEPARATOR);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const renderTags = () => {
    [...base.querySelectorAll('.tag')].forEach(t => t.remove());
    tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tag;
      span.dataset.tag = tag;
      base.insertBefore(span, editable);
    });
  };

  const addTag = (text) => {
    const parts = text.split(SEPARATOR).map(t => t.trim()).filter(Boolean);
    let changed = false;
    for (const part of parts) {
      if (!tags.has(part)) {
        tags.add(part);
        changed = true;
      }
    }
    if (changed) {
      renderTags();
      updateInput();
    }
  };

  const removeTag = (tag) => {
    if (tags.delete(tag)) {
      renderTags();
      updateInput();
    }
  };

  editable.addEventListener('keydown', e => {
    if (['Enter', 'Tab', ','].includes(e.key)) {
      e.preventDefault();
      if (editable.value.trim()) {
        addTag(editable.value);
        editable.value = '';
      }
    } else if (e.key === 'Backspace' && !editable.value) {
      const last = [...tags].pop();
      if (last) removeTag(last);
    }
  });

  editable.addEventListener('blur', () => {
    if (editable.value.trim()) {
      addTag(editable.value);
      editable.value = '';
    }
  });

  editable.addEventListener('paste', () => {
    setTimeout(() => {
      if (editable.value.trim()) {
        addTag(editable.value);
        editable.value = '';
      }
    }, 0);
  });

  base.addEventListener('click', e => {
    if (e.target.classList.contains('tag')) {
      removeTag(e.target.dataset.tag);
    } else {
      editable.focus();
    }
  });

  // Initialize with existing input value
  if (input.value) addTag(input.value);

  // Expose public API
  return {
    get value() {
      return Array.from(tags);
    },
    set value(val) {
      tags.clear();
      if (val) addTag(Array.isArray(val) ? val.join(SEPARATOR) : val);
    },
    add: addTag,
    remove: removeTag
  };
}
