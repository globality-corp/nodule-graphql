import throat from 'throat';

export default function concurrentPaginate(promises, concurrencyLimit = 1) {
    const throatWithPromise = throat(Promise);
    const funneledThroat = throatWithPromise(concurrencyLimit);
    return Promise.all(
        promises.map(promise => funneledThroat(() => promise)),
    );
}
