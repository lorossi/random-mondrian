/*jshint esversion: 8 */
/*jshint strict: false */

$(document).ready(() => {
  const canvas = $("#sketch")[0];

  if (canvas.getContext) {
    ctx = canvas.getContext("2d", { alpha: false });
    s = new Sketch(canvas, ctx, 1);
    s.run();
  }

  $(canvas).click(() => {
    $(".instructions").fadeOut("slow");
    s.reset();
  });

  $("#download").click(() => {
    s.download();
  });
});
