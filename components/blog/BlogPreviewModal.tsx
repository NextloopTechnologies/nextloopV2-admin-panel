'use client';

import React, { useMemo } from 'react';
import { Button, Modal } from 'antd';
import parse from 'html-react-parser';

interface BlogPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  html: string;
  imageSrc?: string;
}

const BlogPreviewModal: React.FC<BlogPreviewModalProps> = ({
  open,
  onClose,
  title,
  html,
  imageSrc,
}) => {

  // Extract headings from HTML for Table of Contents and inject IDs
  const { tocItems, parsedHtml } = useMemo(() => {
    const items: { tag: string; text: string; id: string }[] = [];
    let pHtml = html || '';

    if (typeof window !== 'undefined' && html) {
      const domParser = new window.DOMParser();
      const doc = domParser.parseFromString(html, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length > 0) {
        headings.forEach((h, i) => {
          const id = `preview-heading-${i}`;
          h.setAttribute('id', id);
          items.push({ tag: h.tagName, text: h.textContent || '', id });
        });
        pHtml = doc.body.innerHTML;
      }
    }
    return { tocItems: items, parsedHtml: pHtml };
  }, [html]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      width={960}
      styles={{ body: { padding: 0, maxHeight: '85vh', overflowY: 'auto' } }}
    >
      <div style={{ fontFamily: 'Inter, Segoe UI, sans-serif', color: '#1a1a2e' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', padding: '32px 40px 20px' }}>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.3, margin: 0, color: '#1a1a2e' }}>
            {title || 'Untitled Blog'}
          </h1>

          {/* Meta line */}

        </div>

        {/* Featured Image */}
        {imageSrc && (
          <div style={{ width: '100%' }}>
            <img
              src={imageSrc}
              alt="Featured Banner"
              style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Two column: TOC + Description */}
        <div style={{ display: 'flex', padding: '28px 24px', alignItems: 'flex-start' }}>

          {/* TOC Sidebar */}
          {tocItems.length > 0 && (
            <div style={{ width: 220, flexShrink: 0, marginRight: 24 }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  background: '#f97316', color: '#fff', fontWeight: 700,
                  fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 14px',
                }}>
                  Tables of Content
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0' }}>
                  {tocItems.map((item, i) => (
                    <li
                      key={i}
                      onClick={() => scrollToHeading(item.id)}
                      style={{
                        padding: '6px 14px',
                        paddingLeft: item.tag === 'H1' ? 14 : item.tag === 'H2' ? 20 : 26,
                        fontSize: 12.5, lineHeight: 1.4,
                        color: i === 0 ? '#f97316' : '#374151',
                        background: i === 0 ? '#fff7ed' : 'transparent',
                        borderLeft: i === 0 ? '3px solid #f97316' : '3px solid transparent',
                        display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer',
                      }}>
                      <span style={{ color: '#f97316', fontWeight: 700, flexShrink: 0 }}>›</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="ql-editor" style={{ flex: 1, fontSize: 15, lineHeight: 1.75, color: '#374151', minWidth: 0 }}>
            {parse(parsedHtml)}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BlogPreviewModal;
