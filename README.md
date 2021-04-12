# next-utils

[![npm](https://img.shields.io/npm/v/next-utils?style=flat-square)](https://www.pkgstats.com/pkg:next-utils)
[![NPM](https://img.shields.io/npm/l/next-utils?style=flat-square)](LICENSE)
[![npm](https://img.shields.io/npm/dt/next-utils?style=flat-square)](https://www.pkgstats.com/pkg:next-utils)

Handy utilities for building React components that render as nice server-side
as they do on the client.

## Install

Via [npm](https://npmjs.com/package/next-utils)

```sh
npm install --save next-utils
```

Via [Yarn](https://yarn.fyi/next-utils)

```sh
yarn add next-utils
```

## How to use

After building a few packages that all handled server-side requests, two common
functions and classes emerged that were almost identical for them all,
`getDataFromTree` and `RenderPromises`.

For examples of how these can be used, please reference the [repos that are
using these](#used-by)

### `getDataFromTree`

Used to render a React tree server side and expose the `renderPromises` method
via a Provider to allow for children to register themselves and resolve all
requests initiated by child components.

### `RenderPromises`

Manages and resolves query instances that have registered themselves. Relies on
all registered instances to have a public `fetchData` method exposed that is
responsible registering with the context provided `renderPromises` example.

```js
import React, { Component } from 'react';

class RequestComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      error: null,
      loading: false,
      fetched: false,
    };
  }

  ...

  async fetchData() {
    return new Promise((resolve, reject) => {
      const {
        context,
        url,
        options,
        skip,
      } = this.props;

      try {
        if (skip) {
          return resolve(null);
        }

        const cacheKey = JSON.stringify(this.props);

        if (context.cache && context.cache.has(cacheKey)) {
          return resolve(context.cache.read(cacheKey));
        }

        const request = fetch(url, options);

        if (context.cache && !context.renderPromises) {
          context.cache.write(cacheKey, request);
        }

        const response = await request;

        if (context.renderPromises) {
          context.renderPromises.registerSSRObservable(this, response);
        }

        return resolve(response);
      }
      catch (error) {
        return rejectt(error);
      }
    });
  }

  ...

  getQueryResult() {
    return this.state;
  }

  render() {
    const {
      children,
      context,
    } = this.props;

    const finish = () => children(this.getQueryResult());

    if (context && context.renderPromises) {
      return context.renderPromises.addQueryPromise(this, finish);
    }

    return finish();
  }
}
```

## Other Handy Utils

Because I got tired of repeating myself with these across multiple projects.

* `isClient` - Basically just, `typeof window !== 'undefined'`
* `isServer` - And, the inverse, `typeof window === 'undefined'`

```js
import { useEffect } from 'react'
import { isServer } from 'next-utils'

useEffect(() => {
  if (isServer()) return

  ...do client-side only stuff...
})
```

## Used by

* [`next-contentful`](https://github.com/ryanhefner/next-contentful)
* [`next-request-block`](https://github.com/ryanhefner/next-request-block)
* [`next-prismic`](https://github.com/ryanhefner/next-prismic)

## License

[MIT](LICENSE) © [Ryan Hefner](https://www.ryanhefner.com)
