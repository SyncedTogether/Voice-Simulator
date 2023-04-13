function formatNumber(num) {
  if (num >= 1000) {
    let suffixes = ["", "k", "M", "B", "T"];
    let suffixIndex = 0;
    while (num >= 1000 && suffixIndex < suffixes.length - 1) {
      num /= 1000;
      suffixIndex++;
    }
    return num.toFixed(2) + suffixes[suffixIndex];
  } else {
    return num.toString();
  }
}

function randomNoise(x, y, z) {
  var value = Math.random();
  return value * 2 - 1;
}

function truncate(num, precision) {
  return Math.trunc(num * Math.pow(10, precision)) / Math.pow(10, precision);
}
