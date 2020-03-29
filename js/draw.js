/*
 * Draws circles of radius r centered around
 * each point in the given array of (x,y) tuples
 * in the provided context.
 */
function drawPoints(ctx, points, r) {
  for (let i = 0; i < points.length; i += 1) {
    const x = points[i][0];
    const y = points[i][1];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
}

/*
 * Starts at the first point, and continually
 * draws lines in the provided context to the
 * next point until the final point is reached.
 */
function drawPath(ctx, points) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }
  ctx.stroke(region);
}

/*
 * Given a canvas containing a 2d context,
 * extracts a frame from the video, and superimposes
 * the hand and face key points contained in combinedFeatures.
 * Returns the extracted combined keypoints.
 */
function frame(canvas, video, combinedFeatures) {
  if (combinedFeatures === undefined) {
    throw Error('Cannot draw frame with undefined features');
  }

  const faceMeshes = combinedFeatures[0];
  const handPoses = combinedFeatures[1];
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
  let facePoints;
  if (faceMeshes !== undefined && faceMeshes.length > 0) {
    facePoints = faceMeshes[0].scaledMesh;
    drawPoints(ctx, facePoints, 1);
  }

  // Render HandPose
  let handPoints;
  if (handPoses !== undefined && handPoses.length > 0) {
    handPoints = handPoses[0].landmarks;
    const handAnnotations = handPoses[0].annotations;
    drawPoints(ctx, handPoints, 3);
    Object.entries(handAnnotations).forEach(([_, points]) =>
      drawPath(ctx, points)
    );
  }

  return [facePoints, handPoints];
}

export default frame;
