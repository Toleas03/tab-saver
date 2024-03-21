const tabs = await chrome.tabs.query({});

function loadCurrentTabs() {
    const template = document.getElementById('tab-template');
    const elements = new Set();
    for (const tab of tabs) {
        const element = template.content.firstElementChild.cloneNode(true);

        const title = tab.title.split('-')[0].trim();
        const pathname = new URL(tab.url)

        var titleEl = element.querySelector('.tab-title')
        var url = element.querySelector('.tab-url')
        titleEl.textContent = title;
        url.textContent = pathname;
        url.addEventListener('click', () => {
            chrome.tabs.create({ url: tab.url });
        });

        elements.add(element);
    }
    var tabcontents = document.getElementById('tab-content')
    tabcontents.innerHTML = '';
    tabcontents.append(...elements);
}

loadCurrentTabs();

const buttons = document.querySelectorAll('.tab-btn');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        if (button.id === 'currentTabBtn') {
            // Call function for button 1
            loadCurrentTabs();
        } else if (button.id === 'savedTabBtn') {
            // Call function for button 2
            document.getElementById('tab-content').innerHTML = '';
        }
        // Add more else if statements for additional buttons

    });
});