export function getInnerRadius(size) {
    const { width, height } = size;
    return Math.min(width, height) / 2;
  }

  export function checkElementIntersectPath(rect, pathElement, accuracy = 1) {
    const pathLength = pathElement.getTotalLength();
    const innerRectRadius = getInnerRadius(rect);
    const step = Math.max(pathLength / 100, innerRectRadius / accuracy);
    const pathRect = pathElement.getBBox();

    if (
      rect.x + rect.width < pathRect.x ||
      rect.x > pathRect.x + pathRect.width ||
      rect.y + rect.height < pathRect.y ||
      rect.y > pathRect.y + pathRect.height
    ) {
      return false;
    }

    for (let i = 0; i < pathLength; i += step) {
      const point = pathElement.getPointAtLength(i);
      if (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
      ) {
        return true;
      }
    }

    return false;
  }
