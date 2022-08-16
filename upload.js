browser.contextMenus.create({
  title: "Upload image [POST]",
  contexts: ["image"],
  onclick: function(info, tab) {
    // get the image from cache:
    var download = new XMLHttpRequest();
    download.onload = function() {
      var filename = info.srcUrl.split(/[\\/]/).pop();

      // if filename has no extension, add .png to it
      // TODO: detect filetype and add the proper extension
      if(filename == filename.split('.')) {
        filename = filename + '.png';
      }

      var fd = new FormData();
      fd.append("files[]", download.response, filename);
      var upload = new XMLHttpRequest();
      upload.responseType = 'json';

      upload.onload = function() { 
        url = upload.response.files[0].url;
        browser.tabs.create({url: url});
      }

      // upload image
      upload.open('POST', 'https://uguu.se/upload.php');
      upload.send(fd);
    };
    // get uguu url
    download.responseType = 'blob';
    download.open('GET', info.srcUrl);
    download.send();
  }
});

