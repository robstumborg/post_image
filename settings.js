// get saved settings and display them
browser.storage.sync.get("fileHost").then((settings) => {
  document.getElementById("fileHost").value = settings.fileHost;
});

browser.storage.sync.get("newTab").then((settings) => {
  document.getElementById("newTab").checked = settings.newTab;
});

browser.storage.sync.get("clipboardPlace").then((settings) => {
  document.getElementById("clipboardPlace").checked = settings.clipboardPlace;
});

// save settings upon form submit
document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  browser.storage.sync.set({
    newTab: document.getElementById("newTab").checked,
    clipboardPlace: document.getElementById("clipboardPlace").checked,
    fileHost: document.getElementById("fileHost").value,
  });
});
