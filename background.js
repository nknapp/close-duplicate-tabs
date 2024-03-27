const singletonTabUrlPrefixes = {
    vitest: "http://localhost:51204/__vitest__",
    vitestPreview: "http://localhost:5006/",
    astro: "http://localhost:4321/"
};


// This function checks for Vitest UI tabs and closes extras
async function manageTabsOfUrlPrefix(urlPrefix) {
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

async function manageSingletonTabs() {
    let counter = 0
    for (const urlPrefix of Object.values(singletonTabUrlPrefixes)) {
        const result =  await manageTabsOfUrlPrefix(urlPrefix)
        if (result != null) {
            chrome.tabs.move(result.retainTabId, { index: counter++ })
        }
    }
}


chrome.tabs.onCreated.addListener(async (tab) => {
    // Add a small delay to allow potential processing of the new tab
    setTimeout(() => {
        manageSingletonTabs().catch(error => console.error("Error managing vitest-ui tabs", error))
    }, 1000); // Adjust delay as needed (in milliseconds)
});

setTimeout(() => {
    manageSingletonTabs().catch(error => console.error("Error managing vitest-ui tabs", error))
}, 1000)