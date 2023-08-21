export type Rect = { id: string; pos_x: number; pos_y: number; width: number; height: number };

export function getBounds(nodes: Rect[]): DOMRect {
  const nodeBox = {
    top: Infinity,
    left: Infinity,
    bottom: -Infinity,
    right: -Infinity,
  };

  for (const node of nodes) {
    nodeBox.top = Math.min(nodeBox.top, node.pos_y);
    nodeBox.left = Math.min(nodeBox.left, node.pos_x);
    nodeBox.bottom = Math.max(nodeBox.bottom, node.pos_y + node.height);
    nodeBox.right = Math.max(nodeBox.right, node.pos_x + node.width);
  }

  return DOMRect.fromRect({
    x: nodeBox.left,
    y: nodeBox.top,
    width: nodeBox.right - nodeBox.left,
    height: nodeBox.bottom - nodeBox.top,
  });
}

export function showNodes(viewBox: DOMRect, canvasBox?: DOMRect, { left = 0, top = 0, right = 0, bottom = 0 } = {}) {
  viewBox.x += left;
  viewBox.y += top;
  viewBox.width -= left + right;
  viewBox.height -= top + bottom;

  const centerX = canvasBox.x + canvasBox.width / 2 - left - viewBox.width / 2;
  const centerY = canvasBox.y + canvasBox.height / 2 - top - viewBox.height / 2;

  const padding = 0.9;

  const zoomX = (viewBox.width / canvasBox.width) * padding;
  const zoomY = (viewBox.height / canvasBox.height) * padding;
  const zoom = Math.min(zoomX, zoomY);

  return { pan_x: -centerX, pan_y: -centerY, zoom };
}
