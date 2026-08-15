function handler(event) {
    var request = event.request;
    var pathname = request.uri;
    var locales = ['en', 'es'];
    var isNextInternal = pathname.indexOf('__next') !== -1;
    var hasExtension = /\.[a-zA-Z0-9]+$/.test(pathname);
    if (hasExtension && !isNextInternal) {
        return request;
    }
    var isLocalized = locales.some(function (candidateLocale) {
        return pathname === '/' + candidateLocale || pathname.indexOf('/' + candidateLocale + '/') === 0;
    });
    if (isLocalized && !isNextInternal) {
        var strippedPathname = pathname.replace(/^\/(en|es)/, '');
        return {
            statusCode: 302,
            statusDescription: 'Found',
            headers: {
                location: { value: strippedPathname || '/' }
            }
        };
    }
    var cookies = request.cookies;
    var localeCookieValue = cookies.locale ? cookies.locale.value : undefined;
    var locale;
    if (locales.indexOf(localeCookieValue) !== -1) {
        locale = localeCookieValue;
    } else {
        var acceptLanguageHeader = request.headers['accept-language'] ? request.headers['accept-language'].value : '';
        var preferredLanguage = acceptLanguageHeader.split(',')[0].split('-')[0].toLowerCase();
        locale = locales.indexOf(preferredLanguage) !== -1 ? preferredLanguage : 'en';
    }
    var localizedPathname = isLocalized ? pathname : '/' + locale + pathname;
    if (isNextInternal) {
        request.uri = localizedPathname;
        return request;
    }
    if (localizedPathname.charAt(localizedPathname.length - 1) !== '/') {
        localizedPathname += '/';
    }
    request.uri = localizedPathname + 'index.html';
    return request;
}