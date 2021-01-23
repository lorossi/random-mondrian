/*jshint esversion: 8 */
/*jshint strict: false */

let height;
$(document).ready(() => {
  width = $(window).width();
  canvas = $("#sketch")[0];

  size = calculate_size();
  $(canvas).attr("width", size);
  $(canvas).attr("height", size);

  if (canvas.getContext) {
    ctx = canvas.getContext("2d", {alpha: false});
    s = new Sketch(canvas, ctx, 1);
    s.run();
  }

  $(canvas).click(() => {
    $(".title").fadeOut("slow");
    s.reset();
  });

  $(window).resize(() => {
    if (width != $(window).width()) {
      width = $(window).width();
      let size = calculate_size();
      s.resize(size);
    }
  });

  $("#download").click(() => {
    s.download();
  });
});

const calculate_size = () => {
  let size = 1000;

  for (; size > Math.min($(window).height(), $(window).width()); size -= 50);
  return size;
};
