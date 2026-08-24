'use client';

import React, { useMemo } from 'react';
import { Button, Modal } from 'antd';
import parse from 'html-react-parser';
import dayjs from 'dayjs';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface AuthorInfo {
  name?: string | null;
  designation?: string | null;
  description?: string | null;
  profile?: string | null;
}

interface BlogPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  html: string;
  imageSrc?: string;
  categoryName?: string | null;
  readTime?: string | null;
  status?: 'draft' | 'published';
  createdAt?: string | null;
  author?: AuthorInfo | null;
}

const BlogPreviewModal: React.FC<BlogPreviewModalProps> = ({
  open,
  onClose,
  title,
  html,
  imageSrc,
  categoryName,
  readTime,
  status,
  createdAt,
  author,
}) => {

  // Extract headings 
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

  const isPublished = status === 'published';
  const dateLabel = isPublished ? 'Published on' : 'Created on';
  const formattedDate = createdAt ? dayjs(createdAt).format('MMM D, YYYY') : null;

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
      <div className="font-sans text-[#1a1a2e]">
        {/* Title block */}
        <div className="text-center px-10 pt-8 pb-5">


          {categoryName && (
            <div className="mb-3">
              <span className="inline-block bg-orange-50 text-orange-500 border border-orange-200 rounded-full text-xs font-bold tracking-wide uppercase px-3.5 py-1">
                {categoryName}
              </span>
            </div>
          )}

          <h1 className="text-[1.9rem] font-extrabold leading-snug m-0 text-[#1a1a2e]">
            {title || 'Untitled Blog'}
          </h1>

          {/* Meta line */}
          {(formattedDate || readTime) && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-gray-500">
              {formattedDate && (
                <span className="flex items-center gap-1">
                  <CalendarOutlined className="text-orange-500 text-[14px]" />
                  <span>
                    <span className="font-semibold text-gray-700">{dateLabel}</span>{' '}
                    {formattedDate}
                  </span>
                </span>
              )}
              {formattedDate && readTime && (
                <span className="text-gray-300">·</span>
              )}
              {readTime && (
                <span className="flex items-center gap-1">
                  <ClockCircleOutlined className="text-orange-500 text-[14px]" />
                  <span className="font-semibold text-gray-700">{readTime} min read</span>
                </span>
              )}
            </div>
          )}
        </div>


        {imageSrc && (
          <div className="w-full">
            <img
              src={imageSrc}
              alt="Featured Banner"
              className="w-full max-h-[340px] object-cover block"
            />
          </div>
        )}


        <div className="flex px-6 py-7 items-start">


          {tocItems.length > 0 && (
            <div className="w-[220px] shrink-0 mr-6">
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-orange-500 text-white font-bold text-xs tracking-wider uppercase px-3.5 py-2.5">
                  Tables of Content
                </div>
                <ul className="list-none m-0 py-2">
                  {tocItems.map((item, i) => (
                    <li
                      key={i}
                      onClick={() => scrollToHeading(item.id)}
                      className={`py-1.5 pr-3.5 text-[12.5px] leading-relaxed flex items-start gap-1.5 cursor-pointer border-l-[3px] transition-colors duration-200 ${i === 0
                        ? 'text-orange-500 bg-orange-50 border-orange-500'
                        : 'text-gray-700 bg-transparent border-transparent hover:bg-gray-50'
                        }`}
                      style={{
                        paddingLeft: item.tag === 'H1' ? 14 : item.tag === 'H2' ? 20 : 26,
                      }}
                    >
                      <span className="text-orange-500 font-bold shrink-0">›</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Author Section  */}
              {author?.name && (
                <div className="mt-5 pt-4 border-t border-gray-200">

                  <p className="text-orange-500 font-bold text-[15px] mb-3 m-0">The Author</p>


                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-bold text-[13.5px] text-[#1a1a2e] m-0">{author.name}</p>
                      {author.designation && (
                        <p className="text-[11.5px] text-gray-500 italic mt-0.5 m-0">{author.designation}</p>
                      )}
                    </div>
                    {author.profile && (
                      <a
                        href={author.profile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 bg-[#0a66c2] rounded-[5px] flex items-center justify-center"
                        style={{ width: 28, height: 28 }}
                        title="LinkedIn Profile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="white">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                  </div>

                  {author.description && (
                    <p className="text-[12px] text-gray-600 leading-relaxed mt-3 m-0">{author.description}</p>
                  )}
                </div>
              )}
            </div>
          )}


          <div className="ql-editor flex-1 text-[15px] leading-relaxed text-gray-700 min-w-0">
            {parse(parsedHtml)}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BlogPreviewModal;
