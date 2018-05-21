if ('serviceWorker' in navigator) {
    // console.log('serviceWorker in navigator');
    navigator.serviceWorker.register('./service-worker.js', {scope: './'})
        .then(function (registration) {

            console.log(registration);

            registration.oninstall = (event) => {
                debugger;
                event.waitUntil(
                    caches.open(CACHE_VERSION)
                        .then(function (cache) {
                            console.log('Opened cache');
                            return cache.addAll(CACHE_FILES);
                        })
                );
            };


            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                debugger;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // At this point, the old content will have been purged and
                            // the fresh content will have been added to the cache.
                            // It's the perfect time to display a "New content is
                            // available; please refresh." message in your web app.
                            console.log('New content is available; please refresh.');
                        } else {
                            // At this point, everything has been precached.
                            // It's the perfect time to display a
                            // "Content is cached for offline use." message.
                            console.log('Content is cached for offline use.');
                        }
                    }
                };
            }

        })
        .catch(function (e) {
            console.error(e);
        })
} else {
    console.log('Service Worker is not supported in this browser.')
}