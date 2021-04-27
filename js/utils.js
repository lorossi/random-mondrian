/* jshint esversion: 6 */

const get_xy_from_index = (index, width) => {
  return {
    "x": index % width,
    "y": Math.round(index / width)
  };
};

const get_index_from_xy = (x, y, width) => {
  return x + width * y;
};

const get_css_property = (property) => {
  let css_property = getComputedStyle(document.documentElement).getPropertyValue(property);
  css_property = css_property.split(" ").join("");

  if (css_property === "true") {
    return true;
  } else if (css_property === "false") {
    return false;
  }

  if (parseInt(css_property) == css_property) {
    // property is int
    return parseInt(css_property);
  } else if (parseFloat(css_property) == css_property) {
    // property is float
    return parseFloat(css_property);
  }

  return css_property;
};

const set_css_property = (property, value) => {
  document.documentElement.style.setProperty(property, value);
};

const random = (min, max, int) => {
    if (max == null && min != null) {
      max = min;
      min = 0;
    } else if (min == null && max == null) {
      min = 0;
      max = 1;
    }

   let random_num = Math.random() * (max - min) + min;

   // return an integer value
   if (int) {
     return Math.round(random_num);
   }

   return random_num;
};

const get_mouse_pos = (element, e, dx, dy) => {
  dx = dx || 0;
  dy = dy || 0;
  let rect = element.getBoundingClientRect();
  return {
    x: e.clientX - rect.left - dx,
    y: e.clientY - rect.top - dy
  };
};

const get_touch_pos = (element, e, dx, dy) => {
  dx = dx || 0;
  dy = dy || 0;
  let rect = element.getBoundingClientRect();
  return {
    x: e.targetTouches[0].clientX - rect.left - dx,
    y: e.targetTouches[0].clientY - rect.top - dy
  };
};

const constrain = (val, min, max) => {
  if (val < min) {
    val = min;
  } else if (val > max) {
    val = max;
  }

  return val;
};

const wrap = (val, min, max) => {
  let interval = max - min;
  while (val < min) val += interval;
  while (val > max) val -= interval;
  return val;
};

const map = (val, old_min, old_max, new_min, new_max) => {
  return (val - old_min) * (new_max - new_min) / (old_max - old_min) + new_min;
};

const shuffle_array = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

const partial_sum = (array, end) => {
  sum = 0;
  for (let i = 0; i < Math.min(end, array.length - 1); i++) {
    sum += array[i];
  }
  return sum;
};

const random_pick = (array) => {
  let index = random(0, array.length - 1, true);
  return array[index];
};

const get_base_log = (x, y) => {
  return Math.log(y) / Math.log(x);
};
