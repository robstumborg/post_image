// get saved settings and display them
browser.storage.sync.get("fileHost").then((settings) => {
  document.getElementById("fileHost").value = settings.fileHost || "filehole";
});

// save settings upon form submit
document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const newFileHost = document.getElementById("fileHost").value;
  browser.storage.sync
    .set({ fileHost: newFileHost })
    .then(() => {
      console.log(`saved new file host: ${newFileHost}`);
    })
    .catch((error) => {
      console.error(`error saving file host: ${error}`);
    });
});
