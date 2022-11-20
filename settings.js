function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    fileHost: document.querySelector("#fileHost").value
  });
}

function restoreOptions() {
  function setCurrentChoice(result) {
    document.querySelector("#fileHost").value = result.fileHost || "filehole";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  let getting = browser.storage.sync.get("fileHost");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
