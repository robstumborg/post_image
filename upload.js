browser.contextMenus.create({
  title: "Upload image [POST]",
  contexts: ["image"],
  onclick: function(info, tab) {
    var download = new XMLHttpRequest();
    download.onload = function() {
      var og_filename = info.srcUrl.split(/[\\/]/).pop(); // maybe we'll use this later

      formatDetect(download.response, function(extension) {
        filename = makeid(5) + '.' + extension;
      });

      var fd = new FormData();
      fd.append("file", download.response, filename);
      var upload = new XMLHttpRequest();
      upload.responseType = 'text';

      upload.onload = function() {
        url = upload.response
        browser.tabs.create({url: url});
      }

      // upload image
      upload.open('POST', 'http://0x0.st');
      upload.send(fd);

    };

    download.responseType = 'blob';
    download.open('GET', info.srcUrl);
    download.send();
  }
});

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function formatDetect(file, callback) {
  // https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern
  var mimes = [
    {
      mime: 'image/jpeg',
      extension: 'jpg',
      pattern: [0xFF, 0xD8, 0xFF],
      mask: [0xFF, 0xFF, 0xFF]
    },
    {
      mime: 'image/png',
      extension: 'png',
      pattern: [0x89, 0x50, 0x4E, 0x47],
      mask: [0xFF, 0xFF, 0xFF, 0xFF]
    },
    {
      mime: 'image/webp',
      extension: 'webp',
      pattern: [0x52, 0x49, 0x46, 0x46],
      mask: [0xFF, 0xFF, 0xFF, 0xFF]
    },
    {
      mime: 'image/gif',
      extension: 'gif',
      pattern: [0x47, 0x49, 0x46, 0x38],
      mask: [0xFF, 0xFF, 0xFF, 0xFF]
    },
    {
      mime: 'image/svg+xml',
      extension: 'svg',
      pattern: [0x3c, 0x3f, 0x78, 0x6d],
      mask: [0xFF, 0xFF, 0xFF, 0xFF]
    }
  ];

  function check(bytes, mime) {
    for(var i = 0, l = mime.mask.length; i < l; ++i) {
      if((bytes[i] & mime.mask[i]) - mime.pattern[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  var blob = file.slice(0, 4);

  var reader = new FileReader();
  reader.onloadend = function(e) {
    if(e.target.readyState === FileReader.DONE) {
      var bytes = new Uint8Array(e.target.result);

      for(var i = 0, l = mimes.length; i < l; ++i) {
        if(check(bytes, mimes[i])) {
          // return the proper extension for the file
          return callback(mimes[i].extension)
        }
      }

      // return a default extension
      return callback('png');
    }
  };
  reader.readAsArrayBuffer(blob);
}

