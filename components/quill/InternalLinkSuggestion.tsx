import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { blogApi } from '../blog';
import config from '@/config';

interface InternalLinkSuggestionProps {
  editorRef: React.RefObject<any>;
}

export const InternalLinkSuggestion: React.FC<InternalLinkSuggestionProps> = ({ editorRef }) => {
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: number; title: string | null }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);

  // Poll for Quill editor initialization
  useEffect(() => {
    const interval = setInterval(() => {
      const quill = editorRef.current?.getEditor?.();
      if (quill && quill.container) {
        setContainerNode(quill.container);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [editorRef]);

  // Bind trigger listeners once containerNode is set
  useEffect(() => {
    if (!containerNode) return;

    const quill = editorRef.current?.getEditor?.();
    if (!quill) return;

    const checkTrigger = () => {
      let range = quill.getSelection();
      if (!range) {
        // Fallback to Quill's internal selection savedRange
        range = quill.selection?.savedRange;
      }

      if (!range || range.length > 0) {
        setActive(false);
        return;
      }

      const cursorIndex = range.index;
      const textBefore = quill.getText(0, cursorIndex);
      const lastDoubleSquare = textBefore.lastIndexOf('[[');

      if (lastDoubleSquare === -1) {
        setActive(false);
        return;
      }

      const queryText = textBefore.slice(lastDoubleSquare + 2, cursorIndex);

      // Dismiss if it contains newline, closing brackets, or is too long
      if (queryText.includes('\n') || queryText.includes(']]') || queryText.length > 50) {
        setActive(false);
        return;
      }

      // Start search only when at least 2 characters are typed after [[
      if (queryText.trim().length >= 2) {
        setActive(true);
        setQuery(queryText);

        // Position the dropdown below the cursor
        try {
          const bounds = quill.getBounds(cursorIndex);
          setDropdownStyle({
            position: 'absolute',
            left: `${bounds.left}px`,
            top: `${bounds.bottom + 5}px`,
            zIndex: 1000,
          });
        } catch (err) {
          console.error("Error calculating Quill bounds:", err);
        }
      } else {
        setActive(false);
      }
    };

    quill.on('text-change', checkTrigger);
    quill.on('selection-change', checkTrigger);

    return () => {
      quill.off('text-change', checkTrigger);
      quill.off('selection-change', checkTrigger);
    };
  }, [containerNode, editorRef]);

  // Debounced Search API calls
  useEffect(() => {
    if (!active || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const result = await blogApi.search(query);
        if (result && result.success) {
          setSuggestions(result.data || []);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Error fetching matching blogs:", err);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [active, query]);

  // Reset selected index when suggestions update
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Intercept Keydown events on the editor
  useEffect(() => {
    if (!containerNode) return;

    const quill = editorRef.current?.getEditor?.();
    if (!quill) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!active || suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        selectSuggestion(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setActive(false);
        setSuggestions([]);
      }
    };

    quill.root.addEventListener('keydown', handleKeyDown, true);
    return () => {
      quill.root.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [active, suggestions, selectedIndex, containerNode, editorRef]);

  const selectSuggestion = (index: number) => {
    const quill = editorRef.current?.getEditor?.();
    if (!quill) return;

    const selectedBlog = suggestions[index];
    if (!selectedBlog) return;

    const linkUrl = `/blog/${selectedBlog.id}/`;
    const blogTitle = selectedBlog.title || 'Untitled';

    let range = quill.getSelection();
    if (!range) {
      range = quill.selection?.savedRange;
    }
    if (!range) return;

    const cursorIndex = range.index;
    const textBefore = quill.getText(0, cursorIndex);
    const triggerIndex = textBefore.lastIndexOf('[[');

    if (triggerIndex === -1) return;

    // Delete typed trigger text e.g. [[yo
    quill.deleteText(triggerIndex, cursorIndex - triggerIndex);

    // Insert blog title with internal link format
    quill.insertText(triggerIndex, blogTitle, 'link', linkUrl);

    // Place caret immediately after the link
    const newCursorIndex = triggerIndex + blogTitle.length;
    quill.setSelection(newCursorIndex, 0);

    // Close suggestion state
    setActive(false);
    setSuggestions([]);
    setSelectedIndex(0);
  };

  if (!active || suggestions.length === 0 || !containerNode) return null;

  return createPortal(
    <div
      style={dropdownStyle}
      className="absolute bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto min-w-[280px] z-50 py-1"
    >
      {suggestions.map((blog, idx) => (
        <div
          key={blog.id}
          onMouseDown={(e) => {
            // Prevent editor losing focus on click
            e.preventDefault();
          }}
          onClick={() => selectSuggestion(idx)}
          className={`px-4 py-2 text-sm cursor-pointer transition-colors duration-150 ${
            idx === selectedIndex ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {blog.title || 'Untitled'}
        </div>
      ))}
    </div>,
    containerNode
  );
};
