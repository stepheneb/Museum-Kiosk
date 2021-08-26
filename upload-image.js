/*jshint esversion: 8 */

let ctx = null;

function initializeCanvas(c) {
  ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgb(200, 0, 0)';
  ctx.fillRect(10, 10, 50, 50);
  ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
  ctx.fillRect(30, 30, 50, 50);
}

let UUID;

UUID = (function () {
  var i, lut, self;
  self = {};
  lut = [];
  i = 0;
  while (i < 256) {
    lut[i] = (i < 16 ? '0' : '') + i.toString(16);
    i++;
  }
  self.generate = function () {
    var d0, d1, d2, d3;
    d0 = Math.random() * 0xffffffff | 0;
    d1 = Math.random() * 0xffffffff | 0;
    d2 = Math.random() * 0xffffffff | 0;
    d3 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
  };
  return self;
})();

let canvas = document.getElementById('canvas');
initializeCanvas(canvas);

let jpgDataUrl = canvas.toDataURL("image/jpeg", 0.9);
let jpgBlob = null;

canvas.toBlob((blob) => {
  jpgBlob = blob;
}, "image/jpeg", 0.9);

let generateJpgName = () => {
  let uuid = UUID.generate();
  return `sample-jpg-${uuid}.jpg`;
};

let displayTextResult = (text) => {
  let results = document.getElementById('results');
  let html = `
    <code>${text}</code>
  `;
  results.innerHTML = html;
};

let displayJsonResult = (json) => {
  let results = document.getElementById('results');
  let jsonStr = JSON.stringify(json);
  let html = `
    <code>${jsonStr}</code>
  `;
  results.innerHTML = html;
};

let displayErrorResult = (error) => {
  let results = document.getElementById('results');
  let html = `
    <code>Error: ${error}</code>
  `;
  results.innerHTML = html;
};

let formNoCors = document.getElementById('form-no-cors');
let formCors = document.getElementById('form-cors');

let postUrl = 'https://waps.cfa.harvard.edu/microobservatory/own_kiosk/uploads/upload_3.php';

createFormData = () => {
  let email = document.getElementById('email');
  let imageFilename = generateJpgName();
  let formData = new FormData();
  formData.append("email", email.value);
  formData.append("data", jpgBlob, imageFilename);
  return formData;
};

formNoCors.onsubmit = async (e) => {
  e.preventDefault();
  let formData = createFormData();
  fetch(postUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    })
    .then(response => response.text())
    .then((data) => {
      return data ? JSON.parse(data) : {};
    })
    .then(json => {
      displayJsonResult(json);
    })
    .catch(error => {
      displayErrorResult(error);
    });
};

formCors.onsubmit = async (e) => {
  e.preventDefault();
  let formData = createFormData();

  fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: formData
    })
    .then(response => response.json())
    .then(json => displayJsonResult(json))
    .catch(error => {
      displayErrorResult(error);
    });
};
