// TODO Is this a good parallelizable function? Is canvas usable in Web workers? If so -> WebWorker
/*
 * Draws circles of radius r centered around
 * each point in the given array of (x,y) tuples
 * in the provided context.
 */
const drawPoints = (ctx, points, r) => {
  if (points === undefined) return;

  for (let i = 0; i < points.length; i++) {
    const x = points[i][0];
    const y = points[i][1];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
};

// TODO Is this a good parallelizable function? Is canvas usable in Web workers? If so -> WebWorker
/*
 * Starts at the first point, and continually
 * draws lines in the provided context to the
 * next point until the final point is reached.
 */
const drawPath = (ctx, points) => {
  if (points === undefined) return;

  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }
  ctx.stroke(region);
};

/*
 * Given a canvas containing a 2d context,
 * extracts a frame from the video, and superimposes
 * the hand and face key points contained in combinedFeatures.
 * Returns the extracted combined keypoints.
 */
const drawFrame = (canvas, video, facePoints, handPoints, handAnnotations) => {
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    video,
    0,
    0,
    video.width,
    video.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Render FaceMesh
  if (facePoints) {
    drawPoints(ctx, facePoints, 1);
  }
  // Render HandPose
  // let handPoints = null;
  if (handPoints) {
    drawPoints(ctx, handPoints, 3);
  }
  if (handAnnotations) {
    Object.entries(handAnnotations).forEach(([, points]) =>
      drawPath(ctx, points)
    );
  }
};

export default drawFrame;
