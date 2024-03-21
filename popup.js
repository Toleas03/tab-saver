const allTabs = await chrome.tabs.query({});
var tabs = allTabs;
var keyword = '';

function tabExists(tabId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, (result) => {
            resolve(result.hasOwnProperty(tabId.toString()));
        });
    });
}

function removeTab(tabId) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.remove(tabId.toString(), () => {
            resolve();
        });
    });
}

async function loadCurrentTabs() {
    const template = document.getElementById('tab-template');
    const elements = new Set();
    for (const tab of tabs) {
        const element = template.content.firstElementChild.cloneNode(true);

        const title = tab.title.split('-')[0].trim();
        const pathname = tab.url;

        var titleEl = element.querySelector('.tab-title');
        var url = element.querySelector('.tab-url');
        var save = element.querySelector('.tab-save')

        titleEl.textContent = title;
        url.textContent = pathname;

        url.addEventListener('click', () => {
            chrome.tabs.create({ url: tab.url });
        });

        const saved = await tabExists(tab.id);

        if (saved) {
            save.innerHTML = 'Saved';
            save.classList.add('saved');
        }
        else {
            save.innerHTML = 'Save';
            save.classList.remove('saved');
        }

        save.addEventListener('click', () => {
            if (saved) {
                return;
            }
            else {
                const tabData = {
                    title: title,
                    url: tab.url
                };

                chrome.storage.local.set({ [tab.id]: tabData }, () => {
                    console.log('Tab saved');
                });
            }
            loadCurrentTabs();
        });
        elements.add(element);
    }
    var tabcontents = document.getElementById('tab-content')
    tabcontents.innerHTML = '';
    tabcontents.append(...elements);
}

async function loadSavedTabs() {
    // Call function for button 2
    document.getElementById('tab-content').innerHTML = '';
    chrome.storage.local.get(null, (items) => {
        const elements = new Set();
        const template = document.getElementById('tab-template');
        for (const [key, tab] of Object.entries(items)) {

            if (!tab.title.toLowerCase().includes(keyword) && !tab.url.toLowerCase().includes(keyword)) {
                continue;
            }
            
            const element = template.content.firstElementChild.cloneNode(true);

            const title = tab.title.split('-')[0].trim();
            const pathname = tab.url

            var titleEl = element.querySelector('.tab-title')
            var url = element.querySelector('.tab-url')
            var save = element.querySelector('.tab-save')

            titleEl.textContent = title;
            url.textContent = pathname;
            url.addEventListener('click', () => {
                chrome.tabs.create({ url: tab.url });
            });
            elements.add(element);

            save.innerHTML = 'Remove';
            save.addEventListener('click', () => {
                removeTab(key);
                loadSavedTabs();
            });
        }
        var tabcontents = document.getElementById('tab-content')
        tabcontents.innerHTML = '';
        tabcontents.append(...elements);
    });
}

const buttons = document.querySelectorAll('.tab-btn');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        if (button.id === 'currentTabBtn') {
            // Call function for button 1
            loadCurrentTabs();
        } else if (button.id === 'savedTabBtn') {
            loadSavedTabs();
        }
        // Add more else if statements for additional buttons

    });
});

const searchInput = document.querySelector('.search-input');

searchInput.addEventListener('keyup', async () => {
    const searchValue = searchInput.value.toLowerCase();

    const filteredTabs = allTabs.filter(tab =>
        tab.title.toLowerCase().includes(searchValue) ||
        tab.url.toLowerCase().includes(searchValue)
    );

    tabs = filteredTabs;
    keyword = searchValue;

    // Check which button is currently active
    const currentTabBtn = document.getElementById('currentTabBtn');
    const savedTabBtn = document.getElementById('savedTabBtn');

    if (currentTabBtn.classList.contains('active')) {
        loadCurrentTabs();
    } else if (savedTabBtn.classList.contains('active')) {
        loadSavedTabs();
    }
});

loadCurrentTabs();