'use client';

import React from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';

interface QuillEditorProps extends ReactQuillProps {
  forwardedRef: React.Ref<any>;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ forwardedRef, ...props }) => {
  return <ReactQuill ref={forwardedRef} {...props} />;
};

export default QuillEditor;