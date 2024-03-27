const singletonTabUrlPrefixes = {
    vitest: "http://localhost:51204/__vitest__",
    vitestPreview: "http://localhost:5006/",
    astro: "http://localhost:4321/"
};


async function closeAllButOldestTab(urlPrefix) {
    const tabs = await chrome.tabs.query({})
    const matchingTabs = tabs.filter(tab => tab.url.startsWith(urlPrefix))
    if (matchingTabs.length === 0) return null

    // Order by age. We want to keep the oldest tab, because it is the one that
    // probably contains the url to the test that the user is interested in.
    matchingTabs.sort((tab1, tab2) => (tab1.id ?? 0) - (tab2.id ?? 0))
    const activeTabMatches = matchingTabs.some((tab) => tab.active)
    const oldestTab = matchingTabs[0]
    for (const tab of matchingTabs) {
        if (tab === oldestTab) continue
        await chrome.tabs.remove(tab.id)
    }

    if (activeTabMatches && !oldestTab.active) {
        await chrome.tabs.update(oldestTab.id, { active: true })
        await chrome.tabs.reload(oldestTab.id)
    }
    return { retainTabId: oldestTab.id }
}

async function closeDuplicateTabs() {
    let counter = 0
    for (const urlPrefix of Object.values(singletonTabUrlPrefixes)) {
        const result =  await closeAllButOldestTab(urlPrefix)
        if (result != null) {
            chrome.tabs.move(result.retainTabId, { index: counter++ })
        }
    }
}


function closeDuplicateTabsAndLogError() {
    closeDuplicateTabs().catch(error => console.error("Error managing vitest-ui tabs", error))
}

chrome.tabs.onCreated.addListener(async (tab) => {
    // The url of the new tab will only be visible after a small delay, so we wait some time
    // here before we process the tabs
    setTimeout(closeDuplicateTabsAndLogError, 1000);
});

setTimeout(closeDuplicateTabsAndLogError, 1000);
