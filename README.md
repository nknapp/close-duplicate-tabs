# "Close duplicate dabs"

POC browser extension that deduplicates certain duplicate tabs

In my projects I often run

* The project's dev-server (vite mostly)
* [vitest-ui](https://vitest.dev/guide/ui)
* [vitest-preview](https://www.vitest-preview.com/)

All of those tools can be configured to open a browser window.
On MacOS existing browser-tabs are reused, but on Linux, they always open new tabs, which is very annoying.

Every time a new tab is opened, this extension
 
* closes all but the oldest tab for each of `astro dev`, `vitest-ui` and `vitest-preview`
* reloads the tabs
* moves the browser tabs to the very left in the window, so that you don't have to search for them.

## Usage

* Clone this repository.
* Open you chrome "Extensions Page", activate the developer mode.
* Click "Load unpacked" and select the directory to which the repository was cloned.

## License

I usually use MIT for my projects, but since this is no library, I decided to use GPL.

see [LICENSE](./LICENSE)

