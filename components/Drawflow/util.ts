import type { APIProcessItemConnection, APIProcessItem } from '$baselib/api/processitem';

export type DrawflowNodeProxy = {
  id: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  outputs: string[];
};

export function sanitizeConnections(
  processIdx: Record<string, APIProcessItem>,
  connections: APIProcessItemConnection[],
): APIProcessItemConnection[] {
  return connections.filter(
    ({
      process_item_from_ID: fromID,
      process_item_from_name: fromName,
      process_item_to_ID: toID,
      process_item_to_name: toName,
    }) => {
      const output = processIdx[fromID]?.process_component.output.find(
        (e) => e.process_component_element_key === fromName,
      );
      const input = processIdx[toID]?.process_component.input.find((e) => e.process_component_element_key === toName);

      if (output && input) {
        return true;
      } else {
        if (!processIdx[fromID]) fromID = `?${fromID}?`;
        if (!output) fromName = `?${fromName}?`;
        if (!processIdx[toID]) toID = `?${toID}?`;
        if (!input) toName = `?${toName}?`;

        console.warn(`ignoring edge :${fromID}:${fromName} --> ${toName}:${toID}:`);
        return false;
      }
    },
  );
}

export function getProcessBoundTransform(process: Record<string, DrawflowNodeProxy>, cWidth: number, cHeight: number) {
  let top = Infinity;
  let left = Infinity;
  let bottom = -Infinity;
  let right = -Infinity;

  for (const id in process) {
    const node = process[id];

    left = Math.min(left, node.pos_x);
    top = Math.min(top, node.pos_y);
    right = Math.max(right, node.pos_x + node.width);
    bottom = Math.max(bottom, node.pos_y + node.height);
  }

  const width = right - left;
  const height = bottom - top;

  let scale: number, viewWidth: number, viewHeight: number;

  const rw = cWidth / width;
  const rh = cHeight / height;
  if (rw < rh) {
    scale = rw / 1.1;
    viewWidth = width * 1.1;
    viewHeight = (cHeight / rw) * 1.1;
  } else {
    scale = rh / 1.1;
    viewWidth = (cWidth / rh) * 1.1;
    viewHeight = height * 1.1;
  }

  return [(viewWidth - width) / 2 - left, (viewHeight - height) / 2 - top, scale];
}

export function renderProcess(
  ctx: CanvasRenderingContext2D,
  process: Record<string, DrawflowNodeProxy>,
  view?: { x: number; y: number; width: number; height: number },
  background?: string,
) {
  const cWidth = ctx.canvas.width;
  const cHeight = ctx.canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, cWidth, cHeight);
  } else {
    ctx.clearRect(0, 0, cWidth, cHeight);
  }

  const [translateX, translateY, scale] = getProcessBoundTransform(process, cWidth, cHeight);

  ctx.scale(scale, scale);
  ctx.translate(translateX, translateY);

  ctx.lineWidth = 1 / scale;

  for (const id in process) {
    const node = process[id];

    const outX = node.pos_x + node.width;
    const outY = node.pos_y + node.height / 2;

    for (const targetID of node.outputs) {
      const outEl = document.querySelector(`.node_in_node-${targetID}.node_out_node-${id} path`);
      if (!outEl) continue;
      const out = process[targetID];
      const inX = out.pos_x;
      const inY = out.pos_y + out.height / 2;

      ctx.strokeStyle = window.getComputedStyle(outEl, null).stroke;

      ctx.beginPath();
      ctx.moveTo(outX, outY);
      ctx.bezierCurveTo(outX + Math.abs(outX - inX) / 2, outY, inX - Math.abs(outX - inX) / 2, inY, inX, inY);
      ctx.stroke();
    }
  }

  for (const id in process) {
    if (!id) continue;

    const node = process[id];

    const nodeEl = document.querySelector(`#node-${id}`);
    const nodeStyle = window.getComputedStyle(nodeEl, null);
    const titleEl = document.querySelector(`#node-${id} .drawflow_content_node > *`);
    const titleStyle = window.getComputedStyle(titleEl, null);

    ctx.fillStyle = nodeStyle.getPropertyValue('background-color');
    ctx.shadowColor = nodeStyle.getPropertyValue('border-color');
    ctx.shadowBlur = 5 * scale;

    ctx.fillRect(node.pos_x, node.pos_y, node.width, node.height);

    ctx.fillStyle = titleStyle.getPropertyValue('background-color');
    ctx.shadowBlur = 0;

    ctx.fillRect(node.pos_x, node.pos_y, node.width, titleEl.clientHeight);
  }

  if (view) {
    ctx.strokeStyle = 'grey';
    ctx.strokeRect(view.x, view.y, view.width, view.height);
  }
}
