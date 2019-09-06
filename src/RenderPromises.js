function makeDefaultQueryInfo() {
  return {
    seen: false,
    observable: null,
  };
}

export default class RenderPromises {
  // Map from Query component instances to pending fetchData promises.
  renderPromises = new Map();

  // Two-layered map from (query document, stringified variables) to QueryInfo
  // objects. These QueryInfo objects are intended to survive through the whole
  // getMarkupFromTree process, whereas specific Query instances do not survive
  // beyond a single call to renderToStaticMarkup.
  queryInfoTrie = new Map();

  // Registers the server side rendered observable.
  registerSSRObservable(instance, observable) {
    this.lookupQueryInfo(instance).observable = observable;
  }

  // Get's the cached observable that matches the SSR Query instances query and variables.
  getSSRObservable(instance) {
    return this.lookupQueryInfo(instance).observable;
  }

  addQueryPromise(instance, finish) {
    const info = this.lookupQueryInfo(instance);
    if (!info.seen) {
      this.renderPromises.set(
        instance,
        new Promise(resolve => {
          resolve(instance.fetchData());
        }),
      );
      // Render null to abandon this subtree for this rendering, so that we
      // can wait for the data to arrive.
      return null;
    }
    return finish();
  }

  hasPromises() {
    return this.renderPromises.size > 0;
  }

  consumeAndAwaitPromises() {
    const promises = [];

    this.renderPromises.forEach((promise, instance) => {
      // Make sure we never try to call fetchData for this query document and
      // these variables again. Since the instance objects change with
      // every rendering, deduplicating them by query and variables is the
      // best we can do. If a different Query component happens to have the
      // same query document and variables, it will be immediately rendered
      // by calling finish() in addQueryPromise, which could result in the
      // rendering of an unwanted loading state, but that's not nearly as bad
      // as getting stuck in an infinite rendering loop because we kept calling
      // instance.fetchData for the same Query component indefinitely.
      this.lookupQueryInfo(instance).seen = true;
      promises.push(promise);
    });
    this.renderPromises.clear();

    return Promise.all(promises);
  }

  lookupQueryInfo(instance) {
    const { queryInfoTrie } = this;
    const queryObject = instance.props

    const varMap = queryInfoTrie.get(JSON.stringify(queryObject)) || new Map();

    if (!queryInfoTrie.has(JSON.stringify(queryObject))) {
      queryInfoTrie.set(JSON.stringify(queryObject), varMap);
    }

    const variablesString = JSON.stringify(queryObject);
    const info = varMap.get(variablesString) || makeDefaultQueryInfo();

    if (!varMap.has(variablesString)) varMap.set(variablesString, info);

    return info;
  }
}
