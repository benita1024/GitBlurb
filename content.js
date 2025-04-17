chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractRepo") {
      const repoName = document.querySelector("strong.mr-2.flex-self-stretch a")?.innerText || "";
      const description = document.querySelector("p.f4")?.innerText || "";
      const topics = Array.from(document.querySelectorAll('a.topic-tag')).map(e => e.innerText).join(', ');
      const readme = document.querySelector("#readme")?.innerText || "";
  
      sendResponse({
        name: repoName,
        description,
        topics,
        readme
      });
    }
    return true;
  });
  