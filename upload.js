chrome.contextMenus.create({
  title: "Upload image [POST]",
  contexts: ["image"],
  onclick: async function (info) {
    const download = new XMLHttpRequest();
    download.onload = async function () {
      const extension = await detectFileExtension(download.response);
      const filename = makeid(5) + "." + extension;
      const fileHost =
        (await browser.storage.sync.get("fileHost")).fileHost || "filehole";

      const formData = new FormData();
      switch (fileHost) {
        case "uguu":
          formData.append("files[]", download.response, filename);
          await uploadToUguu(formData, filename);
          break;
        case "filehole":
          formData.append("file", download.response, filename);
          formData.append("url_len", "8");
          await uploadToFileHole(formData);
          break;
        case "0x0":
          formData.append("file", download.response, filename);
          await uploadTo0x0(formData);
          break;
        case "ircnet":
          formData.append("file", download.response, filename);
          await uploadToIrcNet(formData);
          break;
        default:
          break;
      }
    };

    download.responseType = "blob";
    download.open("GET", info.srcUrl);
    download.send();
  },
});

async function detectFileExtension(file) {
  const mimes = [
    {
      mime: "image/jpeg",
      extension: "jpg",
      pattern: [0xff, 0xd8, 0xff],
      mask: [0xff, 0xff, 0xff],
    },
    {
      mime: "image/png",
      extension: "png",
      pattern: [0x89, 0x50, 0x4e, 0x47],
      mask: [0xff, 0xff, 0xff, 0xff],
    },
    {
      mime: "image/webp",
      extension: "webp",
      pattern: [0x52, 0x49, 0x46, 0x46],
      mask: [0xff, 0xff, 0xff, 0xff],
    },
    {
      mime: "image/gif",
      extension: "gif",
      pattern: [0x47, 0x49, 0x46, 0x38],
      mask: [0xff, 0xff, 0xff, 0xff],
    },
    {
      mime: "image/svg+xml",
      extension: "svg",
      pattern: [0x3c, 0x3f, 0x78, 0x6d],
      mask: [0xff, 0xff, 0xff, 0xff],
    },
  ];

  function check(bytes, mime) {
    for (let i = 0, l = mime.mask.length; i < l; ++i) {
      if ((bytes[i] & mime.mask[i]) - mime.pattern[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  const blob = file.slice(0, 4);

  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onloadend = function (e) {
      if (e.target.readyState === FileReader.DONE) {
        const bytes = new Uint8Array(e.target.result);

        for (let i = 0, l = mimes.length; i < l; ++i) {
          if (check(bytes, mimes[i])) {
            // return the proper extension for the file
            resolve(mimes[i].extension);
            return;
          }
        }

        // return a default extension
        resolve("png");
      }
    };
    reader.readAsArrayBuffer(blob);
  });
}

async function uploadToUguu(formData, filename) {
  const upload = new XMLHttpRequest();
  upload.responseType = "json";
  upload.onload = async function () {
    await openNewTab(upload.response.files[0].url);
    await placeUrlInClipboard(upload.response.files[0].url);
  };

  // upload image
  upload.open("POST", "https://uguu.se/upload.php");
  upload.send(formData);
}

async function uploadToFileHole(formData) {
  const upload = new XMLHttpRequest();
  upload.responseType = "text";
  upload.onload = async function () {
    await openNewTab(upload.response);
    await placeUrlInClipboard(upload.response);
  };

  // upload image
  upload.open("POST", "https://filehole.org/");
  upload.send(formData);
}

async function uploadTo0x0(formData) {
  const upload = new XMLHttpRequest();
  upload.responseType = "text";
  upload.onload = async function () {
    await openNewTab(upload.response);
    await placeUrlInClipboard(upload.response);
  };

  // upload image
  upload.open("POST", "https://0x0.st/");
  upload.send(formData);
}

async function uploadToIrcNet(formData) {
  const upload = new XMLHttpRequest();
  upload.responseType = "text";
  upload.onload = async function () {
    await openNewTab(upload.response);
    await placeUrlInClipboard(upload.response);
  };

  // upload image
  upload.open("POST", "https://upload.internetrelaychat.net/upload");
  upload.send(formData);
}

async function openNewTab(url) {
  const newTab = (await browser.storage.sync.get("newTab")).newTab;

  if (newTab) {
    chrome.tabs.create({ url });
    return;
  }
}

async function placeUrlInClipboard(url) {

  // trim newline from url
  url = url.replace(/\n/g, "");

  // check if clipboardPlace is set to true
  const clipboardPlace = (await browser.storage.sync.get("clipboardPlace"))
    .clipboardPlace;
  if (clipboardPlace) {
    navigator.clipboard.writeText(url);
    chrome.notifications.create({
      type: "basic",
      title: "POST Image",
      message: "Copied image URL to clipboard",
    });
  }
}

function makeid(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// set default settings for first-time install
browser.runtime.onInstalled.addListener(handleInstalled);

function handleInstalled(details) {
  if (details.reason === "install") {
    browser.storage.sync.set({
      fileHost: "filehole",
      newTab: true,
      clipboardPlace: false,
    });
  }
}
