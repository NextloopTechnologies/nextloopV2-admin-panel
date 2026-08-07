'use client';

import React from 'react';
import ReactQuill, { Quill, ReactQuillProps } from 'react-quill';
import { message } from 'antd';

interface QuillEditorProps extends ReactQuillProps {
  forwardedRef: React.Ref<any>;
}

// Extend default Image blot to support and persist inline styles, width, and height attributes
const BaseImage = Quill.import('formats/image');
const ATTRIBUTES = ['alt', 'height', 'width', 'style'];

class CustomImage extends BaseImage {
  static formats(domNode: HTMLElement) {
    return ATTRIBUTES.reduce((formats: any, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  format(name: string, value: any) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}
Quill.register(CustomImage, true);

// Custom ImageResize Module for drag-resize, alignments, context menus, and image cropping/captions/alt-text
class ImageResize {
  quill: any;
  options: any;
  img: HTMLImageElement | null;
  overlay: HTMLDivElement | null;
  contextMenu: HTMLDivElement | null;

  constructor(quill: any, options = {}) {
    this.quill = quill;
    this.options = options;
    this.img = null;
    this.overlay = null;
    this.contextMenu = null;

    // Listen for image clicks (selection overlay)
    this.quill.root.addEventListener('click', this.handleClick.bind(this));
    // Listen for contextmenu right-clicks on images
    this.quill.root.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    // Dismiss elements on document clicks
    document.addEventListener('click', this.handleDocumentClick.bind(this));
    // Dismiss overlays on text/scroll changes
    this.quill.on('text-change', () => {
      this.hideOverlay();
      this.hideContextMenu();
    });
    this.quill.root.addEventListener('scroll', () => {
      this.hideOverlay();
      this.hideContextMenu();
    });
  }

  handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG') {
      this.showOverlay(target as HTMLImageElement);
    } else {
      this.hideOverlay();
    }
  }

  handleContextMenu(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG') {
      e.preventDefault();
      this.showContextMenu(target as HTMLImageElement, e.clientX, e.clientY);
    }
  }

  handleDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    // Dismiss context menu unless clicking inside it
    if (this.contextMenu && !this.contextMenu.contains(target)) {
      this.hideContextMenu();
    }
  }

  showOverlay(img: HTMLImageElement) {
    this.img = img;
    this.hideOverlay();

    this.overlay = document.createElement('div');
    this.overlay.className = 'ql-image-resize-overlay';
    this.overlay.style.position = 'absolute';
    this.overlay.style.border = '1px dashed #1890ff';
    this.overlay.style.boxSizing = 'border-box';
    this.overlay.style.pointerEvents = 'none';

    const rect = img.getBoundingClientRect();
    const parentRect = this.quill.root.parentNode.getBoundingClientRect();

    this.overlay.style.left = `${rect.left - parentRect.left + this.quill.root.parentNode.scrollLeft}px`;
    this.overlay.style.top = `${rect.top - parentRect.top + this.quill.root.parentNode.scrollTop}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;

    this.quill.root.parentNode.appendChild(this.overlay);

    // Resize handle
    const handle = document.createElement('div');
    handle.style.position = 'absolute';
    handle.style.right = '-5px';
    handle.style.bottom = '-5px';
    handle.style.width = '10px';
    handle.style.height = '10px';
    handle.style.backgroundColor = '#1890ff';
    handle.style.border = '1px solid #ffffff';
    handle.style.borderRadius = '50%';
    handle.style.cursor = 'se-resize';
    handle.style.pointerEvents = 'auto';

    handle.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = img.width || img.clientWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = Math.max(30, startWidth + deltaX);
        img.style.width = `${newWidth}px`;
        img.style.height = 'auto';
        img.removeAttribute('width');
        img.removeAttribute('height');

        const newRect = img.getBoundingClientRect();
        if (this.overlay) {
          this.overlay.style.width = `${newRect.width}px`;
          this.overlay.style.height = `${newRect.height}px`;
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    this.overlay.appendChild(handle);
  }

  getCaptionBlock(img: HTMLImageElement) {
    const imgBlot = this.quill.constructor.find(img);
    if (!imgBlot) return null;
    const [line] = this.quill.getLine(this.quill.getIndex(imgBlot));
    const nextLine = line?.next;

    if (nextLine && nextLine.domNode) {
      const node = nextLine.domNode as HTMLElement;
      const hasCenterClass = node.classList.contains('ql-align-center');
      const em = node.querySelector('em') || (node.tagName === 'EM' ? node : null);
      if (hasCenterClass && em) {
        return nextLine;
      }
    }
    return null;
  }

  showContextMenu(img: HTMLImageElement, x: number, y: number) {
    this.img = img;
    this.hideContextMenu();

    const menu = document.createElement('div');
    menu.className = 'ql-image-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.backgroundColor = '#ffffff';
    menu.style.border = '1px solid #d9d9d9';
    menu.style.borderRadius = '6px';
    menu.style.boxShadow = '0 3px 12px rgba(0,0,0,0.15)';
    menu.style.padding = '4px 0';
    menu.style.zIndex = '2000';
    menu.style.minWidth = '160px';

    const items = [
      { label: 'Align Left', action: () => this.applyAlign(img, 'left') },
      { label: 'Align Center', action: () => this.applyAlign(img, 'center') },
      { label: 'Align Right', action: () => this.applyAlign(img, 'right') },
      { label: 'Align Inline', action: () => this.applyAlign(img, 'inline') },
      { divider: true },
      { label: '💬 Add/Edit Caption', action: () => this.openCaptionPrompt(img) },
      { label: '🏷️ Edit Alt Text', action: () => this.openAltTextPrompt(img) },
      { divider: true },
      { label: '✂️ Crop Image', action: () => this.openCropModal(img) }
    ];

    items.forEach(item => {
      if (item.divider) {
        const div = document.createElement('div');
        div.style.height = '1px';
        div.style.backgroundColor = '#f0f0f0';
        div.style.margin = '4px 0';
        menu.appendChild(div);
        return;
      }

      const menuItem = document.createElement('div');
      menuItem.innerText = item.label!;
      menuItem.style.padding = '8px 16px';
      menuItem.style.fontSize = '13px';
      menuItem.style.color = '#333333';
      menuItem.style.cursor = 'pointer';
      menuItem.style.transition = 'background-color 0.2s';

      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.backgroundColor = '#f5f5f5';
        menuItem.style.color = '#1890ff';
      });
      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.backgroundColor = 'transparent';
        menuItem.style.color = '#333333';
      });

      menuItem.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        item.action!();
        this.hideContextMenu();
      });

      menu.appendChild(menuItem);
    });

    document.body.appendChild(menu);
    this.contextMenu = menu;
  }

  applyAlign(img: HTMLImageElement, type: string) {
    img.style.float = '';
    img.style.display = '';
    img.style.margin = '';

    if (type === 'left') {
      Object.assign(img.style, { float: 'left', display: 'inline', margin: '8px 16px 8px 0' });
    } else if (type === 'center') {
      Object.assign(img.style, { float: 'none', display: 'block', margin: '12px auto' });
    } else if (type === 'right') {
      Object.assign(img.style, { float: 'right', display: 'inline', margin: '8px 0 8px 16px' });
    } else if (type === 'inline') {
      Object.assign(img.style, { float: 'none', display: 'inline', margin: '0' });
    }
  }

  openCaptionPrompt(img: HTMLImageElement) {
    const captionBlock = this.getCaptionBlock(img);
    const currentCaption = captionBlock ? (captionBlock.domNode.innerText || captionBlock.domNode.textContent || '').trim() : '';

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '3000';

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#f0f0f0';
    modal.style.border = '1px solid #c0c0c0';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
    modal.style.width = '420px';
    modal.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    modal.style.overflow = 'hidden';
    overlay.appendChild(modal);

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '8px 12px';
    header.style.backgroundColor = '#ffffff';
    header.style.borderBottom = '1px solid #d9d9d9';
    modal.appendChild(header);

    const title = document.createElement('span');
    title.innerText = 'Caption';
    title.style.fontSize = '14px';
    title.style.fontWeight = '500';
    title.style.color = '#333333';
    header.appendChild(title);

    const closeBtnHeader = document.createElement('span');
    closeBtnHeader.innerHTML = '&times;';
    closeBtnHeader.style.fontSize = '18px';
    closeBtnHeader.style.cursor = 'pointer';
    closeBtnHeader.style.color = '#666666';
    closeBtnHeader.style.padding = '2px 6px';
    closeBtnHeader.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    header.appendChild(closeBtnHeader);

    const body = document.createElement('div');
    body.style.padding = '16px';
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';
    modal.appendChild(body);

    const label = document.createElement('label');
    label.innerText = 'Caption:';
    label.style.fontSize = '13px';
    label.style.color = '#111111';
    label.style.textDecoration = 'underline';
    body.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentCaption;
    input.placeholder = 'Figure 1';
    input.style.width = '100%';
    input.style.padding = '6px 8px';
    input.style.border = '1px solid #7a7a7a';
    input.style.borderRadius = '0px';
    input.style.fontSize = '13px';
    input.style.backgroundColor = '#ffffff';
    input.style.outline = 'none';
    body.appendChild(input);

    setTimeout(() => input.focus(), 50);

    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-end';
    footer.style.gap = '8px';
    footer.style.padding = '0 16px 16px 16px';
    modal.appendChild(footer);

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.style.padding = '6px 16px';
    cancelBtn.style.border = '1px solid #adadad';
    cancelBtn.style.borderRadius = '3px';
    cancelBtn.style.background = '#e1e1e1';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.fontSize = '12px';
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    footer.appendChild(cancelBtn);

    const okBtn = document.createElement('button');
    okBtn.innerText = 'OK';
    okBtn.style.padding = '6px 20px';
    okBtn.style.border = '1px solid #0078d7';
    okBtn.style.borderRadius = '3px';
    okBtn.style.background = '#0078d7';
    okBtn.style.color = '#ffffff';
    okBtn.style.cursor = 'pointer';
    okBtn.style.fontSize = '12px';

    const handleSave = () => {
      const trimmed = input.value.trim();
      const imgBlot = this.quill.constructor.find(img);

      if (trimmed === '') {
        if (captionBlock) {
          const idx = this.quill.getIndex(captionBlock);
          const len = captionBlock.length();
          this.quill.deleteText(idx - 1, len + 1);
        }
      } else {
        if (captionBlock) {
          const idx = this.quill.getIndex(captionBlock);
          const len = captionBlock.length();
          this.quill.deleteText(idx, len - 1);
          this.quill.insertText(idx, trimmed, { italic: true, color: '#666666' });
        } else if (imgBlot) {
          const imgIndex = this.quill.getIndex(imgBlot);
          this.quill.insertText(imgIndex + 1, '\n' + trimmed, { italic: true, color: '#666666' });
          this.quill.formatLine(imgIndex + 2, 1, 'align', 'center');
        }
      }
      document.body.removeChild(overlay);
    };

    okBtn.addEventListener('click', handleSave);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    });

    footer.appendChild(okBtn);
    document.body.appendChild(overlay);
  }

  openAltTextPrompt(img: HTMLImageElement) {
    const currentAlt = img.getAttribute('alt') || '';

    // Create modal overlay background
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '3000';

    // Create Modal container
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#f0f0f0';
    modal.style.border = '1px solid #c0c0c0';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
    modal.style.width = '420px';
    modal.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    modal.style.overflow = 'hidden';
    overlay.appendChild(modal);

    // Header bar
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '8px 12px';
    header.style.backgroundColor = '#ffffff';
    header.style.borderBottom = '1px solid #d9d9d9';
    modal.appendChild(header);

    const title = document.createElement('span');
    title.innerText = 'Alternative Text (Alt)';
    title.style.fontSize = '14px';
    title.style.fontWeight = '500';
    title.style.color = '#333333';
    header.appendChild(title);

    const closeBtnHeader = document.createElement('span');
    closeBtnHeader.innerHTML = '&times;';
    closeBtnHeader.style.fontSize = '18px';
    closeBtnHeader.style.cursor = 'pointer';
    closeBtnHeader.style.color = '#666666';
    closeBtnHeader.style.padding = '2px 6px';
    closeBtnHeader.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    header.appendChild(closeBtnHeader);

    // Body container
    const body = document.createElement('div');
    body.style.padding = '16px';
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.gap = '8px';
    modal.appendChild(body);

    const label = document.createElement('label');
    label.innerText = 'Alt Text (SEO/Accessibility):';
    label.style.fontSize = '13px';
    label.style.color = '#111111';
    label.style.textDecoration = 'underline';
    body.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentAlt;
    input.placeholder = 'Describe the image...';
    input.style.width = '100%';
    input.style.padding = '6px 8px';
    input.style.border = '1px solid #7a7a7a';
    input.style.borderRadius = '0px';
    input.style.fontSize = '13px';
    input.style.backgroundColor = '#ffffff';
    input.style.outline = 'none';
    body.appendChild(input);

    setTimeout(() => input.focus(), 50);

    // Buttons container
    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-end';
    footer.style.gap = '8px';
    footer.style.padding = '0 16px 16px 16px';
    modal.appendChild(footer);

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.style.padding = '6px 16px';
    cancelBtn.style.border = '1px solid #adadad';
    cancelBtn.style.borderRadius = '3px';
    cancelBtn.style.background = '#e1e1e1';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.fontSize = '12px';
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    footer.appendChild(cancelBtn);

    const okBtn = document.createElement('button');
    okBtn.innerText = 'OK';
    okBtn.style.padding = '6px 20px';
    okBtn.style.border = '1px solid #0078d7';
    okBtn.style.borderRadius = '3px';
    okBtn.style.background = '#0078d7';
    okBtn.style.color = '#ffffff';
    okBtn.style.cursor = 'pointer';
    okBtn.style.fontSize = '12px';

    const handleSave = () => {
      const trimmed = input.value.trim();
      if (trimmed === '') {
        img.removeAttribute('alt');
      } else {
        img.setAttribute('alt', trimmed);
      }
      this.quill.update();
      message.success('Alt text updated!');
      document.body.removeChild(overlay);
    };

    okBtn.addEventListener('click', handleSave);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    });

    footer.appendChild(okBtn);
    document.body.appendChild(overlay);
  }

  openCropModal(img: HTMLImageElement) {
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '3000';

    // Create Modal container
    const container = document.createElement('div');
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '24px';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
    container.style.maxWidth = '90vw';
    container.style.maxHeight = '90vh';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '16px';
    overlay.appendChild(container);

    const title = document.createElement('h3');
    title.innerText = 'Crop Image';
    title.style.margin = '0';
    title.style.fontSize = '18px';
    title.style.fontWeight = '600';
    title.style.color = '#333';
    container.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.innerText = 'Drag a box over the image to select the crop area:';
    subtitle.style.margin = '0';
    subtitle.style.fontSize = '13px';
    subtitle.style.color = '#666';
    container.appendChild(subtitle);

    const canvasContainer = document.createElement('div');
    canvasContainer.style.position = 'relative';
    canvasContainer.style.overflow = 'auto';
    canvasContainer.style.maxHeight = '50vh';
    canvasContainer.style.border = '1px solid #d9d9d9';
    container.appendChild(canvasContainer);

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvasContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    const sourceImg = new window.Image();
    sourceImg.crossOrigin = 'anonymous';
    sourceImg.src = img.src;

    let isDrawing = false;
    let startX = 0;
    let startY = 0;
    let cropX = 0;
    let cropY = 0;
    let cropW = 0;
    let cropH = 0;

    sourceImg.onload = () => {
      const maxW = 600;
      const maxH = 400;
      let w = sourceImg.width;
      let h = sourceImg.height;

      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = w * ratio;
        h = h * ratio;
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(sourceImg, 0, 0, w, h);

      // Drag selection events
      canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        cropX = startX;
        cropY = startY;
        cropW = 0;
        cropH = 0;
      });

      canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;

        cropX = Math.min(startX, curX);
        cropY = Math.min(startY, curY);
        cropW = Math.abs(startX - curX);
        cropH = Math.abs(startY - curY);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.clearRect(cropX, cropY, cropW, cropH);
        ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, cropY);
        ctx.fillRect(0, cropY + cropH, canvas.width, canvas.height - (cropY + cropH));
        ctx.fillRect(0, cropY, cropX, cropH);
        ctx.fillRect(cropX + cropW, cropY, canvas.width - (cropX + cropW), cropH);

        ctx.strokeStyle = '#1890ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cropX, cropY, cropW, cropH);
      });

      canvas.addEventListener('mouseup', () => {
        isDrawing = false;
      });
    };

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'flex-end';
    btnContainer.style.gap = '8px';
    container.appendChild(btnContainer);

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.style.padding = '6px 16px';
    cancelBtn.style.border = '1px solid #d9d9d9';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.background = '#fff';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    btnContainer.appendChild(cancelBtn);

    const cropBtn = document.createElement('button');
    cropBtn.innerText = 'Apply Crop';
    cropBtn.style.padding = '6px 16px';
    cropBtn.style.border = 'none';
    cropBtn.style.borderRadius = '4px';
    cropBtn.style.background = '#1890ff';
    cropBtn.style.color = '#fff';
    cropBtn.style.cursor = 'pointer';
    cropBtn.addEventListener('click', () => {
      if (cropW === 0 || cropH === 0) {
        message.warning('Please select a crop area by dragging on the image.');
        return;
      }

      const targetCanvas = document.createElement('canvas');
      targetCanvas.width = cropW;
      targetCanvas.height = cropH;
      const targetCtx = targetCanvas.getContext('2d')!;

      const scaleX = sourceImg.width / canvas.width;
      const scaleY = sourceImg.height / canvas.height;

      targetCtx.drawImage(
        sourceImg,
        cropX * scaleX,
        cropY * scaleY,
        cropW * scaleX,
        cropH * scaleY,
        0,
        0,
        cropW,
        cropH
      );

      try {
        const croppedDataUrl = targetCanvas.toDataURL('image/png');
        img.src = croppedDataUrl;
        message.success('Image cropped successfully!');
      } catch (err) {
        console.error(err);
        message.error('Could not crop the image due to security restrictions (CORS).');
      }

      document.body.removeChild(overlay);
    });
    btnContainer.appendChild(cropBtn);

    document.body.appendChild(overlay);
  }

  hideOverlay() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    this.img = null;
  }

  hideContextMenu() {
    if (this.contextMenu && this.contextMenu.parentNode) {
      this.contextMenu.parentNode.removeChild(this.contextMenu);
    }
    this.contextMenu = null;
  }
}
Quill.register('modules/imageResize', ImageResize);

import { InternalLinkSuggestion } from './InternalLinkSuggestion';

const QuillEditor: React.FC<QuillEditorProps> = ({ forwardedRef, ...props }) => {
  const localRef = React.useRef<ReactQuill | null>(null);

  return (
    <>
      <ReactQuill
        ref={(el) => {
          localRef.current = el;
          if (forwardedRef) {
            if (typeof forwardedRef === 'function') {
              forwardedRef(el);
            } else {
              (forwardedRef as any).current = el;
            }
          }
        }}
        {...props}
      />
      <InternalLinkSuggestion editorRef={localRef} />
    </>
  );
};

export default QuillEditor;